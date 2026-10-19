import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

export async function uploadSpecificEpisode({
  videoPath,
  thumbnailPath,
  title,
  description,
  tags,
  privacyStatus = 'public',
  publishAt = null,
}) {
  try {
    console.log('====================================');
    console.log(`📤 UPLOADING TO YOUTUBE: "${title}"`);
    console.log('====================================');

    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found at: ${videoPath}`);
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
    });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    const statusConfig = {
      selfDeclaredMadeForKids: false,
    };

    if (publishAt) {
      statusConfig.privacyStatus = 'private';
      statusConfig.publishAt = publishAt;
      console.log(`🕒 Scheduled Publish Time: ${publishAt}`);
    } else {
      statusConfig.privacyStatus = privacyStatus;
      console.log(`👁️ Privacy Status: ${statusConfig.privacyStatus}`);
    }

    const requestParameters = {
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title,
          description: description,
          tags: tags,
          categoryId: '24', // Entertainment
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en',
        },
        status: statusConfig,
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    };

    console.log('⏳ Uploading video file to YouTube...');
    const res = await youtube.videos.insert(requestParameters);
    const videoId = res.data.id;
    const videoUrl = `https://youtube.com/watch?v=${videoId}`;
    console.log(`\n🎉 Video uploaded successfully! Video ID: ${videoId}`);
    console.log(`📺 Video URL: ${videoUrl}`);

    // Attach custom thumbnail if provided
    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      console.log(`\n🖼️ Uploading custom thumbnail: ${thumbnailPath}...`);
      try {
        const ext = path.extname(thumbnailPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
        await youtube.thumbnails.set({
          videoId: videoId,
          media: {
            mimeType: mimeType,
            body: fs.createReadStream(thumbnailPath),
          },
        });
        console.log(`✅ Custom thumbnail applied successfully!`);
      } catch (thumbErr) {
        console.warn(`⚠️ Warning: Custom thumbnail could not be set automatically:`, thumbErr.response ? thumbErr.response.data : thumbErr.message);
        console.log(`ℹ️ You can set it manually or verify channel custom thumbnail verification.`);
      }
    }

    // Save to longform history
    const historyPath = path.join(process.cwd(), 'longform', 'data', 'history_longform.json');
    try {
      let history = [];
      if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      }
      history.push({
        date: new Date().toISOString(),
        title: title,
        videoId: videoId,
        videoUrl: videoUrl,
        thumbnail: thumbnailPath,
        publishAt: publishAt,
        privacy: statusConfig.privacyStatus,
      });
      fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
      console.log(`📝 Recorded episode to longform/data/history_longform.json`);
    } catch (e) {
      console.warn('Could not record to history_longform.json:', e.message);
    }

    return { videoId, videoUrl };
  } catch (err) {
    console.error('❌ Failed to upload episode to YouTube:');
    console.error(err.response ? err.response.data : err.message);
    throw err;
  }
}
