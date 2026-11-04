import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';
import { safeSetLocalStorage } from '../../utils/productImageStore';

/**
 * Checks whether the current session has authenticated admin clearance.
 * Customers and unauthenticated visitors do not have access.
 */
const hasAdminClearance = (): boolean => {
  try {
    return sessionStorage.getItem('aavira_admin_authenticated') === 'true';
  } catch {
    return false;
  }
};

/**
 * Updates Mrs. K. Ramani's portrait across the site.
 * Strictly locked to authenticated Administrators only.
 */
export const setCustomRamaniPortrait = (dataUrl: string) => {
  if (!hasAdminClearance()) {
    console.warn('[Aavira Security] Unauthorized: Mrs. K. Ramani portrait can only be modified by authenticated Admins.');
    return;
  }
  try {
    safeSetLocalStorage('aavira_ramani_portrait_custom', dataUrl);
    window.dispatchEvent(new Event('aavira_ramani_portrait_updated'));
  } catch (err) {
    console.warn('Could not save custom portrait', err);
  }
};

/**
 * Resets Mrs. K. Ramani's portrait back to default atelier photo.
 * Strictly locked to authenticated Administrators only.
 */
export const resetCustomRamaniPortrait = () => {
  if (!hasAdminClearance()) {
    console.warn('[Aavira Security] Unauthorized: Mrs. K. Ramani portrait can only be reset by authenticated Admins.');
    return;
  }
  try {
    localStorage.removeItem('aavira_ramani_portrait_custom');
    window.dispatchEvent(new Event('aavira_ramani_portrait_updated'));
  } catch (err) {
    console.error('Failed to reset custom portrait', err);
  }
};

interface RamaniPortraitProps {
  className?: string;
  alt?: string;
  id?: string;
  /**
   * Only permitted if the user is an authenticated administrator.
   * Defaults to false so customers/visitors have zero ability to modify or upload photos.
   */
  interactive?: boolean;
}

export const RamaniPortrait: React.FC<RamaniPortraitProps> = ({
  className = 'w-full h-full object-cover',
  alt = 'Mrs. K. Ramani, Founder & Managing Director',
  id,
  interactive = false, // Locked to customers by default
}) => {
  const [customSrc, setCustomSrc] = useState<string | null>(() => {
    try {
      return localStorage.getItem('aavira_ramani_portrait_custom');
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => hasAdminClearance());
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('aavira_ramani_portrait_custom');
        setCustomSrc(saved);
        setIsAdmin(hasAdminClearance());
      } catch {}
    };

    window.addEventListener('aavira_ramani_portrait_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('aavira_ramani_portrait_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Candidate image sources in preferential order:
  // 1. Custom uploaded portrait saved by authenticated admin
  // 2. Direct user attached image (000.jpg)
  // 3. Direct uploaded ramani web.jpg file
  // 4. Alternate ramani web image paths & URL-encoded variants
  // 5. Previous ramani.jpg and alternate aliases
  // 6. High-fidelity Kanchipuram silk SVG portrait fallback
  const candidateSources = [
    ...(customSrc ? [customSrc] : []),
    '000.jpg',
    '/000.jpg',
    './000.jpg',
    '/assets/000.jpg',
    'ramani web.jpg',
    '/ramani web.jpg',
    './ramani web.jpg',
    'ramani%20web.jpg',
    '/ramani%20web.jpg',
    './ramani%20web.jpg',
    '/assets/ramani web.jpg',
    '/assets/ramani%20web.jpg',
    'ramani-web.jpg',
    '/ramani-web.jpg',
    'ramani_web.jpg',
    '/ramani_web.jpg',
    'ramani.jpg',
    '/ramani.jpg',
    './ramani.jpg',
    '/assets/ramani.jpg',
    'ramani.png',
    '/ramani.png',
    '/ChatGPT Image Sep 12, 2026, 04_32_04 AM.png',
    encodeURI('/ChatGPT Image Sep 12, 2026, 04_32_04 AM.png'),
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

  const handleFile = (file?: File) => {
    if (!file || !isAdmin) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setCustomRamaniPortrait(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isAdmin) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Strictly lock image for customers and regular users:
  // Customers get a standard, high-quality image element with zero upload/change capabilities.
  const canModify = interactive && isAdmin;

  if (!canModify) {
    return (
      <img
        id={id}
        src={candidateSources[currentIndex] || '/k-ramani-portrait.svg'}
        alt={alt}
        className={className}
        onError={handleError}
        referrerPolicy="no-referrer"
        loading="eager"
      />
    );
  }

  // Admin-only interactive container
  return (
    <div
      className={`relative group w-full h-full flex items-center justify-center overflow-hidden cursor-pointer ${
        isDragging ? 'ring-2 ring-[#C5A059] ring-offset-2' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      title="Admin Control: Click or drop an image file to update Mrs. K. Ramani portrait"
    >
      <img
        id={id}
        src={candidateSources[currentIndex] || '/k-ramani-portrait.svg'}
        alt={alt}
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
        onError={handleError}
        referrerPolicy="no-referrer"
        loading="eager"
      />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Admin Hover Action Overlay */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-2 z-10">
        <Camera className="w-5 h-5 text-[#C5A059] mb-1 drop-shadow" />
        <span className="text-[11px] font-semibold tracking-wider uppercase text-[#FAF8F5]">
          Change Photo
        </span>
        <span className="text-[9px] text-[#D9CEBA] font-light">
          Admin clearance authorized
        </span>
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-[#C5A059]/80 flex flex-col items-center justify-center text-[#1C1814] font-bold text-xs z-20">
          <Upload className="w-6 h-6 mb-1 animate-bounce" />
          <span>Drop to Apply</span>
        </div>
      )}
    </div>
  );
};
