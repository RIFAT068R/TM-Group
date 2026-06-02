'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const suggestions = [
  'Which country has the highest placement rate?',
  'How many workers have expiring visas this month?',
  'What is my most profitable agency?',
  'Predict demand for Saudi Arabia next quarter',
  'Show me workers whose passports expire in 90 days',
]

type Msg = { role: 'user' | 'ai'; text: string; time: string }

export default function TMAIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role:'ai', text:`Salam! I'm your **TM Overseas AI Assistant** powered by Gemini.\n\nI can help you:\n- ✈️ Analyze placement trends by country\n- 📄 Identify expiring documents (visas, passports)\n- 💰 Calculate agency commissions & profits\n- 🌍 Compare destination country performance\n- 🔮 Predict placement opportunities\n\n*Ask me anything about TM Overseas!*`, time:'now' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [workers, setWorkers] = useState<any[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tm_workers_list')
      if (saved) {
        try {
          setWorkers(JSON.parse(saved))
        } catch {
          setWorkers([
            { id: 'TM-W-001', name: 'Md. Rahim Uddin', passport: 'AB1234567', country: 'Saudi Arabia', status: 'working', passportExpiry: '2027-03-15' },
            { id: 'TM-W-002', name: 'Abdul Karim', passport: 'BC2345678', country: 'UAE', status: 'departed', passportExpiry: '2026-08-22' },
            { id: 'TM-W-003', name: 'Fatema Begum', passport: 'CD3456789', country: 'Qatar', status: 'processing', passportExpiry: '2028-01-10' },
            { id: 'TM-W-004', name: 'Md. Hasan Ali', passport: 'DE4567890', country: 'Kuwait', status: 'visa_approved', passportExpiry: '2025-12-05' },
            { id: 'TM-W-005', name: 'Sumaiya Khatun', passport: 'EF5678901', country: 'Malaysia', status: 'returned', passportExpiry: '2026-06-18' },
            { id: 'TM-W-006', name: 'Md. Kamal Hossain', passport: 'FG6789012', country: 'Saudi Arabia', status: 'working', passportExpiry: '2027-09-30' },
          ])
        }
      } else {
        setWorkers([
          { id: 'TM-W-001', name: 'Md. Rahim Uddin', passport: 'AB1234567', country: 'Saudi Arabia', status: 'working', passportExpiry: '2027-03-15' },
          { id: 'TM-W-002', name: 'Abdul Karim', passport: 'BC2345678', country: 'UAE', status: 'departed', passportExpiry: '2026-08-22' },
          { id: 'TM-W-003', name: 'Fatema Begum', passport: 'CD3456789', country: 'Qatar', status: 'processing', passportExpiry: '2028-01-10' },
          { id: 'TM-W-004', name: 'Md. Hasan Ali', passport: 'DE4567890', country: 'Kuwait', status: 'visa_approved', passportExpiry: '2025-12-05' },
          { id: 'TM-W-005', name: 'Sumaiya Khatun', passport: 'EF5678901', country: 'Malaysia', status: 'returned', passportExpiry: '2026-06-18' },
          { id: 'TM-W-006', name: 'Md. Kamal Hossain', passport: 'FG6789012', country: 'Saudi Arabia', status: 'working', passportExpiry: '2027-09-30' },
        ])
      }
    }
  }, [])

  async function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg = { role: 'user' as const, text, time: new Date().toLocaleTimeString() }
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
          module: 'tm',
          dataContext: workers
        })
      })
      if (!res.ok) {
        throw new Error('Failed to fetch from AI backend')
      }
      const data = await res.json()
      setMessages(m => [...m, { role: 'ai', text: data.text, time: new Date().toLocaleTimeString() }])
    } catch (e: any) {
      console.error(e)
      // Graceful fallback to mock answer
      setMessages(m => [...m, {
        role: 'ai',
        text: `**Connection Notice:** I could not reach the Gemini API. Here is a simulated response based on local data:\n\n✈️ **Saudi Arabia** leads with active placements.\n📄 **Expiring documents:** Md. Hasan Ali's passport expires in Dec 2025.\n\n*(Check your Gemini API Key in .env.local if this error was unexpected)*`,
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
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">AI Insights</span>
      </nav>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Placement Assistant</h1>
          <p className="page-subtitle">Powered by Gemini 2.5 Flash · Ask anything about TM Overseas</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.875rem', background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'99px', fontSize:'0.78rem', fontWeight:600, color:'#A78BFA' }}>
          <span style={{ width:6, height:6, background:'#10B981', borderRadius:'50%' }} />
          Gemini AI Active
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.25rem', height:'calc(100vh - 260px)' }}>
        <div style={{ display:'flex', flexDirection:'column', background:'var(--surface)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'var(--radius-xl)', overflow:'hidden' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', flexDirection: msg.role==='user' ? 'row-reverse' : 'row' }}>
                <div style={{ width:32, height:32, borderRadius:'8px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: msg.role==='ai' ? 'rgba(124,58,237,0.2)' : 'rgba(245,158,11,0.2)' }}>
                  {msg.role==='ai' ? '✨' : '👤'}
                </div>
                <div style={{ maxWidth:'80%', background: msg.role==='user' ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)', border:`1px solid ${msg.role==='user' ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius:'12px', padding:'0.875rem 1rem', color:'#E2E8F0' }}>
                  {renderText(msg.text)}
                  <div style={{ fontSize:'0.7rem', color:'#475569', marginTop:'0.4rem' }}>{msg.time}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <div style={{ width:32, height:32, borderRadius:'8px', background:'rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>✨</div>
                <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'0.875rem 1.25rem' }}>
                  <div style={{ display:'flex', gap:'4px' }}>
                    {[0,1,2].map(i=><span key={i} style={{ width:6, height:6, background:'#7C3AED', borderRadius:'50%', display:'inline-block', animation:`bounce 1.4s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:'1rem', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <input className="form-input" placeholder="Ask about placements, workers, visas, profits..." value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') { e.preventDefault(); sendMessage(input); } }} />
              <button className="btn btn-tm" onClick={()=>sendMessage(input)} disabled={!input.trim()||loading}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card">
            <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.875rem' }}>💡 Quick Questions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {suggestions.map(s=>(
                <button key={s} className="btn btn-ghost btn-sm" onClick={()=>sendMessage(s)} style={{ textAlign:'left', whiteSpace:'normal', height:'auto', padding:'0.6rem 0.875rem', lineHeight:1.5 }}>{s}</button>
              ))}
            </div>
          </div>
          <div className="card" style={{ background:'rgba(239,68,68,0.06)', borderColor:'rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#FCA5A5', marginBottom:'0.5rem' }}>🚨 Urgent Alerts</div>
            <div style={{ fontSize:'0.8rem', color:'#94A3B8', lineHeight:1.7 }}>
              <div>⚠️ 3 visas expiring in &lt;90 days</div>
              <div>🛂 1 passport expiring in &lt;6 months</div>
              <div>📋 5 medical certs need renewal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
