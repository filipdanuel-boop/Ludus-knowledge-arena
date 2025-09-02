// FIX: Import 'Type' for using responseSchema.
import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Language, Category, QuestionDifficulty } from '../types';
import { questionBank } from './questionBank';
import { normalizeAnswer } from '../utils';

// FIX: Switched to process.env.API_KEY to align with coding guidelines and resolve TypeScript error.
// DŮLEŽITÉ: Pro nasazení na Vercel musíte nastavit proměnou prostředí s názvem 'API_KEY'.
// Jděte do nastavení vašeho projektu -> Settings -> Environment Variables a přidejte ji.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.warn("API_KEY is not set. Gemini features will be disabled.");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const getQuestionFromBank = (category: Category, history: string[], difficulty: QuestionDifficulty): Question | null => {
    const categoryQuestions = questionBank[category]?.multipleChoice[difficulty];
    if (!categoryQuestions || categoryQuestions.length === 0) return null;

    const availableQuestions = categoryQuestions.filter(q => !history.includes(q.question));
    if (availableQuestions.length > 0) {
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    // Fallback to all questions if all have been used
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
};

const getOpenEndedQuestionFromBank = (category: Category, history: string[], difficulty: QuestionDifficulty): Question | null => {
    const categoryQuestions = questionBank[category]?.openEnded[difficulty];
    if (!categoryQuestions || categoryQuestions.length === 0) return null;
    
    const availableQuestions = categoryQuestions.filter(q => !history.includes(q.question));
     if (availableQuestions.length > 0) {
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
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
        const prompt = `First, translate the values in the following JSON object from Czech to English. Then, translate the English values to the language with code '${targetLang}'.
Maintain the original JSON structure. Respond ONLY with the final translated JSON object, without any markdown formatting.

Input:
${JSON.stringify(sourceObject, null, 2)}`;

        // FIX: Use responseSchema for structured JSON output as recommended by guidelines.
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
        
        // FIX: The response text is now clean JSON due to responseSchema, so markdown cleaning is removed.
        const cleanedJson = (response.text ?? '').trim();
        if (!cleanedJson) return question; // Guard against empty responses

        const translatedObject = JSON.parse(cleanedJson);

        const finalQuestion: Question = {
            ...question, // Keep original properties like difficulty
            question: translatedObject.question || question.question,
            correctAnswer: translatedObject.correctAnswer || question.correctAnswer,
            options: translatedObject.options || question.options
        };

        // Ensure correctAnswer matches one of the translated options exactly
        if (finalQuestion.options && Array.isArray(finalQuestion.options)) {
            const correctOption = finalQuestion.options.find(opt => normalizeAnswer(opt) === normalizeAnswer(finalQuestion.correctAnswer));
            finalQuestion.correctAnswer = correctOption || finalQuestion.correctAnswer;
        }

        return finalQuestion;

    } catch (error) {
        console.error("Chyba při překladu celé otázky:", error);
        return question; // Fallback to original question
    }
};

export const generateQuestion = async (category: Category, history: string[], targetLang: Language, difficulty: QuestionDifficulty): Promise<Question | null> => {
    const baseQuestion = getQuestionFromBank(category, history, difficulty);
    if (!baseQuestion) return null;
    return translateQuestionPayload(baseQuestion, targetLang);
};

export const generateOpenEndedQuestion = async (category: Category, history: string[], targetLang: Language, difficulty: QuestionDifficulty): Promise<Question | null> => {
    const baseQuestion = getOpenEndedQuestionFromBank(category, history, difficulty);
    if (!baseQuestion) return null;
    return translateQuestionPayload(baseQuestion, targetLang);
};

export const generateLobbyIntro = async (appName: string, appDescription: string, userName: string, targetLang: Language): Promise<string | null> => {
    const languageMap: Record<Language, string> = {
        cs: 'Czech',
        en: 'English',
        de: 'German',
        es: 'Spanish',
    };
    const languageName = languageMap[targetLang];
    
    // Let the caller handle the fallback translation if Gemini fails.
    if (!ai) return null;
    
    try {
        const prompt = `You are an AI game host for a game named '${appName}'. The game's description is: '${appDescription}'. Write a short, energetic, and friendly greeting for a player named '${userName}', welcoming them to the lobby. Briefly mention it's a battle of knowledge and territory conquest. Be concise (max 2-3 sentences) and speak in ${languageName}.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7 }
        });
        // Return null if response is empty so UI can use its translated fallback.
        return (response.text ?? '').trim() || null;
    } catch (error) {
        console.error("Chyba při generování úvodu do lobby z Gemini:", error);
        // Return null on error so UI can use its translated fallback.
        return null;
    }
};
