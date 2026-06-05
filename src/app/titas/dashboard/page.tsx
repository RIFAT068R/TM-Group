'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CATEGORY_COLORS = ['#580282', '#8F39BA', '#222121', '#8E8D8C', '#06B6D4', '#10B981']

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

export default function TitasDashboard() {
  const [greeting, setGreeting] = useState('')
  const [mounted, setMounted] = useState(false)
  const [animateKpis, setAnimateKpis] = useState(false)
  const [chartAccent, setChartAccent] = useState('#580282')
  const [chartMuted, setChartMuted] = useState('#8E8D8C')

  // Live data state
  const [sales, setSales] = useState<any[]>([])
  const [chemicals, setChemicals] = useState<any[]>([])
  const [customersCount, setCustomersCount] = useState(0)

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

      const [salesRes, chemsRes, custRes] = await Promise.all([
        supabase
          .from('titas_sales')
          .select('*, titas_customers(name), titas_sale_items(*, titas_chemicals(name, unit))')
          .order('sale_date', { ascending: false }),
        supabase.from('titas_chemicals').select('*'),
        supabase.from('titas_customers').select('id', { count: 'exact', head: true }),
      ])

      if (salesRes.data) setSales(salesRes.data)
      if (chemsRes.data) setChemicals(chemsRes.data)
      if (custRes.count !== null) setCustomersCount(custRes.count)

      // Cache for offline
      try {
        if (salesRes.data) localStorage.setItem('titas_dashboard_sales', JSON.stringify(salesRes.data))
        if (chemsRes.data) localStorage.setItem('titas_dashboard_chems', JSON.stringify(chemsRes.data))
      } catch (e) {}
    } catch (err: any) {
      console.error('Dashboard fetch error:', err.message)
      // Use cache
      try {
        const cs = localStorage.getItem('titas_dashboard_sales')
        const cc = localStorage.getItem('titas_dashboard_chems')
        if (cs) setSales(JSON.parse(cs))
        if (cc) setChemicals(JSON.parse(cc))
      } catch (e) {}
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

    // Load from cache first
    try {
      const cs = localStorage.getItem('titas_dashboard_sales')
      const cc = localStorage.getItem('titas_dashboard_chems')
      if (cs) setSales(JSON.parse(cs))
      if (cc) setChemicals(JSON.parse(cc))
    } catch (e) {}

    let channel: any
    const setup = async () => {
      const { isSupabaseConfigured, createClient } = await import('@/lib/supabase/client')
      if (isSupabaseConfigured()) {
        await fetchDashboardData()
        const supabase = createClient()
        channel = supabase
          .channel('titas-dashboard-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'titas_sales' }, () => fetchDashboardData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'titas_sale_items' }, () => fetchDashboardData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'titas_chemicals' }, () => fetchDashboardData())
          .subscribe()
      }
    }
    setup()

    return () => {
      observer.disconnect()
      if (channel) {
        import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel))
      }
    }
  }, [])

  // ── Computed metrics from live sales ──
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today = now.toISOString().split('T')[0]

  const mappedSales = sales.map((s: any) => {
    const item = s.titas_sale_items?.[0]
    return {
      id: s.id,
      date: s.sale_date || '',
      customer: s.titas_customers?.name || 'Unknown',
      chemical: item?.titas_chemicals?.name || 'Unknown',
      qty: Number(item?.quantity) || 0,
      unit: item?.titas_chemicals?.unit || 'kg',
      buyPrice: Number(item?.purchase_price) || 0,
      sellPrice: Number(item?.unit_price) || 0,
      amount: Number(s.total) || 0,
      profit: Number(item?.profit) || 0,
      status: s.status || 'pending',
    }
  })

  const todaySales = mappedSales.filter(s => s.date === today)
  const monthSales = mappedSales.filter(s => s.date.startsWith(thisMonth))

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.amount, 0)
  const monthProfit  = monthSales.reduce((sum, s) => sum + s.profit, 0)
  const ordersThisMonth = monthSales.length
  const lowStockCount = chemicals.filter((c: any) => Number(c.current_stock) < Number(c.min_stock_level)).length
  const pendingCount = mappedSales.filter(s => s.status === 'pending' || s.status === 'overdue').length
  const totalRevenue = mappedSales.reduce((sum, s) => sum + s.amount, 0)
  const totalProfit  = mappedSales.reduce((sum, s) => sum + s.profit, 0)
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'

  // Monthly chart data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i))
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const ms = mappedSales.filter(s => s.date.startsWith(ym))
    const revenue = ms.reduce((sum, s) => sum + s.amount, 0)
    const profit  = ms.reduce((sum, s) => sum + s.profit, 0)
    return { month: MONTHS[d.getMonth()], revenue, profit }
  })

  // Top chemicals by quantity sold
  const chemSalesMap: Record<string, number> = {}
  mappedSales.forEach(s => { chemSalesMap[s.chemical] = (chemSalesMap[s.chemical] || 0) + s.qty })
  const topChemicals = Object.entries(chemSalesMap)
    .map(([name, sold]) => ({ name, sold }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)

  // Category pie chart from chemicals table
  const catMap: Record<string, number> = {}
  chemicals.forEach((c: any) => {
    const cat = c.category_name || 'Other'
    catMap[cat] = (catMap[cat] || 0) + 1
  })
  const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }))

  // Recent sales (latest 5)
  const recentSales = mappedSales.slice(0, 5)

  const kpiConfig = [
    { label: "Today's Revenue", value: `৳${todayRevenue.toLocaleString()}`, delta: `${todaySales.length} orders today`, up: true, highlight: true },
    { label: 'Monthly Profit',  value: `৳${monthProfit.toLocaleString()}`,  delta: `${ordersThisMonth} orders this month`, up: monthProfit >= 0, highlight: false },
    { label: 'Active Customers', value: String(customersCount || '—'),      delta: 'Total customers', up: true, highlight: false },
    { label: 'Low Stock Alerts', value: String(lowStockCount),              delta: lowStockCount > 0 ? 'Need restocking' : 'All stocked', up: lowStockCount === 0, highlight: false },
    { label: 'Orders This Month', value: String(ordersThisMonth),           delta: `${pendingCount} pending/overdue`, up: pendingCount === 0, highlight: false },
    { label: 'Profit Margin',    value: `${profitMargin}%`,                 delta: 'All-time average', up: Number(profitMargin) >= 20, highlight: false },
  ]

  return (
    <div>
      <nav className="breadcrumb mb-4" aria-label="Breadcrumb">
        <span>Titas Enterprise</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Dashboard</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, Admin</h1>
          <p className="page-subtitle">
            Live business overview · {new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="page-actions">
          <Link href="/titas/reports" className="btn btn-ghost">View Reports</Link>
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
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartAccent} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={chartAccent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: chartMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', color: chartMuted, paddingTop: '0.5rem' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={chartAccent} strokeWidth={2.5} fill="url(#revGrad)" activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={2} fill="url(#profGrad)" activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie */}
        <div className="chart-card">
          <div className="chart-title">Chemicals by Category</div>
          <div className="chart-subtitle">Distribution of registered chemicals</div>
          {mounted && categoryData.length > 0 && (
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [`${v} chemicals`, name]} contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.78rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Chemicals Bar Chart */}
      {topChemicals.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div className="chart-card">
            <div className="chart-title">Top Selling Chemicals</div>
            <div className="chart-subtitle">By total quantity sold (all time)</div>
            {mounted && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topChemicals} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: chartMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: chartMuted, fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.78rem' }} />
                  <Bar dataKey="sold" name="Qty Sold" radius={[0, 6, 6, 0]}>
                    {topChemicals.map((_, i) => (
                      <Cell key={i} fill={chartAccent} fillOpacity={1 - i * 0.15} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Recent Sales Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.15rem' }}>Recent Sales Orders</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Latest transactions from database</p>
          </div>
          <Link href="/titas/sales" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {recentSales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No sales recorded yet. <Link href="/titas/sales" style={{ color: 'var(--brand-accent)' }}>Add a sale →</Link>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Chemical</th>
                  <th>Quantity</th><th>Amount (৳)</th><th>Profit (৳)</th><th>Date</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => {
                  const badgeMap: Record<string, string> = { paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger', partial: 'badge-info' }
                  return (
                    <tr key={sale.id}>
                      <td><span className="num" style={{ color: 'var(--titas-primary)', fontWeight: 600, fontSize: '0.8rem' }}>{String(sale.id).slice(0, 8)}</span></td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sale.customer}</td>
                      <td>{sale.chemical}</td>
                      <td>{sale.qty} {sale.unit}</td>
                      <td className="num" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>৳{sale.amount.toLocaleString()}</td>
                      <td className="num" style={{ color: 'var(--success)', fontWeight: 600 }}>৳{sale.profit.toLocaleString()}</td>
                      <td style={{ fontSize: '0.8rem' }}>{sale.date}</td>
                      <td><span className={`badge ${badgeMap[sale.status] || 'badge-info'}`}>{sale.status}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
