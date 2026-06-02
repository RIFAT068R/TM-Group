import { NextResponse } from 'next/server'

const MODEL = 'gemini-2.5-flash-lite'

export async function POST(req: Request) {
  try {
    const { prompt, history, module, dataContext } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not configured in environment.' }, { status: 500 })
    }

    const today = new Date().toISOString().split('T')[0]
    let systemInstruction = ''

    // ─── TM Overseas Module ────────────────────────────────────────────────────
    if (module === 'tm') {
      const workers: any[] = Array.isArray(dataContext) ? dataContext : []

      // Compact summaries — avoids sending full pretty-printed JSON
      const byCountry: Record<string, number> = {}
      const byStatus: Record<string, number> = {}
      const alertWorkers: string[] = []

      workers.forEach(w => {
        byCountry[w.country] = (byCountry[w.country] || 0) + 1
        byStatus[w.status] = (byStatus[w.status] || 0) + 1
        const exp = w.passportExpiry ? new Date(w.passportExpiry) : null
        if (exp) {
          const days = Math.ceil((exp.getTime() - Date.now()) / 86400000)
          if (days <= 180) alertWorkers.push(`${w.name} (${w.country}, expires ${w.passportExpiry}, ${days}d left)`)
        }
      })

      // Compact worker list — minimal fields only
      const compactWorkers = workers.map(w => ({
        id: w.id, name: w.name, passport: w.passport,
        country: w.country, status: w.status,
        passportExpiry: w.passportExpiry, phone: w.phone, dob: w.dob,
        category: w.category, agency: w.agency
      }))

      systemInstruction = `You are a senior operations analyst for TM Overseas, a Bangladeshi manpower placement agency.
Respond as an experienced business manager — professional, direct, analytical. Never say you are an AI.
Answer first, then support with data, then add one business insight.
Use markdown: **bold**, bullet points, ### headers. Be concise.
Today: ${today}

WORKERS (${workers.length} total): ${JSON.stringify(compactWorkers)}
BY COUNTRY: ${JSON.stringify(byCountry)}
BY STATUS: ${JSON.stringify(byStatus)}
PASSPORT ALERTS (expiring ≤180 days): ${alertWorkers.length ? alertWorkers.join('; ') : 'None'}
ACTIVE (working+visa_approved+departed): ${workers.filter(w => ['working','visa_approved','departed'].includes(w.status)).length}`

    // ─── Titas Enterprise Module ──────────────────────────────────────────────
    } else {
      const sales: any[] = Array.isArray(dataContext) ? dataContext : []

      const totalRev = sales.reduce((s, r) => s + r.qty * r.sellPrice, 0)
      const totalCost = sales.reduce((s, r) => s + r.qty * r.buyPrice, 0)
      const totalProfit = totalRev - totalCost
      const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0'
      const unpaid = sales.filter(s => ['pending','overdue'].includes(s.status)).reduce((t, s) => t + s.qty * s.sellPrice, 0)

      // Customer summary
      const custMap: Record<string, { rev: number; profit: number; orders: number }> = {}
      const chemMap: Record<string, { qty: number; rev: number; profit: number }> = {}
      sales.forEach(s => {
        const rev = s.qty * s.sellPrice
        const profit = rev - s.qty * s.buyPrice
        if (!custMap[s.customer]) custMap[s.customer] = { rev: 0, profit: 0, orders: 0 }
        custMap[s.customer].rev += rev
        custMap[s.customer].profit += profit
        custMap[s.customer].orders++
        if (!chemMap[s.chemical]) chemMap[s.chemical] = { qty: 0, rev: 0, profit: 0 }
        chemMap[s.chemical].qty += s.qty
        chemMap[s.chemical].rev += rev
        chemMap[s.chemical].profit += profit
      })

      const topCust = Object.entries(custMap)
        .sort(([,a],[,b]) => b.rev - a.rev)
        .map(([name, d]) => `${name}: rev=৳${d.rev.toLocaleString()} profit=৳${d.profit.toLocaleString()} orders=${d.orders}`)

      const topChem = Object.entries(chemMap)
        .sort(([,a],[,b]) => b.rev - a.rev)
        .map(([name, d]) => `${name}: qty=${d.qty} rev=৳${d.rev.toLocaleString()} profit=৳${d.profit.toLocaleString()}`)

      const compactSales = sales.map(s => ({
        id: s.id, customer: s.customer, chemical: s.chemical,
        qty: s.qty, unit: s.unit, buyPrice: s.buyPrice, sellPrice: s.sellPrice,
        revenue: s.qty * s.sellPrice, profit: (s.qty * s.sellPrice) - (s.qty * s.buyPrice),
        date: s.date, status: s.status
      }))

      systemInstruction = `You are a senior business analyst for Titas Enterprise, a chemical import & distribution company in Bangladesh.
Respond as an experienced BI Manager or Sales Director — professional, direct, analytical. Never say you are an AI. Never start with "Hello".
Answer first, support with figures, add one business insight. Use markdown: **bold**, bullets, ### headers. Be concise.
Today: ${today}

SALES RECORDS (${sales.length} orders): ${JSON.stringify(compactSales)}
SUMMARY: revenue=৳${totalRev.toLocaleString()} cost=৳${totalCost.toLocaleString()} profit=৳${totalProfit.toLocaleString()} margin=${margin}% unpaid=৳${unpaid.toLocaleString()}
TOP CUSTOMERS: ${topCust.join(' | ')}
TOP CHEMICALS: ${topChem.join(' | ')}`
    }

    // ─── Build Gemini conversation (history without current prompt) ───────────
    const contents: any[] = []

    if (history && Array.isArray(history)) {
      const filtered = history.filter((m: any) => m.time !== 'now').slice(0, -1)
      filtered.forEach((m: any) => {
        const role = m.role === 'user' ? 'user' : 'model'
        if (contents.length > 0 && contents[contents.length - 1].role === role) return
        contents.push({ role, parts: [{ text: m.text }] })
      })
    }

    // Add current user prompt
    contents.push({ role: 'user', parts: [{ text: prompt }] })

    // ─── Call Gemini ─────────────────────────────────────────────────────────
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: {
            temperature: 0.35,
            topK: 32,
            topP: 0.85,
            maxOutputTokens: 1200,
          }
        })
      }
    )

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}))
      console.error('Gemini error:', response.status, JSON.stringify(errBody))
      const msg = errBody?.error?.message || 'Gemini API call failed'
      // Surface quota errors clearly
      if (response.status === 429) {
        return NextResponse.json({
          error: `Rate limit reached (HTTP 429). The free tier allows limited requests per day. Please wait a few minutes and try again. Details: ${msg.slice(0, 200)}`
        }, { status: 429 })
      }
      return NextResponse.json({ error: msg }, { status: response.status })
    }

    const resData = await response.json()
    const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'
    return NextResponse.json({ text })

  } catch (e: any) {
    console.error('AI route error:', e)
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 })
  }
}
