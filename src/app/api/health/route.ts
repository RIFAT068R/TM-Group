import { NextResponse } from 'next/server'

export async function GET() {
  const results: Record<string, { status: string; detail: string }> = {}

  // ── 1. Supabase ──────────────────────────────────────────────
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await supabase.from('_pgsodium_masks').select('*').limit(1)
    // Any response (even 404 table) means connection is alive
    results.supabase = error?.code === 'PGRST116' || !error
      ? { status: 'connected', detail: 'Supabase project reachable' }
      : { status: 'connected', detail: 'Supabase reachable — ' + error.message }
  } catch (e: unknown) {
    results.supabase = { status: 'error', detail: String(e) }
  }

  // ── 2. Gemini AI ─────────────────────────────────────────────
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      { method: 'GET' }
    )
    if (res.ok) {
      results.gemini = { status: 'connected', detail: 'Gemini API key valid' }
    } else {
      const body = await res.json()
      results.gemini = { status: 'error', detail: body?.error?.message || 'Invalid key' }
    }
  } catch (e: unknown) {
    results.gemini = { status: 'error', detail: String(e) }
  }

  // ── 3. Google Drive (Service Account) ───────────────────────
  try {
    // Build a JWT to get an access token
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!
    const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n')
    const folderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!

    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
    const now = Math.floor(Date.now() / 1000)
    const payload = Buffer.from(JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })).toString('base64url')

    // Import key for signing
    const pemBody = rawKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '')
    const binaryKey = Buffer.from(pemBody, 'base64')
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8', binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false, ['sign']
    )
    const signInput = new TextEncoder().encode(`${header}.${payload}`)
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, signInput)
    const jwt = `${header}.${payload}.${Buffer.from(sig).toString('base64url')}`

    // Exchange JWT for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
    })
    const tokenData = await tokenRes.json()

    if (tokenData.access_token) {
      // Try to get the root folder metadata
      const driveRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name`,
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
      )
      const driveData = await driveRes.json()
      if (driveRes.ok) {
        results.google_drive = { status: 'connected', detail: `Folder: "${driveData.name}" (${driveData.id})` }
      } else {
        results.google_drive = { status: 'error', detail: driveData?.error?.message || 'Folder not accessible' }
      }
    } else {
      results.google_drive = { status: 'error', detail: tokenData?.error_description || 'Token exchange failed' }
    }
  } catch (e: unknown) {
    results.google_drive = { status: 'error', detail: String(e) }
  }

  // ── 4. Resend Email ──────────────────────────────────────────
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    })
    if (res.ok) {
      results.resend = { status: 'connected', detail: 'Resend API key valid' }
    } else {
      const body = await res.json()
      results.resend = { status: 'error', detail: body?.message || 'Invalid key' }
    }
  } catch (e: unknown) {
    results.resend = { status: 'error', detail: String(e) }
  }

  const allOk = Object.values(results).every(r => r.status === 'connected')
  return NextResponse.json({ overall: allOk ? 'all_connected' : 'some_errors', services: results })
}
