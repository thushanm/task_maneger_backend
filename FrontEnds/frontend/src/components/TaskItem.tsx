import React from 'react';
import { Task, TaskStatus, User } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
    ListItem, ListItemText, Select, MenuItem, FormControl, Box, Typography, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface TaskItemProps {
    task: Task;
    onUpdateStatus: (taskId: number, newStatus: TaskStatus, version: number) => Promise<void>;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdateStatus, onEdit, onDelete }) => {
    const { user } = useAuth();

    const canModify = user?.role === 'admin' || user?.id === task.assignee_user_id;

    return (
        <ListItem
            divider
            secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControl size="small" sx={{minWidth: 120}}>
                        <Select value={task.status} onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus, task.version)}>
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                        </Select>
                    </FormControl>
                    {canModify && (
                        <>
                            <IconButton edge="end" aria-label="edit" onClick={() => onEdit(task)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => onDelete(task.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </>
                    )}
                </Box>
            }
        >
            <ListItemText
                primary={task.title}
                secondary={
                    <Box component="span" sx={{ display: 'flex', gap: 2 }}>
                        <Typography component="span" variant="body2">
                            Assignee: {task.assignee_name || 'Unassigned'}
                        </Typography>
                        <Typography component="span" variant="body2" color="text.secondary">
                            (Version: {task.version})
                        </Typography>
                    </Box>
                }
            />
        </ListItem>
    );
};

export default TaskItem;
