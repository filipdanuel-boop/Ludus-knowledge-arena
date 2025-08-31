
import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';

export const NeonButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary', themeConfig: typeof themes[Theme] }> = ({ children, className, variant = 'primary', themeConfig, ...props }) => {
  const baseClasses = "px-6 py-2 rounded-md font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variantClasses = variant === 'primary' ? themeConfig.neonButtonPrimary : themeConfig.neonButtonSecondary;
  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};
