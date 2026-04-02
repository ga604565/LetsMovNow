import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth }   from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { chatApi }   from '../../api'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { unreadCount } = useSocket()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [sheetOpen, setSheetOpen]   = useState(false)
  const [realUnread, setRealUnread] = useState(0)
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    chatApi.getUnreadCount()
      .then((res) => setRealUnread(res.data.data.unreadCount))
      .catch(() => {})
  }, [isAuthenticated, unreadCount])

  const favoriteCount = user?.favorites?.length ?? 0

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
    setSheetOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  // ── Mobile bottom tab bar ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Slim top bar — logo only */}
        <nav style={mob.topBar}>
          <Link to="/" style={mob.logo}>
            <span style={{ fontSize: 20 }}>🏠</span>
            <span style={mob.logoText}>LetsMovNow</span>
          </Link>
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={mob.signIn}>Sign In</Link>
              <Link to="/register" style={mob.register}>Register</Link>
            </div>
          )}
        </nav>

        {/* Bottom tab bar */}
        {isAuthenticated && (
          <nav style={mob.tabBar}>
            <Link to="/" style={{ ...mob.tab, ...(isActive('/') ? mob.tabActive : {}) }}>
              <span style={mob.tabIcon}>🔍</span>
              <span style={mob.tabLabel}>Browse</span>
            </Link>
            <Link to="/listings/create" style={{ ...mob.tab, ...(isActive('/listings/create') ? mob.tabActive : {}) }}>
              <span style={{ ...mob.tabIcon, fontSize: 22 }}>＋</span>
              <span style={mob.tabLabel}>List</span>
            </Link>
            <Link to="/chat" style={{ ...mob.tab, ...(isActive('/chat') ? mob.tabActive : {}) }}>
              <span style={{ ...mob.tabIconWrap }}>
                <span style={mob.tabIcon}>💬</span>
                {realUnread > 0 && <span style={mob.tabBadge}>{realUnread > 9 ? '9+' : realUnread}</span>}
              </span>
              <span style={mob.tabLabel}>Messages</span>
            </Link>
            <Link to="/favorites" style={{ ...mob.tab, ...(isActive('/favorites') ? mob.tabActive : {}) }}>
              <span style={{ ...mob.tabIconWrap }}>
                <span style={mob.tabIcon}>♥</span>
                {favoriteCount > 0 && <span style={{ ...mob.tabBadge, background: '#FF6B6B' }}>{favoriteCount > 9 ? '9+' : favoriteCount}</span>}
              </span>
              <span style={mob.tabLabel}>Saved</span>
            </Link>
            <button style={{ ...mob.tab, ...(sheetOpen ? mob.tabActive : {}) }} onClick={() => setSheetOpen(true)}>
              <span style={mob.avatarSmall}>{user!.name.charAt(0).toUpperCase()}</span>
              <span style={mob.tabLabel}>Profile</span>
            </button>
          </nav>
        )}

        {/* Profile sheet */}
        {sheetOpen && (
          <>
            <div style={mob.overlay} onClick={() => setSheetOpen(false)} />
            <div style={mob.sheet}>
              <div style={mob.sheetHandle} />
              <div style={mob.sheetHeader}>
                <div style={mob.sheetAvatar}>{user!.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#F0F2FF' }}>{user!.name}</div>
                  <div style={{ fontSize: 13, color: '#9BA3C7', marginTop: 2 }}>{user!.email}</div>
                  {user!.isVerifiedStudent && (
                    <div style={{ fontSize: 12, color: '#4ECDC4', marginTop: 4 }}>✓ Verified Student</div>
                  )}
                </div>
              </div>
              <div style={mob.sheetDivider} />
              <Link to="/my-listings" style={mob.sheetItem} onClick={() => setSheetOpen(false)}>
                <span style={mob.sheetItemIcon}>🏠</span> My Listings
              </Link>
              <Link to="/favorites" style={mob.sheetItem} onClick={() => setSheetOpen(false)}>
                <span style={mob.sheetItemIcon}>♥</span> Saved Homes
              </Link>
              {isAdmin && (
                <Link to="/admin" style={{ ...mob.sheetItem, color: '#FFE66D' }} onClick={() => setSheetOpen(false)}>
                  <span style={mob.sheetItemIcon}>⚙️</span> Admin Panel
                </Link>
              )}
              <div style={mob.sheetDivider} />
              <button style={{ ...mob.sheetItem, color: '#FF6B6B', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }} onClick={handleLogout}>
                <span style={mob.sheetItemIcon}>↩</span> Sign Out
              </button>
            </div>
          </>
        )}
      </>
    )
  }

  // ── Desktop navbar ─────────────────────────────────────────────────────────
  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🏠</span>
          <span style={styles.logoText}>LetsMovNow</span>
        </Link>

        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.linkActive : {}) }}>Browse</Link>
          {isAuthenticated && (
            <Link to="/listings/create" style={{ ...styles.link, ...(isActive('/listings/create') ? styles.linkActive : {}) }}>List a Room</Link>
          )}
          {isAuthenticated && (
            <Link to="/my-listings" style={{ ...styles.link, ...(isActive('/my-listings') ? styles.linkActive : {}) }}>My Listings</Link>
          )}
          {isAdmin && (
            <Link to="/admin" style={{ ...styles.link, color: '#FFE66D' }}>Admin</Link>
          )}
        </div>

        <div style={styles.right}>
          {isAuthenticated ? (
            <>
              <Link to="/favorites" style={styles.iconBtn} title="Favorites">
                <span style={styles.iconWrap}>
                  ♥
                  {favoriteCount > 0 && (
                    <span style={{ ...styles.badge, background: '#FF6B6B' }}>
                      {favoriteCount > 99 ? '99+' : favoriteCount}
                    </span>
                  )}
                </span>
              </Link>

              <Link to="/chat" style={styles.iconBtn} title="Messages">
                <span style={styles.iconWrap}>
                  💬
                  {realUnread > 0 && (
                    <span style={{ ...styles.badge, background: '#4ECDC4', color: '#1B1F3B' }}>
                      {realUnread > 99 ? '99+' : realUnread}
                    </span>
                  )}
                </span>
              </Link>

              <div style={{ position: 'relative' }}>
                <button style={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                  <span style={styles.avatar}>{user!.name.charAt(0).toUpperCase()}</span>
                  <span style={styles.userName}>{user!.name.split(' ')[0]}</span>
                  {user!.isVerifiedStudent && (
                    <span style={styles.verifiedDot} title="Verified Student">✓</span>
                  )}
                  <span style={{ color: '#9BA3C7', fontSize: 12 }}>▾</span>
                </button>

                {menuOpen && (
                  <div style={styles.dropdown}>
                    <div style={styles.dropdownHeader}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{user!.name}</div>
                      <div style={{ fontSize: 11, color: '#9BA3C7' }}>{user!.email}</div>
                      {user!.isVerifiedStudent && (
                        <div style={{ fontSize: 11, color: '#4ECDC4', marginTop: 2 }}>✓ Verified Student</div>
                      )}
                    </div>
                    <div style={styles.dropdownDivider} />
                    <Link to="/my-listings" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>My Listings</Link>
                    <Link to="/favorites" style={styles.dropdownItem} onClick={() => setMenuOpen(false)}>Saved Homes</Link>
                    {isAdmin && (
                      <Link to="/admin" style={{ ...styles.dropdownItem, color: '#FFE66D' }} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
                    )}
                    <div style={styles.dropdownDivider} />
                    <button style={{ ...styles.dropdownItem, color: '#FF6B6B', width: '100%', textAlign: 'left' }} onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" style={styles.signInBtn}>Sign In</Link>
              <Link to="/register" style={styles.registerBtn}>Register</Link>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setMenuOpen(false)} />
      )}
    </nav>
  )
}

// ── Mobile styles ────────────────────────────────────────────────────────────
const mob: Record<string, React.CSSProperties> = {
  topBar:       { background: 'rgba(27,31,59,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56 },
  logo:         { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoText:     { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: '#F0F2FF' },
  signIn:       { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13, color: '#9BA3C7', padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', textDecoration: 'none' },
  register:     { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#1B1F3B', padding: '7px 14px', borderRadius: 10, background: '#4ECDC4', textDecoration: 'none' },
  tabBar:       { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(27,31,59,0.98)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'stretch', paddingBottom: 'env(safe-area-inset-bottom)' },
  tab:          { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', gap: 3, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', color: '#5C6490', transition: 'color 0.15s', minHeight: 56 },
  tabActive:    { color: '#4ECDC4' },
  tabIcon:      { fontSize: 20, lineHeight: 1 },
  tabIconWrap:  { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tabLabel:     { fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, letterSpacing: '0.02em' },
  tabBadge:     { position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16, borderRadius: 8, background: '#4ECDC4', color: '#1B1F3B', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  avatarSmall:  { width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #4ECDC4, #2C3E6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, backdropFilter: 'blur(2px)' },
  sheet:        { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1101, background: '#1E2340', borderRadius: '20px 20px 0 0', border: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' },
  sheetHandle:  { width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '12px auto 8px' },
  sheetHeader:  { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px 16px' },
  sheetAvatar:  { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #4ECDC4, #2C3E6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0 },
  sheetDivider: { height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' },
  sheetItem:    { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', fontSize: 15, color: '#F0F2FF', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, textDecoration: 'none' },
  sheetItemIcon:{ fontSize: 18, width: 24, textAlign: 'center' as const },
}

// ── Desktop styles ───────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  nav:             { background: 'rgba(27,31,59,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 1000 },
  inner:           { maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 32 },
  logo:            { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 },
  logoIcon:        { fontSize: 22 },
  logoText:        { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: '#F0F2FF' },
  links:           { display: 'flex', alignItems: 'center', gap: 4, flex: 1 },
  link:            { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#9BA3C7', padding: '6px 12px', borderRadius: 8, transition: 'color 0.15s, background 0.15s', textDecoration: 'none' },
  linkActive:      { color: '#4ECDC4', background: 'rgba(78,205,196,0.1)' },
  right:           { display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' },
  iconBtn:         { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 18, position: 'relative', textDecoration: 'none', transition: 'background 0.15s' },
  iconWrap:        { position: 'relative', display: 'flex' },
  badge:           { position: 'absolute', top: -8, right: -8, minWidth: 18, height: 18, borderRadius: 10, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  userBtn:         { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer', transition: 'background 0.15s', position: 'relative', zIndex: 100 },
  avatar:          { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #4ECDC4, #2C3E6B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  userName:        { fontSize: 14, fontWeight: 600, color: '#F0F2FF', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  verifiedDot:     { fontSize: 11, color: '#4ECDC4', background: 'rgba(78,205,196,0.15)', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dropdown:        { position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 220, background: '#252A4A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 101, overflow: 'hidden' },
  dropdownHeader:  { padding: '14px 16px', background: 'rgba(255,255,255,0.03)' },
  dropdownDivider: { height: 1, background: 'rgba(255,255,255,0.07)' },
  dropdownItem:    { display: 'block', padding: '10px 16px', fontSize: 14, color: '#9BA3C7', textDecoration: 'none', transition: 'background 0.12s, color 0.12s', cursor: 'pointer', background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif" },
  signInBtn:       { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: '#9BA3C7', padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', textDecoration: 'none', transition: 'all 0.15s' },
  registerBtn:     { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1B1F3B', padding: '8px 18px', borderRadius: 10, background: '#4ECDC4', textDecoration: 'none', transition: 'all 0.15s' },
}
