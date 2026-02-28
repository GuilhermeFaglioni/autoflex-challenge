import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';
import { API_PATHS } from '../api/paths';
import type { RawMaterial, RawMaterialRequestDTO } from '../types';

export const RAW_MATERIALS_QUERY_KEY = ['raw-materials'];

export const useRawMaterials = () => {
    return useQuery({
        queryKey: RAW_MATERIALS_QUERY_KEY,
        queryFn: async () => {
            const { data } = await api.get<RawMaterial[]>(API_PATHS.RAW_MATERIALS.BASE);
            return data;
        },
    });
};

export const useRawMaterial = (id?: number) => {
    return useQuery({
        queryKey: [...RAW_MATERIALS_QUERY_KEY, id],
        queryFn: async () => {
            if (!id) return null;
            const { data } = await api.get<RawMaterial>(API_PATHS.RAW_MATERIALS.BY_ID(id));
            return data;
        },
        enabled: !!id,
    });
};

export const useSearchRawMaterials = (query: string) => {
    return useQuery({
        queryKey: [...RAW_MATERIALS_QUERY_KEY, 'search', query],
        queryFn: async () => {
            const { data } = await api.get<RawMaterial[]>(API_PATHS.RAW_MATERIALS.SEARCH, {
                params: { q: query }
            });
            return data;
        },
        enabled: query.length > 0,
    });
};

export const useCreateRawMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newMaterial: RawMaterialRequestDTO) => {
            const { data } = await api.post<RawMaterial>(API_PATHS.RAW_MATERIALS.BASE, newMaterial);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RAW_MATERIALS_QUERY_KEY });
        },
    });
};

export const useUpdateRawMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, material }: { id: number; material: RawMaterialRequestDTO }) => {
            const { data } = await api.put<RawMaterial>(API_PATHS.RAW_MATERIALS.BY_ID(id), material);
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: RAW_MATERIALS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: [...RAW_MATERIALS_QUERY_KEY, data.id] });
        },
    });
};

export const useDeleteRawMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(API_PATHS.RAW_MATERIALS.BY_ID(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: RAW_MATERIALS_QUERY_KEY });
        },
    });
};
