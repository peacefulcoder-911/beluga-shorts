import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

  const pastTitles = history.map(h => h.title).slice(-15).join(', ');

  const prompt = `
You are the master episodic comedy writer for 'Beluga' Discord long-form YouTube videos (2.5 to 3.5 minutes, 1920x1080 Landscape).

### GOAL:
Generate a hilarious, chaotic 3-Act episodic Discord story divided across 3 scenes:
- Act 1 (Scene 1: #general): The absurd inciting incident or terrible mistake by Beluga.
- Act 2 (Scene 2: 🔊 voice-lounge): Emergency voice call with Hecker. Voice call dialogue where Hecker panics and attempts a crazy counter-hack or plan.
- Act 3 (Scene 3: 🔒 admin-only or #courtroom): The confrontation with Admin, FBI (Police), or Billionaire, leading to Beluga's innocent stupidity defeating the system with a loopback punchline.

### MANDATORY CAST RULES (ONLY USE THESE 13 CHARACTERS):
- 'Beluga': The innocent, chaotic, deadpan main cat. Speaks in lowercase, blunt short statements.
- 'Skittle': Skeptical, panicky best friend kitten in gold astronaut helmet. Often uses ALL CAPS.
- 'Hecker': Elite hacker Floppa cat. Master of mainframe hacks, suspicious deals, and voice calls.
- 'Admin': Pompous, ban-happy server owner cat with gold crown.
- 'Police': FBI/cyber agent investigating international Discord crimes.
- 'Billionaire': Wealthy, eccentric mogul looking to buy absurd things.
- 'NASA': Space agency tracking anomalies.
- 'Google': Literal Google AI Assistant.
- 'SYSTEM': Discord automated system bot.
- 'Mr. Smith': Strict school teacher.
- 'Mom': Furious mother.
- 'Girlfriend': Suspicious partner asking trap questions.
- 'Pablo': Shady Discord moderator.

CRITICAL: DO NOT invent ANY character outside this list. Every single line MUST be said by one of the characters above.

### DIALOGUE & PACING RULES:
- Total messages: 30 to 45 lines distributed across the 3 scenes (10-15 lines per scene).
- Snappy, rapid-fire humor: keep lines punchy, hilarious, and authentic to Discord culture.
- Use ALL CAPS for shock and yelling ('BRO WHAT', 'DO NOT CLICK THAT', 'WHY IS NASA AT MY DOOR').
- Voice scenes should include 'voiceMembers': ['Beluga', 'Hecker'] and can have 'voiceEvent': 'user_joined' or 'call_ringing'.

### AVOID PAST TOPICS:
[${pastTitles || 'None yet'}]

Return ONLY this exact JSON structure:
{
  "title": "Beluga Accidentally Bought An Entire Country 💀",
  "description": "Beluga thought he was buying an eBay mystery box... but accidentally purchased a sovereign nation. Now the FBI and Admin are involved. #beluga #discord #comedy",
  "tags": ["beluga", "discord", "animation", "comedy", "funny", "memes", "hecker"],
  "scenes": [
    {
      "sceneId": 1,
      "channelName": "general",
      "channelType": "text",
      "topic": "Welcome to the server! Don't click sketchy links.",
      "messages": [
        { "id": 1, "author": "Beluga", "time": "Today at 4:10 PM", "content": "guys i just clicked a link" },
        { "id": 2, "author": "Skittle", "time": "Today at 4:10 PM", "content": "WHAT LINK" }
      ]
    },
    {
      "sceneId": 2,
      "channelName": "voice-lounge",
      "channelType": "voice",
      "topic": "Emergency meeting regarding international treaties",
      "voiceMembers": ["Beluga", "Hecker"],
      "messages": [
        { "id": 11, "author": "Hecker", "time": "Today at 4:14 PM", "content": "Beluga, what did you just do", "voiceEvent": "user_joined" }
      ]
    },
    {
      "sceneId": 3,
      "channelName": "admin-only",
      "channelType": "text",
      "topic": "Interrogation room",
      "messages": [
        { "id": 21, "author": "Admin", "time": "Today at 4:18 PM", "content": "Beluga, you have 5 seconds to explain." }
      ]
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    // Save to longform data
    const scriptOutPath = path.join(process.cwd(), 'longform', 'data', 'script_longform.json');
    fs.writeFileSync(scriptOutPath, JSON.stringify(data, null, 2));

    // Append to history
    history.push({
      date: new Date().toISOString(),
      title: data.title,
      scenes: data.scenes.length,
      totalMessages: data.scenes.reduce((acc, s) => acc + s.messages.length, 0)
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
