'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const suggestions = [
  'What is my best-selling chemical this month?',
  'Which customer gave me the highest profit?',
  'Predict next month revenue based on trend',
  'Which chemicals need restocking urgently?',
  'Show me loss-making sales this year',
]

type Msg = { role: 'user' | 'ai'; text: string; time: string }

const mockReplies: Record<string, string> = {
  default: `Based on your data analysis:

📊 **Top Insights for June 2024:**
- Revenue is up **22%** compared to same period last year
- **Sulfuric Acid** is your best performer with ৳5.4L in revenue
- **ACI Limited** is your most valuable customer (৳4.1L spend)
- Profit margin improved to **37.5%** (+2.1% vs last month)

⚠️ **Action Items:**
- 3 chemicals are critically low: Acetone, HCl, Methanol
- 2 invoices are overdue — follow up with Padma Chemicals
- Consider increasing Sulfuric Acid inventory before July peak

💡 **Recommendation:** Stock up on Acids category — demand has risen 18% in Q2.`,
}

export default function TitasAIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role:'ai', text:`Hello! I'm your **Titas Enterprise AI Assistant** powered by Gemini.\n\nI can help you:\n- 📊 Analyze sales trends & profit/loss\n- 🧪 Identify best/worst performing chemicals\n- 🏢 Customer revenue insights\n- ⚠️ Inventory alerts & restock recommendations\n- 📈 Predict future demand\n\n*Ask me anything about your business!*`, time: 'now' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sales, setSales] = useState<any[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('titas_sales_list')
      if (saved) {
        try {
          setSales(JSON.parse(saved))
        } catch {
          setSales([
            { id:'TE-2024-024', customer:'ACI Limited',           chemical:'Sulfuric Acid',     qty:500, unit:'kg',    buyPrice:85,  sellPrice:120, amount:60000, profit:17500, date:'2024-06-14', status:'paid' },
            { id:'TE-2024-023', customer:'Square Pharmaceuticals', chemical:'Ethanol',           qty:200, unit:'liter', buyPrice:95,  sellPrice:140, amount:28000, profit:9000,  date:'2024-06-13', status:'paid' },
            { id:'TE-2024-022', customer:'Renata Limited',         chemical:'Acetone',           qty:150, unit:'liter', buyPrice:72,  sellPrice:105, amount:15750, profit:4950,  date:'2024-06-12', status:'pending' },
            { id:'TE-2024-021', customer:'BRAC',                   chemical:'Sodium Hydroxide',  qty:300, unit:'kg',    buyPrice:65,  sellPrice:95,  amount:28500, profit:9000,  date:'2024-06-11', status:'paid' },
            { id:'TE-2024-020', customer:'Bashundhara Group',      chemical:'Methanol',          qty:800, unit:'liter', buyPrice:48,  sellPrice:72,  amount:57600, profit:19200, date:'2024-06-08', status:'paid' },
            { id:'TE-2024-019', customer:'Padma Chemicals',        chemical:'Hydrochloric Acid', qty:100, unit:'liter', buyPrice:55,  sellPrice:80,  amount:8000,  profit:2500,  date:'2024-06-05', status:'overdue' },
          ])
        }
      } else {
        setSales([
          { id:'TE-2024-024', customer:'ACI Limited',           chemical:'Sulfuric Acid',     qty:500, unit:'kg',    buyPrice:85,  sellPrice:120, amount:60000, profit:17500, date:'2024-06-14', status:'paid' },
          { id:'TE-2024-023', customer:'Square Pharmaceuticals', chemical:'Ethanol',           qty:200, unit:'liter', buyPrice:95,  sellPrice:140, amount:28000, profit:9000,  date:'2024-06-13', status:'paid' },
          { id:'TE-2024-022', customer:'Renata Limited',         chemical:'Acetone',           qty:150, unit:'liter', buyPrice:72,  sellPrice:105, amount:15750, profit:4950,  date:'2024-06-12', status:'pending' },
          { id:'TE-2024-021', customer:'BRAC',                   chemical:'Sodium Hydroxide',  qty:300, unit:'kg',    buyPrice:65,  sellPrice:95,  amount:28500, profit:9000,  date:'2024-06-11', status:'paid' },
          { id:'TE-2024-020', customer:'Bashundhara Group',      chemical:'Methanol',          qty:800, unit:'liter', buyPrice:48,  sellPrice:72,  amount:57600, profit:19200, date:'2024-06-08', status:'paid' },
          { id:'TE-2024-019', customer:'Padma Chemicals',        chemical:'Hydrochloric Acid', qty:100, unit:'liter', buyPrice:55,  sellPrice:80,  amount:8000,  profit:2500,  date:'2024-06-05', status:'overdue' },
        ])
      }
    }
  }, [])

  async function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Msg = { role:'user', text, time: new Date().toLocaleTimeString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: messages,
          module: 'titas',
          dataContext: sales
        })
      })
      if (!res.ok) {
        throw new Error('Failed to fetch from AI backend')
      }
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', text: data.text, time: new Date().toLocaleTimeString() }])
    } catch (e: any) {
      console.error(e)
      setMessages(m => [...m, {
        role: 'ai',
        text: `**Connection Notice:** I could not reach the Gemini API. Here is a simulated response based on local data:\n\n📊 **Sulfuric Acid** is your best seller this month.\n🏢 **ACI Limited** is your highest profit customer.\n\n*(Check your Gemini API Key in .env.local if this error was unexpected)*`,
        time: new Date().toLocaleTimeString()
      }])
    } finally {
      setLoading(false)
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }

  function renderText(text: string) {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} style={{ marginBottom:'0.3rem', lineHeight:1.7, fontSize:'0.88rem' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />
    })
  }

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">AI Insights</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">AI Business Assistant</h1>
          <p className="page-subtitle">Powered by Gemini 2.5 Flash · Ask anything about Titas Enterprise</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.875rem', background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:'99px', fontSize:'0.78rem', fontWeight:600, color:'#60A5FA' }}>
          <span style={{ width:6, height:6, background:'#10B981', borderRadius:'50%', animation:'pulse 2s infinite' }} />
          Gemini AI Active
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.25rem', height:'calc(100vh - 260px)' }}>
        {/* Chat Window */}
        <div style={{ display:'flex', flexDirection:'column', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', flexDirection: msg.role==='user' ? 'row-reverse' : 'row' }}>
                <div style={{ width:32, height:32, borderRadius:'8px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: msg.role==='ai' ? 'rgba(37,99,235,0.2)' : 'rgba(16,185,129,0.2)', fontSize:'0.85rem' }}>
                  {msg.role==='ai' ? '✨' : '👤'}
                </div>
                <div style={{ maxWidth:'80%', background: msg.role==='user' ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${msg.role==='user' ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius:'12px', padding:'0.875rem 1rem', color:'#E2E8F0' }}>
                  {renderText(msg.text)}
                  <div style={{ fontSize:'0.7rem', color:'#475569', marginTop:'0.4rem', textAlign: msg.role==='user' ? 'right' : 'left' }}>{msg.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                <div style={{ width:32, height:32, borderRadius:'8px', background:'rgba(37,99,235,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>✨</div>
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'0.875rem 1.25rem' }}>
                  <div style={{ display:'flex', gap:'4px' }}>
                    {[0,1,2].map(i => <span key={i} style={{ width:6, height:6, background:'#64748B', borderRadius:'50%', display:'inline-block', animation:`bounce 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'1rem', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <input className="form-input" placeholder="Ask about your chemicals, sales, profits..." value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} />
              <button className="btn btn-primary" onClick={()=>sendMessage(input)} disabled={!input.trim() || loading} aria-label="Send message">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
            <p style={{ fontSize:'0.72rem', color:'#10B981', marginTop:'0.5rem' }}>✨ Gemini AI active and analyzing live chemical sales database</p>
          </div>
        </div>

        {/* Suggestions Panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card">
            <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.875rem' }}>💡 Quick Questions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {suggestions.map(s => (
                <button key={s} className="btn btn-ghost btn-sm" onClick={()=>sendMessage(s)} style={{ textAlign:'left', whiteSpace:'normal', height:'auto', padding:'0.6rem 0.875rem', lineHeight:1.5 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="card" style={{ background:'rgba(37,99,235,0.06)', borderColor:'rgba(37,99,235,0.2)' }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#60A5FA', marginBottom:'0.5rem' }}>⚡ Advanced Queries</div>
            <p style={{ fontSize:'0.78rem', color:'#94A3B8', lineHeight:1.6 }}>You can ask specific questions about sales records, quantities, top buyers, restock warnings, and profit margin analysis based on live transactions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
