'use client'
import { useState, useRef, useEffect, useCallback } from 'react'

interface DatePickerProps {
  value: string           // YYYY-MM-DD or ''
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  id?: string
  disabled?: boolean
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function parseDate(val: string): Date | null {
  if (!val) return null
  const [y, m, d] = val.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatDisplay(val: string): string {
  const d = parseDate(val)
  if (!d) return ''
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  style,
  id,
  disabled,
}: DatePickerProps) {
  const today = new Date()
  const selected = parseDate(value)

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth())
  const [mode, setMode] = useState<'days' | 'months' | 'years'>('days')

  const rootRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setMode('days')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Sync view when value changes externally
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear())
      setViewMonth(selected.getMonth())
    }
  }, [value])

  function openPicker() {
    if (disabled) return
    setOpen(o => !o)
    setMode('days')
  }

  function selectDay(day: number) {
    onChange(toISO(viewYear, viewMonth, day))
    setOpen(false)
    setMode('days')
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function selectMonth(m: number) {
    setViewMonth(m)
    setMode('days')
  }

  function selectYear(y: number) {
    setViewYear(y)
    setMode('months')
  }

  // Build days grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const isSelected = (day: number) =>
    selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth() === viewMonth &&
    selected.getDate() === day

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day

  // Year range: 10 years back, 10 years forward
  const yearStart = viewYear - 8
  const years = Array.from({ length: 16 }, (_, i) => yearStart + i)

  const displayText = formatDisplay(value)

  return (
    <div
      ref={rootRef}
      className={`dp-root ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {/* Trigger */}
      <button
        id={id}
        type="button"
        className={`dp-trigger form-input${disabled ? ' dp-disabled' : ''}`}
        onClick={openPicker}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          userSelect: 'none',
        }}
      >
        {/* Calendar icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand-accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span style={{ flex: 1, color: displayText ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '0.875rem', fontWeight: displayText ? 500 : 400 }}>
          {displayText || placeholder}
        </span>
        {value && !disabled && (
          <span
            role="button"
            aria-label="Clear date"
            onClick={e => { e.stopPropagation(); onChange('') }}
            style={{ color: 'var(--text-muted)', padding: '0 2px', lineHeight: 1, cursor: 'pointer', fontSize: '0.9rem' }}
          >✕</span>
        )}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Calendar Popup */}
      {open && (
        <div
          className="dp-popup"
          role="dialog"
          aria-label="Date picker"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 9999,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '14px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
            padding: '0.875rem',
            width: '290px',
            animation: 'dpFadeIn 0.15s ease',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <button
              type="button"
              className="dp-nav-btn"
              onClick={mode === 'days' ? prevMonth : () => setViewYear(y => y - (mode === 'years' ? 16 : 1))}
              aria-label="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                type="button"
                className="dp-header-btn"
                onClick={() => setMode(m => m === 'months' ? 'days' : 'months')}
              >
                {MONTHS[viewMonth]}
              </button>
              <button
                type="button"
                className="dp-header-btn"
                onClick={() => setMode(m => m === 'years' ? 'days' : 'years')}
              >
                {viewYear}
              </button>
            </div>

            <button
              type="button"
              className="dp-nav-btn"
              onClick={mode === 'days' ? nextMonth : () => setViewYear(y => y + (mode === 'years' ? 16 : 1))}
              aria-label="Next"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          {/* DAYS view */}
          {mode === 'days' && (
            <>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '0.35rem' }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0.2rem 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {d}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {cells.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={!day}
                    onClick={() => day && selectDay(day)}
                    className={`dp-day${isSelected(day!) ? ' dp-day-selected' : ''}${isToday(day!) && !isSelected(day!) ? ' dp-day-today' : ''}`}
                    style={{ visibility: day ? 'visible' : 'hidden' }}
                    aria-label={day ? `${MONTHS[viewMonth]} ${day}, ${viewYear}` : undefined}
                    aria-current={isToday(day!) ? 'date' : undefined}
                    aria-pressed={isSelected(day!) ? true : false}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* MONTHS view */}
          {mode === 'months' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMonth(i)}
                  className={`dp-month-btn${viewMonth === i ? ' dp-month-selected' : ''}`}
                  aria-pressed={viewMonth === i}
                >
                  {m.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* YEARS view */}
          {mode === 'years' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              {years.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => selectYear(y)}
                  className={`dp-year-btn${viewYear === y ? ' dp-year-selected' : ''}`}
                  aria-pressed={viewYear === y}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.625rem', display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="dp-footer-btn"
              onClick={() => {
                onChange('')
                setOpen(false)
                setMode('days')
              }}
            >
              Clear
            </button>
            <button
              type="button"
              className="dp-footer-btn dp-today-btn"
              onClick={() => {
                const t = new Date()
                onChange(toISO(t.getFullYear(), t.getMonth(), t.getDate()))
                setOpen(false)
                setMode('days')
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
