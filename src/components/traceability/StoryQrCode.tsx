import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/context/LanguageContext';

interface StoryQrCodeProps {
    value: string;
    slug: string;
}

const StoryQrCode: React.FC<StoryQrCodeProps> = ({ value, slug }) => {
    const { t } = useLanguage();
    const qrRef = useRef<HTMLDivElement>(null);

    const download = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;
        const serialized = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${slug}-qr.svg`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col items-center gap-4 rounded bg-[#f7f4f0] p-5" data-testid="story-qr">
            <div ref={qrRef} className="bg-white p-3 shadow-sm">
                <QRCodeSVG
                    value={value}
                    size={180}
                    marginSize={4}
                    title={`${t('adminStory.qrTitle')}: ${slug}`}
                    fgColor="#4b2311"
                    bgColor="#ffffff"
                />
            </div>
            <button
                type="button"
                onClick={download}
                title={t('adminStory.downloadQr')}
                aria-label={t('adminStory.downloadQr')}
                className="inline-flex min-h-11 items-center gap-2 rounded border border-[#d9cbbd] px-4 text-xs font-bold text-[#68361c] transition hover:border-[#657b35] hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
                </svg>
                {t('adminStory.downloadQr')}
            </button>
        </div>
    );
};

export default StoryQrCode;
