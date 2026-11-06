import React from "react";
import { Composition } from "remotion";
import { DesktopDiscord } from "./DesktopDiscord";
import { LongformScene } from "./types";
import scriptData from "../data/script_longform.json";
import { calculateLongformTiming } from "../../src/core/timingEngine.ts";
import type { StudioScene } from "../../src/core/types.ts";

const fps = 30;

// Pure, deterministic timing calculation via core timing engine
const timingResult = calculateLongformTiming(scriptData.scenes as unknown as StudioScene[], {
  fps,
  initialFadeInSeconds: 0.5,
  sceneGapSeconds: 1.2,
  endPaddingSeconds: 4.0,
});

const parsedScenes = timingResult.timedScenes as unknown as LongformScene[];
const totalDurationInFrames = timingResult.totalDurationInFrames;

export const LongformComposition: React.FC = () => {
  return (
    <Composition
      id="LongformDiscord"
      component={DesktopDiscord}
      defaultProps={{
        scenes: parsedScenes,
        title: scriptData.title,
      }}
      durationInFrames={totalDurationInFrames}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
