import React, { useState } from 'react'
import { useTodo } from '../contexts/TodoContext'
import TaskList from '../components/TaskList'
import TaskModal from '../components/TaskModal'
import QuickAdd from '../components/QuickAdd'

const HomePage = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const openTaskModal = (task = null) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setEditingTask(null)
    setIsTaskModalOpen(false)
  }

  // Make openTaskModal globally available for components
  React.useEffect(() => {
    window.openTaskModal = openTaskModal
    return () => {
      delete window.openTaskModal
    }
  }, [])

  return (
    <div className="home-page">
      <QuickAdd onTaskCreate={() => openTaskModal()} />
      <TaskList onEditTask={openTaskModal} />

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

export default HomePage