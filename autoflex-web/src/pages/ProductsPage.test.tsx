import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '../test/test-utils';
import { ProductsPage } from './ProductsPage';
import userEvent from '@testing-library/user-event';

describe('ProductsPage', () => {
    it('renders list of products and their materials', async () => {
        render(<ProductsPage />);
        await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
        expect(screen.getByText('TP001')).toBeInTheDocument();
        expect(screen.getByText(/150,00/)).toBeInTheDocument();
        expect(screen.getByText('TM001')).toBeInTheDocument();
    });

    it('opens dialog to create new product and handles BOM selection', async () => {
        const user = userEvent.setup();
        render(<ProductsPage />);

        await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());

        const addButton = screen.getByText(/New Product/i);
        await user.click(addButton);

        const dialog = screen.getByRole('dialog');

        await user.type(within(dialog).getByLabelText(/Product Name/i), 'Golden Engine');
        await user.type(within(dialog).getByLabelText(/Product Code/i), 'GE-01');
        await user.type(within(dialog).getByLabelText(/Selling Price/i), '1200');

        const selectTrigger = within(dialog).getByLabelText(/Select Material/i);
        await user.click(selectTrigger);

        const option = await screen.findByRole('option', { name: /Test Material/i });
        await user.click(option);

        await waitFor(() => {
            expect(within(dialog).getByLabelText(/Select Material/i)).toHaveTextContent(/Test Material/i);
        });

        const qtyInput = within(dialog).getByLabelText(/Qty/i);
        await user.clear(qtyInput);
        await user.type(qtyInput, '5');

        const addBtn = within(dialog).getAllByRole('button').find(btn =>
            btn.innerHTML.includes('AddIcon') || btn.querySelector('[data-testid="AddIcon"]')
        ) as HTMLElement;

        await user.click(addBtn);

        await waitFor(() => {
            const table = within(dialog).getByRole('table');
            expect(within(table).getByText('Test Material')).toBeInTheDocument();
            expect(within(table).getByText('5')).toBeInTheDocument();
        }, { timeout: 4000 });

        const createBtn = within(dialog).getByRole('button', { name: /Create Product/i });
        await user.click(createBtn);

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        }, { timeout: 4000 });
    });

    it('opens edit dialog, modifies data and removes an associated material', async () => {
        const user = userEvent.setup();
        render(<ProductsPage />);

        await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

        const editIcon = screen.getByTestId('EditIcon');
        const editButton = editIcon.closest('button')!;
        await user.click(editButton);

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText('Edit Product')).toBeInTheDocument();

        const nameInput = within(dialog).getByLabelText(/Product Name/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Product Name');

        const bomTable = within(dialog).getByRole('table');
        expect(within(bomTable).getByText('Test Material')).toBeInTheDocument();

        const removeMaterialBtn = within(bomTable).getByTestId('DeleteOutlineIcon').closest('button')!;
        await user.click(removeMaterialBtn);

        expect(within(bomTable).getByText(/No materials added yet/i)).toBeInTheDocument();

        const saveButton = within(dialog).getByRole('button', { name: /Save Changes/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('opens delete confirmation dialog and confirms deletion', async () => {
        const user = userEvent.setup();
        render(<ProductsPage />);

        await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

        const deleteIcon = screen.getByTestId('DeleteIcon');
        const deleteButton = deleteIcon.closest('button')!;
        await user.click(deleteButton);

        const dialog = await screen.findByRole('dialog');
        expect(within(dialog).getByText(/Confirm Deletion/i)).toBeInTheDocument();

        expect(within(dialog).getByText('Test Product')).toBeInTheDocument();

        const confirmDeleteBtn = within(dialog).getByRole('button', { name: /Delete Product/i });
        await user.click(confirmDeleteBtn);

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    it('filters products based on search term', async () => {
        const user = userEvent.setup();
        render(<ProductsPage />);

        await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText(/Search by name or code/i);

        await user.type(searchInput, 'XYZ-INEXISTENTE');

        await waitFor(() => {
            expect(screen.getByText(/No products found/i)).toBeInTheDocument();
            expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
        });

        await user.clear(searchInput);
        await user.type(searchInput, 'Test Prod');

        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument();
            expect(screen.queryByText(/No products found/i)).not.toBeInTheDocument();
        });
    });
});
