import React, { useState, useEffect } from 'react';
import { QariReciter } from '../../types/database';
import {
  getReciterAvatarUrl,
  RECITER_REMOTE_FALLBACKS,
  getReciterInitials,
} from '../../data/reciterAvatars';

interface ReciterAvatarProps {
  reciter: QariReciter;
  isSelected?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  imgClassName?: string;
  showSomaliFlag?: boolean;
}

export const ReciterAvatar: React.FC<ReciterAvatarProps> = ({
  reciter,
  isSelected = false,
  size = 'md',
  className = '',
  imgClassName = '',
  showSomaliFlag = false,
}) => {
  const primaryUrl = getReciterAvatarUrl(reciter.id, reciter.portraitUrl);
  const [currentSrc, setCurrentSrc] = useState<string>(primaryUrl);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [hasError, setHasError] = useState(!primaryUrl);

  useEffect(() => {
    const url = getReciterAvatarUrl(reciter.id, reciter.portraitUrl);
    setCurrentSrc(url);
    setHasTriedFallback(false);
    setHasError(!url);
  }, [reciter.id, reciter.portraitUrl]);

  const handleError = (e?: React.SyntheticEvent<HTMLImageElement>) => {
    const remoteFallback = RECITER_REMOTE_FALLBACKS[reciter.id];
    if (!hasTriedFallback && remoteFallback && remoteFallback !== currentSrc) {
      setHasTriedFallback(true);
      setCurrentSrc(remoteFallback);
      return;
    }
    if (e?.currentTarget && !e.currentTarget.src.endsWith('/default-reciter-avatar.png')) {
      e.currentTarget.src = '/default-reciter-avatar.png';
      return;
    }
    setHasError(true);
  };

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base',
  }[size];

  const initials = getReciterInitials(reciter.name);
  const isSomali = reciter.country.toLowerCase().includes('somalia');

  return (
    <div className={`relative shrink-0 ${sizeClasses} ${className}`}>
      {!hasError && currentSrc ? (
        <img
          src={currentSrc}
          alt={reciter.name}
          onError={handleError}
          className={`w-12 h-12 rounded-full object-cover ring-2 transition-transform duration-300 ${
            isSelected
              ? 'ring-white shadow-md scale-105'
              : 'ring-blue-500/30 hover:ring-blue-400/60 shadow-xs'
          } ${sizeClasses} ${imgClassName}`}
          loading="lazy"
        />
      ) : (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 transition-all ${sizeClasses} ${
            isSelected
              ? 'bg-white text-blue-600 shadow-xs'
              : 'bg-blue-800/90 text-white border border-blue-700/60 shadow-2xs'
          }`}
          title={reciter.name}
        >
          {initials}
        </div>
      )}

      {/* Optional Somali Heritage Mini-Emblem on avatar corner */}
      {showSomaliFlag && isSomali && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-[9px] flex items-center justify-center border border-white shadow-xs"
          title="Somalia 🇸🇴"
        >
          🇸🇴
        </span>
      )}
    </div>
  );
};
