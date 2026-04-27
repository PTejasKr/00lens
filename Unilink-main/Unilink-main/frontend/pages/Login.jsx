import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter both email and password'); return; }
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success(`Welcome back, ${result.name || 'friend'}!`);
        navigate('/feed');
      } else toast.error(result.message);
    } catch { toast.error('An unexpected error occurred'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FCF5EE' }}>
      {/* ── Left panel — brand billboard ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'none',
          flex: '0 0 46%',
          background: '#850E35',
          padding: '3rem',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="lg-flex"
      >
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,196,196,0.12)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(238,105,131,0.15)' }} />

        <Logo size={36} light />

        <div>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2.25rem, 3.5vw, 3rem)', lineHeight: 1.1, color: 'white', marginBottom: '1.25rem' }}>
            Your campus,<br /><span style={{ color: '#FFC4C4' }}>one feed away.</span>
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: '340px' }}>
            Connect with peers, join communities, and stay on top of everything happening at your university.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          {[['4k+', 'Students'], ['120+', 'Groups'], ['98%', 'Satisfaction']].map(([val, label]) => (
            <div key={label}>
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem', color: 'white', margin: 0 }}>{val}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, margin: 0, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Right panel — form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Mobile logo */}
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="lg-hidden">
            <Logo size={28} />
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.875rem, 3vw, 2.5rem)', color: '#850E35', margin: 0, marginBottom: '0.5rem', lineHeight: 1.1 }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', color: '#9A6472', margin: 0, marginBottom: '2.5rem', fontWeight: 400 }}>
            Sign in to continue to UniLink
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#3B0A1F', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                University Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9A6472', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#3B0A1F', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9A6472', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A6472', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#9A6472', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#EE6983', fontWeight: 700, textDecoration: 'none' }}>
                Create one free
              </Link>
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', color: '#b0899c', margin: 0 }}>
              Admin?{' '}
              <Link to="/admin/login" style={{ color: '#850E35', fontWeight: 600, textDecoration: 'none' }}>
                Sign in here →
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-flex { display: flex !important; } .lg-hidden { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
