import React from 'react';

export interface FloralMotifProps {
  direction?: 'left' | 'right' | 'center';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gold' | 'champagne' | 'dark' | 'maroon' | 'current';
  className?: string;
  id?: string;
}

const SIZE_CLASSES = {
  xs: 'w-10 sm:w-14 h-4',
  sm: 'w-14 sm:w-20 h-5',
  md: 'w-20 sm:w-28 md:w-36 h-6 sm:h-7',
  lg: 'w-24 sm:w-36 md:w-44 h-7 sm:h-8',
  xl: 'w-32 sm:w-44 md:w-56 h-8 sm:h-10',
};

export const FloralMotif: React.FC<FloralMotifProps> = ({
  direction = 'left',
  size = 'md',
  variant = 'gold',
  className = '',
  id,
}) => {
  // Unique gradient ID prefix to avoid collisions
  const gradId = React.useId().replace(/:/g, '');

  // Gradient stops based on theme
  const getGradientColors = () => {
    switch (variant) {
      case 'champagne':
        return { start: '#FAF4E8', mid: '#E8DCC4', end: '#C5A059' };
      case 'dark':
        return { start: '#3D3023', mid: '#785F44', end: '#A89278' };
      case 'maroon':
        return { start: '#C5A059', mid: '#800020', end: '#500014' };
      case 'current':
        return null;
      case 'gold':
      default:
        return { start: '#D4AF37', mid: '#C5A059', end: '#8F6F30' };
    }
  };

  const colors = getGradientColors();
  const isRight = direction === 'right';
  const isCenter = direction === 'center';

  if (isCenter) {
    return (
      <svg
        viewBox="0 0 160 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${className}`}
        id={id}
        aria-hidden="true"
      >
        <defs>
          {colors && (
            <linearGradient id={`grad-center-${gradId}`} x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor={colors.end} stopOpacity="0.2" />
              <stop offset="25%" stopColor={colors.mid} stopOpacity="0.85" />
              <stop offset="50%" stopColor={colors.start} />
              <stop offset="75%" stopColor={colors.mid} stopOpacity="0.85" />
              <stop offset="100%" stopColor={colors.end} stopOpacity="0.2" />
            </linearGradient>
          )}
        </defs>

        {/* Left Flanking Vine */}
        <path
          d="M10 14 C 25 14, 35 15, 45 12 C 55 9, 62 12, 68 14"
          stroke={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* Left Scroll & Petals */}
        <path
          d="M28 14 C 25 9, 32 6, 36 9 C 39 12, 33 15, 29 14"
          fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          opacity="0.9"
        />
        <path
          d="M48 11 C 46 6, 52 4, 55 7 C 57 10, 52 12, 49 11"
          fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          opacity="0.9"
        />
        <circle cx="12" cy="14" r="1.5" fill={colors ? colors.start : 'currentColor'} />

        {/* Center Grand Lotus Rosette */}
        <g transform="translate(80, 14)">
          {/* Central bud */}
          <ellipse cx="0" cy="0" rx="3" ry="5.5" fill={colors ? colors.start : 'currentColor'} />
          {/* Left inner petal */}
          <path
            d="M-1 0 C -4 -4, -7 -3, -5 2 C -3 5, -1 3, 0 0"
            fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          />
          {/* Right inner petal */}
          <path
            d="M1 0 C 4 -4, 7 -3, 5 2 C 3 5, 1 3, 0 0"
            fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          />
          {/* Left outer flare */}
          <path
            d="M-3 2 C -8 0, -11 6, -6 7 C -3 7, -2 4, -3 2"
            fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
            opacity="0.8"
          />
          {/* Right outer flare */}
          <path
            d="M3 2 C 8 0, 11 6, 6 7 C 3 7, 2 4, 3 2"
            fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
            opacity="0.8"
          />
          <circle cx="0" cy="-7.5" r="1" fill={colors ? colors.start : 'currentColor'} />
          <circle cx="0" cy="7.5" r="1" fill={colors ? colors.start : 'currentColor'} />
        </g>

        {/* Right Flanking Vine */}
        <path
          d="M150 14 C 135 14, 125 15, 115 12 C 105 9, 98 12, 92 14"
          stroke={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* Right Scroll & Petals */}
        <path
          d="M132 14 C 135 9, 128 6, 124 9 C 121 12, 127 15, 131 14"
          fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          opacity="0.9"
        />
        <path
          d="M112 11 C 114 6, 108 4, 105 7 C 103 10, 108 12, 111 11"
          fill={colors ? `url(#grad-center-${gradId})` : 'currentColor'}
          opacity="0.9"
        />
        <circle cx="148" cy="14" r="1.5" fill={colors ? colors.start : 'currentColor'} />
      </svg>
    );
  }

  // Flanking Side Motif (left or mirrored right)
  return (
    <svg
      viewBox="0 0 110 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${
        isRight ? 'rotate-180' : ''
      } ${className}`}
      id={id}
      aria-hidden="true"
    >
      <defs>
        {colors && (
          <linearGradient id={`grad-side-${gradId}`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor={colors.end} stopOpacity="0.15" />
            <stop offset="35%" stopColor={colors.mid} stopOpacity="0.8" />
            <stop offset="85%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.start} />
          </linearGradient>
        )}
      </defs>

      {/* Main graceful undulating vine stem */}
      <path
        d="M2 12 C 18 12, 28 11.5, 40 13.5 C 52 15.5, 62 10.5, 74 11.5 C 84 12.5, 94 12, 104 12"
        stroke={colors ? `url(#grad-side-${gradId})` : 'currentColor'}
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* Outer subtle finial bead */}
      <circle cx="4" cy="12" r="1.25" fill={colors ? colors.end : 'currentColor'} opacity="0.6" />
      <circle cx="14" cy="12" r="1" fill={colors ? colors.mid : 'currentColor'} opacity="0.75" />

      {/* 1st Leaf Pair (delicate upward and downward curls) */}
      <path
        d="M28 12 C 26 7, 33 5, 37 8.5 C 39 11, 34 13, 29 12"
        fill={colors ? `url(#grad-side-${gradId})` : 'currentColor'}
      />
      <path
        d="M32 12.5 C 31 16.5, 37 18, 40 15 C 42 13, 38 12, 33 12.5"
        fill={colors ? `url(#grad-side-${gradId})` : 'currentColor'}
        opacity="0.85"
      />

      {/* Middle Scrolling Tendril with Indian Jaali Curvature */}
      <path
        d="M52 14 C 49 19, 58 21, 62 17 C 65 14, 59 11.5, 54 13"
        fill={colors ? `url(#grad-side-${gradId})` : 'currentColor'}
      />
      <path
        d="M58 11 C 55 5, 65 3.5, 68 7 C 70 9.5, 65 12, 59 11.5"
        fill={colors ? `url(#grad-side-${gradId})` : 'currentColor'}
      />

      {/* Near-Heading Lotus Bud Finial (Right tip in left mode) */}
      <g transform="translate(92, 12)">
        {/* Core Petal pointing towards heading */}
        <path
          d="M0 0 C 4 -3.5, 10 -2.5, 14 0 C 10 2.5, 4 3.5, 0 0"
          fill={colors ? colors.start : 'currentColor'}
        />
        {/* Upper Petal */}
        <path
          d="M-2 -1 C 2 -6, 8 -7, 10 -3 C 8 -1, 3 -1, -2 -1"
          fill={colors ? `url(#grad-side-${gradId})` : 'currentColor'}
        />
        {/* Lower Petal */}
        <path
          d="M-2 1 C 2 6, 8 7, 10 3 C 8 1, 3 1, -2 1"
          fill={colors ? `url(#grad-side-${gradId})` : 'currentColor'}
        />
        {/* Rosette Diamond Finial */}
        <circle cx="16" cy="0" r="1.75" fill={colors ? colors.start : 'currentColor'} />
        <circle cx="16" cy="-4" r="0.75" fill={colors ? colors.mid : 'currentColor'} />
        <circle cx="16" cy="4" r="0.75" fill={colors ? colors.mid : 'currentColor'} />
      </g>
    </svg>
  );
};
