import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { CircularProgress, Box } from '@mui/material';
import Layout from './Layout.tsx';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return isAuthenticated ? (
        <Layout>
            <Outlet />
        </Layout>
    ) : (
        <Navigate to="/login" />
    );
};

export default ProtectedRoute;
