import { Composition, staticFile } from "remotion";
import { DiscordChat, MessageData } from "./DiscordChat";
import scriptJson from "./script.json";
import { calculateShortsTiming } from "./core/timingEngine.ts";
import type { AudioCue } from "./core/types.ts";

const fps = 30;

export interface RawScriptMessage {
  id: number;
  author: string;
  content: string;
  time: string;
  avatarUrl?: string;
  color?: string;
  attachmentUrl?: string;
  startFrame?: number;
  audioCues?: AudioCue[];
  hookThumbnailUrl?: string;
  hookHeadline?: string;
  screenShake?: boolean;
  punchZoom?: boolean;
  typingFrames?: number;
  systemAlert?: string;
}

const getAvatar = (name: string, customAvatar?: string) => {
  if (customAvatar) {
    return customAvatar.startsWith("http") ? customAvatar : staticFile(customAvatar);
  }
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const n = name.toLowerCase();

  // Known character avatars
  if (n.includes("beluga") || n.includes("belu")) return staticFile("beluga.jpg");
  if (n.includes("smith") || n.includes("teacher") || n.includes("prof") || n.includes("sir")) return staticFile("teacher.jpg");
  if (n.includes("hecker")) return staticFile("hecker.jpg");
  if (n.includes("mom") || n.includes("mother")) return staticFile("mom.jpg");
  if (n.includes("girlfriend") || n.includes("gf") || n.includes("babe")) return staticFile("girlfriend.jpg");
  if (n.includes("admin") || n.includes("mod")) return staticFile("admin.jpg");
  if (n.includes("pablo")) return staticFile("pablo.jpg");
  if (n.includes("police") || n.includes("fbi") || n.includes("cop")) return staticFile("police.jpg");
  if (n.includes("skittle")) return staticFile("skittle.jpg");
  if (n.includes("vladimir") || n.includes("vlad")) return staticFile("vladimir.jpg");
  if (n.includes("nasa")) return staticFile("nasa.jpg");
  if (n.includes("google")) return staticFile("google.jpg");
  if (n.includes("ai") || n.includes("gpt") || n.includes("robot") || n.includes("sentient") || n.includes("algorithm") || n.includes("bot")) return staticFile("ai.jpg");
  if (n.includes("elon") || n.includes("musk")) return staticFile("characters/elon_musk.jpg");
  if (n.includes("billionaire") || n.includes("rich") || n.includes("money")) return staticFile("billionaire.jpg");
  if (n.includes("system") || n.includes("server") || n.includes("terminal")) return staticFile("system.jpg");
  if (n.includes("exploding") || n.includes("tnt")) return staticFile("characters/explodingtnt.jpg");
  if (n.includes("mrbeast") || n.includes("beast")) return staticFile("characters/mrbeast.jpg");
  if (n.includes("steve")) return staticFile("characters/steve_jack_black.jpg");
  if (n.includes("zuck") || n.includes("mark")) return staticFile("characters/mark_zuckerberg.jpg");
  if (n.includes("jensen") || n.includes("huang")) return staticFile("characters/jensen_huang.jpg");
  if (n.includes("rockstar") || n.includes("legal")) return staticFile("characters/rockstar_legal.jpg");
  if (n.includes("fridge")) return staticFile("characters/fridgebot.jpg");
  if (n.includes("toilet")) return staticFile("characters/toiletbot.jpg");
  if (n.includes("vance")) return staticFile("characters/flight_director_vance.jpg");
  if (n.includes("boom")) return staticFile("characters/commander_boom.jpg");

  // Fallback safely to default_user.jpg if custom character asset does not exist
  return staticFile("default_user.jpg");
};

const DISCORD_PALETTE = [
  "#5865F2", "#57F287", "#FEE75C", "#EB459E", "#ED4245",
  "#00bcd4", "#ff9800", "#9c27b0", "#3ba55c", "#00e5ff",
  "#e91e63", "#4caf50", "#ff5722", "#673ab7"
];

const getColor = (name: string, customColor?: string) => {
  if (customColor) return customColor;

  const n = name.toLowerCase();
  if (n.includes("beluga") || n.includes("belu")) return "#ed4245";
  if (n.includes("smith") || n.includes("teacher") || n.includes("prof") || n.includes("sir")) return "#3ba55c";
  if (n.includes("hecker")) return "#57f287";
  if (n.includes("mom") || n.includes("mother")) return "#f47b67";
  if (n.includes("girlfriend") || n.includes("gf") || n.includes("babe")) return "#eb459e";
  if (n.includes("admin") || n.includes("mod")) return "#fee75c";
  if (n.includes("pablo")) return "#fee75c";
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

  // Deterministic color assignment for new characters
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DISCORD_PALETTE[Math.abs(hash) % DISCORD_PALETTE.length];
};

const getHookThumbnail = (): string | undefined => {
  const scriptAny = scriptJson as unknown as Record<string, unknown>;
  if (typeof scriptAny === "object" && scriptAny !== null) {
    if (typeof scriptAny.hookThumbnailUrl === "string") {
      return scriptAny.hookThumbnailUrl;
    }
    const hookCard = scriptAny.hookCard as { hookThumbnailUrl?: string; shouldShowHookCard?: boolean } | undefined;
    if (hookCard?.shouldShowHookCard && hookCard.hookThumbnailUrl) {
      return hookCard.hookThumbnailUrl;
    }
  }

  if (Array.isArray(scriptJson) && scriptJson.length > 0) {
    const firstMsg = scriptJson[0] as { hookThumbnailUrl?: string };
    if (typeof firstMsg?.hookThumbnailUrl === "string") {
      return firstMsg.hookThumbnailUrl;
    }
  }

  // Fallback to legacy keyword detection
  const scriptStr = JSON.stringify(scriptJson).toLowerCase();
  if (scriptStr.includes("napoleon") || scriptStr.includes("mule")) {
    return "thumbnail_napoleon_short.jpg";
  }
  if (scriptStr.includes("mona") || scriptStr.includes("lisa")) {
    return "thumbnail_mona_lisa_short.jpg";
  }
  return undefined;
};

const getHookHeadline = (): string | undefined => {
  const scriptAny = scriptJson as unknown as Record<string, unknown>;
  if (typeof scriptAny === "object" && scriptAny !== null) {
    if (typeof scriptAny.hookHeadline === "string") return scriptAny.hookHeadline;
    const hookCard = scriptAny.hookCard as { headline?: string } | undefined;
    if (hookCard?.headline) return hookCard.headline;
  }
  if (Array.isArray(scriptJson) && scriptJson.length > 0) {
    const firstMsg = scriptJson[0] as { hookHeadline?: string };
    if (typeof firstMsg?.hookHeadline === "string") return firstMsg.hookHeadline;
  }
  return undefined;
};

// Pure, deterministic timing calculation via core timing engine
const rawMessages: RawScriptMessage[] = (
  Array.isArray(scriptJson)
    ? scriptJson
    : (scriptJson as unknown as { messages?: RawScriptMessage[] }).messages || []
) as RawScriptMessage[];

const hookThumbnailUrl = getHookThumbnail();
const hookHeadline = getHookHeadline();
const isTrendingShort = Boolean(hookThumbnailUrl && hookHeadline);
const initialDelayFrames = 0;

const isRelaxedShort = rawMessages.length <= 18;
const customTierMultipliers = isRelaxedShort
  ? { short: 1.8, medium: 2.4, long: 3.0, extended: 3.5 }
  : undefined;

const timingResult = calculateShortsTiming(rawMessages, {
  fps,
  maxDurationSeconds: 55,
  initialDelayFrames,
  customTierMultipliers,
  attachmentDwellSeconds: isRelaxedShort ? 2.2 : 1.8,
  lastMessageDurationSeconds: isRelaxedShort ? 4.0 : 3.5,
});

const parsedScript: MessageData[] = timingResult.timedMessages.map((msg, idx) => ({
  id: msg.id,
  author: msg.author,
  content: msg.content,
  time: msg.time,
  attachmentUrl: msg.attachmentUrl,
  avatarUrl: getAvatar(msg.author, msg.avatarUrl),
  color: getColor(msg.author, msg.color),
  startFrame: msg.startFrame,
  durationInFrames: msg.durationInFrames,
  audioCues: rawMessages[idx]?.audioCues,
  screenShake: rawMessages[idx]?.screenShake,
  punchZoom: rawMessages[idx]?.punchZoom,
  typingFrames: rawMessages[idx]?.typingFrames,
  systemAlert: rawMessages[idx]?.systemAlert,
}));

const totalDuration = timingResult.totalDurationInFrames;

export const MyComposition = () => {
  return (
    <Composition
      id="DiscordChat"
      component={DiscordChat as unknown as React.ComponentType<Record<string, unknown>>}
      defaultProps={{
        script: parsedScript,
        hookThumbnailUrl,
        hookHeadline,
        hookDurationFrames: isTrendingShort ? 60 : 20,
      }}
      durationInFrames={totalDuration}
      fps={30}
      width={1440}
      height={2560}
    />
  );
};
