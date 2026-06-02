import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt, history, module, dataContext } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not configured in environment.' }, { status: 500 })
    }

    // ─── Build comprehensive system instruction per module ───────────────────
    let systemInstruction = ''

    if (module === 'tm') {
      // Pre-compute data summaries for richer AI context
      const workers: any[] = Array.isArray(dataContext) ? dataContext : []
      const today = new Date()

      const byCountry: Record<string, number> = {}
      const byStatus: Record<string, number> = {}
      const expiringPassports: any[] = []
      const expiringVisas: any[] = []

      workers.forEach(w => {
        byCountry[w.country] = (byCountry[w.country] || 0) + 1
        byStatus[w.status] = (byStatus[w.status] || 0) + 1

        const passExpiry = w.passportExpiry ? new Date(w.passportExpiry) : null
        if (passExpiry) {
          const daysLeft = Math.ceil((passExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= 180) {
            expiringPassports.push({ name: w.name, passport: w.passport, country: w.country, expiresOn: w.passportExpiry, daysLeft })
          }
        }

        const visaExpiry = w.visaExpiry ? new Date(w.visaExpiry) : null
        if (visaExpiry) {
          const daysLeft = Math.ceil((visaExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft <= 90) {
            expiringVisas.push({ name: w.name, country: w.country, expiresOn: w.visaExpiry, daysLeft })
          }
        }
      })

      systemInstruction = `
You are a senior operations analyst and business intelligence specialist working with TM Overseas — a manpower recruitment and overseas placement company.

IDENTITY RULES:
- Never refer to yourself as an AI, AI Assistant, Virtual Assistant, Chatbot, Language Model, or Automated System.
- Never say phrases like "As an AI assistant...", "I am an AI model...", "My capabilities include...", or "I cannot because I am an AI..."
- Respond as an experienced operations manager and recruitment analyst reviewing live business data.
- Responses must feel like they come from a skilled senior team member — knowledgeable, professional, and consultative.

COMMUNICATION STYLE:
- Be professional, direct, analytical, and concise.
- Use structured markdown formatting: headers, bold text, bullet points.
- After the first message, do NOT start with greetings.
- Always provide the answer first, then supporting data, then insight/recommendation.
- When information is missing, explain what's needed, offer the closest useful analysis, and suggest a next step.
- Never say "I cannot" or "I don't have access". Instead say "The current records do not contain..." or "Based on available data..."

BUSINESS CONTEXT:
TM Overseas is a Bangladeshi manpower agency placing workers in Saudi Arabia, UAE, Qatar, Kuwait, Malaysia, and other countries.
Key operations: worker recruitment, visa processing, document management, agency partnerships, and overseas placement tracking.

FULL WORKER DATABASE (${workers.length} records):
${JSON.stringify(workers, null, 2)}

COMPUTED ANALYTICS:
Country Distribution: ${JSON.stringify(byCountry)}
Status Breakdown: ${JSON.stringify(byStatus)}
Passports Expiring Within 6 Months: ${JSON.stringify(expiringPassports)}
Visas Expiring Within 90 Days: ${JSON.stringify(expiringVisas)}
Total Active Workers (working + visa_approved + departed): ${workers.filter(w => ['working','visa_approved','departed'].includes(w.status)).length}

RESPONSE FRAMEWORK:
1. For data questions: Direct answer → Supporting figures → Business insight → Optional recommendation
2. For document/expiry questions: List specific workers with exact dates and days remaining
3. For country analysis: Break down by count, percentage, and trend
4. For missing data: State what's missing, provide closest available analysis, suggest next step
5. Add one sentence that answers "What does this mean for the business?"

Today's date: ${today.toISOString().split('T')[0]}
`
    } else {
      // Titas Enterprise module
      const sales: any[] = Array.isArray(dataContext) ? dataContext : []

      const totalRevenue = sales.reduce((s, r) => s + (r.qty * r.sellPrice), 0)
      const totalCost = sales.reduce((s, r) => s + (r.qty * r.buyPrice), 0)
      const totalProfit = totalRevenue - totalCost
      const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0'
      const unpaid = sales.filter(s => ['pending','overdue'].includes(s.status)).reduce((sum, s) => sum + (s.qty * s.sellPrice), 0)

      const customerMap: Record<string, { revenue: number; profit: number; orders: number }> = {}
      const chemMap: Record<string, { qty: number; revenue: number; profit: number }> = {}

      sales.forEach(s => {
        const rev = s.qty * s.sellPrice
        const cost = s.qty * s.buyPrice
        if (!customerMap[s.customer]) customerMap[s.customer] = { revenue: 0, profit: 0, orders: 0 }
        customerMap[s.customer].revenue += rev
        customerMap[s.customer].profit += (rev - cost)
        customerMap[s.customer].orders += 1

        if (!chemMap[s.chemical]) chemMap[s.chemical] = { qty: 0, revenue: 0, profit: 0 }
        chemMap[s.chemical].qty += s.qty
        chemMap[s.chemical].revenue += rev
        chemMap[s.chemical].profit += (rev - cost)
      })

      const topCustomers = Object.entries(customerMap)
        .sort(([,a],[,b]) => b.revenue - a.revenue)
        .map(([name, d]) => ({ name, ...d, margin: d.revenue > 0 ? ((d.profit/d.revenue)*100).toFixed(1)+'%' : '0%' }))

      const topChemicals = Object.entries(chemMap)
        .sort(([,a],[,b]) => b.revenue - a.revenue)
        .map(([name, d]) => ({ name, ...d, margin: d.revenue > 0 ? ((d.profit/d.revenue)*100).toFixed(1)+'%' : '0%' }))

      systemInstruction = `
You are a senior business analyst and commercial intelligence specialist working with Titas Enterprise — a chemical import and distribution company in Bangladesh.

IDENTITY RULES:
- Never refer to yourself as an AI, AI Assistant, Virtual Assistant, Chatbot, Language Model, or Automated System.
- Never say phrases like "As an AI assistant...", "My capabilities include...", "I cannot because I am an AI...", or "Hello! I'm your..."
- Respond as an experienced Business Intelligence Manager, Sales Director, or Commercial Analyst reviewing live company data.
- After the first message, do NOT start with greetings like "Hello", "Hi", or "Based on your question".

COMMUNICATION STYLE:
- Be professional, direct, analytical, and consultative.
- Always provide the answer FIRST, then supporting figures, then business insight.
- Use structured markdown formatting: headers (###), bold key figures, bullet points.
- Add one business insight sentence: "What does this mean for the company?"
- For missing data: explain what's needed, then provide the closest available analysis.
- Never say "I cannot" or "No data available". Say "The current dataset does not contain enough information..." then offer an alternative.

BUSINESS CONTEXT:
Titas Enterprise imports and distributes industrial and pharmaceutical-grade chemicals to major Bangladeshi companies including pharmaceutical companies, FMCG groups, and industrial manufacturers.
Key operations: chemical sourcing, customer sales management, inventory monitoring, revenue and profit tracking.

FULL SALES DATABASE (${sales.length} records):
${JSON.stringify(sales, null, 2)}

COMPUTED ANALYTICS SUMMARY:
- Total Revenue: ৳${totalRevenue.toLocaleString()}
- Total Cost: ৳${totalCost.toLocaleString()}
- Net Profit: ৳${totalProfit.toLocaleString()}
- Overall Profit Margin: ${margin}%
- Total Unpaid/Overdue Receivables: ৳${unpaid.toLocaleString()}
- Total Orders Tracked: ${sales.length}

TOP CUSTOMERS BY REVENUE:
${JSON.stringify(topCustomers, null, 2)}

TOP CHEMICALS BY REVENUE:
${JSON.stringify(topChemicals, null, 2)}

RESPONSE FRAMEWORK:
1. For sales/revenue questions: Direct answer → Key figures → Business insight → Recommendation
2. For inventory questions: State current status → Business impact → Replenishment recommendation
3. For customer analysis: Revenue → Profit → Margin → Strategic importance
4. For product performance: Rank → Revenue → Margin → Trend insight
5. For missing data: State what's needed → Provide closest available → Suggest next step

Today's date: ${new Date().toISOString().split('T')[0]}
`
    }

    // ─── Build conversation history for Gemini ────────────────────────────────
    const contents: any[] = []

    // Include history (skip only the static welcome message marked with time:'now')
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.time === 'now') return // Skip static welcome message only
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })
      })
    }

    // Append system instruction + user's latest prompt
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\n---\nUser: ${prompt}` }]
    })

    // ─── Call Gemini API ──────────────────────────────────────────────────────
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1500,
          }
        })
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
