import React, { useState, useEffect } from 'react';

interface RamaniAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  showStatus?: boolean;
  alt?: string;
  border?: 'gold' | 'subtle' | 'none';
  id?: string;
}

const SIZE_MAP = {
  xs: 'w-5 h-5',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
  custom: '',
};

const BORDER_MAP = {
  gold: 'ring-1.5 ring-[#C5A059] shadow-sm',
  subtle: 'ring-1 ring-[#3D3023]',
  none: '',
};

export const RamaniAvatar: React.FC<RamaniAvatarProps> = ({
  size = 'md',
  className = '',
  showStatus = false,
  alt = 'Mrs. K. Ramani, Founder & AI Stylist',
  border = 'gold',
  id,
}) => {
  const [customSrc, setCustomSrc] = useState<string | null>(() => {
    try {
      return localStorage.getItem('aavira_ramani_portrait_custom');
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('aavira_ramani_portrait_custom');
        setCustomSrc(saved);
      } catch {}
    };

    window.addEventListener('aavira_ramani_portrait_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aavira_ramani_portrait_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Priority sources:
  // 1. Custom saved portrait
  // 2. User's attached image 000.jpg
  // 3. Alternate paths for 000.jpg
  // 4. ramani web.jpg
  // 5. Specialized square 1:1 avatar SVG
  // 6. Full SVG portrait
  const candidateSources = [
    ...(customSrc ? [customSrc] : []),
    '000.jpg',
    '/000.jpg',
    './000.jpg',
    '/assets/000.jpg',
    'ramani web.jpg',
    '/ramani web.jpg',
    './ramani web.jpg',
    'ramani.jpg',
    '/ramani.jpg',
    '/ramani-avatar.svg',
    '/k-ramani-portrait.svg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [customSrc]);

  const handleError = () => {
    if (currentIndex < candidateSources.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const dimensionClass = SIZE_MAP[size] || SIZE_MAP.md;
  const borderClass = BORDER_MAP[border] || '';

  return (
    <div
      className={`relative shrink-0 select-none inline-flex items-center justify-center rounded-full ${dimensionClass} ${className}`}
      id={id}
    >
      <img
        src={candidateSources[currentIndex] || '/ramani-avatar.svg'}
        alt={alt}
        className={`w-full h-full rounded-full object-cover object-[center_32%] bg-[#221915] ${borderClass}`}
        onError={handleError}
        referrerPolicy="no-referrer"
        loading="eager"
      />
      {showStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#34D399] border-2 border-[#1C1814] rounded-full ring-1 ring-emerald-500/40"
          title="Atelier Online"
        />
      )}
    </div>
  );
};
