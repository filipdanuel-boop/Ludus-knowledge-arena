import * as React from 'react';
import { Theme } from '../../types';
import { themes } from '../../App';
import { NeonButton } from '../ui/NeonButton';
import { PLAYER_COLOR_HEX } from '../../constants';

export const RulesScreen: React.FC<{ onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ onBack, themeConfig }) => {
    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8 text-center`} style={{ textShadow: `0 0 10px ${PLAYER_COLOR_HEX.cyan}` }}>Pravidla Hry</h1>
                <div className={`space-y-6 bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder}`}>
                    <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Souboje & Rozstřel</h2>
                        <p className="text-gray-400">Při útoku na soupeřovo území odpovídá útočník i obránce. Pokud oba odpoví správně, nastává "Rozstřel" - nová otázka bez možností, kde se odpověď musí napsat. Kdo odpoví správně, vyhrává.</p>
                    </div>
                     <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Systém Životů (HP) a Opravy</h2>
                        <p className="text-gray-400">Normální území má 1 HP. Hráčské základny mají 3 HP. Pokud je vaše základna poškozená (má méně než 3 HP), můžete během svého útoku kliknout na ni a při správné odpovědi si opravit 1 HP.</p>
                    </div>
                    <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Fáze 1: Zabírání území (3 kola)</h2>
                        <p className="text-gray-400">Všichni hráči si současně vybírají neutrální pole. Odpovězte správně, abyste pole zabrali a získali 100 bodů. Po této fázi na mapě nezbudou žádná volná pole.</p>
                    </div>
                     <div>
                        <h2 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-2`}>Vyřazení ze hry</h2>
                        <p className="text-gray-400">Hráč je vyřazen, pokud jeho základna ztratí poslední život (HP), nebo pokud jeho skóre klesne pod nulu.</p>
                    </div>
                </div>
                 <div className="text-center mt-8">
                    <NeonButton onClick={onBack} themeConfig={themeConfig}>Zpět do Lobby</NeonButton>
                 </div>
            </div>
        </div>
    );
};
