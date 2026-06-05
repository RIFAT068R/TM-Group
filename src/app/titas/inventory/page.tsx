'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'

interface InventoryItem {
  id: any
  chemical: string
  sku: string
  supplier: string
  buyPrice: number
  sellPrice: number
  stock: number
  minStock: number
  unit: string
  dram: string
  origin: string
  status: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [showRestock, setShowRestock] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockQty, setRestockQty] = useState('')
  const [restockBuyPrice, setRestockBuyPrice] = useState('')
  const [restockSupplier, setRestockSupplier] = useState('')
  const [restockNote, setRestockNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const fetchInventory = async () => {
    try {
      const { createClient, isSupabaseConfigured } = await import('@/lib/supabase/client')
      if (!isSupabaseConfigured()) return
      const supabase = createClient()
      const { data, error } = await supabase
        .from('titas_chemicals')
        .select('*, titas_categories(name)')
        .order('name')

      if (error) throw new Error(error.message)
      if (data) {
        const mapped: InventoryItem[] = data.map((c: any) => ({
          id: c.id,
          chemical: c.name,
          sku: c.cas_number || '',
          supplier: c.supplier || '—',
          buyPrice: Number(c.purchase_price) || 0,
          sellPrice: Number(c.selling_price) || 0,
          stock: Number(c.current_stock) || 0,
          minStock: Number(c.min_stock_level) || 0,
          unit: c.unit || 'kg',
          dram: c.dram || '—',
          origin: c.origin_country || '—',
          status: Number(c.current_stock) <= 0 ? 'out_of_stock'
                : Number(c.current_stock) < Number(c.min_stock_level) ? 'low_stock' : 'in_stock',
        }))
        setItems(mapped)
        try { localStorage.setItem('titas_inventory_items', JSON.stringify(mapped)) } catch (e) {}
      }
    } catch (err: any) {
      console.error('Inventory fetch error:', err.message)
      try {
        const cached = localStorage.getItem('titas_inventory_items')
        if (cached) setItems(JSON.parse(cached))
      } catch (e) {}
    }
  }

  const handleSaveRestock = async () => {
    if (!selectedItem || !restockQty) {
      alert('Please select a chemical and enter quantity.')
      return
    }
    setIsSaving(true)
    try {
      const { createClient, isSupabaseConfigured } = await import('@/lib/supabase/client')
      if (!isSupabaseConfigured()) {
        // Local update
        const addQty = Number(restockQty)
        setItems(prev => prev.map(i => i.id === selectedItem.id
          ? { ...i, stock: i.stock + addQty, buyPrice: restockBuyPrice ? Number(restockBuyPrice) : i.buyPrice }
          : i))
        setShowRestock(false); resetForm()
        return
      }

      const supabase = createClient()
      const newStock = selectedItem.stock + Number(restockQty)
      const updateData: Record<string, any> = { current_stock: newStock }
      if (restockBuyPrice) updateData.purchase_price = Number(restockBuyPrice)
      if (restockSupplier) updateData.supplier = restockSupplier

      const { error } = await supabase
        .from('titas_chemicals')
        .update(updateData)
        .eq('id', selectedItem.id)

      if (error) throw new Error(error.message)
      await fetchInventory()
      setShowRestock(false); resetForm()
    } catch (err: any) {
      alert('Failed to save restock: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setRestockQty(''); setRestockBuyPrice(''); setRestockSupplier(''); setRestockNote('')
    setSelectedItem(null)
  }

  useEffect(() => {
    // Load from cache first
    try {
      const cached = localStorage.getItem('titas_inventory_items')
      if (cached) setItems(JSON.parse(cached))
    } catch (e) {}

    let channel: any
    const setup = async () => {
      const { isSupabaseConfigured, createClient } = await import('@/lib/supabase/client')
      if (isSupabaseConfigured()) {
        await fetchInventory()
        const supabase = createClient()
        channel = supabase
          .channel('titas-inventory-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'titas_chemicals' }, () => fetchInventory())
          .subscribe()
      }
    }
    setup()
    return () => {
      if (channel) import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel))
    }
  }, [])

  const filtered = items.filter(i =>
    i.chemical.toLowerCase().includes(search.toLowerCase()) ||
    i.supplier.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  )

  const totalBuyValue  = items.reduce((s, i) => s + i.buyPrice  * i.stock, 0)
  const totalSellValue = items.reduce((s, i) => s + i.sellPrice * i.stock, 0)
  const lowStockItems  = items.filter(i => i.status === 'low_stock').length
  const outOfStock     = items.filter(i => i.status === 'out_of_stock').length

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
          <p className="page-subtitle">Live stock levels, costs & restock schedules</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setSelectedItem(null); setShowRestock(true) }}>
            + Restock Entry
          </button>
          <button className="btn btn-ghost" onClick={() => {
            const headers = ['Chemical', 'SKU', 'Unit', 'Stock', 'Min Stock', 'Buy Price', 'Sell Price', 'Status', 'Origin']
            const rows = items.map(i => [i.chemical, i.sku, i.unit, i.stock, i.minStock, i.buyPrice, i.sellPrice, i.status, i.origin])
            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url
            a.download = `Titas_Inventory_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a); a.click(); document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}>Export CSV</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Stock Value (Cost)',  value: `৳${(totalBuyValue / 1000).toFixed(0)}k`,        accent: '#2563EB' },
          { label: 'Stock Value (Sell)',  value: `৳${(totalSellValue / 1000).toFixed(0)}k`,       accent: '#10B981' },
          { label: 'Potential Profit',    value: `৳${((totalSellValue - totalBuyValue) / 1000).toFixed(0)}k`, accent: '#06B6D4' },
          { label: 'Low Stock Alerts',    value: String(lowStockItems),                            accent: '#F59E0B' },
          { label: 'Out of Stock',        value: String(outOfStock),                              accent: '#EF4444' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ '--kpi-accent': k.accent } as React.CSSProperties}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num" style={{ color: k.accent, fontSize: '1.4rem' }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" placeholder="Search chemical, SKU or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748B' }}>{filtered.length} items</div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <h3 style={{ margin: '0 0 0.5rem' }}>No inventory data</h3>
          <p style={{ margin: 0 }}>Add chemicals from the <Link href="/titas/chemicals" style={{ color: 'var(--brand-accent)' }}>Chemicals page</Link> to manage inventory.</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Chemical</th><th>SKU</th><th>Origin</th><th>Buy Price</th>
                <th>Sell Price</th><th>Margin</th><th>Stock</th><th>Min Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const margin = item.buyPrice > 0 ? (((item.sellPrice - item.buyPrice) / item.buyPrice) * 100).toFixed(1) : '—'
                const isLow = item.status === 'low_stock'
                const isOut = item.status === 'out_of_stock'
                const statusMap: Record<string, string> = { in_stock: 'badge-success', low_stock: 'badge-warning', out_of_stock: 'badge-danger' }
                const statusLabel: Record<string, string> = { in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' }
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.chemical}</td>
                    <td><span className="num" style={{ fontSize: '0.78rem', color: '#64748B' }}>{item.sku}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{item.origin}</td>
                    <td className="num">৳{item.buyPrice}/{item.unit}</td>
                    <td className="num" style={{ color: '#10B981', fontWeight: 600 }}>৳{item.sellPrice}/{item.unit}</td>
                    <td className="num" style={{ color: '#06B6D4', fontWeight: 700 }}>{margin}%</td>
                    <td className="num" style={{ color: isOut ? '#EF4444' : isLow ? '#F59E0B' : 'var(--text-primary)', fontWeight: 600 }}>
                      {item.stock.toLocaleString()} {item.unit}{isLow ? ' ⚠️' : ''}{isOut ? ' ❌' : ''}
                    </td>
                    <td className="num" style={{ color: '#64748B' }}>{item.minStock.toLocaleString()}</td>
                    <td><span className={`badge ${statusMap[item.status] || 'badge-info'}`}>{statusLabel[item.status] || item.status}</span></td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedItem(item); setRestockBuyPrice(String(item.buyPrice)); setRestockSupplier(item.supplier !== '—' ? item.supplier : ''); setShowRestock(true) }}>
                        + Restock
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Restock Modal */}
      {showRestock && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && setShowRestock(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {selectedItem ? `Restock: ${selectedItem.chemical}` : 'New Restock Entry'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => { setShowRestock(false); resetForm() }}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {!selectedItem && (
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Chemical *</label>
                    <CustomSelect
                      value=""
                      onChange={v => { const found = items.find(i => i.chemical === v); if (found) setSelectedItem(found) }}
                      options={items.map(i => ({ value: i.chemical, label: i.chemical }))}
                      placeholder="Select chemical..."
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
                {selectedItem && (
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label className="form-label">Current Stock</label>
                    <div style={{ padding: '0.5rem 0.75rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {selectedItem.stock.toLocaleString()} {selectedItem.unit}
                    </div>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Quantity Received *</label>
                  <input type="number" className="form-input" placeholder="e.g. 500" value={restockQty} onChange={e => setRestockQty(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Buy Price per Unit (৳)</label>
                  <input type="number" className="form-input" placeholder={selectedItem?.buyPrice?.toString() || '0'} value={restockBuyPrice} onChange={e => setRestockBuyPrice(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input className="form-input" placeholder="Supplier name" value={restockSupplier} onChange={e => setRestockSupplier(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <input className="form-input" placeholder="Any notes..." value={restockNote} onChange={e => setRestockNote(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setShowRestock(false); resetForm() }} disabled={isSaving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveRestock} disabled={isSaving} style={{ minWidth: '120px' }}>
                {isSaving ? '⏳ Saving...' : '✓ Save Restock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
