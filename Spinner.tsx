import * as React from 'react';
import { Theme } from '../../types.ts';
import { themes } from '../../App.tsx';

export const Spinner: React.FC<{ themeConfig: typeof themes[Theme] }> = ({ themeConfig }) => (
  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeConfig.spinnerBorder}`}></div>
);