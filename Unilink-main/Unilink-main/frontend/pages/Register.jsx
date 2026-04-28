import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

const Field = ({ label, icon: Icon, value, onChange, type = 'text', placeholder, rightAction }) => (
  <div>
    <label style={{ display: 'block', fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: '#3B0A1F', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9A6472', pointerEvents: 'none' }} />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
        style={{ paddingLeft: '2.75rem', paddingRight: rightAction ? '3rem' : '1rem' }}
        required
      />
      {rightAction && (
        <button type="button" onClick={rightAction.onClick}
          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9A6472', padding: 0, display: 'flex' }}>
          {rightAction.icon}
        </button>
      )}
    </div>
  </div>
);

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Please fill in all fields'); return;
    }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setIsSubmitting(true);
    try {
      const result = await register(name, email, password);
      if (result.success) {
        toast.success('Account created! Please sign in.');
        navigate('/login');
      } else toast.error(result.message);
    } catch { toast.error('Connection error. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FCF5EE' }}>
      {/* Left brand panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'none',
          flex: '0 0 42%',
          background: '#850E35',
          padding: '3rem',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="lg-flex"
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,196,196,0.10)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(238,105,131,0.12)' }} />

        <Logo size={36} light />

        <div>
          <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 3vw, 2.75rem)', lineHeight: 1.1, color: 'white', marginBottom: '1.25rem' }}>
            Start your<br /><span style={{ color: '#FFC4C4' }}>university journey.</span>
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: '340px' }}>
            Join thousands of students already building connections, sharing ideas, and collaborating on campus.
          </p>
        </div>

        <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Built by students, for students</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>
            "UniLink changed how I connect with classmates and find study groups."
          </p>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: '440px', padding: '1rem 0' }}
        >
          <div style={{ marginBottom: '2.5rem' }} className="lg-hidden">
            <Logo size={28} />
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(1.875rem, 3vw, 2.25rem)', color: '#850E35', margin: 0, marginBottom: '0.5rem', lineHeight: 1.1 }}>
            Create your account
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9375rem', color: '#9A6472', margin: 0, marginBottom: '2rem', fontWeight: 400 }}>
            Free forever for students
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <Field label="Full Name" icon={User} value={name} onChange={setName} placeholder="Your full name" />
            <Field label="University Email" icon={Mail} value={email} onChange={setEmail} type="email" placeholder="you@university.edu" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field
                label="Password"
                icon={Lock}
                value={password}
                onChange={setPassword}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                rightAction={{ onClick: () => setShowPassword(p => !p), icon: showPassword ? <EyeOff size={16} /> : <Eye size={16} /> }}
              />
              <Field
                label="Confirm"
                icon={ShieldCheck}
                value={confirmPassword}
                onChange={setConfirmPassword}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                rightAction={{ onClick: () => setShowConfirmPassword(p => !p), icon: showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} /> }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{ width: '100%', padding: '0.875rem', marginTop: '0.375rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.875rem', color: '#9A6472', margin: '1.75rem 0 0', textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .lg-flex { display: flex !important; } .lg-hidden { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Register;
