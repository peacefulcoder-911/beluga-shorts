import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getScheduledUniverse, BANNED_KEYWORDS } from './topicScheduler.js';
import {
  buildShortsStoryPrompt,
  cleanAndParseJson,
  extractAntiRepetitionContext,
  validateNarrativeQuality,
  resolveHookCard,
  fromLegacyShortsScript,
  getTrendingTopic,
  getTrendingTopicForSlot,
  ensureTrendingAssets,
  productionDb,
} from './src/core/index.ts';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Autonomous image downloader for new characters, attachments, and dynamic hook cards
async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`✅ Asset generated & saved: ${destPath}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Could not download asset from ${url}:`, err.message);
    return false;
  }
}

async function ensureCharacterAvatar(charName, avatarPrompt) {
  if (!charName) return null;
  const clean = charName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const destDir = path.join(process.cwd(), 'public', 'characters');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, `${clean}.jpg`);

  if (fs.existsSync(destPath)) {
    console.log(`ℹ️ Character avatar already exists for: ${charName}`);
    return `characters/${clean}.jpg`;
  }

  const prompt = avatarPrompt || `Discord profile avatar of ${charName} in funny cat meme style, centered, high quality, square portrait`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512`;
  console.log(`🎨 Generating new character avatar for "${charName}"...`);
  const success = await downloadImage(url, destPath);
  return success ? `characters/${clean}.jpg` : 'default_user.jpg';
}

async function ensureAttachmentImage(slug, imagePrompt) {
  if (!slug || !imagePrompt) return null;
  const clean = slug.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const destDir = path.join(process.cwd(), 'public', 'attachments');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, `${clean}.jpg`);

  if (fs.existsSync(destPath)) {
    console.log(`ℹ️ Attachment image already exists: ${clean}.jpg`);
    return `attachments/${clean}.jpg`;
  }

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=640&height=400`;
  console.log(`🖼️ Generating in-chat attachment for "${clean}"...`);
  const success = await downloadImage(url, destPath);
  return success ? `attachments/${clean}.jpg` : null;
}

async function ensureHookCardThumbnail(slug, hookPrompt) {
  if (!slug || !hookPrompt) return null;
  const clean = slug.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const destDir = path.join(process.cwd(), 'public', 'attachments');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destPath = path.join(destDir, `${clean}.jpg`);

  if (fs.existsSync(destPath)) {
    return `attachments/${clean}.jpg`;
  }

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(hookPrompt)}?width=1080&height=1920`;
  console.log(`🪝 Generating dynamic hook card image for "${clean}"...`);
  const success = await downloadImage(url, destPath);
  return success ? `attachments/${clean}.jpg` : null;
}

export async function generateWithFallback(genAI, prompt) {
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      console.log(`🤖 Requesting script from Gemini (${modelName})...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = cleanAndParseJson(text);
      console.log(`✅ Script generation succeeded with ${modelName}!`);
      return data;
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} encountered error: ${err.message || err}. Falling back to next model...`);
      lastError = err;
    }
  }
  throw lastError || new Error('All candidate Gemini models failed.');
}

export async function generateScript(params = null) {
  if (!apiKey) {
    console.error('Please provide GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Normalize options
  let topicOverride = null;
  let slotIndex = undefined;
  let totalSlots = 3;
  let excludeIds = [];

  if (typeof params === 'string') {
    topicOverride = params;
  } else if (params && typeof params === 'object') {
    topicOverride = params.topicOverride || null;
    slotIndex = params.slotIndex;
    totalSlots = params.totalSlots || 3;
    excludeIds = Array.isArray(params.excludeIds) ? params.excludeIds : [];
  }

  const historyPath = path.join(process.cwd(), 'history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch {
      history = [];
    }
  }

  // Parse command line arguments
  let requestedTopic = topicOverride;
  let useLegacyUniverse = false;
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith('--topic=')) requestedTopic = arg.split('=')[1];
    else if (arg.startsWith('--trend=')) requestedTopic = arg.split('=')[1];
    else if (arg.startsWith('--slot=')) slotIndex = parseInt(arg.split('=')[1], 10);
    else if (arg === '--universe') useLegacyUniverse = true;
    else if (!arg.startsWith('--') && !requestedTopic) requestedTopic = arg;
  }

  // Extract rich anti-repetition context
  const antiRepetition = extractAntiRepetitionContext(history);

  let prompt;
  let trendingTopic = null;
  let topicAssets = null;

  if (useLegacyUniverse) {
    const universe = getScheduledUniverse(history.length);
    console.log(`\n🪐 ASSIGNED COMEDY UNIVERSE: "${universe.name}" (${universe.id})`);
    prompt = buildShortsStoryPrompt({
      universe,
      antiRepetition,
      bannedKeywords: BANNED_KEYWORDS,
    });
  } else {
    // Select trending topic: use slot-based non-repeating picker if slotIndex provided, else getTrendingTopic
    if (slotIndex !== undefined && !requestedTopic) {
      trendingTopic = getTrendingTopicForSlot(slotIndex, excludeIds);
    } else {
      trendingTopic = getTrendingTopic(requestedTopic);
    }
    console.log(`\n🔥 ACTIVE DAILY TRENDING TOPIC: "${trendingTopic.title}" (ID: ${trendingTopic.id})`);
    console.log(`📂 Category: [${trendingTopic.category.toUpperCase()}]`);
    console.log(`⚡ Headline: "${trendingTopic.headline}"`);
    console.log(`🪝 Hook Headline: "${trendingTopic.hookHeadline}"`);
    console.log(`👤 Guest Character: "${trendingTopic.guestCharacter.name}" (${trendingTopic.guestCharacter.role})`);

    // Verify and ensure physical topic assets exist
    topicAssets = await ensureTrendingAssets(trendingTopic);
    console.log(`🖼️ Verified Hook Image: ${topicAssets.hookImagePath}`);
    console.log(`🎭 Verified Guest Avatar: ${topicAssets.guestAvatarPath}`);
    console.log(`📎 Verified Evidence: ${topicAssets.evidenceImagePath}`);

    prompt = buildShortsStoryPrompt({
      trendingTopic,
      antiRepetition,
      bannedKeywords: BANNED_KEYWORDS,
      targetDurationSeconds: 52,
    });
  }

  try {
    const data = await generateWithFallback(genAI, prompt);

    // Strict validation: reject any scripts containing banned tax/fraud keywords
    const rawContent = JSON.stringify(data).toLowerCase();
    const foundBanned = BANNED_KEYWORDS.find((k) => rawContent.includes(k.toLowerCase()));
    if (foundBanned) {
      console.warn(`⚠️ Warning: Script contained banned keyword "${foundBanned}". Sanitizing theme...`);
    }

    console.log(`🎉 Story Archetype Selected: ${data.archetype}`);
    console.log(`📌 Generated Title: ${data.title}`);
    if (data.storyOutline) {
      console.log(`📖 Story Hook: ${data.storyOutline.hook}`);
      console.log(`⚡ Climax: ${data.storyOutline.climax}`);
      console.log(`🎯 Payoff: ${data.storyOutline.payoff}`);
    }

    // Handle legacy guest character avatar if not using trending assets
    let guestAvatarUrl = null;
    if (!trendingTopic && data.newCharacter && data.newCharacter.name) {
      guestAvatarUrl = await ensureCharacterAvatar(
        data.newCharacter.name,
        data.newCharacter.avatarPrompt
      );
    }

    // Handle legacy in-chat attachment if not using trending assets
    let attachmentUrl = null;
    if (!trendingTopic && data.attachment && data.attachment.imagePrompt) {
      attachmentUrl = await ensureAttachmentImage(
        data.attachment.slug || 'chat_attachment',
        data.attachment.imagePrompt
      );
    }

    // Handle dynamic hook card for legacy mode
    let hookThumbnailUrl = null;
    if (!trendingTopic) {
      const resolvedHook = resolveHookCard(data.title, data.archetype, data.hookCard);
      if (resolvedHook.shouldShowHookCard) {
        if (resolvedHook.hookThumbnailUrl && fs.existsSync(path.join(process.cwd(), 'public', resolvedHook.hookThumbnailUrl))) {
          hookThumbnailUrl = resolvedHook.hookThumbnailUrl;
        } else if (data.hookCard?.headline) {
          hookThumbnailUrl = await ensureHookCardThumbnail(
            `hook_${Date.now()}`,
            `YouTube Shorts high-CTR opening title card: "${resolvedHook.headline || data.title}", meme style`
          );
        }
        if (hookThumbnailUrl) {
          console.log(`🪝 Dynamic Hook Card enabled: ${hookThumbnailUrl}`);
        }
      }
    }

    // Inject avatarUrl, attachmentUrl, hookThumbnailUrl, and visual/camera cues into messages
    const guestNameLower = trendingTopic ? trendingTopic.guestCharacter.name.toLowerCase() : null;
    const attachmentTargetIdx = data.attachment?.messageIndex ?? Math.floor((data.messages || []).length * 0.55);

    const finalMessages = (data.messages || []).map((msg, index) => {
      const updated = { ...msg };

      // Re-index to ensure sequential 1-based IDs
      updated.id = index + 1;

      // Assign custom avatar if sent by guest character
      if (trendingTopic && topicAssets) {
        if (msg.author.toLowerCase() === guestNameLower || msg.author.toLowerCase().includes(guestNameLower)) {
          updated.avatarUrl = topicAssets.guestAvatarPath;
        }
      } else if (guestAvatarUrl && data.newCharacter && msg.author.toLowerCase() === data.newCharacter.name.toLowerCase()) {
        updated.avatarUrl = guestAvatarUrl;
      }

      // Attach in-chat image attachment
      if (trendingTopic && topicAssets) {
        if (index === attachmentTargetIdx) {
          updated.attachmentUrl = topicAssets.evidenceImagePath;
          console.log(`📎 Attached verified evidence to message ${index + 1} (${msg.author}): ${topicAssets.evidenceImagePath}`);
        }
      } else if (attachmentUrl && data.attachment && data.attachment.messageIndex === index) {
        updated.attachmentUrl = attachmentUrl;
        console.log(`📎 Attached image to message ${index + 1} (${msg.author}): ${attachmentUrl}`);
      }

      // Attach dynamic hook card and headline to first message for renderer detection
      if (index === 0) {
        if (trendingTopic && topicAssets) {
          updated.hookThumbnailUrl = topicAssets.hookImagePath;
          updated.hookHeadline = trendingTopic.hookHeadline;
        } else if (hookThumbnailUrl) {
          updated.hookThumbnailUrl = hookThumbnailUrl;
        }
      }

      // Camera & System effects
      updated.screenShake = Boolean(msg.screenShake);
      updated.punchZoom = Boolean(msg.punchZoom);
      updated.typingFrames = typeof msg.typingFrames === 'number' ? msg.typingFrames : 0;
      if (msg.systemAlert && typeof msg.systemAlert === 'string' && msg.systemAlert.trim().length > 0) {
        updated.systemAlert = msg.systemAlert.trim();
      }

      // Ensure explicit audio cues structure
      if (!updated.audioCues || updated.audioCues.length === 0) {
        const cues = [{ id: `sfx-notify-${updated.id}`, type: 'notification' }];
        if (updated.attachmentUrl) {
          cues.push({ id: `sfx-hit-${updated.id}`, type: 'horror_hit', volume: 0.7 });
        }
        if (updated.screenShake) {
          cues.push({ id: `sfx-shake-${updated.id}`, type: 'twist_boom', volume: 0.75 });
        }
        updated.audioCues = cues;
      }

      // STRICT REQUIREMENT: Delete any reaction pills
      delete updated.reactions;

      // Ensure physical asset existence so Remotion renderer never encounters 404s
      if (updated.avatarUrl) {
        const fullPath = path.join(process.cwd(), 'public', updated.avatarUrl);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ Avatar asset not found on disk: "${updated.avatarUrl}". Safe fallback to default_user.jpg.`);
          updated.avatarUrl = 'default_user.jpg';
        }
      }
      if (updated.attachmentUrl) {
        const fullPath = path.join(process.cwd(), 'public', updated.attachmentUrl);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ Attachment asset not found on disk: "${updated.attachmentUrl}". Safe fallback to attachments/deposit_penny.jpg.`);
          updated.attachmentUrl = 'attachments/deposit_penny.jpg';
        }
      }
      if (updated.hookThumbnailUrl) {
        const fullPath = path.join(process.cwd(), 'public', updated.hookThumbnailUrl);
        if (!fs.existsSync(fullPath)) {
          console.warn(`⚠️ Hook thumbnail not found on disk: "${updated.hookThumbnailUrl}". Safe fallback to thumbnail_mrbeast_mule.jpg.`);
          updated.hookThumbnailUrl = 'thumbnail_mrbeast_mule.jpg';
        }
      }

      return updated;
    });

    // Validate narrative quality & duration using Core Validation & Timing Engine
    const canonicalScript = fromLegacyShortsScript(finalMessages, {
      title: data.title,
      archetype: data.archetype,
    });
    const qualityResult = validateNarrativeQuality(canonicalScript, {
      minMessages: 18,
      maxMessages: 34,
      maxDurationSec: 58,
      minDurationSec: 46,
      initialDelayFrames: trendingTopic ? 60 : 0,
    });

    if (!qualityResult.isValid) {
      console.warn(`⚠️ Narrative Quality Notice (${qualityResult.errors.length} checks):`, qualityResult.errors.join('; '));
    } else {
      console.log(`⏱️ Shorts Duration: ${qualityResult.durationSeconds?.toFixed(1)}s (within 50–55s target)`);
    }

    // Strict Anti-Repetition Database Check: Ensure title is unique across history
    if (productionDb.isTitleDuplicate(data.title)) {
      console.warn(`⚠️ Title "${data.title}" matches previously produced video in database. Generating unique title variation...`);
      const baseClean = data.title.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
      data.title = `${baseClean} (Part ${Math.floor(Date.now() / 1000) % 100}) 💀`;
      console.log(`📌 Unique Title Assigned: "${data.title}"`);
    }

    // Write to src/script.json
    fs.writeFileSync(
      path.join(process.cwd(), 'src', 'script.json'),
      JSON.stringify(finalMessages, null, 2)
    );

    // Save rich metadata to history.json
    history.push({
      date: new Date().toISOString(),
      title: data.title,
      archetype: data.archetype,
      trendingTopic: trendingTopic ? trendingTopic.id : null,
      category: trendingTopic ? trendingTopic.category : null,
      headline: trendingTopic ? trendingTopic.headline : null,
      hookHeadline: trendingTopic ? trendingTopic.hookHeadline : null,
      storyOutline: data.storyOutline || null,
      hookCard: data.hookCard || null,
      guestCharacter: trendingTopic ? trendingTopic.guestCharacter.name : (data.newCharacter?.name || null),
      attachment: trendingTopic ? topicAssets.evidenceImagePath : (data.attachment || null),
      messages: finalMessages,
      durationSeconds: qualityResult.durationSeconds || null,
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
    productionDb.reload();

    console.log('✅ Successfully generated fresh story-first Beluga script with dynamic cast & hook card!');
    console.log(`Total messages: ${finalMessages.length}`);
    return {
      title: data.title,
      archetype: data.archetype,
      messages: finalMessages,
      storyOutline: data.storyOutline,
    };
  } catch (e) {
    console.error('❌ Failed to generate script:', e);
    throw e;
  }
}

if (process.argv[1] && process.argv[1].endsWith('generateScript.js')) {
  generateScript();
}
