/**
 * Discord Comedy Studio 2.0 - Bidirectional Compatibility Adapters
 * 
 * Provides lossless mapping between legacy Shorts/Long-form JSON formats
 * and unified Studio 2.0 contracts (StudioScript, StudioMessage, StudioScene).
 */

import { STUDIO_SCHEMA_VERSION } from "./types.ts";
import type {
  StudioScript,
  StudioScene,
  StudioMessage,
  CharacterProfile,
  ProductionInstruction,
  AudioCue,
  VisualCutaway,
} from "./types.ts";

// ============================================================================
// Legacy Type Definitions (Mirrored for strict decoupling)
// ============================================================================

export interface LegacyShortsRawMessage {
  id: number;
  author: string;
  content: string;
  time: string;
  avatarUrl?: string;
  color?: string;
  startFrame?: number;
  attachmentUrl?: string;
}

export interface LegacyShortsGenerationPayload {
  title?: string;
  archetype?: string;
  newCharacter?: {
    name: string;
    avatarPrompt: string;
  };
  attachment?: {
    messageIndex: number;
    slug: string;
    imagePrompt: string;
  };
  messages: LegacyShortsRawMessage[];
}

export interface LegacyLongformMessage {
  id: number;
  author: string;
  avatarUrl?: string;
  color?: string;
  time: string;
  content: string;
  mention?: string;
  cutaway?: VisualCutaway | Record<string, unknown>;
  attachmentUrl?: string;
  attachmentCaption?: string;
  reactions?: Array<{ emoji: string; count: number }>;
  voiceEvent?: "call_ringing" | "user_joined" | "user_left" | "call_ended";
  startFrame?: number;
  durationInFrames?: number;
}

export interface LegacyLongformScene {
  sceneId: number;
  channelName: string;
  channelType: "text" | "voice" | "dm";
  channelCategory?: string;
  topic?: string;
  voiceMembers?: string[];
  speakingMember?: string;
  messages: LegacyLongformMessage[];
}

export interface LegacyLongformScriptData {
  title: string;
  description: string;
  tags?: string[];
  mrbeastThumbnailPrompt?: string;
  customThumbnailPath?: string;
  thumbnail?: Record<string, unknown>;
  attachments?: Array<{
    messageIndex: number;
    slug: string;
    imagePrompt: string;
  }>;
  scenes: LegacyLongformScene[];
}

// ============================================================================
// Standard Discord Palette & Color Helpers
// ============================================================================

export const DEFAULT_DISCORD_PALETTE = [
  "#5865F2", "#57F287", "#FEE75C", "#EB459E", "#ED4245",
  "#00bcd4", "#ff9800", "#9c27b0", "#3ba55c", "#00e5ff",
  "#e91e63", "#4caf50", "#ff5722", "#673ab7"
];

export function resolveDefaultColor(name: string, customColor?: string): string {
  if (customColor) return customColor;
  const n = (name || "").toLowerCase();
  if (n.includes("beluga") || n.includes("belu")) return "#ed4245";
  if (n.includes("smith") || n.includes("teacher") || n.includes("prof") || n.includes("sir")) return "#3ba55c";
  if (n.includes("hecker")) return "#57f287";
  if (n.includes("mom") || n.includes("mother")) return "#f47b67";
  if (n.includes("girlfriend") || n.includes("gf") || n.includes("babe")) return "#eb459e";
  if (n.includes("admin") || n.includes("mod") || n.includes("pablo")) return "#fee75c";
  if (n.includes("police") || n.includes("fbi") || n.includes("cop")) return "#5865F2";
  if (n.includes("skittle")) return "#ff73fa";
  if (n.includes("vladimir") || n.includes("vlad")) return "#00bcd4";
  if (n.includes("nasa")) return "#1e88e5";
  if (n.includes("google")) return "#4285F4";
  if (n.includes("ai") || n.includes("gpt") || n.includes("robot") || n.includes("sentient")) return "#00e5ff";
  if (n.includes("billionaire") || n.includes("rich") || n.includes("elon") || n.includes("money")) return "#d4af37";
  if (n.includes("system") || n.includes("server") || n.includes("terminal")) return "#f1c40f";
  if (n.includes("exploding") || n.includes("tnt")) return "#ff4757";
  if (n.includes("mrbeast") || n.includes("beast")) return "#00d2d3";

  // Deterministic color hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DEFAULT_DISCORD_PALETTE[Math.abs(hash) % DEFAULT_DISCORD_PALETTE.length];
}

export function resolveDefaultAvatar(name: string, customAvatar?: string): string {
  if (customAvatar) return customAvatar;
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const n = name.toLowerCase();

  if (n.includes("beluga") || n.includes("belu")) return "beluga.jpg";
  if (n.includes("smith") || n.includes("teacher") || n.includes("prof") || n.includes("sir")) return "teacher.jpg";
  if (n.includes("hecker")) return "hecker.jpg";
  if (n.includes("mom") || n.includes("mother")) return "mom.jpg";
  if (n.includes("girlfriend") || n.includes("gf") || n.includes("babe")) return "girlfriend.jpg";
  if (n.includes("admin") || n.includes("mod")) return "admin.jpg";
  if (n.includes("pablo")) return "pablo.jpg";
  if (n.includes("police") || n.includes("fbi") || n.includes("cop")) return "police.jpg";
  if (n.includes("skittle")) return "skittle.jpg";
  if (n.includes("vladimir") || n.includes("vlad")) return "vladimir.jpg";
  if (n.includes("nasa")) return "nasa.jpg";
  if (n.includes("google")) return "google.jpg";
  if (n.includes("ai") || n.includes("gpt") || n.includes("robot") || n.includes("sentient")) return "ai.jpg";
  if (n.includes("billionaire") || n.includes("rich") || n.includes("elon") || n.includes("money")) return "billionaire.jpg";
  if (n.includes("system") || n.includes("server") || n.includes("terminal")) return "system.jpg";
  if (n.includes("exploding") || n.includes("tnt")) return "characters/explodingtnt.jpg";
  if (n.includes("mrbeast") || n.includes("beast")) return "characters/mrbeast.jpg";

  return `characters/${clean}.jpg`;
}

// ============================================================================
// Shorts Adapters: Legacy -> Studio 2.0 -> Legacy
// ============================================================================

/**
 * Converts a legacy Shorts script (from src/script.json or generateScript.js payload)
 * into a canonical StudioScript object.
 */
export function fromLegacyShortsScript(
  rawInput: LegacyShortsRawMessage[] | LegacyShortsGenerationPayload,
  options?: { title?: string; archetype?: string }
): StudioScript {
  const isPayload =
    !Array.isArray(rawInput) &&
    typeof rawInput === "object" &&
    rawInput !== null &&
    "messages" in rawInput &&
    Array.isArray((rawInput as LegacyShortsGenerationPayload).messages);
  const payload = isPayload ? (rawInput as LegacyShortsGenerationPayload) : undefined;
  const rawMessages: LegacyShortsRawMessage[] = Array.isArray(rawInput)
    ? rawInput
    : payload?.messages || [];

  const title = options?.title || payload?.title || "Beluga Discord Comedy Short";
  const archetype = options?.archetype || payload?.archetype;

  // Extract unique character profiles
  const castMap = new Map<string, CharacterProfile>();
  const messages: StudioMessage[] = rawMessages.map((msg) => {
    const color = resolveDefaultColor(msg.author, msg.color);
    const avatarUrl = resolveDefaultAvatar(msg.author, msg.avatarUrl);

    if (!castMap.has(msg.author)) {
      castMap.set(msg.author, {
        name: msg.author,
        avatarUrl,
        color,
        isGuest: msg.author.toLowerCase() === payload?.newCharacter?.name.toLowerCase(),
        avatarPrompt: payload?.newCharacter?.name.toLowerCase() === msg.author.toLowerCase()
          ? payload.newCharacter.avatarPrompt
          : undefined,
      });
    }

    // Attach semantic audio cues
    const audioCues: AudioCue[] = [
      {
        id: `sfx-notify-${msg.id}`,
        type: "notification",
        src: "notification.mp3",
        volume: 0.5,
      },
    ];

    if (msg.attachmentUrl) {
      audioCues.push({
        id: `sfx-hit-${msg.id}`,
        type: "horror_hit",
        src: "audio/horror_hit.wav",
        volume: 0.65,
      });
    }

    return {
      id: msg.id,
      author: msg.author,
      content: msg.content,
      time: msg.time,
      avatarUrl,
      color,
      attachmentUrl: msg.attachmentUrl,
      startFrame: msg.startFrame,
      audioCues,
    };
  });

  const scene: StudioScene = {
    sceneId: 1,
    channelName: "general",
    channelType: "text",
    channelCategory: "TEXT CHANNELS",
    topic: "Discord Central Server",
    messages,
  };

  const production: ProductionInstruction = {
    format: "shorts",
    fps: 30,
    width: 1440,
    height: 2560,
    maxDurationFrames: 58 * 30, // 58s safe YouTube Shorts boundary
    minReadingSeconds: 1.0,
    attachmentDwellSeconds: 1.8,
    endPaddingSeconds: 1.5,
    hasHookCard: true,
  };

  return {
    schemaVersion: STUDIO_SCHEMA_VERSION,
    title,
    format: "shorts",
    archetype,
    cast: Array.from(castMap.values()),
    scenes: [scene],
    production,
    rawAttachments: payload?.attachment ? [payload.attachment] : undefined,
  };
}

/**
 * Converts a canonical StudioScript back into the flat MessageData[] array
 * required by src/DiscordChat.tsx.
 */
export function toLegacyShortsMessages(script: StudioScript): LegacyShortsRawMessage[] {
  const result: LegacyShortsRawMessage[] = [];
  for (const scene of script.scenes) {
    for (const msg of scene.messages) {
      result.push({
        id: msg.id,
        author: msg.author,
        content: msg.content,
        time: msg.time,
        avatarUrl: msg.avatarUrl,
        color: msg.color,
        startFrame: msg.startFrame,
        attachmentUrl: msg.attachmentUrl,
      });
    }
  }
  return result;
}

// ============================================================================
// Long-Form Adapters: Legacy -> Studio 2.0 -> Legacy
// ============================================================================

/**
 * Converts a legacy long-form script (from longform/data/script_longform.json)
 * into a canonical StudioScript object.
 */
export function fromLegacyLongformScript(raw: LegacyLongformScriptData): StudioScript {
  const castMap = new Map<string, CharacterProfile>();

  const scenes: StudioScene[] = (raw.scenes || []).map((scene) => {
    const messages: StudioMessage[] = (scene.messages || []).map((msg) => {
      const color = resolveDefaultColor(msg.author, msg.color);
      const avatarUrl = resolveDefaultAvatar(msg.author, msg.avatarUrl);

      if (!castMap.has(msg.author)) {
        castMap.set(msg.author, {
          name: msg.author,
          avatarUrl,
          color,
        });
      }

      // Map audio cues explicitly
      const audioCues: AudioCue[] = [
        {
          id: `sfx-notify-${msg.id}`,
          type: "notification",
          src: "notification.mp3",
          volume: 0.5,
        },
      ];

      if (msg.attachmentUrl) {
        audioCues.push({
          id: `sfx-hit-${msg.id}`,
          type: "horror_hit",
          src: "audio/horror_hit.wav",
          volume: 0.7,
        });
      }

      if (msg.voiceEvent === "call_ringing") {
        audioCues.push({
          id: `sfx-ring-${msg.id}`,
          type: "discord_ring",
          src: "audio/discord_ring.wav",
          volume: 0.6,
        });
      } else if (msg.voiceEvent === "user_joined") {
        audioCues.push({
          id: `sfx-join-${msg.id}`,
          type: "discord_join",
          src: "audio/discord_join.wav",
          volume: 0.65,
        });
      }

      let cutaway: VisualCutaway | undefined = undefined;
      if (
        msg.cutaway &&
        typeof msg.cutaway === "object" &&
        "type" in msg.cutaway &&
        typeof (msg.cutaway as { type: unknown }).type === "string"
      ) {
        cutaway = msg.cutaway as VisualCutaway;
      }

      return {
        id: msg.id,
        author: msg.author,
        content: msg.content,
        time: msg.time,
        avatarUrl,
        color,
        mention: msg.mention,
        attachmentUrl: msg.attachmentUrl,
        attachmentCaption: msg.attachmentCaption,
        cutaway,
        reactions: msg.reactions,
        voiceEvent: msg.voiceEvent,
        startFrame: msg.startFrame,
        durationInFrames: msg.durationInFrames,
        audioCues,
      };
    });

    return {
      sceneId: scene.sceneId,
      channelName: scene.channelName,
      channelType: scene.channelType,
      channelCategory: scene.channelCategory,
      topic: scene.topic,
      voiceMembers: scene.voiceMembers,
      speakingMember: scene.speakingMember,
      messages,
    };
  });

  const production: ProductionInstruction = {
    format: "longform",
    fps: 30,
    width: 1920,
    height: 1080,
    minReadingSeconds: 1.4,
    attachmentDwellSeconds: 4.0,
    endPaddingSeconds: 4.0,
  };

  return {
    schemaVersion: STUDIO_SCHEMA_VERSION,
    title: raw.title,
    format: "longform",
    description: raw.description,
    tags: raw.tags,
    cast: Array.from(castMap.values()),
    scenes,
    production,
    rawAttachments: raw.attachments,
    customThumbnailPrompt: raw.mrbeastThumbnailPrompt,
  };
}

/**
 * Converts a canonical StudioScript back into LegacyLongformScriptData
 * as expected by longform/data/script_longform.json and LongformComposition.tsx.
 */
export function toLegacyLongformScriptData(script: StudioScript): LegacyLongformScriptData {
  const scenes: LegacyLongformScene[] = script.scenes.map((scene) => ({
    sceneId: scene.sceneId,
    channelName: scene.channelName,
    channelType: scene.channelType,
    channelCategory: scene.channelCategory,
    topic: scene.topic,
    voiceMembers: scene.voiceMembers,
    speakingMember: scene.speakingMember,
    messages: scene.messages.map((msg) => ({
      id: msg.id,
      author: msg.author,
      content: msg.content,
      time: msg.time,
      avatarUrl: msg.avatarUrl,
      color: msg.color,
      mention: msg.mention,
      cutaway: msg.cutaway,
      attachmentUrl: msg.attachmentUrl,
      attachmentCaption: msg.attachmentCaption,
      reactions: msg.reactions,
      voiceEvent: msg.voiceEvent,
      startFrame: msg.startFrame,
      durationInFrames: msg.durationInFrames,
    })),
  }));

  return {
    title: script.title,
    description: script.description || "",
    tags: script.tags || [],
    mrbeastThumbnailPrompt: script.customThumbnailPrompt,
    attachments: script.rawAttachments,
    scenes,
  };
}

/**
 * Converts a canonical StudioScript into the exact LongformScene[] structure
 * required by longform/src/DesktopDiscord.tsx.
 */
export function toLegacyLongformScenes(script: StudioScript): LegacyLongformScene[] {
  return toLegacyLongformScriptData(script).scenes;
}
