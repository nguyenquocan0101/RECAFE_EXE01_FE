import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import LoginModal from '@/components/auth/LoginModal'

const Header: React.FC = () => {
    const { language, toggleLanguage, t } = useLanguage()
    const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth()
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-[0.95rem] font-medium transition-colors duration-200 relative py-1 hover:text-primary ${
            isActive 
                ? 'active text-primary after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-full' 
                : 'text-text-muted'
        }`

    return (
        <header className="site-header sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-border-color transition-all duration-300">
            <div className="header-container max-w-[1400px] mx-auto py-5 px-8 flex justify-between items-center gap-8">
                <Link to="/" className="logo font-sans text-xl font-extrabold tracking-widest text-primary flex items-center gap-1">
                    <img src="/logo.svg" alt="RE:CAFÉ Logo" className="block" style={{ height: '64px', width: 'auto' }} />
                </Link>

                <nav className="main-nav flex gap-8 items-center">
                    <NavLink to="/" className={navLinkClass} end>
                        {t('header.home')}
                    </NavLink>
                    <NavLink to="/products" className={navLinkClass}>
                        {t('header.products')}
                    </NavLink>
                    <a 
                        href="#our-story" 
                        className="text-[0.95rem] font-medium text-text-muted relative py-1 hover:text-primary transition-colors duration-200"
                        onClick={(e) => {
                            e.preventDefault()
                            const el = document.getElementById('our-story')
                            if (el) el.scrollIntoView({ behavior: 'smooth' })
                        }}
                    >
                        {t('header.ourStory')}
                    </a>
                    <NavLink to="/environmental-impact" className={navLinkClass}>
                        {t('header.environmentalImpact')}
                    </NavLink>
                </nav>

                <div className="flex items-center gap-6">
                    {/* Search box */}
                    <div className="search-box flex items-center bg-light-bg border border-border-color rounded-full py-2 px-4 w-[240px] transition-all duration-200 focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                        <input 
                            type="text" 
                            placeholder={t('header.search')} 
                            className="border-none bg-transparent outline-none w-full text-sm text-text-dark placeholder:text-text-muted"
                        />
                        <span className="search-icon text-text-muted text-[0.9rem] ml-2 flex items-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                    </div>

                    {/* Language Switcher */}
                    <div className="lang-switcher flex items-center gap-2">
                        <button 
                            className={`lang-btn bg-transparent border-none text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ${language === 'vi' ? 'active text-primary' : 'text-text-muted'}`} 
                            onClick={() => language !== 'vi' && toggleLanguage()}
                            aria-label="Switch to Vietnamese"
                        >
                            VI
                        </button>
                        <span className="lang-divider text-text-muted">|</span>
                        <button 
                            className={`lang-btn bg-transparent border-none text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 ${language === 'en' ? 'active text-primary' : 'text-text-muted'}`} 
                            onClick={() => language !== 'en' && toggleLanguage()}
                            aria-label="Switch to English"
                        >
                            EN
                        </button>
                    </div>

                    {isAuthenticated && user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-text-dark font-bold text-sm bg-secondary/10 px-3 py-1.5 rounded-full border border-secondary/20">
                                {user.fullName || user.username}
                            </span>
                            {(isAdmin || isStaff) && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-1.5 py-2 px-4 rounded-full text-[0.9rem] font-semibold bg-[#4b2311] text-white hover:bg-[#68361c] transition-all duration-200 hover:-translate-y-[1px]"
                                >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <rect x="3" y="3" width="7" height="7" rx="1" />
                                        <rect x="14" y="3" width="7" height="7" rx="1" />
                                        <rect x="3" y="14" width="7" height="7" rx="1" />
                                        <rect x="14" y="14" width="7" height="7" rx="1" />
                                    </svg>
                                    Quản lý
                                </Link>
                            )}
                            <button 
                                className="btn-contact bg-secondary text-white border-none py-2 px-5 rounded-full text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-secondary-hover hover:-translate-y-[1px]" 
                                onClick={logout}
                            >
                                {language === 'vi' ? 'Đăng xuất' : 'Logout'}
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="btn-contact bg-primary text-white border-none py-2 px-6 rounded-full text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:-translate-y-[1px]" 
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            {t('header.login')}
                        </button>
                    )}
                </div>
            </div>
            
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
            />
        </header>
    )
}

export default Header
