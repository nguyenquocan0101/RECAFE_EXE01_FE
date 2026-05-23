import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login, register, isLoading } = useAuth();
    const { showToast } = useToast();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    
    // Auth input states
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
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
                showToast('Đăng nhập thành công!', 'success');
            } else {
                await register(regUsername, regEmail, regPassword, fullName);
                showToast('Đăng ký tài khoản thành công!', 'success');
            }
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
        setShowPassword(false);
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
        /* Backdrop: Transparent overlay with ONLY blur effect, no brown color scale as requested */
        <div className="fixed inset-0 bg-black/[0.04] backdrop-blur-[10px] flex items-center justify-center z-[1000]" onClick={handleBackdropClick}>
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-[460px] border border-[#e8ddd5] relative mx-4 animate-pop-from-button">
                {/* Close Button */}
                <button 
                    className="absolute top-6 right-6 w-8 h-8 bg-gray-100/70 border-none text-gray-400 cursor-pointer flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-200/80 hover:text-gray-700 outline-none" 
                    onClick={() => { resetFields(); onClose(); }} 
                    aria-label="Close modal"
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                {/* Header Title Section */}
                <div className="mb-5">
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-1.5 tracking-tight">
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p className="text-gray-400 text-xs mt-1 font-semibold">
                        {mode === 'login' ? 'Please sign in to continue' : 'Please fill in the details to register'}
                    </p>
                </div>
                
                {/* Tabs Container */}
                <div className="flex bg-[#fcfbf9] border border-[#e8ddd5] rounded-xl p-1 mb-5">
                    <button 
                        type="button"
                        onClick={() => toggleMode('login')}
                        className={`flex-1 py-2.5 font-bold text-center rounded-lg text-[10px] tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 outline-none ${
                            mode === 'login' 
                                ? 'bg-white shadow-sm border border-[#e8ddd5] text-[#657b35]' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 bg-transparent'
                        }`}
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        SIGN IN
                    </button>
                    <button 
                        type="button"
                        onClick={() => toggleMode('register')}
                        className={`flex-1 py-2.5 font-bold text-center rounded-lg text-[10px] tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-1.5 outline-none ${
                            mode === 'register' 
                                ? 'bg-white shadow-sm border border-[#e8ddd5] text-[#657b35]' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 bg-transparent'
                        }`}
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        REGISTER
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="text-red-800 bg-red-50 px-4 py-2.5 rounded-xl text-xs text-center border border-red-200 font-semibold leading-relaxed animate-in fade-in duration-200">
                            {error}
                        </div>
                    )}
                    
                    {mode === 'login' ? (
                        <>
                            {/* Username or Email */}
                            <div className="flex flex-col gap-1">
                                <label htmlFor="username" className="block font-bold mb-1 text-gray-400 text-[10px] tracking-wider uppercase">Username or Email</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="username"
                                        placeholder="nguyenquocan1010@gmail.com"
                                        className="w-full h-11 pl-11 pr-4 bg-[#fcfbf9] text-[#4b2311] border border-[#e8ddd5] rounded-xl text-xs transition-all outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/10"
                                        value={usernameOrEmail}
                                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Password */}
                            <div className="flex flex-col gap-1">
                                <label htmlFor="password" className="block font-bold mb-1 text-gray-400 text-[10px] tracking-wider uppercase">Password</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        placeholder="••••••••••••"
                                        className="w-full h-11 pl-11 pr-11 bg-[#fcfbf9] text-[#4b2311] border border-[#e8ddd5] rounded-xl text-xs transition-all outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center outline-none"
                                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                    >
                                        {showPassword ? (
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me & Forgot Password */}
                            <div className="flex items-center justify-between text-[11px] pt-1 pb-1">
                                <label className="flex items-center gap-1.5 cursor-pointer text-gray-500 hover:text-gray-700 select-none font-semibold">
                                    <input 
                                        type="checkbox" 
                                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#657b35] focus:ring-[#657b35] accent-[#657b35]" 
                                    />
                                    Remember me
                                </label>
                                <a 
                                    href="#forgot" 
                                    className="text-[#657b35] font-bold hover:text-[#55692d] transition-colors"
                                    onClick={(e) => { e.preventDefault(); showToast('Tính năng quên mật khẩu đang được phát triển.', 'info'); }}
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Registration fields */}
                            <div className="flex flex-col gap-1">
                                <label htmlFor="regUsername" className="block font-bold mb-1 text-gray-400 text-[10px] tracking-wider uppercase">Username</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="regUsername"
                                        placeholder="annguyen10"
                                        className="w-full h-11 pl-11 pr-4 bg-[#fcfbf9] text-[#4b2311] border border-[#e8ddd5] rounded-xl text-xs transition-all outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/10"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="regEmail" className="block font-bold mb-1 text-gray-400 text-[10px] tracking-wider uppercase">Email Address</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </span>
                                    <input
                                        type="email"
                                        id="regEmail"
                                        placeholder="example@mail.com"
                                        className="w-full h-11 pl-11 pr-4 bg-[#fcfbf9] text-[#4b2311] border border-[#e8ddd5] rounded-xl text-xs transition-all outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/10"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="fullName" className="block font-bold mb-1 text-gray-400 text-[10px] tracking-wider uppercase">Full Name</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                            <polyline points="10 9 9 9 8 9" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="fullName"
                                        placeholder="Nguyen Quoc An"
                                        className="w-full h-11 pl-11 pr-4 bg-[#fcfbf9] text-[#4b2311] border border-[#e8ddd5] rounded-xl text-xs transition-all outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/10"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label htmlFor="regPassword" className="block font-bold mb-1 text-gray-400 text-[10px] tracking-wider uppercase">Password</label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 flex items-center justify-center">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="regPassword"
                                        placeholder="••••••••••••"
                                        className="w-full h-11 pl-11 pr-11 bg-[#fcfbf9] text-[#4b2311] border border-[#e8ddd5] rounded-xl text-xs transition-all outline-none focus:border-[#657b35] focus:ring-2 focus:ring-[#657b35]/10"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none flex items-center justify-center outline-none"
                                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                    >
                                        {showPassword ? (
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Button */}
                    <button 
                        type="submit" 
                        className="w-full h-11 bg-[#657b35] hover:bg-[#55692d] text-white rounded-xl font-bold text-[11px] uppercase tracking-widest cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm border-none mt-4 outline-none" 
                        disabled={isLoading}
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    >
                        {isLoading ? 'Processing...' : (
                            <>
                                {mode === 'login' ? 'SIGN IN' : 'REGISTER'}
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Switch mode */}
                <div className="text-center text-xs text-gray-500 mt-6 font-medium">
                    {mode === 'login' ? (
                        <>
                            Don't have an account? 
                            <span 
                                onClick={() => toggleMode('register')} 
                                className="text-[#657b35] font-bold hover:text-[#55692d] cursor-pointer ml-1.5 transition-colors"
                            >
                                Register
                            </span>
                        </>
                    ) : (
                        <>
                            Already have an account? 
                            <span 
                                onClick={() => toggleMode('login')} 
                                className="text-[#657b35] font-bold hover:text-[#55692d] cursor-pointer ml-1.5 transition-colors"
                            >
                                Sign In
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LoginModal;
