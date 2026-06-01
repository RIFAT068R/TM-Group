'use client'
import { useState } from 'react'
import Link from 'next/link'

type Task = { id:number; title:string; desc:string; priority:'high'|'medium'|'low'; due:string; done:boolean; module:string }

const initialTasks: Task[] = [
  { id:1, title:'Restock Acetone — urgent',         desc:'Stock dropped below minimum level',              priority:'high',   due:'2024-06-18', done:false, module:'Titas' },
  { id:2, title:'Renew Hasan Ali passport',          desc:'Passport expiring in 5 months',                  priority:'high',   due:'2024-07-01', done:false, module:'TM' },
  { id:3, title:'Follow up Padma Chemicals invoice', desc:'Invoice overdue for 15+ days',                   priority:'high',   due:'2024-06-17', done:false, module:'Titas' },
  { id:4, title:'Send Rahim monthly salary slip',    desc:'Worker in Saudi Arabia — June salary',           priority:'medium', due:'2024-06-30', done:false, module:'TM' },
  { id:5, title:'Update Ethanol sell price',         desc:'Market price increased by 8% this month',       priority:'medium', due:'2024-06-20', done:true,  module:'Titas' },
  { id:6, title:'Prepare Q2 profit report',          desc:'For Titas Enterprise management review',        priority:'low',    due:'2024-07-05', done:false, module:'Titas' },
]

const priorityCls: Record<string,string> = { high:'badge-danger', medium:'badge-warning', low:'badge-muted' }

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<'all'|'pending'|'done'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title:'', desc:'', priority:'medium', due:'', module:'Titas' })

  const filtered = tasks.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  )

  function toggleTask(id:number) { setTasks(ts => ts.map(t => t.id===id ? {...t,done:!t.done} : t)) }
  function deleteTask(id:number) { setTasks(ts => ts.filter(t => t.id!==id)) }
  function addTask() {
    if (!form.title.trim()) return
    setTasks(ts => [...ts, { id:Date.now(), ...form, done:false, priority: form.priority as Task['priority'] }])
    setForm({ title:'', desc:'', priority:'medium', due:'', module:'Titas' })
    setShowAdd(false)
  }

  return (
    <div>
      <nav className="breadcrumb mb-4">
        <span>Dashboard</span>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Tasks</span>
      </nav>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks & To-Do</h1>
          <p className="page-subtitle">{tasks.filter(t=>!t.done).length} pending · {tasks.filter(t=>t.done).length} completed</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>+ Add Task</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.25rem' }}>
        {(['all','pending','done'] as const).map(f=>(
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(f)}>
            {f==='all'?'All':f==='done'?'✅ Done':'⏳ Pending'} {f==='all'?`(${tasks.length})`:f==='done'?`(${tasks.filter(t=>t.done).length})`:`(${tasks.filter(t=>!t.done).length})`}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {filtered.map(task => (
          <div key={task.id} className="card glass-hover" style={{ display:'flex', alignItems:'flex-start', gap:'1rem', opacity: task.done ? 0.6 : 1 }}>
            <input type="checkbox" checked={task.done} onChange={()=>toggleTask(task.id)}
              style={{ width:18, height:18, marginTop:'2px', accentColor:'#10B981', cursor:'pointer', flexShrink:0 }} aria-label={`Mark ${task.title} as done`} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                <span style={{ fontWeight:600, color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
                <span className={`badge ${priorityCls[task.priority]}`}>{task.priority}</span>
                <span className="badge badge-info">{task.module}</span>
              </div>
              <p style={{ fontSize:'0.82rem', color:'#64748B', lineHeight:1.5 }}>{task.desc}</p>
              {task.due && <div style={{ fontSize:'0.78rem', color:'#475569', marginTop:'0.35rem' }}>📅 Due: {task.due}</div>}
            </div>
            <button className="btn btn-danger btn-sm" onClick={()=>deleteTask(task.id)} aria-label="Delete task">🗑️</button>
          </div>
        ))}
        {filtered.length===0 && (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No tasks here!</h3>
            <p>{filter==='done' ? 'No completed tasks yet.' : 'All tasks are done. Great work!'}</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{ maxWidth:'500px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize:'1.1rem', fontWeight:800 }}>Add New Task</h2>
              <button className="btn btn-ghost btn-icon" onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gap:'1rem' }}>
                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input className="form-input" placeholder="What needs to be done?" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" rows={2} placeholder="Details..." value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                      {['high','medium','low'].map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Module</label>
                    <select className="form-select" value={form.module} onChange={e=>setForm({...form,module:e.target.value})}>
                      <option>Titas</option><option>TM</option><option>Both</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={form.due} onChange={e=>setForm({...form,due:e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addTask}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
