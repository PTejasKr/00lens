import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, User, PlusCircle, LogOut, X, LogIn, MessageSquare, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { label: 'Feed',     path: '/',         Icon: LayoutDashboard },
  { label: 'Groups',   path: '/groups',   Icon: Users },
  { label: 'Messages', path: '/messages', Icon: MessageSquare },
  { label: 'Create',   path: '/create',   Icon: PlusCircle },
  { label: 'Profile',  path: '/profile',  Icon: User },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); onToggle(); navigate('/login'); };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onToggle}
            style={{ position: 'fixed', inset: 0, background: 'rgba(45,24,16,0.35)', backdropFilter: 'blur(4px)', zIndex: 110 }}
            className="md-hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'fixed', top: 0, right: 0, height: '100%',
          background: 'white', borderLeft: '1px solid var(--color-border)',
          zIndex: 120, boxShadow: '-4px 0 32px rgba(160,82,45,0.08)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Header */}
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.125rem', borderBottom: '1px solid rgba(238,105,131,0.1)', flexShrink: 0 }}>
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.125rem', color: 'var(--color-dark)' }}>
              Navigation
            </motion.span>
          )}
          {/* Desktop collapse */}
          <button onClick={() => setIsCollapsed(c => !c)}
            style={{ padding: '0.375rem', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex', marginLeft: isCollapsed ? 'auto' : undefined, transition: 'color 0.15s, background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(227,83,54,0.08)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-muted)'; }}
            className="desktop-only"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {/* Mobile close */}
          <button onClick={onToggle}
            style={{ padding: '0.375rem', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted)', display: 'flex' }}
            className="mobile-only"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.5rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          {menuItems.map(({ label, path, Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={onToggle}>
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: isCollapsed ? '0.75rem' : '0.65rem 1rem',
                    borderRadius: '10px', cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start',
                    background: isActive ? 'rgba(227,83,54,0.1)' : 'transparent',
                    color: isActive ? 'var(--color-dark)' : 'var(--color-muted)',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(227,83,54,0.06)'; e.currentTarget.style.color = 'var(--color-primary)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted)'; } }}
                >
                  {isActive && <div style={{ position: 'absolute', right: 0, top: '20%', width: '3px', height: '60%', background: 'var(--color-primary)', borderRadius: '4px 0 0 4px' }} />}
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span>{label}</span>}

                  {/* Tooltip on collapse */}
                  {isCollapsed && (
                    <div style={{
                      position: 'absolute', right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)',
                      background: 'var(--color-ink)', color: 'white', padding: '0.25rem 0.625rem',
                      borderRadius: '6px', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif", fontWeight: 600,
                      whiteSpace: 'nowrap', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.15s',
                    }} className="sidebar-tooltip">{label}</div>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user card */}
        <div style={{ padding: '0.875rem', borderTop: '1px solid var(--color-border)', flexShrink: 0, background: 'rgba(245,245,220,0.5)' }}>
          {isAuthenticated ? (
            <div>
              {!isCollapsed && user && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.625rem' }}>
                  <img
                    src={user.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=f4a460&textColor=2d1810`}
                    alt={user.name}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'var(--color-muted)', margin: 0, textTransform: 'capitalize' }}>{user.role || 'Student'}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '8px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 600, transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; e.currentTarget.style.color = '#DC2626'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--color-muted)'; }}
              >
                <LogOut size={16} />
                {!isCollapsed && <span>Log out</span>}
              </button>
            </div>
          ) : (
            <NavLink to="/login" onClick={onToggle}
              style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', gap: '0.5rem', padding: '0.625rem 0.875rem', borderRadius: '8px', background: 'var(--color-dark)', color: 'white', textDecoration: 'none', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', fontWeight: 700, boxShadow: '0 2px 10px rgba(160,82,45,0.3)' }}>
              <LogIn size={16} />
              {!isCollapsed && <span>Sign In</span>}
            </NavLink>
          )}
        </div>
      </motion.aside>

      <style>{`
        .desktop-only { display: flex; }
        .mobile-only  { display: none; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: flex !important; }
          .md-hidden    { display: block !important; }
        }
        div:hover .sidebar-tooltip { opacity: 1 !important; }
      `}</style>
    </>
  );
};

export default Sidebar;
