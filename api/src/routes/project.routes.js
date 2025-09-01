const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
router.get('/', verifyToken, projectController.getAllProjects);
router.post('/', verifyToken, isAdmin, projectController.createProject);
router.get('/:id/tasks', verifyToken, projectController.getTasksByProject);
router.post('/:id/tasks', verifyToken, projectController.createTaskInProject);
module.exports = router;
