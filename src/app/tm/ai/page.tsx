'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY_PREFIX = 'tm_ai_chat_'

const suggestions = [
  'Which country has the highest number of placements?',
  'List workers with passports expiring in the next 6 months',
  'What is the distribution of workers by status?',
  'Which workers are currently working abroad?',
  'Show a breakdown of workers by destination country',
  'How many workers are still in the processing stage?',
]

const WELCOME_MSG = `**Assalamu Alaikum! Welcome to TM Overseas.**

I'm here to help you access insights, track performance, and make informed decisions across your overseas placement operations.

### I can help you:

✈️ Analyze placement trends by country
📄 Track expiring visas, passports, and other documents
💰 Calculate agency commissions, revenues, and profits
🌍 Compare performance across destination countries
📊 Monitor recruitment and placement statistics
🔮 Identify opportunities and forecast placement trends

Simply ask a question in natural language, and I'll provide the information you need.

**How can I assist you today?**`

type Msg = { role: 'user' | 'ai'; text: string; time: string }

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    // Render ### as h4
    if (line.startsWith('### ')) {
      return <h4 key={i} style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.35rem', marginTop: '0.6rem' }}>{line.replace('### ', '')}</h4>
    }
    // Render ## as h3
    if (line.startsWith('## ')) {
      return <h3 key={i} style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem', marginTop: '0.75rem' }}>{line.replace('## ', '')}</h3>
    }
    // Render bullet points
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const content = line.replace(/^[-•]\s/, '')
      const bold = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}><span style={{ flexShrink: 0, color: 'var(--brand-accent)' }}>•</span><p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.87rem' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} /></div>
    }
    // Render numbered bullets
    const numMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numMatch) {
      const bold = numMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem' }}><span style={{ flexShrink: 0, color: 'var(--brand-accent)', fontWeight: 600, fontSize: '0.82rem' }}>{numMatch[1]}.</span><p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.87rem' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} /></div>
    }
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    return <p key={i} style={{ marginBottom: '0.25rem', lineHeight: 1.7, fontSize: '0.87rem' }} dangerouslySetInnerHTML={{ __html: bold || '&nbsp;' }} />
  })
}

export default function TMAIPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: WELCOME_MSG, time: 'now' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [workers, setWorkers] = useState<any[]>([])
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
          // ignore parse errors
        }
      }

      // Load workers data
      const savedWorkers = localStorage.getItem('tm_workers_list')
      if (savedWorkers) {
        try { setWorkers(JSON.parse(savedWorkers)) } catch { /* ignore */ }
      }
      if (!savedWorkers || !JSON.parse(savedWorkers || '[]').length) {
        setWorkers([
          { id: 'TM-W-001', name: 'Md. Rahim Uddin',  passport: 'AB1234567', dob: '1990-05-12', phone: '+880 1712-345678', country: 'Saudi Arabia', status: 'working',       category: 'Middle East',    passportExpiry: '2027-03-15' },
          { id: 'TM-W-002', name: 'Abdul Karim',       passport: 'BC2345678', dob: '1988-11-20', phone: '+880 1812-456789', country: 'UAE',          status: 'departed',      category: 'Middle East',    passportExpiry: '2026-08-22' },
          { id: 'TM-W-003', name: 'Fatema Begum',      passport: 'CD3456789', dob: '1995-02-08', phone: '+880 1911-567890', country: 'Qatar',        status: 'processing',    category: 'Middle East',    passportExpiry: '2028-01-10' },
          { id: 'TM-W-004', name: 'Md. Hasan Ali',     passport: 'DE4567890', dob: '1992-07-30', phone: '+880 1612-678901', country: 'Kuwait',       status: 'visa_approved', category: 'Middle East',    passportExpiry: '2025-12-05' },
          { id: 'TM-W-005', name: 'Sumaiya Khatun',    passport: 'EF5678901', dob: '1997-09-14', phone: '+880 1512-789012', country: 'Malaysia',     status: 'returned',      category: 'Southeast Asia', passportExpiry: '2026-06-18' },
          { id: 'TM-W-006', name: 'Md. Kamal Hossain', passport: 'FG6789012', dob: '1985-03-25', phone: '+880 1412-890123', country: 'Saudi Arabia', status: 'working',       category: 'Middle East',    passportExpiry: '2027-09-30' },
        ])
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
          module: 'tm',
          dataContext: workers
        })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data?.error || `HTTP ${res.status}`)
      }
      setMessages(m => [...m, { role: 'ai', text: data.text, time: new Date().toLocaleTimeString() }])
    } catch (e: any) {
      const errMsg = e?.message || 'Unknown error'
      setMessages(m => [...m, {
        role: 'ai',
        text: `**The request could not be completed.**\n\n**Error:** ${errMsg}\n\nIf this continues, please check that the Gemini API key is set in your deployment environment and that a redeploy was triggered after adding it.`,
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
          <p className="page-subtitle">Powered by Gemini 2.5 Flash-Lite · Ask anything about TM Overseas</p>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.875rem', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600, color: '#A78BFA' }}>
            <span style={{ width: 6, height: 6, background: '#10B981', borderRadius: '50%', display: 'inline-block' }} />
            Gemini AI Active
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem', height: 'calc(100vh - 260px)' }}>
        {/* Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'ai' ? 'rgba(124,58,237,0.2)' : 'rgba(245,158,11,0.2)', fontSize: '0.9rem' }}>
                  {msg.role === 'ai' ? '✨' : '👤'}
                </div>
                <div style={{
                  maxWidth: '80%',
                  background: msg.role === 'user' ? 'rgba(124,58,237,0.12)' : 'var(--surface2)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(124,58,237,0.25)' : 'var(--border)'}`,
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
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✨</div>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px 12px 12px 12px', padding: '0.875rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ width: 6, height: 6, background: '#7C3AED', borderRadius: '50%', display: 'inline-block', animation: `bounce 1.4s ease-in-out ${i*0.2}s infinite` }} />
                    ))}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Analyzing...</span>
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
                placeholder="Ask about placements, workers, visas, profits..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              />
              <button className="btn btn-tm" onClick={() => sendMessage(input)} disabled={!input.trim() || loading} aria-label="Send message">
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

          <div className="card" style={{ background: 'rgba(124,58,237,0.06)', borderColor: 'rgba(124,58,237,0.2)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A78BFA', marginBottom: '0.5rem' }}>📊 Data Connected</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <div>👷 {workers.length} worker records loaded</div>
              <div>🌍 Destination countries tracked</div>
              <div>📄 Document expiry monitoring</div>
              <div>💰 Agency & profit analytics</div>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCA5A5', marginBottom: '0.5rem' }}>🚨 Alerts</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {workers.filter(w => {
                const exp = w.passportExpiry ? new Date(w.passportExpiry) : null
                if (!exp) return false
                const days = Math.ceil((exp.getTime() - Date.now()) / 86400000)
                return days <= 180
              }).length > 0 && (
                <div>⚠️ {workers.filter(w => {
                  const exp = w.passportExpiry ? new Date(w.passportExpiry) : null
                  if (!exp) return false
                  const days = Math.ceil((exp.getTime() - Date.now()) / 86400000)
                  return days <= 180
                }).length} passport(s) expiring soon</div>
              )}
              <div>📋 Ask AI for full document status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
