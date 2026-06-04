import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 })
    }

    const results: any = {
      database_notification: null,
      email_resend: null
    }

    // 1. Insert test row in Supabase notifications table
    try {
      const { error: dbErr } = await supabase.from('notifications').insert({
        user_id: user.id,
        title: '🔔 System Test Alert',
        message: 'Your notification system database integration is working perfectly!',
        type: 'success',
        module: 'shared',
        is_read: false
      })

      if (dbErr) {
        results.database_notification = { status: 'error', error: dbErr.message }
      } else {
        results.database_notification = { status: 'success', message: 'Test notification row inserted successfully' }
      }
    } catch (e: any) {
      results.database_notification = { status: 'error', error: e.message }
    }

    // 2. Send test email using Resend API via HTTP fetch
    try {
      const resendKey = process.env.RESEND_API_KEY
      const resendFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

      if (!resendKey) {
        results.email_resend = { status: 'error', error: 'RESEND_API_KEY is not defined in .env.local' }
      } else {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: resendFrom,
            to: user.email,
            subject: 'TM Business Hub - Notification System Test',
            html: `
              <div style="font-family: sans-serif; padding: 2rem; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; max-width: 600px; margin: auto;">
                <h2 style="color: #111827; margin-top: 0; font-size: 1.5rem; font-weight: 700;">System Test Successful!</h2>
                <p style="color: #4b5563; line-height: 1.6; font-size: 0.95rem;">Your Resend email integration is working perfectly with the key provided in your configuration.</p>
                <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 1rem; border-radius: 4px; margin: 1.5rem 0;">
                  <strong style="color: #1e3a8a;">Note:</strong> If you are using a Resend free/sandbox key, you can only receive emails sent to the address that registered the Resend account.
                </div>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
                <p style="font-size: 0.8rem; color: #9ca3af;">This is a automated system test email from TM Business Hub.</p>
              </div>
            `
          })
        })

        const body = await res.json()
        if (res.ok) {
          results.email_resend = { status: 'success', message: 'Test email request accepted by Resend', emailId: body.id }
        } else {
          results.email_resend = { status: 'error', error: body?.message || 'Failed to dispatch email' }
        }
      }
    } catch (e: any) {
      results.email_resend = { status: 'error', error: e.message }
    }

    return NextResponse.json({ success: true, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
