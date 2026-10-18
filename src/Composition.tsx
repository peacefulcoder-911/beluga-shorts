import { Composition, staticFile } from "remotion";
import { DiscordChat, MessageData } from "./DiscordChat";
import scriptJson from "./script.json";

const fps = 30;
const MAX_FRAMES = 58 * fps; // 58 seconds safe limit for YouTube Shorts

// Calculate per-message frames with natural, responsive reading time
const rawTimes = scriptJson.map((msg, idx) => {
  const isLast = idx === scriptJson.length - 1;
  if (isLast) return Math.floor(3.5 * fps);

  const words = msg.content.trim().split(/\s+/).length;
  let baseSec = 1.1;
  if (words <= 2) baseSec = 1.0;
  else if (words <= 5) baseSec = 1.35;
  else if (words <= 8) baseSec = 1.75;
  else baseSec = 2.4;

  const totalSeconds = baseSec + msg.content.length * 0.015;
  return Math.floor(totalSeconds * fps);
});

let rawTotalFrames = rawTimes.reduce((a, b) => a + b, 0) + Math.floor(fps * 1.5); // End padding

// Scale factor only if it exceeds 58 seconds
const scaleFactor = rawTotalFrames > MAX_FRAMES ? MAX_FRAMES / rawTotalFrames : 1;

const getAvatar = (name: string) => {
  const n = name.toLowerCase();
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
  return staticFile("default_user.jpg");
};

const getColor = (name: string) => {
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
  return "#99aab5";
};

let currentFrame = 0;
const parsedScript: MessageData[] = scriptJson.map((msg, idx) => {
  const startFrame = currentFrame;
  currentFrame += Math.floor(rawTimes[idx] * scaleFactor);
  
  return {
    ...msg,
    avatarUrl: getAvatar(msg.author),
    color: getColor(msg.author),
    startFrame
  };
});
const totalDuration = currentFrame + Math.floor(Math.floor(fps * 1.5) * scaleFactor);

export const MyComposition = () => {
  return (
    <Composition
      id="DiscordChat"
      component={DiscordChat}
      defaultProps={{
        script: parsedScript,
      }}
      durationInFrames={totalDuration}
      fps={30}
      width={720}
      height={1280}
    />
  );
};
