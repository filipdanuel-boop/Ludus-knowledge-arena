
import * as React from 'react';
import { GameState, Theme } from '../../types';
import { themes } from '../../themes';
import { Modal } from '../ui/Modal';

export const SpectatorQuestionModal: React.FC<{ activeQuestion: GameState['activeQuestion'] | null; themeConfig: typeof themes[Theme] }> = ({ activeQuestion, themeConfig }) => {
    if (!activeQuestion) return null;
    const { question, questionType } = activeQuestion;
    return (
        <Modal isOpen={true} themeConfig={themeConfig}>
             <div>
                <p className={`${themeConfig.accentText} text-sm mb-2`}>Soupeř odpovídá...</p>
                <h2 className="text-2xl font-bold mb-6">{question.question}</h2>
                {questionType === 'MULTIPLE_CHOICE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                        {question.options?.map(option => (
                            <div key={option} className="p-4 bg-gray-700 rounded-md text-left text-lg">
                                {option}
                            </div>
                        ))}
                    </div>
                )}
                 {questionType === 'OPEN_ENDED' && (
                    <div className="p-4 bg-gray-700 rounded-md text-left text-lg opacity-70">
                        Odpověď se píše...
                    </div>
                )}
            </div>
        </Modal>
    );
};