'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import CustomSelect from '@/components/CustomSelect'
import DatePicker from '@/components/DatePicker'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TMReportsPage() {
  const [tab, setTab] = useState<'financial'|'country'|'placement'>('financial')
  const [mounted, setMounted] = useState(false)
  const [placementsList, setPlacementsList] = useState<any[]>([])

  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [timeframe, setTimeframe] = useState('All Time')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const fetchPlacements = async () => {
    try {
      const { createClient, isSupabaseConfigured } = await import('@/lib/supabase/client')
      if (!isSupabaseConfigured()) return
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tm_placements')
        .select('id, reference_number, destination_country, processing_start_date, departure_date, worker_fee, agency_fee, commission_amount, salary_amount, status, tm_workers(full_name, passport_number), tm_agencies(name)')
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      if (data) {
        const mapped = data.map((item: any) => ({
          id: item.reference_number || `PL-${String(item.id).slice(0, 8)}`,
          date: item.departure_date || item.processing_start_date || '',
          worker: item.tm_workers?.full_name || 'Unknown',
          passport: item.tm_workers?.passport_number || '—',
          country: item.destination_country || 'Unknown',
          agency: item.tm_agencies?.name || 'Direct',
          fee: Number(item.worker_fee || 0) + Number(item.agency_fee || 0) + Number(item.commission_amount || 0),
          salary: Number(item.salary_amount || 0),
          status: item.status || 'processing',
        }))
        setPlacementsList(mapped)
        try { localStorage.setItem('tm_reports_placements', JSON.stringify(mapped)) } catch (e) {}
      }
    } catch (err: any) {
      console.error('TM Reports fetch error:', err.message)
      try { const c = localStorage.getItem('tm_reports_placements'); if (c) setPlacementsList(JSON.parse(c)) } catch (e) {}
    }
  }

  useEffect(() => {
    setMounted(true)
    try { const c = localStorage.getItem('tm_reports_placements'); if (c) setPlacementsList(JSON.parse(c)) } catch (e) {}
    let channel: any
    const setup = async () => {
      const { isSupabaseConfigured, createClient } = await import('@/lib/supabase/client')
      if (isSupabaseConfigured()) {
        await fetchPlacements()
        const supabase = createClient()
        channel = supabase
          .channel('tm-reports-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tm_placements' }, () => fetchPlacements())
          .subscribe()
      }
    }
    setup()
    return () => {
      if (channel) import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel))
    }
  }, [])

  // Multi-dimensional filtering logic
  const filteredPlacements = placementsList.filter(p => {
    const matchesSearch = p.worker.toLowerCase().includes(search.toLowerCase()) ||
                          p.passport.toLowerCase().includes(search.toLowerCase()) ||
                          p.agency.toLowerCase().includes(search.toLowerCase()) ||
                          p.country.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase());

    const matchesCountry = countryFilter ? p.country === countryFilter : true;
    const matchesAgency = agencyFilter ? p.agency === agencyFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;

    // Dynamic timeframe filtering
    let matchesTime = true;
    const pDate = new Date(p.date);
    const now = new Date(); now.setHours(23, 59, 59, 999);
    const todayStr = new Date().toISOString().split('T')[0];
    const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (timeframe === 'Daily') {
      matchesTime = p.date === todayStr;
    } else if (timeframe === 'Weekly') {
      const oneWeekAgo = new Date(now); oneWeekAgo.setDate(now.getDate() - 7);
      matchesTime = pDate >= oneWeekAgo && pDate <= now;
    } else if (timeframe === 'Monthly') {
      matchesTime = p.date.startsWith(thisMonthStr);
    } else if (timeframe === 'Yearly') {
      matchesTime = p.date.startsWith(String(now.getFullYear()));
    } else if (timeframe === 'Custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;
      if (start && end) {
        matchesTime = pDate >= start && pDate <= end;
      } else if (start) {
        matchesTime = pDate >= start;
      } else if (end) {
        matchesTime = pDate <= end;
      }
    }

    return matchesSearch && matchesCountry && matchesAgency && matchesStatus && matchesTime;
  });

  // Dynamic KPI Metric calculations
  const totalRev = filteredPlacements.reduce((s, m) => s + m.fee, 0);
  // Expenses calculated as roughly 60% of total revenue
  const totalExpenses = Math.round(totalRev * 0.6);
  const totalProfit = totalRev - totalExpenses;
  const totalPlacementsCount = filteredPlacements.length;
  const activeWorkersCount = filteredPlacements.filter(p => p.status === 'working' || p.status === 'departed').length;

  // Dynamic Chart aggregations — last 6 months
  const dynamicMonthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const monthPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const month = MONTHS[d.getMonth()];
    const monthPlacements = filteredPlacements.filter(p => p.date.startsWith(monthPrefix));
    
    const revenue = monthPlacements.reduce((sum, p) => sum + p.fee, 0);
    const expenses = Math.round(revenue * 0.6);
    const profit = revenue - expenses;
    const placements = monthPlacements.length;

    return { month, revenue, expenses, profit, placements };
  });

  // Dynamic Country Report groupings
  const countryMap: Record<string, { workers: number, revenue: number, fees: number }> = {};
  filteredPlacements.forEach(p => {
    if (!countryMap[p.country]) {
      countryMap[p.country] = { workers: 0, revenue: 0, fees: 0 };
    }
    countryMap[p.country].workers += 1;
    countryMap[p.country].fees += p.fee;
    // Revenue counts as commission + fee portion (around 40% margin)
    countryMap[p.country].revenue += Math.round(p.fee * 0.4);
  });

  const dynamicCountryReport = Object.entries(countryMap).map(([country, data]) => ({
    country,
    workers: data.workers,
    revenue: data.revenue,
    fees: data.fees
  })).sort((a, b) => b.fees - a.fees);

  // CSV Export utility
  const handleExportCSV = () => {
    if (filteredPlacements.length === 0) {
      alert('No placements data available for active filters.');
      return;
    }
    const headers = ['Placement ID', 'Date', 'Worker Name', 'Passport Number', 'Country', 'Recruiting Agency', 'Revenue Fee (BDT)', 'Worker Salary (USD)', 'Status'];
    const rows = filteredPlacements.map(p => [
      p.id,
      p.date,
      `"${p.worker}"`,
      p.passport,
      `"${p.country}"`,
      `"${p.agency}"`,
      p.fee,
      p.salary,
      p.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TM_Placements_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print trigger
  const handlePrintPDF = () => {
    window.print();
  };

  // Get unique countries and agencies for dynamic dropdown options
  const uniqueCountries = Array.from(new Set(placementsList.map(p => p.country)));
  const uniqueAgencies = Array.from(new Set(placementsList.map(p => p.agency)));

  return (
    <div style={{ position: 'relative' }}>
      {/* Print-specific style overrides */}
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
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Reports</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Business Reports</h1>
          <p className="page-subtitle">Manpower placement &amp; revenue reporting</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <button className="btn btn-tm" onClick={handlePrintPDF}>
            📄 Print PDF Report
          </button>
        </div>
      </div>

      {/* Dynamic KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Revenue',   value:`৳${(totalRev).toLocaleString()}`,    accent:'#7C3AED' },
          { label:'Estimated Expenses', value:`৳${(totalExpenses).toLocaleString()}`, accent:'#F59E0B' },
          { label:'Total Net Profit',    value:`৳${(totalProfit).toLocaleString()}`,  accent:'#10B981' },
          { label:'Avg Profit Margin',     value:`${totalRev > 0 ? ((totalProfit/totalRev)*100).toFixed(1) : 0}%`, accent:'#06B6D4' },
          { label:'Total Placements',      value:`${totalPlacementsCount}`,                    accent:'#A78BFA' },
          { label:'Active Workers',        value:`${activeWorkersCount}`,                      accent:'#EC4899' },
        ].map(k=>(
          <div key={k.label} className="kpi-card" style={{ borderLeft: `3px solid ${k.accent}` }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value num" style={{ color:k.accent, fontSize:'1.35rem', fontWeight: 800 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Global Interactive Filter Panel */}
      <div className="filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div className="search-wrap" style={{ flex: '1 1 200px' }}>
          <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="form-input" style={{ width: '100%' }} placeholder="Search placements..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <CustomSelect
          value={countryFilter}
          onChange={setCountryFilter}
          style={{ flex: '1 1 140px', minWidth: 140 }}
          options={[
            { value: '', label: 'All Countries' },
            ...uniqueCountries.map(c => ({ value: c, label: c }))
          ]}
        />

        <CustomSelect
          value={agencyFilter}
          onChange={setAgencyFilter}
          style={{ flex: '1 1 140px', minWidth: 140 }}
          options={[
            { value: '', label: 'All Agencies' },
            ...uniqueAgencies.map(a => ({ value: a, label: a }))
          ]}
        />

        <CustomSelect
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ flex: '1 1 120px', minWidth: 120 }}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'processing', label: 'Processing' },
            { value: 'visa_approved', label: 'Visa Approved' },
            { value: 'departed', label: 'Departed' },
            { value: 'working', label: 'Working / Deployed' },
            { value: 'returned', label: 'Returned' },
          ]}
        />

        <CustomSelect
          value={timeframe}
          onChange={v => {
            setTimeframe(v);
            if (v !== 'Custom') { setCustomStartDate(''); setCustomEndDate(''); }
          }}
          style={{ flex: '1 1 120px', minWidth: 140 }}
          options={[
            { value: 'All Time', label: 'All Time' },
            { value: 'Daily', label: 'Today' },
            { value: 'Weekly', label: 'Last 7 Days' },
            { value: 'Monthly', label: 'This Month' },
            { value: 'Yearly', label: 'This Year' },
            { value: 'Custom', label: 'Custom Range...' },
          ]}
        />

        {timeframe === 'Custom' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 300px' }}>
            <DatePicker
              value={customStartDate}
              onChange={setCustomStartDate}
              placeholder="Start date"
              style={{ flex: 1 }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', flexShrink: 0 }}>to</span>
            <DatePicker
              value={customEndDate}
              onChange={setCustomEndDate}
              placeholder="End date"
              style={{ flex: 1 }}
            />
          </div>
        )}

        <button className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }} onClick={() => {
          setSearch(''); setCountryFilter(''); setAgencyFilter(''); setStatusFilter(''); setTimeframe('All Time');
          setCustomStartDate(''); setCustomEndDate('');
        }}>
          Reset
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-buttons" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {(['financial','country','placement'] as const).map(t=>(
          <button key={t} className="btn btn-ghost btn-sm" onClick={()=>setTab(t)}
            style={{ 
              borderRadius:'8px 8px 0 0', 
              borderBottom: tab===t ? '2.5px solid var(--brand-accent)' : '2.5px solid transparent', 
              color: tab===t ? 'var(--text-primary)' : 'var(--text-muted)', 
              fontWeight: tab===t ? 700 : 500,
              padding: '0.75rem 1.25rem'
            }}>
            {t==='financial' ? '💰 Financial Performance' : t==='country' ? '🌍 Country Analysis' : '✈️ Placements Ledger'}
          </button>
        ))}
      </div>

      {/* Financial Tab */}
      {tab==='financial' && (
        <>
          {/* Bar Chart — Revenue vs Expenses vs Profit */}
          <div className="chart-card" style={{ marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
              <div>
                <div className="chart-title">Dynamic Placement Revenue &amp; Net Profit</div>
                <div className="chart-subtitle">Calculated instantly from filtered placements registry</div>
              </div>
              <span className="chart-badge green">Live · Filtered</span>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dynamicMonthlyData} barCategoryGap="28%" barGap={4}>
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
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:12, fontWeight:500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`৳${(v/1000).toFixed(0)}k`} width={52} />
                  <Tooltip
                    contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', fontSize:'0.78rem', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', padding:'0.625rem 0.875rem' }}
                    formatter={(v:any, name:any)=>[`৳${v?.toLocaleString()}`, name]}
                    cursor={{ fill:'rgba(124,58,237,0.06)', radius:4 }}
                  />
                  <Legend wrapperStyle={{ fontSize:'0.78rem', color:'var(--text-muted)', paddingTop:'0.75rem' }} iconType="circle" iconSize={8} />
                  <Bar dataKey="revenue"  name="Revenue"  fill="url(#tmRevGrad)"  radius={[6,6,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="url(#tmExpGrad)"  radius={[6,6,0,0]} />
                  <Bar dataKey="profit"   name="Net Profit"   fill="url(#tmProfGrad)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Area Chart — Placements Trend */}
          <div className="chart-card">
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
              <div>
                <div className="chart-title">Dynamic Worker Placements Trend</div>
                <div className="chart-subtitle">Monthly placement activity based on selected date range</div>
              </div>
              <span className="chart-badge">↑ Trend</span>
            </div>
            {mounted && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dynamicMonthlyData} margin={{ top:10, right:16, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="tmPlaceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#A78BFA" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip
                    contentStyle={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', fontSize:'0.78rem', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', padding:'0.625rem 0.875rem' }}
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

      {/* Country Analysis Tab */}
      {tab==='country' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Destination Country</th>
                <th className="num">Active Placements</th>
                <th className="num">Total Revenue Generated (৳)</th>
                <th className="num">Calculated Net Profit (৳)</th>
                <th className="num">Average Fee / Worker</th>
              </tr>
            </thead>
            <tbody>
              {dynamicCountryReport.map((c,i)=>(
                <tr key={c.country}>
                  <td style={{ color:'var(--text-muted)' }}>#{i+1}</td>
                  <td style={{ fontWeight:600, color:'var(--text-primary)' }}>🌍 {c.country}</td>
                  <td className="num" style={{ color:'#A78BFA' }}>{c.workers}</td>
                  <td className="num" style={{ color:'#10B981', fontWeight:700 }}>৳{c.fees.toLocaleString()}</td>
                  <td className="num" style={{ fontWeight:600 }}>৳{c.revenue.toLocaleString()}</td>
                  <td className="num">৳{Math.round(c.fees/c.workers).toLocaleString()}</td>
                </tr>
              ))}
              {dynamicCountryReport.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No country reports fit your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Placements Ledger Tab */}
      {tab==='placement' && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Placement ID</th>
                <th>Date</th>
                <th>Worker Name</th>
                <th>Passport</th>
                <th>Destination Country</th>
                <th>Recruiting Agency</th>
                <th className="num">Revenue Fee</th>
                <th className="num">Worker Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlacements.map(p => {
                let badgeClass = 'badge-success';
                if (p.status === 'processing') badgeClass = 'badge-warning';
                else if (p.status === 'visa_approved') badgeClass = 'badge-info';
                else if (p.status === 'departed') badgeClass = 'badge-secondary';
                else if (p.status === 'returned') badgeClass = 'badge-danger';

                return (
                  <tr key={p.id}>
                    <td>
                      <span className="num" style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>
                        {p.id}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>{p.date}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{p.worker}</td>
                    <td>{p.passport}</td>
                    <td>🌍 {p.country}</td>
                    <td>{p.agency}</td>
                    <td className="num" style={{ color: '#10B981', fontWeight: 700 }}>৳{p.fee.toLocaleString()}</td>
                    <td className="num" style={{ fontWeight: 600 }}>${p.salary.toLocaleString()}/mo</td>
                    <td><span className={`badge ${badgeClass}`}>{p.status.replace('_', ' ')}</span></td>
                  </tr>
                );
              })}
              {filteredPlacements.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    No placements matched your active filters. Try resetting the filters.
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
