import * as React from 'react';
import { Category, Theme } from '../../types.ts';
import { themes } from '../../App.tsx';
import { Modal } from '../ui/Modal.tsx';
import { NeonButton } from '../ui/NeonButton.tsx';

export const CategorySelectionModal: React.FC<{
    isOpen: boolean;
    availableCategories: Category[];
    onSelect: (category: Category) => void;
    onClose: () => void;
    isBaseAttack: boolean;
    themeConfig: typeof themes[Theme];
}> = ({ isOpen, availableCategories, onSelect, onClose, isBaseAttack, themeConfig }) => {
    if (!isOpen) return null;
    
    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
            <div>
                <h2 className={`text-2xl font-bold mb-6 ${themeConfig.accentTextLight}`}>Zvolte kategorii útoku</h2>
                {isBaseAttack ? (
                     <p className="text-gray-300 text-center text-lg">Útočíte na základnu. Kategorie je dána.</p>
                ): (
                    availableCategories.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => onSelect(category)}
                                    className="p-4 bg-gray-700 rounded-md text-lg hover:bg-cyan-600 transition-colors duration-200"
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    ) : (
                         <p className="text-gray-400 text-center">Nemáte k dispozici žádné další kategorie pro útok.</p>
                    )
                )}
                 <div className="text-center mt-6">
                   {isBaseAttack ? 
                        <NeonButton onClick={() => onSelect(availableCategories[0])} themeConfig={themeConfig}>Potvrdit Útok</NeonButton> :
                        <NeonButton variant="secondary" onClick={onClose} themeConfig={themeConfig}>Zrušit útok</NeonButton>
                   }
                 </div>
            </div>
        </Modal>
    );
};