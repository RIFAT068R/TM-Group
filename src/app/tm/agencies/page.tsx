'use client'
import { useState } from 'react'
import Link from 'next/link'

const agencies = [
  { id:1, name:'Al-Noor Recruitment',   country:'Saudi Arabia', contact:'Salam Choudhury',  phone:'+880 1711-223344', email:'alnoor@gmail.com',     placements:48, commission:'8%', status:'active', since:'2020-01-15' },
  { id:2, name:'Gulf Connect BD',        country:'UAE',          contact:'Rashid Islam',     phone:'+880 1811-334455', email:'gulfconnect@yahoo.com', placements:35, commission:'7%', status:'active', since:'2019-06-10' },
  { id:3, name:'Middle East HR',         country:'Qatar',        contact:'Farhan Ahmed',     phone:'+880 1911-445566', email:'mehr@bd.com',           placements:22, commission:'9%', status:'active', since:'2021-03-22' },
  { id:4, name:'Kuwait Manpower Co.',    country:'Kuwait',       contact:'Jamal Hossain',    phone:'+880 1612-556677', email:'kwmanpower@gmail.com',  placements:18, commission:'8%', status:'active', since:'2021-09-01' },
  { id:5, name:'SEA Recruitment',        country:'Malaysia',     contact:'Tanvir Ali',       phone:'+880 1512-667788', email:'searec@gmail.com',      placements:12, commission:'6%', status:'active', since:'2022-04-12' },
  { id:6, name:'EuroLink Manpower',      country:'Italy',        contact:'Shimul Das',       phone:'+880 1412-778899', email:'eurolink@bd.com',        placements:3,  commission:'12%',status:'inactive',since:'2023-01-05' },
]

export default function AgenciesPage() {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:'', country:'', contact:'', phone:'', email:'', commission:'', notes:'' })

  const filtered = agencies.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Agencies</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Foreign Agencies</h1>
          <p className="page-subtitle">{agencies.length} agencies · {agencies.reduce((s,a)=>s+a.placements,0)} total placements</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-tm" onClick={()=>setShowAdd(true)}>+ Add Agency</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" placeholder="Search agency or country..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#64748B' }}>{filtered.length} results</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'1rem' }}>
        {filtered.map(a => (
          <div key={a.id} className="card glass-hover" style={{ borderColor:'rgba(124,58,237,0.15)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                <div style={{ width:44, height:44, background:'linear-gradient(135deg,#7C3AED,#F59E0B)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'1.1rem' }}>
                  {a.country.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748B' }}>🌍 {a.country}</div>
                </div>
              </div>
              <span className={`badge ${a.status==='active'?'badge-success':'badge-muted'}`}>{a.status}</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', fontSize:'0.82rem', marginBottom:'1rem' }}>
              <div><span style={{ color:'#64748B' }}>Contact:</span> <span style={{ color:'var(--text-primary)' }}>{a.contact}</span></div>
              <div><span style={{ color:'#64748B' }}>Commission:</span> <strong style={{ color:'#A78BFA' }}>{a.commission}</strong></div>
              <div><span style={{ color:'#64748B' }}>Phone:</span> <span style={{ color:'#94A3B8', fontSize:'0.75rem' }}>{a.phone}</span></div>
              <div><span style={{ color:'#64748B' }}>Placements:</span> <strong style={{ color:'#10B981' }}>{a.placements}</strong></div>
            </div>

            <div style={{ fontSize:'0.78rem', color:'#64748B', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.75rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>Since {a.since}</span>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={()=>window.open(`mailto:${a.email}`)}>Email</button>
                <button className="btn btn-ghost btn-sm">Edit ✏️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Agency Modal */}
      {showAdd && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{ maxWidth:'560px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>Add New Agency</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Agency Name *</label>
                  <input className="form-input" placeholder="Al-Noor Recruitment" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input className="form-input" placeholder="Saudi Arabia" value={form.country} onChange={e=>setForm({...form,country:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Commission Rate</label>
                  <input className="form-input" placeholder="8%" value={form.commission} onChange={e=>setForm({...form,commission:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input className="form-input" placeholder="Contact name" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+880 17xx-xxxxxx" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="agency@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" rows={2} placeholder="Any notes about this agency..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-tm" onClick={()=>{alert('Agency added! (Connect Supabase to persist)'); setShowAdd(false);}}>Add Agency</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
