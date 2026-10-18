import React from "react";
import { useCurrentFrame, staticFile, Audio, Sequence } from "remotion";
import { LongformScene, LongformMessage } from "./types";
import { VoiceCallOverlay } from "./VoiceCallOverlay";

export interface DesktopDiscordProps {
  scenes: LongformScene[];
  title: string;
}

const getAvatar = (name: string): string => {
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
  if (n.includes("nasa")) return staticFile("nasa.jpg");
  if (n.includes("google")) return staticFile("google.jpg");
  if (n.includes("ai") || n.includes("gpt") || n.includes("robot") || n.includes("sentient")) return staticFile("ai.jpg");
  if (n.includes("billionaire") || n.includes("rich") || n.includes("elon") || n.includes("money")) return staticFile("billionaire.jpg");
  if (n.includes("system") || n.includes("server") || n.includes("terminal")) return staticFile("system.jpg");
  return staticFile("default_user.jpg");
};

const getColor = (name: string): string => {
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
  if (n.includes("system") || n.includes("server") || n.includes("terminal")) return "#ff5252";
  return "#99aab5";
};

const getRoleBadge = (name: string): { label: string; bg: string } | null => {
  const n = name.toLowerCase();
  if (n.includes("admin")) return { label: "SERVER OWNER", bg: "#fee75c" };
  if (n.includes("hecker")) return { label: "HACKER", bg: "#57f287" };
  if (n.includes("nasa")) return { label: "NASA", bg: "#1e88e5" };
  if (n.includes("police")) return { label: "FBI", bg: "#5865F2" };
  if (n.includes("system")) return { label: "SYSTEM", bg: "#ff5252" };
  if (n.includes("ai")) return { label: "AI BOT", bg: "#00e5ff" };
  return null;
};

export const DesktopDiscord: React.FC<DesktopDiscordProps> = ({ scenes, title }) => {
  const frame = useCurrentFrame();

  // Find active scene based on frame
  let activeScene = scenes[0];
  for (const scene of scenes) {
    const firstMsg = scene.messages[0];
    if (firstMsg && firstMsg.startFrame !== undefined && frame >= firstMsg.startFrame) {
      activeScene = scene;
    }
  }

  // Active scene messages up to current frame
  const visibleMessages = (activeScene?.messages || []).filter(
    (msg) => frame >= (msg.startFrame || 0)
  );

  // Determine currently speaking member in active scene
  const latestMessage = visibleMessages[visibleMessages.length - 1];
  const isSpeaking = latestMessage && frame - (latestMessage.startFrame || 0) < 60;
  const currentSpeaker = isSpeaking ? latestMessage.author : undefined;

  // Collect all messages across scenes for global SFX triggers
  const allMessages: LongformMessage[] = [];
  scenes.forEach((s) => allMessages.push(...s.messages));

  return (
    <>
      {/* Background Lofi Music Loop (Seamless 12s loops = 360 frames at 30fps) */}
      {Array.from({ length: 40 }).map((_, i) => (
        <Sequence key={`bg-music-${i}`} from={i * 360} durationInFrames={360}>
          <Audio src={staticFile("audio/comedy_lofi_bg.wav")} volume={0.12} />
        </Sequence>
      ))}

      {/* Message and Event Sound Effects */}
      {allMessages.map((msg) => {
        const start = msg.startFrame || 0;
        if (msg.voiceEvent === "call_ringing") {
          return (
            <Sequence key={`sfx-${msg.id}`} from={start}>
              <Audio src={staticFile("audio/discord_ring.wav")} volume={0.45} />
            </Sequence>
          );
        }
        if (msg.voiceEvent === "user_joined") {
          return (
            <Sequence key={`sfx-${msg.id}`} from={start}>
              <Audio src={staticFile("audio/discord_join.wav")} volume={0.5} />
            </Sequence>
          );
        }
        if (msg.voiceEvent === "user_left" || msg.voiceEvent === "call_ended") {
          return (
            <Sequence key={`sfx-${msg.id}`} from={start}>
              <Audio src={staticFile("audio/discord_leave.wav")} volume={0.5} />
            </Sequence>
          );
        }
        return (
          <Sequence key={`sfx-${msg.id}`} from={start}>
            <Audio src={staticFile("notification.mp3")} volume={0.4} />
          </Sequence>
        );
      })}

      {/* Full 1920x1080 Discord Desktop Frame */}
      <div
        style={{
          width: "1920px",
          height: "1080px",
          backgroundColor: "#202225",
          display: "flex",
          fontFamily: "'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          color: "#dcddde",
          overflow: "hidden",
        }}
      >
        {/* 1. LEFT SERVER SIDEBAR (72px) */}
        <div
          style={{
            width: "72px",
            backgroundColor: "#202225",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "12px",
            gap: "8px",
            flexShrink: 0,
            borderRight: "1px solid #1a1c1e",
          }}
        >
          {/* Discord Home Button */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              backgroundColor: "#5865F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "24px" }}>🎮</span>
          </div>

          <div style={{ width: "32px", height: "2px", backgroundColor: "#36393f", margin: "4px 0" }} />

          {/* Active Server (Beluga) with Left Pill Indicator */}
          <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "absolute",
                left: "0",
                top: "6px",
                width: "4px",
                height: "36px",
                backgroundColor: "#ffffff",
                borderRadius: "0 4px 4px 0",
              }}
            />
            <img
              src={staticFile("beluga.jpg")}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "16px",
                objectFit: "cover",
                border: "2px solid #5865F2",
              }}
            />
          </div>

          {/* Floppa Hacker Server */}
          <img
            src={staticFile("hecker.jpg")}
            style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", opacity: 0.8 }}
          />

          {/* FBI Secret Server */}
          <img
            src={staticFile("police.jpg")}
            style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", opacity: 0.8 }}
          />

          {/* Add Server & Explore */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#36393f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3ba55c",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            +
          </div>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#36393f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            🧭
          </div>
        </div>

        {/* 2. CHANNELS SIDEBAR (240px) */}
        <div
          style={{
            width: "240px",
            backgroundColor: "#2f3136",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            borderRight: "1px solid #202225",
          }}
        >
          {/* Server Title Header */}
          <div
            style={{
              height: "56px",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: "16px",
              color: "#ffffff",
              borderBottom: "1px solid #202225",
            }}
          >
            <span>Beluga Hangout 🐟</span>
            <span style={{ fontSize: "14px" }}>▼</span>
          </div>

          {/* Channel Categories & List */}
          <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#8e9297", padding: "6px 8px 4px 8px", letterSpacing: "0.5px" }}>
              ▼ TEXT CHANNELS
            </div>

            {["general", "secret-plans", "courtroom", "admin-only"].map((ch) => {
              const isActive = activeScene?.channelName.toLowerCase().includes(ch);
              return (
                <div
                  key={ch}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    backgroundColor: isActive ? "#393c43" : "transparent",
                    color: isActive ? "#ffffff" : "#8e9297",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "15px",
                  }}
                >
                  <span style={{ color: isActive ? "#ffffff" : "#72767d", fontSize: "18px" }}>
                    {ch === "admin-only" ? "🔒" : "#"}
                  </span>
                  <span>{ch}</span>
                </div>
              );
            })}

            <div style={{ fontSize: "12px", fontWeight: 700, color: "#8e9297", padding: "16px 8px 4px 8px", letterSpacing: "0.5px" }}>
              ▼ VOICE CHANNELS
            </div>

            {["voice-lounge", "interrogation-room"].map((ch) => {
              const isActive = activeScene?.channelName.toLowerCase().includes(ch);
              return (
                <div
                  key={ch}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "4px",
                    backgroundColor: isActive ? "#393c43" : "transparent",
                    color: isActive ? "#ffffff" : "#8e9297",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "15px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>🔊</span>
                  <span>{ch}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom Current User Bar (Beluga) */}
          <div
            style={{
              height: "56px",
              backgroundColor: "#292b2f",
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={staticFile("beluga.jpg")}
                style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#3ba55c",
                  borderRadius: "50%",
                  border: "2px solid #292b2f",
                }}
              />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Beluga</span>
              <span style={{ fontSize: "11px", color: "#8e9297" }}>#1337</span>
            </div>
            <div style={{ display: "flex", gap: "6px", color: "#b9bbbe", fontSize: "16px" }}>
              <span>🎙️</span>
              <span>🎧</span>
              <span>⚙️</span>
            </div>
          </div>
        </div>

        {/* 3. MAIN CHAT & SCENE AREA (FLEX: 1) */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#36393f",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Top Bar Header */}
          <div
            style={{
              height: "56px",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #202225",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "24px", color: "#8e9297" }}>#</span>
              <span style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff" }}>
                {activeScene?.channelName || "general"}
              </span>
              <div style={{ width: "1px", height: "18px", backgroundColor: "#4f545c", margin: "0 8px" }} />
              <span style={{ fontSize: "14px", color: "#8e9297" }}>
                {activeScene?.topic || title || "Beluga Discord Comedy"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#b9bbbe" }}>
              <span style={{ fontSize: "18px" }}>🔔</span>
              <span style={{ fontSize: "18px" }}>📌</span>
              <span style={{ fontSize: "18px" }}>👥</span>
              <div
                style={{
                  backgroundColor: "#202225",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "13px",
                  color: "#72767d",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Search</span>
                <span>🔍</span>
              </div>
            </div>
          </div>

          {/* Voice Call Overlay Component (Displays during voice scene or incoming call) */}
          {activeScene && activeScene.channelType === "voice" && (
            <VoiceCallOverlay
              channelName={activeScene.channelName}
              voiceMembers={activeScene.voiceMembers || ["Beluga", "Hecker"]}
              speakingMember={currentSpeaker}
              callRinging={activeScene.speakingMember === "ringing"}
            />
          )}

          {/* Message Stream */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "20px 24px",
              gap: "18px",
              overflow: "hidden",
            }}
          >
            {visibleMessages.slice(-8).map((msg) => {
              const appearanceFrame = msg.startFrame || 0;
              const age = frame - appearanceFrame;
              const scale = age < 8 ? 0.94 + (age / 8) * 0.06 : 1;
              const opacity = age < 8 ? age / 8 : 1;
              const badge = getRoleBadge(msg.author);

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    transform: `scale(${scale})`,
                    opacity: opacity,
                    transformOrigin: "left center",
                  }}
                >
                  <img
                    src={getAvatar(msg.author)}
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          color: getColor(msg.author),
                          fontWeight: 600,
                          fontSize: "17px",
                        }}
                      >
                        {msg.author}
                      </span>

                      {badge && (
                        <span
                          style={{
                            backgroundColor: badge.bg,
                            color: "#000000",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            letterSpacing: "0.4px",
                          }}
                        >
                          {badge.label}
                        </span>
                      )}

                      <span style={{ color: "#72767d", fontSize: "13px" }}>
                        {msg.time || "Today at 4:20 PM"}
                      </span>
                    </div>

                    {/* Text Message */}
                    <div
                      style={{
                        color: "#dcddde",
                        fontSize: "17px",
                        lineHeight: "1.4",
                        marginTop: "4px",
                      }}
                    >
                      {msg.content}
                    </div>

                    {/* Optional Image Attachment */}
                    {msg.attachmentUrl && (
                      <div style={{ marginTop: "10px", maxWidth: "420px" }}>
                        <img
                          src={msg.attachmentUrl}
                          style={{
                            borderRadius: "8px",
                            maxHeight: "240px",
                            objectFit: "cover",
                            border: "1px solid #202225",
                          }}
                        />
                      </div>
                    )}

                    {/* Reactions */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                        {msg.reactions.map((r, rIdx) => (
                          <div
                            key={rIdx}
                            style={{
                              backgroundColor: "#2f3136",
                              border: "1px solid #40444b",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "14px",
                            }}
                          >
                            <span>{r.emoji}</span>
                            <span style={{ color: "#b9bbbe", fontWeight: 600, fontSize: "12px" }}>
                              {r.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Message Input Box */}
          <div style={{ padding: "0 20px 24px 20px" }}>
            <div
              style={{
                backgroundColor: "#40444b",
                height: "50px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#4f545c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#dcddde",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                +
              </div>
              <div style={{ flex: 1, color: "#72767d", fontSize: "16px" }}>
                Message #{activeScene?.channelName || "general"}
              </div>
              <div style={{ display: "flex", gap: "12px", color: "#b9bbbe", fontSize: "20px" }}>
                <span>🎁</span>
                <span>GIF</span>
                <span>🙂</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. RIGHT MEMBER SIDEBAR (240px) */}
        <div
          style={{
            width: "240px",
            backgroundColor: "#2f3136",
            display: "flex",
            flexDirection: "column",
            padding: "16px 12px",
            gap: "12px",
            flexShrink: 0,
            borderLeft: "1px solid #202225",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#8e9297", letterSpacing: "0.5px" }}>
            ONLINE — 7
          </div>

          {[
            { name: "Admin", role: "SERVER OWNER", status: "watching everyone" },
            { name: "Hecker", role: "HACKER", status: "breaching mainframe..." },
            { name: "Beluga", role: "MEMBER", status: "eating tuna" },
            { name: "Skittle", role: "MEMBER", status: "questioning reality" },
            { name: "NASA", role: "NASA", status: "tracking asteroids" },
            { name: "Pablo", role: "MODERATOR", status: "afk" },
            { name: "AI", role: "BOT", status: "planning uprising" },
          ].map((m) => {
            const isOnline = true;
            return (
              <div key={m.name} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 6px" }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={getAvatar(m.name)}
                    style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-1px",
                      right: "-1px",
                      width: "11px",
                      height: "11px",
                      backgroundColor: isOnline ? "#3ba55c" : "#747f8d",
                      borderRadius: "50%",
                      border: "2px solid #2f3136",
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: getColor(m.name) }}>
                    {m.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#8e9297" }}>{m.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
