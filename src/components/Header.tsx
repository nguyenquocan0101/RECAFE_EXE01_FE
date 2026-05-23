import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

const Header: React.FC = () => {
    const { language, toggleLanguage, t } = useLanguage()

    return (
        <header className="site-header">
            <div className="header-container">
                <Link to="/" className="logo">{t('header.logo')}</Link>

                <nav className="main-nav">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
                        {t('header.home')}
                    </NavLink>
                    <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>
                        {t('header.products')}
                    </NavLink>
                    <a href="#our-story" onClick={(e) => {
                        e.preventDefault()
                        const el = document.getElementById('our-story')
                        if (el) el.scrollIntoView({ behavior: 'smooth' })
                    }}>
                        {t('header.ourStory')}
                    </a>
                    <NavLink to="/environmental-impact" className={({ isActive }) => isActive ? 'active' : ''}>
                        {t('header.environmentalImpact')}
                    </NavLink>
                </nav>

                <div className="header-actions">
                    {/* Search box */}
                    <div className="search-box">
                        <input type="text" placeholder={t('header.search')} />
                        <span className="search-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                    </div>

                    {/* Language Switcher */}
                    <div className="lang-switcher">
                        <button 
                            className={`lang-btn ${language === 'vi' ? 'active' : ''}`} 
                            onClick={() => language !== 'vi' && toggleLanguage()}
                            aria-label="Switch to Vietnamese"
                        >
                            VI
                        </button>
                        <span className="lang-divider">|</span>
                        <button 
                            className={`lang-btn ${language === 'en' ? 'active' : ''}`} 
                            onClick={() => language !== 'en' && toggleLanguage()}
                            aria-label="Switch to English"
                        >
                            EN
                        </button>
                    </div>

                    <button className="btn-contact" onClick={() => alert(t('header.login') + ' functionality coming soon!')}>
                        {t('header.login')}
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
