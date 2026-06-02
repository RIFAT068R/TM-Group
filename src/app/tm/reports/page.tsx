'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const monthlyData = [
  { month:'Jan', revenue:120000, expenses:75000, profit:45000, placements:8  },
  { month:'Feb', revenue:145000, expenses:88000, profit:57000, placements:10 },
  { month:'Mar', revenue:110000, expenses:70000, profit:40000, placements:7  },
  { month:'Apr', revenue:180000, expenses:105000,profit:75000, placements:14 },
  { month:'May', revenue:210000, expenses:120000,profit:90000, placements:16 },
  { month:'Jun', revenue:255000, expenses:140000,profit:115000,placements:12 },
]

const countryReport = [
  { country:'Saudi Arabia', workers:48, revenue:580000, fees:3240000 },
  { country:'UAE',          workers:35, revenue:420000, fees:1925000 },
  { country:'Qatar',        workers:22, revenue:264000, fees:1056000 },
  { country:'Kuwait',       workers:18, revenue:216000, fees:1260000 },
  { country:'Malaysia',     workers:12, revenue:144000, fees:504000  },
]

export default function TMReportsPage() {
  const [tab, setTab] = useState<'financial'|'country'|'placement'>('financial')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalRev   = monthlyData.reduce((s,m)=>s+m.revenue,0)
  const totalProfit= monthlyData.reduce((s,m)=>s+m.profit,0)
  const totalPlacements = monthlyData.reduce((s,m)=>s+m.placements,0)

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Reports</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Business Reports</h1>
          <p className="page-subtitle">Manpower placement &amp; revenue reporting</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-tm" onClick={()=>alert('PDF export — coming after jsPDF integration')}>
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Revenue (6mo)',   value:`৳${(totalRev/100000).toFixed(1)}L`,    accent:'#7C3AED' },
          { label:'Total Profit (6mo)',    value:`৳${(totalProfit/100000).toFixed(1)}L`,  accent:'#10B981' },
          { label:'Total Placements',      value:`${totalPlacements}`,                    accent:'#F59E0B' },
          { label:'Avg Profit Margin',     value:`${((totalProfit/totalRev)*100).toFixed(1)}%`, accent:'#06B6D4' },
          { label:'Active Workers',        value:'85',                                    accent:'#A78BFA' },
        ].map(k=>(
          <div key={k.label} className="kpi-card" style={{ '--kpi-accent':k.accent } as React.CSSProperties}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num" style={{ color:k.accent, fontSize:'1.3rem' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        {(['financial','country','placement'] as const).map(t=>(
          <button key={t} className="btn btn-ghost btn-sm" onClick={()=>setTab(t)}
            style={{ borderRadius:'8px 8px 0 0', borderBottom: tab===t ? '2px solid #7C3AED' : '2px solid transparent', color: tab===t ? '#A78BFA' : undefined, fontWeight: tab===t ? 700 : 500 }}>
            {t==='financial' ? '💰 Financial' : t==='country' ? '🌍 By Country' : '✈️ Placements'}
          </button>
        ))}
      </div>

      {tab==='financial' && (
        <>
          {/* Bar Chart — Revenue vs Expenses vs Profit */}
          <div className="chart-card" style={{ marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
              <div>
                <div className="chart-title">Monthly Revenue &amp; Profit</div>
                <div className="chart-subtitle">6-month financial overview across all placement operations</div>
              </div>
              <span className="chart-badge">H1 2026</span>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} barCategoryGap="28%" barGap={4}>
                  <defs>
                    <linearGradient id="tmRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                      <stop offset="100%" stopColor="#9D55FF" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="tmExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="tmProfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:12, fontWeight:500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`} width={52} />
                  <Tooltip
                    contentStyle={{ background:'#100E28', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'12px', fontSize:'0.78rem', boxShadow:'0 8px 32px rgba(0,0,0,0.3)', padding:'0.625rem 0.875rem' }}
                    formatter={(v:any, name:any)=>[`৳${v?.toLocaleString()}`, name]}
                    cursor={{ fill:'rgba(124,58,237,0.06)', radius:4 }}
                  />
                  <Legend wrapperStyle={{ fontSize:'0.78rem', color:'#94A3B8', paddingTop:'0.75rem' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="revenue"  name="Revenue"  fill="url(#tmRevGrad)"  radius={[6,6,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="url(#tmExpGrad)"  radius={[6,6,0,0]} />
                  <Bar dataKey="profit"   name="Profit"   fill="url(#tmProfGrad)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Area Chart — Placements Trend */}
          <div className="chart-card">
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
              <div>
                <div className="chart-title">Placements per Month</div>
                <div className="chart-subtitle">Monthly worker placement count across all international markets</div>
              </div>
              <span className="chart-badge" style={{ background:'rgba(167,139,250,0.12)', color:'#A78BFA', borderColor:'rgba(167,139,250,0.25)' }}>↑ Trend</span>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top:10, right:16, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="tmPlaceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#A78BFA" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip
                    contentStyle={{ background:'#100E28', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'12px', fontSize:'0.78rem', boxShadow:'0 8px 32px rgba(0,0,0,0.3)', padding:'0.625rem 0.875rem' }}
                    formatter={(v:any)=>[v, 'Placements']}
                    cursor={{ stroke:'#A78BFA', strokeWidth:1.5, strokeDasharray:'4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="placements"
                    name="Placements"
                    stroke="#A78BFA"
                    strokeWidth={3}
                    fill="url(#tmPlaceGrad)"
                    dot={{ fill:'#fff', stroke:'#7C3AED', strokeWidth:2.5, r:5 }}
                    activeDot={{ r:7, fill:'#7C3AED', stroke:'#fff', strokeWidth:2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}

      {tab==='country' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th>#</th><th>Country</th><th>Active Workers</th><th>Total Fees (৳)</th><th>Revenue (6mo)</th><th>Avg Fee/Worker</th></tr></thead>
            <tbody>
              {countryReport.map((c,i)=>(
                <tr key={c.country}>
                  <td style={{ color:'#64748B' }}>#{i+1}</td>
                  <td style={{ fontWeight:600, color:'var(--text-primary)' }}>🌍 {c.country}</td>
                  <td className="num" style={{ color:'#A78BFA' }}>{c.workers}</td>
                  <td className="num" style={{ color:'#10B981', fontWeight:700 }}>৳{c.fees.toLocaleString()}</td>
                  <td className="num" style={{ fontWeight:600 }}>৳{c.revenue.toLocaleString()}</td>
                  <td className="num">৳{(c.fees/c.workers).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='placement' && (
        <div className="card">
          <p style={{ textAlign:'center', color:'#64748B', padding:'3rem' }}>Detailed placement log will appear here once connected to Supabase. All placements with dates, agencies, and fees will be visible here with filter by date range.</p>
        </div>
      )}
    </div>
  )
}
