import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { API_PATHS } from '../api/paths';
import type { Product, ProductRequestDTO, ProductMaterialRequestDTO } from '../types';

export const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = () => {
    return useQuery({
        queryKey: PRODUCTS_QUERY_KEY,
        queryFn: async () => {
            const { data } = await api.get<Product[]>(API_PATHS.PRODUCTS.BASE);
            return data;
        },
    });
};

export const useProduct = (id?: number) => {
    return useQuery({
        queryKey: [...PRODUCTS_QUERY_KEY, id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get<Product>(API_PATHS.PRODUCTS.BY_ID(id));
            return data;
        },
        enabled: !!id,
    });
};

export const useSearchProducts = (query: string) => {
    return useQuery({
        queryKey: [...PRODUCTS_QUERY_KEY, 'search', query],
        queryFn: async () => {
            const { data } = await api.get<Product[]>(API_PATHS.PRODUCTS.SEARCH, {
                params: { q: query }
            });
            return data;
        },
        enabled: query.length > 0,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newProduct: ProductRequestDTO) => {
            const { data } = await api.post<Product>(API_PATHS.PRODUCTS.BASE, newProduct);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, product }: { id: number; product: ProductRequestDTO }) => {
            const { data } = await api.put<Product>(API_PATHS.PRODUCTS.BY_ID(id), product);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, data.id] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(API_PATHS.PRODUCTS.BY_ID(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
        },
    });
};

export const useSyncProductMaterials = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, materials }: { id: number; materials: ProductMaterialRequestDTO[] }) => {
            const { data } = await api.put<Product>(API_PATHS.PRODUCTS.MATERIALS(id), materials);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, variables.id] });
        },
    });
};
