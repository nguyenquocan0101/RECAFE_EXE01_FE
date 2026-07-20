import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import StarRating from '@/components/reviews/StarRating';
import * as adminApi from '@/services/api/admin';

type VisibilityFilter = 'all' | 'visible' | 'hidden';

const AdminReviews: React.FC = () => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<adminApi.AdminReview[]>([]);
    const [pageData, setPageData] = useState<adminApi.AdminReviewPage | null>(null);
    const [page, setPage] = useState(1);
    const [visibility, setVisibility] = useState<VisibilityFilter>('all');
    const [rating, setRating] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [productKeyword, setProductKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedReview, setSelectedReview] = useState<adminApi.AdminReview | null>(null);

    const copy = useMemo(() => ({
        title: t('adminReviews.title'), subtitle: t('adminReviews.subtitle'), refresh: t('adminReviews.refresh'),
        searchPlaceholder: t('adminReviews.searchPlaceholder'), search: t('adminReviews.search'), all: t('adminReviews.all'),
        visible: t('adminReviews.visible'), hidden: t('adminReviews.hidden'), rating: t('adminReviews.rating'),
        allRatings: t('adminReviews.allRatings'), product: t('adminReviews.product'), customer: t('adminReviews.customer'),
        stars: t('adminReviews.stars'), content: t('adminReviews.content'), createdAt: t('adminReviews.createdAt'),
        visibility: t('adminReviews.visibility'), shown: t('adminReviews.shown'), hiddenStatus: t('adminReviews.hiddenStatus'),
        hide: t('adminReviews.hide'), show: t('adminReviews.show'), media: t('adminReviews.media'), noMedia: t('adminReviews.noMedia'),
        viewMedia: t('adminReviews.viewMedia'), close: t('adminReviews.close'), empty: t('adminReviews.empty'),
        loadError: t('adminReviews.loadError'), retry: t('adminReviews.retry'), previous: t('adminReviews.previous'),
        next: t('adminReviews.next'), updated: t('adminReviews.updated'), genericError: t('adminReviews.genericError'),
        verified: t('reviews.verified')
    }), [t]);

    const loadReviews = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await adminApi.getAdminReviews({
                page,
                pageSize: 10,
                isVisible: visibility === 'all' ? undefined : visibility === 'visible',
                productKeyword,
                rating: rating === 'all' ? undefined : Number(rating)
            }) as any;
            const data = (response?.data ?? response) as adminApi.AdminReviewPage;
            setPageData(data);
            setReviews(data?.reviews || []);
        } catch (requestError: any) {
            setError(true);
            showToast(requestError.message || copy.genericError, 'error');
        } finally {
            setLoading(false);
        }
    }, [page, visibility, rating, productKeyword, showToast, copy.genericError]);

    useEffect(() => { loadReviews(); }, [loadReviews]);

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();
        setPage(1);
        setProductKeyword(searchInput.trim());
    };

    const handleVisibility = async (review: adminApi.AdminReview) => {
        setUpdatingId(review.id);
        try {
            const response = await adminApi.setReviewVisibility(review.id, !review.isVisible) as any;
            const updated = (response?.data ?? response) as adminApi.AdminReview;
            setReviews(current => current.map(item => item.id === review.id ? { ...item, isVisible: updated?.isVisible ?? !review.isVisible } : item));
            setSelectedReview(current => current?.id === review.id ? { ...current, isVisible: updated?.isVisible ?? !review.isVisible } : current);
            showToast(copy.updated, 'success');
        } catch (requestError: any) {
            showToast(requestError.message || copy.genericError, 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const totalPages = pageData?.totalPages || 0;
    return <div className="min-h-screen bg-[#FAF9F6] p-4 font-sans sm:p-8">
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-6 flex flex-col gap-4 border-b border-[#e8ddd5]/50 bg-[#FAF9F6] px-4 pb-5 pt-5 sm:-mx-8 sm:-mt-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:pt-8">
            <div><h1 className="text-2xl font-extrabold tracking-tight text-[#4b2311] sm:text-3xl">{copy.title}</h1><p className="mt-1 text-sm text-[#68361c]/70">{copy.subtitle}</p></div>
            <Button type="button" variant="secondary" onClick={loadReviews} disabled={loading}><span aria-hidden="true">↻</span>{copy.refresh}</Button>
        </div>

        <form onSubmit={submitSearch} className="mb-6 flex flex-col gap-3 rounded border border-[#e8ddd5]/60 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
            <label className="min-w-0 flex-1"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#68361c]/60">{copy.product}</span><input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder={copy.searchPlaceholder} className="min-h-[44px] w-full rounded border border-[#e8ddd5] bg-[#FAF9F6] px-3 text-sm text-[#4b2311] placeholder:text-[#9c7a65] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20" /></label>
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#68361c]/60">{copy.visibility}</span><select value={visibility} onChange={event => { setVisibility(event.target.value as VisibilityFilter); setPage(1); }} className="min-h-[44px] w-full rounded border border-[#e8ddd5] bg-white px-3 text-sm font-semibold text-[#68361c] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20 sm:w-40"><option value="all">{copy.all}</option><option value="visible">{copy.visible}</option><option value="hidden">{copy.hidden}</option></select></label>
            <label><span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#68361c]/60">{copy.rating}</span><select value={rating} onChange={event => { setRating(event.target.value); setPage(1); }} className="min-h-[44px] w-full rounded border border-[#e8ddd5] bg-white px-3 text-sm font-semibold text-[#68361c] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20 sm:w-32"><option value="all">{copy.allRatings}</option>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} ★</option>)}</select></label>
            <Button type="submit" variant="primary">{copy.search}</Button>
        </form>

        {error && <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-950"><p className="font-bold">{copy.loadError}</p><button type="button" onClick={loadReviews} className="mt-3 min-h-[44px] rounded bg-[#4b2311] px-4 font-bold text-white hover:bg-[#68361c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]">{copy.retry}</button></div>}

        {loading ? <div className="rounded border border-[#e8ddd5]/60 bg-white p-8 shadow-sm"><div className="h-10 animate-pulse rounded bg-[#FAF9F6]" /><div className="mt-3 h-20 animate-pulse rounded bg-[#FAF9F6]" /><div className="mt-3 h-20 animate-pulse rounded bg-[#FAF9F6]" /></div> : reviews.length === 0 ? <div className="rounded border border-dashed border-[#e8ddd5] bg-white px-5 py-16 text-center shadow-sm"><p className="font-bold text-[#4b2311]">{copy.empty}</p></div> : <div className="overflow-hidden rounded border border-[#e8ddd5]/60 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left text-sm"><thead><tr className="border-b border-[#e8ddd5]/40 bg-[#FAF7F5]"><th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">{copy.product}</th><th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">{copy.customer}</th><th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">{copy.stars}</th><th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">{copy.content}</th><th className="px-5 py-4 text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">{copy.createdAt}</th><th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-[#5c5652]">{copy.visibility}</th></tr></thead><tbody className="divide-y divide-[#e8ddd5]/30">{reviews.map(review => <tr key={review.id} className="align-top transition-colors hover:bg-[#FAF9F6]/60"><td className="max-w-[210px] px-5 py-5"><p className="truncate font-bold text-[#4b2311]" title={review.productName}>{review.productName}</p><p className="mt-1 font-mono text-[10px] text-[#9c7a65]">#{review.id.slice(0, 8)}</p></td><td className="px-5 py-5"><p className="font-semibold text-[#4b2311]">{review.reviewerName}</p>{review.isVerifiedPurchase && <span className="mt-1 inline-block rounded bg-[#f4f6f0] px-2 py-1 text-[10px] font-bold text-[#657b35]">✓ {copy.verified}</span>}</td><td className="px-5 py-5"><StarRating value={review.rating} readOnly size="sm" /></td><td className="max-w-[260px] px-5 py-5"><p className="truncate text-[#4b2311]" title={review.comment || copy.noMedia}>{review.comment || '—'}</p>{review.media.length > 0 ? <button type="button" onClick={() => setSelectedReview(review)} className="mt-2 min-h-[44px] rounded border border-[#925f3c] px-3 text-xs font-bold text-[#925f3c] hover:bg-[#f5f0eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]">{copy.viewMedia} ({review.media.length})</button> : <span className="mt-2 inline-block text-xs text-[#9c7a65]">{copy.noMedia}</span>}</td><td className="whitespace-nowrap px-5 py-5 text-xs font-medium text-[#888079]">{new Date(review.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' })}</td><td className="px-5 py-5 text-center"><div className="flex flex-col items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${review.isVisible ? 'border-[#657b35]/30 bg-[#f4f6f0] text-[#657b35]' : 'border-red-200 bg-red-50 text-red-900'}`}>{review.isVisible ? copy.shown : copy.hiddenStatus}</span><button type="button" onClick={() => handleVisibility(review)} disabled={updatingId === review.id} className="min-h-[44px] rounded border border-[#e8ddd5] px-3 text-xs font-bold text-[#68361c] hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]">{updatingId === review.id ? '…' : review.isVisible ? copy.hide : copy.show}</button></div></td></tr>)}</tbody></table></div></div>}

        {pageData && totalPages > 1 && <nav className="mt-6 flex items-center justify-between gap-4" aria-label={copy.title}><button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page <= 1 || loading} className="min-h-[44px] rounded border border-[#e8ddd5] px-4 text-sm font-bold text-[#68361c] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]">{copy.previous}</button><span className="text-sm font-bold text-[#68361c]">{page} / {totalPages}</span><button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page >= totalPages || loading} className="min-h-[44px] rounded border border-[#e8ddd5] px-4 text-sm font-bold text-[#68361c] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]">{copy.next}</button></nav>}

        {selectedReview && <Modal isOpen={Boolean(selectedReview)} onClose={() => setSelectedReview(null)} closeOnOverlayClick><div className="my-6 w-full max-w-2xl rounded-xl border border-[#e8ddd5] bg-white p-5 shadow-xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="admin-review-preview-title"><div className="flex items-start justify-between gap-4"><div><h2 id="admin-review-preview-title" className="text-xl font-extrabold text-[#4b2311]">{selectedReview.productName}</h2><p className="mt-1 text-sm text-[#9c7a65]">{selectedReview.reviewerName}</p></div><button type="button" onClick={() => setSelectedReview(null)} aria-label={copy.close} className="min-h-[44px] min-w-[44px] rounded text-xl text-[#9c7a65] hover:bg-[#FAF9F6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]">×</button></div><div className="mt-4 flex items-center gap-3"><StarRating value={selectedReview.rating} readOnly size="md" /><span className="font-bold text-[#4b2311]">{selectedReview.rating}/5</span></div>{selectedReview.comment && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#4b2311]">{selectedReview.comment}</p>}<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{selectedReview.media.map(media => media.mediaType === 'video' ? <video key={media.id} src={media.url} controls className="aspect-square w-full rounded object-cover" /> : <img key={media.id} src={media.url} alt={copy.media} className="aspect-square w-full rounded object-cover" loading="lazy" />)}</div><div className="mt-5 flex justify-end border-t border-[#f3ede8] pt-4"><Button type="button" variant="secondary" onClick={() => setSelectedReview(null)}>{copy.close}</Button></div></div></Modal>}
    </div>;
};

export default AdminReviews;
