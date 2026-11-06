import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getScheduledLongformTheme, BANNED_KEYWORDS } from '../../topicScheduler.js';
import {
  buildLongformStoryPrompt,
  cleanAndParseJson,
  extractAntiRepetitionContext,
  validateNarrativeQuality,
  fromLegacyLongformScript,
} from '../../src/core/index.ts';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Autonomous image asset downloader
async function downloadAsset(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`✅ Asset generated & saved: ${destPath}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Asset download notice (${url}):`, err.message);
    return false;
  }
}

async function ensureAttachmentImage(slug, imagePrompt) {
  if (!slug || !imagePrompt) return null;
  const clean = slug.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const destDir = path.join(process.cwd(), 'public', 'attachments');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, `${clean}.jpg`);

  if (fs.existsSync(destPath)) {
    return `attachments/${clean}.jpg`;
  }

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=800&height=500&nologo=true`;
  console.log(`🖼️ Generating in-chat attachment for "${clean}"...`);
  const success = await downloadAsset(url, destPath);
  return success ? `attachments/${clean}.jpg` : null;
}

export async function generateWithFallback(prompt) {
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      console.log(`🤖 Requesting long-form script from Gemini (${modelName})...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.85,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = cleanAndParseJson(text);
      console.log(`✅ Long-form generation succeeded with ${modelName}!`);
      return data;
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} encountered error: ${err.message || err}. Falling back to next model...`);
      lastError = err;
    }
  }
  throw lastError || new Error('All candidate Gemini models failed.');
}

export async function generateLongformScript() {
  const historyPath = path.join(process.cwd(), 'longform', 'data', 'history_longform.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch {
      history = [];
    }
  }

  const assignedTheme = getScheduledLongformTheme(history.length);
  console.log(`\n🎬 ASSIGNED LONG-FORM THEME: "${assignedTheme.topic}"`);

  // Extract rich anti-repetition context
  const antiRepetition = extractAntiRepetitionContext(history);

  // Build dynamic multi-scene narrative prompt
  const prompt = buildLongformStoryPrompt({
    theme: assignedTheme,
    antiRepetition,
    bannedKeywords: BANNED_KEYWORDS,
  });

  try {
    const data = await generateWithFallback(prompt);

    // Verify multi-scene structure: default to at least 1 scene if omitted
    if (!data.scenes || !Array.isArray(data.scenes) || data.scenes.length === 0) {
      throw new Error('LLM generated invalid response without scenes array.');
    }

    console.log(`🎬 Generated Title: ${data.title}`);
    console.log(`🎭 Total Scenes Planned: ${data.scenes.length}`);
    if (data.storyOutline) {
      console.log(`📖 Central Conflict: ${data.storyOutline.conflict}`);
      console.log(`⚡ Climax: ${data.storyOutline.climax}`);
      console.log(`🎯 Payoff: ${data.storyOutline.payoff}`);
    }

    // Ensure sequential message IDs and default explicit audio cues across scenes
    let globalMsgId = 1;
    for (const scene of data.scenes) {
      if (!scene.messages || !Array.isArray(scene.messages)) {
        scene.messages = [];
      }
      for (const msg of scene.messages) {
        msg.id = globalMsgId++;

        // Ensure explicit audio cues are present
        if (!msg.audioCues || msg.audioCues.length === 0) {
          const cues = [{ id: `sfx-notify-${msg.id}`, type: 'notification' }];
          if (msg.attachmentUrl) {
            cues.push({ id: `sfx-hit-${msg.id}`, type: 'horror_hit', volume: 0.7 });
          }
          if (msg.voiceEvent === 'call_ringing') {
            cues.push({ id: `sfx-ring-${msg.id}`, type: 'discord_ring', volume: 0.7 });
          }
          msg.audioCues = cues;
        }
      }
    }

    // Handle multiple attachment images across scenes
    const attachments = data.attachments || (data.attachment ? [data.attachment] : []);
    for (const att of attachments) {
      if (att && att.imagePrompt) {
        const attUrl = await ensureAttachmentImage(
          att.slug || `longform_att_${Date.now()}`,
          att.imagePrompt
        );
        const targetSceneIdx = att.sceneIndex !== undefined && data.scenes[att.sceneIndex] ? att.sceneIndex : 0;
        const targetScene = data.scenes[targetSceneIdx];
        if (attUrl && targetScene && targetScene.messages && targetScene.messages[att.messageIndex]) {
          targetScene.messages[att.messageIndex].attachmentUrl = attUrl;
          console.log(`📎 Attached in-chat image to Scene ${targetSceneIdx + 1} message index ${att.messageIndex}: ${attUrl}`);
        }
      }
    }

    // Generate standard MrBeast-style YouTube thumbnail
    try {
      const thumbPrompt = data.mrbeastThumbnailPrompt || `A viral high-CTR YouTube thumbnail in 16:9 widescreen format for "${data.title}". On the right, an energetic content creator with an exaggerated shocked open-mouth expression, pointing enthusiastically towards the center. In the center, a dramatic visual spectacle with glowing royal crowns, prize chests and bold neon $1,000,000 text. In the bottom corner, the iconic polite smiling white cat Beluga looking on in disbelief. Hyper-saturated electric cyan and fiery orange lighting, ultra-sharp contrast.`;
      const outDir = path.join(process.cwd(), 'out');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const thumbPath = path.join(outDir, `thumbnail_mrbeast_${Date.now()}.jpg`);
      const thumbUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(thumbPrompt)}?width=1280&height=720&nologo=true`;
      console.log('🖼️ Generating standard MrBeast-style thumbnail for future longform...');
      const success = await downloadAsset(thumbUrl, thumbPath);
      if (success) {
        data.customThumbnailPath = thumbPath;
        console.log(`✅ Standard MrBeast thumbnail generated: ${thumbPath}`);
      }
    } catch (thErr) {
      console.warn('⚠️ MrBeast thumbnail generation notice:', thErr.message);
    }

    // Validate narrative quality using Core Validation framework
    const canonicalScript = fromLegacyLongformScript(data);
    const qualityResult = validateNarrativeQuality(canonicalScript, {
      minMessages: 50,
      maxMessages: 95,
    });

    if (!qualityResult.isValid) {
      console.warn(`⚠️ Narrative Quality Notice (${qualityResult.errors.length} checks):`, qualityResult.errors.join('; '));
    } else {
      console.log(`⏱️ Estimated Long-form Duration: ${qualityResult.durationSeconds?.toFixed(1)}s across ${data.scenes.length} scenes`);
    }

    // Save to longform data
    const scriptOutPath = path.join(process.cwd(), 'longform', 'data', 'script_longform.json');
    fs.writeFileSync(scriptOutPath, JSON.stringify(data, null, 2));

    // Append to history
    history.push({
      date: new Date().toISOString(),
      title: data.title,
      storyOutline: data.storyOutline || null,
      scenes: data.scenes.length,
      totalMessages: data.scenes.reduce((acc, s) => acc + (s.messages ? s.messages.length : 0), 0),
      thumbnail: data.thumbnail || null,
      durationSeconds: qualityResult.durationSeconds || null,
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    const totalMessagesCount = data.scenes.reduce((acc, s) => acc + (s.messages ? s.messages.length : 0), 0);
    console.log(`✅ Successfully generated authentic Multi-Scene Beluga Episode (${data.scenes.length} scenes, ${totalMessagesCount} messages)!`);
    console.log('🎬 Title: ' + data.title);
    return data;
  } catch (e) {
    console.error('❌ Failed to generate long-form script:', e);
    throw e;
  }
}

if (process.argv[1] && process.argv[1].endsWith('generateLongformScript.js')) {
  generateLongformScript();
}
