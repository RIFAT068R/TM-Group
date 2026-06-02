'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY_PREFIX = 'titas_ai_chat_'

const suggestions = [
  'Which chemicals generated the highest revenue this month?',
  'Show products with declining or lowest sales',
  'Which customers contributed the most revenue?',
  'What inventory items need restocking soon?',
  'Compare sales performance across all products',
  'What is the overall profit margin this period?',
]

const WELCOME_MSG = `**Welcome to Titas Enterprise.**

Get instant insights into sales performance, inventory status, customer activity, and business trends.

### I can help you with:

📊 Sales performance and profit analysis
🧪 Product and chemical performance insights
🏢 Customer revenue and purchasing trends
⚠️ Inventory monitoring and restock recommendations
📈 Demand forecasting and trend analysis
💰 Revenue, margin, and business performance reporting

### Try asking:

• Which chemicals generated the highest revenue this month?
• Show products with declining sales.
• Which customers contributed the most revenue?
• What inventory items need restocking soon?
• Compare sales performance with last quarter.
• Forecast demand for next month.

**What would you like to analyze today?**`

type Msg = { role: 'user' | 'ai'; text: string; time: string }

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return <h4 key={i} style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.35rem', marginTop: '0.6rem' }}>{line.replace('### ', '')}</h4>
    }
    if (line.startsWith('## ')) {
      return <h3 key={i} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem', marginTop: '0.75rem' }}>{line.replace('## ', '')}</h3>
    }
    if (line.startsWith('• ') || line.startsWith('- ')) {
      const content = line.replace(/^[•\-]\s/, '')
      const bold = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}><span style={{ flexShrink: 0, color: 'var(--brand-accent)' }}>•</span><p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.87rem' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} /></div>
    }
    const numMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numMatch) {
      const bold = numMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}><span style={{ flexShrink: 0, color: 'var(--brand-accent)', fontWeight: 600, fontSize: '0.82rem' }}>{numMatch[1]}.</span><p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.87rem' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} /></div>
    }
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.7, fontSize: '0.87rem' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />
  })
}

const defaultSales = [
  { id:'TE-2024-024', customer:'ACI Limited',           chemical:'Sulfuric Acid',     qty:500, unit:'kg',    buyPrice:85,  sellPrice:120, amount:60000, profit:17500, date:'2024-06-14', status:'paid' },
  { id:'TE-2024-023', customer:'Square Pharmaceuticals', chemical:'Ethanol',           qty:200, unit:'liter', buyPrice:95,  sellPrice:140, amount:28000, profit:9000,  date:'2024-06-13', status:'paid' },
  { id:'TE-2024-022', customer:'Renata Limited',         chemical:'Acetone',           qty:150, unit:'liter', buyPrice:72,  sellPrice:105, amount:15750, profit:4950,  date:'2024-06-12', status:'pending' },
  { id:'TE-2024-021', customer:'BRAC',                   chemical:'Sodium Hydroxide',  qty:300, unit:'kg',    buyPrice:65,  sellPrice:95,  amount:28500, profit:9000,  date:'2024-06-11', status:'paid' },
  { id:'TE-2024-020', customer:'Bashundhara Group',      chemical:'Methanol',          qty:800, unit:'liter', buyPrice:48,  sellPrice:72,  amount:57600, profit:19200, date:'2024-06-08', status:'paid' },
  { id:'TE-2024-019', customer:'Padma Chemicals',        chemical:'Hydrochloric Acid', qty:100, unit:'liter', buyPrice:55,  sellPrice:80,  amount:8000,  profit:2500,  date:'2024-06-05', status:'overdue' },
]

export default function TitasAIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: WELCOME_MSG, time: 'now' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sales, setSales] = useState<any[]>([])
  const [userId, setUserId] = useState<string>('')
  const [chatLoaded, setChatLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load user identity and restore per-user chat history
  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return

      // Identify current user from Supabase
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const uid = data?.user?.id || 'guest'
      setUserId(uid)

      // Restore per-user saved chat
      const storageKey = `${STORAGE_KEY_PREFIX}${uid}`
      const savedChat = localStorage.getItem(storageKey)
      if (savedChat) {
        try {
          const parsed = JSON.parse(savedChat)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
          }
        } catch {
          // ignore
        }
      }

      // Load sales data
      const savedSales = localStorage.getItem('titas_sales_list')
      if (savedSales) {
        try {
          const parsed = JSON.parse(savedSales)
          setSales(parsed.length > 0 ? parsed : defaultSales)
        } catch {
          setSales(defaultSales)
        }
      } else {
        setSales(defaultSales)
      }

      setChatLoaded(true)
    }
    init()
  }, [])

  // Persist per-user chat history on every message change
  useEffect(() => {
    if (!chatLoaded || !userId) return
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`
    localStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, userId, chatLoaded])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: 'user', text, time: new Date().toLocaleTimeString() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: updatedMessages,
          module: 'titas',
          dataContext: sales
        })
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setMessages(m => [...m, { role: 'ai', text: data.text, time: new Date().toLocaleTimeString() }])
    } catch {
      // Compute a live fallback from local data
      const topBySales = [...sales].sort((a, b) => (b.qty * b.sellPrice) - (a.qty * a.sellPrice))[0]
      const totalRev = sales.reduce((s, r) => s + (r.qty * r.sellPrice), 0)
      const totalProfit = sales.reduce((s, r) => s + ((r.qty * r.sellPrice) - (r.qty * r.buyPrice)), 0)
      setMessages(m => [...m, {
        role: 'ai',
        text: `**The analytics service is temporarily unavailable.**\n\nBased on local records:\n\n🧪 **${topBySales?.chemical}** is currently the top revenue-generating product.\n💰 Total recorded revenue: **৳${totalRev.toLocaleString()}** with net profit of **৳${totalProfit.toLocaleString()}**.\n⚠️ ${sales.filter(s => ['pending','overdue'].includes(s.status)).length} order(s) have pending or overdue payment status.\n\n*Please verify your API configuration if this issue persists.*`,
        time: new Date().toLocaleTimeString()
      }])
    } finally {
      setLoading(false)
    }
  }

  function clearHistory() {
    const fresh: Msg[] = [{ role: 'ai', text: WELCOME_MSG, time: 'now' }]
    setMessages(fresh)
    if (userId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(fresh))
    }
  }

  // Compute live stats for sidebar
  const totalRev = sales.reduce((s, r) => s + (r.qty * r.sellPrice), 0)
  const totalProfit = sales.reduce((s, r) => s + ((r.qty * r.sellPrice) - (r.qty * r.buyPrice)), 0)
  const margin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '0'
  const overdue = sales.filter(s => s.status === 'overdue').length

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
          <p className="page-subtitle">Powered by Gemini 2.5 Flash · Titas Enterprise Intelligence</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={clearHistory}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
            title="Clear chat history"
          >
            🗑️ Clear Chat
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.875rem', background: 'rgba(88,2,130,0.08)', border: '1px solid rgba(88,2,130,0.2)', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--brand-accent)' }}>
            <span style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Gemini AI Active
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', height: 'calc(100vh - 260px)' }}>
        {/* Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'ai' ? 'rgba(88,2,130,0.1)' : 'rgba(16,185,129,0.1)', fontSize: '0.9rem' }}>
                  {msg.role === 'ai' ? '✨' : '👤'}
                </div>
                <div style={{
                  maxWidth: '80%',
                  background: msg.role === 'user' ? 'rgba(88,2,130,0.07)' : 'var(--surface2)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(88,2,130,0.18)' : 'var(--border)'}`,
                  borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                  padding: '0.875rem 1rem',
                  color: 'var(--text-primary)',
                }}>
                  {renderText(msg.text)}
                  {msg.time !== 'now' && (
                    <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(88,2,130,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✨</div>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', padding: '0.875rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ width: 6, height: 6, background: 'var(--brand-accent)', borderRadius: '50%', display: 'inline-block', animation: `bounce 1.4s ease-in-out ${i*0.2}s infinite` }} />
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Analyzing business data...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                className="form-input"
                placeholder="Ask about chemicals, sales, customers, profits..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              />
              <button className="btn btn-primary" onClick={() => sendMessage(input)} disabled={!input.trim() || loading} aria-label="Send message">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
            <p style={{ fontSize: '0.71rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              🔒 Your conversation is private and stored only on this device
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>💡 Try Asking</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {suggestions.map(s => (
                <button key={s} className="btn btn-ghost btn-sm" onClick={() => sendMessage(s)} style={{ textAlign: 'left', whiteSpace: 'normal', height: 'auto', padding: '0.6rem 0.875rem', lineHeight: 1.5, fontSize: '0.8rem' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {sales.length > 0 && (
            <div className="card" style={{ background: 'rgba(88,2,130,0.04)', borderColor: 'rgba(88,2,130,0.15)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-accent)', marginBottom: '0.75rem' }}>📊 Live Snapshot</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.79rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Revenue</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>৳{totalRev.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Net Profit</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>৳{totalProfit.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Profit Margin</span>
                  <span style={{ fontWeight: 700, color: 'var(--brand-accent)' }}>{margin}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Overdue Orders</span>
                  <span style={{ fontWeight: 700, color: overdue > 0 ? '#EF4444' : '#10B981' }}>{overdue}</span>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ background: 'rgba(88,2,130,0.04)', borderColor: 'rgba(88,2,130,0.12)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-accent)', marginBottom: '0.5rem' }}>🔌 Data Connected</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <div>🧪 {sales.length} sales records loaded</div>
              <div>🏢 Customer revenue tracking</div>
              <div>📦 Inventory & restock analysis</div>
              <div>💰 Profit margin monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
