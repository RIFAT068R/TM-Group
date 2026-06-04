'use client'
import { useState } from 'react'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'

export default function TMSettingsPage() {
  const [profile, setProfile] = useState({ companyName:'TM Overseas', ownerName:'', email:'admin@tmoverseas.com', phone:'+880 1811-000000', address:'Dhaka, Bangladesh', currency:'BDT (৳)' })
  const [notifications, setNotifications] = useState({ visaExpiry:true, passportExpiry:true, newPlacement:true, weeklyReport:true, documentAlert:true })
  const [saved, setSaved] = useState(false)
  function save() { setSaved(true); setTimeout(()=>setSaved(false), 2000) }

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Settings</span>
      </nav>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div style={{ maxWidth:'700px', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
        <div className="card">
          <h3 style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>🏢 Company Information</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Company Name</label>
              <input className="form-input" value={profile.companyName} onChange={e=>setProfile({...profile,companyName:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Owner / Admin Name</label>
              <input className="form-input" value={profile.ownerName} onChange={e=>setProfile({...profile,ownerName:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <CustomSelect
                value={profile.currency}
                onChange={v => setProfile({...profile, currency: v})}
                style={{ width: '100%' }}
                options={[
                  { value: 'BDT (৳)', label: 'BDT (৳)' },
                  { value: 'USD ($)', label: 'USD ($)' },
                  { value: 'SAR (ر.س)', label: 'SAR (ر.س)' },
                  { value: 'AED (د.إ)', label: 'AED (د.إ)' },
                ]}
              />
            </div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}>
              <label className="form-label">Business Address</label>
              <textarea className="form-textarea" rows={2} value={profile.address} onChange={e=>setProfile({...profile,address:e.target.value})} />
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
              { key:'weeklyReport',   label:'Weekly Summary Email',      desc:'Auto-send placement summary every Monday' },
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
          <button className="btn btn-tm" onClick={save}>{saved ? '✅ Saved!' : 'Save Changes'}</button>
          <button className="btn btn-ghost">Reset</button>
        </div>
      </div>
    </div>
  )
}
