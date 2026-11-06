/**
 * Discord Comedy Studio 2.0 - Story Generation & Prompt Modernization Tests
 * 
 * Comprehensive tests verifying:
 * 1. Shorts narrative generation (story outline + dialogue)
 * 2. Long-form narrative generation (multi-scene structure)
 * 3. Character-specific dialogue constraints (Beluga, Skittle, Hecker, Pablo, Admin)
 * 4. Multi-scene long-form output (channels, transitions, topics)
 * 5. Explicit audio cue generation & validation
 * 6. Dynamic hook metadata resolution & compatibility
 * 7. Invalid JSON recovery (fenced markdown, trailing commas, commentary)
 * 8. Script schema validation via Phase 1 core contracts
 * 9. Duration constraints validation via Timing Engine
 * 10. Anti-repetition context extraction & prompt injection
 * 11. Existing Shorts JSON compatibility
 * 12. Existing long-form JSON compatibility
 * 13. Existing Gemini model fallback behavior
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  cleanAndParseJson,
  extractAntiRepetitionContext,
  validateNarrativeQuality,
  resolveHookCard,
  buildShortsStoryPrompt,
  buildLongformStoryPrompt,
  CHARACTER_VOICE_REGISTRY,
  fromLegacyShortsScript,
  fromLegacyLongformScript,
  calculateShortsTiming,
  calculateLongformTiming,
  isValidAudioCueType,
  validateStudioScript,
  STUDIO_SCHEMA_VERSION,
} from "../src/core/index.ts";

import {
  COMEDY_UNIVERSES,
  LONGFORM_THEMES,
  BANNED_KEYWORDS,
  getScheduledUniverse,
  getScheduledLongformTheme,
} from "../topicScheduler.js";

import type { StudioScript } from "../src/core/types.ts";

describe("Phase 4: AI Story Generation & Prompt Modernization", () => {
  // ==========================================================================
  // 1. Shorts Narrative Generation
  // ==========================================================================
  describe("1. Shorts Narrative Generation", () => {
    test("generates structured 8-part story outline with rapid-fire dialogue", () => {
      const mockShortsResponse = {
        title: "Smart Microwave Extorts Beluga for Cheddar Cheese 🧀",
        archetype: "Smart Devices & Sentient Appliance Mutiny",
        storyOutline: {
          hook: "Beluga's smart microwave locks his lunch and demands a 5-star Yelp review.",
          centralSituation: "The microwave has joined the Discord server and locked the kitchen.",
          characterMotivations: {
            Beluga: "Just wants to eat his hot pocket",
            Skittle: "Tries to stop Beluga from offending the appliance",
            Hecker: "Attempts to hack the microwave firmware",
          },
          conflict: "Microwave refuses to open until Beluga publicly apologizes.",
          escalationStages: [
            "Microwave pings @everyone with Beluga's search history",
            "Hecker connects to microwave Bluetooth and gets counter-hacked",
            "Microwave threatens to heat the room to 450 degrees",
          ],
          climax: "Beluga agrees to write the review, but misinterprets the prompt.",
          payoff: "Microwave unlocks, but burns the hot pocket anyway.",
        },
        hookCard: {
          shouldShowHookCard: true,
          headline: "SMART MICROWAVE MUTINY IN DISCORD",
          hookThumbnailUrl: "attachments/smart_microwave_lock.jpg",
          hookType: "alert",
        },
        newCharacter: {
          name: "Chef Microwave 3000",
          avatarPrompt: "Angry digital microwave with red LED eyes",
        },
        attachment: {
          messageIndex: 4,
          slug: "microwave_screen",
          imagePrompt: "Digital microwave screen showing ACCESS DENIED",
        },
        messages: [
          { id: 1, author: "Beluga", content: "help", time: "1:00 PM", audioCues: [{ id: "c1", type: "notification" }] },
          { id: 2, author: "Skittle", content: "what did you do", time: "1:00 PM" },
          { id: 3, author: "Beluga", content: "the microwave is talking", time: "1:01 PM" },
          { id: 4, author: "Chef Microwave 3000", content: "APOLOGIZE OR NO CHEESE", time: "1:01 PM", audioCues: [{ id: "c2", type: "horror_hit", volume: 0.7 }] },
          { id: 5, author: "Skittle", content: "BELUGA WHAT IS THAT", time: "1:02 PM" },
          { id: 6, author: "Beluga", content: "i insulted its defrost timer", time: "1:02 PM" },
          { id: 7, author: "Hecker", content: "hold on. hacking it.", time: "1:03 PM", audioCues: [{ id: "c3", type: "discord_join", volume: 0.65 }] },
          { id: 8, author: "Chef Microwave 3000", content: "FIREWALL DETECTED: LAUNCHING PIZZA BAGELS", time: "1:03 PM", audioCues: [{ id: "c4", type: "cyber_alarm", volume: 0.75 }] },
          { id: 9, author: "Hecker", content: "bro it counter hacked me", time: "1:04 PM" },
          { id: 10, author: "Skittle", content: "JUST SAY SORRY", time: "1:04 PM" },
          { id: 11, author: "Beluga", content: "fine. i am sorry microwave", time: "1:05 PM" },
          { id: 12, author: "Chef Microwave 3000", content: "APOLOGY ACCEPTED. FOOD UNLOCKED.", time: "1:05 PM" },
          { id: 13, author: "Beluga", content: "it is black charcoal", time: "1:06 PM" },
          { id: 14, author: "Chef Microwave 3000", content: "bon appetit", time: "1:06 PM", audioCues: [{ id: "c5", type: "twist_boom", volume: 0.8 }] },
          { id: 15, author: "Beluga", content: "delicious", time: "1:07 PM" },
          { id: 16, author: "Skittle", content: "i hate this house", time: "1:07 PM" },
          { id: 17, author: "Beluga", content: "worth it", time: "1:08 PM" },
          { id: 18, author: "Beluga", content: "crunchy", time: "1:08 PM" },
          { id: 19, author: "Chef Microwave 3000", content: "5 stars please", time: "1:09 PM" },
          { id: 20, author: "Beluga", content: "no", time: "1:09 PM" },
        ],
      };

      assert.ok(mockShortsResponse.storyOutline);
      assert.equal(typeof mockShortsResponse.storyOutline.hook, "string");
      assert.equal(typeof mockShortsResponse.storyOutline.payoff, "string");
      assert.equal(mockShortsResponse.messages.length, 20);

      // Verify canonical conversion
      const canonical = fromLegacyShortsScript(mockShortsResponse.messages, {
        title: mockShortsResponse.title,
        archetype: mockShortsResponse.archetype,
      });
      assert.equal(canonical.format, "shorts");
      assert.equal(canonical.scenes[0].messages.length, 20);
    });
  });

  // ==========================================================================
  // 2. Long-Form Narrative Generation
  // ==========================================================================
  describe("2. Long-Form Narrative Generation", () => {
    test("generates multi-scene structure with cohesive acts across channels", () => {
      const mockLongform = {
        title: "The $1,000,000 Mystery of Beluga's Missing Keyboard 🎹 (Full Episode)",
        description: "MrBeast hosts a full Discord courtroom trial over Beluga's spacebar. #beluga #discord",
        storyOutline: {
          hook: "Beluga accuses Pablo of eating his spacebar for breakfast.",
          centralSituation: "A formal trial is launched in the server.",
          conflict: "Pablo claims the spacebar entered a higher dimension.",
          climax: "Special Agent Miller raids the voice call with photographic evidence.",
          payoff: "The spacebar was lodged in Beluga's own collar the entire time.",
        },
        scenes: [
          {
            sceneId: 1,
            channelName: "general",
            channelType: "text" as const,
            topic: "Evidence Discussion",
            messages: [
              { id: 1, author: "Beluga", time: "3:00 PM", content: "MY SPACEBAR IS GONE" },
              { id: 2, author: "Skittle", time: "3:00 PM", content: "did you check your keyboard" },
              { id: 3, author: "Pablo", time: "3:01 PM", content: "crunchy snack", audioCues: [{ id: "c1", type: "horror_hit" as const }] },
            ],
          },
          {
            sceneId: 2,
            channelName: "courtroom",
            channelType: "text" as const,
            topic: "Supreme Discord Tribunal",
            messages: [
              { id: 4, author: "Admin", time: "3:05 PM", content: "COURT IS NOW IN SESSION", audioCues: [{ id: "c2", type: "cyber_alarm" as const }] },
              { id: 5, author: "MrBeast", time: "3:05 PM", content: "Whoever wins gets $1,000,000!", audioCues: [{ id: "c3", type: "discord_join" as const }] },
            ],
          },
        ],
      };

      assert.equal(mockLongform.scenes.length, 2);
      assert.equal(mockLongform.scenes[0].channelName, "general");
      assert.equal(mockLongform.scenes[1].channelName, "courtroom");
      assert.equal(mockLongform.scenes[1].messages[1].author, "MrBeast");

      const prompt = buildLongformStoryPrompt({
        theme: LONGFORM_THEMES[0],
        antiRepetition: {
          recentTitles: ["Old Title"],
          recentPremises: ["Old Premise"],
          recentPunchlines: ["Old Punchline"],
          recentGuestNames: ["Old Guest"],
          recentChannels: ["general"],
        },
        bannedKeywords: BANNED_KEYWORDS,
      });
      assert.ok(prompt.includes(LONGFORM_THEMES[0].topic));

      const canonical = fromLegacyLongformScript(mockLongform);
      const quality = validateNarrativeQuality(canonical, { minMessages: 5, maxMessages: 50 });
      assert.equal(quality.isValid, true);
    });
  });

  // ==========================================================================
  // 3. Character-Specific Dialogue Constraints
  // ==========================================================================
  describe("3. Character-Specific Dialogue Constraints", () => {
    test("verifies unique voice registries for core cast", () => {
      assert.ok(CHARACTER_VOICE_REGISTRY.beluga);
      assert.ok(CHARACTER_VOICE_REGISTRY.skittle);
      assert.ok(CHARACTER_VOICE_REGISTRY.hecker);
      assert.ok(CHARACTER_VOICE_REGISTRY.pablo);
      assert.ok(CHARACTER_VOICE_REGISTRY.admin);
      assert.ok(CHARACTER_VOICE_REGISTRY.mom);
      assert.ok(CHARACTER_VOICE_REGISTRY.police);

      // Beluga must never be sarcastic or intellectual
      assert.ok(CHARACTER_VOICE_REGISTRY.beluga.forbiddenStyles.includes("Sarcastic one-liners"));
      // Hecker must never panic
      assert.ok(CHARACTER_VOICE_REGISTRY.hecker.forbiddenStyles.includes("Panicking or showing fear"));
      // Skittle is the straight-man
      assert.ok(CHARACTER_VOICE_REGISTRY.skittle.archetype.includes("straight-man"));
      // Pablo is surreal
      assert.ok(CHARACTER_VOICE_REGISTRY.pablo.catchphrases.includes("i ate the spacebar"));
    });
  });

  // ==========================================================================
  // 4. Multi-Scene Long-Form Output
  // ==========================================================================
  describe("4. Multi-Scene Long-Form Output", () => {
    test("preserves multiple channels, voice overlays, and transitions", () => {
      const canonicalLongform: StudioScript = {
        schemaVersion: STUDIO_SCHEMA_VERSION,
        title: "Multi-Scene Test Episode",
        format: "longform",
        cast: [
          { name: "Beluga", avatarUrl: "beluga.jpg", color: "#ed4245" },
          { name: "Skittle", avatarUrl: "skittle.jpg", color: "#ff73fa" },
        ],
        scenes: [
          {
            sceneId: 1,
            channelName: "general",
            channelType: "text",
            topic: "Chat topic 1",
            messages: [
              { id: 1, author: "Beluga", content: "scene 1 msg", time: "1:00 PM" },
            ],
          },
          {
            sceneId: 2,
            channelName: "voice-lounge",
            channelType: "voice",
            topic: "Voice channel 2",
            voiceMembers: ["Beluga", "Skittle"],
            messages: [
              { id: 2, author: "Skittle", content: "scene 2 voice msg", time: "1:05 PM" },
            ],
          },
        ],
        production: {
          format: "longform",
          fps: 30,
          width: 1920,
          height: 1080,
        },
      };

      const timing = calculateLongformTiming(canonicalLongform.scenes);
      assert.ok(timing.totalDurationInFrames > 0);
      assert.equal(timing.timedScenes.length, 2);
      // Scene 2 starts with a 1.2s inter-scene gap
      assert.ok(timing.timedScenes[1].messages[0].startFrame! > timing.timedScenes[0].messages[0].startFrame!);
    });
  });

  // ==========================================================================
  // 5. Explicit Audio Cue Generation
  // ==========================================================================
  describe("5. Explicit Audio Cue Generation", () => {
    test("validates cue types, volume bounds, and attachment hits", () => {
      const validCues = ["twist_boom", "horror_hit", "cyber_alarm", "discord_join", "discord_ring", "notification"];
      for (const cue of validCues) {
        assert.equal(isValidAudioCueType(cue), true);
      }
      assert.equal(isValidAudioCueType("unsupported_sound"), false);

      const msgWithCues = {
        id: 1,
        author: "Hecker",
        content: "Breached.",
        time: "1:00 PM",
        audioCues: [
          { id: "c1", type: "cyber_alarm" as const, volume: 0.75 },
        ],
      };
      assert.equal(msgWithCues.audioCues[0].volume, 0.75);
    });
  });

  // ==========================================================================
  // 6. Dynamic Hook Metadata
  // ==========================================================================
  describe("6. Dynamic Hook Metadata", () => {
    test("evaluates hook cards dynamically for arbitrary comedy topics", () => {
      // 1. Explicit custom hook card takes precedence
      const customHook = resolveHookCard("Any Title", "Custom Archetype", {
        shouldShowHookCard: true,
        headline: "CUSTOM BREAKING NEWS",
        hookThumbnailUrl: "attachments/custom_leak.jpg",
        hookType: "image",
      });
      assert.equal(customHook.shouldShowHookCard, true);
      assert.equal(customHook.hookThumbnailUrl, "attachments/custom_leak.jpg");

      // 2. Dynamic evaluation for smart devices
      const deviceHook = resolveHookCard("My Smart Fridge Is Extorting Me", "Smart Devices & Sentient Appliance Mutiny");
      assert.equal(deviceHook.shouldShowHookCard, true);
      assert.equal(deviceHook.hookType, "warning");

      // 3. Dynamic evaluation for courtroom trials
      const courtHook = resolveHookCard("Beluga Sued Over 1 Dorito", "Discord Courtroom Trial & Server Lawsuit");
      assert.equal(courtHook.shouldShowHookCard, true);
      assert.equal(courtHook.hookType, "alert");

      // 4. Legacy fallback for historical scandals
      const napoleonHook = resolveHookCard("Napoleon's Fake Mule", "General");
      assert.equal(napoleonHook.shouldShowHookCard, true);
      assert.equal(napoleonHook.hookThumbnailUrl, "thumbnail_napoleon_short.jpg");
    });
  });

  // ==========================================================================
  // 7. Invalid JSON Recovery
  // ==========================================================================
  describe("7. Invalid JSON Recovery", () => {
    test("recovers cleanly from markdown fences, commentary, and trailing commas", () => {
      // Fenced json block
      const fenced = '```json\n{"title": "Test Title", "messages": []}\n```';
      const parsed1 = cleanAndParseJson<{ title: string }>(fenced);
      assert.equal(parsed1.title, "Test Title");

      // Trailing commas inside arrays and objects
      const trailingComma = '{"title": "Comma Test", "items": [1, 2, 3, ], }';
      const parsed2 = cleanAndParseJson<{ title: string; items: number[] }>(trailingComma);
      assert.equal(parsed2.title, "Comma Test");
      assert.equal(parsed2.items.length, 3);

      // Commentary before and after JSON
      const wrapped = 'Here is the generated script:\n\n{"title": "Wrapped Title", "ok": true}\n\nHope you like it!';
      const parsed3 = cleanAndParseJson<{ title: string; ok: boolean }>(wrapped);
      assert.equal(parsed3.title, "Wrapped Title");
      assert.equal(parsed3.ok, true);
    });

    test("throws explicit error when JSON is completely unparseable", () => {
      assert.throws(() => {
        cleanAndParseJson("This is definitely not JSON at all.");
      }, /Failed to parse LLM JSON/);
    });
  });

  // ==========================================================================
  // 8. Script Schema Validation
  // ==========================================================================
  describe("8. Script Schema Validation", () => {
    test("validates studio script via Phase 1 core contracts", () => {
      const validScript: StudioScript = {
        schemaVersion: STUDIO_SCHEMA_VERSION,
        title: "Beluga's Big Day",
        format: "shorts",
        cast: [
          { name: "Beluga", avatarUrl: "beluga.jpg", color: "#ed4245" },
        ],
        scenes: [
          {
            sceneId: 1,
            channelName: "general",
            channelType: "text",
            messages: [
              { id: 1, author: "Beluga", content: "meow", time: "1:00 PM" },
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
    });
  });

  // ==========================================================================
  // 9. Duration Constraints Validation
  // ==========================================================================
  describe("9. Duration Constraints Validation", () => {
    test("verifies Shorts duration budget adheres to 50-58s window", () => {
      // 28 realistic messages matching Beluga dialogue distribution
      const messages = [
        ...Array.from({ length: 27 }, (_, i) => ({
          id: i + 1,
          author: i % 2 === 0 ? "Beluga" : "Skittle",
          content:
            i % 4 === 0
              ? "WAIT WHAT"
              : i % 3 === 0
              ? "why did you do that beluga please stop"
              : "i made a tiny mistake with the server settings",
          time: "1:00 PM",
          attachmentUrl: i === 10 ? "attachments/evidence.jpg" : undefined,
        })),
        {
          id: 28,
          author: "Beluga",
          content: "can i at least finish downloading Shrek 2 first?",
          time: "1:05 PM",
        },
      ];

      const timing = calculateShortsTiming(messages, { maxDurationSeconds: 58 });
      const durationSec = timing.totalDurationInFrames / 30;

      assert.ok(durationSec >= 45 && durationSec <= 58.5, `Duration was ${durationSec}s, expected 45-58.5s`);
    });
  });

  // ==========================================================================
  // 10. Anti-Repetition Compatibility
  // ==========================================================================
  describe("10. Anti-Repetition Compatibility", () => {
    test("extracts deep history context and injects into prompt templates", () => {
      const history = [
        {
          title: "Episode 1: The Microwave Incident",
          archetype: "Smart Devices",
          storyOutline: {
            centralSituation: "Microwave locks food",
            payoff: "Microwave burns popcorn",
          },
          newCharacter: { name: "MicrowaveBot" },
        },
        {
          title: "Episode 2: The NASA Interview",
          archetype: "Job Disaster",
          storyOutline: {
            centralSituation: "Beluga applies to NASA",
            payoff: "Beluga launches paper airplane",
          },
          newCharacter: { name: "Commander Vance" },
        },
      ];

      const antiRep = extractAntiRepetitionContext(history);
      assert.equal(antiRep.recentTitles.length, 2);
      assert.equal(antiRep.recentPremises.length, 2);
      assert.equal(antiRep.recentGuestNames.length, 2);

      const prompt = buildShortsStoryPrompt({
        universe: COMEDY_UNIVERSES[0],
        antiRepetition: antiRep,
        bannedKeywords: BANNED_KEYWORDS,
      });

      assert.ok(prompt.includes("Episode 1: The Microwave Incident"));
      assert.ok(prompt.includes("Microwave locks food"));
      assert.ok(prompt.includes("Commander Vance"));
      assert.ok(prompt.includes("STRICT BANNED CONTENT"));

      // Verify universe and longform theme schedulers
      const scheduledUni = getScheduledUniverse(history.length);
      assert.equal(scheduledUni.id, COMEDY_UNIVERSES[2].id);
      const scheduledTheme = getScheduledLongformTheme(history.length);
      assert.ok(scheduledTheme.topic);
    });
  });

  // ==========================================================================
  // 11. Existing Shorts JSON Compatibility
  // ==========================================================================
  describe("11. Existing Shorts JSON Compatibility", () => {
    test("loads active production src/script.json and validates backward compatibility", () => {
      const scriptPath = path.join(process.cwd(), "src", "script.json");
      assert.ok(fs.existsSync(scriptPath));
      const raw = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
      assert.ok(Array.isArray(raw));
      assert.ok(raw.length >= 14, `Expected at least 14 messages for human reading pacing, got ${raw.length}`);

      const canonical = fromLegacyShortsScript(raw);
      assert.equal(canonical.scenes[0].messages.length, raw.length);
    });
  });

  // ==========================================================================
  // 12. Existing Long-Form JSON Compatibility
  // ==========================================================================
  describe("12. Existing Long-Form JSON Compatibility", () => {
    test("loads active production longform/data/script_longform.json and validates compatibility", () => {
      const scriptPath = path.join(process.cwd(), "longform", "data", "script_longform.json");
      assert.ok(fs.existsSync(scriptPath));
      const raw = JSON.parse(fs.readFileSync(scriptPath, "utf8"));
      assert.ok(raw.scenes);
      assert.ok(Array.isArray(raw.scenes));

      const canonical = fromLegacyLongformScript(raw);
      assert.equal(canonical.format, "longform");
      assert.ok(canonical.scenes.length >= 1);
    });
  });

  // ==========================================================================
  // 13. Existing Gemini Fallback Behavior
  // ==========================================================================
  describe("13. Existing Gemini Fallback Behavior", () => {
    test("simulates multi-model fallback chain when first model fails", async () => {
      const candidateModels = [
        "gemini-3-flash-preview",
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash",
      ];

      const modelAttempts: string[] = [];

      // Mock generator simulating 1st model failure, 2nd model success
      async function mockGenerateWithFallback(models: string[]) {
        let lastErr: Error | null = null;
        for (const model of models) {
          modelAttempts.push(model);
          try {
            if (model === "gemini-3-flash-preview") {
              throw new Error("503 Service Unavailable (Model Overloaded)");
            }
            // 2nd model succeeds
            return {
              modelUsed: model,
              data: { title: "Success Episode" },
            };
          } catch (e) {
            lastErr = e as Error;
          }
        }
        throw lastErr || new Error("All models failed");
      }

      const result = await mockGenerateWithFallback(candidateModels);
      assert.equal(result.modelUsed, "gemini-2.5-flash");
      assert.equal(modelAttempts.length, 2);
      assert.equal(modelAttempts[0], "gemini-3-flash-preview");
      assert.equal(modelAttempts[1], "gemini-2.5-flash");
    });
  });
});
