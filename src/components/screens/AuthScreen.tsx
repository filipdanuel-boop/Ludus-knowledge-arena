import * as React from 'react';
import { User, Theme } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import * as userService from '../../services/userService';

export const AuthScreen: React.FC<{ onLogin: (user: User) => void; themeConfig: typeof themes[Theme] }> = ({ onLogin, themeConfig }) => {
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
        setError("Email i heslo jsou povinné.");
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError("Neplatný formát emailu.");
        return;
    }
    
    if (authMode === 'login') {
        const result = userService.loginUser(email, password);
        if (result.success && result.user) {
            onLogin(result.user);
        } else {
            setError(result.message);
        }
    } else { // Register mode
        if (password.length < 6) {
            setError("Heslo musí mít alespoň 6 znaků.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Hesla se neshodují.");
            return;
        }
        
        const result = userService.registerUser(email, password);
        if (result.success && result.user) {
            onLogin(result.user);
        } else {
            setError(result.message);
        }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className={`text-7xl font-bold ${themeConfig.accentText} tracking-widest ${themeConfig.pulseAnimation}`}>LUDUS</h1>
        <p className="text-gray-400 text-xl mt-2">Aréna Vědomostí</p>
      </div>
      <div className={`w-full max-w-md bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} shadow-2xl ${themeConfig.accentShadow}`}>
        <h2 className={`text-3xl font-bold text-center mb-6 ${themeConfig.accentTextLight}`}>{authMode === 'login' ? 'Přihlášení' : 'Registrace'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 ${themeConfig.accentRing}`} 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">Heslo</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
            />
          </div>
          {authMode === 'register' && (
            <div className="mb-6">
              <label className="block text-gray-400 mb-2" htmlFor="confirmPassword">Potvrdit Heslo</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
              />
            </div>
          )}
          {error && <p className="text-red-500 text-center mb-4 animate-shake">{error}</p>}
          <NeonButton type="submit" className="w-full" themeConfig={themeConfig}>{authMode === 'login' ? 'Vstoupit do Arény' : 'Vytvořit Účet'}</NeonButton>
        </form>
        <p className="text-center mt-6 text-gray-500">
          <button onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setError(null);
          }} className={`${themeConfig.accentText} hover:underline`}>
            {authMode === 'login' ? "Potřebujete účet? Zaregistrujte se" : "Už máte účet? Přihlaste se"}
          </button>
        </p>
      </div>
    </div>
  );
};
