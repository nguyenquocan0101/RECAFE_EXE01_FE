import React, { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { createReview, deleteReview, getMyReview, Review, ReviewMedia } from '@/services/api/reviews';
import StarRating from './StarRating';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    productId: string;
    productName: string;
    existingReviewId?: string | null;
    onSubmitted: (review: Review) => void;
    onDeleted: (reviewId: string) => void;
}

interface LocalFile { file: File; previewUrl: string; mediaType: 'image' | 'video'; }
const MAX_IMAGES = 2;
const MAX_VIDEOS = 1;
const MAX_FILES = 3;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const mediaTypeOf = (file: File): 'image' | 'video' | null => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return null;
};

const MediaGrid: React.FC<{ media: ReviewMedia[]; alt: string }> = ({ media, alt }) => <div className="grid grid-cols-3 gap-2">
    {media.map(item => item.mediaType === 'video'
        ? <video key={item.id} src={item.url} controls className="aspect-square w-full rounded object-cover" />
        : <img key={item.id} src={item.url} alt={alt} className="aspect-square w-full rounded object-cover" loading="lazy" />)}
</div>;

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, orderId, productId, productName, existingReviewId, onSubmitted, onDeleted }) => {
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState<LocalFile[]>([]);
    const [existingReview, setExistingReview] = useState<Review | null>(null);
    const [loadingExisting, setLoadingExisting] = useState(false);
    const [existingError, setExistingError] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const filesRef = useRef<LocalFile[]>([]);

    const copy = useMemo(() => ({
        title: t('reviews.title'), product: t('reviews.product'), rating: t('reviews.rating'), comment: t('reviews.comment'),
        commentPlaceholder: t('reviews.commentPlaceholder'), attachments: t('reviews.attachments'), attachmentHint: t('reviews.attachmentHint'),
        chooseFiles: t('reviews.chooseFiles'), cancel: t('reviews.cancel'), create: t('reviews.create'), saving: t('reviews.saving'),
        delete: t('reviews.delete'), deleting: t('reviews.deleting'), deleteQuestion: t('reviews.deleteQuestion'), deleteHint: t('reviews.deleteHint'),
        keepReview: t('reviews.keepReview'), loading: t('reviews.loadingExisting'), error: t('reviews.existingError'), requiredRating: t('reviews.requiredRating'),
        mediaError: t('reviews.mediaError'), created: t('reviews.created'), deleted: t('reviews.deleted'), genericError: t('reviews.genericError')
    }), [t]);

    useEffect(() => {
        if (!isOpen) return;
        setRating(0); setComment(''); setConfirmDelete(false); setExistingReview(null); setExistingError(false);
        setSubmitError('');
        setFiles(previous => { previous.forEach(item => URL.revokeObjectURL(item.previewUrl)); return []; });
        if (existingReviewId) {
            setLoadingExisting(true);
            getMyReview(existingReviewId).then(setExistingReview).catch(error => { setExistingError(true); showToast(error.message || copy.genericError, 'error'); }).finally(() => setLoadingExisting(false));
        }
    }, [isOpen, existingReviewId]);

    useEffect(() => { filesRef.current = files; }, [files]);
    useEffect(() => () => { filesRef.current.forEach(item => URL.revokeObjectURL(item.previewUrl)); }, []);

    const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(event.target.files || []); event.target.value = '';
        const next = [...files]; let images = next.filter(item => item.mediaType === 'image').length; let videos = next.filter(item => item.mediaType === 'video').length;
        selected.forEach(file => {
            const type = mediaTypeOf(file); const limit = type === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
            if (!type || file.size > limit || next.length >= MAX_FILES || (type === 'image' && images >= MAX_IMAGES) || (type === 'video' && videos >= MAX_VIDEOS)) { showToast(copy.mediaError, 'error'); return; }
            next.push({ file, mediaType: type, previewUrl: URL.createObjectURL(file) }); if (type === 'image') images += 1; else videos += 1;
        });
        setFiles(next);
    };

    const removeFile = (previewUrl: string) => { URL.revokeObjectURL(previewUrl); setFiles(previous => previous.filter(item => item.previewUrl !== previewUrl)); };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitError('');
        if (rating < 1) { setSubmitError(copy.requiredRating); showToast(copy.requiredRating, 'error'); return; }
        setSubmitting(true);
        try {
            const review = await createReview({ orderId, productId, rating, comment, files: files.map(item => item.file) });
            if (!review) throw new Error(copy.genericError);
            onSubmitted(review); showToast(copy.created, 'success');
            onClose();
        } catch (error: any) { setSubmitError(error.message || copy.genericError); showToast(error.message || copy.genericError, 'error'); } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        if (!existingReviewId) return;
        setDeleting(true);
        try { await deleteReview(existingReviewId); onDeleted(existingReviewId); showToast(copy.deleted, 'success'); onClose(); }
        catch (error: any) { showToast(error.message || copy.genericError, 'error'); }
        finally { setDeleting(false); }
    };

    const isExisting = Boolean(existingReviewId);
    return <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={!submitting && !deleting}>
        <div className="my-6 w-full max-w-2xl overflow-hidden rounded-xl border border-[#e8ddd5] bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
            <div className="flex items-start justify-between gap-4 border-b border-[#f3ede8] px-5 py-4 sm:px-6">
                <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9c7a65]">{copy.product}</p><h2 id="review-modal-title" className="mt-1 text-xl font-extrabold text-[#4b2311]">{copy.title}</h2><p className="mt-1 max-w-[48ch] truncate text-sm text-[#68361c]" title={productName}>{productName}</p></div>
                <button type="button" onClick={onClose} disabled={submitting || deleting} aria-label={copy.cancel} className="flex min-h-[44px] min-w-[44px] appearance-none items-center justify-center rounded border-0 bg-transparent p-0 text-xl leading-none text-[#9c7a65] shadow-none transition-colors hover:bg-[#faf9f6] hover:text-[#4b2311] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#657b35] disabled:opacity-50">×</button>
            </div>
            {isExisting ? <div className="space-y-5 px-5 py-5 sm:px-6">
                {loadingExisting ? <p className="py-8 text-center text-sm font-semibold text-[#9c7a65]">{copy.loading}</p> : existingError || !existingReview ? <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{copy.error}</p> : <>
                    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><StarRating value={existingReview.rating} readOnly size="md" /><span className="text-sm font-bold text-[#4b2311]">{existingReview.rating}/5</span></div><span className="text-xs text-[#9c7a65]">{new Date(existingReview.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span></div>
                    {existingReview.comment && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#4b2311]">{existingReview.comment}</p>}
                    {existingReview.media.length > 0 && <MediaGrid media={existingReview.media} alt={t('reviews.mediaAlt')} />}
                    {confirmDelete ? <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4"><p className="font-bold text-red-950">{copy.deleteQuestion}</p><p className="text-sm text-red-900">{copy.deleteHint}</p><div className="flex flex-wrap gap-3"><Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? copy.deleting : copy.delete}</Button><Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)} disabled={deleting}>{copy.keepReview}</Button></div></div> : <div className="flex flex-wrap justify-end gap-3 border-t border-[#f3ede8] pt-4"><Button type="button" variant="secondary" onClick={onClose}>{copy.cancel}</Button><Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>{copy.delete}</Button></div>}
                </>}
            </div> : <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
                <div><label className="mb-2 block text-sm font-bold text-[#4b2311]">{copy.rating}<span className="text-red-700"> *</span></label><StarRating value={rating} onChange={setRating} label={copy.rating} size="lg" /></div>
                <div><label htmlFor="review-comment" className="mb-2 block text-sm font-bold text-[#4b2311]">{copy.comment}</label><textarea id="review-comment" value={comment} onChange={event => setComment(event.target.value.slice(0, 1000))} maxLength={1000} rows={4} placeholder={copy.commentPlaceholder} className="w-full resize-y rounded-lg border border-[#e8ddd5] bg-[#faf9f6] px-3 py-3 text-sm leading-6 text-[#4b2311] placeholder:text-[#9c7a65] focus:border-[#657b35] focus:outline-none focus:ring-2 focus:ring-[#657b35]/20" /><p className="mt-1 text-right text-xs text-[#9c7a65]">{comment.length}/1000</p></div>
                <div><div className="mb-2 flex flex-wrap items-baseline justify-between gap-2"><span className="text-sm font-bold text-[#4b2311]">{copy.attachments}</span><span className="text-xs text-[#9c7a65]">{copy.attachmentHint}</span></div><label className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#925f3c] bg-[#faf9f6] px-4 text-sm font-bold text-[#68361c] transition-colors hover:bg-[#f5f0eb] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#657b35]"><span>{copy.chooseFiles}</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={handleFiles} className="sr-only" /></label>{files.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{files.map(item => <div key={item.previewUrl} className="relative overflow-hidden rounded-lg border border-[#e8ddd5] bg-[#faf9f6]">{item.mediaType === 'video' ? <video src={item.previewUrl} controls className="aspect-square w-full object-cover" /> : <img src={item.previewUrl} alt={item.file.name} className="aspect-square w-full object-cover" />}<button type="button" onClick={() => removeFile(item.previewUrl)} aria-label={`${copy.delete} ${item.file.name}`} className="absolute right-1 top-1 min-h-[36px] min-w-[36px] rounded-full bg-[#4b2311] text-lg leading-none text-white shadow transition-colors hover:bg-[#925f3c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">×</button></div>)}</div>}</div>
                {submitError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900" role="alert">{submitError}</p>}
                <div className="flex flex-col-reverse gap-3 border-t border-[#f3ede8] pt-4 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>{copy.cancel}</Button><Button type="submit" variant="primary" disabled={submitting}>{submitting ? copy.saving : copy.create}</Button></div>
            </form>}
        </div>
    </Modal>;
};

export default ReviewModal;
