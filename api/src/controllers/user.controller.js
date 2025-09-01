const { pool } = require('../config/db');

exports.getAllUsers = async (req, res, next) => {
    try {
        const [users] = await pool.execute('SELECT id, name, role FROM users ORDER BY name');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};
