'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Consolidated rich database representing realistic chemical transactions in the year 2026
const salesData = [
  { id: 'TE-2026-001', date: '2026-01-10', customer: 'ACI Limited', chemical: 'Sulfuric Acid', qty: 1200, unit: 'kg', buyPrice: 85, sellPrice: 120, status: 'paid' },
  { id: 'TE-2026-002', date: '2026-01-25', customer: 'Square Pharma', chemical: 'Ethanol', qty: 800, unit: 'liter', buyPrice: 95, sellPrice: 140, status: 'paid' },
  { id: 'TE-2026-003', date: '2026-02-05', customer: 'Renata Limited', chemical: 'Sodium Hydroxide', qty: 1500, unit: 'kg', buyPrice: 65, sellPrice: 95, status: 'paid' },
  { id: 'TE-2026-004', date: '2026-02-18', customer: 'ACI Limited', chemical: 'Hydrochloric Acid', qty: 2000, unit: 'liter', buyPrice: 55, sellPrice: 80, status: 'partial' },
  { id: 'TE-2026-005', date: '2026-03-02', customer: 'Square Pharma', chemical: 'Acetone', qty: 600, unit: 'liter', buyPrice: 72, sellPrice: 105, status: 'paid' },
  { id: 'TE-2026-006', date: '2026-03-20', customer: 'BRAC', chemical: 'Sulfuric Acid', qty: 1000, unit: 'kg', buyPrice: 85, sellPrice: 122, status: 'pending' },
  { id: 'TE-2026-007', date: '2026-04-05', customer: 'Bashundhara Group', chemical: 'Ethanol', qty: 1500, unit: 'liter', buyPrice: 95, sellPrice: 138, status: 'paid' },
  { id: 'TE-2026-008', date: '2026-04-22', customer: 'Renata Limited', chemical: 'Acetone', qty: 1000, unit: 'liter', buyPrice: 72, sellPrice: 105, status: 'overdue' },
  { id: 'TE-2026-009', date: '2026-05-12', customer: 'BRAC', chemical: 'Sodium Hydroxide', qty: 1700, unit: 'kg', buyPrice: 65, sellPrice: 92, status: 'paid' },
  { id: 'TE-2026-010', date: '2026-05-28', customer: 'Bashundhara Group', chemical: 'Methanol', qty: 2500, unit: 'liter', buyPrice: 48, sellPrice: 72, status: 'partial' },
  { id: 'TE-2026-011', date: '2026-05-31', customer: 'Square Pharma', chemical: 'Sulfuric Acid', qty: 1300, unit: 'kg', buyPrice: 85, sellPrice: 120, status: 'paid' },
  { id: 'TE-2026-012', date: '2026-06-01', customer: 'ACI Limited', chemical: 'Ethanol', qty: 1100, unit: 'liter', buyPrice: 95, sellPrice: 140, status: 'pending' },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function TitasReportsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [search, setSearch] = useState('')
  const [chemicalFilter, setChemicalFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [timeframe, setTimeframe] = useState('All Time')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [tab, setTab] = useState<'financial' | 'customer' | 'chemical' | 'ledger'>('financial')

  // Multi-dimensional filter logic with high-precision timeframe calculations
  const filteredSales = salesData.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) ||
                          s.customer.toLowerCase().includes(search.toLowerCase()) ||
                          s.chemical.toLowerCase().includes(search.toLowerCase());
    const matchesChemical = chemicalFilter ? s.chemical === chemicalFilter : true;
    const matchesCustomer = customerFilter ? s.customer === customerFilter : true;
    const matchesStatus = statusFilter ? s.status === statusFilter : true;

    // Precise date filtering logic
    let matchesTime = true;
    const saleDate = new Date(s.date);
    
    // Setting up reference dates based on today's local time: 2026-06-01
    const today = new Date('2026-06-01');
    
    if (timeframe === 'Daily') {
      matchesTime = s.date === '2026-06-01';
    } else if (timeframe === 'Weekly') {
      const oneWeekAgo = new Date('2026-05-25');
      matchesTime = saleDate >= oneWeekAgo && saleDate <= today;
    } else if (timeframe === 'Monthly') {
      matchesTime = s.date.startsWith('2026-06');
    } else if (timeframe === 'Yearly') {
      matchesTime = s.date.startsWith('2026');
    } else if (timeframe === 'Custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;
      if (start && end) {
        matchesTime = saleDate >= start && saleDate <= end;
      } else if (start) {
        matchesTime = saleDate >= start;
      } else if (end) {
        matchesTime = saleDate <= end;
      }
    }

    return matchesSearch && matchesChemical && matchesCustomer && matchesStatus && matchesTime;
  });

  // Calculate dynamic metrics based on active filtered sales
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.qty * s.sellPrice), 0);
  const totalCost    = filteredSales.reduce((sum, s) => sum + (s.qty * s.buyPrice), 0);
  const totalProfit  = totalRevenue - totalCost;
  const unpaidBalance = filteredSales.reduce((sum, s) => {
    if (s.status === 'pending' || s.status === 'overdue') {
      return sum + (s.qty * s.sellPrice);
    } else if (s.status === 'partial') {
      return sum + (s.qty * s.sellPrice) * 0.5; // Estimate 50% unpaid
    }
    return sum;
  }, 0);

  // Dynamic Chart aggregates based on filtered records
  const monthlyData = months.map((month, idx) => {
    const monthStr = `-0${idx + 1}-`;
    const monthSales = filteredSales.filter(s => s.date.includes(monthStr));
    const revenue = monthSales.reduce((sum, s) => sum + (s.qty * s.sellPrice), 0);
    const cost = monthSales.reduce((sum, s) => sum + (s.qty * s.buyPrice), 0);
    const profit = revenue - cost;
    return { month, revenue, cost, profit };
  });

  // Dynamic Customer aggregates
  const customerMap: Record<string, { revenue: number, profit: number, orders: number }> = {};
  filteredSales.forEach(s => {
    if (!customerMap[s.customer]) {
      customerMap[s.customer] = { revenue: 0, profit: 0, orders: 0 };
    }
    const rev = s.qty * s.sellPrice;
    const cost = s.qty * s.buyPrice;
    customerMap[s.customer].revenue += rev;
    customerMap[s.customer].profit += (rev - cost);
    customerMap[s.customer].orders += 1;
  });
  const customerReport = Object.entries(customerMap).map(([customer, data]) => ({
    customer,
    revenue: data.revenue,
    profit: data.profit,
    orders: data.orders,
  })).sort((a,b) => b.revenue - a.revenue);

  // Dynamic Chemical aggregates
  const chemicalMap: Record<string, { sold: number, revenue: number, profit: number }> = {};
  filteredSales.forEach(s => {
    if (!chemicalMap[s.chemical]) {
      chemicalMap[s.chemical] = { sold: 0, revenue: 0, profit: 0 };
    }
    const rev = s.qty * s.sellPrice;
    const cost = s.qty * s.buyPrice;
    chemicalMap[s.chemical].sold += s.qty;
    chemicalMap[s.chemical].revenue += rev;
    chemicalMap[s.chemical].profit += (rev - cost);
  });
  const chemicalReport = Object.entries(chemicalMap).map(([chemical, data]) => ({
    chemical,
    sold: data.sold,
    revenue: data.revenue,
    profit: data.profit,
  })).sort((a,b) => b.revenue - a.revenue);

  // Client-Side CSV Export Tool
  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
      alert('No sales data available for active filters.');
      return;
    }
    const headers = ['Order ID', 'Date', 'Customer', 'Chemical', 'Quantity', 'Unit', 'Buy Price (BDT)', 'Sell Price (BDT)', 'Total Amount (BDT)', 'Profit (BDT)', 'Status'];
    const rows = filteredSales.map(s => [
      s.id,
      s.date,
      `"${s.customer}"`,
      `"${s.chemical}"`,
      s.qty,
      s.unit,
      s.buyPrice,
      s.sellPrice,
      s.qty * s.sellPrice,
      (s.qty * s.sellPrice) - (s.qty * s.buyPrice),
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Titas_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser print trigger (optimized using embedded print CSS block)
  const handlePrintPDF = () => {
    window.print();
  };

  // Get unique customers and chemicals for filter lists
  const uniqueCustomers = Array.from(new Set(salesData.map(s => s.customer)));
  const uniqueChemicals = Array.from(new Set(salesData.map(s => s.chemical)));

  return (
    <div style={{ position: 'relative' }}>
      {/* Injected CSS block for perfect, clean PDF printing layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, 
          .sidebar,
          header,
          .breadcrumb,
          .page-actions,
          .filter-bar,
          .tab-buttons,
          button,
          select {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .data-table-wrap {
            overflow: visible !important;
            width: 100% !important;
          }
          .data-table {
            width: 100% !important;
            border-collapse: collapse !important;
            border: 1px solid #222222 !important;
          }
          .data-table th, .data-table td {
            border: 1px solid #444444 !important;
            padding: 8px !important;
            color: #000000 !important;
          }
          .kpi-card {
            border: 1px solid #888888 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
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
          <p className="page-subtitle">Audited financial distributions & sales ledgers</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={handlePrintPDF}>
            📄 Print PDF Report
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Calculated Revenue', value: `৳${(totalRevenue).toLocaleString()}`, accent: 'var(--brand-accent)' },
          { label: 'Calculated Cost', value: `৳${(totalCost).toLocaleString()}`, accent: '#F59E0B' },
          { label: 'Calculated Net Profit', value: `৳${(totalProfit).toLocaleString()}`, accent: '#10B981' },
          { label: 'Operating Margin', value: `${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`, accent: '#06B6D4' },
          { label: 'Unpaid / Receivable', value: `৳${(unpaidBalance).toLocaleString()}`, accent: '#EF4444' },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ borderLeft: `3px solid ${k.accent}` }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num" style={{ color: k.accent, fontSize: '1.35rem', fontWeight: 800 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Global Interactive Filter Panel */}
      <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="search-wrap" style={{ flex: '1 1 200px' }}>
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" style={{ width: '100%' }} placeholder="Search sales registry..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select className="form-select" style={{ flex: '1 1 140px' }} value={chemicalFilter} onChange={e => setChemicalFilter(e.target.value)}>
          <option value="">All Chemicals</option>
          {uniqueChemicals.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="form-select" style={{ flex: '1 1 140px' }} value={customerFilter} onChange={e => setCustomerFilter(e.target.value)}>
          <option value="">All Customers</option>
          {uniqueCustomers.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="form-select" style={{ flex: '1 1 120px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['paid', 'pending', 'overdue', 'partial'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="form-select" style={{ flex: '1 1 120px' }} value={timeframe} onChange={e => {
          setTimeframe(e.target.value);
          if (e.target.value !== 'Custom') {
            setCustomStartDate('');
            setCustomEndDate('');
          }
        }}>
          <option value="All Time">All Time</option>
          <option value="Daily">Daily (Today)</option>
          <option value="Weekly">Weekly (Last 7 Days)</option>
          <option value="Monthly">Monthly (June)</option>
          <option value="Yearly">Yearly (2026)</option>
          <option value="Custom">Custom Date Range...</option>
        </select>

        {timeframe === 'Custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
            <input 
              type="date" 
              className="form-input" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', flex: 1 }} 
              value={customStartDate} 
              onChange={e => setCustomStartDate(e.target.value)} 
              title="Start Date"
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>to</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', flex: 1 }} 
              value={customEndDate} 
              onChange={e => setCustomEndDate(e.target.value)} 
              title="End Date"
            />
          </div>
        )}

        <button className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }} onClick={() => {
          setSearch(''); setChemicalFilter(''); setCustomerFilter(''); setStatusFilter(''); setTimeframe('All Time');
          setCustomStartDate(''); setCustomEndDate('');
        }}>
          Reset
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-buttons" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {([
          { id: 'financial', label: '📊 Financial Performance' },
          { id: 'customer', label: '🏢 Customer Audits' },
          { id: 'chemical', label: '🧪 Chemical Sales Volume' },
          { id: 'ledger', label: '🧾 Full Sales Ledger' },
        ] as const).map(t => (
          <button key={t.id} className="btn btn-ghost btn-sm" onClick={() => setTab(t.id)}
            style={{
              borderRadius: '8px 8px 0 0',
              borderBottom: tab === t.id ? '2.5px solid var(--brand-accent)' : '2.5px solid transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: tab === t.id ? 700 : 500,
              padding: '0.75rem 1.25rem'
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {tab === 'financial' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* Bar Chart — Revenue vs Cost vs Profit */}
          <div className="chart-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '0.75rem' }}>
              <div>
                <div className="chart-title">Dynamic Sales Revenue vs Cost vs Net Profit</div>
                <div className="chart-subtitle">Calculated instantly from filtered transaction registry</div>
              </div>
              <span className="chart-badge green">Live · Filtered</span>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barCategoryGap="28%" barGap={4}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                      <stop offset="100%" stopColor="#9D55FF" stopOpacity={0.75} />
                    </linearGradient>
                    <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.75} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                      <stop offset="100%" stopColor="#34D399" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 500 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `৳${(v/1000).toFixed(0)}k`}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      padding: '0.625rem 0.875rem'
                    }}
                    formatter={(v: any, name: any) => [`৳${v?.toLocaleString()}`, name]}
                    cursor={{ fill: 'rgba(88,2,130,0.04)', radius: 4 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '0.78rem', color: 'var(--text-muted)', paddingTop: '0.75rem' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="revenue" name="Revenue"    fill="url(#revGrad)"  radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cost"    name="Cost"       fill="url(#costGrad)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit"  name="Net Profit" fill="url(#profGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Area Chart — Profit Trend */}
          <div className="chart-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.25rem', gap: '0.75rem' }}>
              <div>
                <div className="chart-title">Net Operating Profit Trend</div>
                <div className="chart-subtitle">Monthly profit trajectory across selected date range</div>
              </div>
              <span className="chart-badge">↑ Trend</span>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#10B981" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} width={52} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      padding: '0.625rem 0.875rem'
                    }}
                    formatter={(v: any) => [`৳${v?.toLocaleString()}`, 'Net Profit']}
                    cursor={{ stroke: '#10B981', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit"
                    stroke="#10B981"
                    strokeWidth={3}
                    fill="url(#areaProfit)"
                    dot={{ fill: '#fff', stroke: '#10B981', strokeWidth: 2.5, r: 5 }}
                    activeDot={{ r: 7, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab === 'customer' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Customer Entity</th>
                <th className="num">Orders Tracked</th>
                <th className="num">Calculated Revenue</th>
                <th className="num">Calculated Net Profit</th>
                <th className="num">Average Order Size</th>
                <th className="num">Margin (%)</th>
              </tr>
            </thead>
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
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No customer data fits current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'chemical' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Chemical Product</th>
                <th className="num">Total Quantity Sold</th>
                <th className="num">Total Revenue Generated</th>
                <th className="num">Total Profit Realized</th>
                <th className="num">Average Profit Margin</th>
              </tr>
            </thead>
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
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No chemical data fits current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Chemical</th>
                <th className="num">Qty</th>
                <th className="num">Total Revenue</th>
                <th className="num">Total Profit</th>
                <th className="num">Margin</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => {
                const amount = sale.qty * sale.sellPrice;
                const profit = amount - (sale.qty * sale.buyPrice);
                const margin = ((profit / amount) * 100).toFixed(1);
                
                let badgeClass = 'badge-success';
                if (sale.status === 'pending') badgeClass = 'badge-warning';
                else if (sale.status === 'overdue') badgeClass = 'badge-danger';
                else if (sale.status === 'partial') badgeClass = 'badge-info';

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
                    <td><span className={`badge ${badgeClass}`}>{sale.status}</span></td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No sales orders matched your active filters. Try resetting the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
