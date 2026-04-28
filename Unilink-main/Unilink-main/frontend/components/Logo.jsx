import React from 'react';

// UniLink Logo SVG — clean wordmark + icon mark
const Logo = ({ size = 32, showWordmark = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark — Diya */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        {/* Flame */}
        <path d="M50 10 C65 35 65 55 50 60 C35 55 35 35 50 10 Z" fill="#C97340" />
        <path d="M50 28 C56 42 56 50 50 55 C44 50 44 42 50 28 Z" fill="#FCECC2" />
        
        {/* Bowl */}
        <path d="M10 65 A 40 30 0 0 0 90 65 Z" fill="#5D2622" />
        
        {/* Rim Left */}
        <path d="M10 65 C 20 75, 40 75, 50 65 C 40 55, 20 55, 10 65 Z" fill="#C97340" />
        <path d="M18 65 C 26 70, 38 70, 48 65 C 38 60, 26 60, 18 65 Z" fill="#5D2622" />
        
        {/* Rim Right */}
        <path d="M50 65 C 60 75, 80 75, 90 65 C 80 55, 60 55, 50 65 Z" fill="#C97340" />
        <path d="M52 65 C 62 70, 74 70, 82 65 C 74 60, 62 60, 52 65 Z" fill="#5D2622" />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "'Bragan', serif",
            fontSize: size * 0.8,
            color: '#5D2622',
            lineHeight: 1,
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          UniLink
        </span>
      )}
    </div>
  );
};

export default Logo;
