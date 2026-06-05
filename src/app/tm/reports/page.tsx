'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import CustomSelect from '@/components/CustomSelect'
import DatePicker from '@/components/DatePicker'

// Default rich mock placements dataset for the year 2026
const defaultMockPlacements = [
  { id: 'PL-2026-001', date: '2026-01-10', worker: 'Mohammad Alam', passport: 'EE1234567', country: 'Saudi Arabia', agency: 'Al Najah Recruitment', fee: 350000, salary: 1200, status: 'working' },
  { id: 'PL-2026-002', date: '2026-01-18', worker: 'Fatima Begum', passport: 'EE7654321', country: 'Malaysia', agency: 'Asia Pacific Recruiters', fee: 280000, salary: 1000, status: 'processing' },
  { id: 'PL-2026-003', date: '2026-02-05', worker: 'Karim Mia', passport: 'EE9876543', country: 'UAE', agency: 'Gulf Manpower Solutions', fee: 320000, salary: 1500, status: 'visa_approved' },
  { id: 'PL-2026-004', date: '2026-02-15', worker: 'Roshida Khatun', passport: 'EE3456789', country: 'Qatar', agency: 'Qatar Employment Agency', fee: 300000, salary: 1100, status: 'working' },
  { id: 'PL-2026-005', date: '2026-03-02', worker: 'Abdul Mannan', passport: 'EE4567890', country: 'South Korea', agency: 'Korea Manpower Corp', fee: 450000, salary: 2000, status: 'processing' },
  { id: 'PL-2026-006', date: '2026-03-12', worker: 'Kamal Hossain', passport: 'EE5678901', country: 'Saudi Arabia', agency: 'Al Najah Recruitment', fee: 360000, salary: 1250, status: 'departed' },
  { id: 'PL-2026-007', date: '2026-04-05', worker: 'Abul Kashem', passport: 'EE6789012', country: 'UAE', agency: 'Gulf Manpower Solutions', fee: 330000, salary: 1400, status: 'working' },
  { id: 'PL-2026-008', date: '2026-04-22', worker: 'Sajeda Begum', passport: 'EE7890123', country: 'Malaysia', agency: 'Asia Pacific Recruiters', fee: 290000, salary: 950, status: 'returned' },
  { id: 'PL-2026-009', date: '2026-05-08', worker: 'Mizanur Rahman', passport: 'EE8901234', country: 'Saudi Arabia', agency: 'Al Najah Recruitment', fee: 350000, salary: 1200, status: 'working' },
  { id: 'PL-2026-010', date: '2026-05-24', worker: 'Nur Islam', passport: 'EE9012345', country: 'Kuwait', agency: 'Kuwait Manpower Co.', fee: 310000, salary: 1300, status: 'visa_approved' },
  { id: 'PL-2026-011', date: '2026-05-30', worker: 'Farhana Yasmin', passport: 'EE1112223', country: 'Qatar', agency: 'Qatar Employment Agency', fee: 300000, salary: 1150, status: 'working' },
  { id: 'PL-2026-012', date: '2026-06-01', worker: 'Jahanara Akhtar', passport: 'EE0123456', country: 'Romania', agency: 'EuroLink Manpower', fee: 400000, salary: 1800, status: 'processing' },
  { id: 'PL-2026-013', date: '2026-06-02', worker: 'Belal Hossain', passport: 'EE2223334', country: 'Saudi Arabia', agency: 'Al Najah Recruitment', fee: 350000, salary: 1200, status: 'departed' }
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function TMReportsPage() {
  const [tab, setTab] = useState<'financial'|'country'|'placement'>('financial')
  const [mounted, setMounted] = useState(false)
  const [placementsList, setPlacementsList] = useState<any[]>(defaultMockPlacements);

  // Filters State
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [timeframe, setTimeframe] = useState('All Time')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  useEffect(() => {
    setMounted(true)

    // Load active placements from Supabase to merge with mock dataset
    const loadPlacementsFromSupabase = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data: dbPlacements } = await supabase
          .from('tm_placements')
          .select(`
            id,
            reference_number,
            destination_country,
            processing_start_date,
            departure_date,
            worker_fee,
            agency_fee,
            commission_amount,
            salary_amount,
            status,
            tm_workers(full_name, passport_number),
            tm_agencies(name)
          `);

        if (dbPlacements && dbPlacements.length > 0) {
          const mapped = dbPlacements.map((item: any) => {
            const date = item.departure_date || item.processing_start_date || new Date().toISOString().split('T')[0];
            const workerName = item.tm_workers?.full_name || 'Unknown';
            const passport = item.tm_workers?.passport_number || 'Unknown';
            const agencyName = item.tm_agencies?.name || 'Direct';
            const country = item.destination_country || 'Unknown';
            const fee = Number(item.worker_fee || 0) + Number(item.agency_fee || 0) + Number(item.commission_amount || 0);
            const salary = Number(item.salary_amount || 0);
            const status = item.status || 'processing';

            return {
              id: item.reference_number || `PL-${item.id.slice(0, 8)}`,
              date,
              worker: workerName,
              passport,
              country,
              agency: agencyName,
              fee: fee > 0 ? fee : 300000,
              salary,
              status
            };
          });

          // Prepend actual db placements to mock dataset
          setPlacementsList([...mapped, ...defaultMockPlacements]);
        }
      } catch (err) {
        console.error('Failed to load database placements:', err);
      }
    };

    loadPlacementsFromSupabase();
  }, []);

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

    // Timeframe filtering based on system local date
    let matchesTime = true;
    const pDate = new Date(p.date);
    const today = new Date('2026-06-05');

    if (timeframe === 'Daily') {
      matchesTime = p.date === '2026-06-05';
    } else if (timeframe === 'Weekly') {
      const oneWeekAgo = new Date('2026-05-29');
      matchesTime = pDate >= oneWeekAgo && pDate <= today;
    } else if (timeframe === 'Monthly') {
      matchesTime = p.date.startsWith('2026-06');
    } else if (timeframe === 'Yearly') {
      matchesTime = p.date.startsWith('2026');
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

  // Dynamic Chart aggregations
  const dynamicMonthlyData = months.map((month, idx) => {
    const monthPrefix = `2026-0${idx + 1}-`;
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
            { value: 'Daily', label: 'Daily (Today)' },
            { value: 'Weekly', label: 'Weekly (Last 7 Days)' },
            { value: 'Monthly', label: 'Monthly (June)' },
            { value: 'Yearly', label: 'Yearly (2026)' },
            { value: 'Custom', label: 'Custom Date Range...' },
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
