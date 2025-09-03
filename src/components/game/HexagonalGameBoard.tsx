import * as React from 'react';
import { Field, Player, GamePhase, FieldType, GameState, Theme } from '../../types';
import { PLAYER_COLOR_HEX } from '../../constants';
import { themes } from '../../themes';
import { getAttackers } from '../../services/gameLogic';

interface HexagonalGameBoardProps {
    gameState: GameState;
    onFieldClick: (fieldId: number) => void;
    rotation: number;
    onRotate: (direction: 'left' | 'right') => void;
    themeConfig: typeof themes[Theme];
}

export const HexagonalGameBoard: React.FC<HexagonalGameBoardProps> = ({ gameState, onFieldClick, rotation, onRotate, themeConfig }) => {
    const { board, players, gamePhase, currentTurnPlayerIndex, phase1Selections = {} } = gameState;
    const currentTurnPlayer = players[currentTurnPlayerIndex];
    const humanPlayer = players.find(p => !p.isBot)!;

    const hexSize = 50;
    const hexWidth = Math.sqrt(3) * hexSize;
    const hexHeight = 2 * hexSize;

    const getHexPosition = (q: number, r: number) => ({
        x: hexSize * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
        y: hexSize * (3 / 2 * r),
    });
    
    const hexPoints = (size: number) => Array.from({length: 6}, (_, i) => {
        const angle = (Math.PI / 180) * (60 * i - 30);
        return `${size * Math.cos(angle)},${size * Math.sin(angle)}`;
    }).join(' ');
    
    const allFields = board.filter(f => f.type !== FieldType.Empty);
    if(allFields.length === 0) return null;

    const positions = allFields.map(f => getHexPosition(f.q, f.r));
    const minX = Math.min(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxX = Math.max(...positions.map(p => p.x));
    const maxY = Math.max(...positions.map(p => p.y));
    
    const viewWidth = maxX - minX + hexWidth;
    const viewHeight = maxY - minY + hexHeight;
    const boardAspectRatio = viewWidth / viewHeight;

    const viewBoxWidth = viewWidth * 1.2;
    const viewBoxHeight = viewHeight * 1.2;

    const attackers = gamePhase === GamePhase.Phase2_Attacks ? getAttackers(players) : [];
    const isHumanPlayerAttacker = attackers.some(p => p.id === humanPlayer.id);
    const isHumanTurn = currentTurnPlayer.id === humanPlayer.id;

    const getFieldStyle = (field: Field) => {
        const owner = players.find(p => p.id === field.ownerId);
        const ownerColor = owner ? PLAYER_COLOR_HEX[owner.color] : '#4b5563'; // gray-600
        let fill = 'rgba(75, 85, 99, 0.3)';
        let stroke = '#4b5563';
        let strokeWidth = 2;
        let cursor = 'default';
        let filter = '';
        let isDisabled = false;
        
        const playerBase = board.find(f => f.ownerId === humanPlayer.id && f.type === FieldType.PlayerBase);
        const canHeal = playerBase && playerBase.hp < playerBase.maxHp && field.id === playerBase.id;

        if (field.ownerId) {
            fill = `${ownerColor}80`; // 50% opacity
            stroke = ownerColor;
        } else if (field.type === FieldType.Black) {
            fill = '#000000';
            stroke = '#4b5563';
        }

        if (gamePhase === GamePhase.Phase1_PickField) {
            const selectedFieldIds = Object.values(phase1Selections).filter(id => id !== null);
            isDisabled = selectedFieldIds.includes(field.id) || !!field.ownerId || field.type === FieldType.Black;
            if (!isDisabled && field.type === FieldType.Neutral) {
                cursor = 'pointer';
                filter = `drop-shadow(0 0 5px ${PLAYER_COLOR_HEX.cyan})`;
            }
        } else if (gamePhase === GamePhase.Phase2_Attacks && isHumanPlayerAttacker && isHumanTurn) {
            const isOwnField = field.ownerId === humanPlayer.id;
            if (canHeal) {
                cursor = 'pointer';
                stroke = '#22c55e'; // green-500
                strokeWidth = 4;
                filter = 'url(#glow-green)';
                isDisabled = false;
            } else if (!isOwnField && field.type !== FieldType.Neutral) {
                cursor = 'pointer';
                stroke = '#ef4444'; // red-500
                strokeWidth = 4;
                filter = 'url(#glow-red)';
                isDisabled = false;
            } else {
                isDisabled = true;
            }
        } else {
            isDisabled = true;
        }

        return { fill, stroke, strokeWidth, cursor, filter, isDisabled };
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden">
            <div style={{ width: '100%', maxWidth: '100vh', aspectRatio: boardAspectRatio }}>
                <svg viewBox={`${minX - hexWidth * 0.6} ${minY - hexHeight * 0.6} ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-full" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.5s ease-in-out' }}>
                    <defs>
                        <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ef4444" />
                        </filter>
                         <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#22c55e" />
                        </filter>
                    </defs>
                    {allFields.map(field => {
                        const { x, y } = getHexPosition(field.q, field.r);
                        const { fill, stroke, strokeWidth, cursor, filter, isDisabled } = getFieldStyle(field);
                        return (
                            <g key={field.id} transform={`translate(${x}, ${y})`} onClick={() => !isDisabled && onFieldClick(field.id)} style={{ cursor }}>
                                <polygon points={hexPoints(hexSize * 0.95)} fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={{ transition: 'all 0.2s ease-in-out' }} filter={filter} />
                                {field.type === FieldType.PlayerBase && (
                                    <g transform={`rotate(${-rotation})`}>
                                        <text textAnchor="middle" y={-5} fontSize="30" fill="white" style={{pointerEvents: 'none'}}>★</text>
                                        <text textAnchor="middle" y={25} fontSize="20" fill="white" fontWeight="bold" style={{pointerEvents: 'none'}}>❤️ {field.hp}</text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <button 
                    onClick={() => onRotate('left')} 
                    className={`bg-gray-800/80 backdrop-blur-sm border ${themeConfig.accentBorder} rounded-full h-12 w-12 flex items-center justify-center ${themeConfig.accentText} hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                    aria-label="Otočit doleva"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8.5a6.5 6.5 0 100-13H11" />
                    </svg>
                </button>
                <button 
                    onClick={() => onRotate('right')} 
                    className={`bg-gray-800/80 backdrop-blur-sm border ${themeConfig.accentBorder} rounded-full h-12 w-12 flex items-center justify-center ${themeConfig.accentText} hover:bg-cyan-500/20 transition-colors focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                    aria-label="Otočit doprava"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H4.5a6.5 6.5 0 100 13H13" />
                    </svg>
                </button>
            </div>
        </div>
    );
};