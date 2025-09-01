export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'member';
}

export interface Project {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
    id: number;
    project_id: number;
    title: string;
    status: TaskStatus;
    assignee_user_id: number | null;
    assignee_name?: string;
    due_date: string | null;
    version: number;
}
