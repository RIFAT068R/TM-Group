'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts'
import CustomSelect from '@/components/CustomSelect'

// Radar data for overall metrics
const radarData = [
  { metric: 'Placements', score: 82 },
  { metric: 'Revenue',    score: 74 },
  { metric: 'Agencies',   score: 68 },
  { metric: 'Workers',    score: 90 },
  { metric: 'Retention',  score: 71 },
  { metric: 'Growth',     score: 78 },
]

// 3-Month Placements Trend Forecast data (continuous actual and forecast lines)
const trendData = [
  { month: 'Jan', actual: 12, forecast: null },
  { month: 'Feb', actual: 16, forecast: null },
  { month: 'Mar', actual: 14, forecast: null },
  { month: 'Apr', actual: 20, forecast: null },
  { month: 'May', actual: 24, forecast: null },
  { month: 'Jun', actual: 28, forecast: 28 }, // Continuous join
  { month: 'Jul', actual: null, forecast: 32 },
  { month: 'Aug', actual: null, forecast: 35 },
  { month: 'Sep', actual: null, forecast: 40 },
]

// Country Placement Revenue Share (Doughnut Chart)
const countryShareData = [
  { name: 'Saudi Arabia', value: 3240000, color: 'var(--brand-accent)' },
  { name: 'UAE',          value: 1925000, color: '#06B6D4' },
  { name: 'Kuwait',       value: 1260000, color: '#10B981' },
  { name: 'Qatar',        value: 1056000, color: '#F59E0B' },
  { name: 'Malaysia',     value: 504000,  color: '#A78BFA' },
  { name: 'Romania',      value: 400000,  color: '#EC4899' },
]

// Agency Matrix Bubble Chart Data
const agencyScatterData = [
  { x: 8.5,  y: 48, z: 324, name: 'Al Najah Recruitment' },
  { x: 7.0,  y: 35, z: 192, name: 'Gulf Manpower Solutions' },
  { x: 9.0,  y: 12, z: 50,  name: 'Asia Pacific Recruiters' },
  { x: 6.5,  y: 22, z: 105, name: 'Qatar Employment Agency' },
  { x: 10.0, y: 10, z: 40,  name: 'Korea Manpower Corp' },
]

export default function TMAnalyticsPage() {
  const [mounted, setMounted] = useState(false)

  // Profit Simulator State
  const [simCountry, setSimCountry] = useState('Saudi Arabia')
  const [simWorkerFee, setSimWorkerFee] = useState(320000)
  const [simAgencyFee, setSimAgencyFee] = useState(30000)
  const [simProcessingCost, setSimProcessingCost] = useState(180000)
  const [simAgentKickback, setSimAgentKickback] = useState(25000)
  const [simOverheadPercent, setSimOverheadPercent] = useState(4) // administrative tax & overhead percentage

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculator Computations
  const simTotalRevenue = simWorkerFee + simAgencyFee
  const simOverheadCost = simTotalRevenue * (simOverheadPercent / 100)
  const simTotalCost = simProcessingCost + simAgentKickback + simOverheadCost
  const simNetProfit = simTotalRevenue - simTotalCost
  const simMargin = simTotalRevenue > 0 ? (simNetProfit / simTotalRevenue) * 100 : 0

  let simHealth = 'CRITICAL'
  let simHealthColor = '#EF4444'
  let simHealthDesc = 'Margin is below 10%. Expenses and agent kickbacks are too high relative to the worker fee.'
  if (simMargin >= 25) {
    simHealth = 'HIGHLY PROFITABLE'
    simHealthColor = '#10B981'
    simHealthDesc = 'Excellent margin! Healthy operational profit fully covering processing overheads.'
  } else if (simMargin >= 10) {
    simHealth = 'MODERATE / ACCEPTABLE'
    simHealthColor = '#F59E0B'
    simHealthDesc = 'Acceptable margins. Keep administrative overheads and local agent fees low.'
  }

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
          <p className="page-subtitle">Deep-dive performance metrics & interactive profit modeling for TM Overseas</p>
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
            <span className="chart-badge amber">2026</span>
          </div>
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
              {countryShareData.map(c => (
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
            <span className="chart-badge">Score · 77</span>
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
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="x" name="Commission Rate" unit="%" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
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
                <CustomSelect
                  value={simCountry}
                  onChange={setSimCountry}
                  style={{ width: '100%' }}
                  options={['Saudi Arabia','UAE','Qatar','Kuwait','Malaysia','Romania','South Korea'].map(c => ({ value: c, label: c }))}
                />
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
              { label: 'Gross Profit Margin', value: '40.0%', desc: 'Direct placement profit index', color: '#10B981' },
              { label: 'Worker Success Rate', value: '87.0%', desc: 'Workers successfully deployed', color: 'var(--brand-accent)' },
              { label: 'Avg Processing Days', value: '45 days', desc: 'Average time for visa approval', color: '#06B6D4' },
              { label: 'YoY Placement Growth', value: '+28.0%', desc: 'Annual scaling speed of workers', color: '#7C3AED' },
              { label: 'Retention Rate (1yr)', value: '72.0%', desc: 'Workers staying abroad over 1 year', color: '#F59E0B' },
              { label: 'Avg Revenue per Worker', value: '৳18,400', desc: 'Average gross processing returns', color: '#10B981' },
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
