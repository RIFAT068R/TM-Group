'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './reset-password.module.css'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const module = searchParams.get('module') || ''

  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [success, setSuccess]                 = useState('')
  const [showPass, setShowPass]               = useState(false)
  const [countdown, setCountdown]             = useState(5)

  const supabase = createClient()

  // Validate session on mount to ensure user is logged in via recovery flow
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('No active session found. Please request a new password reset link.')
      }
    }
    checkSession()
  }, [supabase])

  // Countdown redirect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (success && countdown === 0) {
      router.push(`/login${module ? `?module=${module}` : ''}`)
    }
  }, [success, countdown, router, module])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess('Password updated successfully! Redirecting you to login...')
    setPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  const isTitas = module === 'titas'
  const isTM    = module === 'tm'

  return (
    <div className={styles.page}>
      {/* Ambient */}
      <div className={`${styles.ambient} ${isTM ? styles.ambientTM : styles.ambientTitas}`} aria-hidden />
      <div className={styles.gridBg} aria-hidden />

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div 
            className={`${styles.logoMark} ${isTM ? styles.tmMark : styles.titasMark}`}
            style={(isTM || isTitas) ? { overflow: 'hidden', background: '#ffffff', padding: '2px' } : {}}
          >
            {isTM ? (
              <img 
                src="/logo/Tm Overseas.png" 
                alt="TM" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            ) : isTitas ? (
              <img 
                src="/logo/Titas Enterprice.png" 
                alt="Titas" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="9" y="2" width="6" height="6" rx="1" />
                <rect x="2" y="16" width="6" height="6" rx="1" />
                <rect x="16" y="16" width="6" height="6" rx="1" />
                <path d="M12 8v4M12 12H5v4M12 12h7v4" />
              </svg>
            )}
          </div>

          <div>
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>
              Choose a strong, secure password for your account.
            </p>
          </div>
        </div>

        {/* Module badge */}
        {(isTitas || isTM) && (
          <div className={`${styles.moduleBadge} ${isTM ? styles.tmBadge : styles.titasBadge}`}>
            <span className={styles.moduleDot} />
            Resetting password for {isTitas ? 'Titas Enterprise' : 'TM Overseas'}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && (
            <div className={styles.errorBanner} role="alert" aria-live="assertive">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successBanner} role="alert" aria-live="polite">
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p>{success}</p>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.9 }}>
                    Redirecting in {countdown} seconds...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!success && (
            <>
              <div className="form-group">
                <label htmlFor="password" className="form-label">New Password</label>
                <div className={styles.passWrap}>
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.showPass}
                    onClick={() => setShowPass(p => !p)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPass
                      ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                      : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading || !password || !confirmPassword || !!error.includes('No active session')}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} aria-hidden />
                    Updating…
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </>
          )}

          <div className={styles.backWrap}>
            <a href={`/login${module ? `?module=${module}` : ''}`} className={styles.back}>
              ← Back to Login
            </a>
          </div>
        </form>

        {/* Security note */}
        <div className={styles.secNote}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
          </svg>
          Secured with end-to-end encryption & MFA
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
