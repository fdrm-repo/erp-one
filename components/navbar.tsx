'use client'

/**
 * Navbar Component
 * Top navigation bar with user menu and workspace switcher
 * Responsive and metadata-aware
 */

import React, { useState } from 'react'
import { Menu, Bell, Settings, LogOut, User } from 'lucide-react'
import { authService } from '@/core'

interface NavbarProps {
  title?: string
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Navbar({
  title,
  sidebarOpen,
  onToggleSidebar,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const context = authService.getContext()

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground">
                {context?.userId || 'User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {context?.userRole || 'Guest'}
              </p>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-t border-border">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={() => {
                  authService.logout()
                  setShowUserMenu(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-border"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
