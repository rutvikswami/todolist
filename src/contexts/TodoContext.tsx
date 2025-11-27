import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { startOfDay, endOfDay, addDays, format } from 'date-fns'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'

const TodoContext = createContext()

export const useTodo = () => {
  const context = useContext(TodoContext)
  if (!context) {
    throw new Error('useTodo must be used within a TodoProvider')
  }
  return context
}

export const TodoProvider = ({ children }) => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    view: 'today', // today, upcoming, all, completed
    category: null,
    priority: null,
    search: ''
  })
  const [sortBy, setSortBy] = useState('due_date') // due_date, priority, created_at

  // Load initial data when user is available
  useEffect(() => {
    if (user) {
      loadCategories()
      loadTasks()
    } else {
      // Clear data when user logs out
      setTasks([])
      setCategories([])
    }
  }, [user, filters])

  const loadCategories = async () => {
    if (!user) return
    
    try {
      if (!supabase || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase not configured. Using demo categories.')
        setCategories([
          { id: '1', name: 'Work', color: '#EF4444' },
          { id: '2', name: 'Personal', color: '#10B981' },
          { id: '3', name: 'Projects', color: '#8B5CF6' }
        ])
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      // Fallback to demo categories on error
      setCategories([
        { id: '1', name: 'Work', color: '#EF4444' },
        { id: '2', name: 'Personal', color: '#10B981' },
        { id: '3', name: 'Projects', color: '#8B5CF6' }
      ])
    }
  }

  const loadTasks = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Check if Supabase is properly configured
      if (!supabase || supabaseUrl.includes('placeholder')) {
        console.warn('Supabase not configured. Using local state only.')
        setLoading(false)
        return
      }

      let query = supabase
        .from('tasks')
        .select(`
          *,
          categories (id, name, color),
          subtasks (id, title, completed, order_index)
        `)
        .eq('user_id', user.id)

      // Apply filters
      if (filters.view === 'today') {
        const today = new Date()
        query = query.gte('due_date', format(startOfDay(today), 'yyyy-MM-dd'))
                    .lte('due_date', format(endOfDay(today), 'yyyy-MM-dd'))
      } else if (filters.view === 'upcoming') {
        const tomorrow = addDays(new Date(), 1)
        const nextWeek = addDays(new Date(), 7)
        query = query.gte('due_date', format(tomorrow, 'yyyy-MM-dd'))
                    .lte('due_date', format(nextWeek, 'yyyy-MM-dd'))
      } else if (filters.view === 'completed') {
        query = query.eq('completed', true)
      } else if (filters.view === 'all') {
        query = query.eq('completed', false)
      }

      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      // Apply sorting
      const sortColumn = sortBy === 'due_date' ? 'due_date' : 
                        sortBy === 'priority' ? 'priority' : 'created_at'
      query = query.order(sortColumn, { ascending: sortBy !== 'priority' })
                  .order('order_index')

      const { data, error } = await query

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      // Handle error silently, keep existing tasks
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      // Add user_id to task data
      const taskWithUser = {
        ...taskData,
        user_id: user.id
      }

      if (!supabase || supabaseUrl.includes('placeholder')) {
        // Create local task
        const newTask = {
          ...taskWithUser,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setTasks(prev => [...prev, newTask])
        return newTask
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskWithUser])
        .select()

      if (error) throw error
      
      // Add to local state
      setTasks(prev => [...prev, data[0]])
      return data[0]
    } catch (error) {
      throw error
    }
  }

  const updateTask = async (id, updates) => {
    try {
      if (!supabase || supabaseUrl.includes('placeholder')) {
        // Update local task
        const updatedTask = { ...updates, updated_at: new Date().toISOString() }
        setTasks(prev => prev.map(task => 
          task.id === id ? { ...task, ...updatedTask } : task
        ))
        return updatedTask
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...data[0] } : task
      ))
      
      return data[0]
    } catch (error) {
      throw error
    }
  }

  const deleteTask = async (id) => {
    try {
      if (!supabase || supabaseUrl.includes('placeholder')) {
        // Delete from local state only
        setTasks(prev => prev.filter(task => task.id !== id))
        return
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (error) {
      throw error
    }
  }

  const toggleTaskComplete = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const updates = {
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null
    }

    await updateTask(id, updates)
  }

  // Continuous task methods
  const startContinuousTask = async (id) => {
    try {
      const now = new Date().toISOString()
      
      // Start new time session
      const { data: sessionData, error: sessionError } = await supabase
        .from('time_sessions')
        .insert([{
          task_id: id,
          start_time: now
        }])

      if (sessionError) throw sessionError

      // Update task as active
      await updateTask(id, {
        is_active: true,
        start_time: now
      })

    } catch (error) {
      throw error
    }
  }

  const stopContinuousTask = async (id) => {
    try {
      const now = new Date().toISOString()
      const task = tasks.find(t => t.id === id)
      
      // Find active session and end it
      const { data: sessions, error: sessionError } = await supabase
        .from('time_sessions')
        .select('*')
        .eq('task_id', id)
        .is('end_time', null)
        .limit(1)

      if (sessionError) throw sessionError

      if (sessions && sessions.length > 0) {
        const session = sessions[0]
        const startTime = new Date(session.start_time)
        const endTime = new Date(now)
        const duration = Math.round((endTime - startTime) / (1000 * 60)) // minutes

        // Update session
        await supabase
          .from('time_sessions')
          .update({
            end_time: now,
            duration_minutes: duration
          })
          .eq('id', session.id)

        // Update task total time
        const newTotalTime = (task.total_time_spent || 0) + duration
        await updateTask(id, {
          is_active: false,
          end_time: now,
          total_time_spent: newTotalTime
        })
      }

    } catch (error) {
      throw error
    }
  }

  // Subtask methods
  const addSubtask = async (taskId, title) => {
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([{
          task_id: taskId,
          title,
          order_index: 0
        }])
        .select()

      if (error) throw error

      // Refresh tasks to get updated subtasks
      await loadTasks()
      return data[0]
    } catch (error) {
      throw error
    }
  }

  const toggleSubtask = async (subtaskId) => {
    try {
      // Get current subtask
      const { data: currentSubtask, error: fetchError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('id', subtaskId)
        .single()

      if (fetchError) throw fetchError

      // Toggle completion
      const { error: updateError } = await supabase
        .from('subtasks')
        .update({
          completed: !currentSubtask.completed,
          completed_at: !currentSubtask.completed ? new Date().toISOString() : null
        })
        .eq('id', subtaskId)

      if (updateError) throw updateError

      // Refresh tasks
      await loadTasks()
    } catch (error) {
      throw error
    }
  }

  // Category methods
  const createCategory = async (name, color) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name, color, user_id: user.id }])
        .select()

      if (error) throw error

      setCategories(prev => [...prev, data[0]])
      return data[0]
    } catch (error) {
      throw error
    }
  }

  // Utility methods
  const clearCompleted = async (taskType = null) => {
    try {
      if (!supabase || supabaseUrl.includes('placeholder')) {
        // Delete from local state only
        setTasks(prev => prev.filter(task => {
          if (!task.completed) return true
          if (taskType === 'continuous') return task.task_type !== 'continuous'
          if (taskType === 'regular') return task.task_type === 'continuous'
          return false // Clear all if no type specified
        }))
        return
      }

      let query = supabase
        .from('tasks')
        .delete()
        .eq('completed', true)

      if (taskType === 'continuous') {
        query = query.eq('task_type', 'continuous')
      } else if (taskType === 'regular') {
        query = query.neq('task_type', 'continuous')
      }

      const { error } = await query

      if (error) throw error

      setTasks(prev => prev.filter(task => {
        if (!task.completed) return true
        if (taskType === 'continuous') return task.task_type !== 'continuous'
        if (taskType === 'regular') return task.task_type === 'continuous'
        return false // Clear all if no type specified
      }))
    } catch (error) {
      throw error
    }
  }

  const reorderTasks = async (reorderedTasks) => {
    try {
      // Update order_index for each task
      const updates = reorderedTasks.map((task, index) => 
        supabase
          .from('tasks')
          .update({ order_index: index })
          .eq('id', task.id)
      )

      await Promise.all(updates)
      setTasks(reorderedTasks)
    } catch (error) {
      throw error
    }
  }

  const value = {
    tasks,
    categories,
    loading,
    filters,
    sortBy,
    setFilters,
    setSortBy,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    startContinuousTask,
    stopContinuousTask,
    addSubtask,
    toggleSubtask,
    createCategory,
    clearCompleted,
    reorderTasks
  }

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}