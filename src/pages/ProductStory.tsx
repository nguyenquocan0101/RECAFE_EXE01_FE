import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ApiRequestError, getProductStory, registerProductStoryOpen } from '@/services/api/productStories';

const ProductStory: React.FC = () => {
    const { t, language } = useLanguage();
    const { storySlug } = useParams<{ storySlug: string }>();
    const [story, setStory] = useState<Awaited<ReturnType<typeof getProductStory>> | null>(null);
    const [state, setState] = useState<'loading' | 'success' | 'not-found' | 'error'>('loading');
    const trackedSlug = useRef<string | null>(null);

    useEffect(() => {
        if (!storySlug) return;
        const controller = new AbortController();
        setState('loading');
        setStory(null);

        getProductStory(storySlug, controller.signal)
            .then((data) => {
                setStory(data);
                setState('success');
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setState(error instanceof ApiRequestError && error.status === 404 ? 'not-found' : 'error');
            });

        return () => controller.abort();
    }, [storySlug]);

    useEffect(() => {
        if (state !== 'success' || !story || trackedSlug.current === story.slug) return;
        trackedSlug.current = story.slug;
        void registerProductStoryOpen(story.slug).catch(() => undefined);
    }, [state, story]);

    if (state === 'loading') {
        return <div className="flex min-h-[70vh] items-center justify-center bg-[#f7f4f0]"><div className="h-9 w-9 animate-spin rounded-full border-2 border-[#657b35] border-t-transparent" /></div>;
    }

    if (state !== 'success' || !story) {
        const isMissing = state === 'not-found';
        return (
            <section className="flex min-h-[70vh] items-center justify-center bg-[#f7f4f0] px-6 py-20 text-center">
                <div className="max-w-md">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#657b35]">RE:CAFÉ / {isMissing ? '404' : 'ERROR'}</p>
                    <h1 className="text-3xl font-extrabold text-[#4b2311]">{t(isMissing ? 'story.notFoundTitle' : 'story.errorTitle')}</h1>
                    <p className="mt-3 text-sm leading-7 text-[#68361c]/70">{t(isMissing ? 'story.notFoundDesc' : 'story.errorDesc')}</p>
                    <Link className="mt-7 inline-flex min-h-11 items-center rounded bg-[#657b35] px-5 text-sm font-bold text-white transition hover:bg-[#798e3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]" to="/">
                        {t('story.backHome')}
                    </Link>
                </div>
            </section>
        );
    }

    const localizedHtml = language === 'vi' ? story.contentHtmlVi : story.contentHtmlEn;

    return (
        <article className="min-h-screen bg-[#f7f4f0] text-[#4b2311]">
            <header className="border-b border-[#e8ddd5] bg-white">
                <div className="mx-auto flex max-w-6xl flex-col gap-7 px-6 py-14 md:flex-row md:items-end md:justify-between md:px-10 lg:py-20">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#657b35]">{t('story.eyebrow')}</p>
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">{story.productName}</h1>
                        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#68361c]">
                            <span className="rounded-full bg-[#f2f5eb] px-3 py-1.5 text-[#657b35]">{story.coffeeTypeName}</span>
                            <span aria-hidden="true" className="text-[#925f3c]/50">/</span>
                            <span>{t('story.rebornProduct')}</span>
                        </div>
                    </div>
                    <Link className="inline-flex min-h-11 items-center self-start rounded border border-[#d9cbbd] px-4 text-sm font-bold text-[#68361c] transition hover:border-[#657b35] hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35] md:self-auto" to={`/products/${story.productSlug}`}>
                        {t('story.viewProduct')}
                    </Link>
                </div>
            </header>

            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[minmax(0,1fr)_240px] md:px-10 md:py-16">
                <div className="min-w-0 bg-white px-6 py-8 shadow-[0_12px_40px_rgba(75,35,17,0.06)] md:px-12 md:py-12">
                    <div className="story-rich-content" dangerouslySetInnerHTML={{ __html: localizedHtml }} />
                </div>
                <aside className="self-start border-l-2 border-[#657b35] pl-5 text-sm leading-7 text-[#68361c]/75">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#657b35]">{t('story.pageNoteLabel')}</p>
                    <p className="mt-3">{t('story.pageNote')}</p>
                    <p className="mt-6 text-xs text-[#68361c]/55">{t('story.languageNote')}: {language === 'vi' ? 'VI' : 'EN'}</p>
                </aside>
            </div>
        </article>
    );
};

export default ProductStory;
