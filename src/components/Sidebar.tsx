import React, { useEffect, useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { Link, useLocation } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Inbox, 
  Tag,
  AlertCircle,
  Trash2,
  Plus,
  Filter,
  Timer
} from 'lucide-react'
import { useTodo } from '../contexts/TodoContext'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const { 
    filters, 
    setFilters, 
    categories, 
    tasks,
    sortBy,
    setSortBy,
    clearCompleted 
  } = useTodo()

  // Reset filters when switching pages
  useEffect(() => {
    setFilters({
      view: 'all',
      category: null,
      priority: null,
      search: ''
    })
  }, [location.pathname, setFilters])

  const navigationItems = [
    {
      path: '/',
      label: 'Regular Tasks',
      icon: Inbox,
      count: tasks.filter(t => t.task_type !== 'continuous' && !t.completed).length
    },
    {
      path: '/continuous',
      label: 'Continuous Tasks',
      icon: Timer,
      count: tasks.filter(t => t.task_type === 'continuous' && !t.completed).length
    }
  ]

  // Filter tasks based on current page
  const isOnContinuousPage = location.pathname === '/continuous'
  const relevantTasks = tasks.filter(t => 
    isOnContinuousPage 
      ? t.task_type === 'continuous'
      : t.task_type !== 'continuous'
  )

  const views = [
    {
      id: 'today',
      label: 'Today',
      icon: Calendar,
      count: relevantTasks.filter(t => {
        if (t.completed) return false
        const today = new Date().toISOString().split('T')[0]
        return t.due_date === today
      }).length
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: Clock,
      count: relevantTasks.filter(t => {
        if (t.completed) return false
        const today = new Date()
        const taskDate = new Date(t.due_date)
        return taskDate > today
      }).length
    },
    {
      id: 'all',
      label: 'All Tasks',
      icon: Inbox,
      count: relevantTasks.filter(t => !t.completed).length
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      count: relevantTasks.filter(t => t.completed).length
    }
  ]

  const priorities = [
    { id: 'high', label: 'High Priority', color: '#ef4444' },
    { id: 'medium', label: 'Medium Priority', color: '#f59e0b' },
    { id: 'low', label: 'Low Priority', color: '#10b981' }
  ]

  const handleViewChange = (view) => {
    setFilters(prev => ({ ...prev, view, category: null, priority: null }))
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  const handleCategoryFilter = (categoryId) => {
    setFilters(prev => ({ 
      ...prev, 
      category: prev.category === categoryId ? null : categoryId,
      view: 'all'
    }))
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  const handlePriorityFilter = (priority) => {
    setFilters(prev => ({ 
      ...prev, 
      priority: prev.priority === priority ? null : priority,
      view: 'all'
    }))
    if (window.innerWidth < 768) {
      onClose()
    }
  }

  const handleClearCompleted = () => {
    setShowClearConfirm(true)
  }

  const confirmClearCompleted = async () => {
    try {
      await clearCompleted(isOnContinuousPage ? 'continuous' : 'regular')
      setShowClearConfirm(false)
    } catch (error) {
      console.error('Failed to clear completed tasks:', error)
      setShowClearConfirm(false)
    }
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Navigation Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Pages</h3>
        <nav className="sidebar-nav">
          {navigationItems.map(item => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose()
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span className="sidebar-count">{item.count}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Views Section */}
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Views</h3>
        <nav className="sidebar-nav">
          {views.map(view => {
            const Icon = view.icon
            return (
              <button
                key={view.id}
                onClick={() => handleViewChange(view.id)}
                className={`sidebar-nav-item ${filters.view === view.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{view.label}</span>
                {view.count > 0 && (
                  <span className="sidebar-count">{view.count}</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Categories Section */}
      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <h3 className="sidebar-heading">Categories</h3>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => window.openTaskModal?.({ category_id: null, title: '', description: '', priority: 'medium' })}
            title="Add category"
          >
            <Plus size={14} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {categories.map(category => {
            const taskCount = relevantTasks.filter(t => 
              !t.completed && t.category_id === category.id
            ).length
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`sidebar-nav-item ${filters.category === category.id ? 'active' : ''}`}
              >
                <div 
                  className="category-dot"
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    flexShrink: 0
                  }}
                />
                <span>{category.name}</span>
                {taskCount > 0 && (
                  <span className="sidebar-count">{taskCount}</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Priority Filters */}
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Priority</h3>
        <nav className="sidebar-nav">
          {priorities.map(priority => {
            const taskCount = relevantTasks.filter(t => 
              !t.completed && t.priority === priority.id
            ).length

            return (
              <button
                key={priority.id}
                onClick={() => handlePriorityFilter(priority.id)}
                className={`sidebar-nav-item ${filters.priority === priority.id ? 'active' : ''}`}
              >
                <AlertCircle size={16} style={{ color: priority.color }} />
                <span>{priority.label}</span>
                {taskCount > 0 && (
                  <span className="sidebar-count">{taskCount}</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Sort Options */}
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Sort By</h3>
        <select 
          className="select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="created_at">Created Date</option>
        </select>
      </div>

      {/* Actions */}
      <div className="sidebar-section">
        <button 
          className="btn btn-secondary"
          onClick={handleClearCompleted}
          style={{ width: '100%' }}
          disabled={relevantTasks.filter(t => t.completed).length === 0}
        >
          <Trash2 size={16} />
          Clear Completed ({relevantTasks.filter(t => t.completed).length})
        </button>
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Completed Tasks"
        message={`Are you sure you want to delete all ${relevantTasks.filter(t => t.completed).length} completed ${isOnContinuousPage ? 'continuous' : 'regular'} tasks? This action cannot be undone.`}
        confirmLabel="Clear All"
        onConfirm={confirmClearCompleted}
        onCancel={() => setShowClearConfirm(false)}
        type="danger"
      />
    </aside>
  )
}

export default Sidebar