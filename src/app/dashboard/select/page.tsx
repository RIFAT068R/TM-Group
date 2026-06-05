'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function SelectModulePage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Background Grid */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Sleek top header */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2.5rem',
        borderBottom: '1px solid #E4E4E7',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo/Logo 1.png" 
            alt="TM Business Hub" 
            style={{ 
              height: '44px', 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/" style={{
            color: '#71717A',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#09090B'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#71717A'}
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <div style={{
        textAlign: 'center',
        marginBottom: '3.5rem',
        marginTop: '6rem',
        position: 'relative',
        zIndex: 5,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: '#FFFFFF',
          border: '1px solid #E4E4E7',
          borderRadius: '99px',
          padding: '0.35rem 1rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#52525B',
          marginBottom: '1.25rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}>
          ✦ Portal Select
        </div>
        <h1 style={{
          fontSize: 'clamp(1.75rem,4vw,2.25rem)',
          fontWeight: 900,
          color: '#09090B',
          letterSpacing: '-0.03em',
          marginBottom: '0.5rem',
        }}>Choose Enterprise Module</h1>
        <p style={{ color: '#71717A', fontSize: '0.88rem' }}>Select the business portal you wish to manage</p>
      </div>

      {/* 2 Category Selection Cards */}
      <div style={{
        display: 'flex',
        gap: '2.5rem',
        width: '100%',
        maxWidth: '840px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 5,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
      }}>
        {/* Card 1: Titas Enterprise */}
        <Link href="/titas/dashboard" style={{ textDecoration: 'none', flex: '1 1 350px', maxWidth: '380px' }}>
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E4E7',
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
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#09090B'
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E4E4E7'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0,0,0,0.02)'
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
                    placeholder.innerText = 'TITAS';
                    e.currentTarget.parentElement.appendChild(placeholder);
                  }
                }}
              />
            </div>

            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#09090B',
              letterSpacing: '-0.02em',
              margin: 0,
              textTransform: 'uppercase',
            }}>
              Titas Enterprise
            </h2>
          </div>
        </Link>

        {/* Card 2: TM Overseas */}
        <Link href="/tm/dashboard" style={{ textDecoration: 'none', flex: '1 1 350px', maxWidth: '380px' }}>
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E4E7',
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
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#09090B'
              e.currentTarget.style.transform = 'translateY(-6px)'
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E4E4E7'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0,0,0,0.02)'
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
                    placeholder.innerText = 'TM OVERSEAS';
                    e.currentTarget.parentElement.appendChild(placeholder);
                  }
                }}
              />
            </div>

            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#09090B',
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
  )
}
