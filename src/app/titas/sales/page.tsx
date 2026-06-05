'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import CustomSelect from '@/components/CustomSelect'
import DatePicker from '@/components/DatePicker'

const INITIAL_SALES = [
  { id:'TE-2024-024', customer:'ACI Limited',           chemical:'Sulfuric Acid',     qty:500, unit:'kg',    buyPrice:85,  sellPrice:120, amount:60000, profit:17500, date:'2024-06-14', status:'paid' },
  { id:'TE-2024-023', customer:'Square Pharmaceuticals', chemical:'Ethanol',           qty:200, unit:'liter', buyPrice:95,  sellPrice:140, amount:28000, profit:9000,  date:'2024-06-13', status:'paid' },
  { id:'TE-2024-022', customer:'Renata Limited',         chemical:'Acetone',           qty:150, unit:'liter', buyPrice:72,  sellPrice:105, amount:15750, profit:4950,  date:'2024-06-12', status:'pending' },
  { id:'TE-2024-021', customer:'BRAC',                   chemical:'Sodium Hydroxide',  qty:300, unit:'kg',    buyPrice:65,  sellPrice:95,  amount:28500, profit:9000,  date:'2024-06-11', status:'paid' },
  { id:'TE-2024-020', customer:'Bashundhara Group',      chemical:'Methanol',          qty:800, unit:'liter', buyPrice:48,  sellPrice:72,  amount:57600, profit:19200, date:'2024-06-08', status:'paid' },
  { id:'TE-2024-019', customer:'Padma Chemicals',        chemical:'Hydrochloric Acid', qty:100, unit:'liter', buyPrice:55,  sellPrice:80,  amount:8000,  profit:2500,  date:'2024-06-05', status:'overdue' },
]

const statusStyle: Record<string,string> = { paid:'badge-success', pending:'badge-warning', overdue:'badge-danger', partial:'badge-info' }

export default function SalesPage() {
  const [salesList, setSalesList] = useState(INITIAL_SALES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ customer:'', chemical:'', qty:'', buyPrice:'', sellPrice:'', date:'', notes:'' })
  const [viewItem, setViewItem] = useState<typeof INITIAL_SALES[0]|null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setSalesList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    setViewItem(prev => {
      if (prev && prev.id === id) {
        return { ...prev, status: newStatus }
      }
      return prev
    })
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

      const params = new URLSearchParams(window.location.search);
      if (params.get('add') === 'true') {
        setShowNew(true);
      }
      const id = params.get('id');
      if (id) {
        const found = INITIAL_SALES.find(s => s.id === id);
        if (found) {
          setViewItem(found);
        }
      }
      const cust = params.get('customer');
      if (cust) {
        setSearch(cust);
      }
    }
  }, []);

  const filtered = salesList.filter(s =>
    (s.customer.toLowerCase().includes(search.toLowerCase()) || s.chemical.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? s.status === statusFilter : true)
  )

  const totalRevenue = filtered.reduce((s,x) => s + x.amount, 0)
  const totalProfit  = filtered.reduce((s,x) => s + x.profit, 0)

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Sales</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Orders</h1>
          <p className="page-subtitle">{salesList.length} total sales · ৳{(salesList.reduce((s,x)=>s+x.profit,0)/1000).toFixed(0)}k total profit this month</p>
        </div>
        <div className="page-actions">
          {isAdmin && <button className="btn btn-primary" onClick={()=>setShowNew(true)}>+ New Sale</button>}
          <button className="btn btn-ghost">Export</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Revenue',  value:`৳${(totalRevenue/1000).toFixed(1)}k`,  accent:'#2563EB' },
          { label:'Total Profit',   value:`৳${(totalProfit/1000).toFixed(1)}k`,   accent:'#10B981' },
          { label:'Avg Margin',     value:`${totalRevenue>0?((totalProfit/totalRevenue)*100).toFixed(1):0}%`, accent:'#06B6D4' },
          { label:'Pending',        value:`${salesList.filter(s=>s.status==='pending').length}`,  accent:'#F59E0B' },
          { label:'Overdue',        value:`${salesList.filter(s=>s.status==='overdue').length}`,  accent:'#EF4444' },
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
          <input className="form-input" placeholder="Search customer or chemical..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: '140px' }}
          options={[
            { value: '', label: 'All Status' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'overdue', label: 'Overdue' },
            { value: 'partial', label: 'Partial' },
          ]}
        />
        <div style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#64748B' }}>{filtered.length} orders</div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Date</th><th>Customer</th><th>Chemical</th><th>Qty</th><th>Amount (৳)</th><th>Profit (৳)</th><th>Margin</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sale => (
              <tr key={sale.id}>
                <td><span className="num" style={{ color:'#60A5FA', fontWeight:600, fontSize:'0.8rem' }}>{sale.id}</span></td>
                <td style={{ fontSize:'0.82rem' }}>{sale.date}</td>
                <td style={{ fontWeight:500, color:'var(--text-primary)' }}>{sale.customer}</td>
                <td>{sale.chemical}</td>
                <td className="num">{sale.qty} {sale.unit}</td>
                <td className="num" style={{ fontWeight:600, color:'var(--text-primary)' }}>৳{sale.amount.toLocaleString()}</td>
                <td className="num" style={{ color:'#10B981', fontWeight:700 }}>৳{sale.profit.toLocaleString()}</td>
                <td className="num" style={{ color:'#06B6D4' }}>{((sale.profit/sale.amount)*100).toFixed(1)}%</td>
                <td><span className={`badge ${statusStyle[sale.status]}`}>{sale.status}</span></td>
                <td>
                  <div style={{ display:'flex', gap:'0.4rem', alignItems:'center' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setViewItem(sale)}>View</button>
                    <CustomSelect
                      value={sale.status}
                      onChange={(newStatus) => handleUpdateStatus(sale.id, newStatus)}
                      style={{ width: '105px' }}
                      options={[
                        { value: 'paid', label: 'Paid' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'overdue', label: 'Overdue' },
                        { value: 'partial', label: 'Partial' },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Sale Modal */}
      {viewItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setViewItem(null)}>
          <div className="modal" style={{ maxWidth:'580px' }}>
            <div className="modal-header">
              <div>
                <div style={{ fontWeight:800, color:'var(--text-primary)' }}>{viewItem.customer}</div>
                <div style={{ fontSize:'0.78rem', color:'#64748B' }}>Order ID: {viewItem.id}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setViewItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                {[
                  ['Chemical Product', viewItem.chemical],
                  ['Quantity', `${viewItem.qty} ${viewItem.unit}`],
                  ['Buy Price', `৳${viewItem.buyPrice}/unit`],
                  ['Sell Price', `৳${viewItem.sellPrice}/unit`],
                  ['Total Amount', `৳${viewItem.amount.toLocaleString()}`],
                  ['Net Profit', `৳${viewItem.profit.toLocaleString()}`],
                  ['Profit Margin', `${((viewItem.profit/viewItem.amount)*100).toFixed(1)}%`],
                  ['Sale Date', viewItem.date],
                  ['Status', viewItem.status.toUpperCase()],
                ].map(([label,val]) => (
                  <div key={label as string} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'0.75rem' }}>
                    <div style={{ fontSize:'0.7rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem' }}>{label}</div>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color: label==='Net Profit' ? '#10B981' : label==='Status' && val==='OVERDUE' ? '#EF4444' : 'var(--text-primary)' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'1.5rem', background:'var(--surface2)', borderRadius:'10px', padding:'1rem', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.75rem' }}>Update Payment Status</div>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  {[
                    { value: 'paid', label: 'Paid' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'overdue', label: 'Overdue' },
                    { value: 'partial', label: 'Partial' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      className={`btn btn-sm ${viewItem.status === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => handleUpdateStatus(viewItem.id, opt.value)}
                      style={{ minWidth: '80px' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showNew && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div className="modal" style={{ maxWidth:'600px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>Record New Sale</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowNew(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Customer *</label>
                  <CustomSelect
                    value={form.customer}
                    onChange={v => setForm({...form, customer: v})}
                    placeholder="Select customer..."
                    style={{ width: '100%' }}
                    options={[
                      { value: '', label: 'Select customer...' },
                      ...['ACI Limited','Square Pharmaceuticals','Renata Limited','BRAC','Bashundhara Group','Padma Chemicals'].map(c => ({ value: c, label: c }))
                    ]}
                  />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Chemical *</label>
                  <CustomSelect
                    value={form.chemical}
                    onChange={v => setForm({...form, chemical: v})}
                    placeholder="Select chemical..."
                    style={{ width: '100%' }}
                    options={[
                      { value: '', label: 'Select chemical...' },
                      ...['Sulfuric Acid','Sodium Hydroxide','Hydrochloric Acid','Ethanol','Acetone','Methanol'].map(c => ({ value: c, label: c }))
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input type="number" className="form-input" placeholder="500" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sale Date</label>
                  <DatePicker value={form.date} onChange={v => setForm({...form, date: v})} placeholder="Select sale date" />
                </div>
                <div className="form-group">
                  <label className="form-label">Buy Price (৳/unit)</label>
                  <input type="number" className="form-input" placeholder="85" value={form.buyPrice} onChange={e=>setForm({...form,buyPrice:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sell Price (৳/unit) *</label>
                  <input type="number" className="form-input" placeholder="120" value={form.sellPrice} onChange={e=>setForm({...form,sellPrice:e.target.value})} />
                </div>
                {form.qty && form.sellPrice && (
                  <div style={{ gridColumn:'1/-1', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'10px', padding:'0.875rem', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', fontSize:'0.85rem' }}>
                    <div><div style={{ color:'#64748B', fontSize:'0.75rem' }}>Total Amount</div><div style={{ color:'var(--text-primary)', fontWeight:700, fontFamily:'var(--font-mono)' }}>৳{(+form.qty * +form.sellPrice).toLocaleString()}</div></div>
                    <div><div style={{ color:'#64748B', fontSize:'0.75rem' }}>Cost</div><div style={{ color:'#F59E0B', fontWeight:700, fontFamily:'var(--font-mono)' }}>৳{(+form.qty * (+form.buyPrice||0)).toLocaleString()}</div></div>
                    <div><div style={{ color:'#64748B', fontSize:'0.75rem' }}>Profit</div><div style={{ color:'#10B981', fontWeight:700, fontFamily:'var(--font-mono)' }}>৳{(+form.qty * (+form.sellPrice - +form.buyPrice)).toLocaleString()}</div></div>
                  </div>
                )}
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Notes</label>
                  <textarea className="form-textarea" rows={2} placeholder="Any special notes..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!form.customer || !form.chemical || !form.qty || !form.sellPrice) {
                    alert('Please fill out all required fields.');
                    return;
                  }
                  const newId = `TE-2024-0${salesList.length + 25}`;
                  const qtyNum = Number(form.qty) || 0;
                  const buyNum = Number(form.buyPrice) || 0;
                  const sellNum = Number(form.sellPrice) || 0;
                  const amount = qtyNum * sellNum;
                  const profit = qtyNum * (sellNum - buyNum);
                  const newSale = {
                    id: newId,
                    customer: form.customer,
                    chemical: form.chemical,
                    qty: qtyNum,
                    unit: 'kg',
                    buyPrice: buyNum,
                    sellPrice: sellNum,
                    amount: amount,
                    profit: profit,
                    date: form.date || new Date().toISOString().split('T')[0],
                    status: 'pending'
                  };
                  setSalesList([newSale, ...salesList]);
                  setShowNew(false);
                  setForm({ customer: '', chemical: '', qty: '', buyPrice: '', sellPrice: '', date: '', notes: '' });
                  alert('Sale recorded successfully! (Stored in-memory; connect Supabase for permanent storage)');
                }}
              >
                Record Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
