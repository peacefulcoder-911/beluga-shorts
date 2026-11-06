import React from "react";
import { staticFile, Img } from "remotion";

export const RealisticElonDM: React.FC = () => {
  return (
    <div
      style={{
        width: 1080,
        height: 680,
        backgroundColor: "#000000",
        color: "#e7e9ea",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        padding: "0",
        overflow: "hidden",
        border: "1px solid #2f3336",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid #2f3336",
          backgroundColor: "rgba(0, 0, 0, 0.85)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Back Chevron */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#eff3f4">
            <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
          </svg>

          {/* Profile Picture */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #2f3336",
            }}
          >
            <Img
              src={staticFile("characters/elon_musk.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Name & Handle */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff" }}>
                Elon Musk
              </span>
              {/* Official Blue Verified Badge */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1d9bf0">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.05 1.273 2.42 2.148 4 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.05 2.148-2.42 2.148-4zM10.2 16.6l-3.5-3.5 1.4-1.4 2.1 2.1 5.3-5.3 1.4 1.4-6.7 6.7z" />
              </svg>
            </div>
            <div style={{ fontSize: "14px", color: "#71767b" }}>@elonmusk</div>
          </div>
        </div>

        {/* More Options Icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#eff3f4">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </div>

      {/* Date Divider */}
      <div
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "#71767b",
          margin: "14px 0 10px 0",
          fontWeight: 500,
        }}
      >
        Today · 2:41 AM
      </div>

      {/* Direct Messages Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "0 28px",
          justifyContent: "center",
        }}
      >
        {/* Beluga Message 1 (Outgoing) */}
        <div style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
          <div
            style={{
              backgroundColor: "#1d9bf0",
              color: "#ffffff",
              padding: "14px 20px",
              borderRadius: "22px 22px 4px 22px",
              fontSize: "17px",
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            hello mr elon can i please have 1 billion dollars i want to buy chicken nuggets and discord nitro
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#71767b",
              textAlign: "right",
              marginTop: "4px",
              marginRight: "4px",
            }}
          >
            2:41 AM · Seen
          </div>
        </div>

        {/* Elon Musk Reply 1 (Incoming) */}
        <div style={{ display: "flex", gap: "10px", alignSelf: "flex-start", maxWidth: "84%" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              alignSelf: "flex-end",
            }}
          >
            <Img
              src={staticFile("characters/elon_musk.jpg")}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <div
              style={{
                backgroundColor: "#2f3336",
                color: "#e7e9ea",
                padding: "14px 20px",
                borderRadius: "22px 22px 22px 4px",
                fontSize: "17px",
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              Only if you can solve this riddle:
              <br />
              <span style={{ color: "#ffd700", fontWeight: 700 }}>
                What is the secret answer to life, the universe, and everything?
              </span>
              <br />
              <span style={{ fontSize: "14px", color: "#00ba7c" }}>
                ⚡ Wire transfer of $1,000,000,000.00 will be initiated upon answer.
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#71767b",
                marginTop: "4px",
                marginLeft: "4px",
              }}
            >
              2:41 AM
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Message Input Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "14px 24px",
          borderTop: "1px solid #2f3336",
          backgroundColor: "#000000",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: "#202327",
            borderRadius: "20px",
            padding: "10px 18px",
            fontSize: "15px",
            color: "#71767b",
          }}
        >
          Start a direct message...
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1d9bf0">
          <path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c.184 1.981.487 3.901.761 4.969L17.15 12 6.742 6.031c-.274 1.068-.577 2.988-.761 4.969H12v2H5.981z" />
        </svg>
      </div>
    </div>
  );
};

