'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const placements = [
  { id:'TM-2024-018', worker:'Md. Rahim Uddin',  passport:'AB1234567', country:'Saudi Arabia', agency:'Al-Noor Recruitment',  position:'Construction Worker', salary:'SAR 1,200/mo', fee:65000, departureDate:'2024-05-10', status:'working',      visaExpiry:'2026-05-09', passportExpiry:'2027-03-15' },
  { id:'TM-2024-017', worker:'Abdul Karim',       passport:'BC2345678', country:'UAE',          agency:'Gulf Connect BD',       position:'Driver',              salary:'AED 1,500/mo', fee:55000, departureDate:'2024-05-08', status:'working',      visaExpiry:'2026-05-07', passportExpiry:'2026-08-22' },
  { id:'TM-2024-016', worker:'Fatema Begum',      passport:'CD3456789', country:'Qatar',        agency:'Middle East HR',        position:'Housemaid',           salary:'QAR 900/mo',   fee:48000, departureDate:'',           status:'processing',   visaExpiry:'',           passportExpiry:'2028-01-10' },
  { id:'TM-2024-015', worker:'Md. Hasan Ali',     passport:'DE4567890', country:'Kuwait',       agency:'Kuwait Manpower Co.',   position:'Technician',          salary:'KWD 180/mo',   fee:70000, departureDate:'',           status:'visa_approved',visaExpiry:'',           passportExpiry:'2025-12-05' },
  { id:'TM-2024-014', worker:'Sumaiya Khatun',    passport:'EF5678901', country:'Malaysia',     agency:'SEA Recruitment',       position:'Factory Worker',      salary:'MYR 1,300/mo', fee:42000, departureDate:'2024-01-20', status:'returned',     visaExpiry:'',           passportExpiry:'2026-06-18' },
  { id:'TM-2024-013', worker:'Md. Kamal Hossain', passport:'FG6789012', country:'Saudi Arabia', agency:'Al-Noor Recruitment',   position:'Electrician',         salary:'SAR 1,500/mo', fee:68000, departureDate:'2024-02-15', status:'working',      visaExpiry:'2026-02-14', passportExpiry:'2027-09-30' },
]

const statusCls: Record<string,string> = {
  working:'badge-success', processing:'badge-warning', visa_approved:'badge-info', returned:'badge-muted', departed:'badge-info',
}

export default function PlacementsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [viewItem, setViewItem] = useState<typeof placements[0]|null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
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

      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        const found = placements.find(p => p.id === id);
        if (found) {
          setViewItem(found);
        }
      }
    }
  }, []);

  const filtered = placements.filter(p =>
    (p.worker.toLowerCase().includes(search.toLowerCase()) || p.country.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? p.status===statusFilter : true)
  )

  const isExpiringSoon = (d:string) => d && (new Date(d).getTime() - Date.now()) / (1000*60*60*24) < 90

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Placements</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Placement Records</h1>
          <p className="page-subtitle">{placements.filter(p=>p.status==='working').length} currently working abroad · {placements.filter(p=>p.status==='processing').length} in progress</p>
        </div>
        <div className="page-actions">
          {isAdmin && <button className="btn btn-tm" onClick={()=>setShowNew(true)}>+ New Placement</button>}
          <button className="btn btn-ghost">Export</button>
        </div>
      </div>

      {/* Expiry Alerts */}
      {placements.some(p => isExpiringSoon(p.visaExpiry) || isExpiringSoon(p.passportExpiry)) && (
        <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'12px', padding:'1rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
          <span style={{ fontSize:'1.25rem' }}>🚨</span>
          <div>
            <div style={{ fontWeight:700, color:'#FCA5A5', marginBottom:'0.35rem' }}>Document Expiry Alerts</div>
            <div style={{ fontSize:'0.82rem', color:'#94A3B8' }}>
              {placements.filter(p=>isExpiringSoon(p.visaExpiry)).map(p=>(
                <div key={p.id}>⚠️ <strong>{p.worker}</strong> — Visa expires {p.visaExpiry}</div>
              ))}
              {placements.filter(p=>isExpiringSoon(p.passportExpiry)).map(p=>(
                <div key={p.id}>🛂 <strong>{p.worker}</strong> — Passport expires {p.passportExpiry}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" placeholder="Search worker or country..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width:'160px' }} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['working','processing','visa_approved','departed','returned'].map(s=><option key={s}>{s}</option>)}
        </select>
        <div style={{ marginLeft:'auto', fontSize:'0.82rem', color:'#64748B' }}>{filtered.length} records</div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th><th>Worker</th><th>Country</th><th>Agency</th><th>Position</th><th>Salary</th><th>Fee (৳)</th><th>Status</th><th>Visa Expiry</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td><span className="num" style={{ color:'#A78BFA', fontWeight:600, fontSize:'0.8rem' }}>{p.id}</span></td>
                <td style={{ fontWeight:600, color:'var(--text-primary)' }}>{p.worker}</td>
                <td>{p.country}</td>
                <td style={{ fontSize:'0.82rem' }}>{p.agency}</td>
                <td style={{ fontSize:'0.82rem' }}>{p.position}</td>
                <td className="num" style={{ fontSize:'0.82rem', color:'#10B981' }}>{p.salary}</td>
                <td className="num" style={{ fontWeight:600 }}>৳{p.fee.toLocaleString()}</td>
                <td><span className={`badge ${statusCls[p.status]||'badge-muted'}`}>{p.status.replace('_',' ')}</span></td>
                <td style={{ fontSize:'0.8rem', color: isExpiringSoon(p.visaExpiry) ? '#EF4444' : '#94A3B8' }}>
                  {p.visaExpiry || '—'} {isExpiringSoon(p.visaExpiry) ? '⚠️' : ''}
                </td>
                <td>
                  <div style={{ display:'flex', gap:'0.3rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setViewItem(p)}>View</button>
                    <button className="btn btn-ghost btn-sm">Docs 📁</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Placement Modal */}
      {viewItem && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setViewItem(null)}>
          <div className="modal" style={{ maxWidth:'580px' }}>
            <div className="modal-header">
              <div>
                <div style={{ fontWeight:800, color:'var(--text-primary)' }}>{viewItem.worker}</div>
                <div style={{ fontSize:'0.78rem', color:'#64748B' }}>{viewItem.id} · {viewItem.country}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={()=>setViewItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                {[
                  ['Passport No.', viewItem.passport],
                  ['Status', viewItem.status.replace('_',' ')],
                  ['Destination', viewItem.country],
                  ['Agency', viewItem.agency],
                  ['Position', viewItem.position],
                  ['Monthly Salary', viewItem.salary],
                  ['Placement Fee', `৳${viewItem.fee.toLocaleString()}`],
                  ['Departure Date', viewItem.departureDate || 'Not yet'],
                  ['Visa Expiry', viewItem.visaExpiry || 'N/A'],
                  ['Passport Expiry', viewItem.passportExpiry],
                ].map(([label,val]) => (
                  <div key={label as string} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'0.75rem' }}>
                    <div style={{ fontSize:'0.7rem', color:'#64748B', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.25rem' }}>{label}</div>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color: (label==='Visa Expiry'||label==='Passport Expiry') && isExpiringSoon(val as string) ? '#EF4444' : 'var(--text-primary)' }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'1rem', padding:'0.875rem', background:'rgba(124,58,237,0.06)', borderRadius:'10px', border:'1px solid rgba(124,58,237,0.15)', fontSize:'0.82rem', color:'#94A3B8' }}>
                📁 <strong style={{ color:'#A78BFA' }}>Documents:</strong> Passport copy, visa, medical report, training certificate. Click "Docs" to view all uploaded files in Google Drive.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setViewItem(null)}>Close</button>
              {isAdmin && <button className="btn btn-tm">Upload Document 📁</button>}
            </div>
          </div>
        </div>
      )}

      {/* New Placement Modal */}
      {showNew && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div className="modal" style={{ maxWidth:'600px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>New Placement Record</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowNew(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Worker *</label>
                  <select className="form-select">
                    <option>Select worker...</option>
                    {['Md. Rahim Uddin','Abdul Karim','Fatema Begum','Md. Hasan Ali'].map(w=><option key={w}>{w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input className="form-input" placeholder="Saudi Arabia" />
                </div>
                <div className="form-group">
                  <label className="form-label">Agency *</label>
                  <select className="form-select">
                    <option>Select agency...</option>
                    {['Al-Noor Recruitment','Gulf Connect BD','Middle East HR','Kuwait Manpower Co.'].map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Position / Job Type</label>
                  <input className="form-input" placeholder="Construction Worker" />
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Salary</label>
                  <input className="form-input" placeholder="SAR 1,200/mo" />
                </div>
                <div className="form-group">
                  <label className="form-label">Placement Fee (৳)</label>
                  <input type="number" className="form-input" placeholder="65000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Visa Expiry Date</label>
                  <input type="date" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Departure Date</label>
                  <input type="date" className="form-input" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
              <button className="btn btn-tm" onClick={()=>{alert('Placement saved! (Connect Supabase to persist)'); setShowNew(false);}}>Save Placement</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
