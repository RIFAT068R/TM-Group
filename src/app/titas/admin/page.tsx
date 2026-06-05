'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type UserRow = {
  id: string
  email: string
  role: string
  createdAt: string
  lastSignIn: string | null
}

export default function AdminPanelPage() {
  const [users, setUsers]           = useState<UserRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [isAdmin, setIsAdmin]       = useState(false)
  const [token, setToken]           = useState('')
  const [search, setSearch]         = useState('')
  const [confirm, setConfirm]       = useState<UserRow | null>(null)
  const [granting, setGranting]     = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  // Verify current user is admin & get token
  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setError('Not authenticated'); setLoading(false); return }

      const role = (
        session.user.user_metadata?.role ||
        session.user.app_metadata?.role ||
        ''
      ).toLowerCase()

      if (role !== 'admin') {
        setError('Access denied. Admin only.')
        setLoading(false)
        return
      }

      setIsAdmin(true)
      setToken(session.access_token)
    }
    init()
  }, [])

  const fetchUsers = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load users')
      setUsers(data.users)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchUsers()
  }, [token, fetchUsers])

  const handleGrantAdmin = async () => {
    if (!confirm) return
    setGranting(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId: confirm.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to grant admin')
      setSuccessMsg(`✅ Admin role granted to ${confirm.email}`)
      setConfirm(null)
      fetchUsers()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGranting(false)
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const adminCount  = users.filter(u => u.role === 'admin').length
  const viewerCount = users.filter(u => u.role !== 'admin').length

  const fmt = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Access denied
  if (!isAdmin && !loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This page is only accessible to administrators.</p>
        <Link href="/titas/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-4">
        <Link href="/titas/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Admin Panel</span>
      </nav>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage user access and roles</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div style={{ background: '#D1FAE5', border: '1px solid #10B981', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1rem', color: '#065F46', fontWeight: 600, fontSize: '0.875rem' }}>
          {successMsg}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1rem', color: '#991B1B', fontWeight: 600, fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Users', value: users.length, color: 'var(--titas-primary)' },
          { label: 'Admins', value: adminCount, color: '#7C3AED' },
          { label: 'Viewers', value: viewerCount, color: '#6B7280' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Notice */}
      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <div style={{
          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center'
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search users by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '0.85rem 1.1rem 0.85rem 2.75rem',
            fontSize: '0.875rem', fontFamily: 'inherit',
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: '12px', color: 'var(--text-primary)',
            outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand-accent)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-accent-soft)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1, padding: '0.1rem'
            }}
          >✕</button>
        )}
      </div>

      {/* User Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading users...</div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last Sign In</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.email}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.2rem 0.7rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                        background: u.role === 'admin' ? '#EDE9FE' : 'var(--surface2)',
                        color: u.role === 'admin' ? '#5B21B6' : 'var(--text-muted)',
                      }}>
                        {u.role === 'admin' ? '🔑 Admin' : '👤 Viewer'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{fmt(u.createdAt)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{fmt(u.lastSignIn)}</td>
                    <td>
                      {u.role === 'admin' ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Already Admin</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setConfirm(u)}
                          style={{ fontSize: '0.78rem' }}
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => !granting && setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Admin Access</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => !granting && setConfirm(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ padding: '1.25rem 0', lineHeight: 1.7 }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                You are about to grant <strong>Admin</strong> access to:
              </p>
              <div style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.875rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7C3AED',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{confirm.email}</div>
                </div>
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.04)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '10px',
                padding: '0.85rem 1.1rem',
                fontSize: '0.8rem',
                color: '#D97706',
                display: 'flex',
                gap: '0.6rem',
                lineHeight: '1.5'
              }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
                <div>
                  <strong>Warning:</strong> This cannot be undone from this interface. To revoke admin privileges in the future, you must run an update query in the Supabase SQL Editor.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)} disabled={granting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleGrantAdmin} disabled={granting}
                style={{ background: '#7C3AED', borderColor: '#7C3AED' }}>
                {granting ? 'Granting...' : '🔑 Yes, Make Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
