/**
 * Discord Comedy Studio 2.0 - Core Validation Engine
 * 
 * Validates Studio contracts, schemas, message ordering, and publishing constraints.
 */

import { STUDIO_SCHEMA_VERSION } from "./types.ts";
import type {
  StudioScript,
  StudioScene,
  StudioMessage,
  PublishingMetadata,
  StudioEpisode,
  AudioCueType,
  CutawayType,
} from "./types.ts";

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

const VALID_AUDIO_TYPES: Set<AudioCueType> = new Set([
  "notification",
  "horror_hit",
  "twist_boom",
  "cyber_alarm",
  "creepy_sting",
  "discord_join",
  "discord_leave",
  "discord_ring",
  "comedy_bg",
  "creepy_bg",
  "custom",
]);

const VALID_CUTAWAY_TYPES: Set<CutawayType> = new Set([
  "youtube_channel",
  "subscribe_button",
  "image",
  "bank_account",
  "google_search",
]);

/**
 * Validates a single StudioMessage contract.
 */
export function validateStudioMessage(
  msg: unknown,
  path = "message"
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!msg || typeof msg !== "object") {
    errors.push({ path, message: "Message must be an object", code: "INVALID_TYPE" });
    return errors;
  }

  const m = msg as Partial<StudioMessage>;

  if (typeof m.id !== "number" || !Number.isInteger(m.id) || m.id < 0) {
    errors.push({ path: `${path}.id`, message: "Message ID must be a non-negative integer", code: "INVALID_ID" });
  }

  if (typeof m.author !== "string" || m.author.trim().length === 0) {
    errors.push({ path: `${path}.author`, message: "Author must be a non-empty string", code: "INVALID_AUTHOR" });
  }

  if (typeof m.content !== "string") {
    errors.push({ path: `${path}.content`, message: "Content must be a string", code: "INVALID_CONTENT" });
  }

  if (typeof m.time !== "string" || m.time.trim().length === 0) {
    errors.push({ path: `${path}.time`, message: "Timestamp must be a non-empty string", code: "INVALID_TIME" });
  }

  if (m.startFrame !== undefined && (typeof m.startFrame !== "number" || m.startFrame < 0)) {
    errors.push({ path: `${path}.startFrame`, message: "startFrame must be non-negative", code: "INVALID_FRAME" });
  }

  if (m.durationInFrames !== undefined && (typeof m.durationInFrames !== "number" || m.durationInFrames <= 0)) {
    errors.push({ path: `${path}.durationInFrames`, message: "durationInFrames must be greater than 0", code: "INVALID_DURATION" });
  }

  if (m.audioCues !== undefined) {
    if (!Array.isArray(m.audioCues)) {
      errors.push({ path: `${path}.audioCues`, message: "audioCues must be an array", code: "INVALID_AUDIO_CUES" });
    } else {
      m.audioCues.forEach((cue, idx) => {
        if (!cue || !VALID_AUDIO_TYPES.has(cue.type)) {
          errors.push({ path: `${path}.audioCues[${idx}].type`, message: `Invalid audio cue type: ${cue?.type}`, code: "INVALID_AUDIO_TYPE" });
        }
        if (cue?.volume !== undefined && (cue.volume < 0 || cue.volume > 1)) {
          errors.push({ path: `${path}.audioCues[${idx}].volume`, message: "Volume must be between 0.0 and 1.0", code: "INVALID_VOLUME" });
        }
      });
    }
  }

  if (m.cutaway !== undefined) {
    if (!m.cutaway || typeof m.cutaway !== "object" || !VALID_CUTAWAY_TYPES.has(m.cutaway.type)) {
      errors.push({ path: `${path}.cutaway.type`, message: `Invalid cutaway type: ${m.cutaway?.type}`, code: "INVALID_CUTAWAY_TYPE" });
    }
  }

  return errors;
}

/**
 * Validates a single StudioScene contract.
 */
export function validateStudioScene(
  scene: unknown,
  path = "scene"
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!scene || typeof scene !== "object") {
    errors.push({ path, message: "Scene must be an object", code: "INVALID_TYPE" });
    return errors;
  }

  const s = scene as Partial<StudioScene>;

  if (typeof s.sceneId !== "number" || !Number.isInteger(s.sceneId) || s.sceneId < 1) {
    errors.push({ path: `${path}.sceneId`, message: "sceneId must be a positive integer", code: "INVALID_SCENE_ID" });
  }

  if (typeof s.channelName !== "string" || s.channelName.trim().length === 0) {
    errors.push({ path: `${path}.channelName`, message: "channelName must be a non-empty string", code: "INVALID_CHANNEL" });
  }

  if (s.channelType !== "text" && s.channelType !== "voice" && s.channelType !== "dm") {
    errors.push({ path: `${path}.channelType`, message: "channelType must be 'text', 'voice', or 'dm'", code: "INVALID_CHANNEL_TYPE" });
  }

  if (!Array.isArray(s.messages) || s.messages.length === 0) {
    errors.push({ path: `${path}.messages`, message: "Scene must contain at least 1 message", code: "EMPTY_MESSAGES" });
  } else {
    const seenIds = new Set<number>();
    s.messages.forEach((msg, idx) => {
      const msgErrors = validateStudioMessage(msg, `${path}.messages[${idx}]`);
      errors.push(...msgErrors);

      if (msg && typeof msg.id === "number") {
        if (seenIds.has(msg.id)) {
          errors.push({ path: `${path}.messages[${idx}].id`, message: `Duplicate message id: ${msg.id}`, code: "DUPLICATE_MESSAGE_ID" });
        }
        seenIds.add(msg.id);
      }
    });
  }

  return errors;
}

/**
 * Validates a full StudioScript payload.
 */
export function validateStudioScript(script: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!script || typeof script !== "object") {
    return { isValid: false, errors: [{ path: "script", message: "Script must be an object", code: "INVALID_ROOT" }] };
  }

  const s = script as Partial<StudioScript>;

  if (s.schemaVersion !== STUDIO_SCHEMA_VERSION) {
    errors.push({ path: "script.schemaVersion", message: `schemaVersion must be '${STUDIO_SCHEMA_VERSION}'`, code: "INVALID_SCHEMA_VERSION" });
  }

  if (typeof s.title !== "string" || s.title.trim().length === 0) {
    errors.push({ path: "script.title", message: "Title must be a non-empty string", code: "INVALID_TITLE" });
  } else if (s.title.length > 100) {
    errors.push({ path: "script.title", message: "Title exceeds YouTube 100 character limit", code: "TITLE_TOO_LONG" });
  }

  if (s.format !== "shorts" && s.format !== "longform") {
    errors.push({ path: "script.format", message: "Format must be 'shorts' or 'longform'", code: "INVALID_FORMAT" });
  }

  if (!s.production || typeof s.production !== "object") {
    errors.push({ path: "script.production", message: "Production instructions are required", code: "MISSING_PRODUCTION" });
  } else {
    if (typeof s.production.fps !== "number" || s.production.fps <= 0) {
      errors.push({ path: "script.production.fps", message: "FPS must be a positive number", code: "INVALID_FPS" });
    }
    if (typeof s.production.width !== "number" || s.production.width <= 0) {
      errors.push({ path: "script.production.width", message: "Width must be a positive number", code: "INVALID_WIDTH" });
    }
    if (typeof s.production.height !== "number" || s.production.height <= 0) {
      errors.push({ path: "script.production.height", message: "Height must be a positive number", code: "INVALID_HEIGHT" });
    }
  }

  if (!Array.isArray(s.scenes) || s.scenes.length === 0) {
    errors.push({ path: "script.scenes", message: "Script must contain at least 1 scene", code: "EMPTY_SCENES" });
  } else {
    s.scenes.forEach((scene, idx) => {
      const sceneErrors = validateStudioScene(scene, `script.scenes[${idx}]`);
      errors.push(...sceneErrors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates YouTube publishing metadata constraints.
 */
export function validatePublishingMetadata(metadata: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!metadata || typeof metadata !== "object") {
    return { isValid: false, errors: [{ path: "publishing", message: "Publishing metadata must be an object", code: "INVALID_ROOT" }] };
  }

  const p = metadata as Partial<PublishingMetadata>;

  if (typeof p.title !== "string" || p.title.trim().length === 0) {
    errors.push({ path: "publishing.title", message: "Title is required", code: "MISSING_TITLE" });
  } else if (p.title.length > 100) {
    errors.push({ path: "publishing.title", message: "Title exceeds YouTube 100 character limit", code: "TITLE_TOO_LONG" });
  }

  if (typeof p.description !== "string") {
    errors.push({ path: "publishing.description", message: "Description must be a string", code: "INVALID_DESCRIPTION" });
  } else if (p.description.length > 5000) {
    errors.push({ path: "publishing.description", message: "Description exceeds YouTube 5000 character limit", code: "DESC_TOO_LONG" });
  }

  if (!Array.isArray(p.tags)) {
    errors.push({ path: "publishing.tags", message: "Tags must be an array of strings", code: "INVALID_TAGS" });
  }

  if (p.privacyStatus !== "public" && p.privacyStatus !== "private" && p.privacyStatus !== "unlisted") {
    errors.push({ path: "publishing.privacyStatus", message: "privacyStatus must be 'public', 'private', or 'unlisted'", code: "INVALID_PRIVACY" });
  }

  if (p.publishAt !== undefined) {
    const parsedDate = Date.parse(p.publishAt);
    if (isNaN(parsedDate)) {
      errors.push({ path: "publishing.publishAt", message: "publishAt must be a valid ISO 8601 timestamp", code: "INVALID_TIMESTAMP" });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an entire StudioEpisode lifecycle object.
 */
export function validateStudioEpisode(episode: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!episode || typeof episode !== "object") {
    return { isValid: false, errors: [{ path: "episode", message: "Episode must be an object", code: "INVALID_ROOT" }] };
  }

  const ep = episode as Partial<StudioEpisode>;

  if (typeof ep.id !== "string" || ep.id.trim().length === 0) {
    errors.push({ path: "episode.id", message: "Episode ID is required", code: "MISSING_ID" });
  }

  if (ep.schemaVersion !== STUDIO_SCHEMA_VERSION) {
    errors.push({ path: "episode.schemaVersion", message: `schemaVersion must be '${STUDIO_SCHEMA_VERSION}'`, code: "INVALID_SCHEMA_VERSION" });
  }

  const validStatuses = new Set(["draft", "rendered", "uploaded", "scheduled", "failed"]);
  if (!ep.status || !validStatuses.has(ep.status)) {
    errors.push({ path: "episode.status", message: `Invalid episode status: ${ep.status}`, code: "INVALID_STATUS" });
  }

  if (ep.script) {
    const scriptRes = validateStudioScript(ep.script);
    errors.push(...scriptRes.errors.map(e => ({ ...e, path: `episode.${e.path}` })));
  } else {
    errors.push({ path: "episode.script", message: "Episode must contain a script", code: "MISSING_SCRIPT" });
  }

  if (ep.publishing) {
    const pubRes = validatePublishingMetadata(ep.publishing);
    errors.push(...pubRes.errors.map(e => ({ ...e, path: `episode.${e.path}` })));
  } else {
    errors.push({ path: "episode.publishing", message: "Episode must contain publishing metadata", code: "MISSING_PUBLISHING" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
