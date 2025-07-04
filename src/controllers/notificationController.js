
import pool from './../config/db.js';

export const getNotifications = (req, res) => {
  const { userId } = req.params;
  pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
};

export const addNotification = (req, res) => {
  const { user_id, title, message, type } = req.body;
  pool.query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
    [user_id, title, message, type],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ id: result.insertId });
    }
  );
};

export const markAsRead = (req, res) => {
  const { id } = req.params;
  pool.query('UPDATE notifications SET read_status = 1 WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Marked as read' });
  });
};

export const markAllAsRead = (req, res) => {
  const { userId } = req.params;
  pool.query(
    'UPDATE notifications SET read_status = 1 WHERE user_id = ?',
    [userId],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'All marked as read' });
    }
  );
};
