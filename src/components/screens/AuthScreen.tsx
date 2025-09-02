import * as React from 'react';
import { User, Theme } from '../../types';
import { themes } from '../../themes';
import { NeonButton } from '../ui/NeonButton';
import * as userService from '../../services/userService';
import { useTranslation } from '../../i18n/LanguageContext';

export const AuthScreen: React.FC<{ onLogin: (user: User) => void; themeConfig: typeof themes[Theme] }> = ({ onLogin, themeConfig }) => {
  const { t, language } = useTranslation();
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
        setError(t('errorEmailPasswordRequired'));
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError(t('errorInvalidEmail'));
        return;
    }
    
    if (authMode === 'login') {
        const result = userService.loginUser(email, password);
        if (result.success && result.user) {
            onLogin(result.user);
        } else {
            setError(t(result.message));
        }
    } else { // Register mode
        if (!nickname) {
            setError(t('errorNicknameRequired'));
            return;
        }
        if (nickname.length < 3) {
            setError(t('errorNicknameTooShort'));
            return;
        }
        if (password.length < 6) {
            setError(t('errorPasswordLength'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('errorPasswordsMismatch'));
            return;
        }
        
        const result = userService.registerUser(email, password, nickname, language);
        if (result.success && result.user) {
            onLogin(result.user);
        } else {
            setError(t(result.message));
        }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className={`text-7xl font-bold ${themeConfig.accentText} tracking-widest ${themeConfig.pulseAnimation}`}>LUDUS</h1>
        <p className="text-gray-400 text-xl mt-2">{t('arenaOfKnowledge')}</p>
      </div>
      <div className={`w-full max-w-md bg-gray-800 p-8 rounded-lg border ${themeConfig.accentBorder} shadow-2xl ${themeConfig.accentShadow}`}>
        <h2 className={`text-3xl font-bold text-center mb-6 ${themeConfig.accentTextLight}`}>{authMode === 'login' ? t('loginTitle') : t('registerTitle')}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="email">{t('emailLabel')}</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 ${themeConfig.accentRing}`} 
            />
          </div>
           {authMode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-400 mb-2" htmlFor="nickname">{t('nicknameLabel')}</label>
              <input 
                type="text" 
                id="nickname" 
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className={`w-full p-3 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 ${themeConfig.accentRing}`}
              />
            </div>
          )}
          <div className="mb-6">
            <label className="block text-gray-400 mb-2" htmlFor="password">{t('passwordLabel')}</label>
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
              <label className="block text-gray-400 mb-2" htmlFor="confirmPassword">{t('confirmPasswordLabel')}</label>
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
          <NeonButton type="submit" className="w-full" themeConfig={themeConfig}>{authMode === 'login' ? t('enterArenaButton') : t('createAccountButton')}</NeonButton>
        </form>
        <p className="text-center mt-6 text-gray-500">
          <button onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setError(null);
          }} className={`${themeConfig.accentText} hover:underline`}>
            {authMode === 'login' ? t('needAccountPrompt') : t('haveAccountPrompt')}
          </button>
        </p>
      </div>
    </div>
  );
};