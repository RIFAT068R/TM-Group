'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PIE_COLORS = ['#580282', '#8F39BA', '#222121', '#8E8D8C', '#06B6D4', '#10B981']

function ChartTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem', boxShadow: 'var(--shadow-lg)' }}>
        <p style={{ color: 'var(--text-primary)', marginBottom: '0.4rem', fontWeight: 600 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.stroke || p.fill, fontWeight: 700, margin: '0.1rem 0' }}>
            {p.name}: ৳{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function TMDashboard() {
  const [greeting, setGreeting] = useState('')
  const [mounted, setMounted] = useState(false)
  const [animateKpis, setAnimateKpis] = useState(false)
  const [chartAccent, setChartAccent] = useState('#580282')
  const [chartMuted, setChartMuted]  = useState('#8E8D8C')

  // Live data
  const [placements, setPlacements] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])

  const readChartColors = () => {
    const style = getComputedStyle(document.documentElement)
    const acc = style.getPropertyValue('--brand-accent').trim()
    const mut = style.getPropertyValue('--text-muted').trim()
    if (acc) setChartAccent(acc)
    if (mut) setChartMuted(mut)
  }

  const fetchDashboardData = async () => {
    try {
      const { createClient, isSupabaseConfigured } = await import('@/lib/supabase/client')
      if (!isSupabaseConfigured()) return
      const supabase = createClient()

      const [placRes, workRes, agRes] = await Promise.all([
        supabase.from('tm_placements').select('*, tm_workers(full_name, passport_number), tm_agencies(name)').order('created_at', { ascending: false }),
        supabase.from('tm_workers').select('id, status'),
        supabase.from('tm_agencies').select('id, name'),
      ])

      if (placRes.data) { setPlacements(placRes.data); try { localStorage.setItem('tm_dash_placements', JSON.stringify(placRes.data)) } catch (e) {} }
      if (workRes.data) setWorkers(workRes.data)
      if (agRes.data) setAgencies(agRes.data)
    } catch (err: any) {
      console.error('TM Dashboard fetch error:', err.message)
      try { const c = localStorage.getItem('tm_dash_placements'); if (c) setPlacements(JSON.parse(c)) } catch (e) {}
    }
  }

  useEffect(() => {
    setMounted(true)
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
    setTimeout(() => setAnimateKpis(true), 100)
    readChartColors()
    const observer = new MutationObserver(readChartColors)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    try { const c = localStorage.getItem('tm_dash_placements'); if (c) setPlacements(JSON.parse(c)) } catch (e) {}

    let channel: any
    const setup = async () => {
      const { isSupabaseConfigured, createClient } = await import('@/lib/supabase/client')
      if (isSupabaseConfigured()) {
        await fetchDashboardData()
        const supabase = createClient()
        channel = supabase
          .channel('tm-dashboard-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tm_placements' }, () => fetchDashboardData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tm_workers' }, () => fetchDashboardData())
          .subscribe()
      }
    }
    setup()
    return () => {
      observer.disconnect()
      if (channel) import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel))
    }
  }, [])

  // ── Computed metrics ──
  const mapped = placements.map((p: any) => ({
    id: p.reference_number || p.id,
    date: p.departure_date || p.processing_start_date || '',
    worker: p.tm_workers?.full_name || 'Unknown',
    passport: p.tm_workers?.passport_number || '',
    country: p.destination_country || 'Unknown',
    agency: p.tm_agencies?.name || 'Direct',
    fee: Number(p.worker_fee || 0) + Number(p.agency_fee || 0) + Number(p.commission_amount || 0),
    salary: Number(p.salary_amount || 0),
    status: p.status || 'processing',
  }))

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]

  const monthPlacements = mapped.filter(p => p.date.startsWith(thisMonth))
  const todayPlacements = mapped.filter(p => p.date === today)
  const activeWorkers = mapped.filter(p => p.status === 'working' || p.status === 'departed').length
  const processingCount = mapped.filter(p => p.status === 'processing' || p.status === 'visa_approved').length
  const totalRevenue = mapped.reduce((s, p) => s + p.fee, 0)
  const totalExpenses = Math.round(totalRevenue * 0.6)
  const totalProfit = totalRevenue - totalExpenses
  const monthRevenue = monthPlacements.reduce((s, p) => s + p.fee, 0)

  // Monthly chart data — last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const ms = mapped.filter(p => p.date.startsWith(ym))
    const revenue = ms.reduce((s, p) => s + p.fee, 0)
    const expenses = Math.round(revenue * 0.6)
    return { month: MONTHS[d.getMonth()], revenue, profit: revenue - expenses }
  })

  // Country breakdown
  const countryMap: Record<string, number> = {}
  mapped.forEach(p => { countryMap[p.country] = (countryMap[p.country] || 0) + 1 })
  const countryData = Object.entries(countryMap).map(([country, workers]) => ({ country, workers })).sort((a, b) => b.workers - a.workers).slice(0, 5)

  // Status breakdown for pie
  const statusMap: Record<string, number> = {}
  mapped.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1 })
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  // Recent placements
  const recentPlacements = mapped.slice(0, 5)

  const statusBadge: Record<string, string> = { working: 'badge-success', processing: 'badge-warning', visa_approved: 'badge-info', departed: 'badge-secondary', returned: 'badge-danger' }

  const kpiConfig = [
    { label: "Today's Placements", value: String(todayPlacements.length), delta: `${monthPlacements.length} this month`, up: todayPlacements.length > 0, highlight: true },
    { label: 'Monthly Revenue',   value: `৳${monthRevenue.toLocaleString()}`,   delta: `${monthPlacements.length} placements`, up: monthRevenue > 0, highlight: false },
    { label: 'Active Workers',    value: String(activeWorkers),                  delta: 'Working or departed', up: activeWorkers > 0, highlight: false },
    { label: 'In Processing',     value: String(processingCount),                delta: 'Visa pending or processing', up: false, highlight: false },
    { label: 'Total Placements',  value: String(mapped.length),                  delta: 'All time', up: true, highlight: false },
    { label: 'Total Net Profit',  value: `৳${(totalProfit / 1000).toFixed(0)}k`, delta: 'Estimated (40% margin)', up: totalProfit > 0, highlight: false },
  ]

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
          <p className="page-subtitle">
            Live manpower placement overview · {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="page-actions">
          <Link href="/tm/reports" className="btn btn-ghost">View Reports</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid mb-6">
        {kpiConfig.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card ${kpi.highlight ? 'kpi-highlight' : ''} animate-up animate-up-delay-${Math.min(i + 1, 4)}`}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value num" style={{ opacity: animateKpis ? 1 : 0.4, transition: 'opacity 0.5s' }}>{kpi.value}</div>
            <div className={`kpi-delta ${kpi.up ? 'up' : 'down'}`}>{kpi.up ? '↑' : '↓'} {kpi.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Revenue & Profit Area Chart */}
        <div className="chart-card">
          <div className="chart-title">Revenue &amp; Profit Trend</div>
          <div className="chart-subtitle">Last 6 months — live data</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tmRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartAccent} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={chartAccent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tmProfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: chartMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={chartAccent} strokeWidth={2.5} fill="url(#tmRevGrad)" activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="profit"  name="Profit"  stroke="#10B981"     strokeWidth={2}   fill="url(#tmProfGrad)" activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie Chart */}
        <div className="chart-card">
          <div className="chart-title">Worker Status Breakdown</div>
          <div className="chart-subtitle">Current distribution of all workers</div>
          {mounted && statusData.length > 0 && (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [`${v} workers`, name]} contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
            {statusData.slice(0, 4).map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{s.name}</span>
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Countries Bar Chart */}
      {countryData.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="chart-card">
            <div className="chart-title">Top Destination Countries</div>
            <div className="chart-subtitle">Workers placed by country (all time)</div>
            {mounted && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: chartMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="country" tick={{ fill: chartMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.78rem' }} />
                  <Bar dataKey="workers" name="Workers" radius={[0, 6, 6, 0]}>
                    {countryData.map((_, i) => <Cell key={i} fill={chartAccent} fillOpacity={1 - i * 0.15} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Recent Placements Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem' }}>Recent Placements</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Latest records from database</p>
          </div>
          <Link href="/tm/placements" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {recentPlacements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No placements yet. <Link href="/tm/placements" style={{ color: 'var(--brand-accent)' }}>Add a placement →</Link>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref ID</th><th>Worker</th><th>Country</th>
                  <th>Agency</th><th>Revenue (৳)</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPlacements.map(p => (
                  <tr key={p.id}>
                    <td><span className="num" style={{ color: 'var(--brand-accent)', fontWeight: 600, fontSize: '0.8rem' }}>{String(p.id).slice(0, 10)}</span></td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.worker}</td>
                    <td>🌍 {p.country}</td>
                    <td style={{ fontSize: '0.82rem' }}>{p.agency}</td>
                    <td className="num" style={{ fontWeight: 600 }}>৳{p.fee.toLocaleString()}</td>
                    <td style={{ fontSize: '0.8rem' }}>{p.date}</td>
                    <td><span className={`badge ${statusBadge[p.status] || 'badge-info'}`}>{p.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
