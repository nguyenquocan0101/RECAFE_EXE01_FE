import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'

interface Product {
    id: number
    title: string
    price: number
    description: string
    image: string
    badge?: string
    tags: string[]
    inStock: boolean
    category: string
    collection: string
}

const ProductListing: React.FC = () => {
    const { t, language } = useLanguage()
    const [priceRange, setPriceRange] = useState(150)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedCollection, setSelectedCollection] = useState<string>('')

    const products: Product[] = [
        {
            id: 1,
            title: language === 'vi' ? 'Bộ khay kệ Espresso' : 'Espresso Desk Set',
            price: 85,
            description: language === 'vi' 
                ? 'Bộ khay đựng đồ văn phòng làm bằng bã cà phê, thiết kế tối giản...'
                : 'Handcrafted desk organizer set featuring a minimalist...',
            image: '/assets/re_tray.png',
            badge: language === 'vi' ? 'MỚI VỀ' : 'NEW ARRIVAL',
            tags: ['Decor', 'Handmade'],
            inStock: true,
            category: 'Decor',
            collection: 'New Arrivals'
        },
        {
            id: 2,
            title: language === 'vi' ? 'Đồng hồ treo tường Bloom' : 'Bloom Wall Clock',
            price: 120,
            description: language === 'vi'
                ? 'Đồng hồ treo tường kim trôi tĩnh âm, thiết kế từ chất liệu bã cà phê...'
                : 'A silent, statement wall clock designed with high-...',
            image: '/assets/bloom_clock.png',
            badge: language === 'vi' ? 'BÁN CHẠY' : 'BEST SELLER',
            tags: ['Decor', 'Eco-friendly'],
            inStock: true,
            category: 'Decor',
            collection: 'Best Sellers'
        },
        {
            id: 3,
            title: language === 'vi' ? 'Bộ lót ly Origin (Bộ 4 chiếc)' : 'Origin Coasters (Set of 4)',
            price: 45,
            description: language === 'vi'
                ? 'Đế lót ly khắc laser sắc nét từ chất liệu bã cà phê ép...'
                : 'Precision laser-etched coasters featuring...',
            image: '/assets/re_cup.png',
            badge: language === 'vi' ? 'HẾT HÀNG' : 'OUT OF STOCK',
            tags: ['Gifts', 'Handmade'],
            inStock: false,
            category: 'Gifts',
            collection: 'Best Sellers'
        },
        {
            id: 4,
            title: language === 'vi' ? 'Chậu cây để bàn Aroma' : 'Aroma Table Planter',
            price: 32,
            description: language === 'vi'
                ? 'Chậu cây bã cà phê thoáng khí, mang sắc xanh tự nhiên cho căn phòng...'
                : 'Breathable, eco-friendly planter that provides natu...',
            image: '/assets/re_vase.png',
            tags: ['Decor', 'Eco-friendly'],
            inStock: true,
            category: 'Decor',
            collection: 'New Arrivals'
        },
        {
            id: 5,
            title: language === 'vi' ? 'Bộ nến thơm Vessel' : 'Vessel Candle Set',
            price: 58,
            description: language === 'vi'
                ? 'Bộ ba cốc nến sáp đậu nành cao cấp phảng phất hương vị Arabica...'
                : 'A trio of soy-wax candles with scents of Arabica and...',
            image: '/assets/re_glow.png',
            tags: ['Gifts', 'Handmade'],
            inStock: true,
            category: 'Gifts',
            collection: 'Best Sellers'
        },
        {
            id: 6,
            title: language === 'vi' ? 'Thìa đong định lượng Artisan' : 'Artisan Measuring Scoop',
            price: 24,
            description: language === 'vi'
                ? 'Thìa đong định lượng bằng gỗ và bã cà phê, khắc cán theo yêu cầu...'
                : 'Precision scoop with a custom engraved handle...',
            image: '/assets/re_cup.png',
            badge: language === 'vi' ? 'THIẾT KẾ RIÊNG' : 'PERSONALIZED',
            tags: ['Handmade', 'Eco-friendly'],
            inStock: true,
            category: 'Limited Edition',
            collection: 'Personalized'
        }
    ]

    const handleCategoryChange = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category))
        } else {
            setSelectedCategories([...selectedCategories, category])
        }
    }

    const filteredProducts = products.filter(product => {
        if (product.price > priceRange) return false
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false
        if (selectedCollection && product.collection !== selectedCollection) return false
        return true
    })

    const getCategoryLabel = (cat: string) => {
        if (cat === 'Decor') return language === 'vi' ? 'Trang trí' : 'Decor'
        if (cat === 'Gifts') return language === 'vi' ? 'Quà tặng' : 'Gifts'
        if (cat === 'Limited Edition') return language === 'vi' ? 'Bản giới hạn' : 'Limited Edition'
        return cat
    }

    const getCollectionLabel = (coll: string) => {
        if (coll === 'New Arrivals') return language === 'vi' ? 'Hàng mới về' : 'New Arrivals'
        if (coll === 'Best Sellers') return language === 'vi' ? 'Bán chạy' : 'Best Sellers'
        if (coll === 'Personalized') return language === 'vi' ? 'Cá nhân hóa' : 'Personalized'
        return coll
    }

    const getTagLabel = (tag: string) => {
        if (tag === 'Decor') return language === 'vi' ? 'Trang trí' : 'Decor'
        if (tag === 'Handmade') return language === 'vi' ? 'Thủ công' : 'Handmade'
        if (tag === 'Eco-friendly') return language === 'vi' ? 'Thân thiện môi trường' : 'Eco-friendly'
        if (tag === 'Gifts') return language === 'vi' ? 'Quà tặng' : 'Gifts'
        return tag
    }

    return (
        <div className="page-products">

            {/* Header Title section */}
            <section className="curated-header">
                <div className="curated-header-container">
                    <h1>{t('products.title')}</h1>
                    <p>{t('products.desc')}</p>
                </div>
            </section>

            {/* Main Layout Container */}
            <div className="products-layout-container">
                {/* Filters Sidebar */}
                <aside className="filters-sidebar-prod">
                    <h3>
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        {t('products.filters')}
                    </h3>

                    {/* Category Group */}
                    <div className="filter-group-prod">
                        <h4>{t('products.category')}</h4>
                        <div className="filter-options-prod">
                            {['Decor', 'Gifts', 'Limited Edition'].map(cat => (
                                <label key={cat} className="filter-label-prod">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat)}
                                        onChange={() => handleCategoryChange(cat)}
                                    />
                                    {getCategoryLabel(cat)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Price Range Group */}
                    <div className="filter-group-prod">
                        <h4>{t('products.priceRange')}</h4>
                        <div className="price-slider-wrapper">
                            <input
                                type="range"
                                min="0"
                                max="500"
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                            />
                            <div className="price-slider-display">
                                <span>$0</span>
                                <span>Up to ${priceRange}</span>
                            </div>
                        </div>
                    </div>

                    {/* Collections Group */}
                    <div className="filter-group-prod">
                        <h4>{t('products.collections')}</h4>
                        <div className="collection-pills-container">
                            {['New Arrivals', 'Best Sellers', 'Personalized'].map(coll => (
                                <button
                                    key={coll}
                                    className={`collection-pill ${selectedCollection === coll ? 'active' : ''}`}
                                    onClick={() => setSelectedCollection(selectedCollection === coll ? '' : coll)}
                                >
                                    {getCollectionLabel(coll)}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Products Grid */}
                <main className="products-main-content">
                    {filteredProducts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('products.noProducts')}</p>
                            <button 
                                className="btn btn-primary" 
                                style={{ marginTop: '1.5rem' }}
                                onClick={() => {
                                    setSelectedCategories([])
                                    setSelectedCollection('')
                                    setPriceRange(500)
                                }}
                            >
                                {t('products.clearFilters')}
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid-list">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="product-card-wrap">
                                    <Link to={`/products/${product.id}`} className="brand-product-card">
                                        {!product.inStock && (
                                            <div className="out-of-stock-overlay">
                                                <span className="out-of-stock-banner">{language === 'vi' ? 'HẾT HÀNG' : 'OUT OF STOCK'}</span>
                                            </div>
                                        )}
                                        {product.badge && product.badge !== 'OUT OF STOCK' && product.badge !== 'HẾT HÀNG' && (
                                            <span className={`card-badge ${product.badge.toLowerCase().replace(' ', '-')}`}>
                                                {product.badge}
                                            </span>
                                        )}
                                        <div className="card-img-wrapper">
                                            <img src={product.image} alt={product.title} />
                                        </div>
                                        <div className="card-content">
                                            <span className="card-category">{getCategoryLabel(product.category)}</span>
                                            <h3 className="card-title">{product.title}</h3>
                                            <p className="card-description">{product.description}</p>
                                            <div className="card-footer" onClick={(e) => e.stopPropagation()}>
                                                <span className="card-price">${product.price}.00</span>
                                                {product.inStock ? (
                                                    <button className="btn-add-to-cart" title={t('detail.addToCart')} onClick={() => alert(`Added ${product.title} to cart!`)}>
                                                        <svg viewBox="0 0 24 24">
                                                            <circle cx="9" cy="21" r="1"></circle>
                                                            <circle cx="20" cy="21" r="1"></circle>
                                                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <button className="btn-bell" title={t('products.notifyMe')} onClick={() => alert(language === 'vi' ? `Chúng tôi sẽ thông báo cho bạn khi ${product.title} có hàng trở lại!` : `We'll notify you when ${product.title} is back in stock!`)}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="card-stock-status">
                                                {product.inStock ? (
                                                    <span className="stock-in">{t('products.inStock')}</span>
                                                ) : (
                                                    <span className="stock-out">{t('products.outOfStock')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="pagination-wrapper">
                        <button className="page-arrow" aria-label="Previous Page">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button className="page-number active">1</button>
                        <button className="page-number">2</button>
                        <button className="page-number">3</button>
                        <button className="page-arrow" aria-label="Next Page">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </main>
            </div>

            {/* Bottom Promo Section */}
            <section className="curated-promo-section">
                <div className="curated-promo-container">
                    <div className="curated-promo-left">
                        <h2>{t('products.everyPurchaseTitle')}</h2>
                        <p>{t('products.everyPurchaseDesc')}</p>
                        
                        <div className="curated-promo-stats">
                            <div className="curated-promo-stat-item">
                                <h4>12k+</h4>
                                <p>{t('products.kgsRecycled')}</p>
                            </div>
                            <div className="curated-promo-stat-item">
                                <h4>450</h4>
                                <p>{t('products.treesPlanted')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="curated-promo-right">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                        </svg>
                        <h3>{t('products.circularTitle')}</h3>
                        <p>{t('products.circularDesc')}</p>
                        <a href="#sustainability-report" className="learn-more-link" onClick={(e) => { e.preventDefault(); alert(t('products.learnMore')); }}>{t('products.learnMore')}</a>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default ProductListing
