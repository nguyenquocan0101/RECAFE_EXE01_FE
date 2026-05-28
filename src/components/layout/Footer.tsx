import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

const Footer: React.FC = () => {
    const { t } = useLanguage()

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <img src="/logo.svg" alt="RE:CAFÉ" className="footer-logo" />
                    <p>{t('footer.desc')}</p>
                    <div className="social-icons-footer">
                        <a
                            href="https://www.facebook.com/profile.php?id=61590377251470"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-btn-footer"
                            aria-label="Facebook"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div className="footer-section">
                    <h4>{t('footer.explore')}</h4>
                    <ul>
                        <li><a href="#new-products" onClick={(e) => { e.preventDefault(); alert(t('footer.newProducts')); }}>{t('footer.newProducts')}</a></li>
                        <li><a href="#our-story" onClick={(e) => { e.preventDefault(); const el = document.getElementById('our-story'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>{t('footer.brandStory')}</a></li>
                        <li><a href="#sustainability" onClick={(e) => { e.preventDefault(); alert(t('footer.report')); }}>{t('footer.report')}</a></li>
                        <li><a href="#partners" onClick={(e) => { e.preventDefault(); alert(t('footer.highlandsPartner')); }}>{t('footer.highlandsPartner')}</a></li>
                    </ul>
                </div>
                
                <div className="footer-section">
                    <h4>{t('footer.support')}</h4>
                    <ul>
                        <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert(t('footer.privacy')); }}>{t('footer.privacy')}</a></li>
                        <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert(t('footer.terms')); }}>{t('footer.terms')}</a></li>
                        <li><a href="#return-policy" onClick={(e) => { e.preventDefault(); alert(t('footer.refund')); }}>{t('footer.refund')}</a></li>
                        <li><a href="#faq" onClick={(e) => { e.preventDefault(); alert(t('footer.faq')); }}>{t('footer.faq')}</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="footer-bottom" style={{ justifyContent: 'center' }}>
                <p>© 2024 RE:CAFÉ. From Waste to Worth.</p>
            </div>
        </footer>
    )
}

export default Footer
