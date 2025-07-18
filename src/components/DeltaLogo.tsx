import React from 'react';

interface DeltaLogoProps {
  size?: number;
  className?: string;
}

export function DeltaLogo({ size = 64, className = '' }: DeltaLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`bgGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#4F46E5', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id={`deltaGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#FFFFFF', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#E0E7FF', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Main circle background */}
      <circle 
        cx="32" 
        cy="32" 
        r="30" 
        fill={`url(#bgGradient-${size})`} 
        stroke="#3730A3" 
        strokeWidth="2"
      />
      
      {/* Delta symbol (triangle) */}
      <path 
        d="M32 16 L46 42 L18 42 Z" 
        fill="none" 
        stroke={`url(#deltaGradient-${size})`} 
        strokeWidth="3" 
        strokeLinejoin="round"
      />
      
      {/* Inner accent lines for movement/rhythm */}
      <path 
        d="M32 22 L40 36 L24 36 Z" 
        fill="none" 
        stroke={`url(#deltaGradient-${size})`} 
        strokeWidth="1.5" 
        strokeOpacity="0.6"
      />
      
      {/* Small dots representing route points */}
      <circle cx="32" cy="20" r="1.5" fill="#FFFFFF"/>
      <circle cx="28" cy="38" r="1.5" fill="#FFFFFF"/>
      <circle cx="36" cy="38" r="1.5" fill="#FFFFFF"/>
      
      {/* Subtle motion lines */}
      <path d="M20 28 L22 28" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4"/>
      <path d="M42 28 L44 28" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.4"/>
      <path d="M20 32 L23 32" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3"/>
      <path d="M41 32 L44 32" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.3"/>
    </svg>
  );
}

// Simplified version for small sizes (like navbar)
export function DeltaLogoSimple({ size = 32, className = '' }: DeltaLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`bgGradSimple-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#4F46E5'}} />
          <stop offset="100%" style={{stopColor: '#7C3AED'}} />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill={`url(#bgGradSimple-${size})`} stroke="#3730A3" strokeWidth="1"/>
      <path d="M16 8 L23 21 L9 21 Z" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="16" cy="10" r="1" fill="#FFFFFF"/>
      <circle cx="14" cy="19" r="1" fill="#FFFFFF"/>
      <circle cx="18" cy="19" r="1" fill="#FFFFFF"/>
    </svg>
  );
}
