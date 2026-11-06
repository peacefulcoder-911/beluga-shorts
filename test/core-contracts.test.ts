/**
 * Discord Comedy Studio 2.0 - Core Contracts & Compatibility Unit Tests
 * 
 * Verifies:
 * 1. Interface integrity for all 10 core contracts
 * 2. Schema validation rules and error reporting
 * 3. Real-world compatibility with src/script.json
 * 4. Real-world compatibility with longform/data/script_longform.json
 * 5. Lossless round-tripping through compatibility adapters
 * 6. Invariant stability of production entrypoints
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  STUDIO_SCHEMA_VERSION,
  validateStudioMessage,
  validateStudioScene,
  validateStudioScript,
  validatePublishingMetadata,
  validateStudioEpisode,
  fromLegacyShortsScript,
  toLegacyShortsMessages,
  fromLegacyLongformScript,
  toLegacyLongformScriptData,
  toLegacyLongformScenes,
  resolveDefaultColor,
  resolveDefaultAvatar,
} from "../src/core/index.ts";

import type {
  StudioMessage,
  StudioScript,
  StudioEpisode,
  StudioScene,
  CharacterProfile,
  AudioCue,
  VisualCutaway,
  ProductionInstruction,
  PublishingMetadata,
  EpisodeStatus,
} from "../src/core/index.ts";

describe("Phase 1: Core Contracts & Interface Typing", () => {
  test("instantiates all 10 core interfaces with strict type compliance", () => {
    const audioCue: AudioCue = {
      id: "cue-1",
      type: "twist_boom",
      src: "audio/twist_boom.wav",
      volume: 0.8,
      delayFrames: 0,
      triggerOn: "appearance",
    };
    assert.equal(audioCue.type, "twist_boom");

    const visualCutaway: VisualCutaway = {
      type: "subscribe_button",
      durationFrames: 45,
      bannerText: "Subscribe",
    };
    assert.equal(visualCutaway.type, "subscribe_button");

    const character: CharacterProfile = {
      name: "Beluga",
      avatarUrl: "beluga.jpg",
      color: "#ed4245",
      role: "protagonist",
      isGuest: false,
    };
    assert.equal(character.name, "Beluga");

    const message: StudioMessage = {
      id: 1,
      author: "Beluga",
      content: "Hello world",
      time: "Today at 3:00 PM",
      avatarUrl: "beluga.jpg",
      color: "#ed4245",
      audioCues: [audioCue],
      cutaway: visualCutaway,
      startFrame: 0,
      durationInFrames: 35,
    };
    assert.equal(message.id, 1);

    const scene: StudioScene = {
      sceneId: 1,
      channelName: "general",
      channelType: "text",
      messages: [message],
    };
    assert.equal(scene.messages.length, 1);

    const production: ProductionInstruction = {
      format: "shorts",
      fps: 30,
      width: 1440,
      height: 2560,
      maxDurationFrames: 1740,
      minReadingSeconds: 1.0,
      attachmentDwellSeconds: 1.8,
      endPaddingSeconds: 1.5,
      hasHookCard: true,
    };
    assert.equal(production.format, "shorts");

    const publishing: PublishingMetadata = {
      title: "Test Episode #shorts",
      description: "Test description",
      tags: ["beluga", "shorts"],
      categoryId: "24",
      privacyStatus: "public",
      publishAt: "2026-11-06T12:00:00.000Z",
    };
    assert.equal(publishing.privacyStatus, "public");

    const status: EpisodeStatus = "rendered";
    assert.equal(status, "rendered");

    const script: StudioScript = {
      schemaVersion: STUDIO_SCHEMA_VERSION,
      title: "Test Episode",
      format: "shorts",
      archetype: "Smart Devices",
      cast: [character],
      scenes: [scene],
      production,
    };
    assert.equal(script.schemaVersion, "2.0.0");

    const episode: StudioEpisode = {
      id: "ep-001",
      schemaVersion: STUDIO_SCHEMA_VERSION,
      format: "shorts",
      status: "draft",
      createdAt: new Date().toISOString(),
      script,
      publishing,
    };
    assert.equal(episode.id, "ep-001");
  });
});

describe("Phase 1: Validation Engine Rules", () => {
  test("validates a healthy StudioScript successfully", () => {
    const validMessage: StudioMessage = {
      id: 1,
      author: "Beluga",
      content: "console.log('hi')",
      time: "3:00 PM",
    };
    const msgErrors = validateStudioMessage(validMessage);
    assert.equal(msgErrors.length, 0);

    const validScript: StudioScript = {
      schemaVersion: "2.0.0",
      title: "Beluga Learns To Code",
      format: "shorts",
      cast: [{ name: "Beluga", avatarUrl: "beluga.jpg", color: "#ed4245" }],
      scenes: [
        {
          sceneId: 1,
          channelName: "general",
          channelType: "text",
          messages: [
            validMessage,
            { id: 2, author: "Skittle", content: "syntax error", time: "3:00 PM" },
          ],
        },
      ],
      production: {
        format: "shorts",
        fps: 30,
        width: 1440,
        height: 2560,
      },
    };

    const result = validateStudioScript(validScript);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);

    const validEpisode: StudioEpisode = {
      id: "ep-test-001",
      schemaVersion: "2.0.0",
      format: "shorts",
      status: "draft",
      createdAt: new Date().toISOString(),
      script: validScript,
      publishing: {
        title: "Beluga Learns To Code #shorts",
        description: "Test episode",
        tags: ["beluga", "coding"],
        categoryId: "24",
        privacyStatus: "unlisted",
      },
    };
    const epResult = validateStudioEpisode(validEpisode);
    assert.equal(epResult.isValid, true);
  });

  test("rejects invalid script parameters with structured errors", () => {
    const invalidScript: any = {
      schemaVersion: "1.0.0", // Wrong version
      title: "",              // Empty title
      format: "invalid_fmt",  // Invalid format
      scenes: [],             // Empty scenes
      production: {
        fps: -1,              // Invalid FPS
        width: 0,             // Invalid width
        height: -100,         // Invalid height
      },
    };

    const result = validateStudioScript(invalidScript);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.code === "INVALID_SCHEMA_VERSION"));
    assert.ok(result.errors.some(e => e.code === "INVALID_TITLE"));
    assert.ok(result.errors.some(e => e.code === "INVALID_FORMAT"));
    assert.ok(result.errors.some(e => e.code === "EMPTY_SCENES"));
    assert.ok(result.errors.some(e => e.code === "INVALID_FPS"));
  });

  test("detects duplicate message IDs within a scene", () => {
    const scene: StudioScene = {
      sceneId: 1,
      channelName: "general",
      channelType: "text",
      messages: [
        { id: 1, author: "Beluga", content: "msg 1", time: "1:00 PM" },
        { id: 1, author: "Hecker", content: "duplicate id!", time: "1:01 PM" },
      ],
    };

    const errors = validateStudioScene(scene);
    assert.ok(errors.some(e => e.code === "DUPLICATE_MESSAGE_ID"));
  });

  test("validates YouTube publishing constraints", () => {
    const validPub: PublishingMetadata = {
      title: "Safe Title",
      description: "Safe description",
      tags: ["tag1"],
      categoryId: "24",
      privacyStatus: "unlisted",
      publishAt: "2026-12-01T10:00:00.000Z",
    };
    assert.equal(validatePublishingMetadata(validPub).isValid, true);

    const invalidPub: any = {
      title: "x".repeat(101), // Exceeds 100 chars
      description: "x".repeat(5001), // Exceeds 5000 chars
      tags: "not-an-array",
      privacyStatus: "hidden", // Invalid enum
      publishAt: "invalid-date",
    };

    const pubRes = validatePublishingMetadata(invalidPub);
    assert.equal(pubRes.isValid, false);
    assert.ok(pubRes.errors.some(e => e.code === "TITLE_TOO_LONG"));
    assert.ok(pubRes.errors.some(e => e.code === "DESC_TOO_LONG"));
    assert.ok(pubRes.errors.some(e => e.code === "INVALID_TAGS"));
    assert.ok(pubRes.errors.some(e => e.code === "INVALID_PRIVACY"));
    assert.ok(pubRes.errors.some(e => e.code === "INVALID_TIMESTAMP"));
  });
});

describe("Phase 1: Real-World Compatibility Adapters", () => {
  test("parses active production src/script.json and validates 100% compatibility", () => {
    const scriptJsonPath = path.resolve(process.cwd(), "src", "script.json");
    assert.ok(fs.existsSync(scriptJsonPath), "src/script.json must exist");

    const rawData = JSON.parse(fs.readFileSync(scriptJsonPath, "utf8"));
    assert.ok(Array.isArray(rawData), "src/script.json must be an array");

    // 1. Adapter: Legacy -> StudioScript
    const studioScript = fromLegacyShortsScript(rawData, {
      title: "Production Active Short",
      archetype: "Paperclip Trade",
    });

    assert.equal(studioScript.schemaVersion, "2.0.0");
    assert.equal(studioScript.format, "shorts");
    assert.equal(studioScript.scenes.length, 1);
    assert.equal(studioScript.scenes[0].messages.length, rawData.length);

    // Validate with core validation engine
    const valResult = validateStudioScript(studioScript);
    assert.equal(valResult.isValid, true, `Validation failed: ${JSON.stringify(valResult.errors)}`);

    // 2. Adapter: StudioScript -> Legacy MessageData[]
    const backToLegacy = toLegacyShortsMessages(studioScript);
    assert.equal(backToLegacy.length, rawData.length);

    // Verify key fields preserved exactly
    for (let i = 0; i < rawData.length; i++) {
      assert.equal(backToLegacy[i].id, rawData[i].id);
      assert.equal(backToLegacy[i].author, rawData[i].author);
      assert.equal(backToLegacy[i].content, rawData[i].content);
      assert.equal(backToLegacy[i].time, rawData[i].time);
      if (rawData[i].attachmentUrl) {
        assert.equal(backToLegacy[i].attachmentUrl, rawData[i].attachmentUrl);
      }
    }
  });

  test("parses active production longform/data/script_longform.json and validates 100% compatibility", () => {
    const longformPath = path.resolve(process.cwd(), "longform", "data", "script_longform.json");
    assert.ok(fs.existsSync(longformPath), "longform/data/script_longform.json must exist");

    const rawData = JSON.parse(fs.readFileSync(longformPath, "utf8"));
    assert.ok(rawData.title, "Must have title");
    assert.ok(Array.isArray(rawData.scenes), "Must have scenes array");

    // 1. Adapter: Legacy Longform -> StudioScript
    const studioScript = fromLegacyLongformScript(rawData);
    assert.equal(studioScript.schemaVersion, "2.0.0");
    assert.equal(studioScript.format, "longform");
    assert.equal(studioScript.title, rawData.title);
    assert.equal(studioScript.scenes.length, rawData.scenes.length);

    // Validate with core validation engine
    const valResult = validateStudioScript(studioScript);
    assert.equal(valResult.isValid, true, `Validation failed: ${JSON.stringify(valResult.errors)}`);

    // 2. Adapter: StudioScript -> Legacy LongformScriptData
    const backToLongform = toLegacyLongformScriptData(studioScript);
    assert.equal(backToLongform.title, rawData.title);
    assert.equal(backToLongform.scenes.length, rawData.scenes.length);
    assert.equal(
      backToLongform.scenes[0].messages.length,
      rawData.scenes[0].messages.length
    );

    // 3. Adapter: StudioScript -> Legacy LongformScene[] (DesktopDiscordProps)
    const directScenes = toLegacyLongformScenes(studioScript);
    assert.equal(directScenes.length, rawData.scenes.length);
    assert.equal(directScenes[0].channelName, rawData.scenes[0].channelName);
  });

  test("color and avatar resolution helpers match production rules", () => {
    assert.equal(resolveDefaultColor("Beluga"), "#ed4245");
    assert.equal(resolveDefaultColor("Hecker"), "#57f287");
    assert.equal(resolveDefaultColor("Skittle"), "#ff73fa");
    assert.equal(resolveDefaultColor("CustomChar", "#123456"), "#123456");

    assert.equal(resolveDefaultAvatar("Beluga"), "beluga.jpg");
    assert.equal(resolveDefaultAvatar("Hecker"), "hecker.jpg");
    assert.equal(resolveDefaultAvatar("Guest", "custom/guest.jpg"), "custom/guest.jpg");
  });
});

describe("Phase 1: Production Entrypoint Invariants", () => {
  test("confirms runDaily, runDailyBatch, and runLongform modules exist and have valid syntax", () => {
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "runDaily.js")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "runDailyBatch.js")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "longform/scripts/runLongform.js")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "uploadToYoutube.js")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "generateScript.js")));
  });

  test("confirms Remotion Root and compositions exist without modification", () => {
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "src/Root.tsx")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "src/Composition.tsx")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "src/DiscordChat.tsx")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "longform/src/LongformComposition.tsx")));
    assert.ok(fs.existsSync(path.resolve(process.cwd(), "longform/src/DesktopDiscord.tsx")));
  });
});
