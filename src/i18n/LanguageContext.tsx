import * as React from 'react';
import { Language } from '../types';
import { translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, ...args: (string | number)[]) => string;
}

export const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = React.useState<Language>(() => {
    const storedLang = localStorage.getItem('ludus_language');
    // Default to 'cs' if nothing is stored, to avoid a null state before selection.
    return (storedLang as Language) || 'cs'; 
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('ludus_language', lang);
    setLanguageState(lang);
  };

  const t = (key: string, ...args: (string | number)[]): string => {
    let translation = translations[language]?.[key] || key;
    if (args.length > 0) {
        args.forEach((arg, index) => {
            const placeholder = new RegExp(`\\{${index}\\}`, 'g');
            translation = translation.replace(placeholder, String(arg));
        });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};