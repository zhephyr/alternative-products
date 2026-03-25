import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import React from 'react'

// Mock global fetch
global.fetch = vi.fn()

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('provides default logged out state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('can login a user', async () => {
    const mockTokens = { access_token: 'acc_token', refresh_token: 'ref_token', token_type: 'bearer' }
    const mockUser = { id: '123', username: 'testuser' }
    
    // We mock the first fetch as the login, second as the /me profile fetch
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokens,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

    await act(async () => {
      await result.current.login('testuser', 'password')
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(localStorage.getItem('access_token')).toBe('acc_token')
  })

  it('can logout a user', async () => {
    // Manually set initial logged in state via localStorage
    localStorage.setItem('access_token', 'acc_token')
    localStorage.setItem('refresh_token', 'ref_token')
    
    const mockUser = { id: '123', username: 'testuser' }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    // Wait for the initial /me fetch to populate the user
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(true)

    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})
