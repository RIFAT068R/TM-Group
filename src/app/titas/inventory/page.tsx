'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const inventoryItems = [
  { id:1, chemical:'Sulfuric Acid',     sku:'TE-CHEM-001', supplier:'ABC Chemicals Ltd', buyPrice:85,  sellPrice:120, stock:1200, unit:'kg',    lastRestock:'2024-05-20', nextRestock:'2024-07-15' },
  { id:2, chemical:'Sodium Hydroxide',  sku:'TE-CHEM-002', supplier:'XYZ Imports',       buyPrice:65,  sellPrice:95,  stock:850,  unit:'kg',    lastRestock:'2024-05-15', nextRestock:'2024-07-10' },
  { id:3, chemical:'Hydrochloric Acid', sku:'TE-CHEM-003', supplier:'ChemTrade BD',      buyPrice:55,  sellPrice:80,  stock:120,  unit:'liter', lastRestock:'2024-04-30', nextRestock:'2024-06-20' },
  { id:4, chemical:'Ethanol',           sku:'TE-CHEM-004', supplier:'Global Chem Co',    buyPrice:95,  sellPrice:140, stock:650,  unit:'liter', lastRestock:'2024-05-28', nextRestock:'2024-07-28' },
  { id:5, chemical:'Acetone',           sku:'TE-CHEM-005', supplier:'ABC Chemicals Ltd', buyPrice:72,  sellPrice:105, stock:80,   unit:'liter', lastRestock:'2024-05-01', nextRestock:'2024-06-18' },
  { id:6, chemical:'Methanol',          sku:'TE-CHEM-006', supplier:'XYZ Imports',       buyPrice:48,  sellPrice:72,  stock:430,  unit:'liter', lastRestock:'2024-05-10', nextRestock:'2024-07-05' },
]

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [showRestock, setShowRestock] = useState(false)
  const [selectedItem, setSelectedItem] = useState<typeof inventoryItems[0] | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkRole = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const email = data.user.email?.toLowerCase() || '';
        const role = data.user.user_metadata?.role || '';
        setIsAdmin(email === 'rrr78@gmail.com' || email === 'rrr782677@gmail.com' || email.includes('admin') || role === 'admin');
      } else {
        setIsAdmin(false);
      }
    };
    checkRole();
  }, []);

  const filtered = inventoryItems.filter(i =>
    i.chemical.toLowerCase().includes(search.toLowerCase()) ||
    i.supplier.toLowerCase().includes(search.toLowerCase())
  )

  const totalValue = inventoryItems.reduce((s, i) => s + i.buyPrice * i.stock, 0)
  const totalSellValue = inventoryItems.reduce((s, i) => s + i.sellPrice * i.stock, 0)

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/titas/chemicals">Chemicals</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Inventory</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track stock levels, costs & restock schedules</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setSelectedItem(null); setShowRestock(true); }}>
              + Restock Entry
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => alert('Export to Excel — coming after Supabase setup')}>Export</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Stock Value (Cost)',  value:`৳${(totalValue/1000).toFixed(0)}k`,     accent:'#2563EB' },
          { label:'Total Stock Value (Sell)',  value:`৳${(totalSellValue/1000).toFixed(0)}k`, accent:'#10B981' },
          { label:'Potential Profit',          value:`৳${((totalSellValue-totalValue)/1000).toFixed(0)}k`, accent:'#06B6D4' },
          { label:'Low Stock Items',           value:'3',                                     accent:'#F59E0B' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-accent':k.accent } as React.CSSProperties}>

            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num" style={{ color:k.accent, fontSize:'1.4rem' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" placeholder="Search chemical or supplier..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#64748B' }}>{filtered.length} items</div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Chemical</th><th>SKU</th><th>Supplier</th><th>Buy Price</th><th>Sell Price</th><th>Margin</th><th>Stock</th><th>Last Restock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const margin = (((item.sellPrice - item.buyPrice) / item.buyPrice) * 100).toFixed(1)
              const isLow = item.stock < 150
              return (
                <tr key={item.id}>
                  <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{item.chemical}</td>
                  <td><span className="num" style={{ fontSize:'0.78rem', color:'#64748B' }}>{item.sku}</span></td>
                  <td style={{ fontSize:'0.82rem' }}>{item.supplier}</td>
                  <td className="num">৳{item.buyPrice}/{item.unit}</td>
                  <td className="num" style={{ color:'#10B981', fontWeight:600 }}>৳{item.sellPrice}/{item.unit}</td>
                  <td className="num" style={{ color:'#06B6D4', fontWeight:700 }}>{margin}%</td>
                  <td className="num" style={{ color: isLow ? '#F59E0B' : 'var(--text-primary)', fontWeight:600 }}>
                    {item.stock.toLocaleString()} {item.unit}{isLow ? ' ⚠️' : ''}
                  </td>
                  <td style={{ fontSize:'0.8rem' }}>{item.lastRestock}</td>
                  <td>
                    {isAdmin ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedItem(item); setShowRestock(true); }}>+ Restock</button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Read Only</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {showRestock && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setShowRestock(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>
                {selectedItem ? `Restock: ${selectedItem.chemical}` : 'New Restock Entry'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowRestock(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                {!selectedItem && (
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">Chemical</label>
                    <select className="form-select">
                      {inventoryItems.map(i=><option key={i.id}>{i.chemical}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Quantity Received *</label>
                  <input type="number" className="form-input" placeholder="500" />
                </div>
                <div className="form-group">
                  <label className="form-label">Buy Price per Unit (৳) *</label>
                  <input type="number" className="form-input" placeholder={selectedItem?.buyPrice?.toString()} />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input className="form-input" placeholder={selectedItem?.supplier || 'Supplier name'} />
                </div>
                <div className="form-group">
                  <label className="form-label">Invoice / Bill No.</label>
                  <input className="form-input" placeholder="INV-2024-001" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" placeholder="Any notes about this restock..." rows={2} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowRestock(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>{alert('Restock saved! (Connect Supabase to persist)'); setShowRestock(false);}}>Save Restock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
