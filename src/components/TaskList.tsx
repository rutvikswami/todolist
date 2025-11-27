import React from 'react'
import { useTodo } from '../contexts/TodoContext'
import TaskItem from './TaskItem'
import ContinuousTaskCard from './ContinuousTaskCard'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

const TaskList = ({ onEditTask, showContinuous = false }) => {
  const { tasks, loading, filters, reorderTasks } = useTodo()
  
  // Filter tasks based on type
  const filteredTasks = showContinuous 
    ? tasks.filter(task => task.task_type === 'continuous')
    : tasks.filter(task => task.task_type !== 'continuous')

  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const oldIndex = filteredTasks.findIndex(task => task.id === active.id)
    const newIndex = filteredTasks.findIndex(task => task.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTasks = [...filteredTasks]
      const [removed] = reorderedTasks.splice(oldIndex, 1)
      reorderedTasks.splice(newIndex, 0, removed)
      
      await reorderTasks(reorderedTasks)
    }
  }

  const getViewTitle = () => {
    switch (filters.view) {
      case 'today': return 'Today'
      case 'upcoming': return 'Upcoming'
      case 'completed': return 'Completed Tasks'
      case 'all': return 'All Tasks'
      default: return 'Tasks'
    }
  }

  const getFilterInfo = () => {
    let info = []
    if (filters.category) {
      info.push(`Category: ${filters.category}`)
    }
    if (filters.priority) {
      info.push(`Priority: ${filters.priority}`)
    }
    if (filters.search) {
      info.push(`Search: "${filters.search}"`)
    }
    return info.join(' • ')
  }

  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="task-list">
      {/* Header */}
      <div className="task-list-header">
        <div>
          <h2 className="task-list-title">{getViewTitle()}</h2>
          {getFilterInfo() && (
            <p className="task-list-filters">{getFilterInfo()}</p>
          )}
        </div>
        <div className="task-list-stats">
          <span className="task-count">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            {filters.view === 'completed' ? (
              <>
                <h3>No completed tasks</h3>
                <p>Tasks you complete will appear here</p>
              </>
            ) : (
              <>
                <h3>No tasks yet</h3>
                <p>Create your first task to get started</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => onEditTask()}
                >
                  Create Task
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <DndContext 
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={filteredTasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="task-list-items">
              {filteredTasks.map(task => (
                task.task_type === 'continuous' ? (
                  <ContinuousTaskCard
                    key={task.id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                  />
                ) : (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                  />
                )
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export default TaskList