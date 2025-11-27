import React, { useState, useEffect } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Timer, 
  Calendar,
  Edit3,
  Trash2 
} from 'lucide-react'
import { useTodo } from '../contexts/TodoContext'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, formatDistance } from 'date-fns'

const ContinuousTaskCard = ({ task, onEdit }) => {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const { 
    startContinuousTask, 
    stopContinuousTask, 
    toggleTaskComplete,
    deleteTask 
  } = useTodo()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  // Update elapsed time for active tasks
  useEffect(() => {
    if (!task.is_active || !task.start_time) return

    const updateElapsed = () => {
      const startTime = new Date(task.start_time)
      const now = new Date()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedTime(elapsed)
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [task.is_active, task.start_time])

  const handleStart = async (e) => {
    e.stopPropagation()
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await startContinuousTask(task.id)
    } catch (error) {
      console.error('Failed to start task:', error)
      alert('Failed to start task. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStop = async (e) => {
    e.stopPropagation()
    if (isUpdating) return

    setIsUpdating(true)
    try {
      await stopContinuousTask(task.id)
    } catch (error) {
      console.error('Failed to stop task:', error)
      alert('Failed to stop task. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleToggleComplete = async (e) => {
    e.stopPropagation()
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await toggleTaskComplete(task.id)
    } catch (error) {
      console.error('Failed to toggle task:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteTask(task.id)
      setShowDeleteConfirm(false)
    } catch (error) {
      setShowDeleteConfirm(false)
    }
  }

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const getProgress = () => {
    if (!task.duration_minutes || !task.is_active) return 0
    return Math.min(100, (elapsedTime / (task.duration_minutes * 60)) * 100)
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'var(--priority-high)'
      case 'medium': return 'var(--priority-medium)'
      case 'low': return 'var(--priority-low)'
      default: return 'var(--border-color)'
    }
  }

  const getTaskStatus = () => {
    if (task.completed) return 'completed'
    if (task.is_active) return 'active'
    return 'pending'
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`continuous-task-card ${getTaskStatus()}`}
    >
      {/* Priority Indicator */}
      <div 
        className="task-priority-indicator"
        style={{ backgroundColor: getPriorityColor() }}
      />

      {/* Main Content */}
      <div className="continuous-task-content">
        {/* Header */}
        <div className="continuous-task-header">
          <div className="task-title-section">
            <button
              className="task-status-btn"
              onClick={handleToggleComplete}
              disabled={isUpdating}
            >
              {task.completed ? (
                <CheckCircle2 size={24} className="text-success" />
              ) : (
                <Circle size={24} className="text-muted" />
              )}
            </button>

            <div className="task-info">
              <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </h3>
              
              <div className="task-badges">
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
                
                {task.categories && (
                  <span 
                    className="category-badge"
                    style={{ backgroundColor: task.categories.color }}
                  >
                    {task.categories.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="continuous-task-actions">
            {!task.completed && (
              <>
                {!task.is_active ? (
                  <button
                    className="action-btn start-btn"
                    onClick={handleStart}
                    disabled={isUpdating}
                  >
                    <Play size={16} />
                    Start
                  </button>
                ) : (
                  <button
                    className="action-btn stop-btn"
                    onClick={handleStop}
                    disabled={isUpdating}
                  >
                    <Square size={16} />
                    Stop
                  </button>
                )}
              </>
            )}

            <button
              className="action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
            >
              <Edit3 size={16} />
            </button>

            <button
              className="action-btn delete-btn"
              onClick={handleDelete}
            >
              <Trash2 size={16} />
            </button>

            <div 
              className="drag-handle"
              {...listeners}
              title="Drag to reorder"
            >
              ⋮⋮
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="task-description">
            <p>{task.description}</p>
          </div>
        )}

        {/* Time Information */}
        <div className="time-info">
          {task.start_time && (
            <div className="time-item">
              <Calendar size={14} />
              <span>
                {format(new Date(task.start_time), 'MMM d, p')}
              </span>
            </div>
          )}

          {task.duration_minutes && (
            <div className="time-item">
              <Timer size={14} />
              <span>Duration: {formatDuration(task.duration_minutes)}</span>
            </div>
          )}

          {task.total_time_spent > 0 && (
            <div className="time-item">
              <Clock size={14} />
              <span>Total: {formatDuration(task.total_time_spent)}</span>
            </div>
          )}
        </div>

        {/* Active Status */}
        {task.is_active && (
          <div className="active-status">
            <div className="active-header">
              <div className="active-indicator">
                <div className="pulse-dot" />
                <span className="status-text">Task in Progress</span>
              </div>
              
              <div className="elapsed-time">
                <Clock size={16} />
                <span className="time">{formatElapsedTime(elapsedTime)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {task.duration_minutes && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
                <span className="progress-text">
                  {Math.round(getProgress())}% complete
                </span>
              </div>
            )}
          </div>
        )}

        {/* Completion Status */}
        {task.completed && (
          <div className="completion-status">
            <div className="completion-badge">
              <CheckCircle2 size={16} />
              <span>Completed</span>
              {task.completed_at && (
                <span className="completion-time">
                  {formatDistance(new Date(task.completed_at), new Date(), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="task-notes">
            <p>{task.notes}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Continuous Task"
        message={`Are you sure you want to delete "${task.title}"? This will also delete all time tracking data. This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  )
}

export default ContinuousTaskCard