'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// ── Mock data ──
const monthlyData = [
  { month: 'Jan', revenue: 185000, cost: 120000, profit: 65000 },
  { month: 'Feb', revenue: 210000, cost: 140000, profit: 70000 },
  { month: 'Mar', revenue: 175000, cost: 115000, profit: 60000 },
  { month: 'Apr', revenue: 240000, cost: 155000, profit: 85000 },
  { month: 'May', revenue: 295000, cost: 180000, profit: 115000 },
  { month: 'Jun', revenue: 320000, cost: 200000, profit: 120000 },
]

const topChemicals = [
  { name: 'Sulfuric Acid',     sold: 4500 },
  { name: 'Sodium Hydroxide',  sold: 3200 },
  { name: 'Hydrochloric Acid', sold: 2800 },
  { name: 'Ethanol',           sold: 2100 },
  { name: 'Acetone',           sold: 1600 },
]

const categoryData = [
  { name: 'Acids',    value: 42 },
  { name: 'Solvents', value: 28 },
  { name: 'Bases',    value: 18 },
  { name: 'Salts',    value: 12 },
]

const CATEGORY_COLORS = ['#580282', '#8F39BA', '#222121', '#8E8D8C']

const recentSales = [
  { id: 'TE-2024-024', customer: 'ACI Limited',   chemical: 'Sulfuric Acid', qty: '500 kg', amount: 45000, date: '2024-06-14', profit: 12000 },
  { id: 'TE-2024-023', customer: 'Square Pharma', chemical: 'Ethanol',       qty: '200 L',  amount: 32000, date: '2024-06-13', profit: 8500 },
  { id: 'TE-2024-022', customer: 'Renata Ltd',    chemical: 'Acetone',       qty: '150 L',  amount: 18000, date: '2024-06-12', profit: 5200 },
  { id: 'TE-2024-021', customer: 'BRAC',          chemical: 'NaOH',          qty: '300 kg', amount: 27000, date: '2024-06-11', profit: 7800 },
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
    label: "Today's Revenue",
    value: '৳1,24,500',
    delta: '+12.4%',
    up: true,
    highlight: true,
  },
  {
    label: 'Monthly Profit',
    value: '৳1,20,000',
    delta: '+8.2%',
    up: true,
    highlight: false,
  },
  {
    label: 'Active Customers',
    value: '47',
    delta: '+3 this month',
    up: true,
    highlight: false,
  },
  {
    label: 'Low Stock Alerts',
    value: '3',
    delta: '2 new',
    up: false,
    highlight: false,
  },
  {
    label: 'Orders This Month',
    value: '24',
    delta: '+6 vs last',
    up: true,
    highlight: false,
  },
  {
    label: 'Profit Margin',
    value: '37.5%',
    delta: '+2.1%',
    up: true,
    highlight: false,
  },
]

export default function TitasDashboard() {
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
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-4" aria-label="Breadcrumb">
        <span>Titas Enterprise</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Dashboard</span>
      </nav>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, Admin</h1>
          <p className="page-subtitle">Here's your business overview for today · {new Date().toLocaleDateString('en-BD', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <div className="page-actions">
          <Link href="/titas/reports" className="btn btn-ghost">View Reports</Link>
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
        {/* Revenue vs Profit Area Chart */}
        <div className="chart-card">
          <div className="chart-title">Revenue &amp; Profit Trend</div>
          <div className="chart-subtitle">Last 6 months performance</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top:5, right:10, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartAccent} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={chartAccent} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartDark} stopOpacity={0.18}/>
                    <stop offset="95%" stopColor={chartDark} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: chartMuted, fontSize:12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartMuted, fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize:'0.78rem', color: chartMuted, paddingTop:'0.5rem' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={chartAccent}  strokeWidth={2.5} fill="url(#revGrad)"  activeDot={{ r:5, fill:chartAccent }} />
                <Area type="monotone" dataKey="profit"  name="Profit"  stroke={chartDark} strokeWidth={2}   fill="url(#profGrad)" activeDot={{ r:4, fill:chartDark }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="chart-card">
          <div className="chart-title">Sales by Category</div>
          <div className="chart-subtitle">This month's breakdown</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} contentStyle={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginTop:'0.25rem' }}>
            {categoryData.map((c, i) => (
              <div key={c.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.78rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <span style={{ color:'var(--text-secondary)' }}>{c.name}</span>
                </div>
                <span style={{ color:'var(--text-primary)', fontWeight:700 }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1rem', marginBottom:'1rem' }}>
        {/* Top Chemicals Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">Top Selling Chemicals</div>
          <div className="chart-subtitle">By quantity sold this month</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topChemicals} layout="vertical" margin={{ top:0, right:10, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: chartMuted, fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: chartMuted, fontSize:11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ backgroundColor:'var(--surface)', border:'1px solid var(--border)', borderRadius:'10px', fontSize:'0.78rem' }} cursor={{ fill:'var(--surface2)' }} />
                <Bar dataKey="sold" name="Qty Sold" radius={[0,6,6,0]}>
                  {topChemicals.map((_, i) => (
                    <Cell key={i} fill={chartAccent} fillOpacity={1 - i * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div>
            <h3 style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:'0.15rem' }}>Recent Sales Orders</h3>
            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', margin:0 }}>Latest transactions</p>
          </div>
          <Link href="/titas/sales" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Chemical</th>
                <th>Quantity</th>
                <th>Amount (৳)</th>
                <th>Profit (৳)</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(sale => (
                <tr key={sale.id}>
                  <td><span className="num" style={{ color:'var(--titas-primary)', fontWeight:600, fontSize:'0.8rem' }}>{sale.id}</span></td>
                  <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{sale.customer}</td>
                  <td>{sale.chemical}</td>
                  <td>{sale.qty}</td>
                  <td className="num" style={{ color:'var(--text-primary)', fontWeight:600 }}>৳{sale.amount.toLocaleString()}</td>
                  <td className="num" style={{ color:'var(--success)', fontWeight:600 }}>৳{sale.profit.toLocaleString()}</td>
                  <td style={{ fontSize:'0.8rem' }}>{sale.date}</td>
                  <td>
                    <Link href={`/titas/sales?id=${sale.id}`} className="btn btn-ghost btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
