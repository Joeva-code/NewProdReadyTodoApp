const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController.js');
const validation = require('../middleware/validation.js');
const authMiddleware = require('../middleware/auth.js');

// Apply auth middleware to all todo routes
router.use(authMiddleware);

// Routes
router.post('/', validation.create, todoController.createTodo);
router.get('/', validation.pagination, todoController.getAllTodos);
router.get('/stats', todoController.getTodoStats);
router.get('/:id', validation.idParam, todoController.getTodoById);
router.put('/:id', validation.idParam, validation.update, todoController.updateTodo);
router.delete('/:id', validation.idParam, todoController.deleteTodo);

module.exports = router;