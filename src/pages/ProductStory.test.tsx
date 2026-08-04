import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { LanguageProvider } from '@/context/LanguageContext';
import ProductStory from './ProductStory';
import * as storyApi from '@/services/api/productStories';

vi.mock('@/services/api/productStories', async () => {
    const actual = await vi.importActual<typeof import('@/services/api/productStories')>('@/services/api/productStories');
    return { ...actual, getProductStory: vi.fn() };
});

const mockedGetProductStory = vi.mocked(storyApi.getProductStory);

const renderPage = () => render(
    <LanguageProvider>
        <MemoryRouter initialEntries={['/arabica-and-lamp']}>
            <Routes><Route path="/:storySlug" element={<ProductStory />} /></Routes>
        </MemoryRouter>
    </LanguageProvider>
);

describe('ProductStory', () => {
    beforeEach(() => {
        mockedGetProductStory.mockReset();
    });

    it('renders the localized public HTML and product link', async () => {
        mockedGetProductStory.mockResolvedValue({
            slug: 'arabica-and-lamp',
            productName: 'Lamp',
            productSlug: 'lamp',
            coffeeTypeName: 'Arabica',
            coffeeTypeSlug: 'arabica',
            contentHtmlVi: '<h2>VI story</h2>',
            contentHtmlEn: '<h2>EN story</h2>',
            landingPageUrl: 'https://www.recafe.site/arabica-and-lamp',
        });

        renderPage();
        expect(await screen.findByText('Lamp')).toBeInTheDocument();
        expect(screen.getByText('VI story')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Xem sản phẩm' })).toHaveAttribute('href', '/products/lamp');
    });

    it('shows a not found state for an unavailable story', async () => {
        mockedGetProductStory.mockRejectedValue(new storyApi.ApiRequestError('Not found', 404));
        renderPage();
        await waitFor(() => expect(screen.getByText('Không tìm thấy câu chuyện')).toBeInTheDocument());
        expect(screen.getByRole('link', { name: 'Về trang chủ' })).toHaveAttribute('href', '/');
    });
});
