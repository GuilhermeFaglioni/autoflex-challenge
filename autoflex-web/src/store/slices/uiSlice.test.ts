import { describe, it, expect } from 'vitest';
import uiReducer, { showNotification, hideNotification } from './uiSlice';

describe('uiSlice', () => {
    const initialState: { notification: any } = {
        notification: null,
    };

    it('should handle showNotification', () => {
        const payload = { message: 'Test message', severity: 'success' as const };
        const action = showNotification(payload);
        const state = uiReducer(initialState, action);

        expect(state.notification?.open).toBe(true);
        expect(state.notification?.message).toBe('Test message');
        expect(state.notification?.severity).toBe('success');
    });

    it('should handle hideNotification', () => {
        const openedState = {
            notification: {
                open: true,
                message: 'Test',
                severity: 'info' as const,
            },
        };
        const action = hideNotification();
        const state = uiReducer(openedState as any, action);

        expect(state.notification?.open).toBe(false);
    });
});
