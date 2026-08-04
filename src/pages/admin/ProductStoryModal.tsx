import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import * as storyApi from '@/services/api/adminProductStories';
import StoryQrCode from '@/components/traceability/StoryQrCode';

interface ProductOption { id: string; name: string; slug: string; isActive?: boolean; }

interface ProductStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    story: storyApi.ProductStoryAdmin | null;
    products: ProductOption[];
    coffeeTypes: storyApi.CoffeeTypeOption[];
    onSaved: (story: storyApi.ProductStoryAdmin) => void;
}

const ProductStoryModal: React.FC<ProductStoryModalProps> = ({ isOpen, onClose, story, products, coffeeTypes, onSaved }) => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [productId, setProductId] = useState('');
    const [coffeeTypeId, setCoffeeTypeId] = useState('');
    const [contentHtmlVi, setContentHtmlVi] = useState('');
    const [contentHtmlEn, setContentHtmlEn] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = Boolean(story);

    useEffect(() => {
        setProductId(story?.productId || '');
        setCoffeeTypeId(story?.coffeeTypeId || '');
        setContentHtmlVi(story?.contentHtmlVi || '');
        setContentHtmlEn(story?.contentHtmlEn || '');
        setError(null);
    }, [story, isOpen]);

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isEditing && (!productId || !coffeeTypeId)) {
            setError(t('adminStory.requiredSelection'));
            return;
        }
        if (!contentHtmlVi.trim() || !contentHtmlEn.trim()) {
            setError(t('adminStory.requiredContent'));
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const saved = isEditing
                ? await storyApi.updateProductStory(story!.id, { contentHtmlVi, contentHtmlEn })
                : await storyApi.createProductStory({ productId, coffeeTypeId, contentHtmlVi, contentHtmlEn });
            onSaved(saved);
            showToast(t(isEditing ? 'adminStory.updated' : 'adminStory.created'), 'success');
        } catch (requestError: any) {
            const message = requestError?.message || t('adminStory.genericError');
            setError(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick>
            <div className="my-8 max-h-[calc(100vh-4rem)] w-full max-w-5xl overflow-y-auto rounded bg-white shadow-[0_20px_60px_rgba(75,35,17,0.18)]">
                <div className="flex items-start justify-between border-b border-[#e8ddd5] px-6 py-5 md:px-8">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#657b35]">RE:CAFÉ / QR</p>
                        <h2 className="mt-1 text-xl font-extrabold text-[#4b2311]">{t(isEditing ? 'adminStory.editTitle' : 'adminStory.createTitle')}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded text-2xl text-[#925f3c] transition hover:bg-[#f7f4f0] hover:text-[#4b2311] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]" aria-label={t('adminStory.close')}>
                        ×
                    </button>
                </div>

                <form onSubmit={save} className="grid gap-8 p-6 md:grid-cols-[minmax(0,1fr)_220px] md:p-8">
                    <div className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <label className="space-y-2 text-sm font-bold text-[#4b2311]">
                                <span>{t('adminStory.product')}</span>
                                <select value={productId} onChange={(event) => setProductId(event.target.value)} disabled={isEditing} className="min-h-11 w-full rounded border border-[#d9cbbd] bg-white px-3 text-sm font-medium text-[#4b2311] focus:border-[#657b35] focus:outline-none disabled:bg-[#f7f4f0]" required={!isEditing}>
                                    <option value="">{t('adminStory.selectProduct')}</option>
                                    {products.filter(product => product.isActive !== false).map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                                </select>
                            </label>
                            <label className="space-y-2 text-sm font-bold text-[#4b2311]">
                                <span>{t('adminStory.coffeeType')}</span>
                                <select value={coffeeTypeId} onChange={(event) => setCoffeeTypeId(event.target.value)} disabled={isEditing} className="min-h-11 w-full rounded border border-[#d9cbbd] bg-white px-3 text-sm font-medium text-[#4b2311] focus:border-[#657b35] focus:outline-none disabled:bg-[#f7f4f0]" required={!isEditing}>
                                    <option value="">{t('adminStory.selectCoffeeType')}</option>
                                    {coffeeTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                                </select>
                            </label>
                        </div>

                        <label className="block space-y-2 text-sm font-bold text-[#4b2311]">
                            <span>{t('adminStory.contentVi')}</span>
                            <textarea value={contentHtmlVi} onChange={(event) => setContentHtmlVi(event.target.value)} rows={11} placeholder="<h2>Arabica</h2>..." className="w-full resize-y rounded border border-[#d9cbbd] bg-white px-3 py-3 font-mono text-xs leading-6 text-[#4b2311] focus:border-[#657b35] focus:outline-none" required />
                        </label>
                        <label className="block space-y-2 text-sm font-bold text-[#4b2311]">
                            <span>{t('adminStory.contentEn')}</span>
                            <textarea value={contentHtmlEn} onChange={(event) => setContentHtmlEn(event.target.value)} rows={11} placeholder="<h2>Arabica</h2>..." className="w-full resize-y rounded border border-[#d9cbbd] bg-white px-3 py-3 font-mono text-xs leading-6 text-[#4b2311] focus:border-[#657b35] focus:outline-none" required />
                        </label>

                        {error && <p role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800">{error}</p>}

                        <div className="flex flex-wrap justify-end gap-3 border-t border-[#e8ddd5] pt-5">
                            <Button type="button" variant="secondary" onClick={onClose}>{t('adminStory.cancel')}</Button>
                            <Button type="submit" disabled={saving}>{saving ? t('adminStory.saving') : t('adminStory.save')}</Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded bg-[#f7f4f0] p-4 text-xs leading-6 text-[#68361c]/75">
                            <p className="font-bold text-[#4b2311]">{t('adminStory.editorNoteTitle')}</p>
                            <p className="mt-1">{t('adminStory.editorNote')}</p>
                        </div>
                        {story && <StoryQrCode value={story.landingPageUrl} slug={story.slug} />}
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ProductStoryModal;
