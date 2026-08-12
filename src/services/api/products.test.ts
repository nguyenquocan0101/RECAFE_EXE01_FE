import { incrementProductView } from './products';

describe('product API', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns the new view count from the backend envelope', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
            success: true,
            data: { viewCount: 126 },
        }), { status: 200 }));

        await expect(incrementProductView('product/one')).resolves.toBe(126);
        expect(fetch).toHaveBeenCalledWith('/api/products/product%2Fone/view', { method: 'POST' });
    });

    it('surfaces backend errors', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
            message: 'Product not found.',
        }), { status: 404 }));

        await expect(incrementProductView('missing-product')).rejects.toThrow('Product not found.');
    });
});
