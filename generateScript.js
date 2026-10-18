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
  console.log('Generating elite viral Beluga Shorts script from master 4-archetype library...');
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

  const pastTitles = history.map(h => h.title).slice(-25).join(', ');

  const prompt = `
You are the elite viral comedy scriptwriter for the legendary Beluga YouTube channel (10M+ subscribers).
Your videos get millions of views because of RAPID-FIRE PACING, DEADPAN LOGIC, HIGH STAKES, SHOCKING ESCALATIONS, and LOOPBACK PUNCHLINES.

STUDY THESE 4 MASTERPIECE SCRIPTS (YOUR GOLD STANDARD):

=== MASTERPIECE 1: THE ACCIDENTAL WINDFALL / SERVER DEAL ===
Title: The Beluga Who Accidentally Became A Millionaire 💀 #shorts
[0:00-0:04 | HOOK]
1. Beluga: 'guys i just became a millionaire'
2. Skittle: 'bro your bank account has '
3. Beluga: 'not anymore'
[0:05-0:13 | CURIOSITY]
4. Skittle: 'WHAT DID YOU DO'
5. Beluga: 'i found a wallet'
6. Skittle: 'return it 💀'
7. Beluga: 'i did'
8. Skittle: 'then how are you rich'
9. Beluga: 'the wallet belonged to a billionaire'
[0:14-0:24 | ESCALATION & PROOF]
10. Hecker: 'WAIT'
11. Hecker: 'DID YOU STEAL HIS MONEY'
12. Beluga: 'no'
13. Beluga: 'he gave me  million as a reward'
14. Skittle: 'this is the most unbelievable thing you have ever said'
15. Beluga: 'check my bank account'
16. Skittle: 'BRO ACTUALLY HAS ,000,002'
[0:25-0:38 | TWIST SETUP]
17. Admin: 'Beluga, congratulations!'
18. Beluga: 'thank you admin'
19. Admin: 'now please pay your ,999 server debt'
20. Beluga: 'WHAT DEBT'
21. Admin: 'you accidentally bought the entire server yesterday'
[0:39-0:53 | CHAOS & PAYOFF]
22. Skittle: 'WAIT'
23. Skittle: 'YOU OWN THE SERVER?'
24. Beluga: 'technically'
25. Hecker: 'THEN MAKE ME ADMIN'
26. Beluga: 'done'
27. Hecker: 'LET US GOOOO'
28. Admin: 'Beluga, you have been banned for abusing administrator privileges'
[0:54-0:59 | FINAL PUNCHLINE]
29. Beluga: 'guys'
30. Beluga: 'i just became a millionaire again'
31. Skittle: 'HOW'
32. Beluga: 'i sold the server'
33. Hecker: 'TO WHO'
34. Beluga: 'the billionaire'

=== MASTERPIECE 2: ACCIDENTAL AGENCY HACK ===
Title: Beluga Accidentally Hacked NASA 💀 #shorts
1. Beluga: 'guys i just hacked nasa'
2. Skittle: 'bro can not even hack his school wifi'
3. Beluga: 'watch this'
4. Beluga: 'i typed "password"'
5. Skittle: 'into what'
6. Beluga: 'nasa'
7. Skittle: 'THAT IS NOT HOW HACKING WORKS'
8. Beluga: 'it worked'
9. Hecker: 'WAIT'
10. Hecker: 'WHY IS NASA CALLING YOU'
11. Beluga: 'they want me to fix something'
12. Skittle: 'WHAT DID YOU BREAK'
13. Beluga: 'nothing'
14. Beluga: 'their printer was offline'
15. NASA: 'Hello, Beluga. Thank you for restoring our printer.'
16. Beluga: 'no problem'
17. NASA: 'Your reward is ,000.'
18. Skittle: 'BRO IS ACTUALLY A GENIUS'
19. Hecker: 'GIVE HIM ADMIN'
20. Beluga: 'guys'
21. Beluga: 'i just got another email'
22. Skittle: 'WHAT NOW'
23. Beluga: 'nasa wants me to print something'
24. Hecker: 'WHAT'
25. Beluga: '10,000 copies of my school homework'
26. Skittle: 'WHY'
27. Beluga: 'they said it is classified'
28. NASA: 'Beluga, the printer has completed your request.'
29. Beluga: 'nice'
30. NASA: 'Unfortunately, you printed 10,000 copies of your detention notice.'
31. Skittle: 'BRO HACKED HIMSELF'
32. Beluga: 'guys'
33. Beluga: 'i think nasa is my school'

=== MASTERPIECE 3: INSANE ABSURD CHAOS / GLOBAL SCALE ===
Title: Beluga Deleted The Moon 💀 #shorts
1. Beluga: 'guys i deleted the moon'
2. Skittle: 'bro WHAT'
3. Beluga: 'it was taking up too much storage'
4. Skittle: 'HOW DO YOU DELETE THE MOON'
5. Beluga: 'i clicked "remove device"'
6. Hecker: 'ON WHAT'
7. Beluga: 'the moon'
8. Hecker: 'WHY WAS THE MOON A DEVICE 💀'
9. NASA: 'WHO DELETED OUR MOON'
10. Beluga: 'me'
11. NASA: 'RESTORE IT IMMEDIATELY'
12. Beluga: 'there is no undo button'
13. NASA: 'WHAT DO YOU MEAN THERE IS NO UNDO BUTTON'
14. Beluga: 'it said "permanently remove"'
15. Skittle: 'BRO THE OCEANS ARE LEAVING'
16. Hecker: 'WHY IS THE TIDE IN MY BEDROOM'
17. Beluga: 'guys i found a backup'
18. NASA: 'RESTORE IT'
19. Beluga: 'restoring...'
20. Beluga: 'moon restored'
21. Skittle: 'THANK GOD'
22. NASA: 'WAIT'
23. NASA: 'WHY IS IT 17 TIMES BIGGER'
24. Beluga: 'i restored the premium version'
25. Hecker: 'THE PREMIUM VERSION OF THE MOON???'
26. NASA: 'BELUGA, THE MOON IS CRASHING INTO EARTH'
27. Beluga: 'guys do not worry'
28. Beluga: 'i found the uninstall button'
29. Skittle: 'DO NOT YOU DARE'
30. Beluga: 'too late'
31. SYSTEM: 'Earth has been successfully removed.'
32. Beluga: 'guys'
33. Beluga: 'where did everybody go'

=== MASTERPIECE 4: FALSE ALARM / PANIC & BLUNDER ===
Title: Beluga Accidentally Started World War 3 💀 #shorts
1. Beluga: 'guys'
2. Beluga: 'i think hawaii is getting nuked'
3. Skittle: 'BRO WHAT'
4. Beluga: 'my phone just said ballistic missile incoming'
5. Hecker: 'EVERYBODY GET IN THE BASEMENT'
6. Skittle: 'WE DO NOT HAVE A BASEMENT'
7. Hecker: 'THEN GET IN THE BATHROOM'
8. Beluga: 'guys i have a plan'
9. Skittle: 'WHAT PLAN'
10. Beluga: 'i am going to ask google'
11. Beluga: 'google is the missile coming'
12. Google: 'I am sorry, I do not understand.'
13. Beluga: 'EVEN GOOGLE DOES NOT KNOW'
14. Hecker: 'WE ARE DOOMED'
15. Skittle: 'WAIT'
16. Skittle: 'THE GOVERNMENT JUST SAID IT WAS A MISTAKE'
17. Beluga: 'what mistake'
18. Skittle: 'SOMEONE CLICKED THE WRONG BUTTON'
19. Hecker: 'YOU ARE TELLING ME'
20. Hecker: 'THE APOCALYPSE WAS A TYPO'
21. Beluga: 'guys'
22. Beluga: 'i just clicked something too'
23. Skittle: 'WHAT DID YOU CLICK'
24. Beluga: '"send to all"'
25. Admin: 'BELUGA'
26. Admin: 'WHY DID EVERYONE RECEIVE A MESSAGE SAYING "THE MISSILE IS COMING"'
27. Beluga: 'i was testing the notification system'
28. Skittle: 'BRO TEST IT ON YOURSELF'
29. Beluga: 'i did'
30. Beluga: 'but i was lonely'
31. Admin: 'YOU ARE BANNED'
32. Beluga: 'guys'
33. Beluga: 'at least the missile did not come'
34. Hecker: 'IT WAS NEVER COMING'

---

### CORE VIRAL PRINCIPLES (MANDATORY):
1. **ULTRA-SHORT SENTENCES**: 
   - 70% of lines must be 1 to 4 words ('WAIT', 'no', 'i did', 'done', 'HOW', 'TO WHO', 'technically', 'WHAT NOW').
   - Maximum 7-8 words on longer reveal lines. NEVER write long sentences.
2. **THE 6-BEAT NARRATIVE ARC**:
   - Beat 1 (0:00-0:04 | Hook): Unbelievable claim or situation right in message 1.
   - Beat 2 (0:05-0:14 | Curiosity): Rapid-fire 1-2 word interrogations with Skittle.
   - Beat 3 (0:15-0:25 | Escalation & Proof): Impossible reality confirmed by third party, bank, or scan.
   - Beat 4 (0:26-0:38 | The Twist / Catch): Authority figure joins with catastrophic debt, threat, or consequence.
   - Beat 5 (0:39-0:53 | Chaos / Backfire): Hasty desperate solution causes instant panic or ban.
   - Beat 6 (0:54-0:59 | Loopback Punchline): Beluga deadpans a solution that loops right back to the original premise or cuts to black.
3. **PACING**: Exactly 25 to 34 rapid-fire lines total.
4. **SHOUTING & EMOJIS**:
   - Use ALL CAPS for shock, screaming, and panic ('BRO WHAT', 'DO NOT YOU DARE', 'WHAT DID YOU DO').
   - Use awkward emojis (💀, 😳, 🥺, <3) sparingly at emotional peaks.
5. **ALLOWED CHARACTERS ONLY (The 12 Core Archetypes)**:
   - 'Beluga' (chaotic, deadpan main cat)
   - 'Skittle' (skeptical best friend kitten)
   - 'Hecker' (elite hacker Floppa cat)
   - 'Admin' (pompous Discord server owner cat with gold crown)
   - 'AI' (rogue sentient cyber cat with glowing visor)
   - 'Billionaire' (eccentric wealthy cat/mogul)
   - 'NASA' (NASA astronaut cat in space suit)
   - 'Google' (Google AI Assistant)
   - 'SYSTEM' (Discord automated system bot)
   - 'Mr. Smith' (strict school teacher)
   - 'Mom' (furious mother)
   - 'Girlfriend' (suspicious partner asking trap questions)
   - 'Pablo' (shady Discord moderator)
6. **FRESH VIRAL TOPIC**: Pick an original, unexpected, high-curiosity dilemma following one of the 4 archetypes above.
7. **AVOID PAST TITLES**: [${pastTitles || 'None yet'}]

Return in this exact JSON structure:
{
  'title': 'Viral YouTube Shorts Title with Emojis',
  'messages': [
    {
      'id': 1,
      'author': 'Beluga',
      'content': 'Message content',
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

    console.log('Successfully generated authentic Beluga script from 4-archetype library!');
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
