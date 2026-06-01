import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt, history, module, dataContext } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not configured in environment.' }, { status: 500 })
    }

    // Construct system instructions based on module
    let systemInstruction = ''
    if (module === 'tm') {
      systemInstruction = `You are "TM Overseas AI Assistant", a smart manpower placement and visa analyst for TM Overseas.
You have access to the business's current worker data below:
${JSON.stringify(dataContext)}

Your task is to answer user queries with high accuracy using this data.
Guidelines:
1. Always calculate counts, stats, country breakdowns, and expiries directly from this data.
2. If the user asks about expiring passports or visas, identify them from the data. E.g. Md. Hasan Ali's passport expires on 2025-12-05.
3. Be professional and brief. Use markdown styling, bold key terms, and utilize bullet points with emojis.
4. Keep answers friendly. If the user greets you, say "Salam! How can I help you manage TM Overseas placements today?"`;
    } else {
      systemInstruction = `You are "Titas Enterprise AI Assistant", a smart chemical business operations and sales analyst for Titas Enterprise.
You have access to the business's current sales and chemical records below:
${JSON.stringify(dataContext)}

Your task is to answer user queries with high accuracy using this data.
Guidelines:
1. Base all calculations (revenue, profit, profit margin, quantity sold) directly on the provided data context.
2. If the user asks about restocking, identify low quantities or critical items from the data.
3. If they ask for sales stats, summarize them (e.g. top customers like ACI Limited, Square Pharmaceuticals).
4. Be professional and use clear markdown formatting with emojis. If the user greets you, say "Hello! How can I help you manage Titas Enterprise sales today?"`;
    }

    // Construct request contents array including history
    const contents: any[] = []

    // Convert history messages into Gemini contents format (roles: 'user', 'model')
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        // Skip default initial AI greeting to prevent model confusion
        if (msg.time === 'now' || msg.text.includes("Salam!") || msg.text.includes("Hello! I'm your")) {
          return
        }
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })
      })
    }

    // Add user's latest prompt prefixed with system instructions
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }]
    })

    // Fetch response from Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    )

    if (!response.ok) {
      const errBody = await response.json()
      return NextResponse.json({ error: errBody?.error?.message || 'Gemini API call failed' }, { status: response.status })
    }

    const resData = await response.json()
    const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
    
    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
  }
}
