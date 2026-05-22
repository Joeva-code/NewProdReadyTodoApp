const { pool } = require('../config/database');
const logger = require('../utils/logger');

class Todo {
  static async create(todoData) {
    const { title, description, priority, due_date, user_id } = todoData;
    const query = `
      INSERT INTO todos (title, description, priority, due_date, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [title, description, priority || 1, due_date, user_id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating todo:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    const { user_id, completed, priority, search, limit = 50, offset = 0 } = filters;
    let query = 'SELECT * FROM todos WHERE deleted_at IS NULL AND user_id = $1';
    const values = [user_id];
    let paramIndex = 2;

    if (completed !== undefined) {
      query += ` AND completed = $${paramIndex++}`;
      values.push(completed);
    }

    if (priority) {
      query += ` AND priority = $${paramIndex++}`;
      values.push(priority);
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`;
      values.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY priority DESC, due_date ASC NULLS LAST, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      logger.error('Error finding todos:', error);
      throw error;
    }
  }

  static async findById(id, user_id) {
    const query = 'SELECT * FROM todos WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL';
    try {
      const result = await pool.query(query, [id, user_id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding todo by id:', error);
      throw error;
    }
  }

  static async update(id, user_id, updates) {
    const allowedUpdates = ['title', 'description', 'completed', 'priority', 'due_date'];
    const setClauses = [];
    const values = [id, user_id];
    let paramIndex = 3;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (setClauses.length === 0) {
      return null;
    }

    const query = `
      UPDATE todos 
      SET ${setClauses.join(', ')}
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating todo:', error);
      throw error;
    }
  }

  static async delete(id, user_id, softDelete = true) {
    if (softDelete) {
      const query = 'UPDATE todos SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *';
      try {
        const result = await pool.query(query, [id, user_id]);
        return result.rows[0];
      } catch (error) {
        logger.error('Error soft deleting todo:', error);
        throw error;
      }
    } else {
      const query = 'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *';
      try {
        const result = await pool.query(query, [id, user_id]);
        return result.rows[0];
      } catch (error) {
        logger.error('Error hard deleting todo:', error);
        throw error;
      }
    }
  }

  static async getStats(user_id) {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN completed = false THEN 1 ELSE 0 END) as pending,
        AVG(CASE WHEN completed = false THEN priority ELSE NULL END)::numeric(10,2) as avg_priority_pending
      FROM todos 
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    
    try {
      const result = await pool.query(query, [user_id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting todo stats:', error);
      throw error;
    }
  }
}

module.exports = Todo;