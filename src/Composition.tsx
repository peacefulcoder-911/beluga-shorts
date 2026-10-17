import { Composition, staticFile } from "remotion";
import { DiscordChat, MessageData } from "./DiscordChat";
import scriptJson from "./script.json";

const fps = 30;
const MAX_FRAMES = 58 * fps; // 58 seconds safe limit for YouTube Shorts

// Calculate per-message frames with generous reading time
const rawTimes = scriptJson.map((msg, idx) => {
  const isLast = idx === scriptJson.length - 1;
  // Give comfortable reading time: at least 2.2s for normal messages, 3.5s for the punchline
  const baseSeconds = isLast ? 3.5 : 2.2;
  const lengthSeconds = msg.content.length * 0.045;
  const totalSeconds = Math.max(baseSeconds, 1.2 + lengthSeconds);
  return Math.floor(totalSeconds * fps);
});

let rawTotalFrames = rawTimes.reduce((a, b) => a + b, 0) + Math.floor(fps * 1.5); // End padding

// Scale factor only if it exceeds 58 seconds
const scaleFactor = rawTotalFrames > MAX_FRAMES ? MAX_FRAMES / rawTotalFrames : 1;

const getAvatar = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("hecker")) return staticFile("hecker.jpg");
  if (n.includes("mom")) return staticFile("mom.jpg");
  if (n.includes("girlfriend") || n.includes("gf")) return staticFile("girlfriend.jpg");
  if (n.includes("pablo")) return staticFile("pablo.jpg");
  if (n.includes("police") || n.includes("fbi")) return staticFile("police.jpg");
  return staticFile("beluga.jpg");
};

const getColor = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("hecker")) return "#57f287";
  if (n.includes("mom")) return "#ed4245";
  if (n.includes("girlfriend") || n.includes("gf")) return "#eb459e";
  if (n.includes("pablo")) return "#fee75c";
  if (n.includes("police") || n.includes("fbi")) return "#5865F2";
  return "#ed4245";
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
