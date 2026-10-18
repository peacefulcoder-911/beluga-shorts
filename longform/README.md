# Beluga Long-Form Video Pipeline (16:9 Landscape)

Dedicated, isolated pipeline for producing full-length episodic Discord comedy videos (2:30–4:00 minutes).

## Architecture & Complete Separation

This long-form system is completely isolated from the vertical YouTube Shorts pipeline (`daily-shorts.yml` & `runDaily.js`):
- **Shorts Pipeline**: Renders composition `DiscordChat` (720x1280 vertical), tracks history in `history.json`.
- **Long-Form Pipeline**: Renders composition `LongformDiscord` (1920x1080 horizontal), tracks history in `longform/data/history_longform.json`.

## Directory Structure
```
longform/
├── src/
│   ├── types.ts                 # Scene, channel, message definitions
│   ├── VoiceCallOverlay.tsx     # Voice call HUD with speaking avatar rings
│   ├── DesktopDiscord.tsx       # 1920x1080 Authentic Discord Desktop UI
│   └── LongformComposition.tsx  # Remotion Composition registration
├── scripts/
│   ├── generateLongformScript.js# Multi-scene 3-Act AI story generator
│   ├── uploadLongform.js        # Dedicated YouTube landscape uploader
│   └── runLongform.js           # Automated end-to-end runner
├── data/
│   ├── script_longform.json     # Current active script
│   └── history_longform.json    # Episode history (preventing duplicates)
└── README.md
```

## Local Usage

### 1. Preview in Remotion Studio
```bash
npm run dev
```
Both `DiscordChat` (Shorts) and `LongformDiscord` (Long-Form) will appear in the Remotion sidebar.

### 2. Generate a New Long-Form Episode
```bash
npm run longform:generate
```

### 3. Render a Test Video Locally
```bash
npm run longform:render
```

### 4. Run Full Long-Form Pipeline (Generate, Render & Upload)
```bash
npm run longform:start
```

## GitHub Actions Schedule
Long-form episodes run automatically every Wednesday and Saturday at 6:00 PM IST via `.github/workflows/weekly-longform.yml`. You can also trigger an upload anytime via the GitHub Actions UI (`workflow_dispatch`).
