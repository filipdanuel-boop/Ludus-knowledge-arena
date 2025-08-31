import * as React from 'react';
import { User, Language, Theme } from '../../types.ts';
import { themes } from '../../App.tsx';
import { NeonButton } from '../ui/NeonButton.tsx';
import { INITIAL_COINS, EMAIL_VERIFICATION_BONUS } from '../../constants.ts';

export const AuthScreen: React.FC<{ onLogin: (user: User) => void; themeConfig: typeof themes[Theme] }> = ({ onLogin, themeConfig }) => {
  const [authMode, setAuthMode] = React.useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; code?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email je povinný.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Neplatný formát emailu.";
    }

    if (!password) {
      newErrors.password = "Heslo je povinné.";
    } else if (password.length < 6) {
      newErrors.password = "Heslo musí mít alespoň 6 znaků.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (authMode === 'login') {
        const storedHistory = localStorage.getItem('ludus_question_history');
        const questionHistory = storedHistory ? JSON.parse(storedHistory) : [];
        const storedLang = (localStorage.getItem('ludus_language') as Language) || 'cs';
        onLogin({ email, luduCoins: INITIAL_COINS, questionHistory, language: storedLang });
    } else {
        setAuthMode('verify');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length < 6) {
        setErrors({ code: "Kód musí mít 6 znaků." });
        return;
    }
    setErrors({});
    
    const storedHistory = localStorage.getItem('ludus_question_history');
    const questionHistory = storedHistory ? JSON.parse(storedHistory) : [];
    const storedLang = (localStorage.getItem('ludus_language') as Language) || 'cs';
    
    onLogin({ 
        email, 
        luduCoins: INITIAL_COINS + EMAIL_VERIFICATION_BONUS, 
        questionHistory,
        language: storedLang,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className={`text-7xl font-bold ${themeConfig.accentText} tracking-widest ${themeConfig.pulseAnimation}`}>LUDUS</h1>
        <p className="text-gray-400 text-xl mt-2">Aréna Vědomostí</p>
      </div>
      <div className={`w-full max-w-md bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} shadow-2xl ${themeConfig.accentShadow}`}>
        {authMode === 'verify' ? (
             <div>
                <h2 className={`text-3xl font-bold text-center mb-4 ${themeConfig.accentTextLight}`}>Ověření Účtu</h2>
                <p className="text-gray-400 text-center mb-6">Zadejte 6místný kód, který jsme vám zaslali na email. Jako odměnu získáte <span className="font-bold text-yellow-400">{EMAIL_VERIFICATION_BONUS}</span> LuduCoinů!</p>
                <form onSubmit={handleVerify} noValidate>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="code">Ověřovací Kód</label>
                        <input 
                          type="text" 
                          id="code" 
                          maxLength={6}
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value)}
                          className={`w-full p-3 bg-gray-700 rounded border text-center tracking-[0.5em] text-2xl ${errors.code ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 ${themeConfig.accentRing}`} 
                        />
                         {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                    </div>
                    <NeonButton type="submit" className="w-full" themeConfig={themeConfig}>Ověřit a Získat Bonus</NeonButton>
                </form>
             </div>
        ) : (
            <>
                <h2 className={`text-3xl font-bold text-center mb-6 ${themeConfig.accentTextLight}`}>{authMode === 'login' ? 'Přihlášení' : 'Registrace'}</h2>
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className={`w-full p-3 bg-gray-700 rounded border ${errors.email ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 ${themeConfig.accentRing}`} 
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-400 mb-2" htmlFor="password">Heslo</label>
                    <input 
                      type="password" 
                      id="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className={`w-full p-3 bg-gray-700 rounded border ${errors.password ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  <NeonButton type="submit" className="w-full" themeConfig={themeConfig}>{authMode === 'login' ? 'Vstoupit do Arény' : 'Vytvořit Účet'}</NeonButton>
                </form>
                <p className="text-center mt-6 text-gray-500">
                  <button onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setErrors({}); // Clear errors when switching modes
                  }} className={`${themeConfig.accentText} hover:underline`}>
                    {authMode === 'login' ? "Potřebujete účet? Zaregistrujte se" : "Už máte účet? Přihlaste se"}
                  </button>
                </p>
            </>
        )}
      </div>
    </div>
  );
};