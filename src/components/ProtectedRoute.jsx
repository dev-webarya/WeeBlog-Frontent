import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    // Read directly from localStorage to avoid stale hook state across components
    const auth = localStorage.getItem('adminAuth');

    if (!auth) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};
