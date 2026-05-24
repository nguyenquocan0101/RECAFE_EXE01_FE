import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useCart } from '@/context/CartContext'

const Header: React.FC = () => {
    const { language, toggleLanguage, t } = useLanguage()
    const { user, isAuthenticated, isAdmin, isStaff, logout, openLoginModal } = useAuth()
    const { showToast } = useToast()
    const { cartCount } = useCart()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-[0.95rem] font-medium transition-colors duration-200 relative py-1 hover:text-primary ${
            isActive 
                ? 'active text-primary after:content-[""] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-full' 
                : 'text-text-muted'
        }`

    return (
        <>
        <header className="site-header sticky top-0 z-[100] bg-white/95 backdrop-blur-md transition-all duration-300">
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

                    {/* Premium Cart Button */}
                    <button 
                        id="cart-icon-btn"
                        onClick={() => navigate('/checkout')}
                        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors shadow-md shadow-primary/10 cursor-pointer border-none outline-none"
                        style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                        aria-label="Shopping Cart"
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c83a42] text-[9px] font-extrabold text-white border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {isAuthenticated && user ? (
                        <div className="relative header-user-dropdown">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1.5 text-text-dark font-bold text-sm bg-transparent hover:text-primary transition-all outline-none border-none"
                                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                            >
                                <span>{user.fullName || user.username}</span>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div 
                                        className="fixed inset-0 z-40 cursor-default" 
                                        onClick={() => setDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e8ddd5] rounded shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {(isAdmin || isStaff) && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#4b2311] hover:bg-[#f0ebe4] transition-colors"
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
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                logout();
                                                showToast('Đăng xuất thành công!', 'success');
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-[#f5f0eb] transition-colors text-left"
                                            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                        >
                                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            {language === 'vi' ? 'Đăng xuất' : 'Logout'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <button 
                            className="btn-contact bg-primary text-white border-none py-2 px-6 rounded-full text-[0.9rem] font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-hover hover:-translate-y-[1px]" 
                            onClick={() => openLoginModal()}
                        >
                            {t('header.login')}
                        </button>
                    )}

                    {/* Hamburger Button - mobile only */}
                    <button
                        id="mobile-menu-btn"
                        className="mobile-hamburger"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                        style={{ border: 'none', outline: 'none', background: 'transparent', cursor: 'pointer', display: 'none' }}
                    >
                        <span style={{ display: 'block', width: '22px', height: '2px', background: mobileMenuOpen ? 'transparent' : 'var(--text-dark)', borderRadius: '2px', transition: 'all 0.25s', transform: mobileMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
                        <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--text-dark)', borderRadius: '2px', margin: '5px 0', transition: 'all 0.25s', opacity: mobileMenuOpen ? 0 : 1 }} />
                        <span style={{ display: 'block', width: '22px', height: '2px', background: 'var(--text-dark)', borderRadius: '2px', transition: 'all 0.25s', transform: mobileMenuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
                    </button>
                </div>
            </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
            <>
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(75,35,17,0.18)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '80%',
                    maxWidth: '320px',
                    height: '100dvh',
                    background: '#fff',
                    zIndex: 200,
                    boxShadow: '-4px 0 32px rgba(75,35,17,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    overflowY: 'auto',
                    animation: 'slideInFromRight 0.28s cubic-bezier(0.16,1,0.3,1) forwards'
                }}>
                    {/* Close button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: '1.5rem' }}
                        aria-label="Close menu"
                    >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    {/* Mobile Nav Links */}
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
                        <NavLink
                            to="/"
                            className={navLinkClass}
                            end
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderBottom: '1px solid #f0ebe4' }}
                        >
                            {t('header.home')}
                        </NavLink>
                        <NavLink
                            to="/products"
                            className={navLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderBottom: '1px solid #f0ebe4' }}
                        >
                            {t('header.products')}
                        </NavLink>
                        <a
                            href="#our-story"
                            style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderBottom: '1px solid #f0ebe4', color: 'var(--text-muted)', fontWeight: 500 }}
                            onClick={(e) => {
                                e.preventDefault()
                                setMobileMenuOpen(false)
                                setTimeout(() => {
                                    const el = document.getElementById('our-story')
                                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                                }, 150)
                            }}
                        >
                            {t('header.ourStory')}
                        </a>
                        <NavLink
                            to="/environmental-impact"
                            className={navLinkClass}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ fontSize: '1.1rem', padding: '0.75rem 0', borderBottom: '1px solid #f0ebe4' }}
                        >
                            {t('header.environmentalImpact')}
                        </NavLink>
                    </nav>

                    {/* Language switcher in mobile menu */}
                    <div className="lang-switcher" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                        <button
                            className={`lang-btn ${language === 'vi' ? 'active' : ''}`}
                            onClick={() => language !== 'vi' && toggleLanguage()}
                        >VI</button>
                        <span className="lang-divider">|</span>
                        <button
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                            onClick={() => language !== 'en' && toggleLanguage()}
                        >EN</button>
                    </div>

                    {/* Auth section in mobile menu */}
                    {isAuthenticated && user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{user.fullName || user.username}</span>
                            {(isAdmin || isStaff) && (
                                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Quản lý</Link>
                            )}
                            <button
                                onClick={() => { setMobileMenuOpen(false); logout(); showToast('Đăng xuất thành công!', 'success'); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c83a42', fontWeight: 600, fontSize: '0.9rem', textAlign: 'left', padding: 0 }}
                            >
                                {language === 'vi' ? 'Đăng xuất' : 'Logout'}
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn-contact"
                            onClick={() => { setMobileMenuOpen(false); openLoginModal(); }}
                            style={{ alignSelf: 'flex-start' }}
                        >
                            {t('header.login')}
                        </button>
                    )}
                </div>
            </>
        )}
        </>
    )
}


export default Header
