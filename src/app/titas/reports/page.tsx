'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import CustomSelect from '@/components/CustomSelect'
import DatePicker from '@/components/DatePicker'

interface SaleRecord {
  id: string
  date: string
  customer: string
  chemical: string
  qty: number
  unit: string
  buyPrice: number
  sellPrice: number
  status: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TitasReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [salesData, setSalesData] = useState<SaleRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [chemicalFilter, setChemicalFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [timeframe, setTimeframe] = useState('All Time')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [tab, setTab] = useState<'financial' | 'customer' | 'chemical' | 'ledger'>('financial')

  const fetchSales = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('titas_sales')
        .select('*, titas_customers(name), titas_sale_items(*, titas_chemicals(name, unit))')
        .order('sale_date', { ascending: false })

      if (error) throw new Error(error.message)
      if (data) {
        const mapped: SaleRecord[] = data.map((s: any) => {
          const item = s.titas_sale_items?.[0]
          return {
            id: s.invoice_number || s.id,
            date: s.sale_date || '',
            customer: s.titas_customers?.name || 'Unknown Customer',
            chemical: item?.titas_chemicals?.name || 'Unknown Chemical',
            qty: Number(item?.quantity) || 0,
            unit: item?.titas_chemicals?.unit || 'kg',
            buyPrice: Number(item?.purchase_price) || 0,
            sellPrice: Number(item?.unit_price) || 0,
            status: s.status || 'pending',
          }
        })
        setSalesData(mapped)
        // cache locally
        try { localStorage.setItem('titas_reports_sales', JSON.stringify(mapped)) } catch (e) {}
      }
    } catch (err: any) {
      console.error('Reports fetchSales error:', err.message)
      // Fallback to cached data
      try {
        const cached = localStorage.getItem('titas_reports_sales')
        if (cached) setSalesData(JSON.parse(cached))
      } catch (e) {}
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)

    // Hydrate from cache immediately
    try {
      const cached = localStorage.getItem('titas_reports_sales')
      if (cached) setSalesData(JSON.parse(cached))
    } catch (e) {}

    let channel: any
    const setup = async () => {
      const { isSupabaseConfigured, createClient } = await import('@/lib/supabase/client')
      if (isSupabaseConfigured()) {
        await fetchSales()
        const supabase = createClient()
        channel = supabase
          .channel('titas-reports-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'titas_sales' }, () => fetchSales())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'titas_sale_items' }, () => fetchSales())
          .subscribe()
      } else {
        setIsLoading(false)
      }
    }
    setup()

    return () => {
      if (channel) {
        import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel))
      }
    }
  }, [])

  // Dynamic timeframe filter using real current date
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const filteredSales = salesData.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) ||
                          s.customer.toLowerCase().includes(search.toLowerCase()) ||
                          s.chemical.toLowerCase().includes(search.toLowerCase())
    const matchesChemical = chemicalFilter ? s.chemical === chemicalFilter : true
    const matchesCustomer = customerFilter ? s.customer === customerFilter : true
    const matchesStatus = statusFilter ? s.status === statusFilter : true

    let matchesTime = true
    const saleDate = new Date(s.date)
    if (timeframe === 'Daily') {
      const todayStr = today.toISOString().split('T')[0]
      matchesTime = s.date === todayStr
    } else if (timeframe === 'Weekly') {
      const oneWeekAgo = new Date(today); oneWeekAgo.setDate(today.getDate() - 7)
      matchesTime = saleDate >= oneWeekAgo && saleDate <= today
    } else if (timeframe === 'Monthly') {
      const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
      matchesTime = s.date.startsWith(thisMonth)
    } else if (timeframe === 'Yearly') {
      matchesTime = s.date.startsWith(String(today.getFullYear()))
    } else if (timeframe === 'Custom') {
      const start = customStartDate ? new Date(customStartDate) : null
      const end = customEndDate ? new Date(customEndDate) : null
      if (start && end) matchesTime = saleDate >= start && saleDate <= end
      else if (start) matchesTime = saleDate >= start
      else if (end) matchesTime = saleDate <= end
    }
    return matchesSearch && matchesChemical && matchesCustomer && matchesStatus && matchesTime
  })

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.qty * s.sellPrice), 0)
  const totalCost    = filteredSales.reduce((sum, s) => sum + (s.qty * s.buyPrice), 0)
  const totalProfit  = totalRevenue - totalCost
  const unpaidBalance = filteredSales.reduce((sum, s) => {
    if (s.status === 'pending' || s.status === 'overdue') return sum + (s.qty * s.sellPrice)
    if (s.status === 'partial') return sum + (s.qty * s.sellPrice) * 0.5
    return sum
  }, 0)

  // Monthly chart data — last 6 months
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthSales = filteredSales.filter(s => s.date.startsWith(yearMonth))
    const revenue = monthSales.reduce((sum, s) => sum + s.qty * s.sellPrice, 0)
    const cost = monthSales.reduce((sum, s) => sum + s.qty * s.buyPrice, 0)
    return { month: MONTHS[d.getMonth()], revenue, cost, profit: revenue - cost }
  })

  // Customer aggregates
  const customerMap: Record<string, { revenue: number; profit: number; orders: number }> = {}
  filteredSales.forEach(s => {
    if (!customerMap[s.customer]) customerMap[s.customer] = { revenue: 0, profit: 0, orders: 0 }
    const rev = s.qty * s.sellPrice; const cost = s.qty * s.buyPrice
    customerMap[s.customer].revenue += rev
    customerMap[s.customer].profit += rev - cost
    customerMap[s.customer].orders += 1
  })
  const customerReport = Object.entries(customerMap)
    .map(([customer, data]) => ({ customer, ...data }))
    .sort((a, b) => b.revenue - a.revenue)

  // Chemical aggregates
  const chemicalMap: Record<string, { sold: number; revenue: number; profit: number }> = {}
  filteredSales.forEach(s => {
    if (!chemicalMap[s.chemical]) chemicalMap[s.chemical] = { sold: 0, revenue: 0, profit: 0 }
    const rev = s.qty * s.sellPrice; const cost = s.qty * s.buyPrice
    chemicalMap[s.chemical].sold += s.qty
    chemicalMap[s.chemical].revenue += rev
    chemicalMap[s.chemical].profit += rev - cost
  })
  const chemicalReport = Object.entries(chemicalMap)
    .map(([chemical, data]) => ({ chemical, ...data }))
    .sort((a, b) => b.revenue - a.revenue)

  const uniqueCustomers = Array.from(new Set(salesData.map(s => s.customer)))
  const uniqueChemicals = Array.from(new Set(salesData.map(s => s.chemical)))

  const handleExportCSV = () => {
    if (filteredSales.length === 0) { alert('No sales data available for active filters.'); return }
    const headers = ['Order ID', 'Date', 'Customer', 'Chemical', 'Quantity', 'Unit', 'Buy Price (BDT)', 'Sell Price (BDT)', 'Total Amount (BDT)', 'Profit (BDT)', 'Status']
    const rows = filteredSales.map(s => [
      s.id, s.date, `"${s.customer}"`, `"${s.chemical}"`, s.qty, s.unit,
      s.buyPrice, s.sellPrice, s.qty * s.sellPrice,
      (s.qty * s.sellPrice) - (s.qty * s.buyPrice), s.status
    ])
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Titas_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ position: 'relative' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, .sidebar, header, .breadcrumb, .page-actions, .filter-bar, .tab-buttons, button, select { display: none !important; }
          body { background: #ffffff !important; color: #000000 !important; }
          .data-table-wrap { overflow: visible !important; width: 100% !important; }
          .data-table { width: 100% !important; border-collapse: collapse !important; border: 1px solid #222 !important; }
          .data-table th, .data-table td { border: 1px solid #444 !important; padding: 8px !important; color: #000 !important; }
          .kpi-card { border: 1px solid #888 !important; background: #fff !important; color: #000 !important; box-shadow: none !important; }
        }
      ` }} />

      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Reports</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Business Reports</h1>
          <p className="page-subtitle">
            {isLoading ? 'Loading live data...' : `${salesData.length} total sales records · Live from database`}
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={handleExportCSV}>📥 Export CSV</button>
          <button className="btn btn-primary" onClick={() => window.print()}>📄 Print PDF</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, accent: 'var(--brand-accent)' },
          { label: 'Total Cost', value: `৳${totalCost.toLocaleString()}`, accent: '#F59E0B' },
          { label: 'Net Profit', value: `৳${totalProfit.toLocaleString()}`, accent: '#10B981' },
          { label: 'Operating Margin', value: `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`, accent: '#06B6D4' },
          { label: 'Unpaid / Receivable', value: `৳${unpaidBalance.toLocaleString()}`, accent: '#EF4444' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ borderLeft: `3px solid ${k.accent}` }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num" style={{ color: k.accent, fontSize: '1.35rem', fontWeight: 800 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Panel */}
      <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="search-wrap" style={{ flex: '1 1 200px' }}>
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" style={{ width: '100%' }} placeholder="Search by ID, customer, chemical..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CustomSelect value={chemicalFilter} onChange={setChemicalFilter} style={{ flex: '1 1 140px', minWidth: 140 }}
          options={[{ value: '', label: 'All Chemicals' }, ...uniqueChemicals.map(c => ({ value: c, label: c }))]} />
        <CustomSelect value={customerFilter} onChange={setCustomerFilter} style={{ flex: '1 1 140px', minWidth: 140 }}
          options={[{ value: '', label: 'All Customers' }, ...uniqueCustomers.map(c => ({ value: c, label: c }))]} />
        <CustomSelect value={statusFilter} onChange={setStatusFilter} style={{ flex: '1 1 120px', minWidth: 120 }}
          options={[{ value: '', label: 'All Statuses' }, { value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'overdue', label: 'Overdue' }, { value: 'partial', label: 'Partial' }]} />
        <CustomSelect value={timeframe} onChange={v => { setTimeframe(v); if (v !== 'Custom') { setCustomStartDate(''); setCustomEndDate('') } }}
          style={{ flex: '1 1 140px', minWidth: 140 }}
          options={[
            { value: 'All Time', label: 'All Time' },
            { value: 'Daily', label: 'Today' },
            { value: 'Weekly', label: 'Last 7 Days' },
            { value: 'Monthly', label: 'This Month' },
            { value: 'Yearly', label: 'This Year' },
            { value: 'Custom', label: 'Custom Range...' },
          ]} />
        {timeframe === 'Custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
            <DatePicker value={customStartDate} onChange={setCustomStartDate} placeholder="Start date" style={{ flex: 1 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', flexShrink: 0 }}>to</span>
            <DatePicker value={customEndDate} onChange={setCustomEndDate} placeholder="End date" style={{ flex: 1 }} />
          </div>
        )}
        <button className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }} onClick={() => { setSearch(''); setChemicalFilter(''); setCustomerFilter(''); setStatusFilter(''); setTimeframe('All Time'); setCustomStartDate(''); setCustomEndDate('') }}>
          Reset
        </button>
      </div>

      {/* No data state */}
      {!isLoading && salesData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <h3 style={{ margin: '0 0 0.5rem' }}>No Sales Data Yet</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Add sales from the <Link href="/titas/sales" style={{ color: 'var(--brand-accent)' }}>Sales page</Link> and they will appear here automatically.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-buttons" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
        {([
          { id: 'financial', label: '📊 Financial Performance' },
          { id: 'customer',  label: '🏢 Customer Report' },
          { id: 'chemical',  label: '🧪 Chemical Volume' },
          { id: 'ledger',    label: '🧾 Full Sales Ledger' },
        ] as const).map(t => (
          <button key={t.id} className="btn btn-ghost btn-sm" onClick={() => setTab(t.id)}
            style={{ borderRadius: '8px 8px 0 0', borderBottom: tab === t.id ? '2.5px solid var(--brand-accent)' : '2.5px solid transparent', color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: tab === t.id ? 700 : 500, padding: '0.75rem 1.25rem' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Financial Tab */}
      {tab === 'financial' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="chart-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <div>
                <div className="chart-title">Revenue vs Cost vs Net Profit (Last 6 Months)</div>
                <div className="chart-subtitle">Calculated from live sales records</div>
              </div>
              <span className="chart-badge green">Live Data</span>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} barCategoryGap="28%" barGap={4}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#9D55FF" stopOpacity={0.75} /></linearGradient>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#FBBF24" stopOpacity={0.75} /></linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#34D399" stopOpacity={0.75} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} width={52} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.78rem' }} formatter={(v: any, name: any) => [`৳${v?.toLocaleString()}`, name]} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.75rem' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="revenue" name="Revenue" fill="url(#revGrad)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cost" name="Cost" fill="url(#costGrad)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit" fill="url(#profGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="chart-card">
            <div className="chart-title">Net Profit Trend</div>
            <div className="chart-subtitle">Monthly profit trajectory</div>
            {mounted && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="areaProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} width={52} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.78rem' }} formatter={(v: any) => [`৳${v?.toLocaleString()}`, 'Net Profit']} />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10B981" strokeWidth={3} fill="url(#areaProfit)" dot={{ fill: '#fff', stroke: '#10B981', strokeWidth: 2.5, r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Customer Tab */}
      {tab === 'customer' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Rank</th><th>Customer</th><th className="num">Orders</th>
              <th className="num">Revenue</th><th className="num">Net Profit</th>
              <th className="num">Avg Order</th><th className="num">Margin</th>
            </tr></thead>
            <tbody>
              {customerReport.map((c, i) => (
                <tr key={c.customer}>
                  <td style={{ color: 'var(--text-muted)' }}>#{i + 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.customer}</td>
                  <td className="num" style={{ color: 'var(--brand-accent)' }}>{c.orders}</td>
                  <td className="num">৳{c.revenue.toLocaleString()}</td>
                  <td className="num" style={{ color: '#10B981', fontWeight: 700 }}>৳{c.profit.toLocaleString()}</td>
                  <td className="num">৳{Math.round(c.revenue / c.orders).toLocaleString()}</td>
                  <td className="num" style={{ color: '#06B6D4', fontWeight: 700 }}>{((c.profit / c.revenue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              {customerReport.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No customer data matches current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Chemical Tab */}
      {tab === 'chemical' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Rank</th><th>Chemical</th><th className="num">Qty Sold</th>
              <th className="num">Revenue</th><th className="num">Profit</th><th className="num">Margin</th>
            </tr></thead>
            <tbody>
              {chemicalReport.map((c, i) => (
                <tr key={c.chemical}>
                  <td style={{ color: 'var(--text-muted)' }}>#{i + 1}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.chemical}</td>
                  <td className="num" style={{ fontWeight: 600 }}>{c.sold.toLocaleString()} units</td>
                  <td className="num">৳{c.revenue.toLocaleString()}</td>
                  <td className="num" style={{ color: '#10B981', fontWeight: 700 }}>৳{c.profit.toLocaleString()}</td>
                  <td className="num" style={{ color: '#06B6D4', fontWeight: 700 }}>{((c.profit / c.revenue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              {chemicalReport.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No chemical data matches current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Ledger Tab */}
      {tab === 'ledger' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Order ID</th><th>Date</th><th>Customer</th><th>Chemical</th>
              <th className="num">Qty</th><th className="num">Revenue</th>
              <th className="num">Profit</th><th className="num">Margin</th><th>Status</th>
            </tr></thead>
            <tbody>
              {filteredSales.map(sale => {
                const amount = sale.qty * sale.sellPrice
                const profit = amount - (sale.qty * sale.buyPrice)
                const margin = amount > 0 ? ((profit / amount) * 100).toFixed(1) : '0.0'
                const badgeMap: Record<string, string> = { paid: 'badge-success', pending: 'badge-warning', overdue: 'badge-danger', partial: 'badge-info' }
                return (
                  <tr key={sale.id}>
                    <td><span className="num" style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>{sale.id}</span></td>
                    <td style={{ fontSize: '0.82rem' }}>{sale.date}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{sale.customer}</td>
                    <td>{sale.chemical}</td>
                    <td className="num">{sale.qty} {sale.unit}</td>
                    <td className="num" style={{ fontWeight: 600 }}>৳{amount.toLocaleString()}</td>
                    <td className="num" style={{ color: '#10B981', fontWeight: 700 }}>৳{profit.toLocaleString()}</td>
                    <td className="num" style={{ color: '#06B6D4', fontWeight: 600 }}>{margin}%</td>
                    <td><span className={`badge ${badgeMap[sale.status] || 'badge-info'}`}>{sale.status}</span></td>
                  </tr>
                )
              })}
              {filteredSales.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No sales orders matched your filters. Try resetting.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
