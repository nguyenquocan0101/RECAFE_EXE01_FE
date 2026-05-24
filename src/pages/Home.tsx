import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

const Home: React.FC = () => {
    const { t, language } = useLanguage()
    const { isAuthenticated, openLoginModal } = useAuth()
    const { addToCart } = useCart()
    const { showToast } = useToast()

    const featuredProducts = [
        {
            id: 1,
            title: 'RE:CUP Original',
            category: 'NEW COLLECTION',
            price: '250.000₫',
            description: language === 'vi'
                ? 'Ly cà phê tái chế từ bã cà phê , giữ nhiệt tốt và mang hương thơm tự...'
                : 'Recycled coffee cup from coffee grounds, retains heat and carries a natural aroma...',
            image: '/assets/re_cup.png',
            badge: 'NEW COLLECTION'
        },
        {
            id: 2,
            title: 'RE:TRAY Hexagon',
            category: 'BESTSELLER',
            price: '420.000₫',
            description: language === 'vi'
                ? 'Khay trang trí đa năng với kết cấu bền bỉ và vẻ đẹp thô mộc từ thiên nhiên.'
                : 'Multi-functional decorative tray with durable structure and rustic natural beauty.',
            image: '/assets/re_tray.png',
            badge: 'BESTSELLER'
        },
        {
            id: 3,
            title: 'RE:GLOW Holder',
            category: 'DECOR',
            price: '180.000₫',
            description: language === 'vi'
                ? 'Chân nến thơm thủ công, tạo điểm nhấn ấm cúng cho không gian sống bền vững.'
                : 'Handcrafted scented candle holder, creating a cozy accent for sustainable living.',
            image: '/assets/re_glow.png'
        }
    ]

    return (
        <div className="page-home">

            {/* Hero Section */}
            <section className="hero-section-home">
                <div className="hero-bg-container">
                    <img src="/assets/hero_cup.png" alt="Steaming Cup" className="hero-bg-image" />
                    <div className="hero-overlay"></div>
                </div>
                
                <div className="hero-content-home">
                    <div className="hero-text-wrapper">
                        <span className="hero-tag">{t('home.heroTag')}</span>
                        <h1 className="hero-title">{t('home.heroTitle')}</h1>
                        <p className="hero-desc">{t('home.heroDesc')}</p>
                        <div className="hero-buttons">
                            <Link to="/products" className="btn btn-primary">{t('home.viewProducts')}</Link>
                            <button className="btn btn-secondary" onClick={() => alert('Liên hệ đặt hàng B2B: b2b@recafe.vn')}>{t('home.order')}</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="story-section-home" id="our-story">
                <div className="story-container">
                    <div className="story-left">
                        <span className="story-title-tag">{t('home.storyTag')}</span>
                        <h2 className="story-heading">{t('home.storyHeading')}</h2>
                        <p className="story-paragraph">{t('home.storyDesc')}</p>
                        
                        <div className="story-features">
                            <div className="feature-item">
                                <div className="feature-icon-wrapper">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4>{t('home.cleanMaterial')}</h4>
                                    <p>{t('home.cleanMaterialDesc')}</p>
                                </div>
                            </div>
                            
                            <div className="feature-item">
                                <div className="feature-icon-wrapper">
                                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="6" y1="3" x2="6" y2="15"></line>
                                        <circle cx="18" cy="6" r="3"></circle>
                                        <circle cx="6" cy="18" r="3"></circle>
                                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h4>{t('home.upcyclingTech')}</h4>
                                    <p>{t('home.upcyclingTechDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="story-right">
                        <div className="story-image-large">
                            <img src="/assets/coffee_grounds.png" alt="Coffee Grounds Heap" />
                        </div>
                        <div className="story-image-small">
                            <img src="/assets/re_tray.png" alt="Hands on tile composite" />
                        </div>
                        <div className="story-image-small">
                            <img src="/assets/bloom_clock.png" alt="Vase and clock display" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Collection Section */}
            <section className="featured-collection-home">
                <div className="featured-header-container">
                    <div className="featured-header-left">
                        <h3>{t('home.collectionTag')}</h3>
                        <h2>{t('home.collectionHeading')}</h2>
                    </div>
                    <Link to="/products" className="view-all-btn">
                        {t('home.viewAll')}
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>

                <div className="featured-grid-home">
                    {featuredProducts.map((p) => (
                        <div key={p.id} className="brand-product-card">
                            {p.badge && (
                                <span className={`card-badge ${p.badge.toLowerCase().replace(' ', '-')}`}>
                                    {p.badge}
                                </span>
                            )}
                            <div className="card-img-wrapper">
                                <img src={p.image} alt={p.title} />
                            </div>
                            <div className="card-content">
                                <span className="card-category">{p.badge || 'LIFESTYLE'}</span>
                                <h3 className="card-title">{p.title}</h3>
                                <p className="card-description">{p.description}</p>
                                <div className="card-footer">
                                    <span className="card-price">{p.price}</span>
                                    <button 
                                        className="btn-add-to-cart" 
                                        title={t('detail.addToCart')} 
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!isAuthenticated) {
                                                openLoginModal('addToCart');
                                                return;
                                            }
                                            await addToCart({
                                                id: p.id.toString(),
                                                productId: p.id.toString(),
                                                name: p.title,
                                                slug: p.title.toLowerCase().replace(/\s+/g, '-'),
                                                price: parseInt(p.price.replace(/[^\d]/g, '')),
                                                image: p.image
                                            }, 1);
                                            showToast(language === 'vi' ? `Đã thêm ${p.title} vào giỏ` : `Added ${p.title} to cart`, 'success');
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24">
                                            <circle cx="9" cy="21" r="1"></circle>
                                            <circle cx="20" cy="21" r="1"></circle>
                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section-home">
                <div className="stats-container">
                    <h3>{t('home.statsTag')}</h3>
                    <h2>{t('home.statsHeading')}</h2>
                    <p>{t('home.statsDesc')}</p>
                    
                    <div className="stats-grid-home">
                        <div className="stat-item-home">
                            <div className="stat-number">10,312</div>
                            <div className="stat-label">{t('home.statsRecycled')}</div>
                        </div>
                        <div className="stat-item-home">
                            <div className="stat-number">2,840</div>
                            <div className="stat-label">{t('home.statsTrees')}</div>
                        </div>
                        <div className="stat-item-home">
                            <div className="stat-number">15.2</div>
                            <div className="stat-label">{t('home.statsCarbon')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Strategic Partner Section */}
            <section className="partner-section">
                <div className="partner-container">
                    <div className="partner-left">
                        <h4>{t('home.partnerTag')}</h4>
                        <p>{t('home.partnerDesc')}</p>
                    </div>
                    <div className="partner-right">
                        <div className="partner-logo-placeholder">RC</div>
                        <div className="partner-info">
                            <h5>RE:CAFE</h5>
                            <p>{t('home.partnerSub')}</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default Home
