import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get('/api/products', () => {
        return HttpResponse.json([
            {
                id: 1,
                name: 'Test Product',
                code: 'TP001',
                price: 150.0,
                materials: [
                    {
                        id: 101,
                        rawMaterial: { id: 1, name: 'Test Material', code: 'TM001' },
                        quantityNeeded: 2
                    }
                ]
            }
        ]);
    }),

    http.post('/api/products', async ({ request }) => {
        const newItem = await request.json() as any;
        return HttpResponse.json({ id: 2, ...newItem, materials: [] }, { status: 201 });
    }),

    http.put('/api/products/:id', async ({ request, params }) => {
        const updatedItem = await request.json() as any;
        return HttpResponse.json({ id: params.id, ...updatedItem, materials: [] });
    }),

    http.delete('/api/products/:id', () => {
        return new HttpResponse(null, { status: 204 });
    }),

    http.put('/api/products/:id/materials', async ({ request, params }) => {
        const materials = await request.json() as any;
        return HttpResponse.json({ id: params.id, materials });
    }),

    http.get('/api/raw-materials', () => {
        return HttpResponse.json([
            {
                id: 1,
                name: 'Test Material',
                code: 'TM001',
                stockQuantity: 10
            }
        ]);
    }),

    http.post('/api/raw-materials', async ({ request }) => {
        const newItem = await request.json() as any;
        return HttpResponse.json({ id: 2, ...newItem }, { status: 201 });
    }),

    http.put('/api/raw-materials/:id', async ({ request, params }) => {
        const updatedItem = await request.json() as any;
        return HttpResponse.json({ id: params.id, ...updatedItem });
    }),

    http.delete('/api/raw-materials/:id', () => {
        return new HttpResponse(null, { status: 204 });
    }),

    http.get('/api/production/suggest', () => {
        return HttpResponse.json({
            suggestions: [
                {
                    productId: 1,
                    productName: 'Test Product',
                    suggestedQuantity: 5,
                    subtotalValue: 500
                }
            ],
            totalExpectedValue: 500
        });
    }),
];
