'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './tm-layout.module.css'

const navItems = [
  {
    section: 'Overview',
    items: [
      { href: '/tm/dashboard',   label: 'Dashboard',   icon: <GridIcon /> },
    ],
  },
  {
    section: 'People',
    items: [
      { href: '/tm/workers',     label: 'Workers',     icon: <UserIcon /> },
      { href: '/tm/agencies',    label: 'Agencies',    icon: <BuildingIcon /> },
    ],
  },
  {
    section: 'Operations',
    items: [
      { href: '/tm/placements',  label: 'Placements',  icon: <PlaneIcon /> },
    ],
  },
  {
    section: 'Finance & Analytics',
    items: [
      { href: '/tm/reports',     label: 'Reports',     icon: <ChartBarIcon /> },
      { href: '/tm/analytics',   label: 'Analytics',   icon: <TrendIcon /> },
      { href: '/tm/ai',          label: 'AI Insights', icon: <SparklesIcon /> },
    ],
  },
  {
    section: 'Manage',
    items: [
      { href: '/tm/categories',  label: 'Categories',  icon: <TagIcon /> },
      { href: '/tm/tasks',       label: 'Tasks',       icon: <CheckIcon /> },
      { href: '/tm/settings',    label: 'Settings',    icon: <CogIcon /> },
      { href: '/tm/admin',       label: 'Admin Panel', icon: <ShieldIcon />, adminOnly: true },
    ],
  },
]

export default function TMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null)
  const [theme, setTheme] = useState('light')
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [userRole, setUserRole] = useState('TM Viewer')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        let fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.ownerName || '';
        
        try {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .single()
          if (profileRow?.full_name) {
            fullName = profileRow.full_name
          }
        } catch (e) {
          console.error('Error fetching profile row:', e)
        }

        setUser({ 
          email: data.user.email,
          full_name: fullName
        })
        const role = (data.user.user_metadata?.role || data.user.app_metadata?.role || '').toLowerCase();
        if (role === 'admin') {
          setUserRole('TM Admin')
        } else {
          setUserRole('TM Viewer')
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
    <div className="app-shell tm-module">
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      <aside className={`sidebar ${styles.sidebar} ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="TM Overseas navigation">
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
                  src="/logo/Tm Overseas.png" 
                  alt="TM Overseas" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
              <div>
                <div className={styles.logoName} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  TM Overseas
                </div>
                <div className={styles.logoSub}>Manpower Management</div>
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
                
                {/* Active Workspace: TM Overseas */}
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
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>TM Overseas</span>
                  </div>
                  <svg width="14" height="14" fill="none" stroke="var(--text-primary)" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </div>

                {/* Option 2: Titas Enterprise */}
                <Link 
                  href="/titas/dashboard"
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
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Titas Enterprise</span>
                    </div>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items
                .filter((item: any) => !item.adminOnly || userRole === 'TM Admin')
                .map((item: any) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${styles.navItem} ${pathname === item.href || pathname.startsWith(item.href + '/') ? `active ${styles.activeItem}` : ''}`}
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

        <div className={styles.sidebarBottom}>
          <Link href="/dashboard/select" className={`nav-item ${styles.switchBtn}`}>
            <SwapIcon /> Switch Module
          </Link>
          <div className={styles.userRow}>
            <div className={styles.userAvatar}>{(user?.full_name || user?.email)?.[0]?.toUpperCase() || 'U'}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.full_name || user?.email?.split('@')[0] || 'User'}</div>
              <div className={styles.userRole}>{userRole}</div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} aria-label="Sign out">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <button className={`btn btn-ghost btn-icon ${styles.menuBtn}`} onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle navigation" aria-expanded={sidebarOpen}>
            <MenuIcon />
          </button>
          <div className={styles.headerRight}>
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-ghost btn-icon" 
              onClick={toggleTheme} 
              aria-label="Toggle Color Theme" 
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

            <button className="btn btn-ghost btn-icon" aria-label="Notifications"><BellIcon /></button>
            <div className={styles.moduleBadge}>
              <span className={styles.moduleDot} />
              TM Overseas
            </div>
          </div>
        </header>
        <main className="page-content" id="main-content">{children}</main>
      </div>
    </div>
  )
}

function ShieldIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z"/></svg> }
function GridIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function UserIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg> }
function BuildingIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15l-.75 18H5.25L4.5 3zM9 3v18M15 3v18M9 9h6M9 12h6M9 15h6"/></svg> }
function PlaneIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12zm0 0h7.5"/></svg> }
function ChartBarIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg> }
function TrendIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg> }
function SparklesIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg> }
function TagIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/></svg> }
function CheckIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> }
function CogIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> }
function SwapIcon() { return <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg> }
function LogoutIcon() { return <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg> }
function BellIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg> }
function MenuIcon() { return <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg> }
