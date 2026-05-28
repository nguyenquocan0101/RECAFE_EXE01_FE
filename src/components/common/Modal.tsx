import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    zIndex?: number;
    closeOnOverlayClick?: boolean;
    className?: string; // Optional extra classes for the backdrop wrapper
    style?: React.CSSProperties; // Optional extra styles for backdrop wrapper
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    zIndex = 50,
    closeOnOverlayClick = false,
    className = "",
    style = {},
}) => {
    // Disable background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div
            className={`fixed inset-0 flex items-center justify-center bg-transparent p-4 overflow-y-auto ${className}`}
            style={{ zIndex, ...style }}
            onClick={handleBackdropClick}
        >
            {children}
        </div>,
        document.body
    );
};

export default Modal;
