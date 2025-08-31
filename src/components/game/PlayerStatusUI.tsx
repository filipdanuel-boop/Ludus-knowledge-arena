
import * as React from 'react';
import { Player, Field, FieldType, Theme } from '../../types';
import { themes } from '../../themes';
import { LuduCoin } from '../ui/LuduCoin';

export const PlayerStatusUI: React.FC<{ players: Player[], currentPlayerId: string, board: Field[], themeConfig: typeof themes[Theme] }> = ({ players, currentPlayerId, board, themeConfig }) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            {players.map(p => {
                const base = board.find(f => f.type === FieldType.PlayerBase && f.ownerId === p.id);
                return (
                    <div key={p.id} className={`p-3 rounded-lg border-2 transition-all duration-300 ${p.isEliminated ? 'border-gray-800 bg-black/30 opacity-60' : (currentPlayerId === p.id ? `border-${p.color}-400 shadow-[0_0_15px_rgba(var(--tw-color-${p.color}-500-rgb),0.6)]` : `border-gray-700`)}`}>
                        <h3 className={`font-bold text-lg truncate ${p.isEliminated ? `text-gray-600 line-through` : `text-${p.color}-400`}`}>{p.name}</h3>
                        {p.isEliminated ? (
                             <p className="text-red-500 font-bold text-xl">VYŘAZEN</p>
                        ) : (
                            <>
                             <p className="text-white text-xl">{p.score.toLocaleString()} bodů</p>
                             <div className="flex items-center gap-1 mt-1">
                                <LuduCoin className="w-5 h-5" themeConfig={themeConfig} />
                                <p className="text-yellow-400 text-sm font-semibold">{p.coins.toLocaleString()}</p>
                             </div>
                             {base && <p className={`text-rose-400 font-bold text-md`}>❤️ {base.hp}/{base.maxHp}</p>}
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};