import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    onClick,
    ...props
}) => {
    let variantClasses = '';

    switch (variant) {
        case 'primary':
            variantClasses = 'bg-[#657b35] text-white hover:bg-[#798e3a]';
            break;
        case 'secondary':
            variantClasses = 'bg-transparent border border-[#e8ddd5] text-[#68361c] hover:bg-[#f5f0eb]';
            break;
        case 'danger':
            variantClasses = 'bg-red-600 text-white hover:bg-red-700';
            break;
        case 'ghost':
            variantClasses = 'bg-transparent text-[#68361c] hover:bg-[#f0ebe4] hover:text-[#4b2311]';
            break;
    }

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-all hover:scale-[1.02] outline-none border-none ${variantClasses} ${className}`}
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
