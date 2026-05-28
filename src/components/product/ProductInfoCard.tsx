import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'

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
    category?: ProductCategory | null;
    images?: ProductImage[] | null;
}

interface ProductInfoCardProps {
    dbProduct: DBProduct;
    quantity: number;
    setQuantity: React.Dispatch<React.SetStateAction<number>>;
    handleAddToCart: () => Promise<void>;
    handleBuyNow: () => void;
}

const ProductInfoCard: React.FC<ProductInfoCardProps> = ({
    dbProduct,
    quantity,
    setQuantity,
    handleAddToCart,
    handleBuyNow
}) => {
    const { t, language } = useLanguage()
    const { isAuthenticated, openLoginModal } = useAuth()
    const navigate = useNavigate()
    const addBtnRef = useRef<HTMLButtonElement>(null)
    const [addedToCart, setAddedToCart] = useState(false)

    useEffect(() => {
        const handleTriggerFly = () => {
            runOnlyFlyAnimation();
        };
        window.addEventListener('trigger-fly-to-cart', handleTriggerFly);
        return () => {
            window.removeEventListener('trigger-fly-to-cart', handleTriggerFly);
        };
    }, []);

    const runOnlyFlyAnimation = () => {
        const cartBtn = document.getElementById('cart-icon-btn')
        const addBtn = addBtnRef.current
        if (!cartBtn || !addBtn) {
            return
        }

        // Get positions
        const from = addBtn.getBoundingClientRect()
        const to = cartBtn.getBoundingClientRect()

        // Create flying dot
        const dot = document.createElement('div')
        dot.style.cssText = `
            position: fixed;
            z-index: 9999;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #657b35;
            left: ${from.left + from.width / 2 - 8}px;
            top: ${from.top + from.height / 2 - 8}px;
            transition: left 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        top 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                        transform 0.65s ease,
                        opacity 0.3s ease 0.45s;
            pointer-events: none;
        `
        document.body.appendChild(dot)

        // Trigger animation to cart icon
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                dot.style.left = `${to.left + to.width / 2 - 8}px`
                dot.style.top = `${to.top + to.height / 2 - 8}px`
                dot.style.transform = 'scale(0.3)'
                dot.style.opacity = '0'
            })
        })

        // Bounce cart icon
        setTimeout(() => {
            cartBtn.style.transform = 'scale(1.3)'
            cartBtn.style.transition = 'transform 0.15s ease'
            setTimeout(() => {
                cartBtn.style.transform = 'scale(1)'
            }, 150)
        }, 600)

        // Remove dot after animation
        setTimeout(() => dot.remove(), 800)

        // Show success state on button
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 1800)
    }

    const flyToCart = async () => {
        runOnlyFlyAnimation()
        await handleAddToCart()
    }

    const handleButtonClick = async () => {
        if (!isAuthenticated) {
            sessionStorage.setItem('pending_cart_action', JSON.stringify({
                item: {
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
                },
                quantity: quantity,
                page: 'detail'
            }));
            openLoginModal('addToCart');
            return;
        }
        await flyToCart();
    }

    const description = dbProduct.description || dbProduct.shortDescription || (language === 'vi' ? 'Sản phẩm làm từ bã cà phê tái chế chất lượng cao.' : 'High quality product made from recycled coffee grounds.');
    const material = dbProduct.material || (language === 'vi' ? 'Bã cà phê tái chế sinh học' : 'Bio-recycled coffee grounds');
    const size = dbProduct.size || (language === 'vi' ? 'Tiêu chuẩn (Hành động bền vững)' : 'Standard (Sustainable choice)');
    const usageNote = dbProduct.usageNote || t('detail.warning');

    return (
        <div className="flex flex-col">
            {/* Tag Badge */}
            <span className="inline-flex items-center px-3 py-1.5 rounded bg-primary/5 text-primary text-[10px] font-extrabold tracking-widest uppercase mb-5 self-start">
                {dbProduct.isPersonalizable 
                    ? (language === 'vi' ? 'THIẾT KẾ RIÊNG' : 'PERSONALIZED') 
                    : (dbProduct.rewardPoints 
                        ? (language === 'vi' ? 'MỚI VỀ' : 'NEW ARRIVAL') 
                        : (language === 'vi' ? 'BỘ SƯU TẬP MỚI' : 'NEW COLLECTION'))}
            </span>
            
            {/* Product Name */}
            <h1 className="text-3xl lg:text-4xl font-extrabold text-text-main tracking-tight leading-tight mb-4">
                {dbProduct.name}
            </h1>
            
            {/* Pricing Section */}
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-[#eaddd2]">
                {dbProduct.salePrice ? (
                    <>
                        <span className="text-2xl lg:text-3xl font-extrabold text-primary">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dbProduct.salePrice)}
                        </span>
                        <span className="text-base text-text-secondary/60 line-through">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dbProduct.price)}
                        </span>
                    </>
                ) : (
                    <span className="text-2xl lg:text-3xl font-extrabold text-text-main">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dbProduct.price)}
                    </span>
                )}
                <span className="text-xs font-semibold text-text-secondary border-l border-[#eaddd2] pl-4 uppercase tracking-wider">
                    {t('detail.recycledDesc')}
                </span>
            </div>

            {/* Product Description */}
            <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">
                    {t('detail.detailTitle')}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4 p-5 bg-white border border-[#eaddd2] rounded-xl mb-6">
                <div className="space-y-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary/70">
                        {t('detail.specsMaterial')}
                    </span>
                    <span className="block text-sm font-bold text-text-main">
                        {material}
                    </span>
                </div>
                <div className="space-y-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary/70">
                        {t('detail.specsSize')}
                    </span>
                    <span className="block text-sm font-bold text-text-main">
                        {size}
                    </span>
                </div>
            </div>

            {/* Warning Box (Sustainable Impact Design) */}
            <div className="bg-white border border-[#eaddd2] rounded-xl p-5 flex items-start gap-4 mb-8 overflow-hidden">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary text-white shrink-0">
                    <span className="material-symbols-outlined text-lg">info</span>
                </div>
                <div>
                    <h4 className="text-primary font-bold text-sm mb-0.5">
                        {language === 'vi' ? 'Lưu ý sử dụng' : 'Usage Note'}
                    </h4>
                    <p className="text-text-secondary text-xs leading-relaxed">
                        {usageNote}
                    </p>
                </div>
            </div>

            {/* Actions Block */}
            <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-6 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        {t('detail.quantity')}
                    </span>
                    <div className="detail-quantity-selector">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        />
                        <button 
                            onClick={() => setQuantity(quantity + 1)} 
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* 3D Customizer Action Button — Only if personalizable */}
                {dbProduct.isPersonalizable && (
                    <button 
                        onClick={() => {
                            if (!isAuthenticated) {
                                openLoginModal('customization');
                                return;
                            }
                            navigate(`/products/${dbProduct.slug}/customize`);
                        }}
                        className="w-full bg-[#FAF6F0] hover:bg-[#F0EBE3] text-primary border border-primary/20 font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md outline-none cursor-pointer mb-2"
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>
                            edit
                        </span>
                        <span className="uppercase tracking-widest text-xs">
                            {language === 'vi' ? 'Khắc chân dung 3D / Tự thiết kế' : '3D Engrave / Design in 3D'}
                        </span>
                    </button>
                )}

                {/* Add to Cart Button */}
                <button 
                    ref={addBtnRef}
                    onClick={handleButtonClick}
                    className={`w-full font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl border-none outline-none cursor-pointer ${
                        addedToCart
                            ? 'bg-[#4a7c28] shadow-[#4a7c28]/10 text-white'
                            : 'bg-primary hover:bg-primary-hover shadow-primary/10 text-white'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {addedToCart ? 'check_circle' : 'shopping_bag'}
                    </span>
                    <span className="uppercase tracking-widest text-xs">
                        {addedToCart ? (language === 'vi' ? 'Đã thêm!' : 'Added!') : t('detail.addToCart')}
                    </span>
                </button>
                
                {/* Buy Now Button */}
                <button 
                    onClick={handleBuyNow}
                    className="w-full bg-[#68361c] hover:bg-[#4b2311] text-white font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-[#68361c]/10 border-none outline-none cursor-pointer"
                >
                    <span className="uppercase tracking-widest text-xs">{t('detail.buyNow')}</span>
                </button>
            </div>
        </div>
    )
}

export default ProductInfoCard
