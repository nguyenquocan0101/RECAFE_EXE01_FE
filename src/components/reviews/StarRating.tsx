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
            {stars.map(star => <span key={star} className={star <= value ? 'text-[#925f3c]' : 'text-[#e8ddd5]'} aria-hidden="true">★</span>)}
        </span>;
    }

    return <div className="inline-flex items-center" role="radiogroup" aria-label={label}>
        {stars.map(star => <button key={star} type="button" role="radio" aria-checked={star === value} aria-label={`${star} out of 5 stars`} onClick={() => onChange?.(star)} className={`flex min-h-[44px] min-w-[44px] items-center justify-center ${sizeClasses[size]} leading-none text-[#925f3c] transition-colors hover:text-[#657b35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#657b35]`}>
            <span aria-hidden="true">{star <= value ? '★' : '☆'}</span>
        </button>)}
    </div>;
};

export default StarRating;
