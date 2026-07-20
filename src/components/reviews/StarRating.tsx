import React from 'react';

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readOnly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    label?: string;
}

const sizeClasses = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' };

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange, readOnly = false, size = 'md', label = 'Rating' }) => {
    const stars = Array.from({ length: 5 }, (_, index) => index + 1);

    if (readOnly) {
        return <span className={`inline-flex items-center ${sizeClasses[size]} leading-none`} aria-label={`${value} out of 5 stars`}>
            {stars.map(star => <span key={star} className={star <= value ? 'text-[#d6a11e]' : 'text-[#ead9a4]'} aria-hidden="true">★</span>)}
        </span>;
    }

    return <div className="inline-flex items-center gap-0" role="radiogroup" aria-label={label}>
        {stars.map(star => <button key={star} type="button" role="radio" aria-checked={star === value} aria-label={`${star} out of 5 stars`} onClick={() => onChange?.(star)} className={`flex min-h-[44px] min-w-[44px] appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none ${sizeClasses[size]} leading-none text-[#d6a11e] transition-colors hover:bg-transparent hover:text-[#b67f0a] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]`}>
            <span aria-hidden="true">{star <= value ? '★' : '☆'}</span>
        </button>)}
    </div>;
};

export default StarRating;
