import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

export async function uploadLongformVideo(videoPath, title, customDescription, customTags, thumbnailPath = null, publishAt = null) {
  try {
    console.log(`Starting Long-Form Upload for: "${title}"`);
    if (publishAt) {
      console.log(`⏰ Scheduled Publish Time: ${publishAt}`);
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

    const description = customDescription || 
      `${title}\n\nBeluga helps Egg reach 10 Million subscribers at 3:14 AM... but an entity hijacks the stream from inside Beluga's house!\n\n🔔 Subscribe for full-length Discord mystery comedy episodes!\n\n#beluga #discord #horror #comedy #hecker #skittle #egg #3am`;

    const tags = customTags || ["beluga", "discord", "hecker", "skittle", "comedy", "funny", "memes", "animation", "3am", "horror", "egg"];

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
          privacyStatus: publishAt ? 'private' : (process.env.YOUTUBE_PRIVACY || 'public'),
          publishAt: publishAt || undefined,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(videoPath),
      },
    };

    const res = await youtube.videos.insert(requestParameters);
    const videoId = res.data.id;
    const videoUrl = `https://youtube.com/watch?v=${videoId}`;
    console.log(`\n🎉 Long-form video uploaded successfully!`);
    console.log(`📺 Video URL: ${videoUrl}`);

    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      try {
        console.log(`🖼️ Applying custom thumbnail: ${thumbnailPath}`);
        const ext = path.extname(thumbnailPath).toLowerCase();
        await youtube.thumbnails.set({
          videoId: videoId,
          media: {
            mimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
            body: fs.createReadStream(thumbnailPath),
          },
        });
        console.log(`✅ Thumbnail applied successfully!`);
      } catch (tErr) {
        console.warn(`⚠️ Thumbnail upload notice:`, tErr.response ? tErr.response.data : tErr.message);
      }
    }

    return videoUrl;
  } catch (error) {
    console.error("❌ Failed to upload long-form video:");
    console.error(error.response ? error.response.data : error.message);
    throw error;
  }
}
