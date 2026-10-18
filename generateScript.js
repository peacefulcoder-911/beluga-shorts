import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export async function generateScript() {
  if (!apiKey) {
    console.error('Please provide GEMINI_API_KEY in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  console.log('Generating elite 6-beat viral Beluga Shorts script with rapid-fire pacing...');
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

  const pastTitles = history.map(h => h.title).slice(-20).join(', ');

  const prompt = `
You are the elite viral comedy scriptwriter for the legendary Beluga YouTube channel (10M+ subscribers).
Your videos get millions of views because of RAPID-FIRE PACING, ZERO FILLER, SHOCKING TWISTS, and LOOPBACK PUNCHLINES.

### MASTER STUDY: 'The Accidental Millionaire' (THE GOLD STANDARD)
[HOOK]
1. Beluga: 'guys i just became a millionaire'
2. Skittle: 'bro your bank account has '
3. Beluga: 'not anymore'

[CURIOSITY / RAPID-FIRE]
4. Skittle: 'WHAT DID YOU DO'
5. Beluga: 'i found a wallet'
6. Skittle: 'return it 💀'
7. Beluga: 'i did'
8. Skittle: 'then how are you rich'
9. Beluga: 'the wallet belonged to a billionaire'

[ESCALATION & PROOF]
10. Hecker: 'WAIT'
11. Hecker: 'DID YOU STEAL HIS MONEY'
12. Beluga: 'no'
13. Beluga: 'he gave me  million as a reward'
14. Skittle: 'this is the most unbelievable thing you have ever said'
15. Beluga: 'check my bank account'
16. Skittle: 'BRO ACTUALLY HAS ,000,002'

[TWIST SETUP]
17. Admin: 'Beluga, congratulations!'
18. Beluga: 'thank you admin'
19. Admin: 'now please pay your ,999 server debt'
20. Beluga: 'WHAT DEBT'
21. Admin: 'you accidentally bought the entire server yesterday'

[PAYOFF & CHAOS]
22. Skittle: 'WAIT'
23. Skittle: 'YOU OWN THE SERVER?'
24. Beluga: 'technically'
25. Hecker: 'THEN MAKE ME ADMIN'
26. Beluga: 'done'
27. Hecker: 'LET US GOOOO'
28. Admin: 'Beluga, you have been banned for abusing administrator privileges'

[FINAL LOOPBACK PUNCHLINE]
29. Beluga: 'guys'
30. Beluga: 'i just became a millionaire again'
31. Skittle: 'HOW'
32. Beluga: 'i sold the server'
33. Hecker: 'TO WHO'
34. Beluga: 'the billionaire'

---

### CORE VIRAL RULES (MANDATORY):
1. **ULTRA-SHORT SENTENCES**: 
   - Most lines MUST be 1 to 4 words ('WAIT', 'no', 'i did', 'done', 'HOW', 'TO WHO', 'technically').
   - Maximum 7-8 words per line for explanations. NEVER write paragraphs or long sentences.
2. **THE 6-BEAT NARRATIVE ARC**:
   - Beat 1 (Hook): Unbelievable claim or situation revealed instantly.
   - Beat 2 (Curiosity): Skeptical questioning in rapid 1-3 word ping-pong exchanges.
   - Beat 3 (Proof): Third party or scan/bank account confirms the impossible fact.
   - Beat 4 (The Catch): Authority figure drops a massive unexpected complication or debt.
   - Beat 5 (Chaos): Abuse of power or hasty bad decision leads to instant punishment.
   - Beat 6 (Loopback Punchline): Beluga solves the problem by looping back to the original premise in a hilarious way.
3. **PACING**: Exactly 24 to 34 rapid-fire lines total. Every line must provoke curiosity or a laugh.
4. **EMOTIONAL TEXTURE**:
   - Use ALL CAPS for genuine panic/shock ('WHAT DID YOU DO', 'BRO ACTUALLY HAS ,000,002', 'LET US GOOOO').
   - Use awkward emojis (💀, 😳, 🥺, <3) sparingly at emotional peaks.
5. **ALLOWED CHARACTERS ONLY**:
   - 'Beluga' (chaotic, deadpan main cat)
   - 'Skittle' (skeptical best friend kitten)
   - 'Hecker' (elite hacker Floppa cat)
   - 'Admin' (pompous Discord server owner cat with gold crown)
   - 'Mr. Smith' (strict school teacher)
   - 'Mom' (furious mother)
   - 'Girlfriend' (suspicious partner asking trap questions)
   - 'Pablo' (shady Discord moderator)
6. **FRESH VIRAL TOPICS** (Choose one original premise):
   - Beluga accidentally buys something absurd online (an airport, an FBI server, a submarine).
   - Discord status or live scan exposing a completely unhinged reality.
   - Accidental crypto/stock/lottery windfall that comes with a hilarious catastrophic condition.
   - High-stakes school / exam / homework disaster where a cheat goes completely haywire.
   - Discord server ownership transfer or moderator war with Hecker overriding the system.
7. **AVOID PAST TITLES**: [${pastTitles || 'None yet'}]

Return in this exact JSON structure:
{
  'title': 'Viral YouTube Shorts Title with Emojis',
  'messages': [
    {
      'id': 1,
      'author': 'Beluga',
      'content': 'guys i just did something crazy',
      'time': 'Today at 3:15 PM'
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    fs.writeFileSync(path.join(process.cwd(), 'src', 'script.json'), JSON.stringify(data.messages, null, 2));

    history.push({
      date: new Date().toISOString(),
      title: data.title,
      messages: data.messages
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

    console.log('Successfully generated authentic 6-beat Beluga script!');
    console.log('Title: ' + data.title);
    console.log('Message Count: ' + data.messages.length);
    return data;
  } catch (e) {
    console.error('Failed to generate script:', e);
    throw e;
  }
}

if (process.argv[1] && process.argv[1].endsWith('generateScript.js')) {
  generateScript();
}
