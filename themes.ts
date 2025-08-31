
import { Theme } from './types';

export const themes: Record<Theme, {
    name: string;
    background: string;
    accentText: string;
    accentTextLight: string;
    accentBorder: string;
    accentBorderOpaque: string;
    accentBorderSecondary: string;
    accentShadow: string;
    accentRing: string;
    neonButtonPrimary: string;
    neonButtonSecondary: string;
    spinnerBorder: string;
    pulseAnimation: string;
    luduCoinGradient: { stopColor1: string, stopColor2: string};
}> = {
    default: {
        name: 'Kyberpunk',
        background: 'bg-gray-900',
        accentText: 'text-cyan-400',
        accentTextLight: 'text-cyan-300',
        accentBorder: 'border-cyan-500/50',
        accentBorderOpaque: 'border-cyan-500',
        accentBorderSecondary: 'border-cyan-600',
        accentShadow: 'shadow-cyan-500/10',
        accentRing: 'focus:ring-cyan-500',
        neonButtonPrimary: "bg-cyan-500 text-gray-900 hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.7)] hover:shadow-[0_0_20px_rgba(6,182,212,0.9)] focus:ring-cyan-500",
        neonButtonSecondary: "bg-gray-700 text-cyan-300 border border-cyan-600 hover:bg-gray-600 hover:text-cyan-200 focus:ring-cyan-600",
        spinnerBorder: 'border-cyan-400',
        pulseAnimation: 'animate-pulse-bright',
        luduCoinGradient: { stopColor1: '#e0f2fe', stopColor2: '#7dd3fc'},
    },
    forest: {
        name: 'Les',
        background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-green-900 to-black',
        accentText: 'text-lime-400',
        accentTextLight: 'text-lime-300',
        accentBorder: 'border-lime-500/50',
        accentBorderOpaque: 'border-lime-500',
        accentBorderSecondary: 'border-lime-600',
        accentShadow: 'shadow-lime-500/10',
        accentRing: 'focus:ring-lime-500',
        neonButtonPrimary: "bg-lime-500 text-gray-900 hover:bg-lime-400 shadow-[0_0_10px_rgba(132,204,22,0.7)] hover:shadow-[0_0_20px_rgba(132,204,22,0.9)] focus:ring-lime-500",
        neonButtonSecondary: "bg-gray-700 text-lime-300 border border-lime-600 hover:bg-gray-600 hover:text-lime-200 focus:ring-lime-600",
        spinnerBorder: 'border-lime-400',
        pulseAnimation: 'animate-pulse-bright-lime',
        luduCoinGradient: { stopColor1: '#f7fee7', stopColor2: '#d9f99d'},
    },
    ocean: {
        name: 'Oceán',
        background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-blue-900 to-black',
        accentText: 'text-sky-400',
        accentTextLight: 'text-sky-300',
        accentBorder: 'border-sky-500/50',
        accentBorderOpaque: 'border-sky-500',
        accentBorderSecondary: 'border-sky-600',
        accentShadow: 'shadow-sky-500/10',
        accentRing: 'focus:ring-sky-500',
        neonButtonPrimary: "bg-sky-500 text-gray-900 hover:bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.7)] hover:shadow-[0_0_20px_rgba(56,189,248,0.9)] focus:ring-sky-500",
        neonButtonSecondary: "bg-gray-700 text-sky-300 border border-sky-600 hover:bg-gray-600 hover:text-sky-200 focus:ring-sky-600",
        spinnerBorder: 'border-sky-400',
        pulseAnimation: 'animate-pulse-bright-sky',
        luduCoinGradient: { stopColor1: '#e0f2fe', stopColor2: '#bae6fd'},
    },
    inferno: {
        name: 'Peklo',
        background: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-red-900 to-black',
        accentText: 'text-amber-400',
        accentTextLight: 'text-amber-300',
        accentBorder: 'border-amber-500/50',
        accentBorderOpaque: 'border-amber-500',
        accentBorderSecondary: 'border-amber-600',
        accentShadow: 'shadow-amber-500/10',
        accentRing: 'focus:ring-amber-500',
        neonButtonPrimary: "bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)] hover:shadow-[0_0_20px_rgba(251,191,36,0.9)] focus:ring-amber-500",
        neonButtonSecondary: "bg-gray-700 text-amber-300 border border-amber-600 hover:bg-gray-600 hover:text-amber-200 focus:ring-amber-600",
        spinnerBorder: 'border-amber-400',
        pulseAnimation: 'animate-pulse-bright-amber',
        luduCoinGradient: { stopColor1: '#fefce8', stopColor2: '#fde047'},
    }
};
