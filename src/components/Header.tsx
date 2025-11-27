import React, { useState } from 'react'
import { Menu, Plus, Sun, Moon, Search, User, LogOut, Settings } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useTodo } from '../contexts/TodoContext'

const Header = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { filters, setFilters } = useTodo()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h1 className="header-title">Todo App</h1>
      </div>

      <div className="header-center" style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} 
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div className="header-right">
        <button 
          className="btn btn-ghost btn-sm"
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <div className="user-menu-container" style={{ position: 'relative' }}>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="User menu"
          >
            <User size={18} />
          </button>
          
          {showUserMenu && (
            <div className="user-menu" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-large)',
              padding: '12px',
              minWidth: '200px',
              zIndex: 1000
            }}>
              <div style={{ padding: '8px 12px', marginBottom: '8px' }}>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                  {user?.email}
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
              <button 
                className="menu-item" 
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'var(--color-hover)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                <Settings size={16} />
                Settings
              </button>
              <button 
                className="menu-item sign-out" 
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--color-error, #dc2626)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {showUserMenu && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)} 
        />
      )}
    </header>
  )
}

export default Header