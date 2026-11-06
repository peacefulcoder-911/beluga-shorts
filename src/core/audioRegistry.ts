/**
 * Discord Comedy Studio 2.0 - Central Audio Registry & Cue Resolver
 * 
 * Maps semantic audio events to verified audio asset paths, validates volumes
 * and frame offsets, and preserves legacy text-triggered audio behavior.
 */

import type { AudioCue, AudioCueType, StudioMessage } from "./types.ts";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AudioAssetDefinition {
  type: AudioCueType;
  src: string;
  defaultVolume: number;
  description: string;
}

export interface ResolvedAudioCue {
  id: string;
  type: AudioCueType;
  src: string;
  volume: number;
  delayFrames: number;
  triggerOn: "appearance" | "cutaway" | "event";
  assetExists?: boolean;
}

export interface AudioValidationError {
  field: string;
  message: string;
  code: string;
}

export interface AudioValidationResult {
  isValid: boolean;
  errors: AudioValidationError[];
}

// ============================================================================
// Audio Asset Registry (Ground truth from public/)
// ============================================================================

export const AUDIO_ASSET_REGISTRY: Record<AudioCueType, AudioAssetDefinition> = {
  notification: {
    type: "notification",
    src: "notification.mp3",
    defaultVolume: 0.5,
    description: "Classic Discord incoming message chime",
  },
  horror_hit: {
    type: "horror_hit",
    src: "audio/horror_hit.wav",
    defaultVolume: 0.7,
    description: "Heavy cinematic shock hit for in-chat attachments & dramatic entries",
  },
  twist_boom: {
    type: "twist_boom",
    src: "audio/twist_boom.wav",
    defaultVolume: 0.8,
    description: "Comedic vine boom punchline impact",
  },
  cyber_alarm: {
    type: "cyber_alarm",
    src: "audio/cyber_alarm.wav",
    defaultVolume: 0.65,
    description: "Klaxon alert for server hacks, mainframes & tactical breaches",
  },
  creepy_sting: {
    type: "creepy_sting",
    src: "audio/creepy_sting.wav",
    defaultVolume: 0.45,
    description: "High-frequency tension shiver during countdowns",
  },
  discord_join: {
    type: "discord_join",
    src: "audio/discord_join.wav",
    defaultVolume: 0.65,
    description: "User connects to voice/channel",
  },
  discord_leave: {
    type: "discord_leave",
    src: "audio/discord_leave.wav",
    defaultVolume: 0.65,
    description: "User disconnects from voice",
  },
  discord_ring: {
    type: "discord_ring",
    src: "audio/discord_ring.wav",
    defaultVolume: 0.6,
    description: "Incoming Discord call ringing chime",
  },
  comedy_bg: {
    type: "comedy_bg",
    src: "audio/comedy_lofi_bg.wav",
    defaultVolume: 0.3,
    description: "Ambient comedic lofi background music",
  },
  creepy_bg: {
    type: "creepy_bg",
    src: "audio/creepy_ambience.wav",
    defaultVolume: 0.4,
    description: "Dark eerie background atmosphere",
  },
  custom: {
    type: "custom",
    src: "notification.mp3",
    defaultVolume: 0.5,
    description: "Custom user-supplied sound file",
  },
};

// ============================================================================
// Legacy Trigger Phrases (Mirrored from longform/src/DesktopDiscord.tsx)
// ============================================================================

export const LEGACY_TRIGGER_PHRASES = {
  join: [
    "SPECIAL AGENT MILLER",
    "WHAT IN GOD'S NAME",
  ],
  twistBoom: [
    "WHAT IN GOD'S NAME",
    "Shrek 2",
    "NOT CLEARED OF MY CHARGES",
    "WIPED YOUR DIRTY BOOTS",
    "under your bed",
    "STREAMING SHREK",
    "40 YEARS",
    "safe option",
  ],
  cyberAlarm: [
    "BREACH",
    "PENTAGON",
    "TACTICAL UNITS",
    "BATTERING RAM",
  ],
  heavyHit: [
    "DISARMED",
    "SNIPER",
    "ARMORED",
    "SPLINTERING",
  ],
  tensionSting: [
    "3...",
    "2...",
    "1...",
    "laser pointer",
  ],
} as const;

// ============================================================================
// Validation Functions
// ============================================================================

export function isValidAudioCueType(type: string): type is AudioCueType {
  return typeof type === "string" && Object.prototype.hasOwnProperty.call(AUDIO_ASSET_REGISTRY, type);
}

export function isValidAudioVolume(volume: unknown): volume is number {
  return typeof volume === "number" && !isNaN(volume) && volume >= 0 && volume <= 1;
}

export function isValidDelayFrames(delay: unknown): delay is number {
  return typeof delay === "number" && Number.isInteger(delay) && delay >= 0;
}

export function validateAudioCue(cue: unknown): AudioValidationResult {
  const errors: AudioValidationError[] = [];

  if (!cue || typeof cue !== "object") {
    return {
      isValid: false,
      errors: [{ field: "cue", message: "AudioCue must be an object", code: "INVALID_CUE" }],
    };
  }

  const c = cue as Partial<AudioCue>;

  if (typeof c.id !== "string" || c.id.trim().length === 0) {
    errors.push({ field: "id", message: "AudioCue id is required", code: "MISSING_ID" });
  }

  if (typeof c.type !== "string" || !isValidAudioCueType(c.type)) {
    errors.push({ field: "type", message: `Invalid audio cue type: ${c.type}`, code: "INVALID_TYPE" });
  }

  if (c.volume !== undefined && !isValidAudioVolume(c.volume)) {
    errors.push({ field: "volume", message: "Volume must be a number between 0.0 and 1.0", code: "INVALID_VOLUME" });
  }

  if (c.delayFrames !== undefined && !isValidDelayFrames(c.delayFrames)) {
    errors.push({ field: "delayFrames", message: "delayFrames must be a non-negative integer", code: "INVALID_DELAY" });
  }

  if (c.type === "custom" && (!c.src || typeof c.src !== "string" || c.src.trim().length === 0)) {
    errors.push({ field: "src", message: "Custom audio cues must specify a non-empty src path", code: "MISSING_CUSTOM_SRC" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Asset Resolution & Verification
// ============================================================================

interface NodeProcessWithBuiltins {
  cwd?: () => string;
  getBuiltinModule?: (id: string) => {
    resolve: (...paths: string[]) => string;
    existsSync: (path: string) => boolean;
  };
}

/**
 * Checks whether the physical asset file exists inside the public/ folder.
 * In browser or Remotion bundler environments, filesystem checks are safely bypassed.
 */
export function checkAssetFileExists(src: string, basePath?: string): boolean {
  if (!src) return false;
  const proc = (typeof process !== "undefined" ? process : undefined) as NodeProcessWithBuiltins | undefined;
  if (proc && typeof proc.getBuiltinModule === "function") {
    try {
      const nodeFs = proc.getBuiltinModule("node:fs");
      const nodePath = proc.getBuiltinModule("node:path");
      const resolvedBase = basePath || (proc.cwd ? proc.cwd() : "");
      const fullPath = nodePath.resolve(resolvedBase, "public", src);
      return nodeFs.existsSync(fullPath);
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Resolves an AudioCue to its concrete audio file path, volume, and delay offset.
 */
export function resolveAudioCue(
  cue: AudioCue,
  options?: { basePath?: string; verifyFilesystem?: boolean }
): ResolvedAudioCue {
  const definition = AUDIO_ASSET_REGISTRY[cue.type] || AUDIO_ASSET_REGISTRY.notification;
  const src = cue.src || definition.src;
  const volume = cue.volume !== undefined && isValidAudioVolume(cue.volume)
    ? cue.volume
    : definition.defaultVolume;
  const delayFrames = cue.delayFrames !== undefined && isValidDelayFrames(cue.delayFrames)
    ? cue.delayFrames
    : 0;
  const triggerOn = cue.triggerOn ?? "appearance";

  const resolved: ResolvedAudioCue = {
    id: cue.id,
    type: cue.type,
    src,
    volume,
    delayFrames,
    triggerOn,
  };

  if (options?.verifyFilesystem) {
    resolved.assetExists = checkAssetFileExists(src, options.basePath);
  }

  return resolved;
}

// ============================================================================
// Legacy Audio Trigger Detection
// ============================================================================

/**
 * Backward-compatible audio detection for legacy scripts lacking explicit audioCues.
 * Replicates the exact string matching logic from DesktopDiscord.tsx.
 */
export function detectLegacyAudioCues(
  content: string,
  author = "",
  attachmentUrl?: string
): AudioCue[] {
  const cues: AudioCue[] = [];
  const text = content || "";
  const auth = author.toLowerCase();

  // 1. Notification ping on all messages
  cues.push({
    id: "legacy-notify",
    type: "notification",
    src: AUDIO_ASSET_REGISTRY.notification.src,
    volume: AUDIO_ASSET_REGISTRY.notification.defaultVolume,
  });

  // 2. User join chime
  const isUserJoin =
    LEGACY_TRIGGER_PHRASES.join.some((phrase) => text.includes(phrase)) ||
    auth.includes("miller");
  if (isUserJoin) {
    cues.push({
      id: "legacy-join",
      type: "discord_join",
      src: AUDIO_ASSET_REGISTRY.discord_join.src,
      volume: AUDIO_ASSET_REGISTRY.discord_join.defaultVolume,
    });
  }

  // 3. Twist boom punchline
  const isTwistBoom = LEGACY_TRIGGER_PHRASES.twistBoom.some((phrase) => text.includes(phrase));
  if (isTwistBoom) {
    cues.push({
      id: "legacy-twist-boom",
      type: "twist_boom",
      src: AUDIO_ASSET_REGISTRY.twist_boom.src,
      volume: AUDIO_ASSET_REGISTRY.twist_boom.defaultVolume,
    });
  }

  // 4. Cyber alarm (only if not twist boom)
  const isCyberAlarm = LEGACY_TRIGGER_PHRASES.cyberAlarm.some((phrase) => text.includes(phrase));
  if (isCyberAlarm && !isTwistBoom) {
    cues.push({
      id: "legacy-cyber-alarm",
      type: "cyber_alarm",
      src: AUDIO_ASSET_REGISTRY.cyber_alarm.src,
      volume: AUDIO_ASSET_REGISTRY.cyber_alarm.defaultVolume,
    });
  }

  // 5. Heavy hit (door battering / image attachment) (only if not twist boom)
  const isHeavyHit =
    LEGACY_TRIGGER_PHRASES.heavyHit.some((phrase) => text.includes(phrase)) ||
    Boolean(attachmentUrl);

  if (isHeavyHit && !isTwistBoom) {
    cues.push({
      id: "legacy-heavy-hit",
      type: "horror_hit",
      src: AUDIO_ASSET_REGISTRY.horror_hit.src,
      volume: AUDIO_ASSET_REGISTRY.horror_hit.defaultVolume,
    });
  }

  // 6. Tension sting
  const isTensionSting =
    LEGACY_TRIGGER_PHRASES.tensionSting.some((phrase) => phrase.endsWith("...") ? text === phrase : text.includes(phrase));

  if (isTensionSting) {
    cues.push({
      id: "legacy-tension-sting",
      type: "creepy_sting",
      src: AUDIO_ASSET_REGISTRY.creepy_sting.src,
      volume: AUDIO_ASSET_REGISTRY.creepy_sting.defaultVolume,
    });
  }

  return cues;
}

/**
 * Returns effective audio cues for a message: uses explicit audioCues if present,
 * or falls back to legacy substring detection.
 */
export function getEffectiveAudioCues(msg: StudioMessage): AudioCue[] {
  if (msg.cutaway?.type === "subscribe_button") {
    return [];
  }

  if (msg.audioCues && msg.audioCues.length > 0) {
    return msg.audioCues;
  }

  return detectLegacyAudioCues(msg.content, msg.author, msg.attachmentUrl);
}

/**
 * Resolves all audio cues on a message into ready-to-render ResolvedAudioCue objects.
 */
export function resolveMessageAudioCues(
  msg: StudioMessage,
  options?: { basePath?: string; verifyFilesystem?: boolean }
): ResolvedAudioCue[] {
  const cues = getEffectiveAudioCues(msg);
  return cues.map((c) => resolveAudioCue(c, options));
}
