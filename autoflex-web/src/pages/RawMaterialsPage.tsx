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
    useTheme
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Inventory as InventoryIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import type { RawMaterial, RawMaterialRequestDTO } from '../types';
import { useAppDispatch } from '../store/hooks';
import { showNotification } from '../store/slices/uiSlice';
import {
    useRawMaterials,
    useCreateRawMaterial,
    useUpdateRawMaterial,
    useDeleteRawMaterial
} from '../hooks/useRawMaterials';



export function RawMaterialsPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const { data: materials = [], isLoading: loading, refetch } = useRawMaterials();
    const createMutation = useCreateRawMaterial();
    const updateMutation = useUpdateRawMaterial();
    const deleteMutation = useDeleteRawMaterial();

    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<RawMaterial | null>(null);

    const formLoading = createMutation.isPending || updateMutation.isPending;

    const [formValues, setFormValues] = useState<Omit<RawMaterialRequestDTO, 'stockQuantity'> & { stockQuantity: number | '' }>({
        code: '',
        name: '',
        stockQuantity: 0
    });

    const filteredMaterials = useMemo(() => {
        if (!searchTerm.trim()) return materials;
        const q = searchTerm.toLowerCase();
        return materials.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.code.toLowerCase().includes(q)
        );
    }, [materials, searchTerm]);

    const handleRefresh = () => {
        refetch();
        dispatch(showNotification({ message: 'Inventory updated', severity: 'info' }));
    };

    const handleOpenDialog = (material?: RawMaterial) => {
        if (material) {
            setEditingMaterial(material);
            setFormValues({
                code: material.code,
                name: material.name,
                stockQuantity: material.stockQuantity
            });
        } else {
            setEditingMaterial(null);
            setFormValues({
                code: '',
                name: '',
                stockQuantity: 0
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingMaterial(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({
            ...prev,
            [name]: name === 'stockQuantity' ? (value === '' ? '' : parseInt(value)) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingMaterial) {
                await updateMutation.mutateAsync({
                    id: editingMaterial.id,
                    material: formValues as RawMaterialRequestDTO
                });
                dispatch(showNotification({ message: 'Material updated successfully', severity: 'success' }));
            } else {
                await createMutation.mutateAsync(formValues as RawMaterialRequestDTO);
                dispatch(showNotification({ message: 'Material created successfully', severity: 'success' }));
            }
            handleCloseDialog();
        } catch (error) {
            dispatch(showNotification({
                message: 'Error saving material',
                severity: 'error'
            }));
        }
    };

    const handleDeleteClick = (material: RawMaterial) => {
        setMaterialToDelete(material);
        setConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!materialToDelete) return;

        try {
            await deleteMutation.mutateAsync(materialToDelete.id);
            dispatch(showNotification({ message: 'Material removed from inventory', severity: 'warning' }));
            setConfirmDeleteOpen(false);
            setMaterialToDelete(null);
        } catch (error: any) {
            const errorMessage = error.response?.status === 500
                ? "This Raw Material cannot be deleted because it is linked to one or more products."
                : "Error deleting material. Please try again later.";

            dispatch(showNotification({
                message: errorMessage,
                severity: 'error'
            }));
            setConfirmDeleteOpen(false);
            setMaterialToDelete(null);
        }
    };

    return (
        <Fade in timeout={500}>
            <Box>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
                            Raw Materials
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage your inventory's core components
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
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
                            '&:hover': {
                                boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.23)}`,
                            }
                        }}
                    >
                        New Material
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
                            <Tooltip title="Refresh Inventory">
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
                                <TableCell sx={{ fontWeight: 600 }}>Stock Quantity</TableCell>
                                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={40} />
                                        <Typography sx={{ mt: 2 }} color="text.secondary">Loading inventory data...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredMaterials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <InventoryIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.disabled, 0.2), mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary">No materials found</Typography>
                                        <Typography variant="body2" color="text.disabled">Try adjusting your search or add a new material.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMaterials.map((material) => (
                                    <TableRow
                                        key={material.id}
                                        sx={{
                                            '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        <TableCell>
                                            <Chip
                                                label={material.code}
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    fontFamily: 'monospace',
                                                    borderRadius: 1,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    borderColor: alpha(theme.palette.primary.main, 0.2)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>{material.name}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {material.stockQuantity < 10 && (
                                                    <Tooltip title="Low stock alert!">
                                                        <WarningIcon color="warning" fontSize="small" />
                                                    </Tooltip>
                                                )}
                                                <Typography
                                                    color={material.stockQuantity < 10 ? 'warning.main' : 'text.primary'}
                                                    fontWeight={material.stockQuantity < 10 ? 700 : 500}
                                                >
                                                    {material.stockQuantity.toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">units</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleOpenDialog(material)}
                                                sx={{
                                                    color: 'primary.main',
                                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteClick(material)}
                                                sx={{
                                                    color: alpha(theme.palette.error.main, 0.7),
                                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                }}
                                            >
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
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3, p: 1 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>
                        {editingMaterial ? 'Edit Material' : 'New Raw Material'}
                    </DialogTitle>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 3, mb: 2 }}>
                        Please fill in the details of the component below.
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <DialogContent dividers sx={{ border: 'none', pt: 1 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    name="code"
                                    label="Material Code"
                                    fullWidth
                                    required
                                    value={formValues.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g. METAL-001"
                                    disabled={formLoading}
                                    autoFocus
                                />
                                <TextField
                                    name="name"
                                    label="Component Name"
                                    fullWidth
                                    required
                                    value={formValues.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Stainless Steel Plate"
                                    disabled={formLoading}
                                />
                                <TextField
                                    name="stockQuantity"
                                    label="Initial Stock Quantity"
                                    type="number"
                                    fullWidth
                                    required
                                    value={formValues.stockQuantity}
                                    onChange={handleInputChange}
                                    inputProps={{ min: 0, step: "1" }}
                                    disabled={formLoading}
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, gap: 1 }}>
                            <Button
                                onClick={handleCloseDialog}
                                disabled={formLoading}
                                variant="text"
                                color="inherit"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={formLoading || formValues.stockQuantity === '' || formValues.stockQuantity < 0}
                                startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : null}
                                sx={{ borderRadius: 2, px: 4 }}
                            >
                                {editingMaterial ? 'Apply Changes' : 'Create Material'}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Dialog
                    open={confirmDeleteOpen}
                    onClose={() => !deleteMutation.isPending && setConfirmDeleteOpen(false)}
                    PaperProps={{
                        sx: { borderRadius: 3, p: 1 }
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <WarningIcon color="error" />
                        Confirm Deletion
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Are you sure you want to delete <strong>{materialToDelete?.name}</strong>?
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
                            Delete Material
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Fade>
    );
}
