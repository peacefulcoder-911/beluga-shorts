import "./index.css";
import React from "react";
import { Still } from "remotion";
import { MyComposition } from "./Composition";
import { LongformComposition } from "../longform/src/LongformComposition";
import { Thumbnail } from "../longform/src/ThumbnailComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 9:16 Vertical Short-Form (Production, Untouched) */}
      <MyComposition />

      {/* 16:9 Landscape Long-Form (Isolated Pipeline) */}
      <LongformComposition />

      {/* 16:9 High-CTR YouTube Thumbnail */}
      <Still
        id="BelugaThumbnail"
        component={Thumbnail}
        width={1920}
        height={1080}
      />
    </>
  );
};
