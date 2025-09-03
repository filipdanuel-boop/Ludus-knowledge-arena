
import * as React from 'react';

export const GameEventNotification: React.FC<{ type: 'info' | 'success' | 'warning' | 'danger', message: string }> = ({ type, message }) => {
    const [visible, setVisible] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 2500); // Notification is visible for 2.5 seconds
        return () => clearTimeout(timer);
    }, []);

    const baseClasses = "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-2xl text-white text-4xl font-bold z-50 transition-all duration-500";
    const animationClasses = visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90';

    const typeClasses = {
        info: 'bg-cyan-600/90 border-2 border-cyan-400',
        success: 'bg-green-600/90 border-2 border-green-400',
        warning: 'bg-amber-600/90 border-2 border-amber-400',
        danger: 'bg-rose-700/90 border-2 border-rose-500',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${animationClasses}`}>
            {message}
        </div>
    );
};
