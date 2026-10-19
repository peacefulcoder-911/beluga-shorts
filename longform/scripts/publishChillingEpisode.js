import path from 'path';
import { uploadSpecificEpisode } from './uploadSpecificEpisode.js';

async function main() {
  const args = process.argv.slice(2);
  const useCinematicThumb = args.includes('--thumb-cinematic');
  const thumbnailPath = useCinematicThumb
    ? path.join(process.cwd(), 'out', 'thumbnail_cinematic.jpg')
    : path.join(process.cwd(), 'out', 'thumbnail_classic.png');

  const videoPath = path.join(process.cwd(), 'out', 'beluga_3am_chills_longform.mp4');

  const title = "When An Unknown Entity Watches Your House At 3 AM... 💀";
  const description = `Beluga helps Egg reach 10 Million subscribers at 3:14 AM... but the livestream gets hijacked by an entity inside Beluga's home router. Beluga hears footsteps creeping up the creaking stairs...

🔔 Subscribe for more Beluga Discord adventures!
Like and comment if you want a Part 2!

#beluga #discord #horror #comedy #hecker #skittle #egg #3am #memes`;

  const tags = ["beluga", "discord", "3am", "horror", "creepy", "comedy", "hecker", "skittle", "egg", "funny", "memes", "animation", "livestream"];

  let privacyStatus = 'public';
  let publishAt = null;

  if (args.includes('--unlisted')) {
    privacyStatus = 'unlisted';
  } else if (args.includes('--schedule-evening')) {
    // 6:00 PM IST on Oct 20 = 12:30:00 UTC
    publishAt = '2026-10-20T12:30:00.000Z';
  } else {
    // Default: publish now (active US peak afternoon window)
    privacyStatus = 'public';
  }

  console.log(`🎬 Target Video: ${videoPath}`);
  console.log(`🖼️ Target Thumbnail: ${thumbnailPath}`);

  const result = await uploadSpecificEpisode({
    videoPath,
    thumbnailPath,
    title,
    description,
    tags,
    privacyStatus,
    publishAt,
  });

  console.log('\n====================================');
  console.log(`🚀 SUCCESS! Episode processed for YouTube!`);
  console.log(`📺 URL: ${result.videoUrl}`);
  console.log('====================================\n');
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
