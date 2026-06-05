import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'

interface Product {
    id: number | string
    slug: string
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
    const { isAuthenticated, openLoginModal } = useAuth()
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const [priceRange, setPriceRange] = useState<number | null>(null)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedCollection, setSelectedCollection] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, selectedCollection, priceRange]);

    const [dbProducts, setDbProducts] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/Products')
            .then(res => res.json())
            .then(data => {
                const list = Array.isArray(data) ? data : (data?.data || []);
                setDbProducts(list);
            })
            .catch(err => console.error('Error loading public products:', err));
    }, []);

    const mappedProducts: Product[] = dbProducts.map((p) => {
        const tags = [p.categoryName || 'Decor'];
        if (p.isPersonalizable) tags.push('Handmade');
        if (p.rewardPoints) tags.push('Eco-friendly');

        return {
            id: p.id,
            slug: p.slug || String(p.id),
            title: p.name,
            price: p.price,
            description: p.shortDescription || p.description || 'Sản phẩm làm từ bã cà phê tái chế.',
            image: p.thumbnailUrl || p.image || '/assets/re_cup.png',
            badge: p.isPersonalizable ? 'THIẾT KẾ RIÊNG' : (p.rewardPoints ? 'MỚI VỀ' : undefined),
            tags: tags,
            inStock: p.isActive !== false,
            category: p.categoryName || 'Decor',
            collection: p.isPersonalizable ? 'Personalized' : (p.rewardPoints ? 'New Arrivals' : 'Best Sellers')
        };
    });

    const allProducts = mappedProducts;

    const handleCategoryChange = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category))
        } else {
            setSelectedCategories([...selectedCategories, category])
        }
    }

    const filteredProducts = allProducts.filter(product => {
        const checkPrice = product.price > 1000 ? product.price / 1000 : product.price;
        if (priceRange !== null && checkPrice > priceRange) return false
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false
        if (selectedCollection && product.collection !== selectedCollection) return false
        return true
    })

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                                value={priceRange ?? 500}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                            />
                            <div className="price-slider-display">
                                <span>{language === 'vi' ? '0 đ' : '$0'}</span>
                                <span>
                                    {priceRange === null
                                        ? (language === 'vi' ? 'Tất cả' : 'All')
                                        : (language === 'vi'
                                            ? `Lên đến ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(priceRange * 1000)}`
                                            : `Up to $${priceRange}`)}
                                </span>
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
                                    setPriceRange(null)
                                }}
                            >
                                {t('products.clearFilters')}
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid-list">
                            {paginatedProducts.map(product => (
                                <div key={product.id} className="product-card-wrap">
                                    <Link to={`/products/${product.slug}`} className="brand-product-card">
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
                                                <span className="card-price">{product.price > 1000 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : `$${product.price}.00`}</span>
                                                {product.inStock ? (
                                                    <button 
                                                        className="btn-add-to-cart" 
                                                        title={t('detail.addToCart')} 
                                                        onClick={async (e) => {
                                                            e.preventDefault();
                                                            if (!isAuthenticated) {
                                                                sessionStorage.setItem('pending_cart_action', JSON.stringify({
                                                                    item: {
                                                                        id: product.id as string,
                                                                        productId: product.id as string,
                                                                        name: product.title,
                                                                        slug: product.slug,
                                                                        price: product.price,
                                                                        image: product.image
                                                                    },
                                                                    quantity: 1,
                                                                    page: 'listing'
                                                                }));
                                                                openLoginModal('addToCart');
                                                                return;
                                                            }
                                                            await addToCart({
                                                                id: product.id as string,
                                                                productId: product.id as string,
                                                                name: product.title,
                                                                slug: product.slug,
                                                                price: product.price,
                                                                image: product.image
                                                            }, 1);
                                                            showToast(language === 'vi' ? `Đã thêm ${product.title} vào giỏ` : `Added ${product.title} to cart`, 'success');
                                                        }}
                                                    >
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
                    {totalPages > 1 && (
                        <div className="pagination-wrapper">
                            <button 
                                className="page-arrow" 
                                aria-label="Previous Page"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                style={{ 
                                    opacity: currentPage === 1 ? 0.5 : 1, 
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    border: 'none',
                                    outline: 'none'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`page-number ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        border: 'none',
                                        outline: 'none'
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                className="page-arrow" 
                                aria-label="Next Page"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                style={{ 
                                    opacity: currentPage === totalPages ? 0.5 : 1, 
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    border: 'none',
                                    outline: 'none'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    )}
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
