import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).slice(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container at bottom right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => {
                    let borderClass = 'border-[#e8ddd5]';
                    let bgClass = 'bg-white';
                    let textClass = 'text-[#4b2311]';
                    let iconColor = 'text-[#925f3c]';
                    let iconPath = null;

                    if (toast.type === 'success') {
                        borderClass = 'border-[#657b35]/30';
                        bgClass = 'bg-[#f4f6f0]';
                        textClass = 'text-[#4b2311]';
                        iconColor = 'text-[#657b35]';
                        iconPath = (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        );
                    } else if (toast.type === 'error') {
                        borderClass = 'border-red-200';
                        bgClass = 'bg-red-50';
                        textClass = 'text-red-950';
                        iconColor = 'text-red-600';
                        iconPath = (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        );
                    } else {
                        // Info
                        iconPath = (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        );
                    }

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded border shadow-md max-w-sm animate-toast-in ${bgClass} ${borderClass} ${textClass}`}
                        >
                            <span className={`${iconColor} shrink-0`}>{iconPath}</span>
                            <span className="text-sm font-semibold">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                            >
                                ✕
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
