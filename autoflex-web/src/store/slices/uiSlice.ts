import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    notification: {
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'warning' | 'info';
    } | null;
}

const initialState: UiState = {
    notification: null,
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showNotification: (state, action: PayloadAction<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' }>) => {
            state.notification = {
                open: true,
                message: action.payload.message,
                severity: action.payload.severity,
            };
        },
        hideNotification: (state) => {
            if (state.notification) {
                state.notification.open = false;
            }
        },
    },
});

export const { showNotification, hideNotification } = uiSlice.actions;
export default uiSlice.reducer;