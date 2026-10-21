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
  attachmentUrl?: string;
};

export const DiscordChat: React.FC<{ script: MessageData[]; hookThumbnailUrl?: string }> = ({ script, hookThumbnailUrl }) => {
  const frame = useCurrentFrame();

  // Show messages up to current frame
  const visibleMessages = script.filter((msg) => frame >= (msg.startFrame || 0));

  return (
    <>
      {/* Dynamic Sound Effects */}
      {script.map((msg) => {
        const appearanceFrame = msg.startFrame || 0;
        return (
          <React.Fragment key={`audio-group-${msg.id}`}>
            {/* Standard Discord message notification chime */}
            <Sequence from={appearanceFrame}>
              <Audio src={staticFile("notification.mp3")} volume={0.5} />
            </Sequence>

            {/* Impact SFX when an in-chat image attachment appears */}
            {msg.attachmentUrl && (
              <Sequence from={appearanceFrame}>
                <Audio src={staticFile("audio/horror_hit.wav")} volume={0.65} />
              </Sequence>
            )}
          </React.Fragment>
        );
      })}

      <div
        style={{
          width: "1440px",
          height: "2560px",
          backgroundColor: "#1e1f22", // Official Discord Mobile Deep Dark
          display: "flex",
          flexDirection: "column",
          color: "#f2f3f5",
          fontFamily:
            "'gg sans', 'Whitney', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          WebkitFontSmoothing: "antialiased",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Baked-in Thumbnail Hook Card (Frames 0 to 18 / 0.6s) */}
        {/* Guarantees YouTube selects this high-CTR vertical card as the Shorts cover! */}
        {hookThumbnailUrl && frame < 20 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 9999,
              backgroundColor: "#1e1f22",
              opacity: frame < 15 ? 1 : Math.max(0, 1 - (frame - 15) / 5),
              pointerEvents: "none",
            }}
          >
            <img
              src={hookThumbnailUrl.startsWith("http") ? hookThumbnailUrl : staticFile(hookThumbnailUrl)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Top Header: Authentic Mobile Discord Top Bar */}
        <div
          style={{
            height: "240px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 80px 0 80px",
            backgroundColor: "#2b2d31",
            borderBottom: "2px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
            zIndex: 10,
          }}
        >
          {/* Back Chevron */}
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b5bac1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "28px", flexShrink: 0 }}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>

          {/* Hashtag Icon */}
          <span
            style={{
              fontSize: "68px",
              fontWeight: 700,
              color: "#80848e",
              marginRight: "20px",
              lineHeight: 1,
            }}
          >
            #
          </span>

          {/* Channel Name */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span
              style={{
                fontSize: "60px",
                fontWeight: 700,
                color: "#f2f3f5",
                letterSpacing: "-0.5px",
              }}
            >
              general
            </span>
            <span
              style={{
                fontSize: "30px",
                color: "#949ba4",
                fontWeight: 500,
                marginTop: "-2px",
              }}
            >
              Discord Central Server
            </span>
          </div>

          {/* Search / Member Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "36px" }}>
            {/* Search Icon */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b5bac1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {/* Members Icon */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#b5bac1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "50px 100px 50px 80px", // 80px left safe margin, 100px right margin eliminating dead space
            gap: "46px",
            overflow: "hidden",
          }}
        >
          {visibleMessages.map((msg) => {
            const appearanceFrame = msg.startFrame || 0;
            const ageInFrames = frame - appearanceFrame;

            // Pop-in animation
            const scale = ageInFrames < 8 ? 0.92 + (ageInFrames / 8) * 0.08 : 1;
            const opacity = ageInFrames < 6 ? ageInFrames / 6 : 1;

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: "32px",
                  transform: `scale(${scale})`,
                  opacity: opacity,
                  transformOrigin: "left center",
                }}
              >
                {/* Avatar with authentic Discord online badge */}
                <div style={{ position: "relative", width: "152px", height: "152px", flexShrink: 0 }}>
                  <img
                    src={msg.avatarUrl}
                    style={{
                      width: "152px",
                      height: "152px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      backgroundColor: "#2b2d31",
                      border: "2px solid rgba(255,255,255,0.06)",
                    }}
                  />
                  {/* Discord Online Indicator */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      width: "42px",
                      height: "42px",
                      backgroundColor: "#23a55a",
                      borderRadius: "50%",
                      border: "6px solid #1e1f22",
                    }}
                  />
                </div>

                {/* Message Body */}
                <div style={{ display: "flex", flexDirection: "column", marginTop: "2px", flex: 1 }}>
                  {/* Author Name and Timestamp */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: "20px" }}>
                    <span
                      style={{
                        color: msg.color || "#f2f3f5",
                        fontWeight: 700,
                        fontSize: "58px",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {msg.author}
                    </span>
                    <span
                      style={{
                        color: "#949ba4",
                        fontSize: "38px",
                        fontWeight: 500,
                      }}
                    >
                      {msg.time}
                    </span>
                  </div>

                  {/* Message Content - Large, bold and punchy for mobile Shorts */}
                  <div
                    style={{
                      color: "#f2f3f5",
                      fontSize: "66px",
                      marginTop: "8px",
                      lineHeight: "1.36",
                      letterSpacing: "0.2px",
                      wordBreak: "break-word",
                      fontWeight: 500,
                      textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Authentic Discord In-Chat Image Attachment */}
                  {msg.attachmentUrl && (
                    <div
                      style={{
                        marginTop: "20px",
                        borderRadius: "28px",
                        overflow: "hidden",
                        border: "3px solid rgba(255, 255, 255, 0.12)",
                        maxWidth: "1000px",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
                        backgroundColor: "#2b2d31",
                      }}
                    >
                      <img
                        src={
                          msg.attachmentUrl.startsWith("http")
                            ? msg.attachmentUrl
                            : staticFile(msg.attachmentUrl)
                        }
                        style={{
                          width: "100%",
                          maxHeight: "680px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Input Area: Authentic Discord Mobile Bar */}
        <div
          style={{
            height: "260px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 100px 45px 80px",
            gap: "28px",
            backgroundColor: "#2b2d31",
            borderTop: "2px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Action Plus Button */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              backgroundColor: "#383a40",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#b5bac1",
              fontSize: "52px",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            +
          </div>

          {/* Gift Button */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              backgroundColor: "#383a40",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "44px",
              flexShrink: 0,
            }}
          >
            🎁
          </div>

          {/* Input Pill */}
          <div
            style={{
              flex: 1,
              backgroundColor: "#383a40",
              height: "110px",
              borderRadius: "55px",
              display: "flex",
              alignItems: "center",
              padding: "0 40px",
              color: "#949ba4",
              fontSize: "44px",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            Message #general
            <div style={{ marginLeft: "auto", fontSize: "52px" }}>🙂</div>
          </div>

          {/* Voice Mic Button */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              backgroundColor: "#5865f2", // Discord Blurple for primary action
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "44px",
              flexShrink: 0,
              boxShadow: "0 6px 20px rgba(88, 101, 242, 0.4)",
            }}
          >
            🎤
          </div>
        </div>
      </div>
    </>
  );
};
