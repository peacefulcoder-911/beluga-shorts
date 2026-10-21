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

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=800&height=500&nologo=true`;
  console.log(`🖼️ Generating in-chat attachment for "${clean}"...`);
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
You are writing a full-length, highly engaging ONE-ACT episodic Discord comedy video centered around a FAMOUS HISTORICAL IMAGE, PAINTING, OR VIRAL CONSPIRACY (1920x1080 Landscape).

### CORE CONCEPT: ONE COMPLETE COHESIVE ACT ON A SPECIFIC TOPIC
- The entire episode takes place in ONE continuous channel (#general).
- No channel jumping, no separate voice/admin acts. A single, focused, escalating comedic storyline.
- Topic MUST be a real, famous painting, historical photo, monument, or pop-culture scandal that Beluga "exposes":
  - Examples: Napoleon Crossing the Alps on a Mule, Mona Lisa having no eyebrows / being fake, George Washington's wooden teeth, The Statue of Liberty secretly holding something weird, The Declaration of Independence treasure map, Einstein's famous tongue photo, Michelangelo's hidden brain anatomy, The Leaning Tower of Pisa falling over.

### THE 2 IN-CHAT IMAGE ATTACHMENTS:
1. **Opening Image (Message 3 to 6)**: The real, famous painting or historical photograph that Beluga drops as "proof" of the scandal.
2. **Climax Revelation Image (Message 35 to 45)**: A hilarious, absurd, or bizarre parody version of the image created/hacked by Hecker or Beluga (e.g., Napoleon on a giant crowned mule, Mona Lisa with Beluga's face, Washington with vampire fangs).

### CAST DYNAMICS:
- **Beluga**: Discovers the scandal, takes everything literally, delivers deadpan absurd theories in ALL CAPS ("NAPOLEON WAS USING A FILTER IN 1801", "BRO MADE A LINKEDIN PROFILE OUT OF A MOUNTAIN").
- **Skittle**: The frustrated straight-man attempting to use common sense ("did you fail history again", "YOU CANNOT HACK A PAINTING").
- **ExplodingTNT**: The hyperactive meme-roaster ("WHY IS THAT HORSE LEVITATING", "BRO USED A RENTAL HORSE FOR HIS PFP", "CEO OF CROSSING ALPS").
- **Hecker**: The ultra-calm hacker who takes absurd requests dead seriously ("confirmed", "hacked the painting", "skill issue", "the mule has a bank account now").
- **Guest Star (MrBeast, Billionaire, or Elon)**: Enters midway with an absurd $1,000,000 reward/offer, but ends up awarding the money to the ridiculous entity (e.g. the mule or a pigeon).
- **Server Event**: Near the end, the server icon changes or a chaotic announcement happens: "[SERVER ICON CHANGED TO A MULE WEARING A CROWN]".

### PACING & LENGTH:
- Total: 45 to 55 lines.
- Rapid-fire Discord dialogue: 75% short lines (1 to 5 words).
- Shouting in ALL CAPS for shock and comedic timing.

Avoid past topics: [${pastTitles || 'None yet'}]

Return ONLY raw JSON with this exact structure:
{
  "title": "Napoleon's Fake Horse Scandal... 💀",
  "description": "Beluga exposes a 200-year-old historical scandal on Discord with Hecker, ExplodingTNT, and MrBeast. #beluga #discord #meme #comedy",
  "tags": ["beluga", "discord", "history", "meme", "hecker", "skittle", "mrbeast", "explodingtnt"],
  "thumbnail": {
    "author": "MrBeast",
    "authorColor": "#00d2d3",
    "authorAvatar": "characters/mrbeast.jpg",
    "authorTime": "Today at 4:18 PM",
    "authorMessage": "I gave $1,000,000 to the mule.",
    "belugaTime": "Today at 4:18 PM",
    "belugaMessage": "you can't give money to a mule"
  },
  "attachments": [
    {
      "messageIndex": 2,
      "slug": "historical_painting_original",
      "imagePrompt": "High-resolution classical fine art oil painting of the historical subject, ornate gallery framing, dramatic 19th century masterpiece"
    },
    {
      "messageIndex": 38,
      "slug": "hacked_parody_revelation",
      "imagePrompt": "Humorous classical oil painting parody of the subject with an absurd comical twist, high art quality, majestic and funny"
    }
  ],
  "scenes": [
    {
      "sceneId": 1,
      "channelName": "general",
      "channelType": "text",
      "topic": "Welcome to #general",
      "messages": [
        { "id": 1, "author": "Beluga", "time": "4:02 PM", "content": "GUYS I FOUND A HISTORICAL SCANDAL" }
      ]
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    // Handle multiple attachment images
    const attachments = data.attachments || (data.attachment ? [data.attachment] : []);
    for (const att of attachments) {
      if (att && att.imagePrompt) {
        const attUrl = await ensureAttachmentImage(
          att.slug || `longform_att_${Date.now()}`,
          att.imagePrompt
        );
        if (attUrl && data.scenes && data.scenes[0] && data.scenes[0].messages[att.messageIndex]) {
          data.scenes[0].messages[att.messageIndex].attachmentUrl = attUrl;
          console.log(`📎 Attached in-chat image to message index ${att.messageIndex}: ${attUrl}`);
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

    console.log('✅ Successfully generated authentic One-Act Beluga Episode!');
    console.log('🎬 Title: ' + data.title);
    console.log('📜 Total Messages in Act: ' + data.scenes[0].messages.length);
    return data;
  } catch (e) {
    console.error('❌ Failed to generate long-form script:', e);
    throw e;
  }
}

if (process.argv[1] && process.argv[1].endsWith('generateLongformScript.js')) {
  generateLongformScript();
}
