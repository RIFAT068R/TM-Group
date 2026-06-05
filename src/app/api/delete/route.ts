import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: 'No fileId provided' }, { status: 400 });
    }

    const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const saPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    if (!saEmail || !saPrivateKey) {
      return NextResponse.json({
        error: 'Google Service Account credentials are not configured in .env.local.'
      }, { status: 500 });
    }

    const rawKey = saPrivateKey.replace(/\\n/g, '\n');

    const jwtClient = new google.auth.JWT({
      email: saEmail,
      key: rawKey,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    await jwtClient.authorize();
    const drive = google.drive({ version: 'v3', auth: jwtClient });

    // Delete file from Google Drive
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully from Google Drive',
      newTokens: null,
    });

  } catch (error: any) {
    console.error('API Delete Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
