import React from 'react';

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  withText?: boolean;
  textClassName?: string;
  variant?: 'frontend' | 'quran';
}

const SIZE_MAP = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-14 h-14 sm:w-16 sm:h-16',
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  alt,
  withText = false,
  textClassName = '',
  variant = 'frontend',
}) => {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const isQuran = variant === 'quran';
  const logoSrc = isQuran ? '/logo-quran.png' : '/logo-frontend.png';
  const logoAlt = alt || (isQuran ? 'EMufti Quran Logo' : 'EMufti AI Logo');

  const imageElement = (
    <img
      src={logoSrc}
      alt={logoAlt}
      width={size === 'xl' ? 64 : size === 'lg' ? 40 : size === 'md' ? 32 : size === 'sm' ? 28 : 20}
      height={size === 'xl' ? 64 : size === 'lg' ? 40 : size === 'md' ? 32 : size === 'sm' ? 28 : 20}
      className={`object-contain rounded-xl select-none flex-shrink-0 transition-transform ${sizeClass} ${className}`}
      loading="eager"
    />
  );

  if (!withText) {
    return imageElement;
  }

  return (
    <div className="inline-flex items-center gap-2.5 group select-none">
      {imageElement}
      <span className={`font-bold tracking-tight text-blue-600 dark:text-white ${textClassName || 'text-base sm:text-lg'}`}>
        EMufti <span className="font-extrabold text-blue-600 dark:text-white">{isQuran ? 'Quran' : 'AI'}</span>
      </span>
    </div>
  );
};
