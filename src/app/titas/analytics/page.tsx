'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ZAxis, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts'

// High-fidelity performance radar data
const radarData = [
  { metric: 'Revenue',   score: 85 },
  { metric: 'Profit',    score: 78 },
  { metric: 'Customers', score: 65 },
  { metric: 'Volume',    score: 72 },
  { metric: 'Margin',    score: 88 },
  { metric: 'Growth',    score: 70 },
]

// Customer scatter / bubble chart data
const scatterData = [
  { x: 412000, y: 128000, z: 180, name: 'ACI Limited' },
  { x: 298000, y: 94000,  z: 120, name: 'Square Pharma' },
  { x: 187500, y: 58000,  z: 90,  name: 'Renata Ltd' },
  { x: 143000, y: 44000,  z: 70,  name: 'BRAC' },
  { x: 98000,  y: 28000,  z: 50,  name: 'Bashundhara' },
]

// Product revenue share data (Doughnut)
const chemicalShareData = [
  { name: 'Sulfuric Acid', value: 540000, color: 'var(--brand-accent)' },
  { name: 'Sodium Hydroxide', value: 304000, color: '#06B6D4' },
  { name: 'Ethanol', value: 294000, color: '#10B981' },
  { name: 'Hydrochloric Acid', value: 224000, color: '#8E8D8C' },
  { name: 'Acetone', value: 168000, color: '#F59E0B' },
]

// 3-Month Sales Trend Forecast data (Dynamic connecting lines)
const trendData = [
  { month: 'Jan', actual: 185000, forecast: null },
  { month: 'Feb', actual: 210000, forecast: null },
  { month: 'Mar', actual: 175000, forecast: null },
  { month: 'Apr', actual: 240000, forecast: null },
  { month: 'May', actual: 295000, forecast: null },
  { month: 'Jun', actual: 320000, forecast: 320000 }, // Continuous join between actual and forecast!
  { month: 'Jul', actual: null, forecast: 345000 },
  { month: 'Aug', actual: null, forecast: 370000 },
  { month: 'Sep', actual: null, forecast: 405000 },
]

export default function TitasAnalyticsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Margin Optimizer & Profit Simulator State
  const [simName, setSimName] = useState('Sulfuric Acid')
  const [simBuyPrice, setSimBuyPrice] = useState(85)
  const [simSellPrice, setSimSellPrice] = useState(120)
  const [simQty, setSimQty] = useState(1000)
  const [simOverhead, setSimOverhead] = useState(5) // overhead percentage

  // Calculator computations
  const simOverheadCost = simBuyPrice * (simOverhead / 100)
  const simTotalUnitCost = simBuyPrice + simOverheadCost
  const simTotalCost = simTotalUnitCost * simQty
  const simTotalRevenue = simSellPrice * simQty
  const simTotalProfit = simTotalRevenue - simTotalCost
  const simMargin = simTotalRevenue > 0 ? (simTotalProfit / simTotalRevenue) * 100 : 0

  let simHealth = 'CRITICAL'
  let simHealthColor = '#EF4444'
  let simHealthDesc = 'Margin is below 10%. This is highly risky for chemical import overheads.'
  if (simMargin >= 30) {
    simHealth = 'SAFE & ROBUST'
    simHealthColor = '#10B981'
    simHealthDesc = 'Excellent margin! Fully covers import overheads and delivers high returns.'
  } else if (simMargin >= 15) {
    simHealth = 'MODERATE / ACCEPTABLE'
    simHealthColor = '#F59E0B'
    simHealthDesc = 'Tight margins. Ensure currency stability and rapid inventory turnover.'
  }

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Analytics</span>
      </nav>

      <div className="page-header">
        <div>
          <h1 className="page-title">Advanced Analytics</h1>
          <p className="page-subtitle">Interactive business forecasting & profitability modeling</p>
        </div>
      </div>

      {/* Analytics Visual Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Predictive Trend Card */}
        <div className="chart-card">
          <div className="chart-title">3-Month Sales Trend Forecast</div>
          <div className="chart-subtitle">Dashed line represents predictive sales volume forecasts</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.78rem' }} formatter={(v: any) => [`৳${v?.toLocaleString()}`, '']} />
                <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
                <Line type="monotone" dataKey="actual" name="Actual Revenue" stroke="var(--brand-accent)" strokeWidth={3.5} dot={{ fill: 'var(--brand-accent)', r: 4 }} />
                <Line type="monotone" dataKey="forecast" name="Projected Forecast" stroke="#10B981" strokeWidth={3} strokeDasharray="6 4" dot={{ fill: '#10B981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Product Revenue Share Doughnut Card */}
        <div className="chart-card">
          <div className="chart-title">Chemical Revenue Share</div>
          <div className="chart-subtitle">Percentage revenue contribution by key chemicals</div>
          <div style={{ display: 'flex', alignItems: 'center', height: '260px' }}>
            <div style={{ width: '60%', height: '100%' }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chemicalShareData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chemicalShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.78rem' }} formatter={(v: any) => [`৳${v?.toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Custom Doughnut Legend */}
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
              {chemicalShareData.map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: c.color }} />
                  <div style={{ minWidth: '0', flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>৳{(c.value / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Business Performance Radar */}
        <div className="chart-card">
          <div className="chart-title">Business Performance Radar</div>
          <div className="chart-subtitle">Overall score across six operational metrics</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="var(--brand-accent)" fill="var(--brand-accent)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Customer Value vs Profit Scatter/Bubble */}
        <div className="chart-card">
          <div className="chart-title">Customer Value vs Profit Bubble Matrix</div>
          <div className="chart-subtitle">Size of bubble correlates to number of orders</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="x" name="Revenue" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <YAxis type="number" dataKey="y" name="Profit"  tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.78rem' }} formatter={(v: any, name: any) => [`৳${v?.toLocaleString()}`, name]} />
                <Scatter name="Customers" data={scatterData} fill="var(--brand-accent)" fillOpacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Margin Optimizer Simulator & Business Ratios Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Margin Optimizer Simulator */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            🧪 Dynamic Profit & Margin Optimizer
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Adjust costs, quantity, and pricing to simulate profit margins.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Chemical Product</label>
                <select className="form-select" value={simName} onChange={e => setSimName(e.target.value)}>
                  {['Sulfuric Acid', 'Sodium Hydroxide', 'Hydrochloric Acid', 'Ethanol', 'Acetone', 'Methanol'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Buy Price Cost (৳/unit)</label>
                <input type="number" className="form-input" value={simBuyPrice} onChange={e => setSimBuyPrice(Math.max(0, +e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Target Sell Price (৳/unit)</label>
                <input type="number" className="form-input" value={simSellPrice} onChange={e => setSimSellPrice(Math.max(0, +e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Order Volume (units)</label>
                <input type="number" className="form-input" value={simQty} onChange={e => setSimQty(Math.max(1, +e.target.value))} />
              </div>

              <div className="form-group">
                <label className="form-label">Customs & Overheads (%)</label>
                <input type="number" className="form-input" value={simOverhead} onChange={e => setSimOverhead(Math.max(0, +e.target.value))} />
              </div>
            </div>

            {/* Calculations Dashboard */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Projected Cost (+ duties):</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>৳{Math.round(simTotalCost).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Projected Revenue:</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>৳{Math.round(simTotalRevenue).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Net BDT Profit:</span>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: simTotalProfit >= 0 ? '#10B981' : '#EF4444' }}>
                    ৳{Math.round(simTotalProfit).toLocaleString()}
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
                <div style={{ fontWeight: 700, color: simHealthColor, marginBottom: '0.2rem' }}>STATUS: {simHealth}</div>
                <div style={{ color: 'var(--text-muted)', lineHeight: '1.3' }}>{simHealthDesc}</div>
              </div>
            </div>

          </div>
        </div>

        {/* Key Business Ratios */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            📊 Key Chemical Business Ratios
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Key audit ratios required for tracking chemical sales and operations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Gross Profit Margin', value: '37.5%', desc: 'Product profitability index', color: '#10B981' },
              { label: 'Retention Rate', value: '89.0%', desc: 'Percentage of recurring chemical clients', color: 'var(--brand-accent)' },
              { label: 'Inventory Turnover', value: '4.2x', desc: 'Velocity of chemical container sales', color: '#06B6D4' },
              { label: 'YoY Revenue Growth', value: '+22.0%', desc: 'Annual scaling velocity', color: '#7C3AED' },
              { label: 'Cost of Goods Sold', value: '62.5%', desc: 'Total import spend index', color: '#F59E0B' },
              { label: 'Average Order Value', value: '৳28,400', desc: 'Average cart spending per order', color: '#10B981' },
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
