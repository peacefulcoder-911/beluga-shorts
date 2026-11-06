/**
 * Discord Comedy Studio 2.0 - Pure Timing & Pacing Engine
 * 
 * Computes natural reading cadence, attachment dwell pauses, scene transitions,
 * and duration compression without mutating module-level state.
 * 
 * Extracts and unifies existing formulas from:
 * - src/Composition.tsx (Shorts)
 * - longform/src/LongformComposition.tsx (Long-form)
 */

import type { StudioMessage, StudioScene, ProductionInstruction } from "./types.ts";

// ============================================================================
// Types & Options
// ============================================================================

export interface WordCountResult {
  wordCount: number;
  charCount: number;
}

export interface ReadingDurationOptions {
  format?: "shorts" | "longform";
  customTierMultipliers?: {
    short?: number;
    medium?: number;
    long?: number;
    extended?: number;
  };
}

export interface MessageDurationOptions {
  format?: "shorts" | "longform";
  fps?: number;
  isLast?: boolean;
  hasAttachment?: boolean;
  cutawayType?: string;
  voiceEvent?: string;
  attachmentDwellSeconds?: number;
  lastMessageDurationSeconds?: number;
  customTierMultipliers?: {
    short?: number;
    medium?: number;
    long?: number;
    extended?: number;
  };
}

export interface MessageDurationResult {
  durationSeconds: number;
  durationFrames: number;
  wordCount: number;
  charCount: number;
  baseSeconds: number;
  dwellSeconds: number;
}

export interface ShortsTimingOptions {
  fps?: number;
  maxDurationSeconds?: number;
  attachmentDwellSeconds?: number;
  endPaddingSeconds?: number;
  lastMessageDurationSeconds?: number;
  initialDelayFrames?: number;
  customTierMultipliers?: {
    short?: number;
    medium?: number;
    long?: number;
    extended?: number;
  };
}

export interface ShortsTimingResult<T extends { content: string; attachmentUrl?: string }> {
  timedMessages: Array<T & { startFrame: number; durationInFrames: number }>;
  totalDurationInFrames: number;
  scaleFactor: number;
  rawTotalFrames: number;
}

export interface LongformTimingOptions {
  fps?: number;
  initialFadeInSeconds?: number;
  sceneGapSeconds?: number;
  endPaddingSeconds?: number;
  attachmentDwellSeconds?: number;
}

export interface LongformTimingResult {
  timedScenes: StudioScene[];
  totalDurationInFrames: number;
  totalDurationSeconds: number;
}

// ============================================================================
// Granular Pure Calculation Functions
// ============================================================================

/**
 * Counts words and non-whitespace characters consistently.
 */
export function countWordsAndChars(content: string): WordCountResult {
  const trimmed = (content || "").trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  return {
    wordCount: words,
    charCount: (content || "").length,
  };
}

/**
 * Calculates reading duration in seconds from word count based on platform pacing:
 * 
 * Shorts pacing (src/Composition.tsx):
 * - <= 2 words: 1.0s
 * - <= 5 words: 1.35s
 * - <= 8 words: 1.75s
 * - > 8 words:  2.4s
 * 
 * Long-form pacing (longform/src/LongformComposition.tsx):
 * - <= 2 words: 1.4s
 * - <= 5 words: 2.0s
 * - <= 9 words: 2.7s
 * - > 9 words:  3.6s
 */
export function calculateReadingDuration(
  wordCount: number,
  options?: ReadingDurationOptions
): number {
  const format = options?.format ?? "shorts";

  if (format === "longform") {
    if (wordCount <= 2) return options?.customTierMultipliers?.short ?? 1.4;
    if (wordCount <= 5) return options?.customTierMultipliers?.medium ?? 2.0;
    if (wordCount <= 9) return options?.customTierMultipliers?.long ?? 2.7;
    return options?.customTierMultipliers?.extended ?? 3.6;
  }

  // Default: Shorts format
  if (wordCount <= 2) return options?.customTierMultipliers?.short ?? 1.0;
  if (wordCount <= 5) return options?.customTierMultipliers?.medium ?? 1.35;
  if (wordCount <= 8) return options?.customTierMultipliers?.long ?? 1.75;
  return options?.customTierMultipliers?.extended ?? 2.4;
}

/**
 * Returns the minimum display duration for a single message.
 */
export function calculateMinimumDisplayDuration(
  format: "shorts" | "longform" = "shorts",
  fps = 30
): { minSeconds: number; minFrames: number } {
  const minSeconds = format === "longform" ? 1.4 : 1.0;
  return {
    minSeconds,
    minFrames: Math.floor(minSeconds * fps),
  };
}

/**
 * Returns the attachment dwell pause duration.
 * Shorts: +1.8s (src/Composition.tsx)
 * Long-form: 4.0s (longform/src/LongformComposition.tsx)
 */
export function calculateAttachmentDwell(
  format: "shorts" | "longform" = "shorts",
  fps = 30
): { dwellSeconds: number; dwellFrames: number } {
  const dwellSeconds = format === "longform" ? 4.0 : 1.8;
  return {
    dwellSeconds,
    dwellFrames: Math.floor(dwellSeconds * fps),
  };
}

/**
 * Returns the final end padding duration after the punchline.
 * Shorts: 1.5s
 * Long-form: 4.0s
 */
export function calculateEndPadding(
  format: "shorts" | "longform" = "shorts",
  fps = 30
): { paddingSeconds: number; paddingFrames: number } {
  const paddingSeconds = format === "longform" ? 4.0 : 1.5;
  return {
    paddingSeconds,
    paddingFrames: Math.floor(paddingSeconds * fps),
  };
}

/**
 * Calculates display duration for a single message in isolation.
 */
export function calculateMessageDuration(
  content: string,
  options?: MessageDurationOptions
): MessageDurationResult {
  const format = options?.format ?? "shorts";
  const fps = options?.fps ?? 30;
  const { wordCount, charCount } = countWordsAndChars(content);

  // 1. Shorts final punchline pause (3.5s)
  if (format === "shorts" && options?.isLast) {
    const lastSec = options.lastMessageDurationSeconds ?? 3.5;
    const durationFrames = Math.floor(lastSec * fps);
    return {
      durationSeconds: lastSec,
      durationFrames,
      wordCount,
      charCount,
      baseSeconds: lastSec,
      dwellSeconds: 0,
    };
  }

  // 2. Longform special event overrides
  if (format === "longform") {
    let durationSec = calculateReadingDuration(wordCount, { format: "longform" });
    let dwellSec = 0;

    if (options?.cutawayType) {
      durationSec = options.cutawayType === "youtube_channel" ? 3.6 : 2.6;
    } else if (options?.hasAttachment) {
      durationSec = options.attachmentDwellSeconds ?? 4.0;
      dwellSec = durationSec;
    } else if (options?.voiceEvent === "call_ringing") {
      durationSec = 2.4;
    }

    const durationFrames = Math.floor(durationSec * fps);
    return {
      durationSeconds: durationSec,
      durationFrames,
      wordCount,
      charCount,
      baseSeconds: durationSec,
      dwellSeconds: dwellSec,
    };
  }

  // 3. Standard Shorts message
  let baseSec = calculateReadingDuration(wordCount, {
    format: "shorts",
    customTierMultipliers: options?.customTierMultipliers,
  });
  let dwellSec = 0;

  if (options?.hasAttachment) {
    dwellSec = options.attachmentDwellSeconds ?? 1.8;
    baseSec += dwellSec;
  }

  const charAdjustSec = charCount * 0.015;
  const totalSeconds = baseSec + charAdjustSec;
  const durationFrames = Math.floor(totalSeconds * fps);

  return {
    durationSeconds: totalSeconds,
    durationFrames,
    wordCount,
    charCount,
    baseSeconds: baseSec,
    dwellSeconds: dwellSec,
  };
}

// ============================================================================
// Sequence & Pipeline Timing Functions
// ============================================================================

/**
 * Calculates sequential message start frames, duration compression, and total
 * frame count for 9:16 Shorts.
 * 
 * Preserves the exact mathematical behavior of src/Composition.tsx:
 * - Word tier thresholds: <=2 words (1.0s), <=5 words (1.35s), <=8 words (1.75s), >8 (2.4s)
 * - Last message: 3.5s
 * - In-chat attachment dwell: +1.8s
 * - Character count adjustment: +0.015s per character
 * - End padding: 1.5s
 * - Duration compression: scaleFactor = rawTotalFrames > 1740 ? 1740 / rawTotalFrames : 1
 */
export function calculateShortsTiming<T extends { content: string; attachmentUrl?: string }>(
  messages: T[],
  options?: ShortsTimingOptions
): ShortsTimingResult<T> {
  const fps = options?.fps ?? 30;
  const maxDurationSeconds = options?.maxDurationSeconds ?? 58;
  const maxFrames = maxDurationSeconds * fps;
  const attachmentDwell = options?.attachmentDwellSeconds ?? 1.8;
  const endPaddingSeconds = options?.endPaddingSeconds ?? 1.5;
  const endPaddingFrames = Math.floor(fps * endPaddingSeconds);

  if (!messages || messages.length === 0) {
    return {
      timedMessages: [],
      totalDurationInFrames: endPaddingFrames,
      scaleFactor: 1,
      rawTotalFrames: endPaddingFrames,
    };
  }

  // 1. Calculate raw frame duration per message
  const rawDurations = messages.map((msg, idx) => {
    const isLast = idx === messages.length - 1;
    const res = calculateMessageDuration(msg.content, {
      format: "shorts",
      fps,
      isLast,
      hasAttachment: Boolean(msg.attachmentUrl),
      attachmentDwellSeconds: attachmentDwell,
      lastMessageDurationSeconds: options?.lastMessageDurationSeconds ?? 3.5,
      customTierMultipliers: options?.customTierMultipliers,
    });
    return res.durationFrames;
  });

  const initialDelayFrames = options?.initialDelayFrames ?? 0;
  const rawMessagesTotal = rawDurations.reduce((acc, d) => acc + d, 0) + endPaddingFrames;
  const rawTotalFrames = initialDelayFrames + rawMessagesTotal;

  // 2. Compute compression scale factor only if exceeding max limit
  const availableFrames = Math.max(0, maxFrames - initialDelayFrames);
  const scaleFactor = rawMessagesTotal > availableFrames ? availableFrames / rawMessagesTotal : 1;

  // 3. Assemble sequential start frames using scaled durations
  let currentFrame = initialDelayFrames;
  const timedMessages = messages.map((msg, idx) => {
    const startFrame = currentFrame;
    const durationInFrames = Math.floor(rawDurations[idx] * scaleFactor);
    currentFrame += durationInFrames;

    return {
      ...msg,
      startFrame,
      durationInFrames,
    };
  });

  const scaledEndPadding = Math.floor(endPaddingFrames * scaleFactor);
  const totalDurationInFrames = currentFrame + scaledEndPadding;

  return {
    timedMessages,
    totalDurationInFrames,
    scaleFactor,
    rawTotalFrames,
  };
}

/**
 * Calculates duration for a single scene in isolation.
 */
export function calculateSceneDuration(
  scene: StudioScene,
  options?: { fps?: number }
): { durationFrames: number; durationSeconds: number } {
  const fps = options?.fps ?? 30;
  let totalFrames = 0;

  for (const msg of scene.messages) {
    const res = calculateMessageDuration(msg.content, {
      format: "longform",
      fps,
      hasAttachment: Boolean(msg.attachmentUrl),
      cutawayType: msg.cutaway?.type,
      voiceEvent: msg.voiceEvent,
    });
    totalFrames += res.durationFrames;
  }

  return {
    durationFrames: totalFrames,
    durationSeconds: totalFrames / fps,
  };
}

/**
 * Calculates sequential timing across all scenes and cutaways for 16:9 Long-form videos.
 * 
 * Preserves the exact mathematical behavior of longform/src/LongformComposition.tsx:
 * - Initial channel fade-in: 0.5s (15 frames at 30fps)
 * - Inter-scene transition gap: 1.2s (36 frames at 30fps)
 * - Word tier thresholds: <=2 words (1.4s), <=5 words (2.0s), <=9 words (2.7s), >9 (3.6s)
 * - Fullscreen cutaways: youtube_channel (3.6s), other cutaways (2.6s)
 * - Attachments: 4.0s
 * - Voice ringing: 2.4s
 * - Final end padding: 4.0s (120 frames at 30fps)
 */
export function calculateLongformTiming(
  scenes: StudioScene[],
  options?: LongformTimingOptions
): LongformTimingResult {
  const fps = options?.fps ?? 30;
  const initialFadeInSeconds = options?.initialFadeInSeconds ?? 0.5;
  const sceneGapSeconds = options?.sceneGapSeconds ?? 1.2;
  const endPaddingSeconds = options?.endPaddingSeconds ?? 4.0;

  let currentFrame = Math.floor(initialFadeInSeconds * fps);

  const timedScenes: StudioScene[] = (scenes || []).map((scene, sceneIdx) => {
    if (sceneIdx > 0) {
      currentFrame += Math.floor(sceneGapSeconds * fps);
    }

    const timedMessages: StudioMessage[] = (scene.messages || []).map((msg) => {
      const startFrame = currentFrame;

      const durRes = calculateMessageDuration(msg.content, {
        format: "longform",
        fps,
        hasAttachment: Boolean(msg.attachmentUrl),
        cutawayType: msg.cutaway?.type,
        voiceEvent: msg.voiceEvent,
        attachmentDwellSeconds: options?.attachmentDwellSeconds ?? 4.0,
      });

      currentFrame += durRes.durationFrames;

      return {
        ...msg,
        startFrame,
        durationInFrames: durRes.durationFrames,
      };
    });

    return {
      ...scene,
      messages: timedMessages,
    };
  });

  const totalDurationInFrames = currentFrame + Math.floor(endPaddingSeconds * fps);

  return {
    timedScenes,
    totalDurationInFrames,
    totalDurationSeconds: totalDurationInFrames / fps,
  };
}

/**
 * Returns default production instruction metadata for either format.
 */
export function getDefaultProductionInstruction(
  format: "shorts" | "longform"
): ProductionInstruction {
  if (format === "shorts") {
    return {
      format: "shorts",
      fps: 30,
      width: 1440,
      height: 2560,
      maxDurationFrames: 58 * 30,
      minReadingSeconds: 1.0,
      attachmentDwellSeconds: 1.8,
      endPaddingSeconds: 1.5,
      hasHookCard: true,
    };
  }

  return {
    format: "longform",
    fps: 30,
    width: 1920,
    height: 1080,
    minReadingSeconds: 1.4,
    attachmentDwellSeconds: 4.0,
    endPaddingSeconds: 4.0,
  };
}
