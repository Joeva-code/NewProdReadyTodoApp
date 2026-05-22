const Joi = require('joi');

const todoValidation = {
  create: (req, res, next) => {
    const schema = Joi.object({
      title: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(5000).allow(''),
      priority: Joi.number().integer().min(1).max(5),
      due_date: Joi.date().iso().min('now'),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
      });
    }
    next();
  },

  update: (req, res, next) => {
    const schema = Joi.object({
      title: Joi.string().min(1).max(255),
      description: Joi.string().max(5000).allow(''),
      completed: Joi.boolean(),
      priority: Joi.number().integer().min(1).max(5),
      due_date: Joi.date().iso().allow(null),
    }).min(1);

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
      });
    }
    next();
  },

  idParam: (req, res, next) => {
    const schema = Joi.object({
      id: Joi.number().integer().positive().required(),
    });

    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid todo ID',
      });
    }
    next();
  },

  pagination: (req, res, next) => {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
      completed: Joi.boolean(),
      priority: Joi.number().integer().min(1).max(5),
      search: Joi.string().max(100),
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message,
      });
    }
    req.query = value;
    next();
  },
};

module.exports = todoValidation;