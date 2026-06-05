'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './tm-layout.module.css'
import {
  GridIcon, UserIcon, BuildingIcon, ChartBarIcon, TrendIcon, SparklesIcon,
  TagIcon, CheckIcon, CogIcon, ShieldIcon, SwapIcon, LogoutIcon, BellIcon,
  MenuIcon, MoonIcon, SunIcon, ChevronDownIcon, CheckmarkIcon,
} from '@/components/icons'

/* ── Types ── */
interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
}

interface NavSection {
  section: string
  items: NavItem[]
}

/* ── Navigation config ── */
const navItems: NavSection[] = [
  {
    section: 'Overview',
    items: [
      { href: '/tm/dashboard', label: 'Dashboard', icon: <GridIcon /> },
    ],
  },
  {
    section: 'People',
    items: [
      { href: '/tm/workers',  label: 'Workers',  icon: <UserIcon /> },
      { href: '/tm/agencies', label: 'Agencies', icon: <BuildingIcon /> },
    ],
  },
  {
    section: 'Finance & Analytics',
    items: [
      { href: '/tm/reports',   label: 'Reports',     icon: <ChartBarIcon /> },
      { href: '/tm/analytics', label: 'Analytics',   icon: <TrendIcon /> },
      { href: '/tm/ai',        label: 'AI Insights', icon: <SparklesIcon /> },
    ],
  },
  {
    section: 'Manage',
    items: [
      { href: '/tm/categories', label: 'Categories',  icon: <TagIcon /> },
      { href: '/tm/tasks',      label: 'Tasks',       icon: <CheckIcon /> },
      { href: '/tm/settings',   label: 'Settings',    icon: <CogIcon /> },
      { href: '/tm/admin',      label: 'Admin Panel', icon: <ShieldIcon />, adminOnly: true },
    ],
  },
]

export default function TMLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname()
  const router     = useRouter()
  const supabase   = createClient()

  const [sidebarOpen,  setSidebarOpen]  = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [user,         setUser]         = useState<{ email?: string; full_name?: string } | null>(null)
  const [theme,        setTheme]        = useState('light')
  const [userRole,     setUserRole]     = useState('TM Viewer')

  /* ── Load user + theme on mount ── */
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        let fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.ownerName || ''
        try {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .single()
          if (profileRow?.full_name) fullName = profileRow.full_name
        } catch (e) {
          console.error('Error fetching profile row:', e)
        }
        setUser({ email: data.user.email, full_name: fullName })
        const role = (data.user.user_metadata?.role || data.user.app_metadata?.role || '').toLowerCase()
        setUserRole(role === 'admin' ? 'TM Admin' : 'TM Viewer')
      }
    })

    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  /* ── Close switcher on Escape ── */
  useEffect(() => {
    if (!switcherOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSwitcherOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [switcherOpen])

  /* ── Close sidebar on route change ── */
  useEffect(() => { setSidebarOpen(false) }, [pathname])

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }, [theme])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [supabase, router])

  const userInitial = (user?.full_name || user?.email)?.[0]?.toUpperCase() || 'U'
  const userName    = user?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="app-shell tm-module">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`sidebar ${styles.sidebar} ${sidebarOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="TM Overseas navigation"
      >
        {/* Workspace switcher */}
        <div style={{ position: 'relative', width: '100%' }}>
          <button
            onClick={() => setSwitcherOpen(p => !p)}
            aria-haspopup="true"
            aria-expanded={switcherOpen}
            aria-label="Switch workspace"
            className={styles.switcherBtn}
          >
            <div className={styles.switcherLeft}>
              <div
                className={`sidebar-logo-mark ${styles.logoMark}`}
                style={{ overflow: 'hidden', background: '#ffffff', padding: '2px' }}
              >
                <img
                  src="/logo/Tm Overseas.png"
                  alt="TM Overseas logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>
              <div>
                <div className={styles.logoName}>TM Overseas</div>
                <div className={styles.logoSub}>Manpower Management</div>
              </div>
            </div>
            <span
              className={styles.chevron}
              style={{ transform: switcherOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            >
              <ChevronDownIcon />
            </span>
          </button>

          {/* Workspace dropdown */}
          {switcherOpen && (
            <>
              <div
                onClick={() => setSwitcherOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                aria-hidden="true"
              />
              <div className={styles.switcherDropdown} role="menu">
                <div className={styles.switcherLabel}>Switch Workspace</div>

                {/* Current: TM Overseas */}
                <div className={styles.switcherItemActive} role="menuitem" aria-current="true">
                  <div className={styles.switcherItemLeft}>
                    <span className={styles.activeDot} />
                    <span className={styles.switcherItemName}>TM Overseas</span>
                  </div>
                  <CheckmarkIcon />
                </div>

                {/* Switch to Titas */}
                <Link
                  href="/titas/dashboard"
                  role="menuitem"
                  onClick={() => setSwitcherOpen(false)}
                  className={styles.switcherItemLink}
                >
                  <div className={styles.switcherItemLeft}>
                    <span className={styles.inactiveDot} />
                    <span>Titas Enterprise</span>
                  </div>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(section => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items
                .filter(item => !item.adminOnly || userRole === 'TM Admin')
                .map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </Link>
                  )
                })}
            </div>
          ))}
        </nav>

        {/* Bottom: switch module + user row */}
        <div className={styles.sidebarBottom}>
          <Link href="/dashboard/select" className={`nav-item ${styles.switchBtn}`}>
            <SwapIcon /> Switch Module
          </Link>
          <div className={styles.userRow}>
            <div className={styles.userAvatar} aria-hidden="true">{userInitial}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userName}</div>
              <div className={styles.userRole}>{userRole}</div>
            </div>
            <button
              onClick={handleLogout}
              className={styles.logoutBtn}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="main-content">
        <header className="top-header" role="banner">
          {/* Mobile hamburger */}
          <button
            className={`btn btn-ghost btn-icon ${styles.menuBtn}`}
            onClick={() => setSidebarOpen(p => !p)}
            aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={sidebarOpen}
            aria-controls="tm-sidebar"
          >
            <MenuIcon />
          </button>

          <div className={styles.headerRight}>
            {/* Theme toggle */}
            <button
              className="btn btn-ghost btn-icon"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            <button className="btn btn-ghost btn-icon" aria-label="Notifications" title="Notifications">
              <BellIcon />
            </button>

            <div className={styles.moduleBadge} aria-label="Current module: TM Overseas">
              <span className={styles.moduleDot} aria-hidden="true" />
              <span className={styles.moduleBadgeText}>TM Overseas</span>
            </div>
          </div>
        </header>

        <main className="page-content" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
