import React from "react";
import { staticFile } from "remotion";

export interface VoiceCallOverlayProps {
  channelName: string;
  voiceMembers: string[];
  speakingMember?: string;
  callRinging?: boolean;
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

export const VoiceCallOverlay: React.FC<VoiceCallOverlayProps> = ({
  channelName,
  voiceMembers,
  speakingMember,
  callRinging = false,
}) => {
  if (voiceMembers.length === 0 && !callRinging) return null;

  return (
    <div
      style={{
        backgroundColor: "#18191c",
        borderRadius: "12px",
        padding: "16px 20px",
        margin: "12px 20px 8px 20px",
        border: "1px solid #2f3136",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Voice Status Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #292b2f",
          paddingBottom: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: callRinging ? "#fee75c" : "#3ba55c",
              boxShadow: callRinging
                ? "0 0 10px #fee75c"
                : "0 0 10px #3ba55c",
            }}
          />
          <span style={{ color: "#3ba55c", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" }}>
            {callRinging ? "CALL RINGING..." : "VOICE CONNECTED"}
          </span>
          <span style={{ color: "#8e9297", fontSize: "13px" }}>
            / {channelName} / RTC 24ms (Good)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{
              backgroundColor: "#2f3136",
              border: "none",
              color: "#dcddde",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🔇 Mute
          </button>
          <button
            style={{
              backgroundColor: "#2f3136",
              border: "none",
              color: "#dcddde",
              padding: "6px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            🎧 Deafen
          </button>
          <button
            style={{
              backgroundColor: "#ed4245",
              border: "none",
              color: "white",
              padding: "6px 14px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Disconnect 📞
          </button>
        </div>
      </div>

      {/* Voice Call Avatar Grid */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {voiceMembers.map((member) => {
          const isSpeaking = speakingMember?.toLowerCase() === member.toLowerCase();
          return (
            <div
              key={member}
              style={{
                width: "200px",
                height: "150px",
                backgroundColor: "#202225",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                border: isSpeaking ? "3px solid #3ba55c" : "2px solid #2f3136",
                boxShadow: isSpeaking
                  ? "0 0 20px rgba(59, 165, 92, 0.7)"
                  : "none",
                transition: "all 0.15s ease-in-out",
              }}
            >
              <img
                src={getAvatar(member)}
                style={{
                  width: "74px",
                  height: "74px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: isSpeaking ? "3px solid #3ba55c" : "2px solid #40444b",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "12px" }}>{isSpeaking ? "🎙️" : "🔈"}</span>
                <span
                  style={{
                    color: isSpeaking ? "#3ba55c" : "#ffffff",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {member}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
