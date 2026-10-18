import { useCurrentFrame, Audio, Sequence, staticFile } from "remotion";
import React from "react";

export type MessageData = {
  id: number;
  author: string;
  avatarUrl: string;
  content: string;
  time: string;
  color: string;
  startFrame?: number;
};

export const DiscordChat: React.FC<{ script: MessageData[] }> = ({ script }) => {
  const frame = useCurrentFrame();
  // const { fps } = useVideoConfig();

  // Show a new message every 1.5 seconds (fps * 1.5 frames)
  const visibleMessages = script.filter(msg => frame >= (msg.startFrame || 0));

  return (
    <>
      {/* Audio Tracks */}
      {script.map((msg, index) => {
        // First message at frame 0 shouldn't make a sound if it's already there, 
        // or we can just play it for all of them for the video effect. Let's play for all.
        const appearanceFrame = msg.startFrame || 0;
        return (
          <Sequence key={`audio-${msg.id}`} from={appearanceFrame}>
            <Audio src={staticFile("notification.mp3")} volume={0.5} />
          </Sequence>
        );
      })}

      <div
        style={{
          width: "100%",
          height: "100%",
        backgroundColor: "#000000", // Pure black for mobile OLED look
        display: "flex",
        flexDirection: "column",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top Header */}
      <div style={{ height: "140px", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 140px 0 20px", borderBottom: "2px solid #202225" }}>
        <span style={{ fontSize: "50px", fontWeight: "bold" }}>←</span>
        <span style={{ fontSize: "60px", margin: "0 30px", color: "#8e9297" }}>#</span>
        <span style={{ fontSize: "44px", fontWeight: "bold", flex: 1 }}>general</span>
        <span style={{ fontSize: "50px", color: "#8e9297" }}>🔍</span>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 140px 40px 20px", gap: "36px", overflow: "hidden" }}>
        {visibleMessages.map((msg, index) => {
          const appearanceFrame = msg.startFrame || 0;
          const ageInFrames = frame - appearanceFrame;
          
          // Simple pop animation
          const scale = ageInFrames < 10 ? 0.9 + (ageInFrames / 10) * 0.1 : 1;
          const opacity = ageInFrames < 10 ? ageInFrames / 10 : 1;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: "20px",
                transform: `scale(${scale})`,
                opacity: opacity,
                transformOrigin: "left center",
              }}
            >
              <div style={{ position: "relative", height: "90px", flexShrink: 0 }}>
                <img
                  src={msg.avatarUrl}
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                {/* Online indicator */}
                <div style={{ position: "absolute", bottom: "0px", right: "0px", width: "26px", height: "26px", backgroundColor: "#3ba55c", borderRadius: "50%", border: "4px solid #000" }} />
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", marginTop: "2px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span
                    style={{
                      color: msg.color || "white",
                      fontWeight: 500,
                      fontSize: "32px",
                      letterSpacing: "0.2px"
                    }}
                  >
                    {msg.author}
                  </span>
                  <span
                    style={{
                      color: "#72767d",
                      fontSize: "22px",
                      fontWeight: 400,
                    }}
                  >
                    {msg.time}
                  </span>
                </div>
                <div
                  style={{
                    color: "#dcddde",
                    fontSize: "32px",
                    marginTop: "4px",
                    lineHeight: "1.3",
                    letterSpacing: "0.1px", wordBreak: "break-word"
                  }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Input Area */}
      <div style={{ height: "160px", flexShrink: 0, display: "flex", alignItems: "center", padding: "0 140px 80px 20px", gap: "24px", backgroundColor: "#000000" }}>
        <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#2f3136", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "40px", color: "#b9bbbe", fontWeight: "bold" }}>+</div>
        <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#2f3136", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "36px" }}>🎁</div>
        <div style={{ flex: 1, backgroundColor: "#202225", height: "90px", borderRadius: "45px", display: "flex", alignItems: "center", padding: "0 40px", color: "#72767d", fontSize: "36px" }}>
          Message #general
          <div style={{ marginLeft: "auto", fontSize: "44px" }}>🙂</div>
        </div>
        <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "#2f3136", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "36px" }}>🎤</div>
      </div>
    </div>
    </>
  );
};
