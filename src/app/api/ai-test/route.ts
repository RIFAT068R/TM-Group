import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.GEMINI_API_KEY

  if (!key) {
    return NextResponse.json({
      status: 'ERROR',
      problem: 'GEMINI_API_KEY is NOT set in environment',
      hint: 'Add it to Vercel → Settings → Environment Variables, then REDEPLOY'
    })
  }

  // Test actual Gemini connection
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Reply with only: CONNECTED' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({
        status: 'ERROR',
        httpStatus: res.status,
        keyPresent: true,
        keyPrefix: key.slice(0, 8) + '...',
        geminiError: data?.error?.message || JSON.stringify(data),
        hint: res.status === 400 ? 'Key format may be wrong or malformed' : res.status === 403 ? 'Key is invalid or quota exceeded' : 'Unknown API error'
      })
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '(no text)'
    return NextResponse.json({
      status: 'OK',
      geminiReply: reply,
      keyPrefix: key.slice(0, 8) + '...',
      message: 'Gemini API is working correctly'
    })
  } catch (e: any) {
    return NextResponse.json({
      status: 'ERROR',
      problem: 'Network or runtime error',
      error: e.message,
      keyPresent: true
    })
  }
}
