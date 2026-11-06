import React from "react";
import { useCurrentFrame, staticFile, Audio, Sequence, Img } from "remotion";
import { LongformScene, LongformMessage } from "./types";
import { CutawayScreen } from "./CutawayScreen";
import { VoiceCallOverlay } from "./VoiceCallOverlay";
import { resolveAudioCue, getEffectiveAudioCues } from "../../src/core/audioRegistry.ts";
import type { StudioMessage } from "../../src/core/types.ts";

export type DesktopDiscordProps = {
  scenes: LongformScene[];
  title?: string;
};

const getAvatar = (name: string, customAvatar?: string): string => {
  if (customAvatar) {
    return customAvatar.startsWith("http") ? customAvatar : staticFile(customAvatar);
  }
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const n = name.toLowerCase();
  if (n.includes("unknown") || n.includes("shadow") || n.includes("entity")) return staticFile("unknown.jpg");
  if (n.includes("police") || n.includes("fbi") || n.includes("agent") || n.includes("miller")) return staticFile("police.jpg");
  if (n.includes("egg")) return staticFile("egg.jpg");
  if (n.includes("beluga") || n.includes("belu")) return staticFile("beluga.jpg");
  if (n.includes("smith") || n.includes("teacher") || n.includes("prof") || n.includes("sir")) return staticFile("teacher.jpg");
  if (n.includes("hecker")) return staticFile("hecker.jpg");
  if (n.includes("mom") || n.includes("mother")) return staticFile("mom.jpg");
  if (n.includes("girlfriend") || n.includes("gf") || n.includes("babe")) return staticFile("girlfriend.jpg");
  if (n.includes("admin") || n.includes("mod")) return staticFile("admin.jpg");
  if (n.includes("pablo")) return staticFile("pablo.jpg");
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
  if (n.includes("fridge")) return staticFile("characters/fridgebot.jpg");
  if (n.includes("toilet")) return staticFile("characters/toiletbot.jpg");
  if (n.includes("vance")) return staticFile("characters/flight_director_vance.jpg");
  if (n.includes("boom")) return staticFile("characters/commander_boom.jpg");
  return staticFile("default_user.jpg");
};

const getAuthorColor = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("unknown") || n.includes("shadow") || n.includes("entity")) return "#ff4d4d";
  if (n.includes("police") || n.includes("fbi") || n.includes("agent") || n.includes("miller")) return "#00a8ff";
  if (n.includes("system") || n.includes("server")) return "#f1c40f";
  if (n.includes("beluga") || n.includes("belu")) return "#ed4245";
  if (n.includes("exploding") || n.includes("tnt")) return "#ff4757";
  if (n.includes("mrbeast") || n.includes("beast")) return "#00d2d3";
  if (n.includes("vladimir") || n.includes("vlad")) return "#ff9f1a";
  if (n.includes("hecker")) return "#2ecc71";
  if (n.includes("skittle")) return "#f1c40f";
  if (n.includes("mom") || n.includes("mother")) return "#eb459e";
  if (n.includes("pablo")) return "#e67e22";
  if (n.includes("egg")) return "#ffffff";
  if (n.includes("admin") || n.includes("mod")) return "#9b59b6";
  if (n.includes("smith") || n.includes("teacher")) return "#3498db";
  return "#ffffff";
};

export const DesktopDiscord: React.FC<DesktopDiscordProps> = ({ scenes }) => {
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

  // Find which scene is active at this exact frame
  let activeScene = scenes[0];
  for (const scene of scenes) {
    const firstMsg = scene.messages && scene.messages[0];
    if (firstMsg && firstMsg.startFrame !== undefined && frame >= firstMsg.startFrame) {
      activeScene = scene;
    }
  }

  const isAlertSender =
    activeMsg.author.toLowerCase().includes("police") ||
    activeMsg.author.toLowerCase().includes("system") ||
    activeMsg.author.toLowerCase().includes("unknown");

  const isShock =
    activeMsg.content.includes("BREACH") ||
    activeMsg.content.includes("PENTAGON") ||
    activeMsg.content.includes("DISARMED") ||
    activeMsg.content.includes("RADAR") ||
    activeMsg.content.includes("ARMORED") ||
    activeMsg.content.includes("BATTERING") ||
    activeMsg.content.includes("SNIPER") ||
    activeMsg.content.includes("SWAT") ||
    activeMsg.content.includes("WHAT IN GOD'S NAME") ||
    activeMsg.content.includes("Shrek 2") ||
    activeMsg.content.includes("STREAMING SHREK") ||
    activeMsg.content.includes("NOT CLEARED OF MY CHARGES");

  // Camera recoil / jitter on sudden shock moments
  const jitterX = isShock && age < 8 ? Math.sin(age * 3.5) * (8 - age) * 1.5 : 0;
  const jitterY = isShock && age < 8 ? Math.cos(age * 3.5) * (8 - age) * 1.5 : 0;

  // Pop-in scale animation on message arrival
  const scale = age < 6 ? 0.96 + (age / 6) * 0.04 : 1;
  const opacity = age < 4 ? age / 4 : 1;

  const isEgg = activeMsg.author.toLowerCase().includes("egg");

  return (
    <>
      {/* Background audio REMOVED as requested. Dead-silent Discord ambience with crisp dynamic SFX. */}

      {/* Dynamic Sound Effects on Message Arrival via Centralized Audio Registry */}
      {allMessages.map((msg) => {
        const start = msg.startFrame || 0;
        const cues = getEffectiveAudioCues(msg as unknown as StudioMessage);

        return (
          <React.Fragment key={`sfx-group-${msg.id}`}>
            {cues.map((cue, cueIdx) => {
              const resolved = resolveAudioCue(cue);
              const cueStart = start + (resolved.delayFrames || 0);
              return (
                <Sequence key={`cue-${msg.id}-${cueIdx}-${cue.type}`} from={cueStart}>
                  <Audio src={staticFile(resolved.src)} volume={() => resolved.volume} />
                </Sequence>
              );
            })}
          </React.Fragment>
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
        {/* Discord Desktop Channel Header Bar */}
        {activeScene && !activeMsg.cutaway && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "56px",
              backgroundColor: "#2f3136",
              borderBottom: "1px solid #202225",
              display: "flex",
              alignItems: "center",
              padding: "0 36px",
              gap: "14px",
              zIndex: 10,
            }}
          >
            <span style={{ color: "#8e9297", fontSize: "24px", fontWeight: 700 }}>
              {activeScene.channelType === "voice" ? "🔊" : "#"}
            </span>
            <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700 }}>
              {activeScene.channelName || "general"}
            </span>
            {activeScene.topic && (
              <>
                <div style={{ width: "1px", height: "18px", backgroundColor: "#4f545c" }} />
                <span style={{ color: "#b9bbbe", fontSize: "16px", fontWeight: 400 }}>
                  {activeScene.topic}
                </span>
              </>
            )}
          </div>
        )}

        {/* Voice Call Overlay HUD when active scene is a voice channel */}
        {activeScene?.channelType === "voice" && !activeMsg.cutaway && (
          <div style={{ position: "absolute", top: "68px", left: 0, right: 0, zIndex: 11 }}>
            <VoiceCallOverlay
              channelName={activeScene.channelName}
              voiceMembers={activeScene.voiceMembers || ["Beluga", "Skittle", "Hecker"]}
              speakingMember={activeMsg.author}
              callRinging={activeMsg.voiceEvent === "call_ringing"}
            />
          </div>
        )}

        {/* If Active Item is a Cutaway Gag */}
        {activeMsg.cutaway ? (
          <CutawayScreen cutaway={activeMsg.cutaway} frame={frame} startFrame={startFrame} />
        ) : (
          /* Signature Focused Discord Message Strip (Exact Replica) */
          <div
            style={{
              width: "100%",
              backgroundColor: isAlertSender ? "#2f3136" : "#36393f",
              padding: "42px 100px",
              display: "flex",
              alignItems: "flex-start",
              gap: "44px",
              boxShadow: isAlertSender
                ? "0 0 70px rgba(0, 168, 255, 0.35), 0 0 30px rgba(0, 0, 0, 0.9)"
                : "0 0 60px rgba(0, 0, 0, 0.85)",
              borderLeft: isAlertSender ? "8px solid #00a8ff" : undefined,
              transform: `translate(${jitterX}px, ${jitterY}px) scale(${scale})`,
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
                backgroundColor: isAlertSender ? "#111111" : "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                overflow: "hidden",
                boxShadow: isAlertSender
                  ? "0 0 25px rgba(0, 168, 255, 0.5)"
                  : "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <Img
                src={getAvatar(activeMsg.author, activeMsg.avatarUrl)}
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
                    color: getAuthorColor(activeMsg.author),
                    fontSize: "62px",
                    fontWeight: 700,
                    letterSpacing: "0.3px",
                    textShadow: isAlertSender ? "0 0 15px rgba(0, 168, 255, 0.5)" : "none",
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
                  {activeMsg.time || "2:15 PM"}
                </span>
              </div>

              {/* Message Content Text */}
              <div
                style={{
                  color: "#dcddde",
                  fontSize: "58px",
                  fontWeight: 350,
                  lineHeight: "1.34",
                  marginTop: "12px",
                  whiteSpace: "pre-line",
                  wordBreak: "break-word",
                  letterSpacing: "0.2px",
                }}
              >
                {activeMsg.content}
              </div>

              {/* Optional Sent Photo / FBI Monitor / SWAT Attachment */}
              {activeMsg.attachmentUrl && (
                <div style={{ marginTop: "24px" }}>
                  <Img
                    src={
                      activeMsg.attachmentUrl.startsWith("http")
                        ? activeMsg.attachmentUrl
                        : staticFile(activeMsg.attachmentUrl)
                    }
                    style={{
                      maxWidth: "850px",
                      maxHeight: "460px",
                      borderRadius: "14px",
                      objectFit: "contain",
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
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
