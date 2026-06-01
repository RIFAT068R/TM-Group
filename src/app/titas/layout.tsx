'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './titas-layout.module.css'

const navItems = [
  {
    section: 'Overview',
    items: [
      { href: '/titas/dashboard', label: 'Dashboard', icon: <GridIcon /> },
    ],
  },
  {
    section: 'Products',
    items: [
      { href: '/titas/chemicals',  label: 'Chemicals',  icon: <FlaskIcon /> },
      { href: '/titas/inventory',  label: 'Inventory',  icon: <BoxIcon /> },
      { href: '/titas/suppliers',  label: 'Suppliers',  icon: <TruckIcon /> },
    ],
  },
  {
    section: 'Sales',
    items: [
      { href: '/titas/customers',  label: 'Customers',  icon: <UsersIcon /> },
      { href: '/titas/sales',      label: 'Sales Orders', icon: <ReceiptIcon /> },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { href: '/titas/reports',    label: 'Reports',    icon: <ChartBarIcon /> },
      { href: '/titas/analytics',  label: 'Analytics',  icon: <TrendIcon /> },
      { href: '/titas/ai',         label: 'AI Insights', icon: <SparklesIcon /> },
    ],
  },
  {
    section: 'Manage',
    items: [
      { href: '/titas/categories', label: 'Categories', icon: <TagIcon /> },
      { href: '/titas/tasks',      label: 'Tasks',      icon: <CheckIcon /> },
      { href: '/titas/settings',   label: 'Settings',   icon: <CogIcon /> },
    ],
  },
]

export default function TitasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null)
  const [theme, setTheme] = useState('light')
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [userRole, setUserRole] = useState('Titas Viewer')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email })
        const email = data.user.email?.toLowerCase() || '';
        const role = data.user.user_metadata?.role || '';
        if (email === 'rrr78@gmail.com' || email.includes('admin') || role === 'admin') {
          setUserRole('Titas Admin')
        } else {
          setUserRole('Titas Viewer')
        }
      }
    })

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${styles.sidebar} ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Titas Enterprise navigation">
        {/* Logo Workspace Selector */}
        <div style={{ position: 'relative', width: '100%' }}>
          <button 
            onClick={() => setSwitcherOpen(p => !p)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              border: 'none',
              background: 'transparent',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              outline: 'none',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div 
                className={`sidebar-logo-mark ${styles.logoMark}`} 
                aria-hidden
                style={{ overflow: 'hidden', background: '#ffffff', padding: '2px' }}
              >
                <img 
                  src="/logo/Titas Enterprice.png" 
                  alt="Titas Enterprise" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
              <div>
                <div className={styles.logoName} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Titas Enterprise
                </div>
                <div className={styles.logoSub}>Chemical Import</div>
              </div>
            </div>
            {/* Selector Chevron Up/Down */}
            <svg width="14" height="14" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" viewBox="0 0 24 24" style={{
              transform: switcherOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Floating Dropdown Panel */}
          {switcherOpen && (
            <>
              {/* Click outside overlay */}
              <div 
                onClick={() => setSwitcherOpen(false)} 
                style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'transparent' }} 
              />
              <div style={{
                position: 'absolute',
                top: '95%',
                left: '12px',
                right: '12px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '0.5rem',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 120,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}>
                <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Switch Workspace</div>
                
                {/* Active Workspace: Titas */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface2)',
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-primary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Titas Enterprise</span>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="var(--text-primary)" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </div>

                {/* Option 2: TM Overseas */}
                <Link 
                  href="/tm/dashboard"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setSwitcherOpen(false)}
                >
                  <div 
                    className="switcher-option"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>TM Overseas</span>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom: switch module + logout */}
        <div className={styles.sidebarBottom}>
          <Link href="/dashboard/select" className={`nav-item ${styles.switchBtn}`}>
            <SwapIcon />
            Switch Module
          </Link>
          <div className={styles.userRow}>
            <div className={styles.userAvatar}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.email?.split('@')[0] || 'User'}</div>
              <div className={styles.userRole}>{userRole}</div>
            </div>
            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
              aria-label="Sign out"
              data-tooltip="Sign out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Top header */}
        <header className="top-header">
          {/* Mobile menu button */}
          <button
            className={`btn btn-ghost btn-icon ${styles.menuBtn}`}
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
          >
            <MenuIcon />
          </button>

          <div className={styles.headerRight}>
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-ghost btn-icon" 
              onClick={toggleTheme} 
              aria-label="Toggle Color Theme" 
              data-tooltip="Toggle Theme"
              style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m-9-9h1.5m15 0H21m-1.5-6.75l-1.06 1.06m-10.88 10.88l-1.06 1.06m0-12.72L5.34 5.34m10.88 10.88l1.06 1.06M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z"/>
                </svg>
              )}
            </button>

            {/* Notifications bell */}
            <button className="btn btn-ghost btn-icon" aria-label="Notifications" data-tooltip="Notifications">
              <BellIcon />
            </button>
            {/* Module badge */}
            <div className={styles.moduleBadge}>
              <span className={styles.moduleDot} />
              Titas Enterprise
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

/* ─── Inline SVG Icons ─── */
function GridIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function FlaskIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3"/></svg> }
function BoxIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg> }
function TruckIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg> }
function UsersIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg> }
function ReceiptIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg> }
function ChartBarIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg> }
function TrendIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg> }
function SparklesIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/></svg> }
function TagIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/></svg> }
function CheckIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function CogIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> }
function SwapIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg> }
function LogoutIcon() { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg> }
function BellIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg> }
function MenuIcon() { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> }
