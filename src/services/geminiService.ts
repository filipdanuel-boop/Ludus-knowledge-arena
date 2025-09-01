import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Language, Category, QuestionDifficulty } from '../types';
import { questionBank } from './questionBank';
import { normalizeAnswer } from '../utils';
import { LANGUAGES } from "../constants";

// FIX: Updated comment to refer to API_KEY instead of VITE_API_KEY.
// DŮLEŽITÉ: Pro nasazení na Vercel musíte nastavit proměnnou prostředí s názvem 'API_KEY'.
// Jděte do nastavení vašeho projektu -> Settings -> Environment Variables a přidejte ji.
// FIX: Switched to process.env.API_KEY to align with coding guidelines and resolve TypeScript error.
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    // FIX: Updated warning message to refer to API_KEY.
    console.warn("API_KEY is not set. Gemini features will be disabled.");
}

const getQuestionsFromBank = (category: Category, difficulty: QuestionDifficulty, type: 'multipleChoice' | 'openEnded'): Question[] => {
    const categoryBank = questionBank[category];
    if (!categoryBank) return [];
    
    const typeBank = categoryBank[type];
    if(!typeBank) return [];

    return typeBank[difficulty] || [];
}

const getQuestionFromBank = (category: Category, difficulty: QuestionDifficulty, history: string[]): Question | null => {
    const allQuestions = getQuestionsFromBank(category, difficulty, 'multipleChoice');
    if (allQuestions.length === 0) return null;

    const availableQuestions = allQuestions.filter(q => !history.includes(q.question));
    if (availableQuestions.length > 0) {
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    // Fallback if all have been used
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
};

const getOpenEndedQuestionFromBank = (category: Category, difficulty: QuestionDifficulty, history: string[]): Question | null => {
    const allQuestions = getQuestionsFromBank(category, difficulty, 'openEnded');
    if (allQuestions.length === 0) return null;
    
    const availableQuestions = allQuestions.filter(q => !history.includes(q.question));
     if (availableQuestions.length > 0) {
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
};

const translateQuestionPayload = async (question: Question, targetLang: Language): Promise<Question> => {
    if (!ai || targetLang === 'cs') return question;

    const sourceObject: any = {
        question: question.question,
        correctAnswer: question.correctAnswer
    };
    if (question.options && question.options.length > 0) {
        sourceObject.options = question.options;
    }

    try {
        const langName = LANGUAGES.find(l => l.code === targetLang)?.name || 'English';
        const prompt = `Translate the values in the following JSON object from Czech to ${langName}.
Maintain the original JSON structure. Respond ONLY with the final translated JSON object, without any markdown formatting.

Input:
${JSON.stringify(sourceObject, null, 2)}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        correctAnswer: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const cleanedJson = (response.text ?? '').trim();
        if (!cleanedJson) {
             console.error("Chyba při překladu: odpověď od API je prázdná.");
             return question;
        }
        const translatedObject = JSON.parse(cleanedJson);

        const finalQuestion: Question = {
            ...question,
            question: translatedObject.question || question.question,
            correctAnswer: translatedObject.correctAnswer || question.correctAnswer,
            options: translatedObject.options || question.options
        };

        if (finalQuestion.options && Array.isArray(finalQuestion.options)) {
            const correctOption = finalQuestion.options.find(opt => normalizeAnswer(opt) === normalizeAnswer(finalQuestion.correctAnswer));
            finalQuestion.correctAnswer = correctOption || finalQuestion.correctAnswer;
        }

        return finalQuestion;

    } catch (error) {
        console.error("Chyba při překladu celé otázky:", error);
        return question;
    }
};

export const generateQuestion = async (category: Category, difficulty: QuestionDifficulty, history: string[], targetLang: Language): Promise<Question | null> => {
    const baseQuestion = getQuestionFromBank(category, difficulty, history);
    if (!baseQuestion) return null;
    return translateQuestionPayload(baseQuestion, targetLang);
};

export const generateOpenEndedQuestion = async (category: Category, difficulty: QuestionDifficulty, history: string[], targetLang: Language): Promise<Question | null> => {
    const baseQuestion = getOpenEndedQuestionFromBank(category, difficulty, history);
    if (!baseQuestion) return null;
    return translateQuestionPayload(baseQuestion, targetLang);
};

export const generateLobbyIntro = async (appName: string, appDescription: string, userName: string, targetLang: Language): Promise<string | null> => {
    const langName = LANGUAGES.find(l => l.code === targetLang)?.name || 'Czech';
    const defaultIntro = `Vítej v aréně, ${userName}! Dokaž své znalosti ve hře ${appName} a dobyj území. Hodně štěstí!`;
    if (!ai) return defaultIntro;
    
    try {
        const prompt = `You are an AI host for a game called '${appName}'. The game's description is: '${appDescription}'. Write a short, energetic, and friendly greeting for a player named '${userName}' who is entering the lobby. Briefly mention that it's a battle of knowledge and territory conquest. Be concise (2-3 sentences max) and speak in ${langName}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7 }
        });
        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Chyba při generování úvodu do lobby z Gemini:", error);
        return defaultIntro;
    }
};