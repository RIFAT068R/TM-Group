'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#FAFCFC',
      color: '#222121',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Premium ambient grid background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(88, 2, 130, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 2, 130, 0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Sleek top header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2.5rem',
        borderBottom: '1px solid #E5E4E3',
        zIndex: 10,
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '4px',
            border: '2px solid #222121',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '0.85rem',
            letterSpacing: '-0.05em',
            color: '#222121',
          }}>TM</div>
          <span style={{
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: '#222121'
          }}>BUSINESS HUB</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/login" style={{
            color: '#8E8D8C',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#580282'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#8E8D8C'}
          >
            Login
          </Link>
          <Link href="/login?signup=true" style={{
            backgroundColor: '#222121',
            color: '#FAFCFC',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#580282'
            e.currentTarget.style.color = '#FAFCFC'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#222121'
            e.currentTarget.style.color = '#FAFCFC'
          }}
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main content container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        zIndex: 5,
        position: 'relative',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '3.5rem',
          maxWidth: '600px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: '#222121',
            lineHeight: 1.1,
            marginBottom: '0.75rem',
          }}>
            Select Enterprise Portal
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: '#8E8D8C',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}>
            Access the integrated management system for chemical import analytics and international workforce placement.
          </p>
        </div>

        {/* 2 Category Selection Cards */}
        <div style={{
          display: 'flex',
          gap: '2.5rem',
          width: '100%',
          maxWidth: '840px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
        }}>
          {/* Card 1: Titas Enterprise */}
          <Link href="/login?module=titas" style={{ textDecoration: 'none', flex: '1 1 350px', maxWidth: '380px' }}>
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E4E3',
                borderRadius: '16px',
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                height: '280px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 20px rgba(0,0,0,0.01)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#580282'
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(88, 2, 130, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E4E3'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 20px rgba(0,0,0,0.01)'
              }}
            >
              {/* Logo Area */}
              <div style={{
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                width: '100%',
              }}>
                <img 
                  src="/logo/Titas Enterprice.png" 
                  alt="Titas Enterprise" 
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.3s ease',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      const placeholder = document.createElement('div');
                      placeholder.style.fontSize = '2.5rem';
                      placeholder.style.fontWeight = '900';
                      placeholder.style.letterSpacing = '-0.05em';
                      placeholder.style.color = '#222121';
                      placeholder.innerText = 'TITAS';
                      e.currentTarget.parentElement.appendChild(placeholder);
                    }
                  }}
                />
              </div>

              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#222121',
                letterSpacing: '-0.02em',
                margin: 0,
                textTransform: 'uppercase',
              }}>
                Titas Enterprise
              </h2>
            </div>
          </Link>

          {/* Card 2: TM Overseas */}
          <Link href="/login?module=tm" style={{ textDecoration: 'none', flex: '1 1 350px', maxWidth: '380px' }}>
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E4E3',
                borderRadius: '16px',
                padding: '3rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                height: '280px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 20px rgba(0,0,0,0.01)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#580282'
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(88, 2, 130, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E4E3'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02), 0 10px 20px rgba(0,0,0,0.01)'
              }}
            >
              {/* Logo Area */}
              <div style={{
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                width: '100%',
              }}>
                <img 
                  src="/logo/Tm Overseas.png" 
                  alt="TM Overseas" 
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    transition: 'transform 0.3s ease',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      const placeholder = document.createElement('div');
                      placeholder.style.fontSize = '2.5rem';
                      placeholder.style.fontWeight = '900';
                      placeholder.style.letterSpacing = '-0.05em';
                      placeholder.style.color = '#222121';
                      placeholder.innerText = 'TM OVERSEAS';
                      e.currentTarget.parentElement.appendChild(placeholder);
                    }
                  }}
                />
              </div>

              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#222121',
                letterSpacing: '-0.02em',
                margin: 0,
                textTransform: 'uppercase',
              }}>
                TM Overseas
              </h2>
            </div>
          </Link>
        </div>
      </div>

      {/* Premium minimal footer */}
      <footer style={{
        padding: '2rem 2.5rem',
        borderTop: '1px solid #E4E4E7',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: '#71717A',
        zIndex: 10,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <span>© {new Date().getFullYear()} TM Business Hub. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span style={{ color: '#A1A1AA' }}>Security Standard Level-4</span>
          <span style={{ color: '#A1A1AA' }}>Powered by Gemini 1.5</span>
        </div>
      </footer>
    </main>
  )
}
