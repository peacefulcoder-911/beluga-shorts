import React from "react";
import { Composition } from "remotion";
import { DesktopDiscord } from "./DesktopDiscord";
import { LongformScene, LongformMessage } from "./types";
import scriptData from "../data/script_longform.json";

const fps = 30;

// Dynamic timing algorithm for 16:9 desktop long-form reading pacing
let currentFrame = 15; // 0.5s initial channel fade-in

const parsedScenes: LongformScene[] = (scriptData.scenes as LongformScene[]).map(
  (scene, sceneIdx) => {
    // Add small scene transition gap between scenes
    if (sceneIdx > 0) {
      currentFrame += Math.floor(1.2 * fps);
    }

    const parsedMessages: LongformMessage[] = scene.messages.map((msg) => {
      const startFrame = currentFrame;

      // Calculate natural reading duration based on word count and length
      const words = msg.content.trim().split(/\s+/).length;
      let durationSec = 1.6;
      if (words <= 2) durationSec = 1.3;
      else if (words <= 5) durationSec = 1.9;
      else if (words <= 9) durationSec = 2.6;
      else durationSec = 3.4;

      // Special event pacing
      if (msg.cutaway) {
        durationSec = 2.5;
      } else if (msg.voiceEvent === "call_ringing") {
        durationSec = 2.4;
      }

      const frameDuration = Math.floor(durationSec * fps);
      currentFrame += frameDuration;

      return {
        ...msg,
        startFrame,
        durationInFrames: frameDuration,
      };
    });

    return {
      ...scene,
      messages: parsedMessages,
    };
  }
);

// End padding for the punchline to sink in
currentFrame += Math.floor(3.5 * fps);
const totalDurationInFrames = currentFrame;

export const LongformComposition: React.FC = () => {
  return (
    <Composition
      id="LongformDiscord"
      component={DesktopDiscord as React.ComponentType<any>}
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
