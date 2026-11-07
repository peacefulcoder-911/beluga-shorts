import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

async function exchangeCode(authCode) {
  if (!authCode) {
    console.error('❌ Please provide the authorization code: node scripts/exchangeAuthCode.js "<code>"');
    process.exit(1);
  }

  const cleanCode = authCode.trim().replace(/^["']|["']$/g, '');
  const clientId = (process.env.YOUTUBE_CLIENT_ID || '').replace(/^["']|["']$/g, '').trim();
  const clientSecret = (process.env.YOUTUBE_CLIENT_SECRET || '').replace(/^["']|["']$/g, '').trim();

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  try {
    console.log('🔄 Exchanging authorization code for tokens...');
    const { tokens } = await oauth2Client.getToken(cleanCode);

    if (!tokens.refresh_token) {
      throw new Error('Google did not return a refresh_token. Make sure you select "prompt=consent" or revoke previous permissions.');
    }

    console.log('✅ Received new refresh_token!');

    // Update .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('YOUTUBE_REFRESH_TOKEN=')) {
      envContent = envContent.replace(/^YOUTUBE_REFRESH_TOKEN=.*$/m, `YOUTUBE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    } else {
      envContent += `\nYOUTUBE_REFRESH_TOKEN="${tokens.refresh_token}"\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated .env file with new refresh token!');

    // Test channel name
    oauth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelRes = await youtube.channels.list({ part: ['snippet'], mine: true });
    const channelTitle = channelRes.data.items?.[0]?.snippet?.title || 'Unknown Channel';

    console.log('\n====================================================');
    console.log(`🎉 SUCCESS! Connected to YouTube Channel: "${channelTitle}"`);
    console.log('====================================================\n');
    console.log('👉 Now update your GitHub Repository Secret (YOUTUBE_REFRESH_TOKEN) with this value:');
    console.log(tokens.refresh_token);
    console.log('\n');

    return tokens.refresh_token;
  } catch (err) {
    console.error('❌ Failed to exchange code:', err.message);
    process.exit(1);
  }
}

const codeArg = process.argv[2];
if (codeArg) {
  exchangeCode(codeArg);
}

export { exchangeCode };

