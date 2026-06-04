'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'
import { createClient } from '@/lib/supabase/client'

export default function TMSettingsPage() {
  const [profile, setProfile] = useState({ companyName:'TM Overseas', ownerName:'', email:'admin@tmoverseas.com', phone:'+880 1811-000000', address:'Dhaka, Bangladesh', currency:'BDT (৳)' })
  const [notifications, setNotifications] = useState({ visaExpiry:true, passportExpiry:true, newPlacement:true, weeklyReport:true, documentAlert:true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

          const meta = user.user_metadata || {}
          setProfile({
            companyName: meta.companyName || 'TM Overseas',
            ownerName: profileRow?.full_name || meta.ownerName || '',
            email: user.email || 'admin@tmoverseas.com',
            phone: meta.phone || '+880 1811-000000',
            address: meta.address || 'Dhaka, Bangladesh',
            currency: meta.currency || 'BDT (৳)',
          })

          if (meta.notifications) {
            setNotifications({
              visaExpiry: meta.notifications.visaExpiry !== undefined ? meta.notifications.visaExpiry : true,
              passportExpiry: meta.notifications.passportExpiry !== undefined ? meta.notifications.passportExpiry : true,
              newPlacement: meta.notifications.newPlacement !== undefined ? meta.notifications.newPlacement : true,
              weeklyReport: meta.notifications.weeklyReport !== undefined ? meta.notifications.weeklyReport : true,
              documentAlert: meta.notifications.documentAlert !== undefined ? meta.notifications.documentAlert : true,
            })
          }
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function save() {
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: metaErr } = await supabase.auth.updateUser({
        data: {
          companyName: profile.companyName,
          ownerName: profile.ownerName,
          phone: profile.phone,
          address: profile.address,
          currency: profile.currency,
          notifications: notifications
        }
      })
      if (metaErr) throw metaErr

      const { error: dbErr } = await supabase
        .from('profiles')
        .update({ full_name: profile.ownerName })
        .eq('id', user.id)
      if (dbErr) throw dbErr

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      console.error('Failed to save profile:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 0, 0, 0.1)',
          borderTopColor: '#7C3AED',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading settings...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Settings</span>
      </nav>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>

      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', color: '#991B1B', fontWeight: 600, fontSize: '0.875rem', maxWidth: '700px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ maxWidth:'700px', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
        <div className="card">
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>🏢 Company Information</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Company Name</label>
              <input className="form-input" value={profile.companyName} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Owner / Admin Name</label>
              <input className="form-input" value={profile.ownerName} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={profile.email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Currency</label>
              <CustomSelect
                value={profile.currency}
                onChange={v => setProfile({...profile, currency: v})}
                style={{ width: '100%' }}
                options={[
                  { value: 'BDT (৳)', label: 'BDT (৳)' }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>🔔 Notification Preferences</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {[
              { key:'visaExpiry',     label:'Visa Expiry Alerts',       desc:'Alert 90, 30, 7 days before visa expires' },
              { key:'passportExpiry', label:'Passport Expiry Alerts',    desc:'Alert when passport expiry is within 6 months' },
              { key:'newPlacement',   label:'New Placement Notification', desc:'Notify on each new placement record' },
              { key:'weeklyReport',   label:'Weekly Summary Email',      desc:'Auto-send placement summary every Friday' },
              { key:'documentAlert',  label:'Document Upload Alerts',    desc:'Notify when workers upload new documents' },
            ].map(n=>(
              <div key={n.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem', background:'rgba(255,255,255,0.03)', borderRadius:'10px' }}>
                <div>
                  <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'0.9rem' }}>{n.label}</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748B' }}>{n.desc}</div>
                </div>
                <label style={{ position:'relative', display:'inline-block', width:40, height:22, cursor:'pointer' }}>
                  <input type="checkbox" checked={notifications[n.key as keyof typeof notifications]} onChange={e=>setNotifications({...notifications,[n.key]:e.target.checked})} style={{ opacity:0, width:0, height:0 }} aria-label={n.label} />
                  <span style={{ position:'absolute', inset:0, borderRadius:'99px', background: notifications[n.key as keyof typeof notifications] ? '#7C3AED' : '#1E293B', border:'1px solid rgba(255,255,255,0.12)', transition:'all 0.2s' }}>
                    <span style={{ position:'absolute', top:'3px', left: notifications[n.key as keyof typeof notifications] ? '20px' : '3px', width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="btn btn-tm" onClick={save} disabled={saving}>
            {saving ? '⏳ Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
          </button>
          <button className="btn btn-ghost" onClick={() => window.location.reload()}>Reset</button>
        </div>
      </div>
    </div>
  )
}
