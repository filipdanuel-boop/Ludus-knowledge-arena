import * as React from 'react';
import { Category, Theme } from '../../types';
import { themes } from '../../themes';
import { Modal } from '../ui/Modal';
import { NeonButton } from '../ui/NeonButton';
import { useTranslation } from '../../i18n/LanguageContext';

export const CategorySelectionModal: React.FC<{
    isOpen: boolean;
    availableCategories: Category[];
    onSelect: (category: Category) => void;
    onClose: () => void;
    isBaseAttack: boolean;
    themeConfig: typeof themes[Theme];
}> = ({ isOpen, availableCategories, onSelect, onClose, isBaseAttack, themeConfig }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;
    
    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
            <div>
                <h2 className={`text-2xl font-bold mb-6 ${themeConfig.accentTextLight}`}>{t('selectAttackCategory')}</h2>
                {isBaseAttack ? (
                     <p className="text-gray-300 text-center text-lg">{t('baseAttackMessage')}</p>
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
                         <p className="text-gray-400 text-center">{t('noCategoriesAvailable')}</p>
                    )
                )}
                 <div className="text-center mt-6">
                   {isBaseAttack ? 
                        <NeonButton onClick={() => onSelect(availableCategories[0])} themeConfig={themeConfig}>{t('confirmAttack')}</NeonButton> :
                        <NeonButton variant="secondary" onClick={onClose} themeConfig={themeConfig}>{t('cancelAttack')}</NeonButton>
                   }
                 </div>
            </div>
        </Modal>
    );
};