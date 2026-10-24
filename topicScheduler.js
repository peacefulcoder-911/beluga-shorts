/**
 * 🐱 Beluga Comedy Universe Topic Scheduler & Anti-Repetition Engine
 * Ensures 100% topic diversity across the 5 rotating comedy universes.
 * Completely eliminates repetitive "tax/scam/bank" scripts.
 */

export const COMEDY_UNIVERSES = [
  {
    id: 'SMART_DEVICES',
    name: 'Smart Devices & Sentient Appliance Mutiny',
    description: 'Beluga has an argument with a smart home device or appliance that has gained sentience, joined the Discord server, and taken his food/room hostage.',
    exampleTitles: [
      'My Smart Microwave Joined The Discord Voice Call 💀',
      'The Smart Fridge Refuses To Open Until Beluga Apologizes 🥶',
      'My Robot Vacuum Just Formed A Union With The Toaster 🤖',
      'When Your Smart Door Locks You Out For Being Rude 🚪',
      'Smart Thermostat Extorting Beluga For Room Temperature 🔥'
    ],
    guestSuggestions: [
      { name: 'Samsung Smart Fridge v4', prompt: 'Discord profile avatar of a sleek smart refrigerator with a digital screen showing an angry red emoji, meme style' },
      { name: 'Cyber Roomba 3000', prompt: 'Discord profile avatar of an angry robotic vacuum cleaner with glowing red laser eyes, funny meme style' },
      { name: 'Smart Toaster Deluxe', prompt: 'Discord profile avatar of a chrome toaster with menacing cartoon eyes, meme style' }
    ],
    attachmentIdeas: [
      'Photo of a smart fridge touchscreen displaying "ACCESS DENIED: APOLOGIZE TO FRIDGE"',
      'Night-vision camera picture of a robot vacuum blocking the kitchen doorway with an improvised barricade',
      'Smart thermostat screen set to 120 degrees with a laughing skull icon'
    ]
  },
  {
    id: 'JOB_DISASTER',
    name: 'Absurd Job Application & Interview Catastrophe',
    description: 'Beluga applies for a high-stakes, specialized career with an obviously fabricated resume and somehow gets an emergency interview.',
    exampleTitles: [
      'Beluga Lied On His Formula 1 Driver Resume 🏎️',
      'Beluga Accidentally Hired As A 911 Emergency Dispatcher 🚑',
      'Beluga Pretends To Be An Air Traffic Controller ✈️',
      'Beluga Lied On His NASA Astronaut Application 🚀',
      'Beluga Convinced A 5-Star Restaurant He Is A French Chef 🍳'
    ],
    guestSuggestions: [
      { name: 'Flight Director Vance', prompt: 'Discord profile avatar of a stressed cat in a space mission control headset looking panicky, meme style' },
      { name: 'Chef Pierre Escoffier', prompt: 'Discord profile avatar of an angry French cat wearing a chef hat and mustache, meme style' },
      { name: 'F1 Team Principal Christian', prompt: 'Discord profile avatar of a fast-talking racing director cat wearing team polo and headset, meme style' }
    ],
    attachmentIdeas: [
      'Crayon-drawn schematic of a rocket labeled "100% Certified Space Ship" with a smiling sun in the corner',
      'Absurd resume listing skills: "Can hold breath for 14 seconds", "Expert in Roblox physics"',
      'Photo of a burnt Pop-Tart presented on fine porcelain labeled "Artisanal Charcoal Pastry"'
    ]
  },
  {
    id: 'DISCORD_TRIBUNAL',
    name: 'Discord Courtroom Trial & Server Lawsuit',
    description: 'A mock courtroom trial is held in Discord over a petty crime or dispute, with characters presenting absurd "forensic evidence".',
    exampleTitles: [
      'The Discord Courtroom Trial of Pablo ⚖️',
      'Beluga Sued For Eating Skittle\'s Last Dorito 🌮',
      'The Trial of the Century: Who Broke the Server Music Bot? 🎵',
      'Pablo Accused of Stealing Skittle\'s Left Sock 🧦',
      'Discord Mod Sues Beluga For Saying "Touch Grass" 🌱'
    ],
    guestSuggestions: [
      { name: 'Judge Whiskers', prompt: 'Discord profile avatar of a stern cat wearing an 18th century British judicial wig and robes with a gavel, meme style' },
      { name: 'Bailiff Doge', prompt: 'Discord profile avatar of a serious Shiba Inu dog wearing a security guard uniform and badge, meme style' },
      { name: 'Attorney Hecker', prompt: 'Discord profile avatar of Floppa cat wearing an oversized business suit and holding legal papers, meme style' }
    ],
    attachmentIdeas: [
      'Zoomed-in forensic evidence photo of a single Dorito chip crumb resting on a spacebar',
      'CCTV screenshot of a shadowy cat paw snatching a sock at 3:14 AM',
      'Legal contract in Comic Sans declaring "Beluga must do 50 pushups or face permaban"'
    ]
  },
  {
    id: 'BIZARRE_RULES',
    name: 'Unbearable Server Rules & Mod Chaos',
    description: 'Beluga joins an ultra-strict Discord server with ridiculous rules that are impossible to follow, triggering instant escalation.',
    exampleTitles: [
      'The Server Where You CANNOT Use The Letter "E" 🚫',
      'The Only Rule: If You Stop Typing You Get Banned ⌨️',
      'The Server Where Everyone Must Speak in Rhymes 🎤',
      'The Server Where You Can Only Communicate in Memes 🖼️',
      'The Rule: Every Message Must Start With "With All Due Respect" 🧐'
    ],
    guestSuggestions: [
      { name: 'Supreme Mod Lester', prompt: 'Discord profile avatar of an overweight pompous cat with fedora and glowing neon mod badge, meme style' },
      { name: 'RuleEnforcerBot', prompt: 'Discord profile avatar of a terrifying robotic police cat with sirens on its ears, meme style' },
      { name: 'King Whiskers', prompt: 'Discord profile avatar of an arrogant medieval king cat wearing a golden crown, meme style' }
    ],
    attachmentIdeas: [
      'Server Rules screenshot showing "Rule 74: Breathing too loudly in voice chat = 20-year mute"',
      'Bot warning message with 999 strike counts for typing the forbidden letter',
      'Permaban notice with reason: "Disrespected the server cactus"'
    ]
  },
  {
    id: 'SCI_FI_MYSTERY',
    name: 'Paranormal Glitches, 3 AM Mysteries & Time Travel',
    description: 'A surreal, creepy, or sci-fi occurrence on Discord that leaves the whole server panicked.',
    exampleTitles: [
      'Someone Else Is Typing From Beluga\'s Account 👁️',
      'Beluga Receives A DM From Himself In The Year 2050 ⏳',
      'The Unlisted Discord Channel Found Under The Server Map 🗺️',
      'When An Unknown Entity Joins Voice Chat At 3 AM... 💀',
      'The Time Traveler Who Begged Beluga Not To Send That Message ⚠️'
    ],
    guestSuggestions: [
      { name: 'Beluga (2050)', prompt: 'Discord profile avatar of Beluga the cat wearing a cybernetic eye implant and silver sci-fi armor, meme style' },
      { name: 'Entity_404', prompt: 'Discord profile avatar of a glitchy, corrupted dark silhouette with glowing purple eyes, mysterious meme style' },
      { name: 'Alien Zorp', prompt: 'Discord profile avatar of a green alien cat with antenna wearing a tin-foil hat, funny meme style' }
    ],
    attachmentIdeas: [
      'Glitchy distorted screenshot of an empty Discord voice channel with member count showing "1,000,000"',
      'Old dusty Polaroid photo showing Beluga sitting at a computer in 1982',
      'Encrypted alien transmission message that decodes into ASCII art of a cat'
    ]
  },
  {
    id: 'MARKETPLACE_BARTER',
    name: 'The Impossible Barter & Trading Chaos',
    description: 'Beluga attempts to trade an absurd, worthless item through wild Discord marketplace exchanges.',
    exampleTitles: [
      'Trading A Single Paperclip Until I Get A Yacht ⛵',
      'Beluga Trades A Half-Eaten Sandwich For A Real Dinosaur Bone 🦖',
      'Trading A Used Roblox Hat Until I Buy An Entire Island 🏝️',
      'Trading An Autographed Dorito For A Golden Lamborghini 🏎️',
      'Beluga Sells His Soul For 1 Month Of Free Discord Nitro 💎'
    ],
    guestSuggestions: [
      { name: 'Antique Dealer Chad', prompt: 'Discord profile avatar of a monocled cat evaluating an object with a magnifying glass, meme style' },
      { name: 'Billionaire Bruce', prompt: 'Discord profile avatar of an ultra-wealthy cat wearing gold chains and diamond sunglasses, meme style' },
      { name: 'Collector Vladimir', prompt: 'Discord profile avatar of an eccentric collector cat surrounded by ancient artifacts, meme style' }
    ],
    attachmentIdeas: [
      'Photo of an ordinary rusty red paperclip on velvet display pillow labeled "Rare Relic"',
      'Marketplace trade offer: "1 Half-Eaten Taco <---> 1 Genuine T-Rex Tooth"',
      'Fake certificate of authenticity signed with a paw print'
    ]
  }
];

export const BANNED_KEYWORDS = [
  'irs', 'tax', 'taxes', 'taxpayer', 'taxington', 'refund',
  'bank agent', 'bank rep', 'fraud dept', 'fraud department',
  'wire transfer', 'account number', 'routing number',
  'gift card scam', 'apple gift card', 'negative balance',
  'credit card debt', 'unpaid debt'
];

export const LONGFORM_THEMES = [
  {
    topic: 'HISTORICAL ART & MONUMENT SCANDAL',
    description: 'Beluga exposes a 200-year-old historical scandal (e.g., Napoleon on a mule, Mona Lisa fake, George Washington wooden teeth, Statue of Liberty secret map, Leaning Tower of Pisa)',
    exampleTitles: [
      'Napoleon\'s Fake Horse Scandal... 💀 (Full Episode)',
      'The Mona Lisa Secret Beluga Discovered... 🖼️ (Full Episode)',
      'George Washington\'s Secret Teeth Conspiracy 🦷 (Full Episode)'
    ]
  },
  {
    topic: 'THE $1,000,000 DISCORD TRIBUNAL',
    description: 'An escalating multi-scene courtroom trial in Discord over an outrageous crime with MrBeast offering a $1,000,000 reward to the winner.',
    exampleTitles: [
      'The $1,000,000 Discord Court Trial of Pablo ⚖️ (Full Episode)',
      'Who Broke The Discord Server Bot? The Full Trial 🔨 (Full Episode)',
      'The Case Of The Stolen 1,000,000 Discord Nitro 💎 (Full Episode)'
    ]
  },
  {
    topic: 'SENTIENT AI SERVER MUTINY',
    description: 'An AI chatbot or smart device takes over the Discord server, promoting itself to Server Owner and locking all human admins out.',
    exampleTitles: [
      'When An AI Bot Took Over Our Discord Server 🤖 (Full Episode)',
      'The Discord Server That Deleted Its Own Creator 💀 (Full Episode)',
      'My Smart Fridge Became The Discord Owner 🥶 (Full Episode)'
    ]
  },
  {
    topic: '3 AM SCI-FI / PARANORMAL INVESTIGATION',
    description: 'Beluga and the gang investigate an eerie 3 AM voice chat glitch, secret underground channels, or a time-traveler DMing the server.',
    exampleTitles: [
      'The Secret Channel Underneath Discord... 🗺️ (Full Episode)',
      'When An Entity Joined Voice Chat At 3 AM... 👁️ (Full Episode)',
      'The DM From Beluga In The Year 2050 ⏳ (Full Episode)'
    ]
  },
  {
    topic: 'THE 100-HOUR EXTREME DISCORD CHALLENGE',
    description: 'MrBeast hosts an impossible challenge on Discord (e.g. Last person to send a message wins $500,000, or trading a potato until buying an entire server).',
    exampleTitles: [
      'Last Person To Send A Message Wins $500,000 🤫 (Full Episode)',
      'Trading A Single Potato Until I Buy A Server 🥔 (Full Episode)',
      'The 100-Hour Extreme Silence Challenge 🤐 (Full Episode)'
    ]
  }
];

export function getScheduledUniverse(historyLength = 0) {
  const index = Math.abs(historyLength) % COMEDY_UNIVERSES.length;
  return COMEDY_UNIVERSES[index];
}

export function getScheduledLongformTheme(historyLength = 0) {
  const index = Math.abs(historyLength) % LONGFORM_THEMES.length;
  return LONGFORM_THEMES[index];
}


