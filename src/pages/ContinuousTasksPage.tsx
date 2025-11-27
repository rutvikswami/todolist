import React, { useState } from 'react'
import { Play, Pause, Square, Clock, Plus, Calendar, Timer } from 'lucide-react'
import { useTodo } from '../contexts/TodoContext'
import ContinuousTaskCard from '../components/ContinuousTaskCard'
import TaskModal from '../components/TaskModal'

const ContinuousTasksPage = () => {
  const { tasks, filters, setFilters, categories } = useTodo()
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('all') // all, active, paused, completed

  // Filter to show only continuous tasks
  const continuousTasks = tasks.filter(task => task.task_type === 'continuous')
  
  // Apply status filter
  const filteredTasks = continuousTasks.filter(task => {
    if (statusFilter === 'active') return task.is_active && !task.completed
    if (statusFilter === 'paused') return !task.is_active && !task.completed
    if (statusFilter === 'completed') return task.completed
    return true // all
  })

  const openTaskModal = (task = null) => {
    const taskTemplate = {
      ...task,
      task_type: 'continuous',
      duration_minutes: task?.duration_minutes || 60,
      start_time: task?.start_time || new Date().toISOString(),
      end_time: task?.end_time || new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }
    setEditingTask(taskTemplate)
    setIsTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setEditingTask(null)
    setIsTaskModalOpen(false)
  }

  const getStatusStats = () => {
    const active = continuousTasks.filter(t => t.is_active && !t.completed).length
    const paused = continuousTasks.filter(t => !t.is_active && !t.completed).length
    const completed = continuousTasks.filter(t => t.completed).length
    const total = continuousTasks.length

    return { active, paused, completed, total }
  }

  const stats = getStatusStats()

  const getTotalTimeSpent = () => {
    return continuousTasks.reduce((total, task) => {
      return total + (task.total_time_spent || 0)
    }, 0)
  }

  const formatTotalTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="continuous-tasks-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <Clock size={28} />
              Continuous Tasks
            </h1>
            <p className="page-description">
              Manage time-tracked tasks with built-in timers and session tracking
            </p>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => openTaskModal()}
          >
            <Plus size={16} />
            New Continuous Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon active">
              <Play size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon paused">
              <Pause size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.paused}</span>
              <span className="stat-label">Paused</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <Square size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon total">
              <Timer size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{formatTotalTime(getTotalTimeSpent())}</span>
              <span className="stat-label">Total Time</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-section">
            <label className="filter-label">Status:</label>
            <div className="filter-tabs">
              {[
                { id: 'all', label: 'All Tasks', count: stats.total },
                { id: 'active', label: 'Active', count: stats.active },
                { id: 'paused', label: 'Paused', count: stats.paused },
                { id: 'completed', label: 'Completed', count: stats.completed }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`filter-tab ${statusFilter === tab.id ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab.id)}
                >
                  {tab.label}
                  <span className="filter-count">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Category:</label>
            <select 
              className="filter-select"
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                category: e.target.value || null 
              }))}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="tasks-section">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <Clock size={48} className="empty-icon" />
              <h3>
                {statusFilter === 'all' 
                  ? 'No continuous tasks yet'
                  : `No ${statusFilter} continuous tasks`
                }
              </h3>
              <p>
                {statusFilter === 'all' 
                  ? 'Create your first continuous task to start time tracking'
                  : `Switch to a different status to see more tasks`
                }
              </p>
              {statusFilter === 'all' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => openTaskModal()}
                >
                  <Plus size={16} />
                  Create Continuous Task
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map(task => (
              <ContinuousTaskCard
                key={task.id}
                task={task}
                onEdit={() => openTaskModal(task)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeTaskModal}
          onSave={closeTaskModal}
        />
      )}
    </div>
  )
}

export default ContinuousTasksPage