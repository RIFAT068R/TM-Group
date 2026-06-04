import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: 'No fileId provided' }, { status: 400 });
    }

    // Retrieve OAuth tokens from request headers
    const accessToken = req.headers.get('x-access-token');
    const refreshToken = req.headers.get('x-refresh-token');
    const expiryDateHeader = req.headers.get('x-expiry-date');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const origin = new URL(req.url).origin;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;

    // Check if user is connected via OAuth 2.0
    if (!accessToken) {
      return NextResponse.json({
        error: 'Google Drive is not connected. Connect Google Drive first.'
      }, { status: 401 });
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'OAuth Client ID or Client Secret is missing in .env.local.'
      }, { status: 500 });
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    const parsedExpiryDate = expiryDateHeader ? parseInt(expiryDateHeader, 10) : undefined;

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken || undefined,
      expiry_date: parsedExpiryDate,
    });

    let refreshedTokensPayload: any = null;

    // Check if token has expired or is close to expiring (within 1 minute)
    if (refreshToken && parsedExpiryDate && parsedExpiryDate < Date.now() + 60000) {
      try {
        console.log('Access token expired or expiring soon during deletion, refreshing...');
        const refreshResponse = await oauth2Client.refreshAccessToken();
        const credentials = refreshResponse.credentials;
        
        oauth2Client.setCredentials(credentials);
        refreshedTokensPayload = {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || refreshToken,
          expiryDate: credentials.expiry_date,
        };
      } catch (refreshErr: any) {
        console.error('Failed to refresh Google Drive access token during deletion:', refreshErr);
        return NextResponse.json({
          error: 'Your Google Drive session has expired. Please disconnect and reconnect Google Drive.'
        }, { status: 401 });
      }
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Delete file from Google Drive
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully from Google Drive',
      newTokens: refreshedTokensPayload,
    });

  } catch (error: any) {
    console.error('API Delete Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
