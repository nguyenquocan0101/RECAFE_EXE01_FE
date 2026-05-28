import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart as clearCartApi } from '../services/api/cart'
import { useToast } from './ToastContext'
import { useAuth } from './AuthContext'
import { useLanguage } from './LanguageContext'

export interface CartItem {
    id: string; // backend cart item ID
    productId: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    image: string;
    quantity: number;
    material?: string;
    size?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    isLoading: boolean;
    addToCart: (item: Omit<CartItem, 'quantity' | 'id'> & { id: string }, quantity: number) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const { token } = useAuth();
    const { language } = useLanguage();

    const fetchCart = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const res = await getCart();
            if (res && res.data && res.data.cartItems) {
                const mappedItems = res.data.cartItems.map((item: any) => ({
                    id: item.id,
                    productId: item.productId || item.product?.id,
                    name: item.productName || item.product?.name || 'Product',
                    slug: item.product?.slug || '',
                    price: item.unitPrice || item.product?.price || 0,
                    salePrice: item.product?.salePrice || null,
                    image: item.productThumbnail || item.product?.images?.[0]?.imageUrl || '/assets/re_cup.png',
                    quantity: item.quantity,
                    material: 'Standard',
                    size: 'Standard'
                }));
                setCartItems(mappedItems);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Load cart reactively when token changes (login/logout).
    useEffect(() => {
        if (token) {
            fetchCart();
            // Handle pending guest cart action
            const pendingActionStr = sessionStorage.getItem('pending_cart_action');
            if (pendingActionStr) {
                try {
                    const action = JSON.parse(pendingActionStr);
                    sessionStorage.removeItem('pending_cart_action');
                    
                    // Delay slightly to let fetchCart run or just perform addition
                    setTimeout(async () => {
                        try {
                            await addCartItem(action.item.id, action.quantity);
                            await fetchCart(); // Refresh cart from server
                            
                            showToast(
                                language === 'vi' 
                                    ? `Đã thêm ${action.item.name} vào giỏ` 
                                    : `Added ${action.item.name} to cart`, 
                                'success'
                            );
                            
                            if (action.buyNow) {
                                window.dispatchEvent(new CustomEvent('app-redirect', { detail: '/checkout' }));
                            } else if (action.page === 'detail') {
                                window.dispatchEvent(new CustomEvent('trigger-fly-to-cart'));
                            }
                        } catch (err: any) {
                            console.error("Failed to execute pending cart action:", err);
                            showToast(err.message || 'Failed to add item to cart', 'error');
                        }
                    }, 500);
                } catch (e) {
                    console.error("Error parsing pending cart action", e);
                }
            }
        } else {
            setCartItems([]);
        }
    }, [token, language]);

    const addToCart = async (newItem: Omit<CartItem, 'quantity' | 'id'> & { id: string }, quantity: number) => {
        try {
            setIsLoading(true);
            // newItem.id passed from ProductDetail is actually the productId
            await addCartItem(newItem.id, quantity);
            await fetchCart(); // Refresh cart from server
        } catch (error: any) {
            console.error("Failed to add to cart:", error);
            showToast(error.message || 'Failed to add item to cart', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (id: string) => {
        try {
            setIsLoading(true);
            await removeCartItem(id);
            await fetchCart();
        } catch (error: any) {
            console.error("Failed to remove from cart:", error);
            showToast(error.message || 'Failed to remove item', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const updateQuantity = async (id: string, quantity: number) => {
        if (quantity <= 0) {
            return removeFromCart(id);
        }
        
        try {
            setIsLoading(true);
            await updateCartItem(id, quantity);
            await fetchCart();
        } catch (error: any) {
            console.error("Failed to update quantity:", error);
            showToast(error.message || 'Failed to update quantity', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = async () => {
        try {
            setIsLoading(true);
            await clearCartApi();
            setCartItems([]);
        } catch (error: any) {
            console.error("Failed to clear cart:", error);
            showToast(error.message || 'Failed to clear cart', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartTotal = cartItems.reduce((sum, item) => {
        const activePrice = item.salePrice && item.salePrice > 0 ? item.salePrice : item.price;
        return sum + (activePrice * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            cartTotal,
            isLoading,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
