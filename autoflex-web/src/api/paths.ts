export const API_PATHS = {
    RAW_MATERIALS: {
        BASE: '/api/raw-materials',
        BY_ID: (id: number | string) => `/api/raw-materials/${id}`,
        SEARCH: '/api/raw-materials/search',
        BY_CODE: (code: string) => `/api/raw-materials/code/${code}`,
        BY_NAME: (name: string) => `/api/raw-materials/name/${name}`,
    },
    PRODUCTS: {
        BASE: '/api/products',
        BY_ID: (id: number | string) => `/api/products/${id}`,
        SEARCH: '/api/products/search',
        MATERIALS: (id: number | string) => `/api/products/${id}/materials`,
        MATERIAL_BY_CODE: (id: number | string, materialCode: string) => `/api/products/${id}/materials/${materialCode}`,
    },
    PRODUCTION: {
        SUGGEST: '/api/production/suggest',
    }
};
