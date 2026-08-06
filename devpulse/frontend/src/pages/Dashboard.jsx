import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Plus, CheckCircle, Clock, ListTodo, 
  Trash2, AlertCircle, X, Loader2, Edit3, CheckSquare, Square,
  Search, Filter, ArrowUpDown, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // AI & Subtask Loading State
  const [aiGeneratingTaskId, setAiGeneratingTaskId] = useState(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'low', 'medium', 'high'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'priority'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchTasks();
  }, []);

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/tasks');
      setTasks(res.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium'
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'medium' });
    }
    setIsModalOpen(true);
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingTask) {
        const res = await API.put(`/tasks/${editingTask._id}`, formData);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
        toast.success('Task updated successfully!');
      } else {
        const res = await API.post('/tasks', formData);
        setTasks([res.data, ...tasks]);
        toast.success('Task created successfully!');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await API.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Day 17: Ask AI to Break Down Task
  const handleGenerateAISubtasks = async (taskId) => {
    setAiGeneratingTaskId(taskId);
    try {
      const res = await API.post(`/tasks/${taskId}/ai-generate`);
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
      toast.success('✨ AI subtasks generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI Generation failed');
    } finally {
      setAiGeneratingTaskId(null);
    }
  };

  // Day 18: Toggle Subtask Status Checkbox
  const handleToggleSubtask = async (taskId, subtaskId) => {
    try {
      const res = await API.put(`/tasks/${taskId}/subtasks/${subtaskId}`);
      setTasks(tasks.map((t) => (t._id === taskId ? res.data : t)));
    } catch (error) {
      toast.error('Failed to update subtask status');
    }
  };

  // Search, Filter aur Sorting Logic
  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search Filter (Title & Description)
        const matchesSearch = 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Status Filter
        const matchesStatus = 
          statusFilter === 'all' || 
          (statusFilter === 'completed' && task.status === 'completed') ||
          (statusFilter === 'pending' && task.status !== 'completed');

        // Priority Filter
        const matchesPriority = 
          priorityFilter === 'all' || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === 'priority') {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  // Dynamic Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            DevPulse Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Welcome back, <span className="text-slate-200 font-medium">{user?.name || 'Developer'}</span> 👋
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-medium text-slate-300 hover:text-red-400 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-8 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-100">{totalTasks}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-slate-100">{pendingTasks}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Completed</p>
              <p className="text-2xl font-bold text-slate-100">{completedTasks}</p>
            </div>
          </div>
        </div>

        {/* Task Header & Action Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-200">Your Tasks</h2>
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>

          {/* Search, Filter & Sort Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/40 p-3 border border-slate-800/80 rounded-2xl">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none w-full cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Status</option>
                <option value="pending" className="bg-slate-900">Pending</option>
                <option value="completed" className="bg-slate-900">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none w-full cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Priorities</option>
                <option value="high" className="bg-slate-900">High Priority</option>
                <option value="medium" className="bg-slate-900">Medium Priority</option>
                <option value="low" className="bg-slate-900">Low Priority</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none w-full cursor-pointer"
              >
                <option value="newest" className="bg-slate-900">Sort: Newest First</option>
                <option value="oldest" className="bg-slate-900">Sort: Oldest First</option>
                <option value="priority" className="bg-slate-900">Sort: Priority High-Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List Rendering */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading tasks...
          </div>
        ) : filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/30 border border-slate-800/60 rounded-2xl">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {tasks.length === 0 ? "No tasks found. Create one to get started!" : "No tasks match your search/filter criteria."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedTasks.map((task) => (
              <div
                key={task._id}
                className={`bg-slate-900 border p-4 rounded-xl space-y-3 transition-all ${
                  task.status === 'completed'
                    ? 'border-slate-800/50 opacity-60'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Task Top Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {task.status === 'completed' ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
                      )}
                    </button>

                    <div className="space-y-0.5">
                      <h3
                        className={`font-medium ${
                          task.status === 'completed'
                            ? 'line-through text-slate-500'
                            : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-400">{task.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      task.priority === 'high' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : task.priority === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>

                    <button
                      onClick={() => openModal(task)}
                      className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day 18: Checklist Steps Section */}
                {task.subTasks && task.subTasks.length > 0 && (
                  <div className="pl-8 pt-2 border-t border-slate-800/60">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Checklist Steps ({task.subTasks.filter((st) => st.isCompleted).length}/{task.subTasks.length})
                    </p>
                    <div className="space-y-1.5">
                      {task.subTasks.map((subtask) => (
                        <label
                          key={subtask._id}
                          className="flex items-center gap-2 cursor-pointer text-xs group hover:bg-slate-800/50 p-1.5 rounded-lg transition"
                        >
                          <input
                            type="checkbox"
                            checked={subtask.isCompleted}
                            onChange={() => handleToggleSubtask(task._id, subtask._id)}
                            className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                          />
                          <span
                            className={
                              subtask.isCompleted
                                ? 'line-through text-slate-500'
                                : 'text-slate-300 group-hover:text-slate-100'
                            }
                          >
                            {subtask.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day 17: Magic Ask AI Button */}
                {(!task.subTasks || task.subTasks.length === 0) && (
                  <div className="pl-8 pt-1">
                    <button
                      onClick={() => handleGenerateAISubtasks(task._id)}
                      disabled={aiGeneratingTaskId === task._id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {aiGeneratingTaskId === task._id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating AI steps...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>✨ Ask AI to break down</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Add / Edit Task */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-200">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Complete Dashboard UI"
                  className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task details..."
                  className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-slate-800/70 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;