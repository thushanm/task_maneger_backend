import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient.ts';
import type { Project } from '../types';
import { useAuth } from '../hooks/useAuth.ts';
import {
    Typography, List, ListItem, ListItemButton, ListItemText, CircularProgress, Alert,
    Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProjectsPage = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Partial<Project> | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = searchTerm ? { q: searchTerm } : {};
            const response = await apiClient.get('/projects', { params });
            setProjects(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch projects.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const debounceFetch = setTimeout(() => {
            fetchProjects();
        }, 300);
        return () => clearTimeout(debounceFetch);
    }, [fetchProjects]);

    const handleOpenDialog = (project: Partial<Project> | null = null) => {
        setCurrentProject(project ? { ...project } : { name: '', description: '' });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setCurrentProject(null);
    };

    const handleSaveProject = async () => {
        if (!currentProject || !currentProject.name) return;

        try {
            if (currentProject.id) {
                // Update existing project
                await apiClient.patch(`/projects/${currentProject.id}`, currentProject);
            } else {
                // Create new project
                await apiClient.post('/projects', currentProject);
            }
            await fetchProjects();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save project.');
        } finally {
            handleCloseDialog();
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (window.confirm('Are you sure you want to delete this project and all its tasks?')) {
            try {
                await apiClient.delete(`/projects/${projectId}`);
                await fetchProjects();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to delete project.');
            }
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom component="div">
                    Projects
                </Typography>
                {user?.role === 'admin' && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                        Create Project
                    </Button>
                )}
            </Box>
            <TextField
                label="Search Projects"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <Box display="flex" justifyContent="center" sx={{ my: 4 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {!loading && projects.length === 0 && <Alert severity="info">No projects found.</Alert>}
            {!loading && projects.length > 0 && (
                <List>
                    {projects.map((project) => (
                        <ListItem key={project.id} disablePadding secondaryAction={
                            user?.role === 'admin' && (
                                <>
                                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(project)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" sx={{ml: 1}} onClick={() => handleDeleteProject(project.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            )
                        }>
                            <ListItemButton component={Link} to={`/projects/${project.id}`}>
                                <ListItemText primary={project.name} secondary={project.description} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}

            <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentProject?.id ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Project Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={currentProject?.name || ''}
                        onChange={(e) => setCurrentProject(prev => prev ? {...prev, name: e.target.value} : null)}
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Project Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="standard"
                        value={currentProject?.description || ''}
                        onChange={(e) => setCurrentProject(prev => prev ? {...prev, description: e.target.value} : null)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveProject} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProjectsPage;
