import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const CLIENT_ID = '984592460655-vr8a84u9tg2kk8ba856m6pkesc45ousf.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&prompt=consent&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.force-ssl&response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log('====================================================');
console.log('🤖 BELUGA 1-CLICK CHROME OAUTH AUTO-CAPTURE');
console.log('====================================================\n');

try {
  execSync(`osascript -e '
    tell application "Google Chrome"
      repeat with w in windows
        delete (tabs of w whose URL contains "oauthplayground")
      end repeat
    end tell
  ' 2>/dev/null || true`);
} catch {}

console.log('🌐 Opening authorization page in Google Chrome for Discord Shorts Bot...');

try {
  execSync(`open -a "Google Chrome" "${authUrl}"`);
} catch {
  execSync(`open "${authUrl}"`);
}

console.log('👉 In your Chrome browser, click "Live the Music" (or your desired channel) and click "Allow".');
console.log('⏳ Watching Chrome for authorization completion...\n');

function getChromeTabUrls() {
  try {
    const script = `
      tell application "Google Chrome"
        set urlList to {}
        repeat with w in windows
          repeat with t in tabs of w
            set end of urlList to (URL of t)
          end repeat
        end repeat
        return urlList
      end tell
    `;
    const res = execSync(`osascript -e '${script}'`, { encoding: 'utf8', timeout: 3000 });
    return res.split(', ').map((u) => u.trim());
  } catch {
    return [];
  }
}

async function watchAndCapture() {
  const startTime = Date.now();
  const maxWaitMs = 120000; // 2 minutes

  while (Date.now() - startTime < maxWaitMs) {
    const urls = getChromeTabUrls();
    for (const url of urls) {
      if (url.includes('developers.google.com/oauthplayground') && url.includes('code=')) {
        console.log('🎯 Found OAuth redirect in Chrome tab!');
        const parsed = new URL(url);
        const code = parsed.searchParams.get('code');
        if (code) {
          console.log('🔑 Captured authorization code:', code.slice(0, 15) + '...');
          await exchangeAndSave(code);
          return;
        }
      }
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.error('⌛ Timed out waiting for authorization in Chrome. Please try again.');
  process.exit(1);
}

async function exchangeAndSave(code) {
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  try {
    console.log('🔄 Exchanging code for permanent refresh token...');
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error('Google did not return a refresh token. Please re-run to consent again.');
    }

    console.log('✅ Permanent refresh token acquired!');

    // Update .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/^YOUTUBE_REFRESH_TOKEN=.*$/m, `YOUTUBE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated local .env file!');

    // Verify channel
    oauth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelRes = await youtube.channels.list({ part: ['snippet'], mine: true });
    const channelTitle = channelRes.data.items?.[0]?.snippet?.title || 'Unknown Channel';

    console.log('\n====================================================');
    console.log(`🎉 SUCCESS! AUTHENTICATED TO YOUTUBE CHANNEL: "${channelTitle}"`);
    console.log('====================================================\n');
    console.log('📋 Copy this value into GitHub Repository Secrets (YOUTUBE_REFRESH_TOKEN):');
    console.log(`\n${tokens.refresh_token}\n`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Failed during token exchange:', err.message);
    process.exit(1);
  }
}

watchAndCapture();
