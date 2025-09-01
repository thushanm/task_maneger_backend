import React, { ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { useAuth } from '../hooks/useAuth.ts';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }: { children: ReactNode }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Projects & Tasks
                    </Typography>
                    {user && (
                        <Typography sx={{ mr: 2 }}>
                            Welcome, {user.name} ({user.role})
                        </Typography>
                    )}
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{ mt: 4 }}>
                {children}
            </Container>
        </>
    );
};

export default Layout;
