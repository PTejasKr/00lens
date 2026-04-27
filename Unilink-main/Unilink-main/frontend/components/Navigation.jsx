import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, PlusSquare, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';

const menuItems = [
  { label: 'Feed',     path: '/',         Icon: LayoutDashboard },
  { label: 'Groups',   path: '/groups',   Icon: Compass },
  { label: 'Create',   path: '/create',   Icon: PlusSquare },
  { label: 'Messages', path: '/messages', Icon: MessageSquare },
  { label: 'Profile',  path: '/profile',  Icon: User },
];

const Navigation = () => (
  <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0.5rem 0' }}>
    {menuItems.map(({ label, path, Icon }, i) => (
      <NavLink key={path} to={path} end={path === '/'}>
        {({ isActive }) => (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.625rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer',
              background: isActive ? 'rgba(238,105,131,0.1)' : 'transparent',
              color: isActive ? '#850E35' : '#9A6472',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              fontWeight: isActive ? 700 : 500,
              textDecoration: 'none',
              transition: 'background 0.18s, color 0.18s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(238,105,131,0.06)'; e.currentTarget.style.color = isActive ? '#850E35' : '#EE6983'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(238,105,131,0.1)' : 'transparent'; e.currentTarget.style.color = isActive ? '#850E35' : '#9A6472'; }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                style={{ position: 'absolute', left: 0, top: '20%', width: '3px', height: '60%', background: '#EE6983', borderRadius: '0 4px 4px 0' }}
              />
            )}
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
            <span style={{ display: 'none' }} className="lg-nav-label">{label}</span>
          </motion.div>
        )}
      </NavLink>
    ))}
    <style>{`
      @media (min-width: 1024px) { .lg-nav-label { display: inline !important; } }
    `}</style>
  </nav>
);

export default Navigation;
