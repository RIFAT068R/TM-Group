import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedDriveClient } from '@/lib/google-drive';

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return NextResponse.json({ error: 'No fileId provided' }, { status: 400 });
    }

    // Get authenticated Google Drive API client using personal OAuth credentials
    let drive;
    try {
      drive = await getAuthenticatedDriveClient();
    } catch (authError: any) {
      console.error('Google Drive Auth Failure:', authError);
      return NextResponse.json({
        error: authError.message || 'Google Drive is not connected or authorization has expired.'
      }, { status: 401 });
    }

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
