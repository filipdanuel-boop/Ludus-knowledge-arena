
import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';
import { Category } from '../types';

// FIX: Per @google/genai guidelines, API key must be from process.env.API_KEY.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.warn("API klíč pro Gemini není nastaven. Prosím nastavte proměnnou prostředí API_KEY. Bude použita mock implementace.");
}

// FIX: Per @google/genai guidelines, initialize with apiKey from env var.
// If apiKey is undefined, the mock logic below will prevent calls to the Gemini API.
const ai = new GoogleGenAI({ apiKey: apiKey! });

const multipleChoiceSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "Vědomostní otázka v češtině."
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Pole přesně 4 možných odpovědí."
    },
    correctAnswer: {
      type: Type.STRING,
      description: "Správná odpověď, která musí být jedním z řetězců v poli možností."
    }
  },
  required: ["question", "options", "correctAnswer"]
};

const openEndedSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "Vědomostní otázka v češtině, na kterou se dá odpovědět jedním nebo dvěma slovy."
    },
    correctAnswer: {
      type: Type.STRING,
      description: "Stručná a přesná správná odpověď."
    }
  },
  required: ["question", "correctAnswer"]
};

const parseJsonResponse = (jsonText: string): any => {
    const cleanedJson = jsonText.replace(/^```json\s*|```$/g, '');
    try {
        return JSON.parse(cleanedJson);
    } catch (e) {
        console.error("Failed to parse JSON response:", cleanedJson);
        return null;
    }
};

export const generateQuestion = async (category: Category, history: string[] = []): Promise<Question | null> => {
  // FIX: Switched to check for API key existence for mock data fallback.
  if (!apiKey) {
    const mockAnswer = (Math.random() * 100).toFixed(0);
    return {
      question: `Toto je mock otázka pro ${category}. Jaký je výsledek? ${mockAnswer}`,
      options: [mockAnswer, "Špatně 1", "Špatně 2", "Špatně 3"].sort(() => Math.random() - 0.5),
      correctAnswer: mockAnswer,
    };
  }

  try {
    const historyPrompt = history.length > 0 ? `Vyhni se otázkám podobným těmto: "${history.slice(-10).join('; ')}"` : "";
    const prompt = `Vygeneruj obtížnou vědomostní otázku v češtině z kategorie ${category}. Otázka musí mít přesně 4 možnosti (multiple-choice) a jedna z nich musí být správná. Obtížnost by měla být střední. ${historyPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: multipleChoiceSchema,
        temperature: 0.9,
      }
    });

    const data = parseJsonResponse(response.text);
    
    if (data && data.question && data.options && data.options.length === 4 && data.correctAnswer && data.options.includes(data.correctAnswer)) {
      return data as Question;
    }
    console.error("Vygenerovaná otázka (MC) selhala validací:", data);
    return null;
  } catch (error) {
    console.error("Chyba při generování otázky z Gemini:", error);
    return null;
  }
};

export const generateOpenEndedQuestion = async (category: Category, previousQuestion: string, history: string[] = []): Promise<Question | null> => {
  // FIX: Switched to check for API key existence for mock data fallback.
  if (!apiKey) {
    return {
      question: `Toto je mock otevřená otázka pro ${category}. Napište 'test'.`,
      correctAnswer: "test",
    };
  }

  try {
    const historyPrompt = history.length > 0 ? `Vyhni se otázkám podobným těmto: "${history.slice(-10).join('; ')}"` : "";
    const prompt = `Předchozí otázka byla: "${previousQuestion}". Vygeneruj navazující, ale těžší otevřenou otázku v češtině ze stejné kategorie (${category}), na kterou se dá odpovědět jedním nebo dvěma slovy. Neposkytuj žádné možnosti. ${historyPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: openEndedSchema,
        temperature: 0.8,
      }
    });

    const data = parseJsonResponse(response.text);

    if (data && data.question && data.correctAnswer) {
      return { question: data.question, correctAnswer: data.correctAnswer, options: [] };
    }
    console.error("Vygenerovaná otázka (Open) selhala validací:", data);
    return null;
  } catch (error) {
    console.error("Chyba při generování otevřené otázky z Gemini:", error);
    return null;
  }
};
