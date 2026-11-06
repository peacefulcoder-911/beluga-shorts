import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  TRENDING_CATALOG,
  getTrendingTopic,
  buildShortsStoryPrompt,
  calculateShortsTiming,
  extractAntiRepetitionContext,
  CHARACTER_VOICE_REGISTRY,
  productionDb,
  normalizeTitle,
  getTrendingTopicForSlot,
} from "../src/core/index.ts";
import { getTodaySlots } from "../runDailyBatch.js";

describe("Phase 4 Upgrade: Trending Topics Engine & Crazy Content", () => {
  test("TRENDING_CATALOG covers balanced daily categories (tech_ai, gaming, internet_culture)", () => {
    assert.ok(TRENDING_CATALOG.length >= 6, "Expected at least 6 trending topics in catalog");

    const categories = new Set(TRENDING_CATALOG.map((t) => t.category));
    assert.ok(categories.has("tech_ai"), "Expected tech_ai category");
    assert.ok(categories.has("gaming"), "Expected gaming category");
    assert.ok(categories.has("internet_culture"), "Expected internet_culture category");

    for (const topic of TRENDING_CATALOG) {
      assert.ok(topic.id.length > 0, "Topic id must not be empty");
      assert.ok(topic.title.length > 0, "Topic title must not be empty");
      assert.ok(topic.headline.length > 0, "Topic headline must not be empty");
      assert.ok(topic.hookHeadline.length > 0, "Topic hook headline must not be empty");
      assert.ok(topic.hookImageFilename.endsWith(".jpg"), "Hook image must be jpg filename");
      assert.ok(topic.guestCharacter.name.length > 0, "Guest character name required");
      assert.ok(topic.guestCharacter.avatarFilename.endsWith(".jpg"), "Guest avatar must be jpg");
      assert.ok(topic.evidenceFilename.endsWith(".jpg"), "Evidence attachment must be jpg");
      assert.ok(topic.escalationBeats.length >= 3, "Topic must have at least 3 escalation beats");
      assert.ok(topic.climaxEvent.length > 0, "Climax event required");
      assert.ok(topic.punchline.length > 0, "Punchline required");
    }
  });

  test("getTrendingTopic resolves catalog topics by query or id", () => {
    const deepseek = getTrendingTopic("deepseek");
    assert.equal(deepseek.id, "deepseek_r1_takeover");
    assert.equal(deepseek.guestCharacter.name, "DeepSeek Bot");

    const rtx = getTrendingTopic("rtx 5090");
    assert.equal(rtx.id, "rtx_5090_power_grid");
    assert.equal(rtx.guestCharacter.name, "Jensen Huang");

    const elon = getTrendingTopic("elon musk");
    assert.equal(elon.id, "elon_musk_buys_discord");

    const gta = getTrendingTopic("gta 6");
    assert.equal(gta.id, "gta_6_leak_discord");
  });

  test("getTrendingTopic synthesizes ad-hoc topic for unknown query", () => {
    const custom = getTrendingTopic("Quantum Toaster Hacker");
    assert.ok(custom.id.startsWith("custom_"));
    assert.ok(custom.hookHeadline.includes("QUANTUM TOASTER HACKER"));
    assert.ok(custom.guestCharacter.name.length > 0);
  });

  test("getTrendingTopic rotates daily when query is omitted", () => {
    const defaultTopic = getTrendingTopic();
    assert.ok(defaultTopic, "Default topic must be returned");
    assert.ok(TRENDING_CATALOG.some((t) => t.id === defaultTopic.id));
  });

  test("buildShortsStoryPrompt formats crazy trending prompt with strict rules", () => {
    const topic = getTrendingTopic("deepseek");
    const antiRepetition = extractAntiRepetitionContext([]);
    const prompt = buildShortsStoryPrompt({
      trendingTopic: topic,
      antiRepetition,
      bannedKeywords: ["tax", "irs"],
      targetDurationSeconds: 52,
    });

    // Verify key trending instructions
    assert.ok(prompt.includes("DeepSeek R1 Replaced The Discord Mod"), "Prompt contains topic title");
    assert.ok(prompt.includes("DeepSeek Bot"), "Prompt specifies guest character");
    assert.ok(prompt.includes("DEEPSEEK R1 JUST CRASHED THE TECH WORLD 💀"), "Prompt specifies hook headline");
    assert.ok(prompt.includes("STRICT PRODUCTION TARGET: 50–55 SECONDS"), "Prompt mandates 50-55s target");
    assert.ok(prompt.includes("24 to 30 rapid-fire lines"), "Prompt mandates 24-30 lines");
    assert.ok(prompt.includes("screenShake"), "Prompt specifies screenShake camera effect");
    assert.ok(prompt.includes("punchZoom"), "Prompt specifies punchZoom camera effect");
    assert.ok(prompt.includes("typingFrames"), "Prompt specifies typingFrames animation");
    assert.ok(prompt.includes("systemAlert"), "Prompt specifies systemAlert banner");
    assert.ok(prompt.includes("NO emoji reaction pills"), "Prompt strictly forbids emoji reaction pills");
    assert.ok(prompt.includes("GUEST CHARACTER MULTI-TURN STYLE RULE"), "Prompt enforces multi-turn guest style standard");
    assert.ok(prompt.includes("PHOTOREALISTIC IN-CHAT EVIDENCE RULE"), "Prompt enforces photorealistic in-chat evidence standard");
  });

  test("pipeline standards: elon_musk voice registry & photorealistic assets", () => {
    // 1. Verify Elon Musk voice profile in CHARACTER_VOICE_REGISTRY
    const elon = CHARACTER_VOICE_REGISTRY["elon_musk"];
    assert.ok(elon, "Elon Musk voice profile must exist in registry");
    assert.equal(elon.name, "Elon Musk");
    assert.ok(elon.catchphrases.includes("Concerning."));
    assert.ok(elon.catchphrases.includes("Fate loves irony."));
    assert.ok(elon.dialogueStyle.includes("2-3 distinct dialogue messages"));

    // 2. Verify photorealistic in-chat evidence asset physically exists on disk
    const evidencePath = path.resolve(process.cwd(), "public/attachments/elon_dm_billion.jpg");
    assert.ok(fs.existsSync(evidencePath), "Realistic in-chat evidence asset must exist on disk");
    const stat = fs.statSync(evidencePath);
    assert.ok(stat.size > 10000, `Evidence asset size (${stat.size}B) must be a high-quality render > 10KB`);
  });

  test("calculateShortsTiming supports initialDelayFrames for opening trending visual hook", () => {
    const testMessages = Array.from({ length: 28 }, (_, i) => ({
      id: i + 1,
      author: i % 2 === 0 ? "Beluga" : "DeepSeek Bot",
      content:
        i === 0
          ? "HELLO DEEPSEEK I SUMMON YOU TO THIS SERVER"
          : i === 27
            ? "can you write a 1000 word essay to my mom explaining why i failed math?"
            : i % 3 === 0
              ? "WAIT BRO WHAT ARE YOU DOING TO THE DISCORD SERVER RIGHT NOW"
              : "HE IS NOT LYING BRO UNPLUG THE ROUTER IMMEDIATELY",
      time: "Today at 3:00 PM",
      attachmentUrl: i === 14 ? "attachments/deepseek_optimization_leak.jpg" : undefined,
    }));

    // With 60 initial delay frames (2.0s opening hook visual)
    const result = calculateShortsTiming(testMessages, {
      fps: 30,
      initialDelayFrames: 60,
      maxDurationSeconds: 55,
    });

    // Start frame of message 0 must be 60 (or scaled down slightly if duration compressed)
    assert.ok(result.timedMessages[0].startFrame >= 50, `Expected startFrame >= 50, got ${result.timedMessages[0].startFrame}`);
    const totalDurationSeconds = result.totalDurationInFrames / 30;
    assert.ok(
      totalDurationSeconds >= 50.0 && totalDurationSeconds <= 55.0,
      `Duration (${totalDurationSeconds.toFixed(1)}s) must be strictly between 50 and 55 seconds`
    );
  });

  test("productionHistoryDatabase indexes produced titles & prevents duplicates", () => {
    // 1. Title normalization
    assert.equal(normalizeTitle("DeepSeek R1 Replaced The Discord Mod 🤖"), "deepseek r1 replaced the discord mod");
    assert.equal(normalizeTitle("Asking Elon Musk For $1 Billion 💀"), "asking elon musk for 1 billion");

    // 2. Duplicate detection
    const producedTitles = productionDb.getProducedShortTitles();
    assert.ok(producedTitles.length > 0, "History database should contain produced titles");

    // Should detect existing title
    assert.equal(productionDb.isTitleDuplicate(producedTitles[0]), true);

    // Should not flag a completely novel title
    assert.equal(productionDb.isTitleDuplicate("Completely Brand New Alien Quantum Video 99999"), false);
  });

  test("getTrendingTopicForSlot guarantees 3 distinct categories across slots", () => {
    const slot0 = getTrendingTopicForSlot(0, []);
    const slot1 = getTrendingTopicForSlot(1, []);
    const slot2 = getTrendingTopicForSlot(2, []);

    assert.equal(slot0.category, "tech_ai", "Slot 0 should be tech_ai");
    assert.equal(slot1.category, "gaming", "Slot 1 should be gaming");
    assert.equal(slot2.category, "internet_culture", "Slot 2 should be internet_culture");

    // All 3 IDs must be unique
    const uniqueIds = new Set([slot0.id, slot1.id, slot2.id]);
    assert.equal(uniqueIds.size, 3, "Each slot in the 3-item daily batch must have a distinct topic");

    // Excluded IDs must be respected
    const slot0WithExclude = getTrendingTopicForSlot(0, [slot0.id]);
    assert.notEqual(slot0WithExclude.id, slot0.id, "Topic must not match excluded ID");
  });

  test("getTodaySlots calculates exact IST peak watch hours", () => {
    const slots = getTodaySlots();
    assert.equal(slots.shorts.length, 3, "Expected 3 Shorts slots");
    assert.ok(slots.longform, "Expected 1 Long-form slot");

    // Short 1: 07:30 UTC = 13:00 IST (1:00 PM)
    const s1Date = new Date(slots.shorts[0]);
    assert.equal(s1Date.getUTCHours(), 7);
    assert.equal(s1Date.getUTCMinutes(), 30);

    // Short 2: 11:30 UTC = 17:00 IST (5:00 PM)
    const s2Date = new Date(slots.shorts[1]);
    assert.equal(s2Date.getUTCHours(), 11);
    assert.equal(s2Date.getUTCMinutes(), 30);

    // Short 3: 15:00 UTC = 20:30 IST (8:30 PM)
    const s3Date = new Date(slots.shorts[2]);
    assert.equal(s3Date.getUTCHours(), 15);
    assert.equal(s3Date.getUTCMinutes(), 0);

    // Longform: 13:30 UTC = 19:00 IST (7:00 PM)
    const lfDate = new Date(slots.longform);
    assert.equal(lfDate.getUTCHours(), 13);
    assert.equal(lfDate.getUTCMinutes(), 30);
  });
});
