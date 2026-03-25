import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AuthModal from '../../components/AuthModal'
import React from 'react'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock the AuthContext login/register
const mockLogin = vi.fn()
const mockRegister = vi.fn()

vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext')
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
      register: mockRegister,
      isAuthenticated: false,
      user: null,
      logout: vi.fn(),
      isLoading: false
    })
  }
})

describe('AuthModal', () => {
  it('renders login form by default', () => {
    const onClose = vi.fn()
    render(<AuthModal onClose={onClose} />)
    
    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
  })

  it('can switch to registration form', () => {
    const onClose = vi.fn()
    render(<AuthModal onClose={onClose} />)
    
    const switchBtn = screen.getByText(/Create one/i)
    fireEvent.click(switchBtn)
    
    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('submits login form and calls login context', async () => {
    const onClose = vi.fn()
    render(<AuthModal onClose={onClose} />)
    
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } })
    
    const submitBtn = screen.getByRole('button', { name: 'Log In' })
    fireEvent.click(submitBtn)
    
    expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123')
  })
})
