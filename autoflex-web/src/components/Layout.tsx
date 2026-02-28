import { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    alpha,
    IconButton
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    Build as BuildIcon,
    BlurOn as LogoIcon,
    Menu as MenuIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

export function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [open, setOpen] = useState(true);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Products', icon: <InventoryIcon />, path: '/products' },
        { text: 'Raw Materials', icon: <BuildIcon />, path: '/raw-materials' },
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backdropFilter: 'blur(8px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                }}
            >
                <Toolbar sx={{ display: 'flex', gap: 1.5 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        edge="start"
                        sx={{ mr: 1, color: 'primary.main' }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <LogoIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.01em',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Autoflex
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="persistent"
                open={open}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
                    <List>
                        {menuItems.map((item) => {
                            const isSelected = location.pathname === item.path;
                            return (
                                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        selected={isSelected}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            py: 1.2,
                                            '&.Mui-selected': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: 'primary.main',
                                                }
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: isSelected ? 600 : 500,
                                                variant: 'body2'
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    marginLeft: open ? 0 : `-${drawerWidth}px`,
                    ...(open && {
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.easeOut,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }),
                    position: 'relative'
                }}
            >
                <Toolbar />
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}