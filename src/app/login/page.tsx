'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'

interface LoginFormProps {
  mode: 'login' | 'signup' | 'forgot'
  setMode: React.Dispatch<React.SetStateAction<'login' | 'signup' | 'forgot'>>
  module: string
}

function LoginForm({ mode, setMode, module }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  // Signup UI Stage: 'initial' (Screen 1) | 'email' (Screen 2)
  const [signupMethod, setSignupMethod]       = useState<'initial' | 'email'>('initial')
  const [name, setName]                       = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [success, setSuccess]                 = useState('')
  const [showPass, setShowPass]               = useState(false)

  const supabase = createClient()

  // Reset form fields on mode/signup stage change
  useEffect(() => {
    setError('')
    setSuccess('')
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }, [mode, signupMethod])

  async function handleGoogleAuth() {
    setLoading(true)
    setError('')
    const origin = window.location.origin
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      }
    })
    if (oAuthError) {
      setError(oAuthError.message)
      setLoading(false)
    }
  }

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
          data: {
            full_name: name,
          }
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

  // Google SVG Icon Markup
  const googleIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  )

  // Envelope SVG Icon Markup
  const envelopeIcon = (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )

  // RENDER SIGNUP STAGE 1 (Google & Email Select)
  if (mode === 'signup' && signupMethod === 'initial') {
    return (
      <div>
        {error && (
          <div className={styles.errorBanner} role="alert" aria-live="assertive" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button 
          type="button" 
          className={`${styles.socialBtn} ${styles.googleBtn}`}
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          {googleIcon}
          Sign up with Google
        </button>

        <button 
          type="button" 
          className={`${styles.socialBtn} ${styles.emailBtn}`}
          onClick={() => setSignupMethod('email')}
          disabled={loading}
        >
          {envelopeIcon}
          Sign up with Email
        </button>

        <p className={styles.toggleText}>
          Already have an account?{' '}
          <button
            type="button"
            className={styles.toggleTextLink}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
        </p>

        <p className={styles.termsText}>
          By signing up to create an account I accept Company's{' '}
          <a href="#" onClick={e => e.preventDefault()}>Terms of Use</a> and{' '}
          <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.
        </p>
      </div>
    )
  }

  // RENDER SIGNUP STAGE 2 (Email Registration Form)
  if (mode === 'signup' && signupMethod === 'email') {
    return (
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className={styles.errorBanner} role="alert" aria-live="assertive" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successBanner} role="alert" aria-live="polite" style={{ marginBottom: '1.25rem' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {!success && (
          <>
            {/* Name Input */}
            <div className={styles.floatingField}>
              <input
                id="name"
                type="text"
                className={styles.floatingInput}
                placeholder=" "
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                autoFocus
              />
              <label htmlFor="name" className={styles.floatingLabel}>Name</label>
            </div>

            {/* Email Input */}
            <div className={styles.floatingField}>
              <input
                id="email"
                type="email"
                className={styles.floatingInput}
                placeholder=" "
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label htmlFor="email" className={styles.floatingLabel}>Email</label>
            </div>

            {/* Password Input */}
            <div className={styles.floatingField}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className={`${styles.floatingInput} ${styles.passwordInput}`}
                placeholder=" "
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <label htmlFor="password" className={styles.floatingLabel}>Password</label>
              <button
                type="button"
                className={styles.passwordEye}
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className={styles.floatingField}>
              <input
                id="confirmPassword"
                type={showPass ? 'text' : 'password'}
                className={`${styles.floatingInput} ${styles.passwordInput}`}
                placeholder=" "
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <label htmlFor="confirmPassword" className={styles.floatingLabel}>Confirm Password</label>
            </div>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading || !name || !email || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden />
                  Processing…
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </>
        )}

        <p className={styles.toggleText}>
          Already have an account?{' '}
          <button
            type="button"
            className={styles.toggleTextLink}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
        </p>

        {!success && (
          <>
            <div className={styles.divider}>or</div>

            <button 
              type="button" 
              className={`${styles.socialBtn} ${styles.googleBtn}`}
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              {googleIcon}
              Sign up with Google
            </button>
          </>
        )}

        <p className={styles.termsText}>
          By signing up to create an account I accept Company's{' '}
          <a href="#" onClick={e => e.preventDefault()}>Terms of Use</a> and{' '}
          <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>.
        </p>
      </form>
    )
  }

  // RENDER SIGN IN & FORGOT PASSWORD MODES
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
          onClick={() => { setMode('signup'); setError(''); setSuccess(''); setSignupMethod('initial'); }}
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

        {/* Email Input */}
        <div className={styles.floatingField}>
          <input
            id="email"
            type="email"
            className={styles.floatingInput}
            placeholder=" "
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
          <label htmlFor="email" className={styles.floatingLabel}>Email Address</label>
        </div>

        {mode !== 'forgot' && (
          /* Password Input */
          <div className={styles.floatingField}>
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className={`${styles.floatingInput} ${styles.passwordInput}`}
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label htmlFor="password" className={styles.floatingLabel}>Password</label>
            <button
              type="button"
              className={styles.passwordEye}
              onClick={() => setShowPass(p => !p)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPass ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        )}

        <button
          type="submit"
          className={styles.primaryBtn}
          disabled={loading || !email || (mode !== 'forgot' && !password)}
        >
          {loading ? (
            <>
              <span className={styles.spinner} aria-hidden />
              Processing…
            </>
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
              onClick={() => { setMode('forgot'); }}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {mode !== 'login' && (
          <p className={styles.toggleText}>
            Already have an account?{' '}
            <button
              type="button"
              className={styles.toggleTextLink}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
          </p>
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

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setMode('signup')
    }
  }, [searchParams])

  return (
    <div className={styles.page}>
      {/* Ambient */}
      <div className={`${styles.ambient} ${isTM ? styles.ambientTM : styles.ambientTitas}`} aria-hidden />
      <div className={styles.gridBg} aria-hidden />

      <div className={styles.card}>
        {/* Header */}
        <div className={mode === 'signup' ? styles.cardHeaderCentered : styles.cardHeader}>
          {mode !== 'signup' && (
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
          )}

          <div>
            <h1 className={styles.title}>
              {mode === 'signup' 
                ? 'Sign Up' 
                : isTitas 
                  ? 'Titas Enterprise' 
                  : isTM 
                    ? 'TM Overseas' 
                    : 'TM Business Hub'}
            </h1>
            <p className={mode === 'signup' ? styles.signupSubtitle : styles.subtitle}>
              {mode === 'signup'
                ? "Let's get started with your 30 days free trial"
                : isTitas
                  ? 'Chemical Import Management Portal'
                  : isTM
                    ? 'Manpower Management Portal'
                    : 'Sign in to access your business portal'}
            </p>
          </div>
        </div>

        {/* Module badge */}
        {(isTitas || isTM) && mode !== 'signup' && (
          <div className={`${styles.moduleBadge} ${isTM ? styles.tmBadge : styles.titasBadge}`}>
            <span className={styles.moduleDot} />
            Accessing {isTitas ? 'Titas Enterprise' : 'TM Overseas'} module
          </div>
        )}

        {/* Login Form */}
        <LoginForm mode={mode} setMode={setMode} module={module} />

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
