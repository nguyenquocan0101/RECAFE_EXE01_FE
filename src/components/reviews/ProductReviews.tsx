import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { getProductReviews, Review, ReviewPage } from '@/services/api/reviews';
import StarRating from './StarRating';

interface ProductReviewsProps { productId: string; }

const ReviewMediaGrid: React.FC<{ review: Review }> = ({ review }) => review.media.length > 0 ? <div className="mt-4 grid max-w-md grid-cols-3 gap-2">
    {review.media.map(media => media.mediaType === 'video'
        ? <video key={media.id} src={media.url} controls className="aspect-square w-full rounded object-cover" />
        : <img key={media.id} src={media.url} alt="Customer review attachment" loading="lazy" className="aspect-square w-full rounded object-cover" />)}
</div> : null;

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [reviewPage, setReviewPage] = useState<ReviewPage | null>(null);
    const [page, setPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState<number | undefined>();
    const [withMedia, setWithMedia] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const copy = useMemo(() => ({
        title: t('reviews.title'), subtitle: t('reviews.subtitle'), total: t('reviews.total'), verified: t('reviews.verified'),
        all: t('reviews.all'), withMedia: t('reviews.withMedia'), reviews: t('reviews.reviews'), empty: t('reviews.empty'),
        error: t('reviews.loadError'), retry: t('reviews.retry'), previous: t('reviews.previous'), next: t('reviews.next'), loading: t('reviews.loading')
    }), [t]);

    const loadReviews = useCallback(async () => {
        setLoading(true); setError(false);
        try { setReviewPage(await getProductReviews(productId, { page, pageSize: 5, rating: ratingFilter, withMedia })); }
        catch (requestError: any) { setError(true); showToast(requestError.message || copy.error, 'error'); }
        finally { setLoading(false); }
    }, [productId, page, ratingFilter, withMedia, showToast, copy.error]);

    useEffect(() => { loadReviews(); }, [loadReviews]);
    const updateRatingFilter = (value?: number) => { setRatingFilter(value); setPage(1); };
    const total = reviewPage?.totalReviews || 0;
    const average = reviewPage?.averageRating || 0;

    return <section className="mx-auto mt-16 w-full max-w-[1300px] px-6 pb-4" aria-labelledby="product-reviews-title">
        <div className="border-t border-[#e8ddd5] pt-12">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#925f3c]">{copy.subtitle}</p><h2 id="product-reviews-title" className="mt-2 text-2xl font-extrabold text-[#4b2311] sm:text-3xl">{copy.title}</h2></div><div className="flex items-center gap-3 text-sm text-[#68361c]"><StarRating value={average} readOnly size="sm" /><span className="font-bold">{average.toFixed(1)} / 5</span><span className="text-[#9c7a65]">({total} {copy.total})</span></div></div>
            {reviewPage && total > 0 && <div className="mb-8 grid gap-6 rounded-xl border border-[#e8ddd5] bg-[#faf9f6] p-5 md:grid-cols-[minmax(0,260px)_1fr] md:p-6"><div className="flex flex-col items-center justify-center border-b border-[#e8ddd5] pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-6"><span className="text-5xl font-extrabold text-[#4b2311]">{average.toFixed(1)}</span><StarRating value={average} readOnly size="sm" /><span className="mt-2 text-sm text-[#9c7a65]">{total} {copy.reviews}</span></div><div className="space-y-2">{[5, 4, 3, 2, 1].map(star => { const count = reviewPage.ratingDistribution[String(star)] || 0; const width = total ? `${Math.round((count / total) * 100)}%` : '0%'; return <button key={star} type="button" onClick={() => updateRatingFilter(ratingFilter === star ? undefined : star)} className={`flex min-h-[44px] w-full items-center gap-3 rounded px-2 text-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35] ${ratingFilter === star ? 'bg-white' : ''}`} aria-pressed={ratingFilter === star}><span className="w-12 shrink-0 text-left font-bold text-[#68361c]">{star} ★</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8ddd5]"><span className="block h-full rounded-full bg-[#925f3c]" style={{ width }} /></span><span className="w-8 shrink-0 text-right text-xs text-[#9c7a65]">{count}</span></button>; })}</div></div>}
            <div className="mb-6 flex flex-col gap-3 border-b border-[#f3ede8] pb-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2" role="group" aria-label={copy.title}><button type="button" onClick={() => updateRatingFilter(undefined)} aria-pressed={!ratingFilter} className={`min-h-[44px] rounded border px-4 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35] ${!ratingFilter ? 'border-[#657b35] bg-[#657b35] text-white' : 'border-[#e8ddd5] bg-white text-[#68361c] hover:bg-[#faf9f6]'}`}>{copy.all}</button>{[5, 4, 3, 2, 1].map(star => <button key={star} type="button" onClick={() => updateRatingFilter(ratingFilter === star ? undefined : star)} aria-pressed={ratingFilter === star} className={`min-h-[44px] rounded border px-3 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35] ${ratingFilter === star ? 'border-[#657b35] bg-[#657b35] text-white' : 'border-[#e8ddd5] bg-white text-[#68361c] hover:bg-[#faf9f6]'}`}>{star} ★</button>)}</div><label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-[#68361c]"><input type="checkbox" checked={withMedia} onChange={event => { setWithMedia(event.target.checked); setPage(1); }} className="h-4 w-4 accent-[#657b35]" />{copy.withMedia}</label></div>
            {loading ? <div className="space-y-4" aria-live="polite"><div className="h-28 animate-pulse rounded-xl bg-[#faf9f6]" /><div className="h-28 animate-pulse rounded-xl bg-[#faf9f6]" /><p className="text-center text-sm text-[#9c7a65]">{copy.loading}</p></div> : error ? <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center"><p className="font-bold text-red-950">{copy.error}</p><button type="button" onClick={loadReviews} className="mt-4 min-h-[44px] rounded bg-[#4b2311] px-4 text-sm font-bold text-white hover:bg-[#68361c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]">{copy.retry}</button></div> : !reviewPage || reviewPage.reviews.length === 0 ? <div className="rounded-xl border border-dashed border-[#e8ddd5] px-5 py-12 text-center"><p className="font-bold text-[#4b2311]">{copy.empty}</p></div> : <div className="space-y-4">{reviewPage.reviews.map(review => <article key={review.id} className="rounded-xl border border-[#e8ddd5] bg-white p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-bold text-[#4b2311]">{review.reviewerName}</h3>{review.isVerifiedPurchase && <span className="rounded bg-[#f4f6f0] px-2 py-1 text-xs font-bold text-[#657b35]">✓ {copy.verified}</span>}</div><div className="mt-1 flex items-center gap-2"><StarRating value={review.rating} readOnly size="sm" /><span className="text-xs text-[#9c7a65]">{new Date(review.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span></div></div></div>{review.comment && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#4b2311]">{review.comment}</p>}<ReviewMediaGrid review={review} /></article>)}</div>}
            {reviewPage && reviewPage.totalPages > 1 && <nav className="mt-6 flex items-center justify-between gap-4" aria-label={copy.title}><button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page <= 1 || loading} className="min-h-[44px] rounded border border-[#e8ddd5] px-4 text-sm font-bold text-[#68361c] hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]">{copy.previous}</button><span className="text-sm font-bold text-[#68361c]">{page} / {reviewPage.totalPages}</span><button type="button" onClick={() => setPage(current => Math.min(reviewPage.totalPages, current + 1))} disabled={page >= reviewPage.totalPages || loading} className="min-h-[44px] rounded border border-[#e8ddd5] px-4 text-sm font-bold text-[#68361c] hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35]">{copy.next}</button></nav>}
        </div>
    </section>;
};

export default ProductReviews;
