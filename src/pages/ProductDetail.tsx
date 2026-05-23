import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

const ProductDetail: React.FC = () => {
    const { t, language } = useLanguage()
    const { id } = useParams<{ id: string }>()
    const [selectedImageIdx, setSelectedImageIdx] = useState(0)
    const [quantity, setQuantity] = useState(1)

    const images = [
        '/assets/re_vase.png',
        '/assets/re_tray.png',
        '/assets/coffee_grounds.png'
    ]

    const relatedProducts = [
        {
            id: 1,
            title: language === 'vi' ? 'Khay đựng bã cà phê tái chế' : 'Recycled Coffee Tray',
            category: 'DECOR',
            price: '420,000 VND',
            image: '/assets/re_tray.png'
        },
        {
            id: 2,
            title: language === 'vi' ? 'Bộ lót ly bền vững' : 'Sustainable Coaster Set',
            category: 'OFFICE',
            price: '250,000 VND',
            image: '/assets/re_cup.png'
        },
        {
            id: 3,
            title: language === 'vi' ? 'Hộp cắm bút nghệ thuật' : 'Artisan Desk Organizer',
            category: 'STATIONERY',
            price: '680,000 VND',
            image: '/assets/re_tray.png'
        },
        {
            id: 4,
            title: language === 'vi' ? 'Đồng hồ treo tường RE:TIME' : 'RE:TIME Wall Clock',
            category: 'DECOR',
            price: '1,200,000 VND',
            image: '/assets/bloom_clock.png'
        }
    ]

    const handleAddToCart = () => {
        alert(language === 'vi' 
            ? `Đã thêm ${quantity} sản phẩm "Bình hoa bã cà phê Heritage" vào giỏ hàng!`
            : `Added ${quantity} "Heritage Coffee-Ground Vase" items to cart!`
        )
    }

    const handleBuyNow = () => {
        alert(language === 'vi'
            ? `Tiến hành thanh toán cho ${quantity} sản phẩm "Bình hoa bã cà phê Heritage"!`
            : `Proceeding to checkout for ${quantity} "Heritage Coffee-Ground Vase" items!`
        )
    }

    return (
        <div className="page-product-detail">

            {/* Breadcrumb Navigation */}
            <nav className="breadcrumb-nav">
                <Link to="/">{t('detail.breadcrumbsHome')}</Link>
                <span className="breadcrumb-separator">›</span>
                <Link to="/products">{t('detail.breadcrumbsProducts')}</Link>
                <span className="breadcrumb-separator">›</span>
                <span>{language === 'vi' ? 'Bình hoa bã cà phê Heritage' : 'Heritage Coffee-Ground Vase'}</span>
            </nav>

            {/* Main Detail Layout */}
            <div className="detail-main-layout">
                {/* Left side: Images gallery */}
                <div className="detail-images-gallery">
                    <div className="detail-thumbnails-list">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                className={`detail-thumbnail-item ${selectedImageIdx === idx ? 'active' : ''}`}
                                onClick={() => setSelectedImageIdx(idx)}
                                aria-label={`View product image ${idx + 1}`}
                            >
                                <img src={img} alt={`Product thumbnail ${idx + 1}`} />
                            </button>
                        ))}
                    </div>
                    <div className="detail-main-image-view">
                        <img src={images[selectedImageIdx]} alt="Heritage Coffee-Ground Vase main view" />
                    </div>
                </div>

                {/* Right side: Product info card */}
                <div className="detail-info-card">
                    <span className="detail-badge-tag">{language === 'vi' ? 'BỘ SƯU TẬP MỚI' : 'NEW COLLECTION'}</span>
                    <h1 className="detail-title">
                        {language === 'vi' ? 'Bình hoa bã cà phê Heritage' : 'Heritage Coffee-Ground Vase'}
                    </h1>
                    
                    <div className="detail-price-line">
                        <span>850,000 VND</span>
                        <span className="detail-price-desc">{t('detail.recycledDesc')}</span>
                    </div>

                    <div className="detail-description-block">
                        <h3 className="detail-section-title">{t('detail.detailTitle')}</h3>
                        <p>
                            {language === 'vi'
                                ? 'Bình gốm thủ công được chế tác từ bã cà phê tái chế từ chuỗi Highlands Coffee. Với công nghệ nén áp suất cao và chất liên kết sinh học, mỗi sản phẩm mang một vân sắc độc bản, kể câu chuyện về vòng đời mới của hạt cà phê Việt.'
                                : 'Handcrafted ceramic vase made from recycled coffee grounds from Highlands Coffee chain. With high-pressure technology and bio-binder, each product carries a unique grain, telling the new life cycle story of Vietnamese coffee beans.'}
                        </p>
                    </div>

                    <div className="detail-specs-grid">
                        <div>
                            <div className="detail-spec-label">{t('detail.specsMaterial')}</div>
                            <div className="detail-spec-val">{t('detail.specsMaterialVal')}</div>
                        </div>
                        <div>
                            <div className="detail-spec-label">{t('detail.specsSize')}</div>
                            <div className="detail-spec-val">{t('detail.specsSizeVal')}</div>
                        </div>
                    </div>

                    <div className="detail-warning-box">
                        <svg viewBox="0 0 24 24">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"></path>
                        </svg>
                        <p>{t('detail.warning')}</p>
                    </div>

                    <div className="detail-actions-block">
                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <span className="detail-spec-label" style={{ marginBottom: 0 }}>{t('detail.quantity')}</span>
                            <div className="quantity-box-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                                />
                                <button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
                            </div>
                        </div>

                        <button className="btn-add-cart-solid" onClick={handleAddToCart}>
                            <svg viewBox="0 0 24 24">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            {t('detail.addToCart')}
                        </button>
                        <button className="btn-buy-now" onClick={handleBuyNow}>{t('detail.buyNow')}</button>
                    </div>
                </div>
            </div>

            {/* Visual story section */}
            <section className="detail-story-section">
                <div className="detail-story-container">
                    <div className="detail-story-header">
                        <h4>{t('detail.storyTag')}</h4>
                        <h2>{t('detail.storyHeading')}</h2>
                    </div>

                    <div className="detail-story-grid">
                        <div className="detail-story-card">
                            <div className="detail-story-img">
                                <img src="/assets/coffee_mountains.png" alt="Coffee farm" />
                            </div>
                            <div className="detail-story-content">
                                <h3>{t('detail.originTitle')}</h3>
                                <p>{t('detail.originDesc')}</p>
                            </div>
                        </div>

                        <div className="detail-story-card-green">
                            <div className="icon-box">
                                <svg viewBox="0 0 24 24">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <polyline points="1 20 1 14 7 14"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                            </div>
                            <h3>{t('detail.processTitle')}</h3>
                            <p>{t('detail.processDesc')}</p>
                        </div>
                    </div>

                    <div className="detail-stats-row">
                        <div className="detail-stat-box">
                            <div className="detail-stat-percent">95%</div>
                            <p>{t('detail.compositionTag')}</p>
                        </div>
                        <div className="detail-stat-box">
                            <div className="detail-stat-percent secondary-color">Handmade</div>
                            <p>{t('detail.handmadeTag')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Related products grid */}
            <section className="related-prod-section">
                <div className="related-prod-container">
                    <div className="related-prod-header">
                        <div>
                            <h3>{t('detail.relatedTitle')}</h3>
                            <h2>{t('detail.relatedSub')}</h2>
                        </div>
                        <div className="related-arrows">
                            <button className="arrow-circle" aria-label="Previous Related Items">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button className="arrow-circle" aria-label="Next Related Items">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="related-grid-four">
                        {relatedProducts.map((p) => (
                            <Link key={p.id} to={`/products/${p.id}`} className="brand-product-card">
                                <div className="card-img-wrapper">
                                    <img src={p.image} alt={p.title} />
                                </div>
                                <div className="card-content">
                                    <span className="card-category">{p.category}</span>
                                    <h3 className="card-title">{p.title}</h3>
                                    <div className="card-footer">
                                        <span className="card-price" style={{ fontSize: '1rem' }}>{p.price}</span>
                                        <button className="btn-add-to-cart" title={t('detail.addToCart')}>
                                            <svg viewBox="0 0 24 24">
                                                <circle cx="9" cy="21" r="1"></circle>
                                                <circle cx="20" cy="21" r="1"></circle>
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}

export default ProductDetail
