import React from "react";
import { staticFile, Img } from "remotion";
import scriptData from "../data/script_longform.json";

interface ThumbnailMeta {
  author?: string;
  authorColor?: string;
  authorAvatar?: string;
  authorTime?: string;
  authorMessage?: string;
  belugaTime?: string;
  belugaMessage?: string;
  highlightWord?: string;
}

const resolveAvatar = (name?: string, avatar?: string): string => {
  if (avatar && !avatar.includes("example.com")) {
    return avatar.startsWith("http") ? avatar : staticFile(avatar);
  }
  const n = (name || "").toLowerCase();
  if (n.includes("mrbeast") || n.includes("beast")) return staticFile("characters/mrbeast.jpg");
  if (n.includes("hecker")) return staticFile("hecker.jpg");
  if (n.includes("skittle")) return staticFile("skittle.jpg");
  if (n.includes("pablo")) return staticFile("pablo.jpg");
  if (n.includes("mom") || n.includes("mother")) return staticFile("mom.jpg");
  if (n.includes("admin") || n.includes("mod") || n.includes("lester")) return staticFile("admin.jpg");
  if (n.includes("unknown") || n.includes("shadow") || n.includes("entity") || n.includes("void")) return staticFile("unknown.jpg");
  return staticFile("police.jpg");
};

export const Thumbnail: React.FC = () => {
  // Support custom thumbnail metadata if present in script, or default to the iconic episode punchline
  const thumbMeta: ThumbnailMeta = (scriptData as { thumbnail?: ThumbnailMeta }).thumbnail || {
    author: "Police",
    authorColor: "#5865F2",
    authorAvatar: "police.jpg",
    authorTime: "Today at 3:14 AM",
    authorMessage: "STEP AWAY FROM THE KEYBOARD.",
    belugaTime: "Today at 3:14 AM",
    belugaMessage: "can i at least finish downloading Shrek 2 first?",
    highlightWord: "KEYBOARD.",
  };

  const authorAvatarSrc = resolveAvatar(thumbMeta.author, thumbMeta.authorAvatar);

  return (
    <div
      style={{
        width: "1920px",
        height: "1080px",
        backgroundColor: "#111214", // Authentic deep Discord OLED dark
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'gg sans', 'Whitney', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Very subtle ambient atmospheric vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(30, 31, 34, 0.4) 0%, rgba(10, 11, 13, 0.95) 100%)",
        }}
      />

      {/* Main Centered High-Contrast Discord Message Card */}
      <div
        style={{
          position: "relative",
          width: "1640px",
          display: "flex",
          flexDirection: "column",
          gap: "54px",
          zIndex: 10,
          padding: "40px",
        }}
      >
        {/* MESSAGE 1: The Authority / Antagonist Hook (Police, Hecker, Mom, Scammer) */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "40px" }}>
          {/* Avatar */}
          <div
            style={{
              width: "170px",
              height: "170px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: "#2b2d31",
              border: "4px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
            }}
          >
            <Img
              src={authorAvatarSrc}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Text Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, marginTop: "6px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "24px" }}>
              <span
                style={{
                  color: thumbMeta.authorColor || "#5865F2",
                  fontSize: "64px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                {thumbMeta.author}
              </span>
              <span
                style={{
                  color: "#949ba4",
                  fontSize: "40px",
                  fontWeight: 500,
                }}
              >
                {thumbMeta.authorTime}
              </span>
            </div>

            <div
              style={{
                color: "#dbdee1",
                fontSize: "72px",
                fontWeight: 500,
                lineHeight: 1.25,
                letterSpacing: "-0.5px",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
              }}
            >
              {thumbMeta.authorMessage}
            </div>
          </div>
        </div>

        {/* Divider subtle line between messages for visual rhythm */}
        <div
          style={{
            height: "2px",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            marginLeft: "210px",
          }}
        />

        {/* MESSAGE 2: Beluga's Iconic Deadpan Punchline */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "40px" }}>
          {/* Beluga Avatar with Online Badge */}
          <div style={{ position: "relative", width: "170px", height: "170px", flexShrink: 0 }}>
            <div
              style={{
                width: "170px",
                height: "170px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#2b2d31",
                border: "4px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
              }}
            >
              <Img
                src={staticFile("beluga.jpg")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scale(1.1) translateY(-6px)",
                }}
              />
            </div>
            {/* Green Online Dot */}
            <div
              style={{
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                width: "48px",
                height: "48px",
                backgroundColor: "#23a55a",
                borderRadius: "50%",
                border: "8px solid #111214",
              }}
            />
          </div>

          {/* Text Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, marginTop: "6px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "24px" }}>
              <span
                style={{
                  color: "#f2f3f5",
                  fontSize: "64px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                }}
              >
                Beluga
              </span>
              <span
                style={{
                  color: "#949ba4",
                  fontSize: "40px",
                  fontWeight: 500,
                }}
              >
                {thumbMeta.belugaTime}
              </span>
            </div>

            <div
              style={{
                color: "#dbdee1",
                fontSize: "72px",
                fontWeight: 500,
                lineHeight: 1.25,
                letterSpacing: "-0.5px",
                textShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
              }}
            >
              {thumbMeta.belugaMessage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
