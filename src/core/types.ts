/**
 * Discord Comedy Studio 2.0 - Core Types & Data Contracts
 * 
 * Defines canonical, strongly-typed interfaces bridging Short-form (9:16)
 * and Long-form (16:9) production pipelines.
 */

// ============================================================================
// 1. Schema Versions & System Constants
// ============================================================================

export const STUDIO_SCHEMA_VERSION = "2.0.0" as const;
export const LEGACY_SHORTS_SCHEMA = "1.0.0-shorts" as const;
export const LEGACY_LONGFORM_SCHEMA = "1.0.0-longform" as const;

export type SchemaVersion =
  | typeof STUDIO_SCHEMA_VERSION
  | typeof LEGACY_SHORTS_SCHEMA
  | typeof LEGACY_LONGFORM_SCHEMA;

export type ProductionFormat = "shorts" | "longform";

// ============================================================================
// 2. Audio Cue Contract
// ============================================================================

export type AudioCueType =
  | "notification"    // Classic Discord message ping (notification.mp3)
  | "horror_hit"      // Shock impact on image attachment / jump (audio/horror_hit.wav)
  | "twist_boom"      // Comedic vine boom punchline (audio/twist_boom.wav)
  | "cyber_alarm"     // Emergency klaxon / hack alert (audio/cyber_alarm.wav)
  | "creepy_sting"    // High-tension countdown shiver (audio/creepy_sting.wav)
  | "discord_join"    // User joins voice/channel (audio/discord_join.wav)
  | "discord_leave"   // User disconnects (audio/discord_leave.wav)
  | "discord_ring"    // Incoming call chime (audio/discord_ring.wav)
  | "comedy_bg"       // Ambient comedic lofi background (audio/comedy_lofi_bg.wav)
  | "creepy_bg"       // Ambient eerie background (audio/creepy_ambience.wav)
  | "custom";         // User-supplied custom SFX path

export interface AudioCue {
  id: string;
  type: AudioCueType;
  src?: string;             // Resolved asset path or staticFile relative path
  volume?: number;          // 0.0 to 1.0 (defaults to 0.5)
  delayFrames?: number;     // Frame offset relative to message start
  triggerOn?: "appearance" | "cutaway" | "event";
}

// ============================================================================
// 3. Visual Cutaway Contract
// ============================================================================

export type CutawayType =
  | "youtube_channel"
  | "subscribe_button"
  | "image"
  | "bank_account"
  | "google_search";

export interface VisualCutaway {
  type: CutawayType;
  channelName?: string;
  subscriberCount?: string;
  avatarUrl?: string;
  bannerText?: string;
  imageUrl?: string;
  searchQuery?: string;
  balance?: string;
  durationFrames?: number;
}

// ============================================================================
// 4. Character Profile Contract
// ============================================================================

export type CharacterRole =
  | "protagonist"   // e.g. Beluga
  | "antagonist"    // e.g. Admin, Fraud Agent, Police
  | "straight_man"  // e.g. Skittle
  | "hacker"        // e.g. Hecker
  | "guest"         // e.g. MrBeast, ExplodingTNT, Smart Fridge
  | "system";       // e.g. Server bot, System terminal

export interface CharacterProfile {
  name: string;
  avatarUrl: string;
  avatarPrompt?: string;    // Prompt used for dynamic image generation
  color: string;            // Hex color code for Discord username
  role?: CharacterRole;
  badge?: string;           // Optional badge, e.g. "BOT", "SYSTEM", "MOD"
  isGuest?: boolean;
}

// ============================================================================
// 5. Studio Message Contract
// ============================================================================

export interface ReactionData {
  emoji: string;
  count: number;
}

export interface StudioMessage {
  id: number;
  author: string;
  content: string;
  time: string;                     // e.g. "Today at 3:15 PM"
  avatarUrl?: string;
  color?: string;                   // Hex username color
  mention?: string;                 // e.g. "@everyone", "@Beluga"
  attachmentUrl?: string;           // Path to in-chat evidence/photo
  attachmentCaption?: string;
  audioCues?: AudioCue[];           // Explicit audio events mounted with message
  cutaway?: VisualCutaway;          // Full-screen gag cutaway (for Longform)
  reactions?: ReactionData[];
  voiceEvent?: "call_ringing" | "user_joined" | "user_left" | "call_ended";
  startFrame?: number;              // Calculated appearance frame
  durationInFrames?: number;        // Calculated on-screen duration in frames
}

// ============================================================================
// 6. Studio Scene Contract
// ============================================================================

export type ChannelType = "text" | "voice" | "dm";

export interface StudioScene {
  sceneId: number;
  channelName: string;              // e.g. "general", "secret-vault"
  channelType: ChannelType;
  channelCategory?: string;         // e.g. "TEXT CHANNELS"
  topic?: string;
  voiceMembers?: string[];          // Active members in voice call
  speakingMember?: string;          // Current speaker with green ring
  messages: StudioMessage[];
}

// ============================================================================
// 7. Production Instruction Contract
// ============================================================================

export interface ProductionInstruction {
  format: ProductionFormat;
  fps: number;                      // Standard: 30
  width: number;                    // 1440/1080 for Shorts, 1920 for Longform
  height: number;                   // 2560/1920 for Shorts, 1080 for Longform
  maxDurationFrames?: number;       // e.g. 58s * 30fps = 1740 for Shorts
  minReadingSeconds?: number;       // e.g. 1.0s for short lines
  attachmentDwellSeconds?: number;  // Extra dwell pause for attachments (1.8s or 4.0s)
  endPaddingSeconds?: number;       // Buffer after final punchline (1.5s - 4.0s)
  hasHookCard?: boolean;            // First-frame hook card on Shorts (frames 0-18)
  hookThumbnailUrl?: string;
  scaleFactor?: number;             // Pacing compression factor if exceeding limit
}

// ============================================================================
// 8. Publishing Metadata Contract
// ============================================================================

export type PrivacyStatus = "public" | "private" | "unlisted";

export interface PublishingMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId: string;               // Default: "24" (Entertainment)
  privacyStatus: PrivacyStatus;
  publishAt?: string;               // ISO 8601 UTC timestamp for scheduled release
  thumbnailPath?: string;           // Local path to rendered/downloaded thumbnail
  videoUrl?: string;                // Populated post-upload (e.g. "https://youtube.com/watch?v=...")
  videoId?: string;
  uploadedAt?: string;              // ISO 8601 timestamp of upload completion
}

// ============================================================================
// 9. Episode Status Contract
// ============================================================================

export type EpisodeStatus =
  | "draft"         // Script generated, not yet rendered
  | "rendered"      // MP4 video produced in out/
  | "uploaded"      // Live on YouTube
  | "scheduled"     // Uploaded with future publishAt timestamp
  | "failed";       // Pipeline error encountered

// ============================================================================
// 10. Studio Script Contract
// ============================================================================

export interface RawAttachmentSpec {
  messageIndex: number;
  slug: string;
  imagePrompt: string;
}

export interface StudioScript {
  schemaVersion: typeof STUDIO_SCHEMA_VERSION;
  title: string;
  format: ProductionFormat;
  archetype?: string;               // e.g. "Smart Devices & Sentient Appliance Mutiny"
  description?: string;
  tags?: string[];
  cast: CharacterProfile[];
  scenes: StudioScene[];
  production: ProductionInstruction;
  rawAttachments?: RawAttachmentSpec[];
  customThumbnailPrompt?: string;
}

// ============================================================================
// 11. Studio Episode Contract (Persistent Lifecycle Object)
// ============================================================================

export interface EpisodeArtifacts {
  videoPath?: string;               // e.g. "out/beluga_12345.mp4"
  thumbnailPath?: string;           // e.g. "out/thumbnail_12345.png"
  hookCardPath?: string;
  scriptPath?: string;
}

export interface StudioEpisode {
  id: string;                       // Unique episode identifier
  schemaVersion: typeof STUDIO_SCHEMA_VERSION;
  format: ProductionFormat;
  status: EpisodeStatus;
  createdAt: string;                // ISO 8601 timestamp
  script: StudioScript;
  publishing: PublishingMetadata;
  artifacts?: EpisodeArtifacts;
  error?: string;
}

