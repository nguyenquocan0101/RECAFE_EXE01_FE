import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import * as adminApi from '@/services/api/admin';
import * as storyApi from '@/services/api/adminProductStories';
import ProductStoryModal from './ProductStoryModal';

interface ProductOption { id: string; name: string; slug: string; isActive?: boolean; }

const unwrap = <T,>(value: any): T => (value?.data ?? value) as T;

const AdminProductStories: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [pageData, setPageData] = useState<storyApi.ProductStoryPage | null>(null);
    const [coffeeTypes, setCoffeeTypes] = useState<storyApi.CoffeeTypeOption[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [publicationFilter, setPublicationFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [loadingStories, setLoadingStories] = useState(true);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [storiesError, setStoriesError] = useState<string | null>(null);
    const [optionsError, setOptionsError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingStory, setEditingStory] = useState<storyApi.ProductStoryAdmin | null>(null);
    const [previewStory, setPreviewStory] = useState<storyApi.ProductStoryAdmin | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);

    const loadStories = useCallback(async () => {
        setLoadingStories(true);
        setStoriesError(null);
        try {
            const isPublished = publicationFilter === 'all' ? undefined : publicationFilter === 'published';
            setPageData(await storyApi.getAdminProductStories({ page, pageSize: 20, keyword, isPublished }));
        } catch (error: any) {
            setStoriesError(error?.message || t('adminStory.loadError'));
        } finally {
            setLoadingStories(false);
        }
    }, [keyword, page, publicationFilter, t]);

    const loadOptions = useCallback(async () => {
        setLoadingOptions(true);
        setOptionsError(null);
        const [coffeeResult, productResult] = await Promise.allSettled([
            storyApi.getActiveCoffeeTypes(),
            adminApi.getAdminProducts(),
        ]);
        if (coffeeResult.status === 'fulfilled') setCoffeeTypes(coffeeResult.value);
        if (productResult.status === 'fulfilled') {
            const productData = unwrap<ProductOption[]>(productResult.value);
            setProducts(Array.isArray(productData) ? productData : []);
        }
        if (coffeeResult.status === 'rejected' || productResult.status === 'rejected') {
            setOptionsError(t('adminStory.optionsError'));
        }
        setLoadingOptions(false);
    }, [t]);

    useEffect(() => { void loadStories(); }, [loadStories]);
    useEffect(() => { void loadOptions(); }, [loadOptions]);

    const stories = pageData?.stories || [];
    const publishedCount = useMemo(() => stories.filter(story => story.isPublished).length, [stories]);

    const openCreate = () => {
        setEditingStory(null);
        setModalOpen(true);
    };

    const openEdit = (story: storyApi.ProductStoryAdmin) => {
        setEditingStory(story);
        setModalOpen(true);
    };

    const handleSaved = (saved: storyApi.ProductStoryAdmin) => {
        setPageData(current => {
            if (!current) return { page: 1, pageSize: 20, totalStories: 1, totalPages: 1, stories: [saved] };
            const exists = current.stories.some(story => story.id === saved.id);
            return { ...current, stories: exists ? current.stories.map(story => story.id === saved.id ? saved : story) : [saved, ...current.stories], totalStories: exists ? current.totalStories : current.totalStories + 1 };
        });
        setEditingStory(saved);
    };

    const copyLink = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            showToast(t('adminStory.copied'), 'success');
        } catch {
            showToast(t('adminStory.copyError'), 'error');
        }
    };

    const togglePublication = async (story: storyApi.ProductStoryAdmin) => {
        try {
            setBusyId(story.id);
            const updated = await storyApi.setProductStoryPublication(story.id, !story.isPublished);
            setPageData(current => current ? { ...current, stories: current.stories.map(item => item.id === updated.id ? updated : item) } : current);
            showToast(t(updated.isPublished ? 'adminStory.published' : 'adminStory.unpublished'), 'success');
        } catch (error: any) {
            showToast(error?.message || t('adminStory.genericError'), 'error');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="min-h-full bg-[#f7f4f0] p-5 md:p-8 animate-slide-up">
            <div className="mx-auto max-w-[1500px]">
                <header className="flex flex-col gap-6 border-b border-[#e8ddd5] pb-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#657b35]">RE:CAFÉ / QR</p>
                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#4b2311]">{t('adminStory.title')}</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68361c]/70">{t('adminStory.subtitle')}</p>
                    </div>
                    <Button onClick={openCreate} disabled={loadingOptions || Boolean(optionsError)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                        {t('adminStory.create')}
                    </Button>
                </header>

                <section className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#68361c]/50">{t('adminStory.total')}</p><p className="mt-2 text-3xl font-extrabold text-[#4b2311]">{pageData?.totalStories ?? '—'}</p></div>
                    <div className="rounded bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#68361c]/50">{t('adminStory.published')}</p><p className="mt-2 text-3xl font-extrabold text-[#657b35]">{loadingStories ? '—' : publishedCount}</p></div>
                    <div className="rounded bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#68361c]/50">{t('adminStory.catalog')}</p><p className="mt-2 text-3xl font-extrabold text-[#925f3c]">{loadingOptions ? '—' : coffeeTypes.length}</p></div>
                </section>

                <section className="mt-8 rounded bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-[#e8ddd5] p-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                            <label className="relative min-w-0 flex-1 sm:max-w-sm">
                                <span className="sr-only">{t('adminStory.search')}</span>
                                <input value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder={t('adminStory.search')} className="min-h-11 w-full rounded border border-[#d9cbbd] bg-white px-3 text-sm text-[#4b2311] placeholder:text-[#68361c]/40 focus:border-[#657b35] focus:outline-none" />
                            </label>
                            <select value={publicationFilter} onChange={(event) => { setPublicationFilter(event.target.value as typeof publicationFilter); setPage(1); }} className="min-h-11 rounded border border-[#d9cbbd] bg-white px-3 text-sm font-semibold text-[#68361c] focus:border-[#657b35] focus:outline-none" aria-label={t('adminStory.statusFilter')}>
                                <option value="all">{t('adminStory.allStatus')}</option>
                                <option value="published">{t('adminStory.publishedStatus')}</option>
                                <option value="draft">{t('adminStory.draftStatus')}</option>
                            </select>
                        </div>
                        <button type="button" onClick={() => { void loadStories(); void loadOptions(); }} title={t('adminStory.retry')} aria-label={t('adminStory.retry')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-[#d9cbbd] px-4 text-xs font-bold text-[#68361c] transition hover:border-[#657b35] hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" /></svg>
                            {t('adminStory.retry')}
                        </button>
                    </div>

                    {(storiesError || optionsError) && <div role="alert" className="m-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800">{storiesError || optionsError}</div>}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                            <thead><tr className="border-b border-[#e8ddd5] bg-[#fcfaf8] text-[10px] font-bold uppercase tracking-[0.14em] text-[#68361c]/55"><th className="px-5 py-4">{t('adminStory.pageColumn')}</th><th className="px-5 py-4">{t('adminStory.productColumn')}</th><th className="px-5 py-4">{t('adminStory.urlColumn')}</th><th className="px-5 py-4">{t('adminStory.statusColumn')}</th><th className="px-5 py-4 text-right">{t('adminStory.actionsColumn')}</th></tr></thead>
                            <tbody className="divide-y divide-[#e8ddd5]/70">
                                {loadingStories ? <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-[#68361c]/60">{t('adminStory.loading')}</td></tr> : stories.length === 0 ? <tr><td colSpan={5} className="px-5 py-14 text-center text-sm text-[#68361c]/60">{t('adminStory.empty')}</td></tr> : stories.map(story => (
                                    <tr key={story.id} className="align-top transition hover:bg-[#fcfaf8]">
                                        <td className="px-5 py-5"><div className="font-bold text-[#4b2311]">{story.coffeeTypeName}</div><div className="mt-1 text-xs text-[#68361c]/60">{t('adminStory.recycledLabel')}</div></td>
                                        <td className="px-5 py-5"><div className="font-bold text-[#4b2311]">{story.productName}</div><div className="mt-1 font-mono text-[11px] text-[#68361c]/55">/{story.slug}</div></td>
                                        <td className="max-w-[230px] px-5 py-5"><a href={story.landingPageUrl} target="_blank" rel="noreferrer" className="block truncate text-xs font-semibold text-[#657b35] hover:underline">{story.landingPageUrl}</a><div className="mt-1 text-[11px] text-[#68361c]/55">{story.sharedQrCount} QR</div></td>
                                        <td className="px-5 py-5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${story.isPublished ? 'bg-[#f2f5eb] text-[#657b35]' : 'bg-[#f7f4f0] text-[#925f3c]'}`}>{story.isPublished ? t('adminStory.publishedStatus') : t('adminStory.draftStatus')}</span></td>
                                        <td className="px-5 py-5"><div className="flex justify-end gap-1">
                                            <button type="button" onClick={() => openEdit(story)} title={t('adminStory.edit')} aria-label={t('adminStory.edit')} className="grid h-10 w-10 place-items-center rounded text-[#68361c] transition hover:bg-[#f2f5eb] hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg></button>
                                            <button type="button" onClick={() => { if (story.isPublished) window.open(story.landingPageUrl, '_blank', 'noopener,noreferrer'); else setPreviewStory(story); }} title={t('adminStory.preview')} aria-label={t('adminStory.preview')} className="grid h-10 w-10 place-items-center rounded text-[#68361c] transition hover:bg-[#f2f5eb] hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></svg></button>
                                            <button type="button" onClick={() => void copyLink(story.landingPageUrl)} title={t('adminStory.copyLink')} aria-label={t('adminStory.copyLink')} className="grid h-10 w-10 place-items-center rounded text-[#68361c] transition hover:bg-[#f2f5eb] hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></svg></button>
                                            <button type="button" onClick={() => void togglePublication(story)} disabled={busyId === story.id} title={story.isPublished ? t('adminStory.unpublish') : t('adminStory.publish')} aria-label={story.isPublished ? t('adminStory.unpublish') : t('adminStory.publish')} className="grid h-10 w-10 place-items-center rounded text-[#68361c] transition hover:bg-[#f2f5eb] hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35] disabled:opacity-40"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={story.isPublished ? 'M3 12h18M12 3v18' : 'M5 12h14M12 5v14'} /></svg></button>
                                        </div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pageData && pageData.totalPages > 1 && <div className="flex items-center justify-between border-t border-[#e8ddd5] px-5 py-4"><span className="text-xs font-semibold text-[#68361c]/60">{pageData.page} / {pageData.totalPages}</span><div className="flex gap-2"><button type="button" disabled={pageData.page <= 1} onClick={() => setPage(current => current - 1)} className="min-h-10 rounded border border-[#d9cbbd] px-3 text-xs font-bold text-[#68361c] disabled:opacity-40">{t('adminStory.previous')}</button><button type="button" disabled={pageData.page >= pageData.totalPages} onClick={() => setPage(current => current + 1)} className="min-h-10 rounded border border-[#d9cbbd] px-3 text-xs font-bold text-[#68361c] disabled:opacity-40">{t('adminStory.next')}</button></div></div>}
                </section>
            </div>

            <ProductStoryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} story={editingStory} products={products} coffeeTypes={coffeeTypes} onSaved={handleSaved} />

            <Modal isOpen={Boolean(previewStory)} onClose={() => setPreviewStory(null)} closeOnOverlayClick>
                {previewStory && <div className="my-8 h-[min(78vh,720px)] w-full max-w-4xl overflow-hidden rounded bg-white shadow-[0_20px_60px_rgba(75,35,17,0.18)]"><div className="flex items-center justify-between border-b border-[#e8ddd5] px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#657b35]">{t('adminStory.draftPreview')}</p><p className="font-mono text-xs text-[#68361c]/70">/{previewStory.slug}</p></div><button type="button" onClick={() => setPreviewStory(null)} aria-label={t('adminStory.close')} className="grid h-10 w-10 place-items-center rounded text-xl text-[#925f3c] hover:bg-[#f7f4f0]">×</button></div><iframe title={t('adminStory.draftPreview')} sandbox="" className="h-[calc(100%-73px)] w-full border-0" srcDoc={`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Arial,sans-serif;color:#4b2311;line-height:1.7;max-width:760px;margin:0 auto;padding:28px}a{color:#657b35}blockquote{border-left:3px solid #657b35;padding-left:12px}</style></head><body>${previewStory.contentHtmlVi}</body></html>`} /></div>}
            </Modal>
        </div>
    );
};

export default AdminProductStories;
