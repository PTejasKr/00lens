import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GLYPHS = ['/', '-', '\\', '|', '+', '=', '*', '#', '%', '@'];
const MEASUREMENTS = ['29', '33', '38', '42', '51', '67', '74', '89'];

const SplashScreen = ({ onComplete }) => {
  const [loadingText, setLoadingText] = useState('INITIALIZING');
  const [glyph, setGlyph] = useState('/');
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading');

  // Random measurements positioned around the screen
  const markers = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: `${Math.random() * 80 + 10}%`,
      y: `${Math.random() * 80 + 10}%`,
      val: MEASUREMENTS[i % MEASUREMENTS.length]
    }));
  }, []);

  useEffect(() => {
    // Glyph rotation
    const glyphInterval = setInterval(() => {
      setGlyph(prev => {
        const idx = GLYPHS.indexOf(prev);
        return GLYPHS[(idx + 1) % GLYPHS.length];
      });
    }, 100);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 200);

    // Text updates
    const textSequence = [
      { t: 0, text: 'BOOTING_KERNEL' },
      { t: 600, text: 'FETCHING_CAMPUS_RESOURCES' },
      { t: 1200, text: 'MAPPING_NETWORK_GRAPH' },
      { t: 1800, text: 'FINALIZING_UI_THREAD' },
      { t: 2400, text: 'READY' }
    ];

    textSequence.forEach(({ t, text }) => {
      setTimeout(() => setLoadingText(text), t);
    });

    // Cleanup and completion
    const exitTimer = setTimeout(() => setPhase('exit'), 2800);
    const completeTimer = setTimeout(() => onComplete?.(), 3400);

    return () => {
      clearInterval(glyphInterval);
      clearInterval(progressInterval);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#F5F5DC',
            color: '#A0522D',
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background Grid Pattern */}
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(#A0522D 0.5px, transparent 0.5px)',
              backgroundSize: '32px 32px',
              opacity: 0.1,
            }}
          />

          {/* Geometric Markers (igloo style) */}
          {markers.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0.2] }}
              transition={{ delay: m.id * 0.1, duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                left: m.x,
                top: m.y,
                fontSize: '10px',
                letterSpacing: '0.1em',
                pointerEvents: 'none',
              }}
            >
              +{m.val}
              <div style={{ width: '20px', height: '1px', background: '#A0522D', opacity: 0.3, marginTop: '2px' }} />
            </motion.div>
          ))}

          {/* Central Terminal Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', position: 'relative' }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontFamily: "'Oglaso', sans-serif",
                fontSize: '120px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              UNILINK
              <span style={{ color: '#E35336', fontSize: '3rem' }}>{glyph}</span>
            </motion.div>

            <div style={{ width: '300px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.2em', opacity: 0.7, marginBottom: '0.5rem' }}>
                {loadingText}
              </div>
              <div style={{ height: '4px', width: '100%', background: 'rgba(160, 82, 45, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  style={{ height: '100%', background: '#E35336' }}
                />
              </div>
            </div>
          </div>

          {/* System Info Footnote */}
          <div style={{ position: 'absolute', bottom: '2rem', width: '100%', textAlign: 'center', fontSize: '10px', opacity: 0.4, letterSpacing: '0.1em' }}>
            V2.1.0-STABLE // SYSTEM_READY // @UNILINK_CAMPUS
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
