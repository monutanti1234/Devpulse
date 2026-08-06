import express from 'express';
import { 
  getTasks, 
  createTask, 
  updateTask,
  deleteTask,
  generateSubtasksWithAI, 
  toggleSubtask 
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);         // 👈 Added missing route for Status Update
router.delete('/:id', protect, deleteTask);      // 👈 Added missing route for Task Delete
router.post('/:id/ai-generate', protect, generateSubtasksWithAI);
router.put('/:taskId/subtasks/:subtaskId', protect, toggleSubtask);

export default router;