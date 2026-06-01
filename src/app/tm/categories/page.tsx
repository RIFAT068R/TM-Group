'use client'
import { useState } from 'react'
import Link from 'next/link'

const defaultCats = [
  { id:1, name:'Middle East',    color:'#F59E0B', count:135, description:'Saudi Arabia, UAE, Qatar, Kuwait, Bahrain' },
  { id:2, name:'Southeast Asia', color:'#10B981', count:25,  description:'Malaysia, Singapore, Brunei' },
  { id:3, name:'Europe',         color:'#3B82F6', count:3,   description:'Italy, Romania, other EU countries' },
  { id:4, name:'Domestic',       color:'#64748B', count:0,   description:'Within Bangladesh placements' },
]
const colors = ['#F59E0B','#10B981','#3B82F6','#7C3AED','#EF4444','#06B6D4','#EC4899']

export default function TMCategoriesPage() {
  const [cats, setCats] = useState(defaultCats)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:'', color:colors[0], description:'' })

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Categories</span>
      </nav>
      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Categories</h1>
          <p className="page-subtitle">{cats.length} categories by destination region</p>
        </div>
        <button className="btn btn-tm" onClick={()=>setShowAdd(true)}>+ Add Category</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
        {cats.map(cat=>(
          <div key={cat.id} className="card glass-hover" style={{ borderLeft:`3px solid ${cat.color}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:36, height:36, borderRadius:'10px', background:`${cat.color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>🌍</div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{cat.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'#64748B' }}>{cat.count} workers</div>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={()=>setCats(c=>c.filter(x=>x.id!==cat.id))}>🗑️</button>
            </div>
            <p style={{ fontSize:'0.82rem', color:'#64748B' }}>{cat.description}</p>
          </div>
        ))}
      </div>
      {showAdd && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{ maxWidth:'440px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>Add Category</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-4">
                <label className="form-label">Name *</label>
                <input className="form-input" placeholder="e.g. Middle East" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Color</label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  {colors.map(c=><button key={c} onClick={()=>setForm({...form,color:c})} style={{ width:28, height:28, borderRadius:'50%', background:c, border: form.color===c ? '3px solid #fff' : '3px solid transparent', cursor:'pointer' }} />)}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Countries / Description</label>
                <textarea className="form-textarea" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-tm" onClick={()=>{ if(form.name){ setCats(c=>[...c,{id:Date.now(),...form,count:0}]); setShowAdd(false); }}}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
