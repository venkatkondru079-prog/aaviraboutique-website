import React from 'react';
import { FloralMotif, FloralMotifProps } from './FloralMotif';

export interface FloralHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  children: React.ReactNode;
  eyebrow?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  variant?: 'gold' | 'champagne' | 'dark' | 'maroon';
  motifSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showCenterAccent?: boolean;
  className?: string;
  titleClassName?: string;
  id?: string;
}

export const FloralHeading: React.FC<FloralHeadingProps> = ({
  as: Component = 'h2',
  children,
  eyebrow,
  subtitle,
  align = 'center',
  variant = 'gold',
  motifSize,
  showCenterAccent = false,
  className = '',
  titleClassName = '',
  id,
}) => {
  // Determine default motif size based on heading level if not specified
  const resolvedMotifSize = motifSize || (Component === 'h1' ? 'lg' : Component === 'h2' ? 'md' : 'sm');

  if (align === 'left') {
    return (
      <div className={`space-y-2 ${className}`} id={id}>
        {eyebrow && (
          <div className="flex items-center gap-2">
            <FloralMotif direction="left" size="xs" variant={variant} className="w-8 sm:w-12 h-3" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#B8860B] font-semibold">
              {eyebrow}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
          <Component
            className={`font-serif tracking-wide text-[#1A1510] ${
              Component === 'h1' ? 'text-3xl sm:text-5xl' : Component === 'h2' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            } ${titleClassName}`}
          >
            {children}
          </Component>
          <FloralMotif direction="right" size={resolvedMotifSize} variant={variant} className="hidden sm:inline-block" />
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-[#736352] max-w-2xl font-light leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Centered Floral Heading (Flanked on Both Sides by Classic Floral Motifs)
  return (
    <div className={`text-center max-w-4xl mx-auto space-y-2.5 ${className}`} id={id}>
      {eyebrow && (
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#FAF4E8]/80 border border-[#E8DCC4] text-[#B8860B] text-xs uppercase tracking-widest font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] inline-block" />
          <span>{eyebrow}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] inline-block" />
        </div>
      )}

      {/* Main Title Row with Symmetrical Flanking Floral Motifs */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 px-2">
        {/* Left Classic Floral Motif */}
        <FloralMotif
          direction="left"
          size={resolvedMotifSize}
          variant={variant}
          className="shrink-0 transition-transform duration-300 hover:scale-105"
        />

        {/* Heading Title */}
        <Component
          className={`font-serif text-[#1A1510] tracking-wide text-center shrink ${
            Component === 'h1'
              ? 'text-3xl sm:text-5xl lg:text-6xl'
              : Component === 'h2'
              ? 'text-2xl sm:text-3xl md:text-4xl'
              : 'text-xl sm:text-2xl'
          } ${titleClassName}`}
        >
          {children}
        </Component>

        {/* Right Classic Floral Motif (Symmetrical Mirror) */}
        <FloralMotif
          direction="right"
          size={resolvedMotifSize}
          variant={variant}
          className="shrink-0 transition-transform duration-300 hover:scale-105"
        />
      </div>

      {showCenterAccent && (
        <div className="flex justify-center pt-1">
          <FloralMotif direction="center" size="sm" variant={variant} />
        </div>
      )}

      {subtitle && (
        <p className="text-xs sm:text-sm text-[#736352] max-w-xl mx-auto font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
