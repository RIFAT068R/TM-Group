'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const chemicals = [
  { id: 1, name: 'Sulfuric Acid',      sku: 'TE-CHEM-001', category: 'Acids',    unit: 'kg',    stock: 1200, minStock: 200, price: 85,  status: 'in_stock' },
  { id: 2, name: 'Sodium Hydroxide',   sku: 'TE-CHEM-002', category: 'Bases',    unit: 'kg',    stock: 850,  minStock: 150, price: 65,  status: 'in_stock' },
  { id: 3, name: 'Hydrochloric Acid',  sku: 'TE-CHEM-003', category: 'Acids',    unit: 'liter', stock: 120,  minStock: 200, price: 55,  status: 'low_stock' },
  { id: 4, name: 'Ethanol',            sku: 'TE-CHEM-004', category: 'Solvents', unit: 'liter', stock: 650,  minStock: 100, price: 95,  status: 'in_stock' },
  { id: 5, name: 'Acetone',            sku: 'TE-CHEM-005', category: 'Solvents', unit: 'liter', stock: 80,   minStock: 150, price: 72,  status: 'low_stock' },
  { id: 6, name: 'Methanol',           sku: 'TE-CHEM-006', category: 'Solvents', unit: 'liter', stock: 430,  minStock: 100, price: 48,  status: 'in_stock' },
  { id: 7, name: 'Nitric Acid',        sku: 'TE-CHEM-007', category: 'Acids',    unit: 'liter', stock: 0,    minStock: 100, price: 110, status: 'out_of_stock' },
  { id: 8, name: 'Calcium Carbonate',  sku: 'TE-CHEM-008', category: 'Salts',    unit: 'kg',    stock: 2100, minStock: 300, price: 32,  status: 'in_stock' },
]

const statusStyles: Record<string, { label: string; cls: string }> = {
  in_stock:     { label: 'In Stock',     cls: 'badge-success' },
  low_stock:    { label: 'Low Stock',    cls: 'badge-warning' },
  out_of_stock: { label: 'Out of Stock', cls: 'badge-danger' },
}

export default function ChemicalsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', sku:'', category:'Acids', unit:'kg', minStock:'' })
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const role = (data.user.user_metadata?.role || data.user.app_metadata?.role || '').toLowerCase();
        setIsAdmin(role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };
    checkRole();
  }, []);

  const filtered = chemicals.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (category ? c.category === category : true)
  )

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Chemicals</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Chemical Catalog</h1>
          <p className="page-subtitle">{chemicals.length} chemicals registered · {chemicals.filter(c=>c.status==='low_stock').length} low stock alerts</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Add Chemical
            </button>
          )}
          <Link href="/titas/inventory" className="btn btn-ghost">Inventory →</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" className="form-input" placeholder="Search chemicals..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search chemicals" />
        </div>
        <select className="form-select" style={{ width:'160px' }} value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="">All Categories</option>
          {['Acids','Bases','Solvents','Salts'].map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#64748B' }}>{filtered.length} results</div>
      </div>

      {/* Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Chemical Name</th><th>SKU</th><th>Category</th><th>Unit</th><th>Current Stock</th><th>Min Stock</th><th>Buy Price (৳)</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9}>
                <div className="empty-state">
                  <div className="empty-icon">🧪</div>
                  <h3>No chemicals found</h3>
                  <p>Try adjusting your search or add a new chemical</p>
                  <button className="btn btn-primary btn-sm mt-4" onClick={() => setShowModal(true)}>Add Chemical</button>
                </div>
              </td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{c.name}</td>
                <td><span className="num" style={{ fontSize:'0.78rem', color:'#64748B' }}>{c.sku}</span></td>
                <td><span className="badge badge-info">{c.category}</span></td>
                <td>{c.unit}</td>
                <td className="num" style={{ fontWeight:600, color: c.status === 'low_stock' ? '#F59E0B' : c.status === 'out_of_stock' ? '#EF4444' : 'var(--text-primary)' }}>
                  {c.stock.toLocaleString()}
                </td>
                <td className="num" style={{ color:'#64748B' }}>{c.minStock.toLocaleString()}</td>
                <td className="num">৳{c.price}</td>
                <td><span className={`badge ${statusStyles[c.status].cls}`}>{statusStyles[c.status].label}</span></td>
                <td>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" aria-label={`Edit ${c.name}`}>✏️</button>
                    <button className="btn btn-danger btn-sm" aria-label={`Delete ${c.name}`}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Chemical Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 id="modal-title" style={{ fontSize:'1.1rem', fontWeight:800 }}>Add New Chemical</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)} aria-label="Close modal">✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label htmlFor="chem-name" className="form-label">Chemical Name *</label>
                  <input id="chem-name" className="form-input" placeholder="e.g. Sulfuric Acid" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label htmlFor="chem-sku" className="form-label">SKU</label>
                  <input id="chem-sku" className="form-input" placeholder="TE-CHEM-009" value={form.sku} onChange={e => setForm({...form, sku:e.target.value})} />
                  <span className="form-hint">Leave blank to auto-generate</span>
                </div>
                <div className="form-group">
                  <label htmlFor="chem-cat" className="form-label">Category</label>
                  <select id="chem-cat" className="form-select" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    {['Acids','Bases','Solvents','Salts','Polymers','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="chem-unit" className="form-label">Unit *</label>
                  <select id="chem-unit" className="form-select" value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}>
                    {['kg','liter','ton','drum','bag','piece'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="chem-min" className="form-label">Min Stock Alert</label>
                  <input id="chem-min" type="number" className="form-input" placeholder="100" value={form.minStock} onChange={e => setForm({...form, minStock:e.target.value})} />
                  <span className="form-hint">Alert when stock drops below this</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { alert('Chemical added! (Connect Supabase to save)'); setShowModal(false); }}>Add Chemical</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
