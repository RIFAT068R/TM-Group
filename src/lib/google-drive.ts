import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

export async function getAuthenticatedDriveClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials are not configured in environment variables.');
  }

  // Create a supabase client using the service role key to bypass RLS policies if necessary
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch the first oauth token row
  const { data: tokenRecord, error } = await supabase
    .from('google_drive_tokens')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching Google Drive tokens from database:', error);
    throw new Error(`Failed to query Google Drive connection status: ${error.message}`);
  }

  if (!tokenRecord) {
    throw new Error('Google Drive is not connected. Please connect it first in the settings.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not configured.');
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  const expiryDate = tokenRecord.expiry_date ? Number(tokenRecord.expiry_date) : 0;

  oauth2Client.setCredentials({
    access_token: tokenRecord.access_token,
    refresh_token: tokenRecord.refresh_token,
    expiry_date: expiryDate,
  });

  // Check if token is expired or close to expiration (less than 5 minutes left)
  if (expiryDate && (expiryDate - 300000) < Date.now()) {
    if (!tokenRecord.refresh_token) {
      throw new Error('Google Drive session expired and no refresh token is available. Please reconnect.');
    }

    try {
      console.log('Google Drive access token expired or expiring soon. Refreshing...');
      const { credentials } = await oauth2Client.refreshAccessToken();

      const updatedFields: any = {
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date,
        updated_at: new Date().toISOString(),
      };

      if (credentials.refresh_token) {
        updatedFields.refresh_token = credentials.refresh_token;
      }

      const { error: updateError } = await supabase
        .from('google_drive_tokens')
        .update(updatedFields)
        .eq('id', tokenRecord.id);

      if (updateError) {
        console.error('Failed to update refreshed Google Drive tokens in Supabase:', updateError);
      } else {
        console.log('Google Drive tokens refreshed and saved successfully.');
      }

      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || tokenRecord.refresh_token,
        expiry_date: credentials.expiry_date,
      });
    } catch (refreshError: any) {
      console.error('Error refreshing Google Drive access token:', refreshError);
      throw new Error(`Google Drive authorization expired or was revoked. Please reconnect. Details: ${refreshError.message}`);
    }
  }

  return google.drive({ version: 'v3', auth: oauth2Client });
}
