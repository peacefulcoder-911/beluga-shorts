import { generateScript } from './generateScript.js';
import { uploadVideo } from './uploadToYoutube.js';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

async function runDaily() {
  console.log('====================================');
  console.log('🤖 BELUGA SHORTS 24/7 AUTOMATION');
  console.log('====================================\n');

  try {
    // 1. Generate Story
    console.log('📝 [Step 1/3] Generating viral Beluga script with Gemini AI...');
    const data = await generateScript();
    if (!data || !data.title) {
      throw new Error('Failed to generate script from AI');
    }
    console.log(`✅ Story Generated: "${data.title}"\n`);

    // 2. Render Video
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const timestamp = Date.now();
    const videoFileName = `beluga_${timestamp}.mp4`;
    const outputPath = path.join(outDir, videoFileName);

    console.log(`🎬 [Step 2/3] Rendering video with Remotion to ${videoFileName}...`);
    execSync(`npx remotion render src/index.ts DiscordChat "${outputPath}"`, {
      stdio: 'inherit'
    });
    console.log(`✅ Video rendered successfully!\n`);

    // 3. Upload to YouTube
    console.log(`📤 [Step 3/3] Uploading video to YouTube...`);
    const videoTitle = `${data.title} #shorts`;
    const videoUrl = await uploadVideo(outputPath, videoTitle);

    console.log('\n====================================');
    console.log('🎉 24/7 DAILY SHORT UPLOAD COMPLETE!');
    console.log(`📺 Video URL: ${videoUrl}`);
    console.log('====================================\n');
  } catch (error) {
    console.error('\n❌ Pipeline failed with error:', error);
    process.exit(1);
  }
}

runDaily();
