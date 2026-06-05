'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from './select.module.css'

export default function SelectModulePage() {
  const [mounted, setMounted] = useState(false)
  const [titasImgError, setTitasImgError] = useState(false)
  const [tmImgError, setTmImgError] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Background Grid */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Sticky header — no more position:absolute hack */}
      <header
        role="banner"
        className={styles.header}
      >
        <div className={styles.logoWrap}>
          <img
            src="/logo/Logo 1.png"
            alt="TM Business Hub"
            width={180}
            height={90}
            className={styles.logo}
            loading="eager"
          />
        </div>

        <nav aria-label="Select page navigation">
          <Link href="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className={styles.main}
        style={{ zIndex: 5, position: 'relative' }}
      >
        <div
          className={styles.heroText}
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className={styles.pill} aria-hidden="true">✦ Portal Select</div>
          <h1 className={styles.heroTitle}>Choose Enterprise Module</h1>
          <p className={styles.heroSub}>Select the business portal you wish to manage</p>
        </div>

        {/* Module cards */}
        <div
          className={styles.cardGrid}
          role="list"
          aria-label="Available enterprise portals"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
          }}
        >
          {/* Card 1: Titas Enterprise */}
          <Link
            href="/titas/dashboard"
            className={styles.card}
            role="listitem"
            aria-label="Open Titas Enterprise dashboard — Chemical Import management"
          >
            <div className={styles.cardInner}>
              <div className={styles.logoArea}>
                {titasImgError ? (
                  <span className={styles.logoFallback}>TITAS</span>
                ) : (
                  <img
                    src="/logo/Titas Enterprice.png"
                    alt="Titas Enterprise"
                    className={styles.logoImg}
                    loading="lazy"
                    onError={() => setTitasImgError(true)}
                  />
                )}
              </div>
              <h2 className={styles.cardTitle}>Titas Enterprise</h2>
              <p className={styles.cardDesc}>Chemical Import Management</p>
            </div>
          </Link>

          {/* Card 2: TM Overseas */}
          <Link
            href="/tm/dashboard"
            className={styles.card}
            role="listitem"
            aria-label="Open TM Overseas dashboard — Manpower Management"
          >
            <div className={styles.cardInner}>
              <div className={styles.logoArea}>
                {tmImgError ? (
                  <span className={styles.logoFallback}>TM OVERSEAS</span>
                ) : (
                  <img
                    src="/logo/Tm Overseas.png"
                    alt="TM Overseas"
                    className={styles.logoImg}
                    loading="lazy"
                    onError={() => setTmImgError(true)}
                  />
                )}
              </div>
              <h2 className={styles.cardTitle}>TM Overseas</h2>
              <p className={styles.cardDesc}>Manpower Management</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
