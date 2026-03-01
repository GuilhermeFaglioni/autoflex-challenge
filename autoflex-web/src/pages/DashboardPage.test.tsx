import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { DashboardPage } from './DashboardPage';
import { vi } from 'vitest';
import * as productionHooks from '../hooks/useProduction';
import userEvent from '@testing-library/user-event';

describe('DashboardPage', () => {
    it('renders loading state initially', () => {
        render(<DashboardPage />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders production suggestions after loading', async () => {
        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText(/5 units/)).toBeInTheDocument();

        const valueElements = screen.getAllByText(/500/);
        expect(valueElements.length).toBeGreaterThanOrEqual(1);
    });

    it('handles recalculate button click successfully', async () => {
        const user = userEvent.setup();

        const mockRefetch = vi.fn().mockResolvedValue({});

        const spy = vi.spyOn(productionHooks, 'useProductionSuggestion').mockReturnValue({
            data: { suggestions: [], totalExpectedValue: 0 },
            isLoading: false,
            isError: false,
            error: null,
            refetch: mockRefetch,
        } as any);

        render(<DashboardPage />);

        const recalculateBtn = screen.getByRole('button', { name: /Recalculate Yield/i });
        await user.click(recalculateBtn);

        expect(mockRefetch).toHaveBeenCalled();

        spy.mockRestore();
    });

    it('renders empty state correctly when no suggestions are available', async () => {

        const spy = vi.spyOn(productionHooks, 'useProductionSuggestion').mockReturnValue({
            data: { suggestions: [], totalExpectedValue: 0 },
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn(),
        } as any);

        render(<DashboardPage />);

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        const zeroValues = screen.getAllByText(/0,00/);
        expect(zeroValues.length).toBeGreaterThan(0);

        const itemsToProduce = screen.getAllByText(/^0$/);
        expect(itemsToProduce.length).toBeGreaterThan(0);

        expect(screen.queryByText('Test Product')).not.toBeInTheDocument();

        spy.mockRestore();
    });

});
