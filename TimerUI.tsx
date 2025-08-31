import * as React from 'react';
import { Theme } from '../../types.ts';
import { themes } from '../../App.tsx';

export const TimerUI: React.FC<{ startTime: number, timeLimit: number, onTimeout: () => void, themeConfig: typeof themes[Theme] }> = ({ startTime, timeLimit, onTimeout, themeConfig }) => {
    const [timeLeft, setTimeLeft] = React.useState(timeLimit);
    const intervalRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        const updateTimer = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const remaining = Math.max(0, timeLimit - elapsed);
            setTimeLeft(remaining);
            if (remaining === 0) {
                onTimeout();
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };
        
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(updateTimer, 100);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [startTime, timeLimit, onTimeout]);
    
    const circumference = 2 * Math.PI * 20; // 2 * pi * radius
    const strokeDashoffset = circumference - (timeLeft / timeLimit) * circumference;

    return (
        <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 44 44">
                <circle className="text-gray-600" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="22" cy="22" />
                <circle
                    className={themeConfig.accentText.replace('text-','')}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="22"
                    cy="22"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
            </svg>
            <span className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-lg font-bold">
                {Math.ceil(timeLeft)}
            </span>
        </div>
    );
};