import "./index.css";
import { MyComposition } from "./Composition";
import { LongformComposition } from "../longform/src/LongformComposition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 9:16 Vertical Short-Form (Production, Untouched) */}
      <MyComposition />

      {/* 16:9 Landscape Long-Form (Isolated Pipeline) */}
      <LongformComposition />
    </>
  );
};
