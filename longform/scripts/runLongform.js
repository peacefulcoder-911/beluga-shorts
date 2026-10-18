import { generateLongformScript } from './generateLongformScript.js';
import { uploadLongformVideo } from './uploadLongform.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function runLongform() {
  console.log('====================================');
  console.log('🎬 BELUGA LONG-FORM VIDEO PIPELINE');
  console.log('====================================\n');

  try {
    // 1. Generate Multi-Scene Story
    console.log('📝 [Step 1/3] Generating 3-Act episodic story with Gemini AI...');
    const data = await generateLongformScript();
    if (!data || !data.title) {
      throw new Error('Failed to generate script from AI');
    }
    console.log(`✅ Episode Generated: "${data.title}"\n`);

    // 2. Render 1920x1080 Video
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const timestamp = Date.now();
    const videoFileName = `longform_${timestamp}.mp4`;
    const outputPath = path.join(outDir, videoFileName);

    console.log(`🎬 [Step 2/3] Rendering 1920x1080 Landscape video with Remotion to ${videoFileName}...`);
    execSync(`npx remotion render src/index.ts LongformDiscord "${outputPath}"`, {
      stdio: 'inherit'
    });
    console.log(`✅ Long-form video rendered successfully!\n`);

    // 3. Upload to YouTube
    console.log(`📤 [Step 3/3] Uploading long-form video to YouTube...`);
    const videoUrl = await uploadLongformVideo(outputPath, data.title, data.description, data.tags);

    // Save video URL to longform history
    const historyPath = path.join(process.cwd(), 'longform', 'data', 'history_longform.json');
    if (fs.existsSync(historyPath)) {
      try {
        const hist = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        if (hist.length > 0) {
          hist[hist.length - 1].videoUrl = videoUrl;
          hist[hist.length - 1].videoFile = videoFileName;
          fs.writeFileSync(historyPath, JSON.stringify(hist, null, 2));
        }
      } catch (e) {}
    }

    console.log('\n====================================');
    console.log('🎉 LONG-FORM EPISODE PRODUCTION COMPLETE!');
    console.log(`📺 Video URL: ${videoUrl}`);
    console.log('====================================\n');
  } catch (error) {
    console.error('\n❌ Long-form pipeline failed with error:', error);
    process.exit(1);
  }
}

runLongform();
