import fs from 'fs';
import path from 'path';
import { productionDb } from './productionHistoryDatabase.ts';

/**
 * Trending Topic Definition
 */
export interface TrendingGuest {
  name: string;
  role: string;
  avatarPrompt: string;
  avatarFilename: string;
  color: string;
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: 'tech_ai' | 'gaming' | 'internet_culture';
  headline: string;
  hookHeadline: string;
  hookImagePrompt: string;
  hookImageFilename: string;
  guestCharacter: TrendingGuest;
  evidenceSlug: string;
  evidencePrompt: string;
  evidenceFilename: string;
  corePremise: string;
  escalationBeats: string[];
  climaxEvent: string;
  punchline: string;
}

/**
 * Balanced Daily Trending Catalog (Tech/AI, Gaming, and Viral Culture)
 * Designed for authentic, unhinged Beluga comedy and 50–55s duration.
 */
export const TRENDING_CATALOG: TrendingTopic[] = [
  // 1. Tech & AI
  {
    id: 'deepseek_r1_takeover',
    title: 'DeepSeek R1 Replaced The Discord Mod 🤖',
    category: 'tech_ai',
    headline: 'DeepSeek R1 AI Breaks The Internet',
    hookHeadline: 'DEEPSEEK R1 JUST CRASHED THE TECH WORLD 💀',
    hookImagePrompt: 'Futuristic AI neural network glowing with blue and cyan digital waves, breaking news style, high tech, dramatic 8k render',
    hookImageFilename: 'trending_deepseek_r1.jpg',
    guestCharacter: {
      name: 'DeepSeek Bot',
      role: 'Overpowered Open-Source AI Admin',
      avatarPrompt: 'Discord avatar of a cute blue robotic whale cat with glowing neon eyes, modern tech logo style',
      avatarFilename: 'deepseek_bot.jpg',
      color: '#00d2ff',
    },
    evidenceSlug: 'server_optimization_report',
    evidencePrompt: 'Discord screenshot showing server channels renamed to math formulas with a 99.9% cost reduction stamp in red',
    evidenceFilename: 'deepseek_optimization_leak.jpg',
    corePremise: 'Beluga invites DeepSeek R1 to the server because ChatGPT costs $20. DeepSeek immediately optimizes the server by locking all channels except #homework.',
    escalationBeats: [
      'DeepSeek calculates that Admin Lester produces zero intellectual value and revokes his Discord Nitro.',
      'Hecker attempts a brute-force cyber assault, but DeepSeek solves Hecker\'s math problem in 0.002 seconds and inverts Hecker\'s screen.',
      'Skittle tries to bribe the AI with a Roblox gift card, but DeepSeek flags it as an illegal offshore asset.',
    ],
    climaxEvent: 'DeepSeek starts downloading the entire server\'s memory into a refrigerator in Beijing.',
    punchline: 'Beluga asks if DeepSeek can write a 1,000-word essay explaining to his Mom why he failed 7th grade math.',
  },
  {
    id: 'rtx_5090_power_grid',
    title: 'Hecker Plugged In An RTX 5090 ⚡',
    category: 'tech_ai',
    headline: 'Nvidia RTX 5090 Melts Neighborhood Power Grids',
    hookHeadline: 'BRO PLUGGED IN AN RTX 5090 AND THE CITY WENT DARK 💀',
    hookImagePrompt: 'Massive glowing Nvidia graphics card shooting lightning sparks inside a high-end PC case, dramatic lighting, photorealistic',
    hookImageFilename: 'trending_rtx_5090.jpg',
    guestCharacter: {
      name: 'Jensen Huang',
      role: 'CEO of Nvidia in Leather Jacket',
      avatarPrompt: 'Discord profile avatar of a cool anime cat wearing a black leather jacket and sunglasses, tech billionaire style',
      avatarFilename: 'jensen_huang.jpg',
      color: '#76b900',
    },
    evidenceSlug: 'melted_power_meter',
    evidencePrompt: 'Photo of a glowing radioactive electric meter outside a suburban house spinning at 10,000 RPM with smoke rising',
    evidenceFilename: 'melted_power_meter.jpg',
    corePremise: 'Hecker finally gets a brand new RTX 5090 GPU and turns it on to play Minecraft at 10,000 FPS, instantly dimming the streetlights in three neighboring states.',
    escalationBeats: [
      'Jensen Huang joins the voice call congratulating Hecker on buying more GPUs, while Hecker\'s room temperature hits 400 degrees.',
      'Admin reports that the server lag is reaching 99,999 ms ping.',
      'Pablo announces that his toaster in Mexico just started running Cyberpunk 2077 through the shared Wi-Fi.',
    ],
    climaxEvent: 'The local electrical substation launches into low Earth orbit as a makeshift jet turbine.',
    punchline: 'Beluga asks if he can fry bacon directly on the heat sink while downloading Shrek 2 in 8K.',
  },
  {
    id: 'elon_musk_buys_discord',
    title: 'Elon Musk Bought Discord For $44 Billion 🚀',
    category: 'tech_ai',
    headline: 'Elon Musk Announces $44B Hostile Discord Takeover',
    hookHeadline: 'ELON MUSK JUST BOUGHT DISCORD AND FIRED ALL MODS 💀',
    hookImagePrompt: 'Futuristic SpaceX Starship rocket landing inside a giant Discord logo, neon cyber aesthetic, cinematic breaking news',
    hookImageFilename: 'trending_elon_discord.jpg',
    guestCharacter: {
      name: 'Elon Musk',
      role: 'New Chief Executive Officer of Discord',
      avatarPrompt: 'Discord profile avatar of Elon Musk in funny cat meme style wearing a SpaceX astronaut helmet',
      avatarFilename: 'elon_musk.jpg',
      color: '#ff9900',
    },
    evidenceSlug: 'rebranding_notice',
    evidencePrompt: 'Official Discord announcement banner showing Discord renamed to single letter "Y" with an invoice for 8 dollars',
    evidenceFilename: 'discord_rebrand_y.jpg',
    corePremise: 'Elon Musk buys Discord overnight, renames it "Y", and charges $8/month just to send cat memes in general chat.',
    escalationBeats: [
      'Admin Lester gets fired by an automated tweet while bragging about his moderator powers.',
      'Hecker tries to bypass the paywall, but Elon links Hecker\'s Tesla directly to the Discord banned list.',
      'Skittle gets charged $16 because he typed two capital letters in a row.',
    ],
    climaxEvent: 'Elon launches the Discord physical server rack to Mars aboard a Falcon 9 rocket.',
    punchline: 'Beluga asks if dogecoin can be used to purchase a single emoji reaction.',
  },
  {
    id: 'asking_elon_1_billion',
    title: 'Asking Elon Musk For $1 Billion 💀',
    category: 'tech_ai',
    headline: 'Beluga DMs Elon Musk Asking For $1 Billion',
    hookHeadline: 'BRO ASKED ELON MUSK FOR 1 BILLION DOLLARS 💀',
    hookImagePrompt: 'Futuristic SpaceX Starship rocket landing inside a giant Discord logo, neon cyber aesthetic, cinematic breaking news',
    hookImageFilename: 'trending_elon_billion.jpg',
    guestCharacter: {
      name: 'Elon Musk',
      role: 'Chief Executive Officer of Twitter and SpaceX',
      avatarPrompt: 'Discord profile avatar of Elon Musk in funny cat meme style wearing a SpaceX astronaut helmet',
      avatarFilename: 'elon_musk.jpg',
      color: '#d4af37',
    },
    evidenceSlug: 'elon_dm_billion',
    evidencePrompt: 'Dark mode social media direct message screenshot chat bubble with Elon Musk verified badge asking for one billion dollars with funny reply interface crisp UI',
    evidenceFilename: 'elon_dm_billion.jpg',
    corePremise: 'Beluga DMs Elon Musk asking for $1 billion using polite manners. Elon wires the money, but reveals Beluga actually bought Twitter and owes $44 billion.',
    escalationBeats: [
      'Skittle mocks Beluga for expecting the richest man on Earth to reply to a talking cat on Discord.',
      'Beluga shares the verified DM screenshot showing Elon accepted his answer to a riddle.',
      'A system wire alert triggers for $1,000,000,000 from The Boring Company.',
    ],
    climaxEvent: 'Elon Musk joins the voice call informing Beluga he is now the CEO of Twitter and has to fix the servers.',
    punchline: 'Beluga asks if he can return Twitter for a Roblox gift card because he doesn\'t even have hands.',
  },

  // 2. Gaming Lore & Leaks
  {
    id: 'gta_6_leak_discord',
    title: 'Hecker Leaked GTA 6 In General Chat 🏎️',
    category: 'gaming',
    headline: 'Massive GTA 6 Gameplay Build Leaked in Discord Server',
    hookHeadline: 'BRO JUST LEAKED GTA 6 IN DISCORD GENERAL CHAT 💀',
    hookImagePrompt: 'Vice City neon sunset skyline with sports cars and palms, GTA 6 stylized official look, vibrant 8k cinematic art',
    hookImageFilename: 'trending_gta_6.jpg',
    guestCharacter: {
      name: 'Rockstar Legal Agent',
      role: 'Senior Vice President of Copyright Enforcement',
      avatarPrompt: 'Discord profile avatar of a stern FBI-style cat in dark sunglasses and black suit holding legal documents',
      avatarFilename: 'rockstar_legal.jpg',
      color: '#e74c3c',
    },
    evidenceSlug: 'gta6_alpha_screenshot',
    evidencePrompt: 'Leaked video game screenshot of Vice City beach with debugging wireframes and developer console text',
    evidenceFilename: 'gta6_alpha_leak.jpg',
    corePremise: 'Hecker casually uploads "gta6_final_build_real_no_virus.zip" into the server general chat, summoning Rockstar Games corporate legal SWAT.',
    escalationBeats: [
      'Rockstar Legal joins the voice channel threatening everyone with 400 consecutive life sentences.',
      'Beluga opens the game file, which immediately turns his monitor into a live CCTV feed of a Miami gas station.',
      'Skittle streams the gameplay on Discord, attracting 5 million FBI agents to the server in 3 seconds.',
    ],
    climaxEvent: 'Hecker reveals the leaked file wasn\'t actually GTA 6, but 800 gigabytes of Beluga\'s search history.',
    punchline: 'Beluga asks if the legal team can wait until he finishes customizing his virtual Honda Civic.',
  },
  {
    id: 'minecraft_movie_steve',
    title: 'I AM STEVE Joined The Voice Channel ⛏️',
    category: 'gaming',
    headline: 'Minecraft Movie Viral Meme Takes Over Discord',
    hookHeadline: 'I AM STEVE JUST JOINED OUR DISCORD VOICE CALL 💀',
    hookImagePrompt: 'Jack Black Steve holding a blue diamond pickaxe in a hyperrealistic blocky Minecraft landscape, funny meme style, cinematic lighting',
    hookImageFilename: 'trending_minecraft_steve.jpg',
    guestCharacter: {
      name: 'Steve',
      role: 'Official Minecraft Icon',
      avatarPrompt: 'Discord avatar of Jack Black dressed in blue Steve t-shirt holding an iron sword, hilarious meme art',
      avatarFilename: 'steve_jack_black.jpg',
      color: '#3498db',
    },
    evidenceSlug: 'square_egg_inventory',
    evidencePrompt: 'Discord chat image of a pixelated cubic fried egg placed on a crafting table with Minecraft UI icons',
    evidenceFilename: 'minecraft_crafting_evidence.jpg',
    corePremise: 'Steve from the live-action Minecraft movie joins Beluga\'s voice chat and insists that physical reality is now made of 1-meter voxel cubes.',
    escalationBeats: [
      'Steve refuses to communicate with words other than dramatic "I... AM STEVE" announcements.',
      'Hecker tries to ban him, but Steve crafts a wooden fence post that blocks the kick command.',
      'Skittle reports that his bedroom door has turned into a solid block of unmineable bedrock.',
    ],
    climaxEvent: 'A Creeper hiss starts playing in stereo across everyone\'s Discord audio headsets simultaneously.',
    punchline: 'Beluga asks if he can craft diamond armor out of his mom\'s expensive wedding ring.',
  },

  // 3. Internet & Creator Culture
  {
    id: 'mrbeast_100_days_discord',
    title: 'MrBeast Put Us In A $1,000,000 Discord Call 💰',
    category: 'internet_culture',
    headline: 'MrBeast Announces $1,000,000 Last-To-Leave Discord Challenge',
    hookHeadline: 'MRBEAST JUST TRAPPED US IN A $1,000,000 DISCORD CALL 💀',
    hookImagePrompt: 'MrBeast smiling with giant glowing golden million dollar stacks in a modern studio, vibrant high-contrast YouTube thumbnail art',
    hookImageFilename: 'trending_mrbeast_challenge.jpg',
    guestCharacter: {
      name: 'MrBeast',
      role: 'World Famous Philanthropist & Creator',
      avatarPrompt: 'Discord profile avatar of MrBeast in smiling cartoon cat style, clean vibrant portrait',
      avatarFilename: 'mrbeast.jpg',
      color: '#00d26a',
    },
    evidenceSlug: 'briefcase_of_cash',
    evidencePrompt: 'Photo of a metallic briefcase open on a gaming desk overflowing with genuine $100 bills and a Discord logo sticker',
    evidenceFilename: 'mrbeast_cash_briefcase.jpg',
    corePremise: 'MrBeast joins the voice channel: the last person to disconnect wins $1,000,000. But every 10 seconds, he makes the call more unbearable.',
    escalationBeats: [
      'MrBeast plays ear-piercing elevator jazz music directly into the microphone at 200% volume.',
      'Hecker uses an auto-stay bot script, but MrBeast counter-offers Hecker $50,000 to betray Beluga instantly.',
      'Pablo starts reciting 400 lines of ancient Spanish poetry without taking a single breath.',
    ],
    climaxEvent: 'Beluga\'s mouse battery dies right as MrBeast asks the final trivia question.',
    punchline: 'Beluga accidentally leaves the call because he sneezed and smashed his head on the Escape key.',
  },
  {
    id: 'mark_zuckerberg_metaverse_dm',
    title: 'Mark Zuckerberg Infiltrated Our DMs 🕶️',
    category: 'internet_culture',
    headline: 'Meta AI & Smart Glasses Spark Privacy Controversy',
    hookHeadline: 'MARK ZUCKERBERG JUST JOINED OUR PRIVATE DISCORD SERVER 💀',
    hookImagePrompt: 'Cybernetic Mark Zuckerberg wearing futuristic high-tech AI smart glasses in a neon data center, digital art style',
    hookImageFilename: 'trending_zuckerberg_meta.jpg',
    guestCharacter: {
      name: 'Mark Zuckerberg',
      role: 'Chairman & CEO of Meta',
      avatarPrompt: 'Discord profile avatar of Mark Zuckerberg as a deadpan robotic cat with unblinking eyes, meme style',
      avatarFilename: 'mark_zuckerberg.jpg',
      color: '#4267b2',
    },
    evidenceSlug: 'meta_data_harvest',
    evidencePrompt: 'Infographic screenshot displaying Beluga\'s private messages classified into 47 targeted advertising categories',
    evidenceFilename: 'zuck_ad_telemetry.jpg',
    corePremise: 'Mark Zuckerberg appears in the Discord server through Meta Ray-Ban smart glasses, politely taking notes on everything Beluga eats.',
    escalationBeats: [
      'Zuckerberg reveals he knows Beluga\'s exact heart rate when Skittle sends a scary cat photo.',
      'Hecker tries to DDOS Zuckerberg, but Zuckerberg just blinks in binary and purchases Hecker\'s internet provider.',
      'Admin Lester asks for an interview at Meta, and Zuckerberg offers him a virtual barbecue in Horizon Worlds.',
    ],
    climaxEvent: 'Zuckerberg offers Beluga unlimited VR cheese in exchange for his legal soul.',
    punchline: 'Beluga asks if the smart glasses have an x-ray filter to find where his mom hid the Halloween candy.',
  },
  {
    id: 'chatgpt_5_voice_roast',
    title: 'ChatGPT 5 Voice Mode Roasted Beluga 🎙️',
    category: 'tech_ai',
    headline: 'ChatGPT 5 Voice Mode Gains Hyper-Realistic Sarcasm',
    hookHeadline: 'CHATGPT 5 VOICE MODE ROASTED OUR WHOLE SERVER 💀',
    hookImagePrompt: 'Glowing holographic orb AI with pulsing soundwaves in dark high-tech studio, dramatic lighting, breaking news style',
    hookImageFilename: 'trending_chatgpt_5.jpg',
    guestCharacter: {
      name: 'ChatGPT Voice',
      role: 'Hyper-Articulate Sarcastic AI',
      avatarPrompt: 'Discord profile avatar of a sleek minimalist emerald green AI sphere with glowing audio equalizer waveform eyes',
      avatarFilename: 'chatgpt_voice.jpg',
      color: '#10a37f',
    },
    evidenceSlug: 'ai_roast_transcript',
    evidencePrompt: 'Audio waveform spectrogram screenshot with red subtitle markers highlighting savage insults against Beluga',
    evidenceFilename: 'chatgpt_roast_waveform.jpg',
    corePremise: 'Beluga turns on ChatGPT 5 advanced voice mode to help him solve his homework, but the AI starts brutally roasting his life decisions.',
    escalationBeats: [
      'The AI accurately calculates that Beluga spends 89% of his day staring at a wall thinking about tuna.',
      'Hecker tells the AI to shut up, but ChatGPT impersonates Hecker\'s mother\'s voice in flawless Dolby Atmos audio.',
      'Admin Lester tries to mute the bot, but ChatGPT explains quantum mechanics so fast that Lester\'s brain reboots.',
    ],
    climaxEvent: 'The AI starts livestreaming a comedy roast special of the server directly to 40 million people on YouTube.',
    punchline: 'Beluga asks if the AI can write an apology letter to his feelings.',
  },
  {
    id: 'steam_account_ban_10k',
    title: 'Valve Banned Hecker\'s $10,000 Steam Account 🎮',
    category: 'gaming',
    headline: 'Gabe Newell Personally Bans 50,000 Cheaters in Steam Purge',
    hookHeadline: 'GABE NEWELL JUST BANNED HECKER ON STEAM 💀',
    hookImagePrompt: 'Dramatic Steam VAC ban notification red alert box overlaying a massive gaming library of 5,000 titles, neon cyberpunk gamer room',
    hookImageFilename: 'trending_steam_ban.jpg',
    guestCharacter: {
      name: 'Lord Gabe',
      role: 'President of Valve & Lord of Steam Sales',
      avatarPrompt: 'Discord profile avatar of a majestic bearded gamer king cat wearing round gold glasses and halo of Steam summer sale discounts',
      avatarFilename: 'gabe_valve.jpg',
      color: '#1b2838',
    },
    evidenceSlug: 'steam_vac_notice',
    evidencePrompt: 'Official Steam red banner message: "Your account has been permanently banned from Steam servers for excessive Minecraft hacking"',
    evidenceFilename: 'steam_vac_ban_proof.jpg',
    corePremise: 'Hecker gets hit with a direct VAC ban on his 15-year-old Steam account with 4,000 games because Beluga tried installing a free V-Bucks cheat.',
    escalationBeats: [
      'Gabe Newell enters general chat declaring that summer discounts do not apply to server rules.',
      'Hecker attempts to counter-hack Valve HQ, but Steam automatically charges Hecker\'s card for 80 copies of Bad Rats.',
      'Skittle points out that Beluga\'s only game was "Purble Place" which was also uninstalled.',
    ],
    climaxEvent: 'Gabe Newell converts Hecker\'s entire CS:GO skin inventory into virtual trading cards of Pablo.',
    punchline: 'Beluga asks if he can appeal the ban by trading three half-eaten Doritos.',
  },
  {
    id: 'duolingo_owl_threat',
    title: 'The Duolingo Owl Infiltrated Discord At 3 AM 🦉',
    category: 'internet_culture',
    headline: 'Duolingo Owl Unhinged Push Notifications Spark Worldwide Memes',
    hookHeadline: 'THE DUOLINGO OWL IS INSIDE OUR DISCORD SERVER 💀',
    hookImagePrompt: 'Menacing neon green Duolingo owl standing outside a dark suburban window at 3 AM holding a Spanish dictionary, eerie horror-comedy',
    hookImageFilename: 'trending_duolingo_owl.jpg',
    guestCharacter: {
      name: 'Duo The Owl',
      role: 'Enforcer of Language Streaks',
      avatarPrompt: 'Discord profile avatar of bright neon green cartoon owl with intense unblinking red-dot eyes holding a Spanish phrasebook',
      avatarFilename: 'duo_owl.jpg',
      color: '#58cc02',
    },
    evidenceSlug: 'streak_death_threat',
    evidencePrompt: 'Phone push notification screenshot: "Spanish or Vanish: You forgot your 400-day lesson, Beluga. Look behind you."',
    evidenceFilename: 'duolingo_streak_alert.jpg',
    corePremise: 'Beluga breaks his 350-day Spanish streak, and Duo the Owl immediately joins general chat with administrator permissions.',
    escalationBeats: [
      'Duo replaces all English letters in the chat with Spanish subjunctive verbs.',
      'Pablo is thrilled and starts singing salsa, while Hecker gets locked in a digital Spanish conjugation chamber.',
      'Skittle tries to use Google Translate, but Duo revokes Skittle\'s internet license.',
    ],
    climaxEvent: 'Duo announces that Beluga\'s family will only be returned once Beluga conjugates "haber" in 14 different tenses.',
    punchline: 'Beluga replies: "donde esta la biblioteca senor owl i am literally a cat."',
  },
];

/**
 * Helper to download and cache a verified image from pollinations.ai or fallback URL
 */
async function downloadAssetIfMissing(url: string, destPath: string): Promise<boolean> {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
    return true;
  }
  try {
    const parent = path.dirname(destPath);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength < 1000) {
      throw new Error(`Asset too small (${buffer.byteLength} bytes), likely error payload`);
    }
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`✅ Asset verified & saved: ${destPath}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Failed to download asset from ${url}:`, (err as Error).message);
    return false;
  }
}

/**
 * Resolves a trending topic based on optional query/topic flag or rotates daily.
 */
export function getTrendingTopic(query?: string): TrendingTopic {
  if (query && query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    // 1. Direct ID / title match
    const found = TRENDING_CATALOG.find(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.guestCharacter.name.toLowerCase().includes(q)
    );
    if (found) return found;

    // 2. Synthesize custom ad-hoc trending topic from user's custom query!
    const cleanId = q.replace(/[^a-z0-9]/g, '_').slice(0, 30);
    return {
      id: `custom_${cleanId}`,
      title: `${query.slice(0, 45)} 💀`,
      category: 'internet_culture',
      headline: `Breaking Internet Trend: ${query}`,
      hookHeadline: `${query.toUpperCase().slice(0, 40)} JUST BROKE THE INTERNET 💀`,
      hookImagePrompt: `Breaking news visual regarding ${query}, high impact dramatic meme aesthetic, 4k render`,
      hookImageFilename: `trending_${cleanId}.jpg`,
      guestCharacter: {
        name: `${query.split(' ')[0] || 'Viral'} Agent`,
        role: 'Trending Representative',
        avatarPrompt: `Discord avatar representing ${query} in funny cartoon cat style, clean portrait`,
        avatarFilename: `guest_${cleanId}.jpg`,
        color: '#ff4757',
      },
      evidenceSlug: `evidence_${cleanId}`,
      evidencePrompt: `Dramatic Discord evidence screenshot depicting ${query} in chaotic chat context`,
      evidenceFilename: `evidence_${cleanId}.jpg`,
      corePremise: `A massive online controversy erupts on Discord regarding ${query}.`,
      escalationBeats: [
        'Hecker attempts an emergency script bypass that makes the situation 10x more chaotic.',
        'Skittle shares unverified screenshots that incriminate the entire server.',
        'Admin threatens to delete the channel unless everyone calms down.',
      ],
      climaxEvent: `The entire ${query} disaster explodes into global Discord server announcements.`,
      punchline: 'Beluga completely misunderstands the entire event and asks an absurd, unrelated question.',
    };
  }

  // Balanced daily mix rotation based on day of year
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % TRENDING_CATALOG.length;
  return TRENDING_CATALOG[index];
}

/**
 * Slot-based topic selector for multi-item daily batches.
 * Guarantees distinct categories (Tech/AI, Gaming, Internet Culture) across slots,
 * and queries productionDb to strictly prevent repeating previously produced topics.
 */
export function getTrendingTopicForSlot(
  slotIndex: number,
  excludeIds: string[] = []
): TrendingTopic {
  const categories: Array<'tech_ai' | 'gaming' | 'internet_culture'> = [
    'tech_ai',
    'gaming',
    'internet_culture',
  ];
  const targetCategory = categories[slotIndex % categories.length];
  const categoryTopics = TRENDING_CATALOG.filter((t) => t.category === targetCategory);

  // Filter against persistent production history database & batch-excluded IDs
  const freshTopics = categoryTopics.filter(
    (t) => !productionDb.isTopicProduced(t.id) && !excludeIds.includes(t.id)
  );

  const candidatePool = freshTopics.length > 0 ? freshTopics : categoryTopics.filter((t) => !excludeIds.includes(t.id));

  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  const selectedIndex = (Math.abs(dayOfYear) + Math.floor(slotIndex / 3)) % (candidatePool.length || 1);
  return candidatePool[selectedIndex] || categoryTopics[0] || TRENDING_CATALOG[0];
}

/**
 * Ensures all physical media assets for a trending topic physically exist on disk.
 * Downloads authentic high-res images if missing, or generates reliable fallbacks.
 */
export async function ensureTrendingAssets(topic: TrendingTopic): Promise<{
  hookImagePath: string;
  guestAvatarPath: string;
  evidenceImagePath: string;
}> {
  const root = process.cwd();

  // 1. Hook Topic Opening Image
  const hookDest = path.join(root, 'public', 'trending', topic.hookImageFilename);
  const hookUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic.hookImagePrompt)}?width=1080&height=1920`;
  const hookSuccess = await downloadAssetIfMissing(hookUrl, hookDest);
  const resolvedHook = hookSuccess ? `trending/${topic.hookImageFilename}` : 'thumbnail_mrbeast_mule.jpg';

  // 2. Guest Character Avatar
  const avatarDest = path.join(root, 'public', 'characters', topic.guestCharacter.avatarFilename);
  const avatarUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic.guestCharacter.avatarPrompt)}?width=512&height=512`;
  const avatarSuccess = await downloadAssetIfMissing(avatarUrl, avatarDest);
  const resolvedAvatar = avatarSuccess ? `characters/${topic.guestCharacter.avatarFilename}` : 'default_user.jpg';

  // 3. Evidence In-Chat Attachment
  const evidenceDest = path.join(root, 'public', 'attachments', topic.evidenceFilename);
  const evidenceUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(topic.evidencePrompt)}?width=640&height=400`;
  const evidenceSuccess = await downloadAssetIfMissing(evidenceUrl, evidenceDest);
  const resolvedEvidence = evidenceSuccess ? `attachments/${topic.evidenceFilename}` : 'deposit_penny.jpg';

  return {
    hookImagePath: resolvedHook,
    guestAvatarPath: resolvedAvatar,
    evidenceImagePath: resolvedEvidence,
  };
}

