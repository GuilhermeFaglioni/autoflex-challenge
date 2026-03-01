import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    Tooltip,
    Fade,
    CircularProgress,
    Card,
    CardContent,
    Chip,
    alpha,
    useTheme,
    Divider,
    MenuItem,
    Grid,
    Stack
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Inventory as InventoryIcon,
    DeleteOutline as DeleteOutlineIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import type { Product, ProductMaterial, ProductRequestDTO, ProductMaterialRequestDTO } from '../types';
import { useAppDispatch } from '../store/hooks';
import { showNotification } from '../store/slices/uiSlice';
import {
    useProducts,
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useSyncProductMaterials
} from '../hooks/useProducts';
import { useRawMaterials } from '../hooks/useRawMaterials';



export function ProductsPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const { data: products = [], isLoading: loading, refetch } = useProducts();
    const { data: availableRawMaterials = [] } = useRawMaterials();

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();
    const syncMaterialsMutation = useSyncProductMaterials();

    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const formLoading = createMutation.isPending ||
        updateMutation.isPending ||
        syncMaterialsMutation.isPending ||
        deleteMutation.isPending;

    const [formValues, setFormValues] = useState<ProductRequestDTO>({
        code: '',
        name: '',
        price: 0
    });
    const [selectedMaterials, setSelectedMaterials] = useState<ProductMaterial[]>([]);

    const [currentMaterialId, setCurrentMaterialId] = useState<number | ''>('');
    const [currentQuantity, setCurrentQuantity] = useState<number | ''>(1);

    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return products;
        const q = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q)
        );
    }, [products, searchTerm]);

    const handleRefresh = () => {
        refetch();
        dispatch(showNotification({ message: 'Catalog updated', severity: 'info' }));
    };

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormValues({
                code: product.code,
                name: product.name,
                price: product.price
            });
            setSelectedMaterials([...product.materials]);
        } else {
            setEditingProduct(null);
            setFormValues({
                code: '',
                name: '',
                price: 0
            });
            setSelectedMaterials([]);
        }
        setCurrentMaterialId('');
        setCurrentQuantity(1);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingProduct(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) || 0 : value
        }));
    };

    const handleAddMaterial = () => {
        if (currentMaterialId === '' || currentQuantity === '' || currentQuantity < 1) return;

        const rawMaterial = availableRawMaterials.find(m => m.id === currentMaterialId);
        if (!rawMaterial) return;

        const exists = selectedMaterials.find(m => m.rawMaterial.id === rawMaterial.id);
        if (exists) {
            dispatch(showNotification({ message: 'Material already added', severity: 'warning' }));
            return;
        }

        const newProductMaterial: ProductMaterial = {
            id: Date.now(),
            rawMaterial: rawMaterial,
            quantityNeeded: Math.floor(currentQuantity as number)
        };

        setSelectedMaterials([...selectedMaterials, newProductMaterial]);
        setCurrentMaterialId('');
        setCurrentQuantity(1);
    };

    const handleRemoveMaterial = (tempId: number) => {
        setSelectedMaterials(selectedMaterials.filter(m => m.id !== tempId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let productId: number;

            if (editingProduct) {
                productId = editingProduct.id;
                await updateMutation.mutateAsync({
                    id: productId,
                    product: formValues
                });
            } else {
                const newProduct = await createMutation.mutateAsync(formValues);
                productId = newProduct.id;
            }

            const materialDTOs: ProductMaterialRequestDTO[] = selectedMaterials.map(sm => ({
                rawMaterialCode: sm.rawMaterial.code,
                quantityNeeded: sm.quantityNeeded
            }));

            await syncMaterialsMutation.mutateAsync({
                id: productId,
                materials: materialDTOs
            });

            dispatch(showNotification({
                message: editingProduct ? 'Product updated successfully' : 'Product created successfully',
                severity: 'success'
            }));

            handleCloseDialog();
        } catch (error) {
            dispatch(showNotification({
                message: 'Error saving product and associations',
                severity: 'error'
            }));
        }
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await deleteMutation.mutateAsync(productToDelete.id);
            dispatch(showNotification({ message: 'Product removed', severity: 'warning' }));
            setConfirmDeleteOpen(false);
            setProductToDelete(null);
        } catch (error) {
            dispatch(showNotification({ message: 'Error deleting product', severity: 'error' }));
        }
    };

    return (
        <Fade in timeout={500}>
            <Box>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
                            Products
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your finished products and material associations
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1.5,
                            boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
                        }}
                    >
                        New Product
                    </Button>
                </Box>

                <Card sx={{ mb: 4, borderRadius: 2, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                placeholder="Search by name or code..."
                                fullWidth
                                variant="outlined"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }
                                }}
                            />
                            <Tooltip title="Refresh Catalog">
                                <IconButton onClick={handleRefresh} disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </CardContent>
                </Card>

                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'auto' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Composition</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={40} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                        <InventoryIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.disabled, 0.2), mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">No products found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id} sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                                        <TableCell>
                                            <Chip label={product.code} variant="outlined" size="small" sx={{ fontWeight: 'bold' }} />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{product.name}</TableCell>
                                        <TableCell>
                                            <Typography fontWeight={700} color="primary.main">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                {product.materials.length > 0 ? (
                                                    product.materials.map(pm => (
                                                        <Tooltip key={pm.id} title={`${pm.quantityNeeded} units of ${pm.rawMaterial.name}`}>
                                                            <Chip
                                                                label={pm.rawMaterial.code}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.7rem' }}
                                                            />
                                                        </Tooltip>
                                                    ))
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">No materials</Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleOpenDialog(product)} color="primary">
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(product)} sx={{ color: 'error.light' }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog
                    open={dialogOpen}
                    onClose={!formLoading ? handleCloseDialog : undefined}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 0 }}>
                        {editingProduct ? 'Edit Product' : 'New Product'}
                    </DialogTitle>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 3, mb: 2 }}>
                        Fill in the product details and associate required materials.
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <DialogContent dividers sx={{ border: 'none', pt: 1 }}>
                            <Grid container spacing={4}>
                                <Grid size={{ xs: 12, md: 5 }}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                                        General Information
                                    </Typography>
                                    <Stack spacing={2.5}>
                                        <TextField
                                            name="code"
                                            label="Product Code"
                                            fullWidth
                                            required
                                            value={formValues.code}
                                            onChange={handleInputChange}
                                            placeholder="e.g. PRD-001"
                                            disabled={formLoading}
                                        />
                                        <TextField
                                            name="name"
                                            label="Product Name"
                                            fullWidth
                                            required
                                            value={formValues.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Master Bracket"
                                            disabled={formLoading}
                                        />
                                        <TextField
                                            name="price"
                                            label="Selling Price"
                                            type="number"
                                            fullWidth
                                            required
                                            value={formValues.price}
                                            onChange={handleInputChange}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                            }}
                                            disabled={formLoading}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 1 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                                    <Divider orientation="vertical" />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                                        Bill of Materials (BOM)
                                    </Typography>

                                    <Box sx={{
                                        p: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.8),
                                        borderRadius: 2,
                                        mb: 2,
                                        border: `1px solid ${theme.palette.divider}`
                                    }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid size={{ xs: 12, sm: 7 }}>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    label="Select Material"
                                                    value={currentMaterialId}
                                                    onChange={(e) => setCurrentMaterialId(Number(e.target.value))}
                                                >
                                                    {availableRawMaterials.map((option) => (
                                                        <MenuItem key={option.id} value={option.id}>
                                                            {option.name} ({option.code})
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 3 }}>
                                                <TextField
                                                    label="Qty"
                                                    type="number"
                                                    size="small"
                                                    fullWidth
                                                    value={currentQuantity}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setCurrentQuantity(val === '' ? '' : parseInt(val));
                                                    }}
                                                    inputProps={{ min: 1 }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 6, sm: 2 }}>
                                                <IconButton
                                                    color="primary"
                                                    onClick={handleAddMaterial}
                                                    disabled={currentMaterialId === '' || currentQuantity === '' || currentQuantity < 1}
                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <TableContainer sx={{ maxHeight: 250, overflow: 'auto' }}>
                                        <Table size="small" stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Material</TableCell>
                                                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Qty</TableCell>
                                                    <TableCell align="right"></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedMaterials.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                                                            No materials added yet
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    selectedMaterials.map((m) => (
                                                        <TableRow key={m.id}>
                                                            <TableCell>
                                                                <Typography variant="body2" fontWeight={500}>{m.rawMaterial.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{m.rawMaterial.code}</Typography>
                                                            </TableCell>
                                                            <TableCell>{m.quantityNeeded}</TableCell>
                                                            <TableCell align="right">
                                                                <IconButton size="small" color="error" onClick={() => handleRemoveMaterial(m.id)}>
                                                                    <DeleteOutlineIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.3) }}>
                            <Button onClick={handleCloseDialog} disabled={formLoading} color="inherit">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={formLoading}
                                sx={{ borderRadius: 2, px: 4 }}
                                startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {editingProduct ? 'Save Changes' : 'Create Product'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Dialog
                    open={confirmDeleteOpen}
                    onClose={() => !deleteMutation.isPending && setConfirmDeleteOpen(false)}
                    PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <WarningIcon color="error" />
                        Confirm Deletion
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to delete <strong>{productToDelete?.name}</strong>?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button
                            onClick={() => setConfirmDeleteOpen(false)}
                            disabled={deleteMutation.isPending}
                            variant="text"
                            color="inherit"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmDelete}
                            variant="contained"
                            color="error"
                            disabled={deleteMutation.isPending}
                            startIcon={deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                            sx={{ borderRadius: 2, px: 3 }}
                        >
                            Delete Product
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
}
