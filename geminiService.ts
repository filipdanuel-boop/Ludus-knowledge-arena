import { GoogleGenAI } from "@google/genai";
import type { Question, Language, Category } from '../types';
import { questionBank } from './questionBank';
import { normalizeAnswer } from '../utils';

// FIX: Per Gemini guidelines, the API key must come from process.env.API_KEY and the client should be initialized once.
// This also resolves the TypeScript error related to 'import.meta.env'.
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!ai) {
    console.warn("API klíč pro Gemini (API_KEY) není nastaven. Překlady a generování úvodu budou deaktivovány.");
}

const getQuestionFromBank = (category: Category, history: string[]): Question | null => {
    const categoryQuestions = questionBank[category]?.multipleChoice;
    if (!categoryQuestions || categoryQuestions.length === 0) return null;

    const availableQuestions = categoryQuestions.filter(q => !history.includes(q.question));
    if (availableQuestions.length > 0) {
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    // Fallback to all questions if all have been used
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
};

const getOpenEndedQuestionFromBank = (category: Category, history: string[]): Question | null => {
    const categoryQuestions = questionBank[category]?.openEnded;
    if (!categoryQuestions || categoryQuestions.length === 0) return null;
    
    const availableQuestions = categoryQuestions.filter(q => !history.includes(q.question));
     if (availableQuestions.length > 0) {
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
};

const translateQuestionPayload = async (question: Question, targetLang: Language): Promise<Question> => {
    // FIX: Use the shared 'ai' instance and check for its existence.
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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.1, responseMimeType: "application/json" }
        });
        
        const cleanedJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const translatedObject = JSON.parse(cleanedJson);

        const finalQuestion: Question = {
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

export const generateQuestion = async (category: Category, history: string[], targetLang: Language): Promise<Question | null> => {
    const baseQuestion = getQuestionFromBank(category, history);
    if (!baseQuestion) return null;
    return translateQuestionPayload(baseQuestion, targetLang);
};

export const generateOpenEndedQuestion = async (category: Category, history: string[], targetLang: Language): Promise<Question | null> => {
    const baseQuestion = getOpenEndedQuestionFromBank(category, history);
    if (!baseQuestion) return null;
    return translateQuestionPayload(baseQuestion, targetLang);
};

export const generateLobbyIntro = async (appName: string, appDescription: string, userName: string): Promise<string | null> => {
    const defaultIntro = `Vítej v aréně, ${userName}! Dokaž své znalosti ve hře ${appName} a dobyj území. Hodně štěstí!`;
    // FIX: Use the shared 'ai' instance and check for its existence.
    if (!ai) {
        return defaultIntro;
    }
    
    try {
        const prompt = `Jsi AI hostitel hry s názvem '${appName}'. Popis hry je: '${appDescription}'. Napiš krátký, energický a přátelský pozdrav pro hráče jménem '${userName}', který ho vítá v lobby. Zmiň se stručně o tom, že se jedná o souboj vědomostí a dobývání území. Buď stručný (maximálně 2-3 věty) a mluv česky.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7 }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Chyba při generování úvodu do lobby z Gemini:", error);
        return defaultIntro;
    }
};