import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function verifyCredentials() {
  console.log('====================================================');
  console.log('🔍 BELUGA CREDENTIALS & AUTOPILOT VERIFICATION');
  console.log('====================================================\n');

  let allPassed = true;

  // 1. Verify Gemini API Key
  console.log('1️⃣ Checking GEMINI_API_KEY...');
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Missing GEMINI_API_KEY in environment or .env');
    allPassed = false;
  } else {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const res = await model.generateContent('Say "OK" in one word.');
      const text = res.response.text().trim();
      console.log(`✅ GEMINI_API_KEY is active and responding (Model returned: "${text}")`);
    } catch (err) {
      console.error(`❌ GEMINI_API_KEY failed authentication:`, err.message);
      allPassed = false;
    }
  }

  console.log('\n----------------------------------------------------');

  // 2. Verify YouTube OAuth Credentials
  console.log('2️⃣ Checking YouTube OAuth Credentials...');
  const clientId = (process.env.YOUTUBE_CLIENT_ID || '').replace(/^["']|["']$/g, '').trim();
  const clientSecret = (process.env.YOUTUBE_CLIENT_SECRET || '').replace(/^["']|["']$/g, '').trim();
  const refreshToken = (process.env.YOUTUBE_REFRESH_TOKEN || '').replace(/^["']|["']$/g, '').trim();

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('⚠️ One or more YouTube OAuth credentials are missing:');
    if (!clientId) console.warn('   - YOUTUBE_CLIENT_ID missing');
    if (!clientSecret) console.warn('   - YOUTUBE_CLIENT_SECRET missing');
    if (!refreshToken) console.warn('   - YOUTUBE_REFRESH_TOKEN missing');
    allPassed = false;
  } else {
    try {
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground'
      );
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const tokenRes = await oauth2Client.getAccessToken();
      if (tokenRes && tokenRes.token) {
        console.log('✅ YouTube OAuth refresh token is ACTIVE & valid!');
        
        // Check YouTube channel access
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const channelRes = await youtube.channels.list({
          part: ['snippet'],
          mine: true,
        });
        const channelTitle = channelRes.data.items?.[0]?.snippet?.title || 'Unknown Channel';
        console.log(`📺 Connected YouTube Channel: "${channelTitle}"`);
      } else {
        throw new Error('No access token returned.');
      }
    } catch (err) {
      console.error('❌ YouTube OAuth validation failed:', err.message);
      if (err.message.includes('invalid_grant')) {
        console.error('   👉 Cause: The refresh token has expired or was revoked.');
        console.error('   👉 Fix: Re-generate the token via Google OAuth 2.0 Playground after publishing the app.');
      }
      allPassed = false;
    }
  }

  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL CREDENTIALS VERIFIED! Ready for 100% automated YouTube publishing.');
  } else {
    console.log('⚠️ Verification found issues. Please review the errors above.');
  }
  console.log('====================================================\n');

  return allPassed;
}

if (process.argv[1] && process.argv[1].endsWith('verifyCredentials.js')) {
  verifyCredentials().then((ok) => {
    process.exit(ok ? 0 : 1);
  });
}

export { verifyCredentials };
