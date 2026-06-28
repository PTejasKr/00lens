import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Terminal, Code2, Network, ChevronRight, Github, Loader2, 
  Copy, Check, User, GitPullRequest, Settings, LogOut, Menu, X 
} from 'lucide-react';

/* ── Custom Scroll Reveal Hook ── */
function useScrollReveal(options = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, [options]);

  return ref;
}

const DEMO_PRESETS = [
  {
    label: 'Main Core',
    tag: 'velo',
    color: '#ffffff',
    highlight: true,
    repoUrl: 'https://github.com/oyelurker/velo-agent',
    teamName: 'Vakratund',
    leaderName: 'Tejas Kumar',
  },
  {
    label: 'Knoxiboy Test',
    tag: 'knoxiboy',
    color: '#a1a1aa',
    repoUrl: 'https://github.com/knoxiboy/velo_test_repo',
    teamName: 'Vakratund',
    leaderName: 'Velo_Tester',
  },
  {
    label: 'Tejas Test',
    tag: 'PTejasKr',
    color: '#a1a1aa',
    repoUrl: 'https://github.com/PTejasKr/tejesh_test_repo',
    teamName: 'Vakratund',
    leaderName: 'Velo_Tester',
  },
];

const ASCII_ART = [
  " .`                                 `/",
  " `++:.                           `-/+/",
  "  `+sso+:-`                 `.-/+oso:",
  "   `/ossssso+/:-        -:/+osssso+-",
  "     /ossssssss/        +ssssooo/-",
  "      :osssssss/        osssso+++.",
  "       -osssssso.      :ssssssso.",
  "        .oossssso-````/ossssss+`",
  "         ./ooosssso++osssssso+`",
  "          `/+++ooooooooooooo/`",
  "           `/++++++++++++++:",
  "            `/++++/+++++++:",
  "             `/:-:++oooo+:",
  "               -+oooooo+:",
  "               `+oooooo:",
  "                `+oooo:",
  "                 `ooo/",
  "                  .o+`",
  "                   -`"
].join('\n');

/* ── Interactive Fluid Particles Background ── */
function FuturisticBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Thicker particles
    const numParticles = 45;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      radius: Math.random() * 8 + 6, // Thicker particles (6px to 14px radius)
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.04 + 0.01,
    }));

    const draw = () => {
      // Dark background with slight radial glow
      const radialGlow = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 10,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      radialGlow.addColorStop(0, '#0a0915');
      radialGlow.addColorStop(1, '#020202');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw fluid connections
      ctx.lineWidth = 1.5;
      for (let i = 0; i < numParticles; i++) {
        for (let j = i + 1; j < numParticles; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = Math.pow(1 - dist / 180, 2);
            // Purple connection lines
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.4})`;
            ctx.stroke();
          }
        }
      }

      // Update and draw fluid particles
      particles.forEach(p => {
        p.wobble += p.wobbleSpeed;
        
        // Add a fluid wobble to movement
        const currentVx = p.vx + Math.cos(p.wobble) * 0.5;
        const currentVy = p.vy + Math.sin(p.wobble) * 0.5;

        p.x += currentVx;
        p.y += currentVy;

        // Bounce off edges with a margin
        const margin = 50;
        if (p.x < -margin) { p.x = -margin; p.vx *= -1; }
        if (p.x > canvas.width + margin) { p.x = canvas.width + margin; p.vx *= -1; }
        if (p.y < -margin) { p.y = -margin; p.vy *= -1; }
        if (p.y > canvas.height + margin) { p.y = canvas.height + margin; p.vy *= -1; }

        // Draw particle
        ctx.beginPath();
        // Pulsing radius
        const currentRadius = Math.max(2, p.radius + Math.sin(p.wobble) * 2);
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        
        // Purple body with intense Red glow
        ctx.fillStyle = 'rgba(168, 85, 247, 0.85)'; // Purple
        ctx.shadowColor = '#ef4444'; // Red glow
        ctx.shadowBlur = 25; // Glow intensity
        ctx.fill();
        
        // Reset shadow for performance
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -2 }} />;
}

export default function LandingPage({ onSubmit, loading }) {
  const { user, signOut, loginUrl } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [memoryUsed, setMemoryUsed] = useState(420);
  
  // Dropdown states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMemoryUsed(415 + Math.floor(Math.random() * 25));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Copy npm command to clipboard
  const handleCopyCommand = () => {
    navigator.clipboard.writeText("npm install -g @google/gemini-cli");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ repo_url: repoUrl, team_name: teamName, leader_name: leaderName });
  };

  const fillDemo = (preset = DEMO_PRESETS[0]) => {
    setRepoUrl(preset.repoUrl);
    setTeamName(preset.teamName);
    setLeaderName(preset.leaderName);
  };

  return (
    <div style={{ background: '#020203', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>

      {/* Futuristic Background Engine */}
      <FuturisticBackground />

      {/* ── Floating Modern Glass Navbar (Inspired by easemize) ── */}
      <nav style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '850px',
        height: '58px',
        borderRadius: '9999px',
        background: 'rgba(10, 10, 15, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 65 20 L 90 20 L 58 95 L 42 95 Z" fill="#FF7E67" />
            <path d="M 10 20 L 35 20 L 58 95 L 42 95 Z" fill="#FF2A54" />
          </svg>
          <span className="font-mecha" style={{ fontWeight: 700, fontSize: 19, color: 'var(--text)' }}>Velo AI</span>
        </div>

        {/* Center links (Desktop only) */}
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }} className="hide-mobile">
          <span style={{ cursor: 'pointer', transition: 'color 0.2s', color: '#fff' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-2)'} onClick={() => document.getElementById('terminal-section')?.scrollIntoView({ behavior: 'smooth' })}>Run Agent</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'var(--text-2)'} onClick={() => window.open('https://github.com/oyelurker/velo-agent', '_blank')}>Source</span>
        </div>

        {/* Right actions / Dropdown Trigger (reui base-menu inspired) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }} ref={menuRef}>
          {user ? (
            <>
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
                  borderRadius: '999px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,126,103,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                {user.login || 'User'}
              </button>

              {/* ── Base Menu Dropdown (Inspired by reui) ── */}
              {profileMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '48px', width: 200,
                  background: 'rgba(10, 10, 15, 0.92)', backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px', padding: '6px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
                  display: 'flex', flexDirection: 'column', gap: 2, zIndex: 1100,
                }}>
                  <div style={{ padding: '8px 12px', color: 'var(--text-3)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Identity Details
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                    borderRadius: '8px', background: 'rgba(255,255,255,0.03)', marginBottom: '4px'
                  }}>
                    <User size={14} color="var(--accent)" />
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.email || user.login}
                    </span>
                  </div>

                  <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                  <button className="dropdown-item" style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px',
                    border: 'none', background: 'transparent', color: 'var(--text-2)', borderRadius: '8px',
                    fontSize: 12, fontWeight: 500, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s'
                  }} onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#fff'; }} onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-2)'; }}>
                    <User size={14} />
                    Profile
                  </button>

                  <button className="dropdown-item" style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px',
                    border: 'none', background: 'transparent', color: 'var(--text-2)', borderRadius: '8px',
                    fontSize: 12, fontWeight: 500, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s'
                  }} onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#fff'; }} onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-2)'; }}>
                    <GitPullRequest size={14} />
                    Requests
                  </button>

                  <button className="dropdown-item" style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px',
                    border: 'none', background: 'transparent', color: 'var(--text-2)', borderRadius: '8px',
                    fontSize: 12, fontWeight: 500, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s'
                  }} onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#fff'; }} onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-2)'; }}>
                    <Settings size={14} />
                    Settings
                  </button>

                  <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

                  <button onClick={() => signOut()} className="dropdown-item" style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px',
                    border: 'none', background: 'transparent', color: '#ff4d4d', borderRadius: '8px',
                    fontSize: 12, fontWeight: 600, textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s'
                  }} onMouseEnter={e => e.target.style.background = 'rgba(255,77,77,0.1)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                    <LogOut size={14} />
                    Log out
                  </button>
                </div>
              )}
            </>
          ) : (
            <a href={loginUrl} style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '8px 16px', fontSize: 12, fontWeight: 600,
                border: 'none', background: 'var(--accent)', color: '#000',
                borderRadius: '24px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6
              }} onMouseEnter={e => { e.target.style.background = 'var(--accent-hover)'; }} onMouseLeave={e => { e.target.style.background = 'var(--accent)'; }}>
                <Github size={14} />
                Sign In
              </button>
            </a>
          )}

          {/* Hamburger menu for mobile screen (inspired by easemize) */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', padding: 4 }} 
            className="show-mobile"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(5, 5, 8, 0.95)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 32, zIndex: 999, transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: 24, color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</span>
          <span style={{ fontSize: 24, color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setMobileMenuOpen(false); document.getElementById('terminal-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Run Agent</span>
          <span style={{ fontSize: 24, color: 'var(--text-2)', fontWeight: 600, cursor: 'pointer' }} onClick={() => window.open('https://github.com/oyelurker/velo-agent', '_blank')}>Source Code</span>
        </div>
      )}

      {/* ── Central Futuristic Hero (reapollo inspired) ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '150px', paddingBottom: '80px', position: 'relative', zIndex: 10, width: '100%' }}>

        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center', padding: '0 24px', marginBottom: 20, position: 'relative' }}>
          
          {/* Ambient Glow behind Heading */}
          <div style={{
            position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '80%', height: '120%',
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.14) 0%, rgba(0, 0, 0, 0) 70%)',
            zIndex: -1, pointerEvents: 'none'
          }} />

          {/* Main Hero Header */}
          <h1 className="font-mecha" style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: 'var(--text)',
            marginBottom: 20,
            textShadow: '0 0 30px rgba(99, 102, 241, 0.2)'
          }}>
            Build 
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 15, 25, 0.8)',
              border: '1.5px solid transparent',
              backgroundImage: 'linear-gradient(rgba(15, 15, 25, 0.8), rgba(15, 15, 25, 0.8)), linear-gradient(135deg, #FF2A54, #FF9B00)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              borderRadius: '12px',
              width: '60px',
              height: '42px',
              margin: '0 16px',
              verticalAlign: 'middle',
              boxShadow: '0 0 15px rgba(255, 42, 84, 0.3)'
            }}>
              <span style={{ color: '#FF7E67', fontWeight: 'bold', fontSize: '24px', marginTop: '-2px' }}>&gt;</span>
            </span>
            debug <br />
            & deploy with AI
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)',
            color: 'var(--text-2)',
            lineHeight: 1.6,
            maxWidth: 650,
            margin: '0 auto 36px',
            fontWeight: 400
          }}>
            Query and edit large codebases, generate apps from images or PDFs, and automate complex workflows—all from your terminal with Gemini 3.
          </p>

          {/* Copyable NPM Command box */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(10, 10, 15, 0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '99px',
              padding: '10px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }} 
            onClick={handleCopyCommand}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,126,103,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <span className="mono" style={{ color: '#FF7E67', fontSize: 13, marginRight: 2 }}>$</span>
              <span className="mono" style={{ color: 'var(--text)', fontSize: 13, letterSpacing: '0.02em' }}>npm install -g @google/gemini-cli</span>
              <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}>
                {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Link */}
          <span style={{ 
            color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer', 
            textDecoration: 'none', transition: 'all 0.2s' 
          }} 
          onMouseEnter={e => e.target.style.color = 'var(--text)'}
          onMouseLeave={e => e.target.style.color = '#a78bfa'}
          onClick={() => document.getElementById('terminal-section')?.scrollIntoView({ behavior: 'smooth' })}>
            More install options
          </span>
        </div>

        {/* ── Deployment Form & Interactive App Demo ── */}
        <div id="terminal-section" style={{ width: '100%', height: '85vh', padding: '0 24px', margin: '40px auto 0', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div className="mock-window" style={{
            position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
            borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.9), 0 0 50px rgba(255, 126, 103, 0.05)',
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(20px)'
          }}>
            <div className="mock-window-header" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', background: 'rgba(10, 10, 15, 0.95)', borderBottom: '1px solid var(--border)'
            }}>
              <div className="mock-dots" style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <div className="mono" style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>
                velo-zsh — active sandbox
              </div>
              <div style={{ width: 52 }} />
            </div>

            <div style={{ flex: 1, padding: '40px 60px', background: 'transparent', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

              <div className="mono" style={{ color: 'var(--text-3)', fontSize: 15, marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: '#4ade80' }}>➜</span>
                <span style={{ color: '#60a5fa' }}>~</span>
                <span style={{ color: 'var(--text)' }}>neofetch | lolcat</span>
              </div>

              <div style={{ display: 'flex', gap: 60, marginBottom: 40, alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="mono hide-mobile" style={{
                  fontSize: 13, lineHeight: 1.2, whiteSpace: 'pre', fontWeight: 800,
                  background: 'linear-gradient(180deg, #ff2a54, #ff5e3a, #ff9b00, #4ade80, #3b82f6, #a855f7)',
                  WebkitBackgroundClip: 'text', color: 'transparent', width: 'fit-content'
                }}>
                  {ASCII_ART}
                </div>

                <div className="mono" style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ color: '#ff5e3a', fontWeight: 700 }}>velo<span style={{ color: 'var(--text)' }}>@</span>agent</div>
                  <div style={{ color: 'var(--text-3)' }}>---------</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>Agent Name</span>: Velo</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>Status</span>: Awaiting Repository Context...</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>LLM Model</span>: Gemini 3.5 Flash</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>Active Nodes</span>: Analyzer, LLM Solver, Sandbox</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>Core Engine</span>: Velo OS x86_64</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>Environment</span>: Isolated Docker Sandbox</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>CPU</span>: Cloud Compute Cluster (128 Cores)</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>Memory</span>: {memoryUsed}GiB / 6969GiB</div>
                  <div><span style={{ color: '#ff5e3a', fontWeight: 700 }}>Uptime</span>: 69 days, 69 mins, 69 sec</div>

                  <div style={{ display: 'flex', gap: 0, marginTop: 12 }}>
                    <div style={{ width: 18, height: 18, background: '#333' }} />
                    <div style={{ width: 18, height: 18, background: '#ef4444' }} />
                    <div style={{ width: 18, height: 18, background: '#22c55e' }} />
                    <div style={{ width: 18, height: 18, background: '#eab308' }} />
                    <div style={{ width: 18, height: 18, background: '#3b82f6' }} />
                    <div style={{ width: 18, height: 18, background: '#a855f7' }} />
                    <div style={{ width: 18, height: 18, background: '#06b6d4' }} />
                    <div style={{ width: 18, height: 18, background: '#f5f5f5' }} />
                  </div>
                </div>
              </div>

              {/* Presets injected above the form for faster access */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
                <span className="mono" style={{ fontSize: 14, color: 'var(--text-3)' }}>&gt; available_targets:</span>
                {DEMO_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => fillDemo(preset)}
                    className="btn-ghost mono"
                    style={{
                      padding: '8px 16px', borderRadius: 4, fontSize: 13,
                      background: preset.highlight ? 'rgba(255, 126, 103, 0.1)' : 'transparent',
                      color: preset.highlight ? 'var(--accent)' : 'var(--text-2)',
                      border: `1px solid ${preset.highlight ? 'rgba(255, 126, 103, 0.3)' : 'var(--border)'}`,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'rgba(255, 126, 103, 0.2)';
                      e.target.style.color = 'var(--text)';
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = preset.highlight ? 'rgba(255, 126, 103, 0.1)' : 'transparent';
                      e.target.style.color = preset.highlight ? 'var(--accent)' : 'var(--text-2)';
                    }}
                  >
                    ./load_{preset.tag.toLowerCase()}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, flex: 1 }}>
                <div>
                  <label className="mono" style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ color: '#4ade80' }}>➜</span>
                    <span style={{ color: '#60a5fa' }}>~</span>
                    <span style={{ color: '#fba922' }}>export</span>
                    <span style={{ color: 'var(--text)' }}>TARGET_REPOSITORY=</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      className="input mono"
                      type="url"
                      required
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      style={{
                        flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                        fontSize: 16, padding: '8px 0', color: '#fff', borderRadius: 0, boxShadow: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }} className="grid-mobile">
                  <div>
                    <label className="mono" style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ color: '#4ade80' }}>➜</span>
                      <span style={{ color: '#60a5fa' }}>~</span>
                      <span style={{ color: '#fba922' }}>export</span>
                      <span style={{ color: 'var(--text)' }}>ASSIGNED_TEAM=</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        className="input mono"
                        type="text"
                        required
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="Vakratund"
                        style={{
                          width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 16, padding: '8px 0', color: '#fff', borderRadius: 0, boxShadow: 'none'
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mono" style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ color: '#4ade80' }}>➜</span>
                      <span style={{ color: '#60a5fa' }}>~</span>
                      <span style={{ color: '#fba922' }}>export</span>
                      <span style={{ color: 'var(--text)' }}>DEPLOYMENT_USER=</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        className="input mono"
                        type="text"
                        required
                        value={leaderName}
                        onChange={e => setLeaderName(e.target.value)}
                        placeholder="Tejas Kumar"
                        style={{
                          width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                          fontSize: 16, padding: '8px 0', color: '#fff', borderRadius: 0, boxShadow: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span className="mono" style={{ color: '#4ade80', fontSize: 15 }}>➜</span>
                  <span className="mono" style={{ color: '#60a5fa', fontSize: 15 }}>~</span>
                  <button
                    className="btn-primary mono"
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px 28px', fontSize: 15, borderRadius: 8,
                      background: 'var(--accent)', color: '#000', border: 'none',
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: '0 0 20px rgba(255, 126, 103, 0.4)', fontWeight: 'bold'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="spin" color="#000" />
                        Provisioning...
                      </>
                    ) : (
                      <>
                        ./deploy_agent.sh <span className="blink-cursor" style={{ display: 'inline-block', width: 8, height: 16, background: '#000', marginLeft: 4 }} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </main>

      {/* ── Footer ── */}
      <footer style={{
        background: '#040406',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Top Minimal Link Section */}
        <div style={{
          width: '100%', maxWidth: 1200, padding: '60px 40px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 12, height: 12, background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px rgba(255, 126, 103, 0.5)' }} />
            <span className="font-mecha" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Velo AI</span>
          </div>

          <div className="spine-footer-links" style={{ display: 'flex', gap: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#">Service</a>
            <a href="#">Works</a>
            <a href="#">About Us</a>
            <a href="#">FAQ</a>
          </div>
        </div>

        {/* Middle Copyright & Socials Bar */}
        <div style={{
          width: '100%',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>© 2026- All Rights Reserved.</span>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Velo AI Studio</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Made with 🫶 by Team Vakratund</span>
          </div>
        </div>

        {/* Massive Bottom Text */}
        <div style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
          <div className="font-mecha spine-footer-logo" style={{ letterSpacing: '0.15em', opacity: 0.05, fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: 'bold', color: 'var(--text)', textTransform: 'uppercase' }}>VELO AI</div>
        </div>
      </footer>

    </div>
  );
}
