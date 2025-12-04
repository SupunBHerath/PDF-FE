import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            // Set authentication
            setAuth: (user, token) => {
                // Save to Zustand state
                set({ user, token, isAuthenticated: true });

                // ALSO save token to plain localStorage for API client
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            },

            // Update user
            updateUser: (user) => {
                set({ user });
                localStorage.setItem('user', JSON.stringify(user));
            },

            // Clear authentication  
            clearAuth: () => {
                set({ user: null, token: null, isAuthenticated: false });

                // Also clear plain localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            },

            // Check if user is admin
            isAdmin: () => {
                const { user } = get();
                return user?.role === 'admin';
            },

            // Check if user is company user
            isCompanyUser: () => {
                const { user } = get();
                return user?.role === 'company_user';
            },

            // Get user's companies
            getCompanies: () => {
                const { user } = get();
                return user?.companies || [];
            },
        }),
        {
            name: 'auth-storage',
            // Persist these fields to localStorage (under 'auth-storage' key)
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
