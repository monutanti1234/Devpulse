import Task from '../models/Task.js';
import genAI from '../config/ai.js';

// 1. Get all tasks for logged-in user
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      $or: [{ user: req.user._id }, { createdBy: req.user._id }] 
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// 2. Create new task
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      user: req.user._id,
      createdBy: req.user._id,
      title,
      description,
      status: status || 'pending',
      priority: priority || 'medium',
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// 3. Update task details / status (Fixes 404 Error)
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (status) task.status = status;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// 4. Delete Task (Fixes Delete Action)
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// 5. AI Subtask Generator (With Smart Fallback for Rate Limits)
export const generateSubtasksWithAI = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let steps = [];

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `Break down this task into 4 short actionable checklist steps:
Title: "${task.title}"
Description: "${task.description}"

Return ONLY a valid JSON array of strings, example:
["Step 1", "Step 2", "Step 3", "Step 4"]
Do not add markdown code blocks or extra text.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      steps = JSON.parse(cleanJson);
    } catch (aiErr) {
      console.log('⚠️ AI API Limit/Error, using smart fallback steps:', aiErr.message);
      steps = [
        `Analyze requirements for ${task.title}`,
        `Set up initial structure & resources`,
        `Execute primary implementation phase`,
        `Test and finalize ${task.title}`
      ];
    }

    const formattedSubtasks = steps.map((step) => ({
      text: step,
      isCompleted: false,
    }));

    task.subTasks = formattedSubtasks;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ message: 'Failed to update task with subtasks' });
  }
};

// 6. Toggle Subtask Status
export const toggleSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const subtask = task.subTasks.id(subtaskId);
    if (!subtask) return res.status(404).json({ message: 'Subtask not found' });

    subtask.isCompleted = !subtask.isCompleted;
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update subtask' });
  }
};