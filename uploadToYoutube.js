import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

export async function uploadVideo(videoPath, title) {
  try {
    console.log(`Starting upload for: ${title}`);

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
    
    // YouTube expects specific metadata
    const requestParameters = {
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title,
          description: "Crazy Discord stories, bad decisions, and Hecker saving the day 😼💀 #shorts #discord #meme #beluga",
          tags: ["shorts", "discord", "meme", "beluga", "funny", "cat"],
          categoryId: '24' // 24 is Entertainment
        },
        status: {
          privacyStatus: process.env.YOUTUBE_PRIVACY || 'public',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    };

    const res = await youtube.videos.insert(requestParameters);
    const videoUrl = `https://youtube.com/watch?v=${res.data.id}`;
    console.log(`\n✅ Video uploaded successfully!`);
    console.log(`Video URL: ${videoUrl}`);
    return videoUrl;
  } catch (error) {
    console.error("❌ Failed to upload video:");
    console.error(error.response ? error.response.data : error.message);
    throw error;
  }
}

if (process.argv[1] && process.argv[1].endsWith("uploadToYoutube.js")) {
  const videoFile = process.argv[2] || "out/beluga_exposed_dance_magic.mp4";
  const videoTitle = process.argv[3] || "When Beluga's secret hobby was exposed... 💀 #shorts";
  uploadVideo(videoFile, videoTitle);
}
