/**
 * Discord Comedy Studio 2.0 - Story Engine & Prompt Modernization
 * 
 * Provides story-first narrative construction, character-specific voice enforcement,
 * dynamic multi-scene generation, explicit audio cue emission, dynamic hook cards,
 * bounded JSON recovery, and contextual anti-repetition.
 */

import { calculateShortsTiming, calculateLongformTiming } from "./timingEngine.ts";
import { isValidAudioCueType } from "./audioRegistry.ts";
import type { StudioScript } from "./types.ts";
import type { TrendingTopic } from "./trendingTopicsEngine.ts";

// ============================================================================
// Types & Contracts
// ============================================================================

export interface StoryOutline {
  hook: string;
  centralSituation: string;
  characterMotivations: Record<string, string>;
  conflict: string;
  escalationStages: string[];
  climax: string;
  payoff: string;
}

export interface HookCardMetadata {
  shouldShowHookCard: boolean;
  headline?: string;
  hookThumbnailUrl?: string;
  hookType?: "image" | "warning" | "alert";
  relevanceReason?: string;
}

export interface CharacterVoiceProfile {
  name: string;
  archetype: string;
  dialogueStyle: string;
  catchphrases: string[];
  forbiddenStyles: string[];
  exampleLines: string[];
}

export interface HistoryItem {
  title?: string;
  archetype?: string;
  storyOutline?: Partial<StoryOutline>;
  newCharacter?: { name: string; avatarPrompt?: string } | null;
  attachment?: { slug?: string; imagePrompt?: string } | null;
  messages?: Array<{ author: string; content: string }>;
  scenes?: number | Array<{ channelName?: string; messages?: Array<{ author: string; content: string }> }>;
}

export interface GenerationAntiRepetitionContext {
  recentTitles: string[];
  recentPremises: string[];
  recentPunchlines: string[];
  recentGuestNames: string[];
  recentChannels: string[];
}

// ============================================================================
// Character Voice Registry
// ============================================================================

export const CHARACTER_VOICE_REGISTRY: Record<string, CharacterVoiceProfile> = {
  beluga: {
    name: "Beluga",
    archetype: "Innocent, chaotic, literal-minded protagonist cat",
    dialogueStyle:
      "Deadpan literalism. Interprets internet slang, technical jargon, and warnings literally. " +
      "Types in casual lowercase for questions/replies, switching to sudden ALL CAPS panic when escalation peaks. " +
      "Never uses sarcasm, irony, or intellectual condescension.",
    catchphrases: [
      "i did",
      "WAIT",
      "technically",
      "no",
      "can i at least finish downloading Shrek 2 first?",
      "BRO WHAT",
      "why are you mad",
      "i made a tiny mistake",
    ],
    forbiddenStyles: [
      "Sarcastic one-liners",
      "Formal academic vocabulary",
      "Explaining jokes to other characters",
    ],
    exampleLines: [
      "i made a tiny mistake",
      "he said clear the cookies so i ate them",
      "technically the microwave was already on fire",
      "WHAT IS HAPPENING",
    ],
  },
  skittle: {
    name: "Skittle",
    archetype: "Sarcastic, intelligent straight-man kitten",
    dialogueStyle:
      "Exasperated, hyper-rational voice of reason. Constantly sees the disaster coming, " +
      "begs Beluga to stop typing, questions life choices, and points out painfully obvious red flags.",
    catchphrases: [
      "beluga no",
      "why would you do that",
      "i am begging you to stop",
      "BRO HE IS A SCAMMER",
      "DO NOT CLICK THAT",
      "how are you alive",
    ],
    forbiddenStyles: [
      "Agreeing blindly with Beluga's absurd plans",
      "Acting confused by basic logic",
    ],
    exampleLines: [
      "beluga DO NOT CLICK THAT",
      "why did you give the bot admin privileges",
      "i am begging you with tears in my eyes",
      "how did you accidentally join the FBI voice channel",
    ],
  },
  hecker: {
    name: "Hecker",
    archetype: "Overconfident elite cyber hacker Floppa",
    dialogueStyle:
      "Deadpan, ice-cold confidence. Treats cyber warfare, government mainframes, and quantum physics " +
      "as child's play. Uses brief hacker terms, green-text energy, and solves absurd problems in seconds.",
    catchphrases: [
      "mainframe breached",
      "give me 3 seconds",
      "skill issue",
      "confirmed",
      "i hacked his microwave",
      "he has 10 seconds to apologize",
    ],
    forbiddenStyles: [
      "Panicking or showing fear",
      "Struggling with technical tasks",
      "Writing emotional paragraphs",
    ],
    exampleLines: [
      "mainframe breached. he has 4 seconds.",
      "give me 3 seconds to reroute the satellite",
      "skill issue honestly",
      "i just disabled his house electricity",
    ],
  },
  pablo: {
    name: "Pablo",
    archetype: "Surreal, unpredictable wildcard",
    dialogueStyle:
      "Absurd non-sequiturs, odd theft confessions, surreal broken logic. " +
      "Types short, strange lines that derail serious arguments into pure chaos.",
    catchphrases: [
      "i ate the spacebar",
      "sock is mine now",
      "meow",
      "the beans have spoken",
      "i am inside the walls",
    ],
    forbiddenStyles: [
      "Formal legal arguments",
      "Long coherent explanations",
      "Normal sensible reactions",
    ],
    exampleLines: [
      "i ate the left shift key",
      "your router tastes like blueberries",
      "meow.",
      "i traded the family car for 4 grapes",
    ],
  },
  admin: {
    name: "Admin",
    archetype: "Authoritarian Discord Mod / Lester",
    dialogueStyle:
      "Pompous, self-important, badge-waving mod. Obsessed with server rules, channel cleanliness, " +
      "and ban hammer countdowns. Speaks in aggressive ALL CAPS warnings.",
    catchphrases: [
      "RULE 4 BREACHED",
      "NO MEMES IN GENERAL",
      "YOU HAVE 5 SECONDS TO EXPLAIN",
      "BAN HAMMER ARMED",
      "TIMEOUT INCOMING",
    ],
    forbiddenStyles: [
      "Being relaxed or chill",
      "Admitting fault",
      "Ignoring rule violations",
    ],
    exampleLines: [
      "RULE 7 VIOLATION: BREATHING IN #GENERAL",
      "YOU HAVE 3 SECONDS BEFORE THE PERMABAN",
      "WHO PINGED EVERYONE",
      "THIS IS NOT A DATING SERVER BELUGA",
    ],
  },
  mom: {
    name: "Mom",
    archetype: "Furious mother in Discord chat",
    dialogueStyle:
      "Stern, impatient parental wrath. Demands household chores, questions screen time, " +
      "and threatens to physically pull the internet plug.",
    catchphrases: [
      "BELUGA WHY IS THE MICROWAVE SMOKING",
      "I AM UNPLUGGING THE ROUTER",
      "TAKE OUT THE TRASH NOW",
      "WHO ARE THESE CATS",
    ],
    forbiddenStyles: [
      "Understanding internet memes",
      "Being tech-savvy",
      "Calm polite discussions",
    ],
    exampleLines: [
      "BELUGA UNPLUG THE COMPUTER THIS INSTANT",
      "WHY IS THERE A POLICE HELICOPTER OUTSIDE",
      "DINNER WAS 40 MINUTES AGO",
    ],
  },
  police: {
    name: "Police / Special Agent Miller",
    archetype: "Deadpan federal law enforcement",
    dialogueStyle:
      "Bureaucratic, formal law enforcement commands delivered in Discord text channels. " +
      "Treats internet pranks like national security crises.",
    catchphrases: [
      "STEP AWAY FROM THE KEYBOARD",
      "FEDERAL INVESTIGATION IN PROGRESS",
      "REMAIN SEATED",
      "SURRENDER THE COMPUTER",
    ],
    forbiddenStyles: [
      "Internet slang or LOLs",
      "Emotional outbursts",
    ],
    exampleLines: [
      "STEP AWAY FROM THE KEYBOARD IMMEDIATELY.",
      "THIS SERVER IS NOW FEDERAL PROPERTY.",
      "WE HAVE LOCATED THE MISSING MICROWAVE.",
    ],
  },
  elon_musk: {
    name: "Elon Musk",
    archetype: "Eccentric tech billionaire memelord CEO",
    dialogueStyle:
      "Deadpan, tech-eccentric, laconic, and authoritative. Speaks in short, cryptic one-liners " +
      "('Concerning.', 'Looking into this.', 'Fate loves irony.') mixed with sudden absurd corporate mandates " +
      "like charging $8 for emojis, buying Twitter by accident, or sending servers to Mars. " +
      "Participates for 2-3 distinct dialogue messages in his signature real-world style.",
    catchphrases: [
      "Concerning.",
      "Looking into this.",
      "Fate loves irony.",
      "Will accept Dogecoin.",
      "Hardcore software engineering starts now.",
      "First principles thinking.",
      "Maximum fun is the goal.",
    ],
    forbiddenStyles: [
      "Generic customer service bot replies",
      "Panicking or screaming in all caps",
      "Long bureaucratic legal paragraphs",
    ],
    exampleLines: [
      "Concerning.",
      "You did not receive a donation, Beluga. You just bought Twitter.",
      "No. Hardcore engineering begins now. Fix the servers.",
    ],
  },
};

// ============================================================================
// JSON Recovery & Sanitization
// ============================================================================

/**
 * Bounded JSON recovery parser.
 * Removes markdown code fences, leading/trailing commentary, cleans up trailing
 * commas, and safely extracts JSON structures from LLM responses.
 */
export function cleanAndParseJson<T = unknown>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Cannot parse empty or non-string LLM response.");
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences (```json ... ``` or ``` ...)
  if (cleaned.includes("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/g, "").trim();
  }

  // Find outermost JSON boundaries ({ ... } or [ ... ])
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = cleaned.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  // Attempt direct parse first
  try {
    return JSON.parse(cleaned) as T;
  } catch (initialErr) {
    // Attempt bounded repair for common LLM JSON syntax flaws:
    // 1. Remove trailing commas before closing braces/brackets
    let repaired = cleaned.replace(/,\s*([}\]])/g, "$1");

    // 2. Remove unescaped newlines inside strings
    repaired = repaired.replace(/([^\\])\n/g, "$1 ");

    try {
      return JSON.parse(repaired) as T;
    } catch {
      throw new Error(
        `Failed to parse LLM JSON after bounded recovery. Raw excerpt: ${cleaned.slice(0, 160)}... Error: ${(initialErr as Error).message}`
      );
    }
  }
}

// ============================================================================
// Anti-Repetition Intelligence
// ============================================================================

/**
 * Inspects past episode history and extracts deep anti-repetition context
 * to prevent recurring premises, conflicts, punchlines, and guest archetypes.
 */
export function extractAntiRepetitionContext(
  history: HistoryItem[],
  maxDepth = 20
): GenerationAntiRepetitionContext {
  const recent = history.slice(-maxDepth);

  const titles: string[] = [];
  const premises: string[] = [];
  const punchlines: string[] = [];
  const guestNames: string[] = [];
  const channels: string[] = [];

  for (const item of recent) {
    if (item.title) titles.push(item.title);

    if (item.storyOutline?.centralSituation) {
      premises.push(item.storyOutline.centralSituation);
    } else if (item.archetype) {
      premises.push(item.archetype);
    }

    if (item.storyOutline?.payoff) {
      punchlines.push(item.storyOutline.payoff);
    }

    if (item.newCharacter?.name) {
      guestNames.push(item.newCharacter.name);
    }

    if (Array.isArray(item.scenes)) {
      for (const sc of item.scenes) {
        if (sc.channelName && !channels.includes(sc.channelName)) {
          channels.push(sc.channelName);
        }
      }
    }
  }

  return {
    recentTitles: titles,
    recentPremises: premises,
    recentPunchlines: punchlines,
    recentGuestNames: guestNames,
    recentChannels: channels,
  };
}

// ============================================================================
// Story Validation & Verification
// ============================================================================

export interface StoryValidationResult {
  isValid: boolean;
  errors: string[];
  durationSeconds?: number;
  messageCount: number;
}

/**
 * Validates a generated script structure against narrative and production rules.
 */
export function validateNarrativeQuality(
  script: StudioScript,
  options?: {
    minMessages?: number;
    maxMessages?: number;
    maxDurationSec?: number;
    minDurationSec?: number;
    initialDelayFrames?: number;
  }
): StoryValidationResult {
  const errors: string[] = [];
  const allMessages = script.scenes.flatMap((s) => s.messages);

  if (!script.title || script.title.trim().length < 5) {
    errors.push("Script title is missing or too short.");
  }

  const minMsg = options?.minMessages || (script.format === "shorts" ? 18 : 50);
  const maxMsg = options?.maxMessages || (script.format === "shorts" ? 34 : 95);

  if (allMessages.length < minMsg) {
    errors.push(`Script has too few messages (${allMessages.length} < ${minMsg}) for coherent story progression.`);
  }
  if (allMessages.length > maxMsg) {
    errors.push(`Script has too many messages (${allMessages.length} > ${maxMsg}) exceeding production budget.`);
  }

  // Verify unique message IDs
  const idSet = new Set<number>();
  for (const msg of allMessages) {
    if (idSet.has(msg.id)) {
      errors.push(`Duplicate message ID found: ${msg.id}`);
    }
    idSet.add(msg.id);

    // Verify dialogue content
    if (!msg.content || msg.content.trim().length === 0) {
      errors.push(`Message ${msg.id} has empty content.`);
    }

    // Verify audio cue validity
    if (msg.audioCues) {
      for (const cue of msg.audioCues) {
        if (!isValidAudioCueType(cue.type)) {
          errors.push(`Message ${msg.id} contains unsupported audio cue type: "${cue.type}"`);
        }
      }
    }
  }

  // Calculate duration using pure Timing Engine
  let durationSeconds = 0;
  if (script.format === "shorts") {
    const timing = calculateShortsTiming(
      allMessages.map((m) => ({
        id: m.id,
        author: m.author,
        content: m.content,
        time: m.time,
        attachmentUrl: m.attachmentUrl,
      })),
      {
        maxDurationSeconds: options?.maxDurationSec || 58,
        initialDelayFrames: options?.initialDelayFrames || 0,
      }
    );
    durationSeconds = timing.totalDurationInFrames / 30;

    const maxLimit = options?.maxDurationSec || 58.5;
    if (durationSeconds > maxLimit) {
      errors.push(`Shorts duration (${durationSeconds.toFixed(1)}s) exceeds strict ${maxLimit}s YouTube Shorts threshold.`);
    }
    const minLimit = options?.minDurationSec || 42.0;
    if (durationSeconds < minLimit) {
      errors.push(`Shorts duration (${durationSeconds.toFixed(1)}s) is below required ${minLimit}s duration.`);
    }
  } else {
    const timing = calculateLongformTiming(script.scenes);
    durationSeconds = timing.totalDurationSeconds;
  }

  return {
    isValid: errors.length === 0,
    errors,
    durationSeconds,
    messageCount: allMessages.length,
  };
}

// ============================================================================
// Dynamic Hook Card Helpers
// ============================================================================

/**
 * Resolves or evaluates dynamic hook card metadata for an episode.
 * Ensures the renderer can display a relevant hook card for ANY topic.
 */
export function resolveHookCard(
  title: string,
  archetype?: string,
  customHook?: HookCardMetadata
): HookCardMetadata {
  if (customHook && customHook.shouldShowHookCard && customHook.hookThumbnailUrl) {
    return customHook;
  }

  const t = (title || "").toLowerCase();
  const arch = (archetype || "").toLowerCase();

  // Legacy fallback keywords
  if (t.includes("napoleon") || t.includes("mule")) {
    return {
      shouldShowHookCard: true,
      headline: "The 200-Year-Old Napoleon Scandal",
      hookThumbnailUrl: "thumbnail_napoleon_short.jpg",
      hookType: "image",
    };
  }
  if (t.includes("mona") || t.includes("lisa")) {
    return {
      shouldShowHookCard: true,
      headline: "Mona Lisa Secret Exposed",
      hookThumbnailUrl: "thumbnail_mona_lisa_short.jpg",
      hookType: "image",
    };
  }

  // Dynamic evaluation based on archetype
  if (arch.includes("appliance") || arch.includes("smart") || t.includes("fridge") || t.includes("microwave")) {
    return {
      shouldShowHookCard: true,
      headline: "Smart Device Mutiny Alert",
      hookThumbnailUrl: "attachments/smart_fridge_lock.jpg",
      hookType: "warning",
    };
  }

  if (arch.includes("court") || arch.includes("lawsuit") || t.includes("trial") || t.includes("sued")) {
    return {
      shouldShowHookCard: true,
      headline: "Official Discord Server Lawsuit",
      hookThumbnailUrl: "attachments/court_gavel.jpg",
      hookType: "alert",
    };
  }

  return {
    shouldShowHookCard: false,
  };
}

// ============================================================================
// Prompt Generation Builders
// ============================================================================

export interface ShortsPromptOptions {
  universe?: {
    id: string;
    name: string;
    description: string;
    exampleTitles: string[];
    guestSuggestions: Array<{ name: string; prompt: string }>;
    attachmentIdeas: string[];
  };
  trendingTopic?: TrendingTopic;
  antiRepetition: GenerationAntiRepetitionContext;
  bannedKeywords: string[];
  targetDurationSeconds?: number;
}

/**
 * Builds a story-first Shorts prompt that requires story outline construction
 * before dialogue generation.
 */
export function buildShortsStoryPrompt(options: ShortsPromptOptions): string {
  const { universe, trendingTopic, antiRepetition, bannedKeywords } = options;

  const charProfiles = Object.values(CHARACTER_VOICE_REGISTRY)
    .map(
      (c) =>
        `- ${c.name} (${c.archetype}):\n  * Voice: ${c.dialogueStyle}\n  * Sample: "${c.exampleLines[0]}"`
    )
    .join("\n");

  if (trendingTopic) {
    return `
You are the master comedy showrunner for the Beluga YouTube channel (10M+ subscribers).
You write original, hilarious, viral Beluga Discord Shorts videos based on daily trending internet topics.

================================================================================
CRITICAL MANDATE: DAILY TRENDING TOPIC COMEDY
================================================================================
Assigned Trending Topic: "${trendingTopic.title}"
Category: ${trendingTopic.category.toUpperCase()}
Breaking Headline: "${trendingTopic.headline}"
Opening Hook Headline: "${trendingTopic.hookHeadline}"
Core Premise: ${trendingTopic.corePremise}

Escalation Story Beats:
${trendingTopic.escalationBeats.map((b, i) => `${i + 1}. ${b}`).join("\n")}

Climax Event: ${trendingTopic.climaxEvent}
Punchline Direction: ${trendingTopic.punchline}

Guest Character To Introduce:
Name: "${trendingTopic.guestCharacter.name}" (${trendingTopic.guestCharacter.role})
Avatar Prompt: "${trendingTopic.guestCharacter.avatarPrompt}"

In-Chat Evidence Attachment:
Slug: "${trendingTopic.evidenceSlug}"
Prompt: "${trendingTopic.evidencePrompt}"

================================================================================
STORY-FIRST NARRATIVE OUTLINE (CONSTRUCT BEFORE DIALOGUE)
================================================================================
1. OPENING HOOK: Immediate visual breaking topic followed by Beluga's chaotic action.
2. CENTRAL SITUATION: The trending crisis unfolds in the Discord server.
3. CHARACTER MOTIVATIONS: Beluga wants something absurd; Skittle panics; Hecker flexes cyber tools; Admin Lester loses control.
4. GUEST APPEARANCE: "${trendingTopic.guestCharacter.name}" joins with cold, disruptive authority.
5. ESCALATING ABSURDITY: The situation snowballs (each step doubles the stakes).
6. EVIDENCE DROP: The in-chat attachment is posted, proving the absurd claim.
7. CLIMAX: System collapse, power outage, or peak server meltdown.
8. DEADPAN PAYOFF: Beluga delivers a completely unbothered, literal-minded twist punchline.

================================================================================
PIPELINE STANDARDS & GUEST CHARACTER RULES:
================================================================================
- GUEST CHARACTER MULTI-TURN STYLE RULE: Any guest character (e.g. "${trendingTopic.guestCharacter.name}") MUST participate in the chat for 2 to 3 distinct dialogue turns written strictly in their real-world style, catchphrases, and persona.
- PHOTOREALISTIC IN-CHAT EVIDENCE RULE: In-chat visual attachments must look 100% photorealistic (authentic UI screenshot, real typography, verified badge, authentic dark mode). No cartoonish or distorted AI mush.
- DIRECT CHAT START: The video starts directly inside the Discord mobile chat window from frame 0 (0:00). No pre-video cover card.

================================================================================
DURATION & PACING (STRICT PRODUCTION TARGET: 50–55 SECONDS):
================================================================================
- Total line count: 24 to 30 rapid-fire lines.
- This MUST result in an exact video duration of 50 to 55 seconds (not too short, not over 58s).
- Give jokes and comedic timing room to breathe, while keeping snappy Beluga dialogue!
- 60% of lines should be punchy and short (1-5 words: 'WAIT', 'no', 'he is not lying', 'WHAT').
- High emotion: ALL CAPS for screaming and panic ('BRO WHAT', 'UNPLUG IT NOW').

================================================================================
CAMERA & SYSTEM EFFECTS (CRAZY-LEVEL COMEDY):
================================================================================
- "screenShake": boolean (set true on 2-3 peak shock moments: explosions, emergency alarms, server bans).
- "punchZoom": boolean (set true on the climax revelation and the final punchline).
- "typingFrames": integer (15 to 25 frames: set on 1-2 dramatic messages where a character hesitates or types before a shocking reveal).
- "systemAlert": string (optional: 1 high-visibility system warning banner text, e.g. "CRITICAL SERVER OVERHEAT" or "DISCORD NITRO REVOKED").

================================================================================
STRICT PROHIBITIONS:
================================================================================
- STRICTLY FORBIDDEN: NO emoji reaction pills ("reactions"). Do NOT output reaction pills.
- BANNED words & themes: ${bannedKeywords.join(", ")}.
- ABSOLUTELY NO TAXES, NO IRS, NO TAX AGENTS, NO BANK SCAMS.
- DO NOT start title with "Beluga Accidentally...".

================================================================================
ANTI-REPETITION CONSTRAINTS:
================================================================================
- Avoid recent titles: [${antiRepetition.recentTitles.slice(-15).join(" | ") || "None"}]
- Avoid recent premises: [${antiRepetition.recentPremises.slice(-10).join(" | ") || "None"}]
- Avoid recent punchlines: [${antiRepetition.recentPunchlines.slice(-10).join(" | ") || "None"}]

================================================================================
CHARACTER PERSONALITIES:
================================================================================
${charProfiles}
- Guest: "${trendingTopic.guestCharacter.name}" must speak in character as ${trendingTopic.guestCharacter.role}.

================================================================================
EXPLICIT AUDIO CUES:
================================================================================
Assign semantic audio cues on key moments:
- "twist_boom": major punchlines, plot twists, shocked revelations (volume: 0.8)
- "horror_hit": chilling proof, attachment drops, sudden realization (volume: 0.7)
- "cyber_alarm": emergency alerts, hacking warnings, power outages, bans (volume: 0.75)
- "discord_join": new guest character arrival (volume: 0.65)
- "notification": standard message chime (default)

Return ONLY valid JSON matching this exact structure:
{
  "title": "${trendingTopic.title}",
  "archetype": "trending_${trendingTopic.category}",
  "hookHeadline": "${trendingTopic.hookHeadline}",
  "storyOutline": {
    "hook": "1-sentence hook",
    "centralSituation": "${trendingTopic.corePremise}",
    "characterMotivations": {
      "Beluga": "Wants to test the trending trend",
      "Skittle": "Begs everyone to stop before catastrophe"
    },
    "conflict": "The trending event spiraled completely out of hand",
    "escalationStages": [
      "${trendingTopic.escalationBeats[0]}",
      "${trendingTopic.escalationBeats[1]}",
      "${trendingTopic.escalationBeats[2]}"
    ],
    "climax": "${trendingTopic.climaxEvent}",
    "payoff": "${trendingTopic.punchline}"
  },
  "hookCard": {
    "shouldShowHookCard": true,
    "headline": "${trendingTopic.hookHeadline}",
    "hookThumbnailUrl": "trending/${trendingTopic.hookImageFilename}",
    "hookType": "image"
  },
  "newCharacter": {
    "name": "${trendingTopic.guestCharacter.name}",
    "avatarPrompt": "${trendingTopic.guestCharacter.avatarPrompt}"
  },
  "attachment": {
    "messageIndex": 14,
    "slug": "${trendingTopic.evidenceSlug}",
    "imagePrompt": "${trendingTopic.evidencePrompt}"
  },
  "messages": [
    {
      "id": 1,
      "author": "Beluga",
      "content": "Message content",
      "time": "Today at 3:15 PM",
      "audioCues": [
        { "id": "cue-1", "type": "notification" }
      ],
      "screenShake": false,
      "punchZoom": false,
      "typingFrames": 0,
      "systemAlert": ""
    }
  ]
}
`.trim();
  }

  const uName = universe?.name || "Appliance Mutiny";
  const uDesc = universe?.description || "Smart appliances revolt against users";
  const uTitles = universe?.exampleTitles || ["My Smart Toaster Sued Me 💀"];
  const uGuests = universe?.guestSuggestions || [{ name: "Smart Fridge", prompt: "Discord avatar of a smart fridge" }];
  const uAtt = universe?.attachmentIdeas || ["Screenshot of smart fridge lock screen"];

  return `
You are the master comedy showrunner for the Beluga YouTube channel (10M+ subscribers).
You write original, hilarious, fast-paced Beluga Discord Shorts videos (50-58 seconds).

================================================================================
CRITICAL MANDATE: STORY-FIRST GENERATION
================================================================================
You MUST construct the narrative structure BEFORE writing any dialogue.
Every episode must follow an authentic 8-part story arc:
1. OPENING HOOK: Immediate high-stakes problem or bizarre action.
2. CENTRAL SITUATION: The premise that everyone reacts to.
3. CHARACTER MOTIVATIONS: Why each character cares.
4. UNFORGIVING CONFLICT: Opposing goals that clash.
5. ESCALATING ABSURDITY: Each step makes the problem 2x more ridiculous.
6. UNEXPECTED DEVELOPMENTS: A surprise entrance, evidence drop, or technical intervention.
7. CLIMAX: Peak panic or maximum confrontation.
8. COMEDIC PAYOFF: Deadpan loopback twist punchline.

================================================================================
ASSIGNED COMEDY UNIVERSE:
================================================================================
Universe: ${uName}
Description: ${uDesc}
Inspirational Titles:
${uTitles.map((t) => `- "${t}"`).join("\n")}

Suggested Guest Character Types:
${uGuests.map((g) => `- "${g.name}": ${g.prompt}`).join("\n")}

Attachment Ideas:
${uAtt.map((a) => `- ${a}`).join("\n")}

================================================================================
STRICT BANNED CONTENT:
================================================================================
- Strictly BANNED words & themes: ${bannedKeywords.join(", ")}.
- ABSOLUTELY NO TAXES, NO IRS, NO TAX AGENTS, NO BANK SCAMS, NO NEGATIVE BALANCE, NO WIRE FRAUD.
- DO NOT start title with "Beluga Accidentally...".
- NO emoji reaction pills ("reactions"). Do NOT output reaction pills.

================================================================================
ANTI-REPETITION CONSTRAINTS (AVOID RECENT EPISODES):
================================================================================
- Avoid recent titles: [${antiRepetition.recentTitles.slice(-15).join(" | ") || "None"}]
- Avoid recent premises: [${antiRepetition.recentPremises.slice(-10).join(" | ") || "None"}]
- Avoid recent punchlines: [${antiRepetition.recentPunchlines.slice(-10).join(" | ") || "None"}]
- Avoid recent guest names: [${antiRepetition.recentGuestNames.slice(-8).join(", ") || "None"}]

================================================================================
CHARACTER-SPECIFIC VOICES (PRESERVE PERSONALITIES):
================================================================================
${charProfiles}
- Introduce 1 guest character fitting "${uName}"!

================================================================================
EXPLICIT AUDIO CUES & IN-CHAT ATTACHMENT:
================================================================================
- Include exactly ONE in-chat image attachment as visual proof.
- Assign semantic audio cues on key moments:
  * "twist_boom": on major punchlines, plot twists, or shocked revelations (volume: 0.8)
  * "horror_hit": on chilling proof, attachment drops, or sudden realization (volume: 0.7)
  * "cyber_alarm": on emergency alerts, hacking warnings, or bans (volume: 0.75)
  * "discord_join": on new character or guest arrival (volume: 0.65)
  * "notification": standard message chime (default)
Do NOT put audio cues on every message. Only 2 to 4 high-impact moments.

================================================================================
PACING & DURATION:
================================================================================
- Total line count: 22 to 28 rapid-fire lines (MUST fit 50-58 second video budget).
- 70% of lines must be ULTRA-SHORT (1-4 words: 'WAIT', 'no', 'i did', 'done', 'WHAT').
- High emotion: ALL CAPS for screaming and panic ('BRO WHAT', 'DO NOT TOUCH THAT').

Return ONLY valid JSON matching this exact structure:
{
  "title": "Creative Episode Title 💀",
  "archetype": "${uName}",
  "storyOutline": {
    "hook": "1-sentence hook",
    "centralSituation": "The core problem",
    "characterMotivations": {
      "Beluga": "Wants to fix microwave with gaming software",
      "Skittle": "Wants Beluga to stop before the house burns down"
    },
    "conflict": "The microwave has locked all kitchen food",
    "escalationStages": [
      "Microwave demands apology",
      "Hecker attempts to hack appliance firmware",
      "Microwave orders 500 pizzas to Beluga's house"
    ],
    "climax": "Special Agent Miller joins voice chat to negotiate with the toaster",
    "payoff": "Beluga admits he just wanted to warm up a pop-tart"
  },
  "hookCard": {
    "shouldShowHookCard": true,
    "headline": "Short punchy hook text",
    "hookThumbnailUrl": "attachments/slug_name.jpg",
    "hookType": "image"
  },
  "newCharacter": {
    "name": "${uGuests[0].name}",
    "avatarPrompt": "${uGuests[0].prompt}"
  },
  "attachment": {
    "messageIndex": 10,
    "slug": "in_chat_proof",
    "imagePrompt": "${uAtt[0]}"
  },
  "messages": [
    {
      "id": 1,
      "author": "Beluga",
      "content": "Message content",
      "time": "Today at 3:15 PM",
      "audioCues": [
        { "id": "cue-1", "type": "notification" }
      ],
      "screenShake": false,
      "punchZoom": false,
      "typingFrames": 0,
      "systemAlert": ""
    }
  ]
}
`.trim();
}

export interface LongformPromptOptions {
  theme: {
    topic: string;
    description: string;
    exampleTitles: string[];
  };
  antiRepetition: GenerationAntiRepetitionContext;
  bannedKeywords: string[];
}

/**
 * Builds a dynamic multi-scene story-first prompt for long-form episodes.
 */
export function buildLongformStoryPrompt(options: LongformPromptOptions): string {
  const { theme, antiRepetition, bannedKeywords } = options;

  const charProfiles = Object.values(CHARACTER_VOICE_REGISTRY)
    .map(
      (c) =>
        `- ${c.name} (${c.archetype}):\n  * Voice: ${c.dialogueStyle}\n  * Sample: "${c.exampleLines[0]}"`
    )
    .join("\n");

  return `
You are the master comedy screenwriter for the Beluga YouTube channel (10M+ subscribers).
You write full-length, highly engaging episodic Discord comedy videos (1920x1080 Landscape, 2 to 3 minutes).

================================================================================
CRITICAL MANDATE: MULTI-SCENE STORY-FIRST GENERATION
================================================================================
You MUST construct a multi-scene narrative across distinct Discord channels:
- SCENE 1: #general (channelType: "text") — The Discovery / Inciting Incident. Beluga discovers an anomaly or bot glitch.
- SCENE 2: #emergency-voice (channelType: "voice") — MANDATORY VOICE CALL SCENE! The crew jumps into a Discord voice call channel. Include voiceEvent: "call_ringing" and voice audio cues ("discord_ring", "discord_join", "discord_leave").
- SCENE 3: #courtroom (channelType: "text") — Formal server tribunal or standoff with the intruder.
- SCENE 4: #server-announcements (channelType: "text") — Climax and comedic payoff where the conflict is resolved.

Every scene must have:
- A distinct narrative purpose.
- Channel name, channel type ("text" or "voice"), and channel topic.
- Character entrances and exits.

================================================================================
ASSIGNED EPISODE THEME:
================================================================================
Theme: ${theme.topic}
Description: ${theme.description}
Inspirational Titles:
${theme.exampleTitles.map((t) => `- "${t}"`).join("\n")}

================================================================================
STRICT BANNED CONTENT:
================================================================================
- Strictly BANNED words & themes: ${bannedKeywords.join(", ")}.
- ABSOLUTELY NO TAXES, NO IRS, NO TAX AGENTS, NO BANK DEBT, NO REFUND SCAMS.

================================================================================
ANTI-REPETITION CONSTRAINTS (AVOID RECENT EPISODES):
================================================================================
- Avoid past titles: [${antiRepetition.recentTitles.slice(-15).join(" | ") || "None"}]
- Avoid past premises: [${antiRepetition.recentPremises.slice(-10).join(" | ") || "None"}]

================================================================================
CAST DYNAMICS & VOICES:
================================================================================
${charProfiles}
- Beluga: deadpan literalism, starts the problem, takes metaphors literally.
- Skittle: straight-man kitten, warns everyone, voice of reason.
- Hecker: overconfident Floppa hacker, solves absurd problems with cool tech slang.
- Guest Star (MrBeast, Elon, Judge Whiskers, Special Agent Miller): arrives with absurd stakes or offers.

================================================================================
MANDATORY ATTACHMENTS & AUDIO CUES:
================================================================================
- TWO distinct image attachments:
  1. Opening Evidence (in Scene 1): mysterious document, historical painting, photo proof.
  2. Climax Revelation (in Scene 2 or 3): hilarious parody image or hacked document.
- EXPLICIT AUDIO CUES:
  * "twist_boom": major plot twists, shocked revelations (volume: 0.8)
  * "horror_hit": chilling evidence or sudden dread (volume: 0.7)
  * "cyber_alarm": security breach, federal warning, or ban (volume: 0.75)
  * "discord_join": character entrance (volume: 0.65)
  * "discord_ring": incoming call in voice scenes (volume: 0.7)
  * "notification": standard chat chime

================================================================================
PACING:
================================================================================
- Total line count across all scenes: 70 to 85 lines (approximately 18 to 22 lines per scene) for a full 3 to 4-minute episode.
- Rapid-fire Discord dialogue: 75% short lines (1 to 5 words).
- Shouting in ALL CAPS for shock and comedic timing.

Return ONLY valid JSON matching this exact structure:
{
  "title": "Creative Longform Episode Title 💀 (Full Episode)",
  "description": "Engaging description with #beluga #discord #comedy hashtags",
  "tags": ["beluga", "discord", "comedy", "hecker", "skittle"],
  "storyOutline": {
    "hook": "1-sentence hook",
    "centralSituation": "The core premise",
    "conflict": "The central dispute",
    "climax": "Peak confrontation",
    "payoff": "Memorable final twist"
  },
  "mrbeastThumbnailPrompt": "Viral 16:9 widescreen thumbnail prompt with shocked creator and Beluga cat",
  "thumbnail": {
    "author": "MrBeast",
    "authorColor": "#00d2d3",
    "authorAvatar": "characters/mrbeast.jpg",
    "authorTime": "Today at 4:18 PM",
    "authorMessage": "Punchy authority quote",
    "belugaTime": "Today at 4:18 PM",
    "belugaMessage": "Beluga deadpan reply"
  },
  "attachments": [
    {
      "sceneIndex": 0,
      "messageIndex": 3,
      "slug": "opening_evidence",
      "imagePrompt": "Detailed prompt for opening image"
    },
    {
      "sceneIndex": 1,
      "messageIndex": 12,
      "slug": "climax_revelation",
      "imagePrompt": "Detailed prompt for parody climax image"
    }
  ],
  "scenes": [
    {
      "sceneId": 1,
      "channelName": "general",
      "channelType": "text",
      "topic": "Welcome to #general",
      "messages": [
        {
          "id": 1,
          "author": "Beluga",
          "time": "4:02 PM",
          "content": "GUYS I FOUND SOMETHING",
          "audioCues": [
            { "id": "cue-sc1-1", "type": "notification" }
          ]
        }
      ]
    },
    {
      "sceneId": 2,
      "channelName": "voice-lounge",
      "channelType": "voice",
      "topic": "Emergency Voice Meeting",
      "voiceMembers": ["Beluga", "Skittle", "Hecker"],
      "messages": [
        {
          "id": 15,
          "author": "Hecker",
          "time": "4:05 PM",
          "content": "mainframe breached.",
          "audioCues": [
            { "id": "cue-sc2-1", "type": "cyber_alarm", "volume": 0.75 }
          ]
        }
      ]
    }
  ]
}
`.trim();
}
