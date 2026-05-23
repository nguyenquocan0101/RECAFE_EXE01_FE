import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login, register, isLoading } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Registration fields
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (mode === 'login') {
                await login(usernameOrEmail, password);
            } else {
                await register(regUsername, regEmail, regPassword, fullName);
            }
            // Reset fields & close modal on successful auth
            resetFields();
            onClose();
        } catch (err: any) {
            setError(err.message || `${mode === 'login' ? 'Login' : 'Registration'} failed.`);
        }
    };

    const resetFields = () => {
        setUsernameOrEmail('');
        setPassword('');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setFullName('');
        setError(null);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            resetFields();
            onClose();
        }
    };

    const toggleMode = (newMode: 'login' | 'register') => {
        setMode(newMode);
        setError(null);
    };

    return createPortal(
        <div className="fixed inset-0 bg-[#4b2311]/40 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={handleBackdropClick}>
            <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-[400px] border border-secondary/10 relative animate-slide-up">
                {/* Close Button */}
                <button 
                    className="absolute top-4 right-4 bg-transparent border-none text-text-muted cursor-pointer p-2 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-secondary/10 hover:text-text-dark" 
                    onClick={() => { resetFields(); onClose(); }} 
                    aria-label="Close modal"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                {/* Tabs */}
                <div className="flex border-b border-secondary/10 mb-6">
                    <button 
                        type="button"
                        onClick={() => toggleMode('login')}
                        className={`flex-1 pb-2.5 font-bold text-center border-b-2 transition-all duration-200 text-xs tracking-[0.1em] ${mode === 'login' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-dark'}`}
                    >
                        SIGN IN
                    </button>
                    <button 
                        type="button"
                        onClick={() => toggleMode('register')}
                        className={`flex-1 pb-2.5 font-bold text-center border-b-2 transition-all duration-200 text-xs tracking-[0.1em] ${mode === 'register' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-dark'}`}
                    >
                        REGISTER
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="text-[#a43a42] bg-[#a43a42]/10 px-3 py-2 rounded text-xs mb-4 text-center border border-[#a43a42]/20 font-medium">{error}</div>}
                    
                    {mode === 'login' ? (
                        <>
                            <div className="mb-4">
                                <label htmlFor="username" className="block font-bold mb-1.5 text-text-muted text-[11px] tracking-[0.1em] uppercase">Username or Email</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="w-full h-10 bg-light-bg text-text-dark rounded-[4px] px-3 text-sm transition-all duration-200 border border-secondary/20 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    value={usernameOrEmail}
                                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div className="mb-6">
                                <label htmlFor="password" className="block font-bold mb-1.5 text-text-muted text-[11px] tracking-[0.1em] uppercase">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="w-full h-10 bg-light-bg text-text-dark rounded-[4px] px-3 text-sm transition-all duration-200 border border-secondary/20 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-3">
                                <label htmlFor="regUsername" className="block font-bold mb-1 text-text-muted text-[11px] tracking-[0.1em] uppercase">Username</label>
                                <input
                                    type="text"
                                    id="regUsername"
                                    className="w-full h-10 bg-light-bg text-text-dark rounded-[4px] px-3 text-sm transition-all duration-200 border border-secondary/20 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    value={regUsername}
                                    onChange={(e) => setRegUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="regEmail" className="block font-bold mb-1 text-text-muted text-[11px] tracking-[0.1em] uppercase">Email</label>
                                <input
                                    type="email"
                                    id="regEmail"
                                    className="w-full h-10 bg-light-bg text-text-dark rounded-[4px] px-3 text-sm transition-all duration-200 border border-secondary/20 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="fullName" className="block font-bold mb-1 text-text-muted text-[11px] tracking-[0.1em] uppercase">Full Name (Optional)</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    className="w-full h-10 bg-light-bg text-text-dark rounded-[4px] px-3 text-sm transition-all duration-200 border border-secondary/20 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="mb-5">
                                <label htmlFor="regPassword" className="block font-bold mb-1 text-text-muted text-[11px] tracking-[0.1em] uppercase">Password</label>
                                <input
                                    type="password"
                                    id="regPassword"
                                    className="w-full h-10 bg-light-bg text-text-dark rounded-[4px] px-3 text-sm transition-all duration-200 border border-secondary/20 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button 
                        type="submit" 
                        className="w-full h-10 bg-primary text-text-dark rounded-full font-bold text-xs uppercase tracking-[0.05em] cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:scale-[1.04] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Register'}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default LoginModal;
