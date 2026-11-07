import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

export async function uploadVideo(videoPath, title, thumbnailPath = null, publishAt = null) {
  try {
    console.log(`Starting upload for: ${title}`);
    if (publishAt) {
      console.log(`⏰ Scheduled Publish Time: ${publishAt}`);
    }

    const clientId = (process.env.YOUTUBE_CLIENT_ID || '').replace(/^["']|["']$/g, '').trim();
    const clientSecret = (process.env.YOUTUBE_CLIENT_SECRET || '').replace(/^["']|["']$/g, '').trim();
    const refreshToken = (process.env.YOUTUBE_REFRESH_TOKEN || '').replace(/^["']|["']$/g, '').trim();

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
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
    console.log(`
✅ Video uploaded successfully!`);
    console.log(`Video URL: ${videoUrl}`);

    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      try {
        console.log(`🖼️ Applying custom Shorts thumbnail: ${thumbnailPath}`);
        const ext = path.extname(thumbnailPath).toLowerCase();
        await youtube.thumbnails.set({
          videoId: videoId,
          media: {
            mimeType: ext === '.png' ? 'image/png' : 'image/jpeg',
            body: fs.createReadStream(thumbnailPath),
          },
        });
        console.log(`✅ Shorts thumbnail applied successfully!`);
      } catch (tErr) {
        console.warn(`⚠️ Shorts thumbnail upload notice:`, tErr.response ? tErr.response.data : tErr.message);
      }
    }

    // Automatically post creator pinned comment for engagement
    try {
      const pinCommentText = "📌 PINNED BY BELUGA:\nDid Beluga actually deserve this? 💀👇\nDrop your thoughts and subscribe for more daily discord madness!";
      console.log(`💬 Posting creator pinned comment on video ${videoId}...`);
      await youtube.commentThreads.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: pinCommentText
              }
            }
          }
        }
      });
      console.log(`✅ Creator pinned comment posted successfully!`);
    } catch (cErr) {
      console.warn(`⚠️ Pinned comment notice (optional scope):`, cErr.response ? cErr.response.data : cErr.message);
    }

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
  const thumbFile = process.argv[4] || null;
  uploadVideo(videoFile, videoTitle, thumbFile);
}
