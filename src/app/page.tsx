'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import styles from './landing.module.css'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [titasImgError, setTitasImgError] = useState(false)
  const [tmImgError, setTmImgError] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
      }}
    >
      {/* Premium ambient grid background */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage:
            'linear-gradient(rgba(88, 2, 130, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 2, 130, 0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <header
        role="banner"
        className={styles.landingHeader}
      >
        <div className={styles.landingLogoWrap}>
          <img
            src="/logo/Logo 1.png"
            alt="TM Business Hub"
            width={180}
            height={90}
            className={styles.landingLogo}
            loading="eager"
          />
        </div>

        <nav aria-label="Site navigation" className={styles.landingNav}>
          <Link href="/login" className={styles.navLogin}>
            Login
          </Link>
          <Link href="/login?signup=true" className={styles.navSignup}>
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <div className={styles.landingBody} style={{ zIndex: 5, position: 'relative' }}>
        <div
          className={styles.heroText}
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h1 className={styles.heroTitle}>Select Enterprise Portal</h1>
          <p className={styles.heroSub}>
            Access the integrated management system for chemical import analytics and international workforce placement.
          </p>
        </div>

        {/* 2 Category Selection Cards */}
        <div
          className={styles.cardGrid}
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
          }}
          role="list"
        >
          {/* Card 1: Titas Enterprise */}
          <Link
            href="/login?module=titas"
            className={styles.moduleCard}
            role="listitem"
            aria-label="Enter Titas Enterprise portal — Chemical Import management"
          >
            <div className={styles.moduleCardInner}>
              <div className={styles.logoArea}>
                {titasImgError ? (
                  <span className={styles.logoFallback} aria-label="Titas Enterprise">TITAS</span>
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
              <h2 className={styles.moduleTitle}>Titas Enterprise</h2>
              <p className={styles.moduleDesc}>Chemical Import Management</p>
            </div>
          </Link>

          {/* Card 2: TM Overseas */}
          <Link
            href="/login?module=tm"
            className={styles.moduleCard}
            role="listitem"
            aria-label="Enter TM Overseas portal — Manpower Management"
          >
            <div className={styles.moduleCardInner}>
              <div className={styles.logoArea}>
                {tmImgError ? (
                  <span className={styles.logoFallback} aria-label="TM Overseas">TM OVERSEAS</span>
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
              <h2 className={styles.moduleTitle}>TM Overseas</h2>
              <p className={styles.moduleDesc}>Manpower Management</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
