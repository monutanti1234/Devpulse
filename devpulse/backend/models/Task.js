import mongoose from 'mongoose';

const subTaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed', 'Todo', 'In-Progress', 'Done'], default: 'Todo' },
  subTasks: [subTaskSchema] // 👈 AI generated sub-tasks ke liye schema
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;