import * as React from 'react';
import { User, Theme, Category } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import { getLevelForXp, getTotalXpForLevel, getXpProgressInLevel } from '../../utils';
import { CATEGORIES } from '../../constants';
import { questionBank } from '../../services/questionBank';

export const ProfileScreen: React.FC<{ user: User; onBack: () => void; themeConfig: typeof themes[Theme] }> = ({ user, onBack, themeConfig }) => {
    
    const { level, currentLevelXp, xpForNextLevel } = getXpProgressInLevel(user.xp);
    const progressPercentage = xpForNextLevel > 0 ? (currentLevelXp / xpForNextLevel) * 100 : 100;

    const overallSuccessRate = user.stats.totalAnswered > 0 ? Math.round((user.stats.totalCorrect / user.stats.totalAnswered) * 100) : 0;
    
    const totalQuestionsInCategory = (category: Category): number => {
        const mc = questionBank[category].multipleChoice;
        const oe = questionBank[category].openEnded;
        return (mc.easy.length + mc.medium.length + mc.hard.length + oe.easy.length + oe.medium.length + oe.hard.length);
    }
    
    return (
        <div className="min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className={`text-5xl font-bold ${themeConfig.accentText} mb-8 text-center`}>Profil Hráče</h1>
                
                <div className={`bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder} mb-8`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className={`text-3xl font-semibold ${themeConfig.accentTextLight}`}>{user.email}</h2>
                        <span className={`text-2xl font-bold bg-gray-700 px-4 py-1 rounded-lg border ${themeConfig.accentBorderSecondary}`}>{level}</span>
                    </div>
                    <div>
                        <div className="flex justify-between text-gray-400 mb-1">
                            <span>Level {level}</span>
                            <span>{user.xp.toLocaleString()} / {getTotalXpForLevel(level + 1).toLocaleString()} XP</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4">
                            <div 
                                className={`bg-${themeConfig.accentText.split('-')[1]}-500 h-4 rounded-full transition-all duration-500`} 
                                style={{ width: `${progressPercentage}%`}}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className={`bg-gray-800 p-6 rounded-lg border ${themeConfig.accentBorder}`}>
                     <h3 className={`text-2xl font-semibold ${themeConfig.accentTextLight} mb-4`}>Statistiky</h3>
                     <div className="mb-6">
                         <p className="text-xl text-gray-300">Celková úspěšnost odpovědí: <span className={`font-bold ${themeConfig.accentText}`}>{overallSuccessRate}%</span></p>
                     </div>
                     <h4 className="text-xl font-semibold text-gray-400 mb-3">Postup v kategoriích:</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {CATEGORIES.map(category => {
                            const stats = user.stats.categoryStats[category];
                            const totalQuestions = totalQuestionsInCategory(category);
                            const answeredCount = stats.totalAnswered;
                            const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
                            
                             return (
                                <div key={category}>
                                    <p className="text-gray-300">{category}</p>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                                        <div className={`bg-${themeConfig.accentText.split('-')[1]}-500 h-2.5 rounded-full`} style={{width: `${progress}%`}}></div>
                                    </div>
                                    <p className="text-sm text-gray-500 text-right">{progress}% splněno</p>
                                </div>
                             )
                         })}
                     </div>
                </div>

                 <div className="text-center mt-8">
                    <NeonButton onClick={onBack} themeConfig={themeConfig}>Zpět do Lobby</NeonButton>
                 </div>
            </div>
        </div>
    );
};
