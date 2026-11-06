/**
 * Discord Comedy Studio 2.0 - Audio Event Engine Unit Tests
 * 
 * Verifies:
 * - Complete coverage of all 11 supported AudioCueType categories
 * - Physical verification of real assets in public/
 * - Type, volume, and frame delay validation
 * - Handling of missing or custom assets
 * - Multiple cues per message
 * - 100% fidelity mapping of legacy trigger phrases
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  AUDIO_ASSET_REGISTRY,
  LEGACY_TRIGGER_PHRASES,
  isValidAudioCueType,
  isValidAudioVolume,
  isValidDelayFrames,
  validateAudioCue,
  checkAssetFileExists,
  resolveAudioCue,
  detectLegacyAudioCues,
  getEffectiveAudioCues,
  resolveMessageAudioCues,
} from "../src/core/audioRegistry.ts";

import type { AudioCue, StudioMessage, AudioCueType } from "../src/core/types.ts";

describe("Phase 2: Audio Registry - Supported Categories & Asset Existence", () => {
  const supportedTypes: AudioCueType[] = [
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
  ];

  test("registry defines definitions for all 11 supported cue types", () => {
    for (const type of supportedTypes) {
      assert.ok(
        isValidAudioCueType(type),
        `Type ${type} must be recognized by isValidAudioCueType`
      );
      const def = AUDIO_ASSET_REGISTRY[type];
      assert.ok(def, `Registry must contain definition for ${type}`);
      assert.ok(def.src, `Definition for ${type} must specify an asset path`);
      assert.ok(def.defaultVolume >= 0 && def.defaultVolume <= 1, "Default volume must be between 0 and 1");
    }
  });

  test("all default audio assets physically exist on disk in public/", () => {
    const publicDir = path.resolve(process.cwd(), "public");
    assert.ok(fs.existsSync(publicDir), "public directory must exist");

    // Check all non-custom assets
    for (const [type, def] of Object.entries(AUDIO_ASSET_REGISTRY)) {
      if (type === "custom") continue;
      const assetPath = path.resolve(publicDir, def.src);
      assert.ok(
        fs.existsSync(assetPath),
        `Asset file for ${type} (${def.src}) must exist at: ${assetPath}`
      );
    }
  });
});

describe("Phase 2: Audio Registry - Validation Rules", () => {
  test("validates volume range strictly (0.0 to 1.0)", () => {
    assert.equal(isValidAudioVolume(0.0), true);
    assert.equal(isValidAudioVolume(0.5), true);
    assert.equal(isValidAudioVolume(1.0), true);

    assert.equal(isValidAudioVolume(-0.1), false);
    assert.equal(isValidAudioVolume(1.05), false);
    assert.equal(isValidAudioVolume(NaN), false);
    assert.equal(isValidAudioVolume("0.5"), false);
    assert.equal(isValidAudioVolume(null), false);
  });

  test("validates frame delay non-negative integer constraint", () => {
    assert.equal(isValidDelayFrames(0), true);
    assert.equal(isValidDelayFrames(15), true);

    assert.equal(isValidDelayFrames(-1), false);
    assert.equal(isValidDelayFrames(2.5), false);
    assert.equal(isValidDelayFrames("10"), false);
  });

  test("validates complete AudioCue structures and produces structured errors", () => {
    const validCue: AudioCue = {
      id: "cue-valid",
      type: "horror_hit",
      volume: 0.7,
      delayFrames: 5,
    };
    const validRes = validateAudioCue(validCue);
    assert.equal(validRes.isValid, true);
    assert.equal(validRes.errors.length, 0);

    const invalidCue: any = {
      id: "",               // Missing id
      type: "unknown_sfx",  // Invalid type
      volume: 2.5,          // Invalid volume
      delayFrames: -10,     // Invalid delay
    };
    const invRes = validateAudioCue(invalidCue);
    assert.equal(invRes.isValid, false);
    assert.ok(invRes.errors.some((e) => e.code === "MISSING_ID"));
    assert.ok(invRes.errors.some((e) => e.code === "INVALID_TYPE"));
    assert.ok(invRes.errors.some((e) => e.code === "INVALID_VOLUME"));
    assert.ok(invRes.errors.some((e) => e.code === "INVALID_DELAY"));
  });

  test("requires src for custom audio cue type", () => {
    const badCustom: AudioCue = {
      id: "custom-1",
      type: "custom",
    };
    const res = validateAudioCue(badCustom);
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.code === "MISSING_CUSTOM_SRC"));

    const goodCustom: AudioCue = {
      id: "custom-2",
      type: "custom",
      src: "custom/sfx.mp3",
    };
    assert.equal(validateAudioCue(goodCustom).isValid, true);
  });
});

describe("Phase 2: Audio Registry - Asset Resolution & Multiple Cues", () => {
  test("resolves audio cues with default values when omitted", () => {
    const cue: AudioCue = {
      id: "notify-1",
      type: "notification",
    };

    const resolved = resolveAudioCue(cue, { verifyFilesystem: true });
    assert.equal(resolved.id, "notify-1");
    assert.equal(resolved.src, "notification.mp3");
    assert.equal(resolved.volume, 0.5);
    assert.equal(resolved.delayFrames, 0);
    assert.equal(resolved.triggerOn, "appearance");
    assert.equal(resolved.assetExists, true);
  });

  test("explicitly detects missing physical audio assets", () => {
    assert.equal(checkAssetFileExists("non_existent_sfx.wav"), false);

    const customMissing: AudioCue = {
      id: "missing-1",
      type: "custom",
      src: "audio/missing_track.wav",
    };
    const resolved = resolveAudioCue(customMissing, { verifyFilesystem: true });
    assert.equal(resolved.assetExists, false);
  });

  test("resolves multiple distinct cues on a single message", () => {
    const message: StudioMessage = {
      id: 1,
      author: "Hecker",
      content: "Mainframe breached",
      time: "2:00 AM",
      audioCues: [
        { id: "c1", type: "notification", volume: 0.5 },
        { id: "c2", type: "cyber_alarm", volume: 0.65, delayFrames: 0 },
        { id: "c3", type: "horror_hit", volume: 0.8, delayFrames: 10 },
      ],
    };

    const resolved = resolveMessageAudioCues(message, { verifyFilesystem: true });
    assert.equal(resolved.length, 3);
    assert.equal(resolved[0].type, "notification");
    assert.equal(resolved[1].type, "cyber_alarm");
    assert.equal(resolved[2].type, "horror_hit");
    assert.equal(resolved[2].delayFrames, 10);
    assert.ok(resolved.every((r) => r.assetExists === true));
  });
});

describe("Phase 2: Audio Registry - Legacy Trigger Phrase Compatibility", () => {
  test("preserves exact legacy triggers from DesktopDiscord.tsx", () => {
    // 1. Join trigger
    const joinCues = detectLegacyAudioCues("SPECIAL AGENT MILLER ARRIVED");
    assert.ok(joinCues.some((c) => c.type === "discord_join"));
    assert.ok(joinCues.some((c) => c.type === "notification"));

    // 2. Twist boom triggers
    for (const phrase of LEGACY_TRIGGER_PHRASES.twistBoom) {
      const cues = detectLegacyAudioCues(`Look: ${phrase}!`);
      assert.ok(
        cues.some((c) => c.type === "twist_boom"),
        `Phrase "${phrase}" must trigger twist_boom`
      );
    }

    // 3. Cyber alarm triggers (when not twist boom)
    for (const phrase of LEGACY_TRIGGER_PHRASES.cyberAlarm) {
      const cues = detectLegacyAudioCues(`WARNING: ${phrase}`);
      assert.ok(
        cues.some((c) => c.type === "cyber_alarm"),
        `Phrase "${phrase}" must trigger cyber_alarm`
      );
    }

    // 4. Heavy hit triggers (door battering / attachment)
    for (const phrase of LEGACY_TRIGGER_PHRASES.heavyHit) {
      const cues = detectLegacyAudioCues(`TARGET ${phrase}`);
      assert.ok(
        cues.some((c) => c.type === "horror_hit"),
        `Phrase "${phrase}" must trigger horror_hit`
      );
    }

    const attachCues = detectLegacyAudioCues("check this out", "Beluga", "attachments/proof.jpg");
    assert.ok(attachCues.some((c) => c.type === "horror_hit"));

    // 5. Tension sting triggers
    for (const phrase of LEGACY_TRIGGER_PHRASES.tensionSting) {
      const cues = detectLegacyAudioCues(phrase);
      assert.ok(
        cues.some((c) => c.type === "creepy_sting"),
        `Phrase "${phrase}" must trigger creepy_sting`
      );
    }
  });

  test("subscribe_button cutaways are dead-silent as specified in DesktopDiscord.tsx", () => {
    const subscribeMsg: StudioMessage = {
      id: 99,
      author: "System",
      content: "",
      time: "3:00 PM",
      cutaway: {
        type: "subscribe_button",
      },
    };

    const cues = getEffectiveAudioCues(subscribeMsg);
    assert.equal(cues.length, 0, "Subscribe button cutaways must not play sound");
  });
});

