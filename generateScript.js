import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

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

export async function generateScript() {
  if (!apiKey) {
    console.error('Please provide GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log('Generating next-generation dynamic Beluga Shorts script with custom cast & in-chat images...');
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const historyPath = path.join(process.cwd(), 'history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {}
  }

  const pastTitles = history.map(h => h.title).slice(-30).join(' | ');

  const prompt = `
You are the lead comedy scriptwriter for the legendary Beluga YouTube channel (10M+ subscribers).
Your mission is to write an original, hilarious, fast-paced Beluga Discord Shorts script (50-58 seconds, 25-34 rapid-fire lines).

========================================
CRITICAL ANTI-REPETITION RULES:
========================================
1. STRICT TITLE BAN: NEVER START THE TITLE WITH "Beluga Accidentally...". 
   Any title starting with "Beluga Accidentally" is STRICTLY FORBIDDEN.
2. DIVERSE TITLE STRUCTURES: Use varied viral formats such as:
   - "When [Situation]..." (e.g., "When An IRS Scammer Tries To Extort Beluga 💀")
   - "Beluga Lied On [Something]..." (e.g., "Beluga Lied On His NASA Resume 😭")
   - "The 1 Rule You NEVER Break In [Server]... 😳"
   - "The Court Trial of [Character] ⚖️"
   - "My Smart [Device] Is Extorting Me 💀"
   - "Trading A [Weird Item] Until I Get A [Luxury] 💸"
   - "Last Person To [Action] Wins $100,000 🤫"
   - "Never Tell Your Landlord You [Something] 😭"
   - "Someone Else Is Typing From My Account 👁️"

========================================
THE 8 ROTATING VIRAL ARCHETYPES (PICK ONE):
========================================
1. SCAM REVENGE: A scammer tries to extort Beluga for money/gift cards, but Beluga misunderstands and ruins the scammer's life.
2. THE FAKE RESUME / JOB: Beluga applies for an impossible job (Astronaut, Surgeon, CEO, Discord Mod) with a completely fabricated resume.
3. THE UNHINGED SERVER RULE: Beluga joins a server with absurd rules (e.g. "Never use the letter E") and immediately triggers chaos.
4. THE COURTROOM TRIAL: A character is on trial in Discord court with memes used as forensic evidence.
5. SMART HOME EXTORTION: A smart home device (Smart Fridge, Robot Vacuum, Toaster) develops an attitude and holds snacks hostage.
6. EXTREME SILENCE CHALLENGE: MrFeast hosts a challenge where the first person to send a message loses $100,000.
7. DOPPELGANGER / GLITCH: Someone with Beluga's exact avatar and name starts typing his thoughts before he does.
8. IMPOSSIBLE BARTER: Beluga trades an absurd low-value item (Dorito, paperclip) through increasingly wild marketplace deals.

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
  - You ARE ENCOURAGED to introduce 1 new unique guest character specific to this story!
  - Examples: "IRS Agent Rajesh", "Flight Director Vance", "Judge Whiskers", "Landlord Gary", "Smart Fridge v4", "MrFeast", "Alien Invader", "Gordon Ramsay Cat".
  - If introducing a new character, define 'newCharacter' in your JSON with a descriptive 'avatarPrompt'.

========================================
MANDATORY IN-CHAT IMAGE ATTACHMENT:
========================================
- Every script MUST include at least ONE in-chat image attachment (e.g., proof photo, screenshot, document, or absurd visual).
- Example ideas:
  - Scammer asks for Apple gift cards -> Beluga sends a photo of an actual red apple with a bite taken out of it.
  - NASA interview -> Beluga attaches a crayon-drawn rocket labeled "Certified Space Ship".
  - Smart fridge extortion -> Photo of a smart fridge LCD displaying a red countdown skull.
  - Bank balance -> Screenshot of a bank balance of -$4,500.00.
- Provide 'attachment': { 'messageIndex': <0-indexed message number where image is attached>, 'slug': 'short_name', 'imagePrompt': 'photorealistic or meme prompt describing the image' }.

========================================
PACING & DIALOGUE STYLE:
========================================
- Exactly 25 to 34 rapid-fire lines.
- 70% of lines must be ULTRA-SHORT (1-4 words: 'WAIT', 'no', 'i did', 'done', 'HOW', 'TO WHO', 'technically', 'WHAT NOW').
- Maximum 7-8 words on longer lines. Never write long paragraphs.
- High emotion: ALL CAPS for screaming and panic ('BRO WHAT', 'DO NOT TOUCH THAT').
- Loopback or twist punchline at the end.

Avoid any recent titles: [${pastTitles || 'None yet'}]

Return ONLY raw JSON in this structure:
{
  "title": "When An IRS Scammer Tries To Extort Beluga 💀 #shorts",
  "archetype": "Scam Revenge",
  "newCharacter": {
    "name": "IRS Agent Rajesh",
    "avatarPrompt": "Discord profile avatar of an annoyed cat wearing a headset with a badge in a call center, funny meme cat style"
  },
  "attachment": {
    "messageIndex": 12,
    "slug": "apple_giftcard_real",
    "imagePrompt": "A single fresh red apple with a large bite taken out of it resting on an office desk, funny meme photo"
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
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

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
