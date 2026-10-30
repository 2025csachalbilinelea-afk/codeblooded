import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const isLight = variant === 'light'; // Light text for dark backgrounds
  const textPrimary = isLight ? 'text-white' : 'text-rural-forest';
  const textSub = isLight ? 'text-rural-mint/80' : 'text-rural-muted';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Brand Icon combining Leaf, Path/Route, and Field Furrows */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-rural-primary to-rural-forest flex items-center justify-center text-white shadow-sm ring-1 ring-rural-fresh/30 shrink-0`}
      >
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Farm field horizon / furrow curve */}
          <path
            d="M4 21C8 19 13 18 24 20"
            stroke="#DDF2E5"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          {/* Route path ascending through the field */}
          <path
            d="M8 22C10 16 13 12 18 6"
            stroke="#279565"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="1 3"
          />
          {/* Organic Sprout / Leaf at summit */}
          <path
            d="M18 5C22 5 24 8 22 13C17 13 15 10 18 5Z"
            fill="#279565"
            stroke="#DDF2E5"
            strokeWidth="1.2"
          />
          <path
            d="M17 12C14 12 11 15 13 19C17 19 19 16 17 12Z"
            fill="#176B49"
            stroke="#DDF2E5"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div>
        <div className={`font-sans font-bold tracking-tight leading-none ${textSizes[size]}`}>
          <span className={textPrimary}>Harvest</span>
          <span className="text-rural-fresh">Route</span>
        </div>
        {showTagline && (
          <p className={`text-[11px] font-medium tracking-normal mt-0.5 ${textSub}`}>
            Know your best market before leaving the farm
          </p>
        )}
      </div>
    </div>
  );
};

