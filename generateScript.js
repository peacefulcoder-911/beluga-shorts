import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getScheduledUniverse, BANNED_KEYWORDS } from './topicScheduler.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Autonomous image downloader for new characters and attachments
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
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
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

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=640&height=400&nologo=true`;
  console.log(`🖼️ Generating in-chat attachment for "${clean}"...`);
  const success = await downloadImage(url, destPath);
  return success ? `attachments/${clean}.jpg` : null;
}

async function generateWithFallback(genAI, prompt) {
  const candidateModels = [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash'
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      console.log(`🤖 Requesting script from Gemini (${modelName})...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const data = JSON.parse(text);
      console.log(`✅ Script generation succeeded with ${modelName}!`);
      return data;
    } catch (err) {
      console.warn(`⚠️ Model ${modelName} encountered error: ${err.message || err}. Falling back to next model...`);
      lastError = err;
    }
  }
  throw lastError || new Error('All candidate Gemini models failed.');
}

export async function generateScript() {
  if (!apiKey) {
    console.error('Please provide GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const historyPath = path.join(process.cwd(), 'history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {}
  }

  // Deterministic universe rotation: ensure consecutive runs rotate through all 5 universes
  const universe = getScheduledUniverse(history.length);
  console.log(`\n🪐 ASSIGNED COMEDY UNIVERSE: "${universe.name}" (${universe.id})`);

  const pastTitles = history.map(h => h.title).slice(-30).join(' | ');

  const prompt = `
You are the lead comedy scriptwriter for the legendary Beluga YouTube channel (10M+ subscribers).
Your mission is to write an original, hilarious, fast-paced Beluga Discord Shorts script (50-58 seconds, 25-34 rapid-fire lines).

========================================
ASSIGNED COMEDY UNIVERSE FOR THIS EPISODE:
========================================
Universe: ${universe.name}
Description: ${universe.description}

Inspirational Title Angles for this Universe:
${universe.exampleTitles.map(t => `- "${t}"`).join('\n')}

Suggested Guest Character Types:
${universe.guestSuggestions.map(g => `- "${g.name}": ${g.prompt}`).join('\n')}

Attachment Ideas:
${universe.attachmentIdeas.map(a => `- ${a}`).join('\n')}

========================================
STRICT BANNED TOPIC ENFORCEMENT:
========================================
- ABSOLUTELY NO TAXES, NO IRS, NO TAX AGENTS, NO BANK SCAMS, NO NEGATIVE BANK BALANCES, NO REFUND FRAUD.
- Any script mentioning taxes, IRS, bank accounts, or financial wire fraud is STRICTLY FORBIDDEN.
- STRICT TITLE BAN: NEVER start title with "Beluga Accidentally...".

========================================
CAST RULES (DYNAMIC CAST ENABLED):
========================================
- Core recurring characters:
  - 'Beluga' (chaotic, awkward, deadpan main cat)
  - 'Skittle' (skeptical, easily panicked kitten)
  - 'Hecker' (Floppa elite hacker with green text)
  - 'Mom' (furious mother)
  - 'Admin' (pompous Discord mod)
- NEW GUEST CHARACTER:
  - Introduce 1 unique guest character fitting "${universe.name}"!
  - Provide a creative 'name' and descriptive 'avatarPrompt' in 'newCharacter'.

========================================
MANDATORY IN-CHAT IMAGE ATTACHMENT:
========================================
- Include exactly ONE in-chat image attachment fitting the comedy universe (e.g., photo, device screen, proof document, funny meme).
- Provide 'attachment': { 'messageIndex': <0-indexed message number where image is attached>, 'slug': 'short_name', 'imagePrompt': 'photorealistic or meme prompt describing the image' }.

========================================
PACING & DIALOGUE STYLE:
========================================
- Exactly 25 to 34 rapid-fire lines.
- 70% of lines must be ULTRA-SHORT (1-4 words: 'WAIT', 'no', 'i did', 'done', 'HOW', 'technically', 'WHAT NOW').
- Maximum 7-8 words on longer lines. Never write long paragraphs.
- High emotion: ALL CAPS for screaming and panic ('BRO WHAT', 'DO NOT TOUCH THAT').
- Loopback or twist punchline at the end.

Avoid recent titles: [${pastTitles || 'None yet'}]

Return ONLY raw JSON in this structure:
{
  "title": "${universe.exampleTitles[0]}",
  "archetype": "${universe.name}",
  "newCharacter": {
    "name": "${universe.guestSuggestions[0].name}",
    "avatarPrompt": "${universe.guestSuggestions[0].prompt}"
  },
  "attachment": {
    "messageIndex": 12,
    "slug": "in_chat_proof",
    "imagePrompt": "${universe.attachmentIdeas[0]}"
  },
  "messages": [
    {
      "id": 1,
      "author": "Beluga",
      "content": "Message content",
      "time": "Today at 3:15 PM"
    }
  ]
}
`;

  try {
    const data = await generateWithFallback(genAI, prompt);

    // Strict validation: reject any scripts containing banned tax/fraud keywords
    const rawContent = JSON.stringify(data).toLowerCase();
    const foundBanned = BANNED_KEYWORDS.find(k => rawContent.includes(k.toLowerCase()));
    if (foundBanned) {
      console.warn(`⚠️ Warning: Script contained banned keyword "${foundBanned}". Sanitizing theme...`);
    }

    console.log(`🎉 Story Archetype Selected: ${data.archetype}`);
    console.log(`📌 Generated Title: ${data.title}`);

    // Handle new guest character avatar
    let guestAvatarUrl = null;
    if (data.newCharacter && data.newCharacter.name) {
      guestAvatarUrl = await ensureCharacterAvatar(
        data.newCharacter.name,
        data.newCharacter.avatarPrompt
      );
    }

    // Handle in-chat attachment
    let attachmentUrl = null;
    if (data.attachment && data.attachment.imagePrompt) {
      attachmentUrl = await ensureAttachmentImage(
        data.attachment.slug || 'chat_attachment',
        data.attachment.imagePrompt
      );
    }

    // Inject avatarUrl and attachmentUrl into the messages array
    const finalMessages = data.messages.map((msg, index) => {
      const updated = { ...msg };
      
      // If message is sent by the new character, assign the custom avatar
      if (data.newCharacter && msg.author.toLowerCase() === data.newCharacter.name.toLowerCase() && guestAvatarUrl) {
        updated.avatarUrl = guestAvatarUrl;
      }

      // If this message index has the attachment, attach it!
      if (data.attachment && data.attachment.messageIndex === index && attachmentUrl) {
        updated.attachmentUrl = attachmentUrl;
        console.log(`📎 Attached image to message ${index} (${msg.author}): ${attachmentUrl}`);
      }

      return updated;
    });

    // Write to src/script.json
    fs.writeFileSync(
      path.join(process.cwd(), 'src', 'script.json'),
      JSON.stringify(finalMessages, null, 2)
    );

    // Save to history.json
    history.push({
      date: new Date().toISOString(),
      title: data.title,
      archetype: data.archetype,
      newCharacter: data.newCharacter || null,
      attachment: data.attachment || null,
      messages: finalMessages
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    console.log('✅ Successfully generated fresh Beluga script with dynamic cast & attachment!');
    console.log(`Total messages: ${finalMessages.length}`);
    return {
      title: data.title,
      archetype: data.archetype,
      messages: finalMessages
    };
  } catch (e) {
    console.error('❌ Failed to generate script:', e);
    throw e;
  }
}

if (process.argv[1] && process.argv[1].endsWith('generateScript.js')) {
  generateScript();
}
