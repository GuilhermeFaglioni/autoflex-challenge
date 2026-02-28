import { useQuery } from '@tanstack/react-query';
import api from '../api/api';
import { API_PATHS } from '../api/paths';
import type { ProductionSuggestionResponseDTO } from '../types';

export const PRODUCTION_QUERY_KEY = ['production'];

export const useProductionSuggestion = () => {
    return useQuery({
        queryKey: [...PRODUCTION_QUERY_KEY, 'suggestion'],
        queryFn: async () => {
            const { data } = await api.get<ProductionSuggestionResponseDTO>(API_PATHS.PRODUCTION.SUGGEST);
            return data;
        },
    });
};
