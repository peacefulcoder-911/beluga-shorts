import path from "path";
import { uploadSpecificEpisode } from "./uploadSpecificEpisode.js";

const videoPath = path.resolve("out/beluga_pentagon_heist.mp4");
const thumbnailPath = path.resolve("out/thumbnail_pentagon_ai.jpg");

const title = "I Accidentally HACKED The Pentagon... 💀 (Full Episode)";

const description = `Beluga is experiencing severe Wi-Fi lag on Discord. Vladimir sends him a link to "boost his speed", but it routes through a US Defense mainframe... suddenly FBI Tactical SWAT surrounds Beluga's house at 2:00 AM!

🔔 Subscribe to the channel for more Beluga Discord mystery comedy episodes!
👍 Leave a LIKE if you enjoyed!

Cast:
- Beluga
- Hecker
- Skittle
- Vladimir
- FBI Special Agent Miller
- Beluga's Mom

#beluga #discord #comedy #hecker #fbi #pentagon #memes #funny #animation`;

const tags = [
  "beluga",
  "discord",
  "hecker",
  "skittle",
  "vladimir",
  "fbi",
  "pentagon",
  "hacked",
  "police",
  "comedy",
  "funny",
  "memes",
  "animation",
  "discord chat",
  "beluga discord",
  "full episode",
];

async function run() {
  console.log("🚀 Initiating YouTube Upload for Pentagon Episode...");
  const result = await uploadSpecificEpisode({
    videoPath,
    thumbnailPath,
    title,
    description,
    tags,
    privacyStatus: process.env.YOUTUBE_PRIVACY || "public",
  });
  console.log("✅ Upload finished with result:", result);
}

run().catch((err) => {
  console.error("❌ Upload runner encountered error:", err);
  process.exit(1);
});
