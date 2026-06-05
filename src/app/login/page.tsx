'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const module = searchParams.get('module') || ''

  const [mode, setMode]                       = useState<'login' | 'signup' | 'forgot'>('login')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [success, setSuccess]                 = useState('')
  const [showPass, setShowPass]               = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
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

      const origin = window.location.origin
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setSuccess('Account created! Please check your email for a confirmation link to verify your account.')
      setPassword('')
      setConfirmPassword('')
      setLoading(false)
    } else if (mode === 'forgot') {
      const origin = window.location.origin
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setSuccess('A password reset link has been sent to your email address.')
      setLoading(false)
    } else {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : authError.message)
        setLoading(false)
        return
      }

      if (module === 'titas') router.push('/titas/dashboard')
      else if (module === 'tm') router.push('/tm/dashboard')
      else router.push(redirect)
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
          onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
          onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
        >
          Sign Up
        </button>
        <button
          type="button"
          className={`${styles.tab} ${mode === 'forgot' ? styles.tabActive : ''}`}
          onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
        >
          Forgot Password
        </button>
      </div>

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
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        {mode !== 'forgot' && (
          <>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className={styles.passWrap}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
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
            )}
          </>
        )}

        <button
          type="submit"
          className={`btn btn-primary ${styles.submitBtn}`}
          disabled={loading || !email || (mode !== 'forgot' && !password) || (mode === 'signup' && !confirmPassword)}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} aria-hidden />
              Processing…
            </>
          ) : mode === 'signup' ? (
            'Create Account'
          ) : mode === 'forgot' ? (
            'Send Reset Link'
          ) : (
            'Sign In'
          )}
        </button>

        {mode === 'login' && (
          <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
            <button
              type="button"
              className={styles.toggleViewLink}
              onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {mode !== 'login' && (
          <div style={{ textAlign: 'center', marginTop: '0.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              className={styles.toggleViewLink}
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            >
              Sign In
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const module = searchParams.get('module') || ''

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
            <h1 className={styles.title}>
              {isTitas ? 'Titas Enterprise' : isTM ? 'TM Overseas' : 'TM Business Hub'}
            </h1>
            <p className={styles.subtitle}>
              {isTitas
                ? 'Chemical Import Management Portal'
                : isTM
                ? 'Manpower Management Portal'
                : 'Sign in to access your business portal'}
            </p>
          </div>
        </div>

        {/* Module badge */}
        {(isTitas || isTM) && (
          <div className={`${styles.moduleBadge} ${isTM ? styles.tmBadge : styles.titasBadge}`}>
            <span className={styles.moduleDot} />
            Accessing {isTitas ? 'Titas Enterprise' : 'TM Overseas'} module
          </div>
        )}

        {/* Login Form */}
        <LoginForm />

        {/* Back link */}
        <div className={styles.backWrap}>
          <a href="/" className={styles.back}>
            ← Back to home
          </a>
        </div>

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
