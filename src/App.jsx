import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import useAuthStore from './store/authStore';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard';

// Admin Pages
import Companies from './pages/Admin/Companies';
import Users from './pages/Admin/Users';

// Company Pages
import Items from './pages/Items';
import QuotationForm from './pages/Quotations/QuotationForm';
import QuotationList from './pages/Quotations/QuotationList';
import QuotationDetail from './pages/Quotations/QuotationDetail';
import History from './pages/History';
import PdfTemplates from './pages/PdfTemplates';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin()) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <AuthLayout>
                                <Login />
                            </AuthLayout>
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Admin Only Routes */}
                    <Route
                        path="companies"
                        element={
                            <ProtectedRoute adminOnly>
                                <Companies />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users"
                        element={
                            <ProtectedRoute adminOnly>
                                <Users />
                            </ProtectedRoute>
                        }
                    />

                    {/* Company User Routes */}
                    <Route path="items" element={<Items />} />
                    <Route path="quotations">
                        <Route index element={<QuotationList />} />
                        <Route path="new" element={<QuotationForm />} />
                        <Route path=":id" element={<QuotationDetail />} />
                        <Route path=":id/edit" element={<QuotationForm />} />
                    </Route>
                    <Route path="history" element={<History />} />
                    {/*<Route path="pdf-templates" element={<PdfTemplates />} />*/}

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
