'use client'
import { useState } from 'react'
import Link from 'next/link'

const defaultCategories = [
  { id:1, name:'Acids',     color:'#EF4444', count:3, description:'Corrosive acids - H2SO4, HCl, HNO3' },
  { id:2, name:'Bases',     color:'#3B82F6', count:2, description:'Alkaline compounds - NaOH, KOH' },
  { id:3, name:'Solvents',  color:'#10B981', count:3, description:'Organic solvents - Ethanol, Acetone, Methanol' },
  { id:4, name:'Salts',     color:'#F59E0B', count:2, description:'Inorganic salts - CaCO3, NaCl' },
  { id:5, name:'Polymers',  color:'#7C3AED', count:0, description:'Polymer compounds' },
]

const colors = ['#EF4444','#3B82F6','#10B981','#F59E0B','#7C3AED','#06B6D4','#EC4899','#F97316']

export default function TitasCategoriesPage() {
  const [cats, setCats] = useState(defaultCategories)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name:'', color:colors[0], description:'' })

  function addCategory() {
    if (!form.name.trim()) return
    setCats(c => [...c, { id:Date.now(), name:form.name, color:form.color, count:0, description:form.description }])
    setForm({ name:'', color:colors[0], description:'' })
    setShowAdd(false)
  }

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Categories</span>
      </nav>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chemical Categories</h1>
          <p className="page-subtitle">{cats.length} categories · {cats.reduce((s,c)=>s+c.count,0)} chemicals categorized</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Category</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1rem' }}>
        {cats.map(cat => (
          <div key={cat.id} className="card glass-hover" style={{ borderLeft:`3px solid ${cat.color}` }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:36, height:36, borderRadius:'10px', background:`${cat.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>🏷️</div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{cat.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'#64748B' }}>{cat.count} chemicals</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.3rem' }}>
                <button className="btn btn-ghost btn-sm" aria-label="Edit">✏️</button>
                <button className="btn btn-danger btn-sm" onClick={()=>setCats(c=>c.filter(x=>x.id!==cat.id))} aria-label="Delete">🗑️</button>
              </div>
            </div>
            <p style={{ fontSize:'0.82rem', color:'#64748B', lineHeight:1.5 }}>{cat.description || 'No description'}</p>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{ maxWidth:'460px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>Add Category</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-4">
                <label className="form-label">Category Name *</label>
                <input className="form-input" placeholder="e.g. Acids" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Color</label>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  {colors.map(c=>(
                    <button key={c} onClick={()=>setForm({...form,color:c})} style={{ width:28, height:28, borderRadius:'50%', background:c, border: form.color===c ? '3px solid #fff' : '3px solid transparent', cursor:'pointer' }} aria-label={c} />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={2} placeholder="Brief description..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addCategory}>Add Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
