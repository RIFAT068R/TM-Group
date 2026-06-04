import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const resendKey = process.env.RESEND_API_KEY
    const resendFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

    if (!resendKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY is not defined in .env.local' }, { status: 500 })
    }

    const recipient = 'gdrifat2@gmail.com'

    // Dispatch the test email via Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: resendFrom,
        to: recipient,
        subject: 'TM Business Hub - Real Email Delivery Test',
        html: `
          <div style="font-family: sans-serif; padding: 2rem; background: #fafafa; border-radius: 12px; border: 1px solid #e4e4e7; max-width: 600px; margin: auto;">
            <h2 style="color: #09090b; margin-top: 0; font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">📬 Real Email Delivery Test Successful!</h2>
            <p style="color: #52525b; line-height: 1.6; font-size: 0.95rem;">This email confirms that your Resend system is fully functional and successfully connected to the TM Business Hub server.</p>
            <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 1rem; border-radius: 4px; margin: 1.5rem 0; font-size: 0.9rem;">
              <strong style="color: #1e3a8a;">Recipient:</strong> ${recipient}
            </div>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 1.5rem 0;" />
            <p style="font-size: 0.8rem; color: #a1a1aa;">Sent via Resend Integration on TM Business Hub.</p>
          </div>
        `
      })
    })

    const body = await res.json()
    if (res.ok) {
      return NextResponse.json({
        success: true,
        message: `Test email successfully dispatched to ${recipient}`,
        resend_email_id: body.id
      })
    } else {
      return NextResponse.json({
        success: false,
        error: body?.message || 'Resend API returned an error',
        details: body
      }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
