import fs from 'fs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

export async function uploadLongformVideo(videoPath, title, customDescription, customTags) {
  try {
    console.log(`Starting Long-Form Upload for: "${title}"`);

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

    const description = customDescription || 
      `${title}\n\nBeluga, Hecker, and Skittle get caught in an escalating Discord crisis!\nSubscribe for full-length Discord comedy adventures.\n\n#beluga #discord #comedy #hecker #animation`;

    const tags = customTags || ["beluga", "discord", "hecker", "skittle", "comedy", "funny", "memes", "animation"];

    const requestParameters = {
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title,
          description: description,
          tags: tags,
          categoryId: '24' // Entertainment
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
    console.log(`\n🎉 Long-form video uploaded successfully!`);
    console.log(`📺 Video URL: ${videoUrl}`);
    return videoUrl;
  } catch (error) {
    console.error("❌ Failed to upload long-form video:");
    console.error(error.response ? error.response.data : error.message);
    throw error;
  }
}
