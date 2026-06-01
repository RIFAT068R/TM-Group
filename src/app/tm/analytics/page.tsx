'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const radarData = [
  { metric:'Placements', score:82 }, { metric:'Revenue',    score:74 },
  { metric:'Agencies',   score:68 }, { metric:'Workers',    score:90 },
  { metric:'Retention',  score:71 }, { metric:'Growth',     score:78 },
]

export default function TMAnalyticsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <Link href="/tm/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Analytics</span>
      </nav>
      <div className="page-header">
        <h1 className="page-title">Advanced Analytics</h1>
        <p className="page-subtitle">Deep-dive performance metrics for TM Overseas</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        <div className="chart-card">
          <div className="chart-title">Placement Performance Radar</div>
          <div className="chart-subtitle">Overall health across key metrics</div>
          {mounted && (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill:'#94A3B8', fontSize:12 }} />
                <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontWeight:700, marginBottom:'1rem' }}>📊 Key Placement Ratios</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {[
              { label:'Placement Success Rate', value:'87%',   color:'#10B981' },
              { label:'Avg Processing Time',    value:'45 days', color:'#7C3AED' },
              { label:'Worker Retention (1yr)', value:'72%',   color:'#F59E0B' },
              { label:'Agency Commission Avg',  value:'7.8%',  color:'#06B6D4' },
              { label:'Revenue per Worker',     value:'৳18,400', color:'#A78BFA' },
              { label:'YoY Placement Growth',   value:'+28%',  color:'#10B981' },
            ].map(r=>(
              <div key={r.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.625rem 0.875rem', background:'rgba(255,255,255,0.03)', borderRadius:'8px' }}>
                <span style={{ fontSize:'0.85rem', color:'#94A3B8' }}>{r.label}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontWeight:700, color:r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
