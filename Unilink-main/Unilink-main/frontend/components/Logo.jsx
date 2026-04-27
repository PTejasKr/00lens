import React from 'react';

// UniLink Logo SVG — clean wordmark + icon mark
const Logo = ({ size = 32, showWordmark = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon mark — interlocking U shapes */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer arc */}
        <path
          d="M8 10 L8 24 Q8 34 20 34 Q32 34 32 24 L32 10"
          stroke="#850E35"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner arc — offset */}
        <path
          d="M14 10 L14 22 Q14 28 20 28 Q26 28 26 22 L26 10"
          stroke="#EE6983"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Top bar accent */}
        <line x1="6" y1="8" x2="34" y2="8" stroke="#FFC4C4" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: size * 0.72,
            color: '#850E35',
            lineHeight: 1,
            letterSpacing: '-0.02em',
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
