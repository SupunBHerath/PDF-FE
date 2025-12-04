import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import App from './App';
import './index.css';

// Create a query client with conservative settings to prevent loops
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: false, // Disable retries to prevent loops
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        },
        mutations: {
            retry: false,
        },
    },
});

// Ant Design theme configuration
const theme = {
    token: {
        colorPrimary: '#3b82f6',
        colorSuccess: '#10b981',
        colorWarning: '#f59e0b',
        colorError: '#ef4444',
        colorInfo: '#3b82f6',
        borderRadius: 8,
        fontSize: 14,
    },
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ConfigProvider theme={theme}>
                <App />
                <ReactQueryDevtools initialIsOpen={false} />
            </ConfigProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
