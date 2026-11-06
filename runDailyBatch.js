import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateScript } from './generateScript.js';
import { uploadVideo } from './uploadToYoutube.js';
import { generateLongformScript } from './longform/scripts/generateLongformScript.js';
import { uploadLongformVideo } from './longform/scripts/uploadLongform.js';

/**
 * 🌅 Master Beluga Daily Batch Runner (5:00 AM IST / 23:30 UTC)
 * Generates 3 Shorts + 1 Long-form episode for the day in one morning batch,
 * and schedules them on YouTube for optimal audience peak watch hours:
 * 
 * 1. Short 1: 01:00 PM IST (07:30 UTC) - Midday / Lunch Peak
 * 2. Short 2: 05:00 PM IST (11:30 UTC) - After-School / Post-Work Peak
 * 3. Long-Form: 07:00 PM IST (13:30 UTC) - Prime Evening Living Room Feature
 * 4. Short 3: 08:30 PM IST (15:00 UTC) - Night-time Screen Time Peak
 */
export function getTodaySlots() {
  const now = new Date();
  // Compute date in Indian Standard Time (UTC + 5 hours 30 mins)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffsetMs);

  const year = istNow.getUTCFullYear();
  const month = istNow.getUTCMonth();
  const date = istNow.getUTCDate();

  return {
    shorts: [
      new Date(Date.UTC(year, month, date, 7, 30, 0)).toISOString(),  // 01:00 PM IST (07:30 UTC)
      new Date(Date.UTC(year, month, date, 11, 30, 0)).toISOString(), // 05:00 PM IST (11:30 UTC)
      new Date(Date.UTC(year, month, date, 15, 0, 0)).toISOString(),  // 08:30 PM IST (15:00 UTC)
    ],
    longform: new Date(Date.UTC(year, month, date, 13, 30, 0)).toISOString(), // 07:00 PM IST (13:30 UTC)
  };
}

async function runDailyBatch() {
  console.log('================================================================');
  console.log('🚀 BELUGA MASTER 5:00 AM DAILY AUTOPILOT (3 SHORTS + 1 LONG-FORM)');
  console.log('================================================================\n');

  const slots = getTodaySlots();
  const outDir = path.join(process.cwd(), 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const publishedVideos = [];
  const usedTopicIds = [];

  // ==========================================
  // PHASE 1: GENERATE & SCHEDULE 3 SHORTS
  // ==========================================
  for (let i = 0; i < 3; i++) {
    const slotTime = slots.shorts[i];
    const slotLabels = ['01:00 PM IST (Lunch Peak)', '05:00 PM IST (After-School Peak)', '08:30 PM IST (Night Peak)'];
    console.log(`\n----------------------------------------------------`);
    console.log(`📱 [Short ${i + 1}/3] Slot: ${slotLabels[i]} (${slotTime})`);
    console.log(`----------------------------------------------------`);

    try {
      // 1. Generate Script with slot-specific category diversity & anti-repetition
      console.log('📝 Generating script with diverse non-repeating category...');
      const scriptData = await generateScript({
        slotIndex: i,
        totalSlots: 3,
        excludeIds: usedTopicIds,
      });

      if (scriptData && scriptData.trendingTopic) {
        usedTopicIds.push(scriptData.trendingTopic);
      }

      // 2. Render Video
      const timestamp = Date.now();
      const videoFileName = `batch_short_${i + 1}_${timestamp}.mp4`;
      const outputPath = path.join(outDir, videoFileName);

      console.log(`🎬 Rendering 9:16 Short to ${videoFileName}...`);
      execSync(`npx remotion render src/index.ts DiscordChat "${outputPath}"`, {
        stdio: 'inherit',
      });

      // 3. Upload with Scheduled Publish Time
      console.log(`📤 Uploading and scheduling publish for ${slotTime}...`);
      const videoTitle = `${scriptData.title} #shorts`;
      let videoUrl = 'https://youtube.com/watch?v=simulated';

      if (process.env.YOUTUBE_REFRESH_TOKEN) {
        videoUrl = await uploadVideo(outputPath, videoTitle, null, slotTime);
      } else {
        console.log('ℹ️ Running in simulation mode (no YOUTUBE_REFRESH_TOKEN).');
      }

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
        } catch (e) {
          console.warn('⚠️ Could not update history record with URL:', e.message);
        }
      }

      // Clean up rendered video file to preserve disk space
      if (fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
          console.log(`🧹 Cleaned up temporary video artifact: ${videoFileName}`);
        } catch {}
      }

      publishedVideos.push({
        type: 'Short',
        index: i + 1,
        title: videoTitle,
        slotLabel: slotLabels[i],
        publishAt: slotTime,
        url: videoUrl,
      });
      console.log(`✅ Short ${i + 1}/3 queued successfully: ${videoUrl}`);
    } catch (err) {
      console.error(`❌ Error in Short ${i + 1}:`, err.message);
    }
  }

  // ==========================================
  // PHASE 2: GENERATE & SCHEDULE 1 LONG-FORM
  // ==========================================
  console.log(`\n====================================================`);
  console.log(`📺 [Long-Form Episode] Slot: 07:00 PM IST (Evening Prime Time) (${slots.longform})`);
  console.log(`====================================================`);

  try {
    // 1. Generate Long-form Script
    console.log('📝 Generating long-form episode with rotating multi-scene mystery...');
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
        stdio: 'inherit',
      });

      // 3. Upload with Scheduled Publish Time
      console.log(`📤 Uploading and scheduling long-form for ${slots.longform}...`);
      let longformUrl = 'https://youtube.com/watch?v=simulated_longform';

      if (process.env.YOUTUBE_REFRESH_TOKEN) {
        longformUrl = await uploadLongformVideo(
          longformOutputPath,
          longformData.title,
          longformData.description,
          longformData.tags,
          null,
          slots.longform
        );
      } else {
        console.log('ℹ️ Running in simulation mode (no YOUTUBE_REFRESH_TOKEN).');
      }

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
            privacy: 'scheduled',
          });
          fs.writeFileSync(historyLongformPath, JSON.stringify(lHist, null, 2));
        } catch (e) {
          console.warn('⚠️ Could not update longform history with URL:', e.message);
        }
      }

      // Clean up rendered video file to preserve disk space
      if (fs.existsSync(longformOutputPath)) {
        try {
          fs.unlinkSync(longformOutputPath);
          console.log(`🧹 Cleaned up temporary video artifact: ${longformVideoFile}`);
        } catch {}
      }

      publishedVideos.push({
        type: 'Long-Form',
        index: 1,
        title: longformData.title,
        slotLabel: '07:00 PM IST (Evening Prime)',
        publishAt: slots.longform,
        url: longformUrl,
      });
      console.log(`✅ Long-Form episode queued successfully: ${longformUrl}`);
    }
  } catch (lErr) {
    console.error('❌ Error generating long-form episode:', lErr.message);
  }

  // Save latest batch summary for GitHub Actions reporting
  const summaryPath = path.join(process.cwd(), 'latest_batch_summary.json');
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        batchDate: new Date().toISOString(),
        totalQueued: publishedVideos.length,
        videos: publishedVideos,
      },
      null,
      2
    )
  );

  console.log('\n====================================================');
  console.log('🎉 5:00 AM DAILY BATCH COMPLETE! ALL VIDEOS QUEUED & SCHEDULED');
  console.log('====================================================');
  console.table(publishedVideos);
  return publishedVideos;
}

if (process.argv[1] && process.argv[1].endsWith('runDailyBatch.js')) {
  runDailyBatch();
}

export { runDailyBatch };
