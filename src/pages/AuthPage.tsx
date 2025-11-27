import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from 'lucide-react'
import '../styles/auth.css'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  displayName: string
}

const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth()
  const { theme } = useTheme()
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email')
      return false
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        setError('Password is required')
        return false
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return false
      }

      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }

        if (!formData.displayName.trim()) {
          setError('Display name is required')
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(formData.email, formData.password, formData.displayName)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Account created! Please check your email to verify your account.')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(formData.email)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Password reset email sent! Please check your inbox.')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    })
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode: 'signin' | 'signup' | 'reset') => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Modern Todo</h1>
          <p>
            {mode === 'signin' && 'Welcome back! Sign in to your account'}
            {mode === 'signup' && 'Create your account to get started'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'reset' && (
            <button
              type="button"
              className="back-button"
              onClick={() => switchMode('signin')}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </button>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="displayName">
                <User size={18} />
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required={mode === 'signup'}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <Lock size={18} />
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                {mode === 'signin' && <><LogIn size={18} /> Sign In</>}
                {mode === 'signup' && <><UserPlus size={18} /> Create Account</>}
                {mode === 'reset' && <><Mail size={18} /> Send Reset Email</>}
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                className="link-button"
                onClick={() => switchMode('signup')}
              >
                Don't have an account? Sign up
              </button>
              <button
                type="button"
                className="link-button"
                onClick={() => switchMode('reset')}
              >
                Forgot your password?
              </button>
            </>
          )}

          {mode === 'signup' && (
            <button
              type="button"
              className="link-button"
              onClick={() => switchMode('signin')}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>

    </div>
  )
}

export default AuthPage