import express from 'express';
import {
  getNotifications,
  addNotification,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/:userId', getNotifications); // get for specific user or all
router.post('/', addNotification);
router.put('/read/:id', markAsRead);
router.put('/read-all/:userId', markAllAsRead);

export default router;
