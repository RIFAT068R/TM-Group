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
    const origin = url.origin;
    let redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;
    if (redirectUri.includes('localhost') && !origin.includes('localhost')) {
      redirectUri = `${origin}/api/auth/google/callback`;
    }

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        error: 'Google OAuth credentials not configured in environment variables.'
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

    // Connect to Supabase using service role key to store globally
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Retrieve existing tokens from the database to avoid losing refresh_token
    const { data: existingToken, error: selectError } = await supabase
      .from('google_drive_tokens')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error('Error selecting existing google_drive_tokens:', selectError);
    }

    const finalRefreshToken = tokens.refresh_token || existingToken?.refresh_token || null;
    const finalExpiryDate = tokens.expiry_date || null;

    if (existingToken) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('google_drive_tokens')
        .update({
          access_token: tokens.access_token,
          refresh_token: finalRefreshToken,
          expiry_date: finalExpiryDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id);

      if (updateError) {
        throw new Error(`Failed to update google_drive_tokens: ${updateError.message}`);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('google_drive_tokens')
        .insert({
          access_token: tokens.access_token,
          refresh_token: finalRefreshToken,
          expiry_date: finalExpiryDate,
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`Failed to insert google_drive_tokens: ${insertError.message}`);
      }
    }

    console.log('Google Drive tokens stored globally in database. Redirecting to workers page.');

    // Direct redirect back to TM workers directory
    return NextResponse.redirect(new URL('/tm/workers', req.url));

  } catch (error: any) {
    console.error('Google OAuth Callback Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
