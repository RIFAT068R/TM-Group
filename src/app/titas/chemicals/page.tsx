'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'

const INITIAL_CHEMICALS = [
  { id: 1, name: 'Sulfuric Acid',      sku: 'TE-CHEM-001', category: 'Acids',    unit: 'kg',    dram: '200 kg', origin: 'China',        stock: 1200, minStock: 200, purchasePrice: 65, sellingPrice: 85,  status: 'in_stock' },
  { id: 2, name: 'Sodium Hydroxide',   sku: 'TE-CHEM-002', category: 'Bases',    unit: 'kg',    dram: '25 kg',  origin: 'Saudi Arabia', stock: 850,  minStock: 150, purchasePrice: 48, sellingPrice: 65,  status: 'in_stock' },
  { id: 3, name: 'Hydrochloric Acid',  sku: 'TE-CHEM-003', category: 'Acids',    unit: 'liter', dram: '250L',   origin: 'India',        stock: 120,  minStock: 200, purchasePrice: 40, sellingPrice: 55,  status: 'low_stock' },
  { id: 4, name: 'Ethanol',            sku: 'TE-CHEM-004', category: 'Solvents', unit: 'liter', dram: '200L',   origin: 'Malaysia',     stock: 650,  minStock: 100, purchasePrice: 70, sellingPrice: 95,  status: 'in_stock' },
  { id: 5, name: 'Acetone',            sku: 'TE-CHEM-005', category: 'Solvents', unit: 'liter', dram: '160 kg', origin: 'India',        stock: 80,   minStock: 150, purchasePrice: 52, sellingPrice: 72,  status: 'low_stock' },
  { id: 6, name: 'Methanol',           sku: 'TE-CHEM-006', category: 'Solvents', unit: 'liter', dram: '200L',   origin: 'China',        stock: 430,  minStock: 100, purchasePrice: 35, sellingPrice: 48,  status: 'in_stock' },
  { id: 7, name: 'Nitric Acid',        sku: 'TE-CHEM-007', category: 'Acids',    unit: 'liter', dram: '250 kg', origin: 'Germany',      stock: 0,    minStock: 100, purchasePrice: 80, sellingPrice: 110, status: 'out_of_stock' },
  { id: 8, name: 'Calcium Carbonate',  sku: 'TE-CHEM-008', category: 'Salts',    unit: 'kg',    dram: '25 kg',  origin: 'Bangladesh',   stock: 2100, minStock: 300, purchasePrice: 22, sellingPrice: 32,  status: 'in_stock' },
]

const statusStyles: Record<string, { label: string; cls: string }> = {
  in_stock:     { label: 'In Stock',     cls: 'badge-success' },
  low_stock:    { label: 'Low Stock',    cls: 'badge-warning' },
  out_of_stock: { label: 'Out of Stock', cls: 'badge-danger' },
}

export default function ChemicalsPage() {
  const [chemicalsList, setChemicalsList] = useState(INITIAL_CHEMICALS)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', sku:'', category:'Acids', unit:'kg', minStock:'', dram:'', origin:'', purchasePrice:'', sellingPrice:'' })
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [editingChemical, setEditingChemical] = useState<typeof INITIAL_CHEMICALS[0] | null>(null)

  const handleDeleteChemical = (id: number) => {
    if (window.confirm('Are you sure you want to delete this chemical?')) {
      setChemicalsList(chemicalsList.filter(c => c.id !== id))
    }
  }

  const handleEditClick = (chem: typeof INITIAL_CHEMICALS[0]) => {
    setEditingChemical(chem)
    setForm({
      name: chem.name,
      sku: chem.sku,
      category: chem.category,
      unit: chem.unit,
      minStock: String(chem.minStock),
      dram: chem.dram || '',
      origin: chem.origin || '',
      purchasePrice: String(chem.purchasePrice || ''),
      sellingPrice: String(chem.sellingPrice || '')
    })
    setShowModal(true)
  }

  const handleAddClick = () => {
    setEditingChemical(null)
    setForm({ name: '', sku: '', category: 'Acids', unit: 'kg', minStock: '', dram: '', origin: '', purchasePrice: '', sellingPrice: '' })
    setShowModal(true)
  }

  const handleSaveChemical = () => {
    if (!form.name.trim()) {
      alert('Chemical Name is required.')
      return
    }
    if (editingChemical) {
      setChemicalsList(prev => prev.map(c => c.id === editingChemical.id ? {
        ...c,
        name: form.name.trim(),
        sku: form.sku.trim() || c.sku,
        category: form.category,
        unit: form.unit,
        minStock: Number(form.minStock) || 0,
        dram: form.dram.trim() || '—',
        origin: form.origin.trim() || '—',
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0
      } : c))
      alert('Chemical updated successfully! (Stored in-memory; connect Supabase for permanent storage)')
    } else {
      const newId = chemicalsList.length + 1
      const newSku = form.sku.trim() || `TE-CHEM-${String(newId).padStart(3, '0')}`
      const newChem = {
        id: newId,
        name: form.name.trim(),
        sku: newSku,
        category: form.category,
        unit: form.unit,
        dram: form.dram.trim() || '—',
        origin: form.origin.trim() || '—',
        stock: 0,
        minStock: Number(form.minStock) || 0,
        purchasePrice: Number(form.purchasePrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        status: 'out_of_stock' as const
      }
      setChemicalsList([...chemicalsList, newChem])
      alert('Chemical added successfully! (Stored in-memory; connect Supabase for permanent storage)')
    }
    setShowModal(false)
    setEditingChemical(null)
    setForm({ name: '', sku: '', category: 'Acids', unit: 'kg', minStock: '', dram: '', origin: '', purchasePrice: '', sellingPrice: '' })
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('titas_chemicals_list')
      if (saved) {
        try { setChemicalsList(JSON.parse(saved)); } catch (e) {}
      }
      setIsLoaded(true)
    }

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

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('titas_chemicals_list', JSON.stringify(chemicalsList))
    }
  }, [chemicalsList, isLoaded])

  const filtered = chemicalsList.filter(c =>
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
          <p className="page-subtitle">{chemicalsList.length} chemicals registered · {chemicalsList.filter(c=>c.status==='low_stock').length} low stock alerts</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleAddClick}>
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
        <CustomSelect
          value={category}
          onChange={setCategory}
          style={{ width: '160px' }}
          aria-label="Filter by category"
          options={[
            { value: '', label: 'All Categories' },
            ...['Acids','Bases','Solvents','Salts'].map(c => ({ value: c, label: c }))
          ]}
        />
        <div style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#64748B' }}>{filtered.length} results</div>
      </div>

      {/* Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Chemical Name</th><th>SKU</th><th>Category</th><th>Unit</th><th>Dram</th><th>Origin</th><th>Current Stock</th><th>Min Stock</th><th>Purchase Price (৳)</th><th>Sell Price (৳)</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={12}>
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
                <td>{c.dram || '—'}</td>
                <td>{c.origin || '—'}</td>
                <td className="num" style={{ fontWeight:600, color: c.status === 'low_stock' ? '#F59E0B' : c.status === 'out_of_stock' ? '#EF4444' : 'var(--text-primary)' }}>
                  {c.stock.toLocaleString()}
                </td>
                <td className="num" style={{ color:'#64748B' }}>{c.minStock.toLocaleString()}</td>
                <td className="num">৳{c.purchasePrice?.toLocaleString() || 0}</td>
                <td className="num">৳{c.sellingPrice?.toLocaleString() || 0}</td>
                <td><span className={`badge ${statusStyles[c.status].cls}`}>{statusStyles[c.status].label}</span></td>
                <td>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(c)} aria-label={`Edit ${c.name}`}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteChemical(c.id)} aria-label={`Delete ${c.name}`}>🗑️</button>
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
              <h2 id="modal-title" style={{ fontSize:'1.1rem', fontWeight:800 }}>{editingChemical ? 'Edit Chemical' : 'Add New Chemical'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowModal(false); setEditingChemical(null); }} aria-label="Close modal">✕</button>
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
                  <CustomSelect
                    id="chem-cat"
                    value={form.category}
                    onChange={v => setForm({...form, category: v})}
                    options={['Acids','Bases','Solvents','Salts'].map(c => ({ value: c, label: c }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="chem-unit" className="form-label">Unit *</label>
                  <CustomSelect
                    id="chem-unit"
                    value={form.unit}
                    onChange={v => setForm({...form, unit: v})}
                    options={['kg','liter','g','ml','ton'].map(u => ({ value: u, label: u }))}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="chem-min" className="form-label">Min Stock Alert</label>
                  <input id="chem-min" type="number" className="form-input" placeholder="100" value={form.minStock} onChange={e => setForm({...form, minStock:e.target.value})} />
                  <span className="form-hint">Alert when stock drops below this</span>
                </div>
                <div className="form-group">
                  <label htmlFor="chem-dram" className="form-label">Dram</label>
                  <input id="chem-dram" className="form-input" placeholder="e.g. 200 kg" value={form.dram} onChange={e => setForm({...form, dram:e.target.value})} />
                  <span className="form-hint">Packaging size / capacity</span>
                </div>
                <div className="form-group">
                  <label htmlFor="chem-origin" className="form-label">Origin</label>
                  <input id="chem-origin" className="form-input" placeholder="e.g. China" value={form.origin} onChange={e => setForm({...form, origin:e.target.value})} />
                  <span className="form-hint">Country of origin</span>
                </div>
                <div className="form-group">
                  <label htmlFor="chem-purchase" className="form-label">Purchase Price (৳)</label>
                  <input id="chem-purchase" type="number" className="form-input" placeholder="0" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice:e.target.value})} />
                  <span className="form-hint">Cost price per unit</span>
                </div>
                <div className="form-group">
                  <label htmlFor="chem-selling" className="form-label">Sell Price (৳)</label>
                  <input id="chem-selling" type="number" className="form-input" placeholder="0" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice:e.target.value})} />
                  <span className="form-hint">Selling price per unit</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setShowModal(false); setEditingChemical(null); }}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveChemical}
              >
                {editingChemical ? 'Save Changes' : 'Add Chemical'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
