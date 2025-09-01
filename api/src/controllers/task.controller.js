const { pool } = require('../config/db');
const { BadRequestError, NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');
const { canTransition } = require('../services/task.service');
exports.deleteTask = async (req, res, next) => {
    const { id } = req.params;
    const requestingUser = req.user;

    try {

        const [taskRows] = await pool.execute('SELECT assignee_user_id FROM tasks WHERE id = ?', [id]);
        const task = taskRows[0];

        if (!task) {
            return next(new NotFoundError('Task not found.'));
        }

        if (requestingUser.role !== 'admin' && task.assignee_user_id !== requestingUser.id) {
            return next(new ForbiddenError('You do not have permission to delete this task.'));
        }

        await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
exports.updateTask = async (req, res, next) => {
    const { id } = req.params;
    const { title, status, assignee_user_id, version } = req.body;

    if (!version) {
        return next(new BadRequestError('Task version is required for updates.'));
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [taskRows] = await connection.execute('SELECT * FROM tasks WHERE id = ? FOR UPDATE', [id]);
        const task = taskRows[0];

        if (!task) {
            await connection.rollback();
            return next(new NotFoundError('Task not found.'));
        }

        if (req.user.role === 'member' && task.assignee_user_id !== req.user.id) {
            await connection.rollback();
            return next(new ForbiddenError('You can only modify tasks assigned to you.'));
        }
        if (task.version !== version) {
            await connection.rollback();
            return next(new ConflictError('This task has been modified by someone else. Please refresh and try again.'));
        }

        if (status && !canTransition(task.status, status)) {
            await connection.rollback();
            return next(new BadRequestError(`Invalid status transition from ${task.status} to ${status}.`));
        }

        const newTitle = title !== undefined ? title : task.title;
        const newStatus = status !== undefined ? status : task.status;
        let newAssignee = assignee_user_id !== undefined ? assignee_user_id : task.assignee_user_id;

        // Ensure non-admins cannot re-assign tasks
        if (req.user.role === 'member' && assignee_user_id !== undefined && assignee_user_id !== req.user.id) {
            await connection.rollback();
            return next(new ForbiddenError('You do not have permission to change the assignee.'));
        }

        await connection.execute(
            `UPDATE tasks SET title = ?, status = ?, assignee_user_id = ?, version = version + 1
       WHERE id = ? AND version = ?`,
            [newTitle, newStatus, newAssignee, id, version]
        );

        const [updatedTaskRows] = await connection.execute('SELECT * FROM tasks WHERE id = ?', [id]);

        await connection.commit();

        res.status(200).json(updatedTaskRows[0]);
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};
