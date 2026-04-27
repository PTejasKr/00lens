import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ChevronDown } from 'lucide-react';
import SearchBar from './SearchBar';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: scrolled ? 'rgba(252,245,238,0.95)' : '#FCF5EE',
        borderBottom: scrolled ? '1px solid rgba(238,105,131,0.12)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 16px rgba(133,14,53,0.06)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Logo size={30} showWordmark />
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: '480px' }}>
          <SearchBar />
        </div>

        {/* Right — Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileOpen(p => !p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.375rem 0.75rem 0.375rem 0.375rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(238,105,131,0.2)',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(238,105,131,0.18)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <img
                  src={user?.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'U'}&backgroundColor=ffc4c4&textColor=850e35`}
                  alt={user?.name}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#FFC4C4',
                  }}
                />
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#850E35',
                  display: 'none',
                }}
                  className="sm:block"
                >
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: '#9A6472',
                    transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      background: 'white',
                      border: '1px solid rgba(238,105,131,0.15)',
                      borderRadius: '14px',
                      boxShadow: '0 8px 32px rgba(133,14,53,0.12)',
                      minWidth: '180px',
                      overflow: 'hidden',
                      zIndex: 200,
                    }}
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    {/* User info */}
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(238,105,131,0.1)' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#850E35', margin: 0 }}>
                        {user?.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#9A6472', margin: 0, marginTop: '2px' }}>
                        {user?.email}
                      </p>
                    </div>

                    <div style={{ padding: '0.375rem' }}>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'block',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#3B0A1F',
                          textDecoration: 'none',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(238,105,131,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        View Profile
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileOpen(false)}
                          style={{
                            display: 'block',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#3B0A1F',
                            textDecoration: 'none',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(238,105,131,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          Admin Panel
                        </Link>
                      )}

                      <div style={{ margin: '0.375rem 0', height: '1px', background: 'rgba(238,105,131,0.1)' }} />

                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#DC2626',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/login"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#850E35',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(238,105,131,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1.125rem',
                  borderRadius: '8px',
                  background: '#EE6983',
                  boxShadow: '0 2px 8px rgba(238,105,131,0.35)',
                  transition: 'background 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d95575'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#EE6983'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Join free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
