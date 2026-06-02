'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const suppliers = [
  { id: 1, name: 'China National Chemical Corp', contact: 'Zhang Wei', phone: '+86 10 5981-0000', email: 'export@cnchem.com', country: 'China', city: 'Beijing', chemicals: ['Sulfuric Acid', 'Hydrochloric Acid', 'Ethanol'], totalOrders: 24, totalValue: 1840000, lastOrder: '2024-06-10', status: 'active', paymentTerms: 'Net 60', leadTimeDays: 21 },
  { id: 2, name: 'BASF SE', contact: 'Hans Müller', phone: '+49 621 60-0', email: 'sales@basf.com', country: 'Germany', city: 'Ludwigshafen', chemicals: ['Sodium Hydroxide', 'Acetone', 'Methanol'], totalOrders: 18, totalValue: 2250000, lastOrder: '2024-06-08', status: 'active', paymentTerms: 'Net 30', leadTimeDays: 30 },
  { id: 3, name: 'Solvay Group', contact: 'Marc Dupont', phone: '+32 2 264-2111', email: 'chemicals@solvay.com', country: 'Belgium', city: 'Brussels', chemicals: ['Hydrogen Peroxide', 'Sodium Carbonate'], totalOrders: 11, totalValue: 980000, lastOrder: '2024-05-25', status: 'active', paymentTerms: 'Net 45', leadTimeDays: 28 },
  { id: 4, name: 'Indian Oil Chemical Ltd', contact: 'Rajesh Kumar', phone: '+91 22 2644-7616', email: 'chem@iocl.com', country: 'India', city: 'Mumbai', chemicals: ['Toluene', 'Xylene', 'Benzene'], totalOrders: 15, totalValue: 720000, lastOrder: '2024-06-01', status: 'active', paymentTerms: 'Net 30', leadTimeDays: 10 },
  { id: 5, name: 'Yara International', contact: 'Erik Larsen', phone: '+47 24 15 70 00', email: 'sales@yara.com', country: 'Norway', city: 'Oslo', chemicals: ['Ammonium Nitrate', 'Urea', 'Potassium Chloride'], totalOrders: 8, totalValue: 540000, lastOrder: '2024-05-18', status: 'active', paymentTerms: 'Net 60', leadTimeDays: 35 },
  { id: 6, name: 'Padma Industrial Chemicals', contact: 'Hasan Mia', phone: '+880 1711-334455', email: 'padma.ind@gmail.com', country: 'Bangladesh', city: 'Chittagong', chemicals: ['Citric Acid', 'Calcium Carbonate'], totalOrders: 6, totalValue: 185000, lastOrder: '2024-04-30', status: 'inactive', paymentTerms: 'Advance', leadTimeDays: 5 },
]

const COUNTRY_FLAGS: Record<string, string> = {
  'China': '🇨🇳', 'Germany': '🇩🇪', 'Belgium': '🇧🇪',
  'India': '🇮🇳', 'Norway': '🇳🇴', 'Bangladesh': '🇧🇩',
}

export default function SuppliersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<typeof suppliers[0] | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', country: '', city: '', chemicals: '', paymentTerms: '', leadTimeDays: '' })

  useEffect(() => {
    const checkRole = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        const email = data.user.email?.toLowerCase() || ''
        const role = data.user.user_metadata?.role || ''
        setIsAdmin(email === 'rrr78@gmail.com' || email === 'rrr782677@gmail.com' || email.includes('admin') || role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }
    checkRole()
  }, [])

  const filtered = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase()) ||
      s.chemicals.some(c => c.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalValue = suppliers.reduce((s, sup) => s + sup.totalValue, 0)
  const activeCount = suppliers.filter(s => s.status === 'active').length

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Suppliers</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Directory</h1>
          <p className="page-subtitle">{activeCount} active suppliers · ৳{(totalValue / 1000000).toFixed(2)}M total procurement value</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setSelected(null); setShowAdd(true) }}>
              + Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Suppliers', value: suppliers.length, color: 'var(--titas-primary)' },
          { label: 'Active', value: activeCount, color: '#10B981' },
          { label: 'Countries', value: new Set(suppliers.map(s => s.country)).size, color: '#6366F1' },
          { label: 'Procurement Value', value: '৳' + (totalValue / 1000000).toFixed(1) + 'M', color: '#F59E0B' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input"
          placeholder="Search suppliers, countries, chemicals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
        <select className="input" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Country</th>
                <th>Contact</th>
                <th>Chemicals Supplied</th>
                <th>Orders</th>
                <th>Total Value (৳)</th>
                <th>Lead Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sup => (
                <tr key={sup.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{sup.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sup.paymentTerms}</div>
                  </td>
                  <td>
                    <span>{COUNTRY_FLAGS[sup.country] || '🌐'} {sup.country}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sup.city}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{sup.contact}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sup.email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {sup.chemicals.map(c => (
                        <span key={c} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', background: 'var(--brand-accent-soft)', color: 'var(--titas-primary)', borderRadius: '99px', fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="num" style={{ fontWeight: 600 }}>{sup.totalOrders}</td>
                  <td className="num" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>৳{sup.totalValue.toLocaleString()}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: sup.leadTimeDays <= 10 ? '#10B981' : sup.leadTimeDays <= 21 ? '#F59E0B' : '#EF4444', fontWeight: 600 }}>
                      {sup.leadTimeDays}d
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${sup.status === 'active' ? 'success' : 'error'}`}>
                      {sup.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(sup)}>View</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No suppliers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title">{selected.name}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1.25rem 0' }}>
              {[
                ['Country', `${COUNTRY_FLAGS[selected.country] || '🌐'} ${selected.country}`],
                ['City', selected.city],
                ['Contact Person', selected.contact],
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['Payment Terms', selected.paymentTerms],
                ['Lead Time', `${selected.leadTimeDays} days`],
                ['Status', selected.status.charAt(0).toUpperCase() + selected.status.slice(1)],
                ['Total Orders', selected.totalOrders.toString()],
                ['Total Value', '৳' + selected.totalValue.toLocaleString()],
                ['Last Order', selected.lastOrder],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Chemicals Supplied</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selected.chemicals.map(c => (
                  <span key={c} style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', background: 'var(--brand-accent-soft)', color: 'var(--titas-primary)', borderRadius: '99px', fontWeight: 600 }}>{c}</span>
                ))}
              </div>
            </div>
            <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAdd && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Supplier</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: '0.875rem', padding: '1rem 0' }}>
              {(['name', 'contact', 'phone', 'email', 'country', 'city', 'chemicals', 'paymentTerms', 'leadTimeDays'] as const).map(field => (
                <div key={field}>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', textTransform: 'capitalize' }}>
                    {field === 'paymentTerms' ? 'Payment Terms' : field === 'leadTimeDays' ? 'Lead Time (days)' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === 'leadTimeDays' ? 'number' : 'text'}
                    className="input"
                    style={{ width: '100%' }}
                    placeholder={field === 'chemicals' ? 'e.g. Sulfuric Acid, Ethanol' : ''}
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer" style={{ marginTop: '0.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowAdd(false)}>Save Supplier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
