import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=640&height=400&nologo=true`;
  console.log(`🖼️ Generating longform attachment for "${clean}"...`);
  const success = await downloadAsset(url, destPath);
  return success ? `attachments/${clean}.jpg` : null;
}

export async function generateLongformScript() {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.85
    }
  });

  const historyPath = path.join(process.cwd(), 'longform', 'data', 'history_longform.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      history = [];
    }
  }

  const pastTitles = history.map(h => h.title).slice(-20).join(', ');

  const prompt = `
You are the master comedy writer for the Beluga YouTube channel (10M+ subscribers).
You are writing a full-length (2.5 to 4 minute) 3-Act episodic Discord comedy video (1920x1080 Landscape).

### CRITICAL ANTI-REPETITION RULES:
- DO NOT START THE TITLE WITH "Beluga Accidentally...". Banned phrase: "Beluga Accidentally".
- Use varied viral titles:
  - "When [Situation]..." (e.g. "When A Hacker Finds Your Password...", "When A Scammer Calls You...")
  - "Beluga Lied On [Something]..."
  - "The [Thing] That Broke The Internet..."
  - "The Court Trial of [Character]..."
  - "Hecker Sold My Discord Account..."

### 3-ACT STRUCTURE (DIVIDED ACROSS 3 SCENES):
- Act 1 (Scene 1: #general): The absurd inciting incident or terrible mistake by Beluga.
- Act 2 (Scene 2: 🔊 voice-lounge): Emergency voice call with Hecker. Voice call banter where Hecker tries a ridiculous counter-hack.
- Act 3 (Scene 3: 🔒 admin-only or #courtroom): The dramatic escalation with Admin, Police (FBI), or Authority, resolved by Beluga's innocent deadpan stupidity.

### MANDATORY IN-CHAT IMAGE ATTACHMENT:
- At least ONE message must include a hilarious in-chat photo/screenshot/proof attachment.
- Provide 'attachment': { 'sceneIndex': 0, 'messageIndex': 8, 'slug': 'short_name', 'imagePrompt': 'detailed funny meme or photo prompt' }.

### CLEAN MINIMALIST THUMBNAIL (THE 2-MESSAGE BELUGA PUNCHLINE):
- Provide a 'thumbnail' object with the 2-message setup and punchline:
  "thumbnail": {
    "author": "Police",
    "authorColor": "#5865F2",
    "authorAvatar": "police.jpg",
    "authorTime": "Today at 3:14 AM",
    "authorMessage": "Short dramatic setup line (max 6-8 words)",
    "belugaTime": "Today at 3:14 AM",
    "belugaMessage": "Beluga's hilarious deadpan 1-line reply"
  }

### CAST:
- Core: 'Beluga', 'Skittle', 'Hecker', 'Admin', 'Police', 'Mom', 'Vladimir', 'Billionaire', 'SYSTEM'.

### PACING:
- Total 35 to 55 lines across the 3 scenes.
- 70% ultra-short lines (1-4 words: 'WAIT', 'no', 'i did', 'done', 'HOW', 'TO WHO', 'technically').
- Shouting in ALL CAPS for shock.

Avoid past topics: [${pastTitles || 'None yet'}]

Return ONLY raw JSON in this structure:
{
  "title": "When A Hacker Threatens Beluga 💀",
  "description": "Beluga receives a mysterious threat on Discord, but his deadpan replies defeat the hacker. #beluga #discord #comedy #hecker",
  "tags": ["beluga", "discord", "comedy", "funny", "memes", "hecker", "skittle"],
  "thumbnail": {
    "author": "Hecker",
    "authorColor": "#57F287",
    "authorAvatar": "hecker.jpg",
    "authorTime": "Today at 8:39 AM",
    "authorMessage": "I have your exact home coordinates.",
    "belugaTime": "Today at 8:39 AM",
    "belugaMessage": "can you send pizza there please"
  },
  "attachment": {
    "sceneIndex": 0,
    "messageIndex": 5,
    "slug": "hacker_satellite",
    "imagePrompt": "A glowing red tactical radar map tracking a suburban house, high tech meme style"
  },
  "scenes": [
    {
      "sceneId": 1,
      "channelName": "general",
      "channelType": "text",
      "topic": "Welcome to #general",
      "messages": [
        { "id": 1, "author": "Beluga", "time": "3:10 PM", "content": "guys who sent me this email" }
      ]
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    // Handle attachment image if provided
    if (data.attachment && data.attachment.imagePrompt) {
      const attUrl = await ensureAttachmentImage(
        data.attachment.slug || 'longform_attachment',
        data.attachment.imagePrompt
      );
      if (attUrl && data.scenes[data.attachment.sceneIndex]) {
        const targetScene = data.scenes[data.attachment.sceneIndex];
        if (targetScene.messages[data.attachment.messageIndex]) {
          targetScene.messages[data.attachment.messageIndex].attachmentUrl = attUrl;
          console.log(`📎 Attached longform image to scene ${data.attachment.sceneIndex}, message ${data.attachment.messageIndex}`);
        }
      }
    }

    // Save to longform data
    const scriptOutPath = path.join(process.cwd(), 'longform', 'data', 'script_longform.json');
    fs.writeFileSync(scriptOutPath, JSON.stringify(data, null, 2));

    // Append to history
    history.push({
      date: new Date().toISOString(),
      title: data.title,
      scenes: data.scenes.length,
      totalMessages: data.scenes.reduce((acc, s) => acc + s.messages.length, 0),
      thumbnail: data.thumbnail || null
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    console.log('✅ Successfully generated authentic Long-Form Beluga Episode!');
    console.log('🎬 Title: ' + data.title);
    console.log('📜 Scenes: ' + data.scenes.length);
    return data;
  } catch (e) {
    console.error('❌ Failed to generate long-form script:', e);
    throw e;
  }
}

if (process.argv[1] && process.argv[1].endsWith('generateLongformScript.js')) {
  generateLongformScript();
}
