import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'color';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showText = true
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl'
  };

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Badge */}
      <div 
        className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#E0F2FE] via-[#F5EFEB] to-[#BAE6FD] p-1 shadow-sm border border-[#E8E2D8] hover:scale-105 transition-transform duration-200`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Subtle background circle in deep navy */}
          <rect width="48" height="48" rx="14" fill="#0F172A" />
          
          {/* Soft inner glow gradient */}
          <circle cx="24" cy="24" r="20" fill="url(#navyGlow)" opacity="0.4" />

          {/* 4 Paw Toe Pads (Pastel Sky, Sky Blue, Warm Beige, Light Pastel) */}
          <ellipse cx="13" cy="16" rx="3.5" ry="4.5" transform="rotate(-15 13 16)" fill="#7DD3FC" />
          <ellipse cx="20.5" cy="11" rx="3.8" ry="5.2" transform="rotate(-5 20.5 11)" fill="#BAE6FD" />
          <ellipse cx="28.5" cy="11.5" rx="3.8" ry="5.2" transform="rotate(8 28.5 11.5)" fill="#F5EFEB" />
          <ellipse cx="35.5" cy="17" rx="3.5" ry="4.5" transform="rotate(18 35.5 17)" fill="#38BDF8" />

          {/* Main Palm: Stylized Heart & Hug Silhouette */}
          <path
            d="M24 40C24 40 12 31.5 12 22.8C12 18.2 15.5 15 19.8 15C22.4 15 23.6 16.3 24 17.5C24.4 16.3 25.6 15 28.2 15C32.5 15 36 18.2 36 22.8C36 31.5 24 40 24 40Z"
            fill="#FDFBF7"
          />

          {/* Inner Friendly Dog/Cat Silhouette embedded within the palm */}
          <path
            d="M24 35C24 35 15.5 28.5 15.5 22C15.5 18.8 18 16.5 21 16.5C22.8 16.5 23.5 17.5 24 18.2C24.5 17.5 25.2 16.5 27 16.5C30 16.5 32.5 18.8 32.5 22C32.5 28.5 24 35 24 35Z"
            fill="#BAE6FD"
          />

          {/* Small Center Heart in Deep Navy */}
          <path
            d="M24 28.5C24 28.5 19 24.5 19 20.5C19 18.5 20.5 17 22.2 17C23.2 17 23.7 17.6 24 18.2C24.3 17.6 24.8 17 25.8 17C27.5 17 29 18.5 29 20.5C29 24.5 24 28.5 24 28.5Z"
            fill="#0F172A"
          />

          {/* Little spark of hope / star at top right */}
          <path
            d="M39 6L39.8 8.2L42 9L39.8 9.8L39 12L38.2 9.8L36 9L38.2 8.2L39 6Z"
            fill="#FDE68A"
          />

          <defs>
            <radialGradient id="navyGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(24 24) rotate(90) scale(20)">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0F172A" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-tight">
            <span className={`font-black font-['Outfit',sans-serif] tracking-tight ${
              variant === 'light' ? 'text-white' : 'text-[#0F172A]'
            } ${textSizes[size]}`}>
              Pata<span className="text-[#38BDF8]">Amiga</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#F5EFEB] text-[#0F172A] border border-[#E5DDD0]">
              Tolima
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-wide ${
            variant === 'light' ? 'text-[#BAE6FD]' : 'text-slate-500'
          }`}>
            Purificación • Bienestar Animal
          </span>
        </div>
      )}
    </div>
  );
};
