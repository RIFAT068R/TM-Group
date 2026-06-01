import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'Google OAuth credentials not configured in .env.local'
      }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      return NextResponse.json({ error: 'Failed to retrieve access token' }, { status: 400 });
    }

    // Build the token object we will store in localStorage
    const savedTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token, // might be undefined if prompt=consent is missing (but we enforce it!)
      expiryDate: tokens.expiry_date,
    };

    // Return HTML page that writes to localStorage and redirects back to /tm/workers
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Drive Authorized</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              background-color: #0B0A0E;
              color: #F8FAFC;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 16px;
              padding: 2.5rem;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(10px);
              max-width: 400px;
            }
            h1 {
              color: #06B6D4;
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
            }
            p {
              color: #94A3B8;
              font-size: 0.9rem;
              margin-bottom: 1.5rem;
            }
            .spinner {
              border: 3px solid rgba(6, 182, 212, 0.1);
              border-top: 3px solid #06B6D4;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <script>
            try {
              const tokens = ${JSON.stringify(savedTokens)};
              
              // Only overwrite the refresh token if one was returned. 
              // Google sometimes only returns the refresh token on the first consent flow.
              if (!tokens.refreshToken) {
                const existing = localStorage.getItem('google_drive_tokens');
                if (existing) {
                  const existingParsed = JSON.parse(existing);
                  if (existingParsed.refreshToken) {
                    tokens.refreshToken = existingParsed.refreshToken;
                  }
                }
              }
              
              localStorage.setItem('google_drive_tokens', JSON.stringify(tokens));
              
              setTimeout(() => {
                window.location.href = '/tm/workers';
              }, 1000);
            } catch (err) {
              console.error('Failed to store tokens:', err);
              document.body.innerHTML = '<h1>Authorization Failed</h1><p>Could not store tokens in your browser.</p>';
            }
          </script>
        </head>
        <body>
          <div class="card">
            <h1>Authorization Successful!</h1>
            <p>Your personal Google Drive has been connected. Redirecting you back to TM Overseas...</p>
            <div class="spinner"></div>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    console.error('Google OAuth Callback Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
