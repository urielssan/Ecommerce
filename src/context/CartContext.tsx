import React, { createContext, useState, useEffect, useContext } from 'react';
import { Product, CartItem } from '../types';

// ... existing code ...
interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    decreaseQuantity: (productId: number) => void;
    clearCart: () => void;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product: Product, quantity = 1) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.idProductos === product.idProductos);
            if (existingItem) {
                return currentCart.map(item =>
                    item.idProductos === product.idProductos
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...currentCart, { ...product, quantity }];
        });
    };

    const decreaseQuantity = (productId: number) => {
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.idProductos === productId);
            if (existingItem?.quantity === 1) {
                return currentCart.filter(item => item.idProductos !== productId);
            }
            return currentCart.map(item =>
                item.idProductos === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(currentCart => currentCart.filter(item => item.idProductos !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, decreaseQuantity, clearCart, totalItems }}>
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
