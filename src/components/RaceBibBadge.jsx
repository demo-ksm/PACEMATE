import React from 'react';

export function RaceBibBadge({
  text,
  variant = 'teal', // 'teal' | 'orange' | 'stone' | 'success' | 'outline'
  number,
  tilt = false,
  size = 'md',
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'orange':
        return 'bg-[#E85D2C] text-white border-[#2C3333]';
      case 'stone':
        return 'bg-[#E8E4DA] text-[#2C3333] border-[#2C3333]';
      case 'success':
        return 'bg-[#2E7D32] text-white border-[#2C3333]';
      case 'outline':
        return 'bg-transparent text-[#2C3333] border-[#2C3333]';
      case 'teal':
      default:
        return 'bg-[#276F6E] text-white border-[#2C3333]';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-[10px] px-1.5 py-0.5 font-mono font-bold';
      case 'lg':
        return 'text-sm px-3 py-1 font-mono font-extrabold tracking-wider';
      case 'md':
      default:
        return 'text-xs px-2 py-0.5 font-mono font-bold';
    }
  };

  const tiltClass = tilt ? (Math.random() > 0.5 ? 'rotate-[-1.5deg]' : 'rotate-[1.5deg]') : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border shadow-[2px_2px_0px_#2C3333] transition-transform ${getVariantStyles()} ${getSizeStyles()} ${tiltClass}`}
    >
      {number && (
        <span className="opacity-80 border-r border-current pr-1 text-[0.85em]">
          #{number}
        </span>
      )}
      <span>{text}</span>
    </span>
  );
}

export function RaceBibCard({ children, className = '', tilt = false }) {
  const tiltStyle = tilt ? 'transform rotate-[-0.5deg] hover:rotate-0' : '';
  return (
    <div className={`bib-card p-5 rounded-md ${tiltStyle} ${className}`}>
      <div className="bib-pinhole-tl" />
      <div className="bib-pinhole-tr" />
      {children}
    </div>
  );
}
