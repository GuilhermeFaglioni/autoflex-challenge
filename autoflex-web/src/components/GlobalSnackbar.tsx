import { Snackbar, Alert } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { hideNotification } from '../store/slices/uiSlice';

export function GlobalSnackbar() {
    const dispatch = useAppDispatch();
    const { notification } = useAppSelector((state) => state.ui);

    const handleClose = () => {
        dispatch(hideNotification());
    };

    if (!notification) return null;

    return (
        <Snackbar
            open={notification.open}
            autoHideDuration={4000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert onClose={handleClose} severity={notification.severity} variant="filled">
                {notification.message}
            </Alert>
        </Snackbar>
    );
}