import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../App';

export const Modal: React.FC<{ children: React.ReactNode; isOpen: boolean; themeConfig: typeof themes[Theme] }> = ({ children, isOpen, themeConfig }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-gray-800 border ${themeConfig.accentBorder} rounded-lg shadow-xl ${themeConfig.accentShadow} p-6 w-full max-w-2xl text-white`}>
        {children}
      </div>
    </div>
  );
};
