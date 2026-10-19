import React from "react";
import { useCurrentFrame, staticFile, Audio, Sequence } from "remotion";
import { LongformScene, LongformMessage } from "./types";
import { CutawayScreen } from "./CutawayScreen";

export interface DesktopDiscordProps {
  scenes: LongformScene[];
  title: string;
}

const getAvatar = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("egg")) return staticFile("egg.jpg");
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
  return staticFile("default_user.jpg");
};

export const DesktopDiscord: React.FC<DesktopDiscordProps> = ({ scenes, title }) => {
  const frame = useCurrentFrame();

  // Collect all messages across scenes
  const allMessages: LongformMessage[] = [];
  scenes.forEach((s) => allMessages.push(...s.messages));

  // Find the active message at this exact frame
  let currentMsgIndex = 0;
  for (let i = 0; i < allMessages.length; i++) {
    const msg = allMessages[i];
    if (msg.startFrame !== undefined && frame >= msg.startFrame) {
      currentMsgIndex = i;
    }
  }

  const activeMsg = allMessages[currentMsgIndex] || allMessages[0];
  const startFrame = activeMsg.startFrame || 0;
  const age = frame - startFrame;

  // Pop-in scale animation on message arrival
  const scale = age < 6 ? 0.96 + (age / 6) * 0.04 : 1;
  const opacity = age < 4 ? age / 4 : 1;

  const isEgg = activeMsg.author.toLowerCase().includes("egg");

  return (
    <>
      {/* Ambient Looping Comedy Background Music */}
      {Array.from({ length: 40 }).map((_, i) => (
        <Sequence key={`bg-music-${i}`} from={i * 360} durationInFrames={360}>
          <Audio src={staticFile("audio/comedy_lofi_bg.wav")} volume={0.12} />
        </Sequence>
      ))}

      {/* Sound Effects on Message Arrival */}
      {allMessages.map((msg) => {
        const start = msg.startFrame || 0;
        if (msg.cutaway?.type === "subscribe_button") {
          return null;
        }
        if (msg.voiceEvent === "call_ringing") {
          return (
            <Sequence key={`sfx-${msg.id}`} from={start}>
              <Audio src={staticFile("audio/discord_ring.wav")} volume={0.45} />
            </Sequence>
          );
        }
        return (
          <Sequence key={`sfx-${msg.id}`} from={start}>
            <Audio src={staticFile("notification.mp3")} volume={0.5} />
          </Sequence>
        );
      })}

      {/* 1920x1080 16:9 Beluga Cinematic Canvas */}
      <div
        style={{
          width: "1920px",
          height: "1080px",
          backgroundColor: "#000000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          fontFamily: "'gg sans', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Top Watermark / Episode Title */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "32px",
            fontSize: "20px",
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.9)",
            letterSpacing: "0.2px",
            zIndex: 10,
          }}
        >
          {title}
        </div>

        {/* If Active Item is a Cutaway Gag */}
        {activeMsg.cutaway ? (
          <CutawayScreen cutaway={activeMsg.cutaway} frame={frame} startFrame={startFrame} />
        ) : (
          /* Signature Focused Discord Message Strip (Exact Replica) */
          <div
            style={{
              width: "100%",
              backgroundColor: "#36393f",
              padding: "42px 100px",
              display: "flex",
              alignItems: "flex-start",
              gap: "44px",
              boxShadow: "0 0 60px rgba(0, 0, 0, 0.85)",
              transform: `scale(${scale})`,
              opacity: opacity,
              transformOrigin: "center center",
            }}
          >
            {/* Circular Avatar */}
            <div
              style={{
                width: "170px",
                height: "170px",
                borderRadius: "50%",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={getAvatar(activeMsg.author)}
                style={{
                  width: isEgg ? "80%" : "100%",
                  height: isEgg ? "80%" : "100%",
                  borderRadius: isEgg ? "0px" : "50%",
                  objectFit: isEgg ? "contain" : "cover",
                }}
              />
            </div>

            {/* Author Header & Message Text */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flex: 1,
                paddingTop: "4px",
              }}
            >
              {/* Name & Time */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "22px" }}>
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: "62px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                  }}
                >
                  {activeMsg.author}
                </span>

                <span
                  style={{
                    color: "#80848e",
                    fontSize: "40px",
                    fontWeight: 400,
                  }}
                >
                  {activeMsg.time || "1:56 PM"}
                </span>
              </div>

              {/* Discord Mention Tag (@everyone / @Beluga) */}
              {activeMsg.mention && (
                <div style={{ marginTop: "14px", marginBottom: "4px" }}>
                  <span
                    style={{
                      backgroundColor: "rgba(88, 101, 242, 0.3)",
                      color: "#c9cdfb",
                      fontSize: "46px",
                      fontWeight: 600,
                      padding: "4px 18px",
                      borderRadius: "8px",
                      display: "inline-block",
                    }}
                  >
                    {activeMsg.mention}
                  </span>
                </div>
              )}

              {/* Message Content Text */}
              <div
                style={{
                  color: "#dcddde",
                  fontSize: "58px",
                  fontWeight: 350,
                  lineHeight: "1.34",
                  marginTop: activeMsg.mention ? "8px" : "12px",
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                  letterSpacing: "0.2px",
                }}
              >
                {activeMsg.content}
              </div>

              {/* Optional Meme Image Attachment */}
              {activeMsg.attachmentUrl && (
                <div style={{ marginTop: "20px" }}>
                  <img
                    src={activeMsg.attachmentUrl}
                    style={{
                      maxWidth: "700px",
                      maxHeight: "380px",
                      borderRadius: "14px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
