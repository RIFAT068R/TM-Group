import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const workerId = formData.get('workerId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Retrieve OAuth tokens from request headers
    const accessToken = req.headers.get('x-access-token');
    const refreshToken = req.headers.get('x-refresh-token');
    const expiryDateHeader = req.headers.get('x-expiry-date');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
    const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    // Check if user is connected via OAuth 2.0
    if (!accessToken) {
      return NextResponse.json({
        error: 'Google Drive is not connected. Please click the "Connect Google Drive" button at the top of the Documents panel.'
      }, { status: 401 });
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'OAuth Client ID or Client Secret is missing in .env.local. Please follow the instructions in the Implementation Plan.'
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
        console.log('Access token expired or expiring soon, refreshing...');
        const refreshResponse = await oauth2Client.refreshAccessToken();
        const credentials = refreshResponse.credentials;
        
        oauth2Client.setCredentials(credentials);
        refreshedTokensPayload = {
          accessToken: credentials.access_token,
          refreshToken: credentials.refresh_token || refreshToken,
          expiryDate: credentials.expiry_date,
        };
      } catch (refreshErr: any) {
        console.error('Failed to refresh Google Drive access token:', refreshErr);
        return NextResponse.json({
          error: 'Your Google Drive session has expired. Please disconnect and reconnect Google Drive.'
        }, { status: 401 });
      }
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Read file bytes into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a Readable stream for Google Drive API
    const { Readable } = require('stream');
    const mediaStream = new Readable();
    mediaStream.push(buffer);
    mediaStream.push(null);

    // Upload to target folder, or fallback to root if the folder doesn't exist or isn't accessible
    let parentFolderIds: string[] | undefined = undefined;
    if (folderId && folderId.trim() !== '') {
      parentFolderIds = [folderId.trim()];
    }

    const fileMetadata = {
      name: file.name,
      parents: parentFolderIds,
    };

    const media = {
      mimeType: file.type,
      body: mediaStream,
    };

    let uploadedFile: any = null;

    try {
      // Try uploading to specified folder
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size',
        supportsAllDrives: true,
      });
      uploadedFile = response.data;
    } catch (uploadError: any) {
      // If folder isn't found or accessible, fallback to root folder of user's personal drive
      if (parentFolderIds) {
        console.warn(`Target folder ${folderId} is not accessible. Retrying upload to root folder...`);
        const retryMediaStream = new Readable();
        retryMediaStream.push(buffer);
        retryMediaStream.push(null);

        const retryResponse = await drive.files.create({
          requestBody: {
            name: file.name,
            parents: undefined, // default to root
          },
          media: {
            mimeType: file.type,
            body: retryMediaStream,
          },
          fields: 'id, name, webViewLink, webContentLink, size',
          supportsAllDrives: true,
        });
        uploadedFile = retryResponse.data;
      } else {
        throw uploadError;
      }
    }

    // Set anyone reader permissions so the iframe embed can display it
    try {
      await drive.permissions.create({
        fileId: uploadedFile.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: true,
      });
    } catch (permError: any) {
      console.warn('Failed to set public view permissions on uploaded file:', permError);
    }

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.id,
      name: uploadedFile.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      date: new Date().toISOString().split('T')[0],
      url: uploadedFile.webViewLink,
      downloadUrl: uploadedFile.webContentLink,
      newTokens: refreshedTokensPayload,
    });

  } catch (error: any) {
    console.error('API Upload Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
