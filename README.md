# 🐱 Beluga Discord Chat Comedy Studio (`beluga-shorts`)

Automated AI short-form and long-form video engine for viral **Beluga-style Discord comedy skits, meme battles, and stories**.

## 🌟 Features
- **Accurate Discord UI Simulator**: Pixel-perfect Discord dark theme message rendering via Remotion & CSS.
- **Dynamic Character Cast**: Beluga, Skittle, Hecker, Pablo, Lester, Fraud Agent Fiona, Pierre, and custom bots.
- **Sound Effects Engine**: Message pop, typing sounds, join/leave chime, notification alerts.
- **Automated AI Script Generation**: AI scriptwriter powered by Gemini for witty, punchy, meme-rich dialogue.
- **Multi-Format Support**:
  - Vertical 9:16 Shorts (1080x1920) for YouTube Shorts / TikTok / Reels.
  - Horizontal 16:9 Long-form videos with custom pacing and music.
- **Built-in Web Simulator**: Standalone interactive HTML/JS Discord chat player in `simulator/`.

## 📁 Repository Structure
```
beluga-shorts/
├── src/                    # Remotion React components & composition logic
├── public/                 # Character avatars, audio SFX, attachments, fonts
├── simulator/              # Standalone interactive Discord chat simulator
├── tools/                  # Script extractors and migration utilities
├── longform/               # Long-form video configs, scripts, and compositions
├── history.json            # Archive of all generated video scripts & episodes
├── generateScript.js       # AI script generation engine
├── runDaily.js             # Automated daily batch video generator
└── uploadToYoutube.js      # Automated YouTube uploader integration
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Preview the Studio
```bash
npm run dev
```

### 3. Render a Short
```bash
npx remotion render MyComp out/beluga_video.mp4
```

### 4. Interactive Simulator
Open `simulator/index.html` in any web browser to test and preview chat sequences interactively.
