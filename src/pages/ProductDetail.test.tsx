import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import ProductDetail from './ProductDetail';
import { incrementProductView } from '@/services/api/products';

vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        openLoginModal: vi.fn(),
        isAdmin: false,
    }),
}));

vi.mock('@/context/CartContext', () => ({
    useCart: () => ({ addToCart: vi.fn() }),
}));

vi.mock('@/components/product/ProductInfoCard', () => ({
    default: ({ viewCount }: { viewCount: number }) => (
        <div data-testid="detail-view-count">{viewCount}</div>
    ),
}));

vi.mock('@/components/reviews/ProductReviews', () => ({
    default: () => null,
}));

vi.mock('@/services/api/products', () => ({
    incrementProductView: vi.fn(),
}));

const mockedIncrementProductView = vi.mocked(incrementProductView);

const product = {
    id: 'product-1',
    categoryId: 'category-1',
    name: 'Test product',
    slug: 'test-product',
    sku: 'TEST-001',
    price: 125000,
    viewCount: 125,
    images: [],
};

describe('ProductDetail view count', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        mockedIncrementProductView.mockResolvedValue(126);
        vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
            const url = String(input);
            const data = url.includes('/slug/')
                ? { success: true, data: product }
                : { success: true, data: [] };
            return new Response(JSON.stringify(data), { status: 200 });
        });
    });

    it('registers one view per detail open under StrictMode and shows the returned count', async () => {
        render(
            <React.StrictMode>
                <LanguageProvider>
                    <MemoryRouter initialEntries={['/products/test-product']}>
                        <Routes>
                            <Route path="/products/:slug" element={<ProductDetail />} />
                        </Routes>
                    </MemoryRouter>
                </LanguageProvider>
            </React.StrictMode>,
        );

        await waitFor(() => expect(mockedIncrementProductView).toHaveBeenCalledTimes(1));
        expect(mockedIncrementProductView).toHaveBeenCalledWith('product-1');
        expect(await screen.findByTestId('detail-view-count')).toHaveTextContent('126');
    });
});
