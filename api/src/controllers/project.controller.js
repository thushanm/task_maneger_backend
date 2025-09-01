const { pool } = require('../config/db');
const { BadRequestError, NotFoundError } = require('../utils/errors');

exports.getAllProjects = async (req, res, next) => {
    const { q } = req.query;
    try {
        let query = 'SELECT id, name, description, created_at FROM projects';
        const params = [];
        if (q) {
            query += ' WHERE name LIKE ?';
            params.push(`%${q}%`);
        }
        query += ' ORDER BY created_at DESC';
        const [projects] = await pool.execute(query, params);
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

exports.createProject = async (req, res, next) => {
    const { name, description } = req.body;
    if (!name) {
        return next(new BadRequestError('Project name is required.'));
    }
    try {
        const [result] = await pool.execute(
            'INSERT INTO projects (name, description) VALUES (?, ?)',
            [name, description || null]
        );
        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        next(error);
    }
};

exports.getTasksByProject = async (req, res, next) => {
    const { id } = req.params;
    const { status, assignee } = req.query;

    try {
        let query = `
      SELECT t.id, t.title, t.status, t.assignee_user_id, t.due_date, t.version, u.name as assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_user_id = u.id
      WHERE t.project_id = ?
    `;
        const params = [id];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }
        if (assignee) {
            query += ' AND t.assignee_user_id = ?';
            params.push(assignee);
        }
        query += ' ORDER BY t.created_at DESC';

        const [tasks] = await pool.execute(query, params);
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

exports.createTaskInProject = async (req, res, next) => {
    const { id: projectId } = req.params;
    const { title, assignee_user_id } = req.body;

    if (!title) {
        return next(new BadRequestError('Task title is required.'));
    }

    let finalAssigneeId = req.user.role === 'admin' ? assignee_user_id : req.user.id;

    try {
        const [result] = await pool.execute(
            'INSERT INTO tasks (project_id, title, assignee_user_id) VALUES (?, ?, ?)',
            [projectId, title, finalAssigneeId || null]
        );
        const [taskRows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json(taskRows[0]);
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return next(new NotFoundError('Project or assignee user not found.'));
        }
        next(error);
    }
};
