import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && user.role === 'admin') navigate('/admin/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter both email and password'); return; }
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.role === 'admin') {
          toast.success('Access granted. Welcome, Admin.');
          navigate('/admin/dashboard');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Access denied. Admin privileges required.');
        }
      } else toast.error(result.message || 'Invalid credentials');
    } catch { toast.error('An unexpected error occurred'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FCF5EE', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        {/* Header chip */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'rgba(133,14,53,0.07)', borderRadius: '999px', border: '1px solid rgba(133,14,53,0.15)' }}>
            <Shield size={14} style={{ color: '#850E35' }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: '#850E35', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin Portal</span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(238,105,131,0.15)', boxShadow: '0 8px 40px rgba(133,14,53,0.1)', padding: '2.5rem' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.875rem', color: '#850E35', margin: 0, marginBottom: '0.375rem', lineHeight: 1.1 }}>
            Administrator Sign In
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#9A6472', margin: 0, marginBottom: '2rem' }}>
            Restricted access — authorised personnel only
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#3B0A1F', marginBottom: '0.5rem' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9A6472', pointerEvents: 'none' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@university.edu" className="input-field" style={{ paddingLeft: '2.75rem' }} autoComplete="email" required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#3B0A1F', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9A6472', pointerEvents: 'none' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="input-field" style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A6472', padding: 0, display: 'flex' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.375rem', background: '#850E35', color: 'white', border: 'none', borderRadius: '10px', fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1, transition: 'opacity 0.2s, transform 0.2s', boxShadow: '0 4px 16px rgba(133,14,53,0.3)' }}
              onMouseEnter={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isSubmitting
                ? <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                : <><Shield size={16} /> Access Admin Panel</>
              }
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#9A6472', textDecoration: 'none', fontWeight: 500 }}>
            <ArrowLeft size={14} /> Back to student login
          </Link>
        </div>

        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#b0899c', textAlign: 'center', marginTop: '1rem' }}>
          🔒 Restricted access. All sign-in attempts are logged.
        </p>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminLogin;
