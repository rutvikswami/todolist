import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  MessageSquare, 
  ChevronDown,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { useTodo } from '../contexts/TodoContext'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, isToday, isPast, isTomorrow } from 'date-fns'

const TaskItem = ({ task, onEdit }) => {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { toggleTaskComplete, deleteTask, toggleSubtask } = useTodo()

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

  const handleToggleComplete = async (e) => {
    e.stopPropagation()
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await toggleTaskComplete(task.id)
    } catch (error) {
      // Handle error silently
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

  const handleSubtaskToggle = async (subtaskId) => {
    try {
      await toggleSubtask(subtaskId)
    } catch (error) {
      console.error('Failed to toggle subtask:', error)
    }
  }

  const getDueStatus = () => {
    if (!task.due_date) return null
    
    const dueDate = new Date(task.due_date)
    const today = new Date()
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { status: 'overdue', text: `Overdue (${format(dueDate, 'MMM d')})` }
    }
    if (isToday(dueDate)) {
      return { status: 'today', text: 'Due today' }
    }
    if (isTomorrow(dueDate)) {
      return { status: 'tomorrow', text: 'Due tomorrow' }
    }
    return { status: 'upcoming', text: `Due ${format(dueDate, 'MMM d')}` }
  }

  const dueStatus = getDueStatus()
  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const completedSubtasks = hasSubtasks ? task.subtasks.filter(st => st.completed).length : 0

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'var(--priority-high)'
      case 'medium': return 'var(--priority-medium)'
      case 'low': return 'var(--priority-low)'
      default: return 'var(--border-color)'
    }
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`task-item ${task.completed ? 'completed' : ''} ${dueStatus?.status === 'overdue' ? 'overdue' : ''}`}
    >
      {/* Priority Indicator */}
      <div 
        className="task-priority-indicator"
        style={{ backgroundColor: getPriorityColor() }}
      />

      {/* Main Task Content */}
      <div className="task-content">
        <div className="task-main">
          {/* Checkbox */}
          <button
            className="task-checkbox"
            onClick={handleToggleComplete}
            disabled={isUpdating}
          >
            {task.completed ? (
              <CheckCircle2 size={20} className="text-success" />
            ) : (
              <Circle size={20} className="text-muted" />
            )}
          </button>

          {/* Task Info */}
          <div className="task-info" onClick={() => onEdit(task)}>
            <div className="task-title-row">
              <h3 className={`task-title ${task.completed ? 'completed' : ''}`}>
                {task.title}
              </h3>
              
              <div className="task-badges">
                {/* Priority Badge */}
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority}
                </span>
                
                {/* Category Badge */}
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

            {/* Description */}
            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            {/* Meta Information */}
            <div className="task-meta">
              {dueStatus && (
                <div className={`task-due ${dueStatus.status}`}>
                  <Calendar size={14} />
                  <span>{dueStatus.text}</span>
                  {dueStatus.status === 'overdue' && <AlertTriangle size={14} />}
                </div>
              )}

              {task.reminder_datetime && (
                <div className="task-reminder">
                  <Clock size={14} />
                  <span>Reminder: {format(new Date(task.reminder_datetime), 'MMM d, p')}</span>
                </div>
              )}

              {task.notes && (
                <div className="task-notes">
                  <MessageSquare size={14} />
                  <span>Has notes</span>
                </div>
              )}

              {hasSubtasks && (
                <div className="task-subtasks-meta">
                  <button
                    className="subtasks-toggle"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSubtasks(!showSubtasks)
                    }}
                  >
                    {showSubtasks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{completedSubtasks}/{task.subtasks.length} subtasks</span>
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar for Subtasks */}
            {hasSubtasks && (
              <div className="subtasks-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="task-actions">
            <button
              className="task-action-btn edit-btn"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              title="Edit task"
            >
              <Edit3 size={16} />
            </button>

            <button
              className="task-action-btn delete-btn"
              onClick={handleDelete}
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>

            {/* Drag Handle */}
            <div 
              className="drag-handle"
              {...listeners}
              title="Drag to reorder"
            >
              ⋮⋮
            </div>
          </div>
        </div>

        {/* Expanded Subtasks */}
        {hasSubtasks && showSubtasks && (
          <div className="subtasks-expanded">
            {task.subtasks.map(subtask => (
              <div key={subtask.id} className="subtask-item">
                <button
                  className="subtask-checkbox"
                  onClick={() => handleSubtaskToggle(subtask.id)}
                >
                  {subtask.completed ? (
                    <CheckCircle2 size={16} className="text-success" />
                  ) : (
                    <Circle size={16} className="text-muted" />
                  )}
                </button>
                <span className={`subtask-title ${subtask.completed ? 'completed' : ''}`}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  )
}

export default TaskItem