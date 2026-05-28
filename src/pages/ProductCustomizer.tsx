import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/context/ToastContext'
import { 
    createCustomization, 
    getCustomizations, 
    getCustomizationBootstrap,
    CustomizationDto, 
    CustomizationData 
} from '@/services/api/customizations'
import { CustomizerCanvas3D } from '@/components/customizer/CustomizerCanvas3D'

// ─── Main ProductCustomizer Component ────────────────────────────────────────

const ProductCustomizer: React.FC = () => {
    const { slug } = useParams<{ slug: string }>()
    const { language } = useLanguage()
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const [dbProduct, setDbProduct] = useState<any | null>(null)
    const [loadingProduct, setLoadingProduct] = useState(true)

    // Sliders state
    const [positionX, setPositionX] = useState<number>(0)
    const [positionY, setPositionY] = useState<number>(0)
    const [positionZ, setPositionZ] = useState<number>(0)
    const [rotationX, setRotationX] = useState<number>(0)
    const [rotationY, setRotationY] = useState<number>(0)
    const [rotationZ, setRotationZ] = useState<number>(0)
    const [scale, setScale] = useState<number>(1.0)
    const [engraveDepth, setEngraveDepth] = useState<number>(1.0)
    const [note, setNote] = useState<string>('')

    // Image state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [portraitFile, setPortraitFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Customization states
    const [saving, setSaving] = useState(false)
    const [savedCustomization, setSavedCustomization] = useState<CustomizationDto | null>(null)
    const [history, setHistory] = useState<CustomizationDto[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // 1. Fetch Product details
    useEffect(() => {
        if (!slug) return;
        setLoadingProduct(true);
        fetch(`/api/Products/slug/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error('Product not found');
                return res.json();
            })
            .then(resData => {
                const prod = resData.data || resData;
                setDbProduct(prod);
                
                // Fetch previous history once product is loaded
                fetchHistory(prod.id);

                // Fetch bootstrap customization (draft/default coordinates)
                getCustomizationBootstrap(prod.id)
                    .then(bootstrapData => {
                        if (bootstrapData) {
                            if (bootstrapData.positionX !== undefined) setPositionX(bootstrapData.positionX);
                            if (bootstrapData.positionY !== undefined) setPositionY(bootstrapData.positionY);
                            if (bootstrapData.positionZ !== undefined) setPositionZ(bootstrapData.positionZ);
                            if (bootstrapData.rotationX !== undefined) setRotationX(bootstrapData.rotationX);
                            if (bootstrapData.rotationY !== undefined) setRotationY(bootstrapData.rotationY);
                            if (bootstrapData.rotationZ !== undefined) setRotationZ(bootstrapData.rotationZ);
                            if (bootstrapData.scale !== undefined) setScale(bootstrapData.scale);
                            if (bootstrapData.engraveDepth !== undefined) setEngraveDepth(bootstrapData.engraveDepth);
                            if (bootstrapData.note !== undefined) setNote(bootstrapData.note || '');
                            if (bootstrapData.sourceImageUrl) {
                                setPreviewUrl(bootstrapData.sourceImageUrl);
                                setSavedCustomization(bootstrapData);
                            }
                        }
                    })
                    .catch(err => {
                        console.warn('No active bootstrap/draft customization found or error loading:', err);
                    });
            })
            .catch(err => {
                console.error('Error fetching product detail:', err);
                showToast(language === 'vi' ? 'Không thể tải thông tin sản phẩm' : 'Failed to load product details', 'error');
            })
            .finally(() => {
                setLoadingProduct(false);
            });
    }, [slug, language]);

    // 2. Fetch history function
    const fetchHistory = async (productId: string) => {
        setLoadingHistory(true);
        try {
            const list = await getCustomizations(productId);
            setHistory(list);
        } catch (err) {
            console.error('Error loading customization history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Handle uploader drop/drag
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPortraitFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Save customization handler
    const handleSave = async () => {
        if (!dbProduct) return;
        if (!portraitFile) {
            showToast(
                language === 'vi' ? 'Vui lòng upload ảnh chân dung trước!' : 'Please upload a portrait image first!', 
                'error'
            );
            return;
        }

        setSaving(true);
        try {
            const payload: CustomizationData = {
                portraitImage: portraitFile,
                positionX,
                positionY,
                positionZ,
                rotationX,
                rotationY,
                rotationZ,
                scale,
                engraveDepth,
                note: note || undefined
            };
            const result = await createCustomization(dbProduct.id, payload);
            setSavedCustomization(result);
            
            showToast(
                language === 'vi' ? 'Lưu thiết kế 3D thành công!' : 'Saved 3D customization successfully!',
                'success'
            );
            
            // Reload history to show the newly saved item
            fetchHistory(dbProduct.id);
        } catch (err: any) {
            console.error('Failed to save customization:', err);
            showToast(err.message || 'Failed to save customization', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Apply a past customization from history
    const applyPastCustomization = async (c: CustomizationDto) => {
        setPositionX(c.positionX);
        setPositionY(c.positionY);
        setPositionZ(c.positionZ);
        setRotationX(c.rotationX);
        setRotationY(c.rotationY);
        setRotationZ(c.rotationZ);
        setScale(c.scale);
        setEngraveDepth(c.engraveDepth);
        setNote(c.note || '');
        setPreviewUrl(c.sourceImageUrl);
        setPortraitFile(null); // Mark file as loaded from URL
        setSavedCustomization(c);

        showToast(
            language === 'vi' ? `Đã khôi phục thiết kế ngày ${new Date(c.createdAt).toLocaleDateString()}` : `Restored customization from ${new Date(c.createdAt).toLocaleDateString()}`,
            'success'
        );
    };

    // Add Customized Item to Cart
    const handleAddToCart = async (buyNow: boolean = false) => {
        if (!dbProduct) return;
        if (!savedCustomization) {
            showToast(
                language === 'vi' ? 'Vui lòng bấm "Lưu thiết kế" trước khi thêm vào giỏ!' : 'Please save your design before adding to cart!',
                'error'
            );
            return;
        }

        try {
            const noteText = `Customization ID: ${savedCustomization.id}`;
            await addToCart({
                id: dbProduct.id,
                productId: dbProduct.id,
                name: dbProduct.name + ` (Khắc chân dung 3D)`,
                slug: dbProduct.slug,
                price: dbProduct.price,
                salePrice: dbProduct.salePrice,
                image: savedCustomization.previewImageUrl || dbProduct.images?.[0]?.imageUrl || '/assets/re_cup.png'
            }, 1, noteText);

            showToast(
                language === 'vi' ? 'Đã thêm cốc khắc 3D của bạn vào giỏ hàng!' : 'Added customized 3D cup to cart!',
                'success'
            );

            if (buyNow) {
                navigate('/checkout');
            }
        } catch (err: any) {
            console.error('Failed to add customized item to cart:', err);
        }
    };

    if (loadingProduct) {
        return (
            <div className="flex flex-col items-center justify-center min-height-screen bg-[#FAF9F6] text-primary gap-4 p-8">
                <div className="w-10 h-10 border-4 border-[#eaddd2] border-t-primary rounded-full animate-spin" />
                <span className="font-bold tracking-wider text-sm">
                    {language === 'vi' ? 'ĐANG TẢI MÔ HÌNH 3D...' : 'LOADING 3D EDITOR...'}
                </span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col lg:flex-row">
            
            {/* ─── LEFT SIDE: 3D Visualizer ────────────────────────────────────────── */}
            <div className="flex-1 min-h-[50vh] lg:min-h-screen relative flex flex-col bg-gradient-to-tr from-[#f3ede4] to-[#fcfaf7] border-b lg:border-b-0 lg:border-r border-[#eaddd2]">
                {/* Header info */}
                <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
                    <button 
                        onClick={() => navigate(`/products/${dbProduct?.slug}`)} 
                        className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-[#eaddd2] rounded-full text-xs font-bold text-text-main shadow-sm hover:bg-[#FAF6F0] transition"
                    >
                        ← {language === 'vi' ? 'Quay lại chi tiết' : 'Back to details'}
                    </button>
                    
                    <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                        RE:CAFE 3D CUSTOMIZER
                    </span>
                </div>

                <CustomizerCanvas3D
                    model3DUrl={dbProduct?.model3DUrl}
                    previewUrl={previewUrl}
                    positionX={positionX}
                    positionY={positionY}
                    positionZ={positionZ}
                    rotationX={rotationX}
                    rotationY={rotationY}
                    rotationZ={rotationZ}
                    scale={scale}
                    setPositionX={setPositionX}
                    setPositionY={setPositionY}
                    language={language}
                />
            </div>

            {/* ─── RIGHT SIDE: Customizer Controls (Glassmorphic Pane) ─────────────── */}
            <div className="w-full lg:w-[480px] max-h-screen overflow-y-auto bg-white/60 backdrop-blur-lg border-t lg:border-t-0 border-[#eaddd2] p-8 flex flex-col gap-6">
                
                {/* Product Meta */}
                <div>
                    <h1 className="text-2xl font-black text-text-main leading-tight mb-2">
                        {dbProduct?.name}
                    </h1>
                    <p className="text-xs text-text-secondary leading-relaxed font-semibold uppercase tracking-wider">
                        {language === 'vi' ? 'Dịch vụ Khắc chân dung nghệ thuật' : 'Fine Portrait Engraving Service'}
                    </p>
                </div>

                {/* Mock Preview Banner (MVP Status Indicator) */}
                {savedCustomization?.isMockResult && (
                    <div className="p-4 bg-[#68361c]/5 border border-[#68361c]/10 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-xl shrink-0">visibility</span>
                        <div>
                            <h4 className="text-primary font-bold text-xs uppercase tracking-wide mb-0.5">
                                {language === 'vi' ? 'Chế độ xem trước (Preview)' : 'Preview Mode'}
                            </h4>
                            <p className="text-[11px] text-text-secondary/80 leading-relaxed font-semibold">
                                {language === 'vi' 
                                    ? 'Cốc 3D hiện tại hiển thị mô phỏng vị trí khắc. Khi bạn đặt hàng, thợ thủ công sẽ khắc ảnh thực tế lên cốc bã cà phê sinh học.' 
                                    : 'The 3D model shows a visual preview. Once ordered, our craftsmen will perform precise geometry engraving on the actual bio-recycled coffee grounds cup.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 1: Upload Portrait */}
                <div className="bg-white border border-[#eaddd2] rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                        <span className="flex items-center justify-center size-5 bg-primary text-white text-[10px] rounded-full">1</span>
                        {language === 'vi' ? 'Tải ảnh chân dung' : 'Upload Portrait Image'}
                    </h3>

                    {/* Drag and Drop Zone */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#eaddd2] hover:border-primary rounded-xl p-6 text-center cursor-pointer transition bg-[#FAF9F6] flex flex-col items-center gap-2"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden" 
                        />
                        {previewUrl ? (
                            <img src={previewUrl} alt="Portrait preview" className="size-20 rounded-lg object-cover border border-[#eaddd2] shadow" />
                        ) : (
                            <span className="material-symbols-outlined text-3xl text-text-secondary/50">upload_file</span>
                        )}
                        <span className="text-xs font-bold text-text-main mt-1">
                            {portraitFile ? portraitFile.name : (language === 'vi' ? 'Chọn ảnh chân dung hoặc kéo thả' : 'Choose portrait image or drag & drop')}
                        </span>
                        <span className="text-[10px] text-text-secondary/70 font-semibold uppercase">
                            JPG, PNG, WEBP (Max 5MB)
                        </span>
                    </div>
                </div>

                {/* QUICK PRESETS */}
                <div className="bg-white border border-[#eaddd2] rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary">splitscreen</span>
                        {language === 'vi' ? 'Chọn nhanh vị trí khắc' : 'Quick Placement Presets'}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => {
                                setPositionX(0);
                                setPositionY(0);
                                setPositionZ(0);
                                setRotationY(0);
                            }}
                            className={`py-3 px-1 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                                positionX === 0 && rotationY === 0
                                    ? 'bg-primary text-white border-primary shadow-md scale-[0.98]'
                                    : 'bg-[#FAF9F6] hover:bg-[#F0EBE3] text-text-main border-[#eaddd2]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">vertical_align_center</span>
                            <span>{language === 'vi' ? 'Mặt trước' : 'Front Face'}</span>
                        </button>

                        <button
                            onClick={() => {
                                setPositionX(-5.8);
                                setPositionY(0);
                                setPositionZ(-5.8);
                                setRotationY(-90);
                            }}
                            className={`py-3 px-1 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                                positionX === -5.8 && rotationY === -90
                                    ? 'bg-primary text-white border-primary shadow-md scale-[0.98]'
                                    : 'bg-[#FAF9F6] hover:bg-[#F0EBE3] text-text-main border-[#eaddd2]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">arrow_back</span>
                            <span>{language === 'vi' ? 'Bên trái quai' : 'Left Side'}</span>
                        </button>

                        <button
                            onClick={() => {
                                setPositionX(5.8);
                                setPositionY(0);
                                setPositionZ(-5.8);
                                setRotationY(90);
                            }}
                            className={`py-3 px-1 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 ${
                                positionX === 5.8 && rotationY === 90
                                    ? 'bg-primary text-white border-primary shadow-md scale-[0.98]'
                                    : 'bg-[#FAF9F6] hover:bg-[#F0EBE3] text-text-main border-[#eaddd2]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                            <span>{language === 'vi' ? 'Bên phải quai' : 'Right Side'}</span>
                        </button>
                    </div>
                </div>

                {/* STEP 2: Control Sliders */}
                <div className="bg-white border border-[#eaddd2] rounded-2xl p-5 shadow-sm space-y-5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="flex items-center justify-center size-5 bg-primary text-white text-[10px] rounded-full">2</span>
                            {language === 'vi' ? 'Căn chỉnh vị trí & kích thước' : 'Adjust Placement & Size'}
                        </span>
                        <button
                            onClick={() => {
                                setPositionX(0);
                                setPositionY(0);
                                setPositionZ(0);
                                setRotationX(0);
                                setRotationY(0);
                                setRotationZ(0);
                                setScale(1.0);
                                setEngraveDepth(1.0);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#FAF6F0] hover:bg-[#F0EBE3] border border-[#eaddd2] rounded-lg text-[9px] font-black uppercase tracking-wider text-text-main transition shadow-sm cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[12px] font-bold">restart_alt</span>
                            <span>{language === 'vi' ? 'Đặt lại' : 'Reset'}</span>
                        </button>
                    </h3>

                    <div className="space-y-4">
                        {/* Position X Slider */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                                <span>{language === 'vi' ? 'Ngang (X)' : 'Horizontal (X)'}</span>
                                <span>{positionX.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" 
                                min="-10" 
                                max="10" 
                                step="0.1" 
                                value={positionX} 
                                onChange={(e) => setPositionX(Number(e.target.value))}
                                className="w-full h-1 bg-[#FAF6F0] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Position Y Slider */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                                <span>{language === 'vi' ? 'Dọc (Y)' : 'Vertical (Y)'}</span>
                                <span>{positionY.toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" 
                                min="-10" 
                                max="10" 
                                step="0.1" 
                                value={positionY} 
                                onChange={(e) => setPositionY(Number(e.target.value))}
                                className="w-full h-1 bg-[#FAF6F0] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Scale Slider */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                                <span>{language === 'vi' ? 'Thu phóng (Scale)' : 'Scale'}</span>
                                <span>{scale.toFixed(2)}x</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="5.0" 
                                step="0.05" 
                                value={scale} 
                                onChange={(e) => setScale(Number(e.target.value))}
                                className="w-full h-1 bg-[#FAF6F0] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Rotation Y Slider */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                                <span>{language === 'vi' ? 'Xoay góc cốc (Rotation Y)' : 'Rotate on Cup (Y)'}</span>
                                <span>{rotationY}°</span>
                            </div>
                            <input 
                                type="range" 
                                min="-180" 
                                max="180" 
                                step="1" 
                                value={rotationY} 
                                onChange={(e) => setRotationY(Number(e.target.value))}
                                className="w-full h-1 bg-[#FAF6F0] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Engrave Depth */}
                        <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                                <span>{language === 'vi' ? 'Độ sâu khắc (Engrave Depth)' : 'Engrave Depth'}</span>
                                <span>{engraveDepth.toFixed(1)} mm</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.1" 
                                max="5.0" 
                                step="0.1" 
                                value={engraveDepth} 
                                onChange={(e) => setEngraveDepth(Number(e.target.value))}
                                className="w-full h-1 bg-[#FAF6F0] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Note Field */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                        {language === 'vi' ? 'Ghi chú cho nghệ nhân' : 'Notes for Craftsmen'}
                    </label>
                    <textarea 
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={language === 'vi' ? 'Ví dụ: Khắc rõ nét phần tóc, thêm chữ..."' : 'E.g., engrave text underneath, make face focus...'}
                        className="w-full border border-[#eaddd2] rounded-xl p-3 text-xs bg-white focus:border-primary outline-none resize-none font-semibold"
                    />
                </div>

                {/* Actions: Save, Add to Cart */}
                <div className="flex flex-col gap-3 mt-2">
                    <button
                        onClick={handleSave}
                        disabled={saving || !portraitFile}
                        className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 border-none outline-none shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                            !portraitFile 
                                ? 'bg-[#FAF6F0] text-text-secondary/50 border border-[#eaddd2] cursor-not-allowed' 
                                : 'bg-[#FAF6F0] hover:bg-[#F0EBE3] text-primary border border-primary/20'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {saving ? 'hourglass_top' : 'save'}
                        </span>
                        <span className="uppercase tracking-widest text-xs">
                            {saving ? (language === 'vi' ? 'ĐANG LƯU THIẾT KẾ...' : 'SAVING DESIGN...') : (language === 'vi' ? 'Lưu thiết kế 3D' : 'Save 3D Design')}
                        </span>
                    </button>

                    {savedCustomization && (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleAddToCart(false)}
                                className="bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl border-none outline-none shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                                <span className="uppercase tracking-widest text-[10px]">
                                    {language === 'vi' ? 'Thêm giỏ hàng' : 'Add to Cart'}
                                </span>
                            </button>
                            <button
                                onClick={() => handleAddToCart(true)}
                                className="bg-[#68361c] hover:bg-[#4b2311] text-white font-bold py-4 rounded-xl border-none outline-none shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="uppercase tracking-widest text-[10px]">
                                    {language === 'vi' ? 'Mua ngay' : 'Buy Now'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* ─── Collapsible Design History ────────────────────────────────────── */}
                <div className="border-t border-[#eaddd2] pt-6 mt-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex justify-between items-center">
                        <span>{language === 'vi' ? 'Lịch sử thiết kế' : 'Design History'}</span>
                        <span className="px-2 py-0.5 rounded bg-[#FAF6F0] text-[10px] text-text-secondary/70 font-bold border border-[#eaddd2]">
                            {history.length}
                        </span>
                    </h3>

                    {loadingHistory ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-[#FAF6F0] border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-[11px] font-semibold text-text-secondary/50 text-center py-4 italic">
                            {language === 'vi' ? 'Chưa có bản lưu thiết kế nào.' : 'No saved designs yet.'}
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                            {history.map((c) => (
                                <div 
                                    key={c.id} 
                                    onClick={() => applyPastCustomization(c)}
                                    className="p-3 bg-white hover:bg-[#FAF6F0] border border-[#eaddd2] hover:border-primary rounded-xl flex items-center gap-3 cursor-pointer transition shadow-sm"
                                >
                                    <img src={c.sourceImageUrl} alt="History thumb" className="size-10 rounded-lg object-cover border border-[#eaddd2]" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className="text-[10px] font-bold text-text-main block truncate">
                                                {c.note || (language === 'vi' ? 'Bản thiết kế 3D' : '3D Design')}
                                            </span>
                                            <span className="text-[9px] text-text-secondary/60 font-semibold block shrink-0">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-[#4b2311] font-extrabold uppercase tracking-wider block">
                                            X: {c.positionX.toFixed(1)} · Y: {c.positionY.toFixed(1)} · Scale: {c.scale.toFixed(1)}x
                                        </span>
                                    </div>
                                    <span className="material-symbols-outlined text-text-secondary/40 text-lg hover:text-primary transition">
                                        restore
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}

export default ProductCustomizer
