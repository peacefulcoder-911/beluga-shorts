import React from "react";
import { staticFile } from "remotion";

export const Thumbnail: React.FC = () => {
  return (
    <div
      style={{
        width: "1920px",
        height: "1080px",
        backgroundColor: "#080c14",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'gg sans', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Background: SWAT arrival night vision with heavy atmospheric gradient */}
      <img
        src={staticFile("swat_arrival.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.24) contrast(1.2)",
        }}
      />

      {/* Police siren blue and red dual atmospheric vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 80% 30%, rgba(0, 168, 255, 0.3) 0%, transparent 60%), radial-gradient(circle at 15% 70%, rgba(255, 50, 50, 0.35) 0%, transparent 60%), radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.6) 0%, rgba(0,0,0,0.92) 100%)",
        }}
      />

      {/* Top Punchy Viral Banner Text */}
      <div
        style={{
          position: "absolute",
          top: "45px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "18px",
          alignItems: "center",
          zIndex: 10,
          textShadow: "0 6px 20px rgba(0,0,0,0.95), 0 0 30px rgba(0, 168, 255, 0.8)",
        }}
      >
        <span
          style={{
            backgroundColor: "#00a8ff",
            color: "#ffffff",
            fontSize: "58px",
            fontWeight: 900,
            padding: "8px 28px",
            borderRadius: "14px",
            letterSpacing: "1px",
            boxShadow: "0 8px 24px rgba(0, 168, 255, 0.6)",
          }}
        >
          FBI RAID
        </span>
        <span
          style={{
            color: "#ffdd59",
            fontSize: "68px",
            fontWeight: 900,
            letterSpacing: "1px",
          }}
        >
          I HACKED THE PENTAGON?! 💀
        </span>
      </div>

      {/* Left: Huge Iconic Beluga Cat Meme Avatar */}
      <div
        style={{
          position: "relative",
          marginLeft: "80px",
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            overflow: "hidden",
            boxShadow: "0 0 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(0, 168, 255, 0.7)",
            border: "8px solid #00a8ff",
          }}
        >
          <img
            src={staticFile("beluga.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Beluga Name Tag */}
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#202225",
            color: "#ffffff",
            fontSize: "44px",
            fontWeight: 800,
            padding: "8px 36px",
            borderRadius: "24px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
            border: "2px solid rgba(255,255,255,0.15)",
          }}
        >
          Beluga
        </div>
      </div>

      {/* Right: Massive Realistic Floating Discord Message */}
      <div
        style={{
          position: "relative",
          marginRight: "70px",
          width: "1150px",
          backgroundColor: "#2b2d32",
          borderRadius: "28px",
          padding: "44px 50px",
          display: "flex",
          alignItems: "center",
          gap: "36px",
          boxShadow: "0 0 80px rgba(0, 168, 255, 0.4), 0 20px 50px rgba(0, 0, 0, 0.9)",
          borderLeft: "12px solid #00a8ff",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          zIndex: 5,
        }}
      >
        {/* Police Agent Avatar */}
        <div
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            backgroundColor: "#111111",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 0 30px rgba(0, 168, 255, 0.7)",
            border: "4px solid #00a8ff",
          }}
        >
          <img
            src={staticFile("police.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Text Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "18px" }}>
            <span
              style={{
                color: "#00a8ff",
                fontSize: "64px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                textShadow: "0 0 20px rgba(0, 168, 255, 0.6)",
              }}
            >
              Police
            </span>
            <span style={{ color: "#80848e", fontSize: "38px", fontWeight: 500 }}>
              2:20 PM
            </span>
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: "64px",
              fontWeight: 400,
              lineHeight: 1.25,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            STEP AWAY FROM THE KEYBOARD. 🚨
          </div>
        </div>
      </div>

      {/* Police SWAT Alert Badge Bottom-Right */}
      <div
        style={{
          position: "absolute",
          bottom: "35px",
          right: "50px",
          backgroundColor: "#ff3838",
          color: "#ffffff",
          fontSize: "36px",
          fontWeight: 900,
          padding: "10px 24px",
          borderRadius: "30px",
          boxShadow: "0 6px 20px rgba(255, 56, 56, 0.8)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#ffffff" }} />
        LEVEL 5 DEFENSE BREACH
      </div>
    </div>
  );
};
