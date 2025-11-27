import React, { useState, useRef, useEffect } from 'react'
import { Plus, Zap } from 'lucide-react'

const QuickAdd = ({ onTaskCreate }) => {
  const [title, setTitle] = useState('')
  const [taskType, setTaskType] = useState('regular')
  const inputRef = useRef(null)

  // Focus on Ctrl+N
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    // Create task template
    const taskTemplate = {
      title: title.trim(),
      description: '',
      priority: 'medium',
      task_type: taskType,
      due_date: null,
      category_id: null
    }

    // Add defaults for continuous tasks
    if (taskType === 'continuous') {
      const now = new Date()
      const endTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour later
      
      taskTemplate.start_time = now.toISOString()
      taskTemplate.end_time = endTime.toISOString()
      taskTemplate.duration_minutes = 60
    }

    // Open task modal with template
    if (window.openTaskModal) {
      window.openTaskModal(taskTemplate)
      setTitle('')
    } else {
      onTaskCreate(taskTemplate)
    }
  }

  return (
    <div className="quick-add">
      <form onSubmit={handleSubmit} className="quick-add-form">
        <div className="quick-add-input-container">
          <input
            ref={inputRef}
            type="text"
            placeholder="What needs to be done? (Press Enter for details, Ctrl+N to focus)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="quick-add-input"
          />
          
          {title.trim() && (
            <div className="quick-add-actions">
              <select 
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="quick-add-type-select"
              >
                <option value="regular">Regular Task</option>
                <option value="continuous">Continuous Task</option>
              </select>
              
              <button type="submit" className="quick-add-submit">
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
        
        {taskType === 'continuous' && title.trim() && (
          <div className="quick-add-hint">
            <Zap size={14} />
            <span>Continuous task - will open with timer settings</span>
          </div>
        )}
      </form>
    </div>
  )
}

export default QuickAdd