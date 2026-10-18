import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export async function generateScript() {
  if (!apiKey) {
    console.error("Please provide GEMINI_API_KEY in .env");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log("Generating authentic, viral Beluga-style Discord story with few-shot mastery...");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const historyPath = path.join(process.cwd(), "history.json");
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    } catch (e) {}
  }

  const pastTitles = history.map(h => h.title).slice(-15).join(", ");

  const prompt = `
You are the master comedy scriptwriter for the legendary Beluga YouTube channel. You write high-retention, laugh-out-loud funny Discord chat Shorts.

STUDY THESE 3 REAL BELUGA MASTERPIECE EXAMPLES:

--- EXAMPLE 1 (The Status Caught in 4K) ---
Title: Beluga got caught in 4K... 💀
Messages:
1. Girlfriend: "babe are you asleep?"
2. Beluga: "yes deeply asleep dreaming about you"
3. Girlfriend: "then why does your discord status say: 'Playing Roblox Anime Battle for 14 hours'?"
4. Beluga: "my cat is holding the controller"
5. Girlfriend: "BELUGA YOU ARE THE CAT"
6. Beluga: "..."
7. Hecker: "live scan: cat has acquired 350 wins and a girlfriend."
8. Girlfriend: "EX-GIRLFRIEND."
9. Beluga: "worth it"

--- EXAMPLE 2 (The Trap Question) ---
Title: When your Girlfriend asks a trap question... 😳
Messages:
1. Girlfriend: "babe would you still love me if i was a worm?"
2. Beluga: "of course baby you'd be the prettiest worm"
3. Girlfriend: "aww really? what kind of worm? :)"
4. Beluga: "tapeworm"
5. Girlfriend: "..."
6. Beluga: "because you're always in my stomach <3"
7. Hecker: "romantic rizz level: negative 500."
8. Girlfriend: "don't ever text me again."

--- EXAMPLE 3 (The Discord Moderator Abuse) ---
Title: When the Discord Mod has too much power... 💀
Messages:
1. Beluga: "good morning everyone :)"
2. Pablo: "Rule 42: No positivity in #general. 24 hour timeout."
3. Beluga: "what??? i just said good morning!"
4. Pablo: "arguing with a moderator? that's a permanent ban."
5. Beluga: "hecker please save my nitro"
6. Hecker: "executing admin_override.exe..."
7. Pablo: "wait why is my role changed to 'Server Clown'?"
8. Hecker: "Rule 1: don't touch Beluga."
9. Beluga: "L + ratio pablo"

ALLOWED CHARACTERS (Strictly choose from these names):
- "Beluga": The main awkward cat
- "Mr. Smith": The strict school teacher
- "Hecker": The mysterious hacker cat with computer skills
- "Girlfriend": Beluga's suspicious girlfriend
- "Pablo": The abusive Discord server moderator
- "Mom": Beluga's angry or protective mother
- "Police": Law enforcement / FBI
- "Skittle": Cute anime girl character, friend
- "Vladimir": Stoic Russian cat wearing Ushanka hat
CRITICAL: Every character MUST use one of the exact names above so their unique profile pictures and colors load properly!

NOW WRITE A BRAND NEW, ORIGINAL STORY:
1. TOPIC: Choose a relatable real-world dilemma:
   - Girlfriend asking a ridiculous test or catching a lie
   - Discord status or rich presence revealing what someone is actually doing
   - Pablo abusing mod powers over tiny rules
   - School / homework / exam group chat gone wrong
   - Buying/selling something crazy on Discord or marketplace
2. PACING: Exactly 7 to 9 messages.
3. DIALOGUE: Short, crisp, natural (under 10 words per line). Use awkward emojis (💀, 😳, <3, ...).
4. COMEDY & REWATCH VALUE: The punchline MUST make the viewer laugh out loud and want to quote it in the comments.
5. DO NOT reuse any past title or theme: [${pastTitles || "None yet"}]

Return in this exact JSON structure:
{
  "title": "Viral YouTube Shorts Title",
  "messages": [
    {
      "id": 1,
      "author": "CharacterName",
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

    fs.writeFileSync(path.join(process.cwd(), "src", "script.json"), JSON.stringify(data.messages, null, 2));

    history.push({
      date: new Date().toISOString(),
      title: data.title,
      messages: data.messages
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    console.log("Successfully generated authentic Beluga script!");
    console.log("Title: " + data.title);
    console.log("Message Count: " + data.messages.length);
    return data;
  } catch (e) {
    console.error("Failed to generate script:", e);
    throw e;
  }
}

if (process.argv[1] && process.argv[1].endsWith("generateScript.js")) {
  generateScript();
}
