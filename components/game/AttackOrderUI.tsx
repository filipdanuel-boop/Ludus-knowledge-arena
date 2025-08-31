import * as React from 'react';
import { Player, Theme } from '../../types';
import { themes } from '../../App';

export const AttackOrderUI: React.FC<{ attackers: Player[], currentPlayerId: string, themeConfig: typeof themes[Theme] }> = ({ attackers, currentPlayerId, themeConfig }) => {
    if (attackers.length === 0) return null;
    return (
        <div>
            <h2 className={`text-2xl font-bold ${themeConfig.accentTextLight} border-b border-gray-700 pb-2 mb-4 mt-6`}>Pořadí útoků</h2>
            <div className="space-y-2">
                {attackers.map((attacker, index) => (
                    <div key={attacker.id} className={`p-2 rounded-md transition-all duration-300 ${attacker.id === currentPlayerId ? 'bg-cyan-500/20' : 'bg-gray-800'}`}>
                        <p className={`text-lg text-${attacker.color}-400`}>
                            {index + 1}. {attacker.name} {attacker.id === currentPlayerId && <span className="text-xs text-white">(Na tahu)</span>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
