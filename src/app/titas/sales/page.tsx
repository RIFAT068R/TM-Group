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

interface SaleItem {
  id: string
  invoiceNumber?: string
  customer: string
  chemical: string
  qty: number
  unit: string
  buyPrice: number
  sellPrice: number
  amount: number
  profit: number
  date: string
  status: string
}

export default function SalesPage() {
  const [salesList, setSalesList] = useState<SaleItem[]>(INITIAL_SALES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ customer:'', chemical:'', qty:'', buyPrice:'', sellPrice:'', date:'', notes:'' })
  const [viewItem, setViewItem] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchSales = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data, error } = await supabase
      .from('titas_sales')
      .select('*, titas_customers(name), titas_sale_items(*, titas_chemicals(name, unit))')
    if (data && !error) {
      const mapped = data.map((s: any) => {
        const item = s.titas_sale_items?.[0]
        return {
          id: s.id,
          invoiceNumber: s.invoice_number,
          customer: s.titas_customers?.name || 'Unknown Customer',
          chemical: item?.titas_chemicals?.name || 'Unknown Chemical',
          qty: Number(item?.quantity) || 0,
          unit: item?.titas_chemicals?.unit || 'kg',
          buyPrice: Number(item?.purchase_price) || 0,
          sellPrice: Number(item?.unit_price) || 0,
          amount: Number(s.total) || 0,
          profit: Number(item?.profit) || 0,
          date: s.sale_date || '',
          status: s.status || 'pending'
        }
      })
      setSalesList(mapped)
      localStorage.setItem('titas_sales_list', JSON.stringify(mapped))
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setSalesList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
    setViewItem((prev: any) => {
      if (prev && prev.id === id) {
        return { ...prev, status: newStatus }
      }
      return prev
    })

    const { isSupabaseConfigured } = await import('@/lib/supabase/client')
    if (isSupabaseConfigured()) {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from('titas_sales')
        .update({ status: newStatus })
        .eq('id', id)
      if (error) {
        console.error('Failed to update status in Supabase:', error.message)
      }
    }
  }

  useEffect(() => {
    let channel: any

    const setupRealtime = async () => {
      const { isSupabaseConfigured, createClient } = await import('@/lib/supabase/client')
      
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('titas_sales_list')
        if (saved) {
          try { setSalesList(JSON.parse(saved)); } catch (e) {}
        }
        setIsLoaded(true)
      }

      if (isSupabaseConfigured()) {
        const supabase = createClient()
        fetchSales()

        channel = supabase
          .channel('titas-sales-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'titas_sales' },
            () => {
              fetchSales()
            }
          )
          .subscribe()
      }
    }

    setupRealtime()

    const checkRole = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        const role = (data.user.user_metadata?.role || data.user.app_metadata?.role || '').toLowerCase()
        setIsAdmin(role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }
    checkRole()

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('add') === 'true') {
        setShowNew(true)
      }
      const id = params.get('id')
      if (id) {
        const found = INITIAL_SALES.find(s => s.id === id)
        if (found) {
          setViewItem(found)
        }
      }
      const cust = params.get('customer')
      if (cust) {
        setSearch(cust)
      }
    }

    return () => {
      if (channel) {
        const { createClient } = require('@/lib/supabase/client')
        const supabase = createClient()
        supabase.removeChannel(channel)
      }
    }
  }, [])

  useEffect(() => {
    const { isSupabaseConfigured } = require('@/lib/supabase/client')
    if (isLoaded && !isSupabaseConfigured() && typeof window !== 'undefined') {
      localStorage.setItem('titas_sales_list', JSON.stringify(salesList))
    }
  }, [salesList, isLoaded])

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
                <td><span className="num" style={{ color:'#60A5FA', fontWeight:600, fontSize:'0.8rem' }}>{sale.invoiceNumber || (sale.id.length > 8 ? sale.id.slice(0, 8) : sale.id)}</span></td>
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
                onClick={async () => {
                  if (!form.customer || !form.chemical || !form.qty || !form.sellPrice) {
                    alert('Please fill out all required fields.');
                    return;
                  }

                  const { isSupabaseConfigured } = await import('@/lib/supabase/client');
                  if (!isSupabaseConfigured()) {
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
                    return;
                  }

                  const { createClient } = await import('@/lib/supabase/client');
                  const supabase = createClient();

                  let customerId = null;
                  const { data: customerData } = await supabase
                    .from('titas_customers')
                    .select('id')
                    .eq('name', form.customer)
                    .limit(1);

                  if (customerData && customerData.length > 0) {
                    customerId = customerData[0].id;
                  } else {
                    const { data: newCust, error: custErr } = await supabase
                      .from('titas_customers')
                      .insert({ name: form.customer, company: form.customer })
                      .select('id')
                      .single();
                    if (!custErr && newCust) {
                      customerId = newCust.id;
                    }
                  }

                  let chemicalId = null;
                  const { data: chemicalData } = await supabase
                    .from('titas_chemicals')
                    .select('id')
                    .eq('name', form.chemical)
                    .limit(1);

                  if (chemicalData && chemicalData.length > 0) {
                    chemicalId = chemicalData[0].id;
                  } else {
                    const { data: newChem, error: chemErr } = await supabase
                      .from('titas_chemicals')
                      .insert({ name: form.chemical, unit: 'kg' })
                      .select('id')
                      .single();
                    if (!chemErr && newChem) {
                      chemicalId = newChem.id;
                    }
                  }

                  const qtyNum = Number(form.qty) || 0;
                  const buyNum = Number(form.buyPrice) || 0;
                  const sellNum = Number(form.sellPrice) || 0;
                  const amount = qtyNum * sellNum;

                  const { data: newSale, error: saleErr } = await supabase
                    .from('titas_sales')
                    .insert({
                      customer_id: customerId,
                      status: 'pending',
                      sale_date: form.date || new Date().toISOString().split('T')[0],
                      total: amount
                    })
                    .select('id')
                    .single();

                  if (saleErr || !newSale) {
                    alert('Failed to save sale: ' + saleErr?.message);
                    return;
                  }

                  const { error: itemErr } = await supabase
                    .from('titas_sale_items')
                    .insert({
                      sale_id: newSale.id,
                      chemical_id: chemicalId,
                      quantity: qtyNum,
                      unit_price: sellNum,
                      purchase_price: buyNum
                    });

                  if (itemErr) {
                    alert('Failed to save sale items: ' + itemErr.message);
                    return;
                  }

                  setShowNew(false);
                  setForm({ customer: '', chemical: '', qty: '', buyPrice: '', sellPrice: '', date: '', notes: '' });
                  alert('Sale recorded successfully!');
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
