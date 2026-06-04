'use client'
import { useState, useRef, useEffect } from 'react'

type Option = { value: string; label: string }

type Props = {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  style?: React.CSSProperties
  id?: string
  'aria-label'?: string
}

export default function CustomSelect({ value, onChange, options, placeholder, style, id, 'aria-label': ariaLabel }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.value === value)
  const label = selected?.label || placeholder || 'Select...'

  return (
    <div
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: 130,
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.6rem 0.9rem',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
          background: 'var(--surface)',
          border: `1.5px solid ${open ? 'var(--brand-accent)' : 'var(--border)'}`,
          borderRadius: '10px',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.18s ease',
          boxShadow: open
            ? '0 0 0 3px var(--brand-accent-soft)'
            : '0 1px 3px rgba(0,0,0,0.06)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
        {/* Chevron */}
        <svg
          width="14" height="14"
          fill="none" stroke="currentColor" strokeWidth="2.2"
          viewBox="0 0 24 24"
          style={{
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: open ? 'var(--brand-accent)' : 'var(--text-muted)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 500,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            animation: 'selectSlideIn 0.14s cubic-bezier(0.34,1.2,0.64,1)',
            minWidth: '100%',
          }}
        >
          {options.map((opt, i) => {
            const isActive = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.6rem 0.9rem',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  background: isActive ? 'var(--brand-accent-soft)' : 'transparent',
                  color: isActive ? 'var(--brand-accent)' : 'var(--text-primary)',
                  border: 'none',
                  borderBottom: i < options.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                {/* Active check */}
                {isActive && (
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                  </svg>
                )}
                <span style={{ paddingLeft: isActive ? 0 : '1.25rem' }}>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes selectSlideIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
