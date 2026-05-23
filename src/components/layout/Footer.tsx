import React from 'react'
import { useLanguage } from '@/context/LanguageContext'

const Footer: React.FC = () => {
    const { t } = useLanguage()

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>RE:CAFÉ</h3>
                    <p>{t('footer.desc')}</p>
                    <div className="social-icons-footer">
                        <button className="social-btn-footer" aria-label="Globe" onClick={() => alert('Website: www.recafe.vn')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </button>
                        <button className="social-btn-footer" aria-label="Email" onClick={() => alert('Email: info@recafe.vn')}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </button>
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
            
            <div className="footer-bottom">
                <p>© 2024 RE:CAFÉ. From Waste to Worth.</p>
                <div className="footer-payment-icons">
                    <span className="payment-icon-wrapper">VISA</span>
                    <span className="payment-icon-wrapper">MASTER</span>
                    <span className="payment-icon-wrapper">COD</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer
