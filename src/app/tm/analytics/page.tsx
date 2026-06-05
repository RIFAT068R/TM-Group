'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts'
import CustomSelect from '@/components/CustomSelect'

const PIE_COLORS = ['var(--brand-accent)', '#06B6D4', '#10B981', '#F59E0B', '#A78BFA', '#EC4899', '#EF4444']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TMAnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [placements, setPlacements] = useState<any[]>([])

  const [simCountry, setSimCountry] = useState('Saudi Arabia')
  const [simWorkerFee, setSimWorkerFee] = useState(320000)
  const [simAgencyFee, setSimAgencyFee] = useState(30000)
  const [simProcessingCost, setSimProcessingCost] = useState(180000)
  const [simAgentKickback, setSimAgentKickback] = useState(25000)
  const [simOverheadPercent, setSimOverheadPercent] = useState(4)

  const fetchPlacements = async () => {
    try {
      const { createClient, isSupabaseConfigured } = await import('@/lib/supabase/client')
      if (!isSupabaseConfigured()) return
      const supabase = createClient()
      const { data } = await supabase
        .from('tm_placements')
        .select('id, destination_country, processing_start_date, departure_date, worker_fee, agency_fee, commission_amount, status, tm_workers(full_name), tm_agencies(name)')
        .order('created_at', { ascending: false })
      if (data) {
        setPlacements(data)
        try { localStorage.setItem('tm_analytics_placements', JSON.stringify(data)) } catch (e) {}
      }
    } catch (err: any) {
      console.error('TM Analytics fetch error:', err.message)
      try { const c = localStorage.getItem('tm_analytics_placements'); if (c) setPlacements(JSON.parse(c)) } catch (e) {}
    }
  }

  useEffect(() => {
    setMounted(true)
    try { const c = localStorage.getItem('tm_analytics_placements'); if (c) setPlacements(JSON.parse(c)) } catch (e) {}
    let channel: any
    const setup = async () => {
      const { isSupabaseConfigured, createClient } = await import('@/lib/supabase/client')
      if (isSupabaseConfigured()) {
        await fetchPlacements()
        const supabase = createClient()
        channel = supabase
          .channel('tm-analytics-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tm_placements' }, () => fetchPlacements())
          .subscribe()
      }
    }
    setup()
    return () => {
      if (channel) import('@/lib/supabase/client').then(({ createClient }) => createClient().removeChannel(channel))
    }
  }, [])

  // Calculator Computations
  const simTotalRevenue = simWorkerFee + simAgencyFee
  const simOverheadCost = simTotalRevenue * (simOverheadPercent / 100)
  const simTotalCost = simProcessingCost + simAgentKickback + simOverheadCost
  const simNetProfit = simTotalRevenue - simTotalCost
  const simMargin = simTotalRevenue > 0 ? (simNetProfit / simTotalRevenue) * 100 : 0

  let simHealth = 'CRITICAL'; let simHealthColor = '#EF4444'
  let simHealthDesc = 'Margin is below 10%. Expenses and agent kickbacks are too high.'
  if (simMargin >= 25) { simHealth = 'HIGHLY PROFITABLE'; simHealthColor = '#10B981'; simHealthDesc = 'Excellent margin! Healthy operational profit fully covering processing overheads.' }
  else if (simMargin >= 10) { simHealth = 'MODERATE / ACCEPTABLE'; simHealthColor = '#F59E0B'; simHealthDesc = 'Acceptable margins. Keep administrative overheads and local agent fees low.' }

  // ── Map placements to usable shape ──
  const mapped = placements.map((p: any) => ({
    date: p.departure_date || p.processing_start_date || '',
    country: p.destination_country || 'Unknown',
    agency: p.tm_agencies?.name || 'Direct',
    fee: Number(p.worker_fee || 0) + Number(p.agency_fee || 0) + Number(p.commission_amount || 0),
    status: p.status || 'processing',
  }))

  const totalRevenue = mapped.reduce((s, p) => s + p.fee, 0)
  const totalProfit  = Math.round(totalRevenue * 0.4)
  const avgFee = mapped.length > 0 ? Math.round(totalRevenue / mapped.length) : 0
  const activeCount = mapped.filter(p => p.status === 'working' || p.status === 'departed').length
  const successRate = mapped.length > 0 ? ((activeCount / mapped.length) * 100).toFixed(1) : '0.0'

  // ── Trend Data — last 6 months actual + 3 months forecast ──
  const trendData = (() => {
    const result: any[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const count = mapped.filter(p => p.date.startsWith(ym)).length
      result.push({ month: MONTHS[d.getMonth()], actual: count, forecast: null })
    }
    const last = result[result.length - 1].actual
    for (let i = 1; i <= 3; i++) {
      const d = new Date(); d.setMonth(d.getMonth() + i)
      result.push({ month: MONTHS[d.getMonth()], actual: null, forecast: last > 0 ? Math.round(last * Math.pow(1.08, i)) : null })
    }
    if (result.length >= 4) result[5].forecast = result[5].actual
    return result
  })()

  // ── Country Revenue Share ──
  const countryMap: Record<string, number> = {}
  mapped.forEach(p => { countryMap[p.country] = (countryMap[p.country] || 0) + p.fee })
  const countryShareData = Object.entries(countryMap)
    .map(([name, value], i) => ({ name, value, color: PIE_COLORS[i % PIE_COLORS.length] }))
    .sort((a, b) => b.value - a.value).slice(0, 6)

  // ── Agency Scatter Data ──
  const agencyMap: Record<string, { placements: number; revenue: number }> = {}
  mapped.forEach(p => {
    if (!agencyMap[p.agency]) agencyMap[p.agency] = { placements: 0, revenue: 0 }
    agencyMap[p.agency].placements += 1
    agencyMap[p.agency].revenue += p.fee
  })
  const agencyScatterData = Object.entries(agencyMap)
    .map(([name, d]) => ({ x: Math.round(d.revenue / 100000), y: d.placements, z: d.placements * 20, name }))
    .filter(d => d.y > 0)

  // ── Radar Data ──
  const maxRev = 5000000
  const radarData = [
    { metric: 'Placements', score: Math.min(100, Math.round((mapped.length / 50) * 100)) },
    { metric: 'Revenue',    score: Math.min(100, Math.round((totalRevenue / maxRev) * 100)) },
    { metric: 'Agencies',   score: Math.min(100, Object.keys(agencyMap).length * 15) },
    { metric: 'Workers',    score: Math.min(100, activeCount * 5) },
    { metric: 'Retention',  score: Number(successRate) },
    { metric: 'Growth',     score: mapped.length > 0 ? 65 : 0 },
  ]
  const avgScore = Math.round(radarData.reduce((s, x) => s + x.score, 0) / radarData.length)

  // Country list for simulator
  const uniqueCountries = Array.from(new Set(mapped.map(p => p.country).filter(Boolean)))
  const simCountries = uniqueCountries.length > 0 ? uniqueCountries : ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Malaysia']

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Analytics</span>
      </nav>
      
      <div className="page-header">
        <div>
          <h1 className="page-title">Advanced Analytics</h1>
          <p className="page-subtitle">
            {mapped.length > 0 ? `Live data · ${mapped.length} placements analysed` : 'Deep-dive performance metrics & interactive profit modeling'}
          </p>
        </div>
      </div>

      {/* Visual Chart Grid 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Line Chart — Placement Trend Forecast */}
        <div className="chart-card">
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
            <div>
              <div className="chart-title">3-Month Placements Forecast</div>
              <div className="chart-subtitle">Dashed line represents predictive placement trend forecasts</div>
            </div>
            <span className="chart-badge green">AI Forecast</span>
          </div>
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 10, right: 16, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualPlaceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    padding: '0.625rem 0.875rem'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '0.75rem' }} iconType="circle" iconSize={8} />
                <Line type="monotone" dataKey="actual" name="Actual Placements" stroke="var(--brand-accent)" strokeWidth={3} dot={{ fill: '#fff', stroke: 'var(--brand-accent)', strokeWidth: 2.5, r: 5 }} activeDot={{ r: 7, fill: 'var(--brand-accent)', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" name="Projected Forecast" stroke="#10B981" strokeWidth={2.5} strokeDasharray="6 4" dot={{ fill: '#fff', stroke: '#10B981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Doughnut Chart — Country Revenue Share */}
        <div className="chart-card">
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
            <div>
              <div className="chart-title">Placement Revenue Share</div>
              <div className="chart-subtitle">Percentage revenue contribution by destination countries</div>
            </div>
          <div className="chart-badge amber">Live</div>
          </div>
          {countryShareData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No placement data yet</div>
          ) : (
          <div style={{ display: 'flex', alignItems: 'center', height: '260px' }}>
            <div style={{ width: '55%', height: '100%' }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={countryShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {countryShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        padding: '0.625rem 0.875rem'
                      }}
                      formatter={(v: any) => [`৳${v?.toLocaleString()}`, 'Revenue']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Custom Doughnut Legend */}
            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem', paddingLeft: '0.5rem' }}>
              {countryShareData.map((c, i) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <div style={{ minWidth: '0', flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>৳{(c.value / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </div>

      </div>

      {/* Visual Chart Grid 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Radar Chart — Performance Overview */}
        <div className="chart-card">
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
            <div>
              <div className="chart-title">Placement Performance Radar</div>
              <div className="chart-subtitle">Overall score across operational categories</div>
            </div>
            <span className="chart-badge">Score · {avgScore}</span>
          </div>
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="var(--brand-accent)" fill="var(--brand-accent)" fillOpacity={0.18} strokeWidth={2.5} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Scatter Chart — Agency Performance Matrix */}
        <div className="chart-card">
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'0.25rem', gap:'0.75rem' }}>
            <div>
              <div className="chart-title">Agency Performance Bubble Matrix</div>
              <div className="chart-subtitle">Bubble size represents total placement fees generated (Lakh BDT)</div>
            </div>
            <span className="chart-badge blue">Agencies</span>
          </div>
          {agencyScatterData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No agency data yet</div>
          ) : mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="x" name="Revenue (L BDT)" unit="L" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Placements" unit=" workers" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.78rem' }} />
                <Scatter name="Agencies" data={agencyScatterData} fill="var(--brand-accent)" fillOpacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Simulator & Business Ratios Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Placement Profit & Margin Optimizer */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            ✈️ Dynamic Placement Margin Optimizer
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Adjust fee rates, processing flights, and local agent overheads to simulate placement profitability.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Destination Country</label>
                <CustomSelect value={simCountry} onChange={setSimCountry} style={{ width: '100%' }}
                  options={simCountries.map(c => ({ value: c, label: c }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Worker Fee (৳ BDT)</label>
                <input type="number" className="form-input" value={simWorkerFee} onChange={e => setSimWorkerFee(Math.max(0, +e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Agency Fee (৳ BDT)</label>
                <input type="number" className="form-input" value={simAgencyFee} onChange={e => setSimAgencyFee(Math.max(0, +e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Processing & Flight (৳)</label>
                <input type="number" className="form-input" value={simProcessingCost} onChange={e => setSimProcessingCost(Math.max(0, +e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Local Agent Kickback (৳)</label>
                <input type="number" className="form-input" value={simAgentKickback} onChange={e => setSimAgentKickback(Math.max(0, +e.target.value))} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Administrative Taxes & Overheads (%)</label>
                <input type="number" className="form-input" value={simOverheadPercent} onChange={e => setSimOverheadPercent(Math.max(0, +e.target.value))} />
              </div>
            </div>

            {/* Calculations Dashboard */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Projected Total Cost:</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>৳{Math.round(simTotalCost).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Projected Gross Revenue:</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>৳{Math.round(simTotalRevenue).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Net Profit per Worker:</span>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: simNetProfit >= 0 ? '#10B981' : '#EF4444' }}>
                    ৳{Math.round(simNetProfit).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Net Profit Margin:</span>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: simHealthColor }}>
                    {simMargin.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Live Safety Badge */}
              <div style={{ borderLeft: `3.5px solid ${simHealthColor}`, background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700, color: simHealthColor, marginBottom: '0.2rem' }}>PROJECTED HEALTH: {simHealth}</div>
                <div style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>{simHealthDesc}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Key Placements Ratios */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            📈 Key Manpower Placement Ratios
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Key business ratios and operational safety indices required for TM Overseas audits.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Total Placements',    value: String(mapped.length),                          desc: 'All-time placements recorded', color: '#A78BFA' },
              { label: 'Active / Deployed',    value: String(activeCount),                            desc: 'Working or departed', color: '#10B981' },
              { label: 'Worker Success Rate',  value: `${successRate}%`,                              desc: 'Workers working or departed', color: 'var(--brand-accent)' },
              { label: 'Total Revenue',        value: `৳${(totalRevenue / 100000).toFixed(1)}L`,     desc: 'All-time gross revenue', color: '#06B6D4' },
              { label: 'Est. Net Profit',      value: `৳${(totalProfit / 100000).toFixed(1)}L`,      desc: 'Estimated 40% margin', color: '#10B981' },
              { label: 'Avg Revenue/Worker',   value: avgFee > 0 ? `৳${avgFee.toLocaleString()}` : '—', desc: 'Average gross per placement', color: '#F59E0B' },
            ].map(r => (
              <div key={r.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{r.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, color: r.color, lineHeight: 1.1, marginBottom: '0.2rem' }}>{r.value}</div>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
