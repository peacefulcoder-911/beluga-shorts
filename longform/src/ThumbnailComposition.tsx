import React from "react";
import { staticFile } from "remotion";

export const Thumbnail: React.FC = () => {
  return (
    <div
      style={{
        width: "1920px",
        height: "1080px",
        backgroundColor: "#0b0d13",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'gg sans', 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Background: SWAT arrival feed with heavy atmospheric darkening */}
      <img
        src={staticFile("swat_arrival.jpg")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.20) contrast(1.3) blur(2px)",
          transform: "scale(1.05)",
        }}
      />

      {/* Police siren blue and red dual atmospheric vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 18% 45%, rgba(255, 30, 30, 0.45) 0%, transparent 55%), radial-gradient(circle at 82% 40%, rgba(0, 150, 255, 0.4) 0%, transparent 60%), linear-gradient(180deg, rgba(5,7,12,0.88) 0%, rgba(10,12,18,0.3) 40%, rgba(5,7,12,0.95) 100%)",
        }}
      />

      {/* Top Banner: Huge High-Impact Viral Headline with high contrast */}
      <div
        style={{
          position: "absolute",
          top: "35px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          zIndex: 20,
          whiteSpace: "nowrap",
          filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.95))",
        }}
      >
        <div
          style={{
            backgroundColor: "#ff0055",
            color: "#ffffff",
            fontSize: "46px",
            fontWeight: 900,
            padding: "10px 28px",
            borderRadius: "16px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            boxShadow: "0 8px 30px rgba(255, 0, 85, 0.7)",
            border: "4px solid #ffffff",
          }}
        >
          🚨 FBI RAID 🚨
        </div>
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            padding: "8px 30px",
            borderRadius: "20px",
            border: "3px solid rgba(255, 230, 0, 0.6)",
            color: "#ffe600",
            fontSize: "78px",
            fontWeight: 900,
            letterSpacing: "1px",
            textShadow:
              "0 4px 0 #000, 0 8px 0 #000, 0 12px 28px rgba(0,0,0,0.95), 0 0 35px rgba(255, 230, 0, 0.8)",
            WebkitTextStroke: "2.5px #000000",
          }}
        >
          I HACKED THE PENTAGON?! 💀
        </div>
      </div>

      {/* LEFT: THE REAL BELUGA (Iconic Meme Cat Face) */}
      <div
        style={{
          position: "relative",
          marginLeft: "65px",
          marginTop: "65px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Massive Beluga Portrait Container */}
        <div
          style={{
            position: "relative",
            width: "540px",
            height: "540px",
            borderRadius: "50%",
            backgroundColor: "#202225",
            border: "12px solid #ffffff",
            boxShadow:
              "0 0 0 10px #ff2a2a, 0 0 70px rgba(255, 42, 42, 0.85), 0 25px 50px rgba(0,0,0,0.95)",
            overflow: "hidden",
          }}
        >
          {/* Canonical Beluga Cat Photo */}
          <img
            src={staticFile("beluga.jpg")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scale(1.14) translateY(-12px)",
              filter: "contrast(1.15) brightness(1.05)",
            }}
          />

          {/* Red Tactical Sniper Laser Dot on Forehead */}
          <div
            style={{
              position: "absolute",
              top: "145px",
              left: "250px",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#ff0000",
              boxShadow: "0 0 25px 12px #ff0033, 0 0 50px 25px #ff0000",
              border: "3px solid #ffffff",
              zIndex: 15,
            }}
          />
        </div>

        {/* Laser beam trailing in from left directly to the dot */}
        <div
          style={{
            position: "absolute",
            top: "157px",
            left: "-180px",
            width: "440px",
            height: "4px",
            backgroundColor: "#ff0033",
            boxShadow: "0 0 15px 3px #ff0000",
            transform: "rotate(6deg)",
            opacity: 0.9,
            zIndex: 12,
            pointerEvents: "none",
          }}
        />

        {/* Beluga Name Badge */}
        <div
          style={{
            marginTop: "22px",
            backgroundColor: "#1e1f22",
            color: "#ffffff",
            fontSize: "48px",
            fontWeight: 900,
            padding: "10px 48px",
            borderRadius: "30px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            border: "3px solid rgba(255,255,255,0.25)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
          }}
        >
          {/* Discord Online Status Indicator */}
          <span
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: "#23a55a",
              border: "4px solid #1e1f22",
              boxShadow: "0 0 12px #23a55a",
            }}
          />
          Beluga
        </div>
      </div>

      {/* RIGHT: Authentic Giant Discord Chat UI */}
      <div
        style={{
          position: "relative",
          marginRight: "55px",
          marginTop: "65px",
          width: "1170px",
          backgroundColor: "#313338",
          borderRadius: "32px",
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow:
            "0 0 80px rgba(0, 168, 255, 0.45), 0 25px 60px rgba(0, 0, 0, 0.95)",
          border: "4px solid rgba(0, 168, 255, 0.7)",
          zIndex: 10,
        }}
      >
        {/* Message 1: Police Agent */}
        <div style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "130px",
              height: "130px",
              borderRadius: "50%",
              backgroundColor: "#111",
              overflow: "hidden",
              flexShrink: 0,
              border: "4px solid #00a8ff",
              boxShadow: "0 0 25px rgba(0, 168, 255, 0.8)",
            }}
          >
            <img
              src={staticFile("police.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span
                style={{
                  color: "#00a8ff",
                  fontSize: "52px",
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                }}
              >
                Special Agent Miller
              </span>
              <span
                style={{
                  backgroundColor: "#5865f2",
                  color: "#ffffff",
                  fontSize: "22px",
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: "8px",
                }}
              >
                BOT
              </span>
              <span style={{ color: "#949ba4", fontSize: "32px", fontWeight: 500 }}>
                Today at 2:00 AM
              </span>
            </div>

            <div
              style={{
                color: "#ffffff",
                fontSize: "46px",
                fontWeight: 700,
                lineHeight: 1.3,
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              }}
            >
              STEP AWAY FROM THE KEYBOARD. 🚨
            </div>

            <div
              style={{
                color: "#f23f43",
                fontSize: "40px",
                fontWeight: 800,
                marginTop: "4px",
              }}
            >
              WE HAVE YOUR HOUSE SURROUNDED.
            </div>
          </div>
        </div>

        {/* Attachment Card: FBI Monitor Screen Alert */}
        <div
          style={{
            marginLeft: "158px",
            backgroundColor: "#2b2d31",
            borderRadius: "20px",
            padding: "20px",
            border: "3px solid #f23f43",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            boxShadow: "0 8px 24px rgba(242, 63, 67, 0.3)",
          }}
        >
          <img
            src={staticFile("fbi_alert.jpg")}
            style={{
              width: "280px",
              height: "160px",
              objectFit: "cover",
              borderRadius: "14px",
              border: "2px solid #f23f43",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span
              style={{
                color: "#f23f43",
                fontSize: "34px",
                fontWeight: 900,
                letterSpacing: "1px",
              }}
            >
              ⚠️ LEVEL 5 PENTAGON DEFENSE BREACH
            </span>
            <span style={{ color: "#dbdee1", fontSize: "28px", fontWeight: 600 }}>
              Device IP: 192.168.1.42 (Beluga-Smart-Toaster)
            </span>
            <span style={{ color: "#23a55a", fontSize: "26px", fontWeight: 800 }}>
              Status: TACTICAL ASSAULT AUTHORIZED
            </span>
          </div>
        </div>

        {/* Message 2: Beluga Panic Response */}
        <div style={{ display: "flex", gap: "28px", alignItems: "flex-start", marginTop: "8px" }}>
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              overflow: "hidden",
              flexShrink: 0,
              border: "3px solid #5865f2",
            }}
          >
            <img
              src={staticFile("beluga.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ color: "#ffffff", fontSize: "42px", fontWeight: 800 }}>
                Beluga
              </span>
              <span style={{ color: "#949ba4", fontSize: "28px" }}>Today at 2:01 AM</span>
            </div>
            <div
              style={{
                color: "#ffe600",
                fontSize: "44px",
                fontWeight: 800,
                backgroundColor: "rgba(255, 230, 0, 0.12)",
                padding: "8px 18px",
                borderRadius: "12px",
                borderLeft: "6px solid #ffe600",
              }}
            >
              can i at least finish downloading Shrek 2 first? 😭
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
