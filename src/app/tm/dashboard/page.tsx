'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const monthlyData = [
  { month: 'Jan', revenue: 120000, expenses: 75000, profit: 45000 },
  { month: 'Feb', revenue: 145000, expenses: 88000, profit: 57000 },
  { month: 'Mar', revenue: 110000, expenses: 70000, profit: 40000 },
  { month: 'Apr', revenue: 180000, expenses: 105000, profit: 75000 },
  { month: 'May', revenue: 210000, expenses: 120000, profit: 90000 },
  { month: 'Jun', revenue: 255000, expenses: 140000, profit: 115000 },
]

const countryData = [
  { country: 'Saudi Arabia', workers: 48 },
  { country: 'UAE',          workers: 35 },
  { country: 'Qatar',        workers: 22 },
  { country: 'Kuwait',       workers: 18 },
  { country: 'Malaysia',     workers: 12 },
]

const statusData = [
  { name: 'Working Abroad', value: 85 },
  { name: 'Processing',     value: 32 },
  { name: 'Returned',       value: 28 },
  { name: 'Visa Pending',   value: 15 },
]

const PIE_COLORS = ['#580282', '#8F39BA', '#222121', '#8E8D8C']

const recentWorkers = [
  { id: 'TM-2024-018', name: 'Md. Rahim Uddin', country: 'Saudi Arabia', agency: 'Al-Noor Recruitment', status: 'working',       date: '2024-06-10' },
  { id: 'TM-2024-017', name: 'Abdul Karim',     country: 'UAE',          agency: 'Gulf Connect',        status: 'departed',      date: '2024-06-08' },
  { id: 'TM-2024-016', name: 'Fatema Begum',    country: 'Qatar',        agency: 'Middle East HR',      status: 'processing',    date: '2024-06-05' },
  { id: 'TM-2024-015', name: 'Md. Hasan Ali',   country: 'Kuwait',       agency: 'Kuwait Manpower',     status: 'visa_approved', date: '2024-06-03' },
]

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div style={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', padding:'0.75rem 1rem', fontSize:'0.8rem', boxShadow:'var(--shadow-lg)' }}>
        <p style={{ color:'var(--text-primary)', marginBottom:'0.4rem', fontWeight:600 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.stroke || p.fill, fontWeight:700 }}>
            {p.name}: ৳{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// KPI config - simplified, clean layout without icons
const kpiConfig = [
  {
    label: 'Active Workers',
    value: '85',
    delta: '+7 this month',
    up: true,
    highlight: true,
  },
  {
    label: 'New Placements',
    value: '12',
    delta: '+4 vs last mo',
    up: true,
    highlight: false,
  },
  {
    label: 'Monthly Revenue',
    value: '৳2,55,000',
    delta: '+21%',
    up: true,
    highlight: false,
  },
  {
    label: 'Pending Visas',
    value: '15',
    delta: '3 expiring soon',
    up: false,
    highlight: false,
  },
  {
    label: 'Active Agencies',
    value: '23',
    delta: '+2 new',
    up: true,
    highlight: false,
  },
  {
    label: 'Profit Margin',
    value: '45.1%',
    delta: '+3.2%',
    up: true,
    highlight: false,
  },
]

export default function TMDashboard() {
  const [greeting, setGreeting] = useState('')
  const [animateKpis, setAnimateKpis] = useState(false)
  const [chartAccent, setChartAccent] = useState('#580282')
  const [chartDark,   setChartDark]   = useState('#222121')
  const [chartMuted,  setChartMuted]  = useState('#8E8D8C')
  const [mounted, setMounted] = useState(false)

  const readChartColors = () => {
    const style = getComputedStyle(document.documentElement)
    const acc = style.getPropertyValue('--brand-accent').trim()
    const drk = style.getPropertyValue('--text-primary').trim()
    const mut = style.getPropertyValue('--text-muted').trim()
    if (acc) setChartAccent(acc)
    if (drk) setChartDark(drk)
    if (mut) setChartMuted(mut)
  }

  useEffect(() => {
    setMounted(true)
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    setTimeout(() => setAnimateKpis(true), 100)
    readChartColors()
    const observer = new MutationObserver(readChartColors)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div>
      <nav className="breadcrumb mb-4" aria-label="Breadcrumb">
        <span>TM Overseas</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Dashboard</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, Admin</h1>
          <p className="page-subtitle">Manpower management overview · {new Date().toLocaleDateString('en-BD', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <div className="page-actions">
          <Link href="/tm/workers?viewMode=table" className="btn btn-ghost">View Placements</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid mb-6">
        {kpiConfig.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card ${kpi.highlight ? 'kpi-highlight' : ''} animate-up animate-up-delay-${Math.min(i+1,4)}`}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value num" style={{ opacity: animateKpis ? 1 : 0.4, transition:'opacity 0.5s' }}>{kpi.value}</div>
            <div className={`kpi-delta ${kpi.up ? 'up' : 'down'}`}>
              {kpi.up ? '↑' : '↓'} {kpi.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Revenue &amp; Profit Trend</div>
          <div className="chart-subtitle">Last 6 months performance</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top:5, right:10, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="tmRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartAccent} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={chartAccent} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="tmProfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartDark} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={chartDark} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: chartMuted, fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartMuted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={chartAccent} strokeWidth={2.5} fill="url(#tmRevGrad)" activeDot={{ r:5, fill:chartAccent }} />
                <Area type="monotone" dataKey="profit"  name="Profit"  stroke={chartDark}   strokeWidth={2}   fill="url(#tmProfGrad)" activeDot={{ r:4, fill:chartDark }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Worker Status</div>
          <div className="chart-subtitle">Current placement status</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginTop:'0.25rem' }}>
            {statusData.map((s, i) => (
              <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.78rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color:'var(--text-secondary)' }}>{s.name}</span>
                </div>
                <span style={{ color:'var(--text-primary)', fontWeight:700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ marginBottom:'1rem' }}>
        <div className="chart-card">
          <div className="chart-title">Workers by Destination</div>
          <div className="chart-subtitle">Top placement countries</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={countryData} layout="vertical" margin={{ top:0, right:10, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: chartMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="country" tick={{ fill: chartMuted, fontSize:11 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'0.78rem' }} cursor={{ fill:'var(--surface2)' }} />
                <Bar dataKey="workers" name="Workers" radius={[0,6,6,0]}>
                  {countryData.map((_, i) => (
                    <Cell key={i} fill={chartAccent} fillOpacity={1 - i * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Placements */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div>
            <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'0.15rem' }}>Recent Placements</h3>
            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', margin:0 }}>Latest worker placements</p>
          </div>
          <Link href="/tm/workers?viewMode=table" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Placement ID</th><th>Worker</th><th>Country</th>
                <th>Agency</th><th>Status</th><th>Date</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentWorkers.map(w => (
                <tr key={w.id}>
                  <td><span className="num" style={{ color:'var(--tm-primary)', fontWeight:600, fontSize:'0.8rem' }}>{w.id}</span></td>
                  <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{w.name}</td>
                  <td>{w.country}</td>
                  <td style={{ fontSize:'0.82rem' }}>{w.agency}</td>
                  <td>
                    <span className={`badge ${
                      w.status === 'working' ? 'badge-success' :
                      w.status === 'processing' ? 'badge-warning' :
                      w.status === 'visa_approved' ? 'badge-info' : 'badge-muted'
                    }`} style={{ textTransform:'capitalize' }}>
                      {w.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize:'0.8rem' }}>{w.date}</td>
                  <td><Link href={`/tm/workers?view=${encodeURIComponent(w.name)}`} className="btn btn-ghost btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
