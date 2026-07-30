const express = require('express');
const {
  createTask,
  getTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all task routes with JWT authentication middleware
router.use(protect);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/stats')
  .get(getTaskStats);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
