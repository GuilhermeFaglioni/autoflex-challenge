import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '../test/test-utils';
import { RawMaterialsPage } from './RawMaterialsPage';
import userEvent from '@testing-library/user-event';

describe('RawMaterialsPage', () => {
    it('renders list of raw materials', async () => {
        render(<RawMaterialsPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Material')).toBeInTheDocument();
        });
        expect(screen.getByText('TM001')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('opens add material dialog and submits successfully', async () => {
        const user = userEvent.setup();
        render(<RawMaterialsPage />);

        // Wait for load
        await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

        // Click New Material
        const addButton = screen.getByText(/New Material/i);
        await user.click(addButton);

        // Fill form
        const nameInput = screen.getByLabelText(/Component Name/i);
        const codeInput = screen.getByLabelText(/Material Code/i);
        const stockInput = screen.getByLabelText(/Initial Stock Quantity/i);

        await user.type(nameInput, 'New Steel');
        await user.type(codeInput, 'ST001');
        await user.clear(stockInput);
        await user.type(stockInput, '100');

        // Submit
        const saveButton = screen.getByRole('button', { name: /Create Material/i });
        await user.click(saveButton);

        // Verification of dialog closing (or loading state)
        await waitFor(() => {
            expect(screen.queryByText(/New Raw Material/i)).not.toBeInTheDocument();
        });
    });

    it('opens edit material dialog, pre-populates data, and submits successfully', async () => {
        const user = userEvent.setup();
        render(<RawMaterialsPage />);

        await waitFor(() => expect(screen.getByText('Test Material')).toBeInTheDocument());

        const editIcon = screen.getByTestId('EditIcon');
        const editButton = editIcon.closest('button')!;
        await user.click(editButton);

        expect(await screen.findByText('Edit Material')).toBeInTheDocument();

        const stockInput = screen.getByLabelText(/Initial Stock Quantity/i);
        expect(stockInput).toHaveValue(10);

        await user.clear(stockInput);
        await user.type(stockInput, '50');

        const saveButton = screen.getByRole('button', { name: /Apply Changes/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.queryByText('Edit Material')).not.toBeInTheDocument();
        });
    });

    it('opens delete confirmation dialog and confirms deletion', async () => {
        const user = userEvent.setup();
        render(<RawMaterialsPage />);

        await waitFor(() => expect(screen.getByText('Test Material')).toBeInTheDocument());

        const deleteIcon = screen.getByTestId('DeleteIcon');
        const deleteButton = deleteIcon.closest('button')!;
        await user.click(deleteButton);

        const dialog = await screen.findByRole('dialog');

        expect(within(dialog).getByText(/Confirm Deletion/i)).toBeInTheDocument();
        expect(within(dialog).getByText('Test Material')).toBeInTheDocument();

        const confirmButton = within(dialog).getByRole('button', { name: /Delete Material/i });
        await user.click(confirmButton);

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});
