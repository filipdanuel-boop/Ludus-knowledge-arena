
import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../themes';
import { Modal } from '../ui/Modal';
import { NeonButton } from '../ui/NeonButton';

interface ThemeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: Theme;
    onSelectTheme: (theme: Theme) => void;
    themes: Record<Theme, any>;
}

export const ThemeSelectionModal: React.FC<ThemeSelectionModalProps> = ({ isOpen, onClose, currentTheme, onSelectTheme, themes }) => (
    <Modal isOpen={isOpen} themeConfig={themes[currentTheme]}>
        <div className="text-center">
            <h2 className={`text-3xl font-bold ${themes[currentTheme].accentTextLight} mb-6`}>Zvolte Vizuální Téma</h2>
            <div className="grid grid-cols-2 gap-4">
                {(Object.keys(themes) as Theme[]).map(themeKey => {
                    const loopThemeConfig = themes[themeKey];
                    return (
                        <button
                            key={themeKey}
                            onClick={() => onSelectTheme(themeKey)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${currentTheme === themeKey ? `${loopThemeConfig.accentBorderOpaque} ${loopThemeConfig.accentShadow.replace('/10','')}` : 'border-gray-600 hover:border-gray-500'}`}
                        >
                            <span className={`text-xl font-bold ${loopThemeConfig.accentText}`}>{loopThemeConfig.name}</span>
                        </button>
                    );
                })}
            </div>
            <div className="mt-8">
                <NeonButton onClick={onClose} variant="secondary" themeConfig={themes[currentTheme]}>Zavřít</NeonButton>
            </div>
        </div>
    </Modal>
);
