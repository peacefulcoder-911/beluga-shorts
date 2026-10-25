import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateScript } from './generateScript.js';
import { uploadVideo } from './uploadToYoutube.js';
import { generateLongformScript } from './longform/scripts/generateLongformScript.js';
import { uploadLongformVideo } from './longform/scripts/uploadLongform.js';

/**
 * 🌅 Master Beluga Daily Batch Runner (6:00 AM IST)
 * Generates all 5 Shorts + 1 Long-form episode for the day in one go,
 * and schedules them on YouTube using exact publishAt timestamps.
 */
function getTodaySlots() {
  const now = new Date();
  
  // Base day in UTC
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const date = now.getUTCDate();

  // Slots in UTC matching our global audience target windows:
  // Slot 1: 03:00 UTC (08:30 AM IST)
  // Slot 2: 07:00 UTC (12:30 PM IST)
  // Slot 3: 12:00 UTC (05:30 PM IST)
  // Long-form: 14:00 UTC (07:30 PM IST)
  // Slot 4: 16:00 UTC (09:30 PM IST)
  // Slot 5: 20:00 UTC (01:30 AM IST next day)
  return {
    shorts: [
      new Date(Date.UTC(year, month, date, 3, 0, 0)).toISOString(),
      new Date(Date.UTC(year, month, date, 7, 0, 0)).toISOString(),
      new Date(Date.UTC(year, month, date, 12, 0, 0)).toISOString(),
      new Date(Date.UTC(year, month, date, 16, 0, 0)).toISOString(),
      new Date(Date.UTC(year, month, date, 20, 0, 0)).toISOString(),
    ],
    longform: new Date(Date.UTC(year, month, date, 14, 0, 0)).toISOString()
  };
}

async function runDailyBatch() {
  console.log('====================================================');
  console.log('🚀 BELUGA MASTER 6:00 AM DAILY BATCH AUTOMATION');
  console.log('====================================================\n');

  const slots = getTodaySlots();
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const publishedVideos = [];

  // ==========================================
  // PHASE 1: GENERATE & SCHEDULE 5 SHORTS
  // ==========================================
  for (let i = 0; i < 5; i++) {
    const slotTime = slots.shorts[i];
    console.log(`\n----------------------------------------------------`);
    console.log(`📱 [Short ${i + 1}/5] Preparing for slot: ${slotTime}`);
    console.log(`----------------------------------------------------`);

    try {
      // 1. Generate Script
      console.log('📝 Generating AI script with comedy universe rotation...');
      const scriptData = await generateScript();

      // 2. Render Video
      const timestamp = Date.now();
      const videoFileName = `batch_short_${i + 1}_${timestamp}.mp4`;
      const outputPath = path.join(outDir, videoFileName);

      console.log(`🎬 Rendering 9:16 Short to ${videoFileName}...`);
      execSync(`npx remotion render src/index.ts DiscordChat "${outputPath}"`, {
        stdio: 'inherit'
      });

      // 3. Upload with Scheduled Publish Time
      console.log(`📤 Uploading and scheduling publish for ${slotTime}...`);
      const videoTitle = `${scriptData.title} #shorts`;
      const videoUrl = await uploadVideo(outputPath, videoTitle, null, slotTime);

      // 4. Update history.json
      const historyPath = path.join(process.cwd(), 'history.json');
      if (fs.existsSync(historyPath)) {
        try {
          const hist = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
          if (hist.length > 0) {
            hist[hist.length - 1].videoUrl = videoUrl;
            hist[hist.length - 1].publishAt = slotTime;
            fs.writeFileSync(historyPath, JSON.stringify(hist, null, 2));
          }
        } catch (e) {}
      }

      publishedVideos.push({
        type: 'Short',
        index: i + 1,
        title: videoTitle,
        publishAt: slotTime,
        url: videoUrl
      });
      console.log(`✅ Short ${i + 1}/5 queued successfully: ${videoUrl}`);
    } catch (err) {
      console.error(`❌ Error in Short ${i + 1}:`, err.message);
    }
  }

  // ==========================================
  // PHASE 2: GENERATE & SCHEDULE 1 LONG-FORM
  // ==========================================
  console.log(`\n====================================================`);
  console.log(`📺 [Long-Form Episode] Preparing for slot: ${slots.longform}`);
  console.log(`====================================================`);

  try {
    // 1. Generate Long-form Script
    console.log('📝 Generating AI long-form episode with rotating theme...');
    await generateLongformScript();

    const scriptPath = path.join(process.cwd(), 'longform', 'data', 'script_longform.json');
    if (fs.existsSync(scriptPath)) {
      const longformData = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
      const timestamp = Date.now();
      const longformVideoFile = `batch_longform_${timestamp}.mp4`;
      const longformOutputPath = path.join(outDir, longformVideoFile);

      // 2. Render Long-form Video
      console.log(`🎬 Rendering 16:9 Long-Form episode to ${longformVideoFile}...`);
      execSync(`npx remotion render src/index.ts LongformDiscord "${longformOutputPath}"`, {
        stdio: 'inherit'
      });

      // 3. Upload with Scheduled Publish Time
      console.log(`📤 Uploading and scheduling long-form for ${slots.longform}...`);
      const longformUrl = await uploadLongformVideo(
        longformOutputPath,
        longformData.title,
        longformData.description,
        longformData.tags,
        null,
        slots.longform
      );

      // 4. Update history_longform.json
      const historyLongformPath = path.join(process.cwd(), 'longform', 'data', 'history_longform.json');
      if (fs.existsSync(historyLongformPath)) {
        try {
          const lHist = JSON.parse(fs.readFileSync(historyLongformPath, 'utf8'));
          lHist.push({
            date: new Date().toISOString(),
            title: longformData.title,
            videoId: longformUrl.split('v=')[1] || null,
            videoUrl: longformUrl,
            publishAt: slots.longform,
            privacy: 'scheduled'
          });
          fs.writeFileSync(historyLongformPath, JSON.stringify(lHist, null, 2));
        } catch (e) {}
      }

      publishedVideos.push({
        type: 'Long-Form',
        title: longformData.title,
        publishAt: slots.longform,
        url: longformUrl
      });
      console.log(`✅ Long-Form episode queued successfully: ${longformUrl}`);
    }
  } catch (lErr) {
    console.error('❌ Error generating long-form episode:', lErr.message);
  }

  console.log('\n====================================================');
  console.log('🎉 6:00 AM DAILY BATCH COMPLETE! ALL VIDEOS QUEUED');
  console.log('====================================================');
  console.table(publishedVideos);
}

if (process.argv[1] && process.argv[1].endsWith('runDailyBatch.js')) {
  runDailyBatch();
}

export { runDailyBatch };
