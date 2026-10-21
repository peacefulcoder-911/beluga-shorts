import { Composition, staticFile } from "remotion";
import { DiscordChat, MessageData } from "./DiscordChat";
import scriptJson from "./script.json";

const fps = 30;
const MAX_FRAMES = 58 * fps; // 58 seconds safe limit for YouTube Shorts

// Calculate per-message frames with natural reading time and attachment viewing pauses
const rawTimes = (scriptJson as any[]).map((msg, idx) => {
  const isLast = idx === scriptJson.length - 1;
  if (isLast) return Math.floor(3.5 * fps);

  const words = (msg.content || "").trim().split(/\s+/).length;
  let baseSec = 1.1;
  if (words <= 2) baseSec = 1.0;
  else if (words <= 5) baseSec = 1.35;
  else if (words <= 8) baseSec = 1.75;
  else baseSec = 2.4;

  // Add 1.8 seconds extra pause so viewers can absorb in-chat image attachments
  if (msg.attachmentUrl) {
    baseSec += 1.8;
  }

  const totalSeconds = baseSec + (msg.content || "").length * 0.015;
  return Math.floor(totalSeconds * fps);
});

let rawTotalFrames = rawTimes.reduce((a, b) => a + b, 0) + Math.floor(fps * 1.5); // End padding

// Scale factor only if it exceeds 58 seconds
const scaleFactor = rawTotalFrames > MAX_FRAMES ? MAX_FRAMES / rawTotalFrames : 1;

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
  if (n.includes("ai") || n.includes("gpt") || n.includes("robot") || n.includes("sentient")) return staticFile("ai.jpg");
  if (n.includes("billionaire") || n.includes("rich") || n.includes("elon") || n.includes("money")) return staticFile("billionaire.jpg");
  if (n.includes("system") || n.includes("server") || n.includes("terminal")) return staticFile("system.jpg");
  if (n.includes("exploding") || n.includes("tnt")) return staticFile("characters/explodingtnt.jpg");
  if (n.includes("mrbeast") || n.includes("beast")) return staticFile("characters/mrbeast.jpg");

  // Dynamic guest character avatar in public/characters/
  return staticFile(`characters/${clean}.jpg`);
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

let currentFrame = 0;
const parsedScript: MessageData[] = (scriptJson as any[]).map((msg, idx) => {
  const startFrame = currentFrame;
  currentFrame += Math.floor(rawTimes[idx] * scaleFactor);
  
  return {
    ...msg,
    avatarUrl: getAvatar(msg.author, msg.avatarUrl),
    color: getColor(msg.author, msg.color),
    startFrame
  };
});
const totalDuration = currentFrame + Math.floor(Math.floor(fps * 1.5) * scaleFactor);

const getHookThumbnail = () => {
  const scriptStr = JSON.stringify(scriptJson).toLowerCase();
  if (scriptStr.includes("napoleon") || scriptStr.includes("mule")) {
    return "thumbnail_napoleon_short.jpg";
  }
  if (scriptStr.includes("mona") || scriptStr.includes("lisa")) {
    return "thumbnail_mona_lisa_short.jpg";
  }
  return undefined;
};

export const MyComposition = () => {
  return (
    <Composition
      id="DiscordChat"
      component={DiscordChat}
      defaultProps={{
        script: parsedScript,
        hookThumbnailUrl: getHookThumbnail(),
      }}
      durationInFrames={totalDuration}
      fps={30}
      width={1440}
      height={2560}
    />
  );
};
