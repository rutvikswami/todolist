import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Clock, Calendar } from 'lucide-react'
import { useTodo } from '../contexts/TodoContext'
import { format } from 'date-fns'

const TaskModal = ({ task, onClose, onSave }) => {
  const { createTask, updateTask, categories, addSubtask, toggleSubtask } = useTodo()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category_id: null,
    due_date: '',
    reminder_datetime: '',
    task_type: 'regular',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    notes: ''
  })

  const [subtasks, setSubtasks] = useState([])
  const [newSubtask, setNewSubtask] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category_id: task.category_id || null,
        due_date: task.due_date || '',
        reminder_datetime: task.reminder_datetime ? format(new Date(task.reminder_datetime), "yyyy-MM-dd'T'HH:mm") : '',
        task_type: task.task_type || 'regular',
        start_time: task.start_time ? format(new Date(task.start_time), "yyyy-MM-dd'T'HH:mm") : '',
        end_time: task.end_time ? format(new Date(task.end_time), "yyyy-MM-dd'T'HH:mm") : '',
        duration_minutes: task.duration_minutes || 60,
        notes: task.notes || ''
      })
      setSubtasks(task.subtasks || [])
    }
  }, [task])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        due_date: formData.due_date || null,
        reminder_datetime: formData.reminder_datetime ? new Date(formData.reminder_datetime).toISOString() : null,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
        category_id: formData.category_id || null
      }

      if (task?.id) {
        await updateTask(task.id, taskData)
      } else {
        await createTask(taskData)
      }

      onSave()
    } catch (error) {
      console.error('Error saving task:', error)
      alert('Failed to save task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubtask = async (e) => {
    e.preventDefault()
    if (!newSubtask.trim() || !task?.id) return

    try {
      await addSubtask(task.id, newSubtask.trim())
      setNewSubtask('')
    } catch (error) {
      console.error('Error adding subtask:', error)
    }
  }

  const handleSubtaskToggle = async (subtaskId) => {
    try {
      await toggleSubtask(subtaskId)
    } catch (error) {
      console.error('Error toggling subtask:', error)
    }
  }

  const handleTaskTypeChange = (type) => {
    setFormData(prev => {
      const updated = { ...prev, task_type: type }
      
      if (type === 'continuous' && !prev.start_time) {
        const now = new Date()
        const endTime = new Date(now.getTime() + (prev.duration_minutes || 60) * 60 * 1000)
        updated.start_time = format(now, "yyyy-MM-dd'T'HH:mm")
        updated.end_time = format(endTime, "yyyy-MM-dd'T'HH:mm")
      }
      
      return updated
    })
  }

  const handleDurationChange = (minutes) => {
    setFormData(prev => {
      const updated = { ...prev, duration_minutes: minutes }
      
      if (prev.start_time) {
        const startTime = new Date(prev.start_time)
        const endTime = new Date(startTime.getTime() + minutes * 60 * 1000)
        updated.end_time = format(endTime, "yyyy-MM-dd'T'HH:mm")
      }
      
      return updated
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {task?.id ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Task Type */}
            <div className="form-group">
              <label className="form-label">Task Type</label>
              <div className="task-type-tabs">
                <button
                  type="button"
                  className={`task-type-tab ${formData.task_type === 'regular' ? 'active' : ''}`}
                  onClick={() => handleTaskTypeChange('regular')}
                >
                  Regular Task
                </button>
                <button
                  type="button"
                  className={`task-type-tab ${formData.task_type === 'continuous' ? 'active' : ''}`}
                  onClick={() => handleTaskTypeChange('continuous')}
                >
                  <Clock size={16} />
                  Continuous Task
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="textarea"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                rows="3"
              />
            </div>

            {/* Priority and Category */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="select"
                  value={formData.priority}
                  onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="select"
                  value={formData.category_id || ''}
                  onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value || null }))}
                >
                  <option value="">No category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date and Reminder */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.due_date}
                  onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reminder</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.reminder_datetime}
                  onChange={e => setFormData(prev => ({ ...prev, reminder_datetime: e.target.value }))}
                />
              </div>
            </div>

            {/* Continuous Task Settings */}
            {formData.task_type === 'continuous' && (
              <div className="continuous-task-settings">
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  <Clock size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                  Time Settings
                </h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={formData.start_time}
                      onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <select
                      className="select"
                      value={formData.duration_minutes}
                      onChange={e => handleDurationChange(parseInt(e.target.value))}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                      <option value={180}>3 hours</option>
                    </select>
                  </div>
                </div>

                {formData.start_time && (
                  <div className="time-preview">
                    <Calendar size={16} />
                    <span>
                      Scheduled: {format(new Date(formData.start_time), 'PPP p')} 
                      ({formData.duration_minutes} minutes)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="textarea"
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
                rows="2"
              />
            </div>

            {/* Subtasks */}
            {task?.id && (
              <div className="form-group">
                <label className="form-label">Subtasks</label>
                
                {/* Add subtask */}
                <div className="subtask-add">
                  <input
                    type="text"
                    className="input"
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAddSubtask}
                    disabled={!newSubtask.trim()}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtask list */}
                {subtasks.length > 0 && (
                  <div className="subtask-list">
                    {subtasks.map(subtask => (
                      <div key={subtask.id} className="subtask-item">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleSubtaskToggle(subtask.id)}
                          className="subtask-checkbox"
                        />
                        <span className={subtask.completed ? 'completed' : ''}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !formData.title.trim()}>
              {loading ? 'Saving...' : task?.id ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal