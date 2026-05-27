import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import ProductInfoCard from '@/components/product/ProductInfoCard'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

const Model3DViewer = lazy(() => import('@/components/product/Model3DViewer'))

interface ProductImage {
    id: string;
    imageUrl: string;
    isThumbnail: boolean;
    sortOrder: number;
}

interface ProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

interface DBProduct {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    salePrice?: number | null;
    shortDescription?: string | null;
    description?: string | null;
    material?: string | null;
    size?: string | null;
    usageNote?: string | null;
    isPersonalizable?: boolean;
    rewardPoints?: number;
    model3DUrl?: string | null;
    category?: ProductCategory | null;
    images?: ProductImage[] | null;
}

const ProductDetail: React.FC = () => {
    const { t, language } = useLanguage()
    const { slug } = useParams<{ slug: string }>()
    const { addToCart } = useCart()
    const { isAuthenticated, openLoginModal } = useAuth()
    const navigate = useNavigate()
    const [selectedImageIdx, setSelectedImageIdx] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [viewMode, setViewMode] = useState<'image' | '3d'>('image')
    const [dbProduct, setDbProduct] = useState<DBProduct | null>(null)
    const [loading, setLoading] = useState(true)
    const [relatedProducts, setRelatedProducts] = useState<any[]>([])

    useEffect(() => {
        if (!slug) return;
        setLoading(true);

        // 1. Fetch Product details by slug
        fetch(`/api/Products/slug/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then(resData => {
                if (resData && resData.success && resData.data) {
                    setDbProduct(resData.data);
                } else if (resData && resData.data) {
                    setDbProduct(resData.data);
                } else {
                    setDbProduct(resData);
                }
                setSelectedImageIdx(0);
            })
            .catch(err => {
                console.error('Error loading product details:', err);
                setDbProduct(null);
            })
            .finally(() => {
                setLoading(false);
            });

        // 2. Fetch Related products from public API
        fetch('/api/Products')
            .then(res => res.json())
            .then(resData => {
                const list = Array.isArray(resData) ? resData : (resData?.data || []);
                const filtered = list
                    .filter((p: any) => p.slug !== slug && p.isActive !== false)
                    .slice(0, 4)
                    .map((p: any) => ({
                        id: p.id,
                        slug: p.slug || p.id,
                        title: p.name,
                        category: (p.categoryName || p.category?.name || 'DECOR').toUpperCase(),
                        price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price),
                        image: p.thumbnailUrl || p.image || (p.images && p.images[0]?.imageUrl) || '/assets/re_cup.png'
                    }));
                setRelatedProducts(filtered);
            })
            .catch(err => {
                console.error('Error loading related products:', err);
                setRelatedProducts([]);
            });
    }, [slug, language]);

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            openLoginModal('addToCart');
            return;
        }
        if (!dbProduct) return;
        
        await addToCart({
            id: dbProduct.id,
            productId: dbProduct.id,
            name: dbProduct.name,
            slug: dbProduct.slug,
            price: dbProduct.price,
            salePrice: dbProduct.salePrice,
            image: dbProduct.images && dbProduct.images.length > 0 
                ? dbProduct.images[0].imageUrl 
                : '/assets/re_cup.png',
            material: dbProduct.material || (language === 'vi' ? 'Bã cà phê tái chế sinh học' : 'Bio-recycled coffee grounds'),
            size: dbProduct.size || 'Standard'
        }, quantity);
    }

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            openLoginModal('addToCart');
            return;
        }
        if (!dbProduct) return;

        await addToCart({
            id: dbProduct.id,
            productId: dbProduct.id,
            name: dbProduct.name,
            slug: dbProduct.slug,
            price: dbProduct.price,
            salePrice: dbProduct.salePrice,
            image: dbProduct.images && dbProduct.images.length > 0
                ? dbProduct.images[0].imageUrl
                : '/assets/re_cup.png',
            material: dbProduct.material || (language === 'vi' ? 'Bã cà phê tái chế sinh học' : 'Bio-recycled coffee grounds'),
            size: dbProduct.size || 'Standard'
        }, quantity);

        navigate('/checkout');
    }

    if (loading) {
        return (
            <div className="page-product-detail" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh', 
                gap: '1.25rem'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f0e8e0',
                    borderTop: '3px solid #657b35',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {language === 'vi' ? 'ĐANG TẢI THÔNG TIN SẢN PHẨM...' : 'LOADING PRODUCT DETAILS...'}
                </div>
            </div>
        );
    }

    if (!dbProduct) {
        return (
            <div className="page-product-detail" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '60vh', 
                gap: '1rem',
                color: 'var(--text-muted)',
                padding: '2rem'
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#c83a42' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                    {language === 'vi' ? 'Không tìm thấy sản phẩm yêu cầu' : 'Requested product not found'}
                </div>
                <Link to="/products" style={{ color: '#657b35', fontWeight: 600, textDecoration: 'underline', marginTop: '0.5rem' }}>
                    {language === 'vi' ? 'Quay lại cửa hàng' : 'Back to shop'}
                </Link>
            </div>
        );
    }

    // Build the images gallery dynamically from actual API data
    const images = dbProduct.images && dbProduct.images.length > 0
        ? dbProduct.images.map((img) => img.imageUrl)
        : ['/assets/re_vase.png'];

    const categoryName = dbProduct.category?.name || 'Decor';

    return (
        <div className="page-product-detail">

            {/* Breadcrumb Navigation */}
            <nav className="breadcrumb-nav">
                <Link to="/">{t('detail.breadcrumbsHome')}</Link>
                <span className="breadcrumb-separator">›</span>
                <Link to="/products">{t('detail.breadcrumbsProducts')}</Link>
                <span className="breadcrumb-separator">›</span>
                <span>{dbProduct.name}</span>
            </nav>

            {/* Main Detail Layout */}
            <div className="detail-main-layout">
                {/* Left side: Images gallery / 3D Viewer */}
                <div className="detail-images-gallery">
                    {/* Tab switcher — chỉ hiện khi có model3DUrl */}
                    {dbProduct.model3DUrl && (
                        <div style={{
                            display: 'flex',
                            gap: '6px',
                            marginBottom: '10px',
                        }}>
                            <button
                                onClick={() => setViewMode('image')}
                                style={{
                                    flex: 1,
                                    padding: '6px 0',
                                    borderRadius: '8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.4px',
                                    cursor: 'pointer',
                                    border: viewMode === 'image' ? '1.5px solid #657b35' : '1.5px solid #e8ddd5',
                                    background: viewMode === 'image' ? '#657b35' : '#FAF9F6',
                                    color: viewMode === 'image' ? '#fff' : '#68361c',
                                    transition: 'all 0.15s',
                                }}
                                aria-label="Xem ảnh sản phẩm"
                            >
                                📷&nbsp; Ảnh sản phẩm
                            </button>
                            <button
                                onClick={() => setViewMode('3d')}
                                style={{
                                    flex: 1,
                                    padding: '6px 0',
                                    borderRadius: '8px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.4px',
                                    cursor: 'pointer',
                                    border: viewMode === '3d' ? '1.5px solid #657b35' : '1.5px solid #e8ddd5',
                                    background: viewMode === '3d' ? '#657b35' : '#FAF9F6',
                                    color: viewMode === '3d' ? '#fff' : '#68361c',
                                    transition: 'all 0.15s',
                                }}
                                aria-label="Xem mô hình 3D"
                            >
                                🧊&nbsp; Xem 3D
                            </button>
                        </div>
                    )}

                    {viewMode === '3d' && dbProduct.model3DUrl ? (
                        <Suspense fallback={
                            <div style={{
                                height: '420px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#FAF6F0', borderRadius: '12px',
                                color: '#657b35', fontSize: '0.85rem', fontWeight: 600,
                            }}>
                                Đang tải viewer 3D...
                            </div>
                        }>
                            <Model3DViewer url={dbProduct.model3DUrl} height="420px" />
                        </Suspense>
                    ) : (
                        <>
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
                                <img src={images[selectedImageIdx]} alt={`${dbProduct.name} main view`} />
                            </div>
                        </>
                    )}
                </div>

                {/* Right side: Product info card */}
                <ProductInfoCard 
                    dbProduct={dbProduct}
                    quantity={quantity}
                    setQuantity={setQuantity}
                    handleAddToCart={handleAddToCart}
                    handleBuyNow={handleBuyNow}
                />
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
            {relatedProducts.length > 0 && (
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
                                <Link key={p.id} to={`/products/${p.slug}`} className="brand-product-card">
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
            )}

        </div>
    )
}

export default ProductDetail
