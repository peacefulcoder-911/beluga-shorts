import React from "react";
import { CutawayData } from "./types";
import { staticFile, Img } from "remotion";

export const CutawayScreen: React.FC<{ cutaway: CutawayData; frame: number; startFrame: number }> = ({
  cutaway,
  frame,
  startFrame,
}) => {
  const age = frame - startFrame;

  if (cutaway.type === "subscribe_button") {
    // Mouse cursor animation hovering & clicking the button
    const cursorProgress = Math.min(1, age / 12);
    const cursorX = 890 + cursorProgress * 40;
    const cursorY = 600 - cursorProgress * 30;
    const isClicked = age >= 15;
    const buttonScale = age >= 15 && age <= 22 ? 0.96 : 1.0;

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cinematic letterbox bars on top and bottom */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "65px", backgroundColor: "#000000" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "65px", backgroundColor: "#000000" }} />

        {/* Subscribe Pill Button (Identical to Screenshot 3) */}
        <div
          style={{
            width: "840px",
            height: "180px",
            borderRadius: "90px",
            background: isClicked 
              ? "linear-gradient(180deg, #222222 0%, #181818 100%)" 
              : "linear-gradient(180deg, #383838 0%, #252525 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "64px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
            transform: `scale(${buttonScale})`,
            boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {isClicked ? "Subscribed ✓" : "Subscribe"}
        </div>

        {/* Animated Mouse Cursor Pointer */}
        <div
          style={{
            position: "absolute",
            left: `${cursorX}px`,
            top: `${cursorY}px`,
            pointerEvents: "none",
            transform: isClicked ? "scale(0.88)" : "scale(1)",
            filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))",
          }}
        >
          <svg width="65" height="75" viewBox="0 0 24 28" fill="none">
            <path
              d="M3 2L3 22L8 17L12 25L15 23.5L11 15.5L18 15.5L3 2Z"
              fill="#000000"
              stroke="#ffffff"
              strokeWidth="1.8"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (cutaway.type === "youtube_channel") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          color: "#ffffff",
          fontFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Letterbox top gap */}
        <div style={{ height: "65px", backgroundColor: "#000000" }} />

        {/* Channel Banner (Screenshot 1) */}
        <div
          style={{
            height: "220px",
            backgroundColor: "#1c1c1c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #272727",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: 600,
              color: "#aaaaaa",
              letterSpacing: "1px",
            }}
          >
            {cutaway.bannerText || "face reveal at 10M subs"}
          </span>
        </div>

        {/* Channel Info Section (Screenshot 1) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            padding: "36px 80px 24px 80px",
          }}
        >
          {/* Channel Avatar (Egg) */}
          <div
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              border: "3px solid #333333",
            }}
          >
            <Img
              src={cutaway.avatarUrl || staticFile("egg.png")}
              style={{
                width: "90%",
                height: "90%",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "56px", fontWeight: 700 }}>
                {cutaway.channelName || "Egg gaming"}
              </span>
              {/* YouTube Verified Checkmark */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#888888",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000000",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                ✓
              </div>
            </div>

            <span style={{ fontSize: "30px", color: "#aaaaaa", fontWeight: 400 }}>
              {cutaway.subscriberCount || "9.99M subscribers"}
            </span>
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            padding: "0 80px 16px 80px",
            borderBottom: "1px solid #272727",
            fontSize: "24px",
            fontWeight: 600,
            color: "#aaaaaa",
          }}
        >
          <span>Home</span>
          <span style={{ color: "#ffffff", borderBottom: "4px solid #ffffff", paddingBottom: "12px" }}>
            Videos
          </span>
          <span>Shorts</span>
          <span>Live</span>
          <span>Playlists</span>
          <span>Posts</span>
          <span>Store</span>
        </div>

        {/* Video Thumbnails Section */}
        <div
          style={{
            display: "flex",
            gap: "30px",
            padding: "24px 80px",
          }}
        >
          <div
            style={{
              width: "440px",
              height: "220px",
              backgroundColor: "#202020",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
              color: "#888888",
              border: "1px solid #2d2d2d",
            }}
          >
            BEST SNIPER 🎯
          </div>
          <div
            style={{
              width: "440px",
              height: "220px",
              backgroundColor: "#202020",
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
              color: "#ff4d4d",
              border: "1px solid #ff4d4d",
            }}
          >
            🔴 LIVE 3 AM
          </div>
        </div>

        {/* Bottom letterbox */}
        <div style={{ height: "60px", backgroundColor: "#000000", marginTop: "auto" }} />
      </div>
    );
  }

  if (cutaway.type === "image") {
    const imgSrc = cutaway.imageUrl?.startsWith("http")
      ? cutaway.imageUrl
      : staticFile(cutaway.imageUrl || "cctv_stairs.jpg");
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Img
          src={imgSrc}
          style={{
            maxWidth: "100%",
            maxHeight: "920px",
            objectFit: "contain",
            boxShadow: "0 0 50px rgba(0,0,0,0.9)",
          }}
        />
        {cutaway.bannerText && (
          <div
            style={{
              position: "absolute",
              bottom: "80px",
              backgroundColor: "rgba(0,0,0,0.85)",
              color: "#ff4d4d",
              fontSize: "36px",
              fontWeight: 700,
              padding: "12px 32px",
              borderRadius: "12px",
              border: "1px solid #ff4d4d",
              letterSpacing: "1px",
            }}
          >
            {cutaway.bannerText}
          </div>
        )}
      </div>
    );
  }

  return null;
};
