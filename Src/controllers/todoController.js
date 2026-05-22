const Todo = require('../models/Todo');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const todoController = {
  async createTodo(req, res, next) {
    try {
      const todoData = {
        ...req.body,
        user_id: req.user.id,
      };
      
      const todo = await Todo.create(todoData);
      
      logger.info(`Todo created: ${todo.id} by user ${req.user.id}`);
      
      res.status(201).json({
        status: 'success',
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllTodos(req, res, next) {
    try {
      const { page = 1, limit = 50, completed, priority, search } = req.query;
      const offset = (page - 1) * limit;
      
      const todos = await Todo.findAll({
        user_id: req.user.id,
        completed,
        priority,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      
      res.json({
        status: 'success',
        data: todos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getTodoById(req, res, next) {
    try {
      const todo = await Todo.findById(parseInt(req.params.id), req.user.id);
      
      if (!todo) {
        throw new AppError(404, 'Todo not found');
      }
      
      res.json({
        status: 'success',
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTodo(req, res, next) {
    try {
      const todo = await Todo.update(
        parseInt(req.params.id),
        req.user.id,
        req.body
      );
      
      if (!todo) {
        throw new AppError(404, 'Todo not found');
      }
      
      logger.info(`Todo updated: ${todo.id} by user ${req.user.id}`);
      
      res.json({
        status: 'success',
        data: todo,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTodo(req, res, next) {
    try {
      const todo = await Todo.delete(
        parseInt(req.params.id),
        req.user.id,
        true // soft delete
      );
      
      if (!todo) {
        throw new AppError(404, 'Todo not found');
      }
      
      logger.info(`Todo deleted: ${todo.id} by user ${req.user.id}`);
      
      res.status(204).json({
        status: 'success',
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getTodoStats(req, res, next) {
    try {
      const stats = await Todo.getStats(req.user.id);
      
      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = todoController;