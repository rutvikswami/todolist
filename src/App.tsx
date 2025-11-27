import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TodoProvider } from './contexts/TodoContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import ContinuousTasksPage from './pages/ContinuousTasksPage'
import './App.css'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
      <AuthProvider>
        <TodoProvider>
          <Router>
            <ProtectedRoute>
              <div className="app">
                <Header 
                  onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <div className="app-body">
                  <Sidebar 
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                  />

                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/continuous" element={<ContinuousTasksPage />} />
                    </Routes>
                  </main>
                </div>

                {isSidebarOpen && (
                  <div 
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                  />
                )}
              </div>
            </ProtectedRoute>
          </Router>
        </TodoProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App