import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Task, TaskStatus, User } from '../types';
import TaskItem from '../components/TaskItem.tsx';
import { useAuth } from '../hooks/useAuth';
import {
    Typography, List, CircularProgress, Alert, Box, Snackbar, Button, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const ProjectDetailPage = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const { user } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get(`/projects/${projectId}/tasks`);
            setTasks(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch tasks.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    const fetchUsers = useCallback(async () => {
        if (user?.role === 'admin') {
            try {
                const response = await apiClient.get('/users');
                setUsers(response.data);
            } catch (err) {
                console.error("Failed to fetch users");
            }
        }
    }, [user?.role]);

    useEffect(() => {
        fetchTasks();
        fetchUsers();
    }, [fetchTasks, fetchUsers]);

    const handleOpenDialog = (task: Partial<Task> | null = null) => {
        setCurrentTask(task ? { ...task } : { title: '', status: 'todo' });
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setCurrentTask(null);
    };

    const handleSaveTask = async () => {
        if (!currentTask || !currentTask.title) return;

        const isNew = !currentTask.id;
        const url = isNew ? `/projects/${projectId}/tasks` : `/tasks/${currentTask.id}`;
        const method = isNew ? 'post' : 'patch';

        try {
            await apiClient[method](url, currentTask);
            setSnackbar({ open: true, message: `Task successfully ${isNew ? 'created' : 'updated'}!` });
            await fetchTasks();
        } catch(err: any) {
            setError(err.response?.data?.message || 'Failed to save task.');
        } finally {
            handleCloseDialog();
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await apiClient.delete(`/tasks/${taskId}`);
                setSnackbar({ open: true, message: 'Task deleted successfully!' });
                await fetchTasks();
            } catch(err: any) {
                setError(err.response?.data?.message || 'Failed to delete task.');
            }
        }
    };

    const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus, version: number) => {
        const originalTasks = [...tasks];
        const updatedTasks = tasks.map((t) =>
            t.id === taskId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        try {
            const response = await apiClient.patch(`/tasks/${taskId}`, {
                status: newStatus,
                version: version,
            });
            setTasks((currentTasks) =>
                currentTasks.map((t) => (t.id === taskId ? response.data : t))
            );
        } catch (err: any) {
            setTasks(originalTasks);
            if (err.response?.status === 409) {
                setSnackbar({ open: true, message: 'Task was updated by someone else. Refreshing data.' });
                await fetchTasks();
            } else {
                setSnackbar({ open: true, message: 'Failed to update task status.' });
            }
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom component="div">
                    Tasks
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Create Task
                </Button>
            </Box>

            {loading && <Box display="flex" justifyContent="center" sx={{ my: 4 }}><CircularProgress /></Box>}
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            {!loading && tasks.length === 0 && <Alert severity="info">No tasks found for this project.</Alert>}
            {!loading && tasks.length > 0 && (
                <List>
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onUpdateStatus={handleUpdateStatus}
                            onEdit={handleOpenDialog}
                            onDelete={handleDeleteTask}
                        />
                    ))}
                </List>
            )}

            <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentTask?.id ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Task Title"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={currentTask?.title || ''}
                        onChange={(e) => setCurrentTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                        required
                    />
                    {user?.role === 'admin' && (
                        <FormControl fullWidth margin="dense" variant="standard">
                            <InputLabel>Assignee</InputLabel>
                            <Select
                                value={currentTask?.assignee_user_id || ''}
                                onChange={(e) => setCurrentTask(prev => prev ? { ...prev, assignee_user_id: e.target.value as number } : null)}
                            >
                                <MenuItem value=""><em>Unassigned</em></MenuItem>
                                {users.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveTask} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </>
    );
};

export default ProjectDetailPage;
