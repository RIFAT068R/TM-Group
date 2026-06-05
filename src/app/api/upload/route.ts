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

    const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const saPrivateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

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
      newTokens: null,
    });

  } catch (error: any) {
    console.error('API Upload Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
