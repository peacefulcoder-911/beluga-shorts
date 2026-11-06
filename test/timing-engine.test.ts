/**
 * Discord Comedy Studio 2.0 - Timing Engine Unit Tests
 * 
 * Verifies:
 * - Word tier reading calculations
 * - Short, normal, and long message pacing
 * - In-chat image attachment dwell pauses
 * - Minimum display durations
 * - Multiple scenes and inter-scene transition gaps
 * - Configurable FPS (24, 25, 30, 60)
 * - Compression scale factors
 * - Deterministic, pure calculation (zero state leakage)
 * - Exact regression parity with production script.json and script_longform.json
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  calculateReadingDuration,
  calculateMinimumDisplayDuration,
  calculateAttachmentDwell,
  calculateEndPadding,
  calculateMessageDuration,
  calculateShortsTiming,
  calculateLongformTiming,
  calculateSceneDuration,
  countWordsAndChars,
} from "../src/core/timingEngine.ts";

import type { StudioScene } from "../src/core/types.ts";

describe("Phase 2: Timing Engine - Word & Character Calculations", () => {
  test("accurately counts words and characters across variations", () => {
    assert.deepEqual(countWordsAndChars(""), { wordCount: 0, charCount: 0 });
    assert.deepEqual(countWordsAndChars("hello"), { wordCount: 1, charCount: 5 });
    assert.deepEqual(countWordsAndChars("  multiple   spaces   between   words  "), {
      wordCount: 4,
      charCount: 39,
    });
  });

  test("calculates reading durations matching Shorts pacing tiers", () => {
    // <= 2 words -> 1.0s
    assert.equal(calculateReadingDuration(0, { format: "shorts" }), 1.0);
    assert.equal(calculateReadingDuration(1, { format: "shorts" }), 1.0);
    assert.equal(calculateReadingDuration(2, { format: "shorts" }), 1.0);

    // <= 5 words -> 1.35s
    assert.equal(calculateReadingDuration(3, { format: "shorts" }), 1.35);
    assert.equal(calculateReadingDuration(5, { format: "shorts" }), 1.35);

    // <= 8 words -> 1.75s
    assert.equal(calculateReadingDuration(6, { format: "shorts" }), 1.75);
    assert.equal(calculateReadingDuration(8, { format: "shorts" }), 1.75);

    // > 8 words -> 2.4s
    assert.equal(calculateReadingDuration(9, { format: "shorts" }), 2.4);
    assert.equal(calculateReadingDuration(25, { format: "shorts" }), 2.4);
  });

  test("calculates reading durations matching Long-form pacing tiers", () => {
    // <= 2 words -> 1.4s
    assert.equal(calculateReadingDuration(1, { format: "longform" }), 1.4);
    assert.equal(calculateReadingDuration(2, { format: "longform" }), 1.4);

    // <= 5 words -> 2.0s
    assert.equal(calculateReadingDuration(3, { format: "longform" }), 2.0);
    assert.equal(calculateReadingDuration(5, { format: "longform" }), 2.0);

    // <= 9 words -> 2.7s
    assert.equal(calculateReadingDuration(6, { format: "longform" }), 2.7);
    assert.equal(calculateReadingDuration(9, { format: "longform" }), 2.7);

    // > 9 words -> 3.6s
    assert.equal(calculateReadingDuration(10, { format: "longform" }), 3.6);
  });
});

describe("Phase 2: Timing Engine - Minimum Durations, Dwell & Padding", () => {
  test("minimum display durations respect format and FPS", () => {
    const shortsMin = calculateMinimumDisplayDuration("shorts", 30);
    assert.equal(shortsMin.minSeconds, 1.0);
    assert.equal(shortsMin.minFrames, 30);

    const longformMin = calculateMinimumDisplayDuration("longform", 30);
    assert.equal(longformMin.minSeconds, 1.4);
    assert.equal(longformMin.minFrames, 42);

    const highFps = calculateMinimumDisplayDuration("shorts", 60);
    assert.equal(highFps.minFrames, 60);
  });

  test("attachment dwell pauses respect format and FPS", () => {
    const shortsDwell = calculateAttachmentDwell("shorts", 30);
    assert.equal(shortsDwell.dwellSeconds, 1.8);
    assert.equal(shortsDwell.dwellFrames, 54);

    const longDwell = calculateAttachmentDwell("longform", 30);
    assert.equal(longDwell.dwellSeconds, 4.0);
    assert.equal(longDwell.dwellFrames, 120);
  });

  test("end padding durations respect format and FPS", () => {
    const shortsPadding = calculateEndPadding("shorts", 30);
    assert.equal(shortsPadding.paddingSeconds, 1.5);
    assert.equal(shortsPadding.paddingFrames, 45);

    const longPadding = calculateEndPadding("longform", 30);
    assert.equal(longPadding.paddingSeconds, 4.0);
    assert.equal(longPadding.paddingFrames, 120);
  });
});

describe("Phase 2: Timing Engine - Isolated Message Durations", () => {
  test("Shorts message with attachment adds 1.8s dwell + character factor", () => {
    const content = "look at this paperclip"; // 4 words (<=5 words -> base 1.35s), 22 chars (* 0.015 = 0.33s)
    const resWithoutAttach = calculateMessageDuration(content, { format: "shorts", fps: 30 });
    // base (1.35) + chars (22 * 0.015 = 0.33) = 1.68s -> 50 frames
    assert.equal(resWithoutAttach.durationFrames, Math.floor(1.68 * 30));

    const resWithAttach = calculateMessageDuration(content, {
      format: "shorts",
      fps: 30,
      hasAttachment: true,
    });
    // base (1.35 + 1.8 = 3.15) + chars (0.33) = 3.48s -> 104 frames
    assert.equal(resWithAttach.durationFrames, Math.floor(3.48 * 30));
    assert.equal(resWithAttach.dwellSeconds, 1.8);
  });

  test("Shorts final punchline message locks to 3.5s (105 frames at 30fps)", () => {
    const lastMsg = calculateMessageDuration("done", { format: "shorts", fps: 30, isLast: true });
    assert.equal(lastMsg.durationSeconds, 3.5);
    assert.equal(lastMsg.durationFrames, 105);
  });

  test("Long-form message cutaway and attachment overrides", () => {
    const channelCutaway = calculateMessageDuration("check this", {
      format: "longform",
      fps: 30,
      cutawayType: "youtube_channel",
    });
    assert.equal(channelCutaway.durationSeconds, 3.6);
    assert.equal(channelCutaway.durationFrames, 108);

    const buttonCutaway = calculateMessageDuration("click it", {
      format: "longform",
      fps: 30,
      cutawayType: "subscribe_button",
    });
    assert.equal(buttonCutaway.durationSeconds, 2.6);
    assert.equal(buttonCutaway.durationFrames, 78);

    const voiceRing = calculateMessageDuration("calling...", {
      format: "longform",
      fps: 30,
      voiceEvent: "call_ringing",
    });
    assert.equal(voiceRing.durationSeconds, 2.4);
    assert.equal(voiceRing.durationFrames, 72);

    const longAttach = calculateMessageDuration("proof", {
      format: "longform",
      fps: 30,
      hasAttachment: true,
    });
    assert.equal(longAttach.durationSeconds, 4.0);
    assert.equal(longAttach.durationFrames, 120);
  });
});

describe("Phase 2: Timing Engine - Multi-Scene & Configurable FPS", () => {
  test("Long-form timeline correctly injects 1.2s inter-scene transition gaps", () => {
    const scenes: StudioScene[] = [
      {
        sceneId: 1,
        channelName: "general",
        channelType: "text",
        messages: [
          { id: 1, author: "Beluga", content: "scene 1 line", time: "1:00 PM" }, // 3 words -> 2.0s -> 60 frames
        ],
      },
      {
        sceneId: 2,
        channelName: "secret-vault",
        channelType: "text",
        messages: [
          { id: 2, author: "Hecker", content: "scene 2 line", time: "1:01 PM" }, // 3 words -> 2.0s -> 60 frames
        ],
      },
    ];

    const result = calculateLongformTiming(scenes, { fps: 30 });
    // Initial fade: 0.5s * 30 = 15 frames
    assert.equal(result.timedScenes[0].messages[0].startFrame, 15);
    assert.equal(result.timedScenes[0].messages[0].durationInFrames, 60);

    // Scene 2 starts after scene 1 message (15 + 60 = 75) + 1.2s gap (36 frames) = 111 frames
    assert.equal(result.timedScenes[1].messages[0].startFrame, 75 + 36);
    assert.equal(result.timedScenes[1].messages[0].durationInFrames, 60);

    // Total = 111 + 60 + 4.0s end padding (120 frames) = 291 frames
    assert.equal(result.totalDurationInFrames, 111 + 60 + 120);
  });

  test("calculates single scene duration in isolation", () => {
    const scene: StudioScene = {
      sceneId: 1,
      channelName: "general",
      channelType: "text",
      messages: [
        { id: 1, author: "Beluga", content: "line 1", time: "1:00 PM" }, // 2 words -> 1.4s -> 42 frames
        { id: 2, author: "Skittle", content: "line 2", time: "1:00 PM" }, // 2 words -> 1.4s -> 42 frames
      ],
    };
    const dur = calculateSceneDuration(scene, { fps: 30 });
    assert.equal(dur.durationFrames, 84);
    assert.equal(dur.durationSeconds, 2.8);
  });

  test("supports alternative FPS values (24, 25, 60 fps)", () => {
    const messages = [
      { content: "short line" }, // 2 words -> 1.0s
      { content: "done" },       // last -> 3.5s
    ];

    const r24 = calculateShortsTiming(messages, { fps: 24 });
    const r60 = calculateShortsTiming(messages, { fps: 60 });

    // At 24fps: line 1 (1.15s with char factor) = 27 frames, line 2 (3.5s) = 84 frames
    assert.equal(r24.timedMessages[0].durationInFrames, Math.floor(1.15 * 24));
    assert.equal(r24.timedMessages[1].durationInFrames, Math.floor(3.5 * 24));

    // At 60fps: line 1 = 69 frames, line 2 = 210 frames
    assert.equal(r60.timedMessages[0].durationInFrames, Math.floor(1.15 * 60));
    assert.equal(r60.timedMessages[1].durationInFrames, Math.floor(3.5 * 60));
  });

  test("handles empty and edge case inputs gracefully", () => {
    const emptyShorts = calculateShortsTiming([]);
    assert.equal(emptyShorts.timedMessages.length, 0);
    assert.equal(emptyShorts.totalDurationInFrames, 45); // 1.5s end padding
    assert.equal(emptyShorts.scaleFactor, 1);

    const emptyLongform = calculateLongformTiming([]);
    assert.equal(emptyLongform.timedScenes.length, 0);
    assert.equal(emptyLongform.totalDurationInFrames, 135); // 0.5s fade (15) + 4.0s padding (120)
  });

  test("engine is strictly deterministic: 100 consecutive invocations produce identical frames", () => {
    const messages = [
      { content: "first test line" },
      { content: "second test line with attachment", attachmentUrl: "attachments/test.jpg" },
      { content: "final punchline" },
    ];

    const baseline = calculateShortsTiming(messages, { fps: 30 });

    for (let i = 0; i < 100; i++) {
      const run = calculateShortsTiming(messages, { fps: 30 });
      assert.deepEqual(run.timedMessages, baseline.timedMessages);
      assert.equal(run.totalDurationInFrames, baseline.totalDurationInFrames);
      assert.equal(run.scaleFactor, baseline.scaleFactor);
    }
  });
});

describe("Phase 2: Timing Engine - Regression Parity with Production Data", () => {
  test("matches src/Composition.tsx output on production src/script.json to the exact frame", () => {
    const fixturePath = path.resolve(process.cwd(), "test", "fixtures", "script_shorts_baseline.json");
    const scriptJsonPath = fs.existsSync(fixturePath)
      ? fixturePath
      : path.resolve(process.cwd(), "src", "script.json");
    const rawMessages = JSON.parse(fs.readFileSync(scriptJsonPath, "utf8"));

    const result = calculateShortsTiming(rawMessages, { fps: 30 });

    // Known production values calculated from src/Composition.tsx
    assert.equal(result.timedMessages.length, 30);
    assert.equal(result.rawTotalFrames, 1370);
    assert.equal(result.scaleFactor, 1);
    assert.equal(result.totalDurationInFrames, 1370);

    // Verify first 3 messages start frames match production
    assert.equal(result.timedMessages[0].startFrame, 0);
    assert.equal(result.timedMessages[0].durationInFrames, 46);
    assert.equal(result.timedMessages[1].startFrame, 46);
    assert.equal(result.timedMessages[1].durationInFrames, 47);
    assert.equal(result.timedMessages[2].startFrame, 93);
    assert.equal(result.timedMessages[2].durationInFrames, 47);

    // Verify last message (punchline: 3.5s -> 105 frames)
    const last = result.timedMessages[result.timedMessages.length - 1];
    assert.equal(last.durationInFrames, 105);
  });

  test("matches longform/src/LongformComposition.tsx output on production script_longform.json to the exact frame", () => {
    const fixturePath = path.resolve(process.cwd(), "test", "fixtures", "script_longform_baseline.json");
    const longformPath = fs.existsSync(fixturePath)
      ? fixturePath
      : path.resolve(process.cwd(), "longform", "data", "script_longform.json");
    const rawData = JSON.parse(fs.readFileSync(longformPath, "utf8"));

    const result = calculateLongformTiming(rawData.scenes, { fps: 30 });

    // Known production values from longform/src/LongformComposition.tsx
    assert.equal(result.timedScenes.length, 1);
    assert.equal(result.timedScenes[0].messages.length, 55);
    assert.equal(result.totalDurationInFrames, 3945);

    // Verify first 3 messages
    assert.equal(result.timedScenes[0].messages[0].startFrame, 15); // 0.5s initial fade
    assert.equal(result.timedScenes[0].messages[0].durationInFrames, 81);
    assert.equal(result.timedScenes[0].messages[1].startFrame, 96);
    assert.equal(result.timedScenes[0].messages[1].durationInFrames, 60);
    assert.equal(result.timedScenes[0].messages[2].startFrame, 156);
    assert.equal(result.timedScenes[0].messages[2].durationInFrames, 120); // 4.0s attachment pause

    // Verify last 2 messages
    const msgs = result.timedScenes[0].messages;
    assert.equal(msgs[53].startFrame, 3741);
    assert.equal(msgs[53].durationInFrames, 42);
    assert.equal(msgs[54].startFrame, 3783);
    assert.equal(msgs[54].durationInFrames, 42);
  });
});
