'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const customers = [
  { id:1, name:'ACI Limited',           contact:'Rahim Ahmed',    phone:'+880 2 8836-5401', email:'procurement@aci-bd.com', city:'Dhaka',      totalOrders:18, totalSpent:412000, lastOrder:'2024-06-14', status:'active' },
  { id:2, name:'Square Pharmaceuticals', contact:'Karim Hossain',  phone:'+880 2 9895-6780', email:'purchase@squarepharma.com.bd', city:'Dhaka', totalOrders:12, totalSpent:298000, lastOrder:'2024-06-13', status:'active' },
  { id:3, name:'Renata Limited',         contact:'Fatema Khatun',  phone:'+880 2 7726-0600', email:'chem@renata.com',        city:'Dhaka',      totalOrders:9,  totalSpent:187500, lastOrder:'2024-06-12', status:'active' },
  { id:4, name:'BRAC',                   contact:'Amir Khan',      phone:'+880 2 9881-2180', email:'supply@brac.net',         city:'Dhaka',      totalOrders:7,  totalSpent:143000, lastOrder:'2024-06-11', status:'active' },
  { id:5, name:'Bashundhara Group',      contact:'Nasir Uddin',    phone:'+880 2 8822-6777', email:'purchase@bashundhara.com', city:'Narayanganj',totalOrders:5, totalSpent:98000,  lastOrder:'2024-05-28', status:'active' },
  { id:6, name:'Padma Chemicals',        contact:'Selim Mia',      phone:'+880 1811-223344', email:'padmachem@gmail.com',     city:'Chittagong', totalOrders:4,  totalSpent:76500,  lastOrder:'2024-05-15', status:'inactive' },
]

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<typeof customers[0] | null>(null)
  const [form, setForm] = useState({ name:'', contact:'', phone:'', email:'', city:'', address:'' })
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

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Customers</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Directory</h1>
          <p className="page-subtitle">{customers.length} customers · ৳{(customers.reduce((s,c)=>s+c.totalSpent,0)/1000).toFixed(0)}k total revenue</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setSelected(null); setShowAdd(true); }}>
              + Add Customer
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" placeholder="Search by company, contact or city..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#64748B' }}>{filtered.length} results</div>
      </div>

      {/* Customer Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:'1rem' }}>
        {filtered.map(c => (
          <div key={c.id} className="card glass-hover" style={{ cursor:'pointer' }} onClick={() => setSelected(c)}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                <div style={{ width:44, height:44, background:'linear-gradient(135deg,#2563EB,#06B6D4)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff', fontSize:'1.1rem' }}>
                  {c.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748B' }}>{c.city}</div>
                </div>
              </div>
              <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-muted'}`}>{c.status}</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', fontSize:'0.82rem', marginBottom:'1rem' }}>
              <div><span style={{ color:'#64748B' }}>Contact:</span> <span style={{ color:'var(--text-primary)' }}>{c.contact}</span></div>
              <div><span style={{ color:'#64748B' }}>Orders:</span> <strong style={{ color:'#60A5FA' }}>{c.totalOrders}</strong></div>
              <div><span style={{ color:'#64748B' }}>Phone:</span> <span style={{ color:'#94A3B8', fontSize:'0.78rem' }}>{c.phone}</span></div>
              <div><span style={{ color:'#64748B' }}>Total Spent:</span> <strong style={{ color:'#10B981' }}>৳{(c.totalSpent/1000).toFixed(0)}k</strong></div>
            </div>

            <div style={{ fontSize:'0.78rem', color:'#64748B', borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:'0.75rem', display:'flex', justifyContent:'space-between' }}>
              <span>Last order: {c.lastOrder}</span>
              <div style={{ display:'flex', gap:'0.4rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation(); window.open(`mailto:${c.email}`);}}>Email</button>
                <Link href={`/titas/sales?customer=${encodeURIComponent(c.name)}`} className="btn btn-ghost btn-sm" onClick={e=>e.stopPropagation()}>Orders</Link>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1' }}>
            <div className="empty-state">
              <div className="empty-icon">🏢</div>
              <h3>No customers found</h3>
              <p>Try adjusting your search or add a new customer</p>
              <button className="btn btn-primary btn-sm mt-4" onClick={()=>setShowAdd(true)}>Add Customer</button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Side Modal */}
      {selected && !showAdd && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="modal" style={{ maxWidth:'480px' }}>
            <div className="modal-header">
              <div style={{ display:'flex', alignItems:'center', gap:'0.875rem' }}>
                <div style={{ width:40, height:40, background:'linear-gradient(135deg,#2563EB,#06B6D4)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#fff' }}>{selected.name[0]}</div>
                <div>
                  <div style={{ fontWeight:800, color:'var(--text-primary)' }}>{selected.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'#64748B' }}>{selected.city}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                {[
                  ['Contact Person', selected.contact],
                  ['Phone', selected.phone],
                  ['Email', selected.email],
                  ['City', selected.city],
                  ['Total Orders', selected.totalOrders],
                  ['Total Revenue', `৳${selected.totalSpent.toLocaleString()}`],
                  ['Last Order', selected.lastOrder],
                  ['Status', selected.status],
                ].map(([label, val]) => (
                  <div key={label as string} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'0.75rem' }}>
                    <div style={{ fontSize:'0.7rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem' }}>{label}</div>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setSelected(null)}>Close</button>
              <Link href={`/titas/sales?customer=${encodeURIComponent(selected.name)}`} className="btn btn-primary">View Orders</Link>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{ maxWidth:'580px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>Add New Customer</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Company / Customer Name *</label>
                  <input className="form-input" placeholder="ACI Limited" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input className="form-input" placeholder="Rahim Ahmed" value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+880 2 xxxx-xxxx" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="purchase@company.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="Dhaka" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Full Address</label>
                  <textarea className="form-textarea" rows={2} placeholder="Street address, area..." value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={()=>{alert('Customer added! (Connect Supabase to persist)'); setShowAdd(false);}}>Add Customer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
