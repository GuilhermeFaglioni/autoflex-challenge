import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    alpha,
    useTheme,
    Button,
    CircularProgress,
    Fade,
    Stack,
    Chip
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Inventory as InventoryIcon,
    Analytics as AnalyticsIcon,
    MonetizationOn as MoneyIcon,
    AutoFixHigh as SuggestIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../store/hooks';
import { showNotification } from '../store/slices/uiSlice';
import { useProductionSuggestion } from '../hooks/useProduction';



export function DashboardPage() {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    // API Hook
    const { data: suggestionData, isLoading: loading, refetch } = useProductionSuggestion();

    const handleRefresh = async () => {
        try {
            await refetch();
            dispatch(showNotification({ message: 'Production analysis complete', severity: 'success' }));
        } catch (error) {
            dispatch(showNotification({ message: 'Failed to refresh production analysis', severity: 'error' }));
        }
    };

    if (loading) {
        return (
            <Box sx={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                    Analyzing stock levels and calculating potential yield...
                </Typography>
            </Box>
        );
    }

    return (
        <Fade in timeout={800}>
            <Box>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, display: 'flex' }}>
                                <AnalyticsIcon color="primary" />
                            </Box>
                            <Typography variant="h4" fontWeight="800" color="text.primary">
                                Insights Dashboard
                            </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                            Suggested production optimization based on current raw material inventory
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<SuggestIcon />}
                        onClick={handleRefresh}
                        disabled={loading}
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : 'Recalculate Yield'}
                    </Button>
                </Box>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: '100%', borderRadius: 4, bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
                            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700, letterSpacing: 1.2 }}>
                                    Potential Revenue
                                </Typography>
                                <Typography variant="h3" fontWeight="800" sx={{ my: 1 }}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(suggestionData?.totalExpectedValue || 0)}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TrendingUpIcon fontSize="small" />
                                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                        Max yield from current stock
                                    </Typography>
                                </Stack>
                            </CardContent>
                            <MoneyIcon sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 160, opacity: 0.1, transform: 'rotate(-15deg)' }} />
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                            <CardContent>
                                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    Items to Produce
                                </Typography>
                                <Typography variant="h3" fontWeight="800" color="text.primary" sx={{ my: 1 }}>
                                    {suggestionData?.suggestions.reduce((acc, curr) => acc + curr.suggestedQuantity, 0)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total units across <b>{suggestionData?.suggestions.length}</b> product types
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12 }}>
                        <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                                <Typography variant="h6" fontWeight="700">Detailed Production Targets</Typography>
                            </Box>
                            <TableContainer sx={{ overflow: 'auto' }}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.8) }}>
                                            <TableCell colSpan={2} sx={{ fontWeight: 700 }}>Product</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Potential Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {suggestionData?.suggestions.map((item) => (
                                            <TableRow key={item.productId} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                <TableCell width={80}>
                                                    <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, width: 'fit-content' }}>
                                                        <InventoryIcon color="primary" fontSize="small" />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" fontWeight={600}>{item.productName}</Typography>
                                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                                        #{item.productCode}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={`${item.suggestedQuantity} units`}
                                                        color="primary"
                                                        variant="filled"
                                                        size="small"
                                                        sx={{ fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight={700}>
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotalValue)}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Fade>
    );
}
