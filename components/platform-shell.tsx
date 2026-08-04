'use client'

/**
 * Platform Shell
 * Main application wrapper containing sidebar, navbar, and content area
 * Renders based on metadata-driven navigation
 */

import React, { useState, useEffect } from 'react'
import { navigationEngine } from '@/core'
import Sidebar from './sidebar'
import Navbar from './navbar'

interface PlatformShellProps {
  children: React.ReactNode
  title?: string
}

export default function PlatformShell({ children, title }: PlatformShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [navigation, setNavigation] = useState<any[]>([])

  useEffect(() => {
    // Build navigation from modules
    const nav = navigationEngine.getNavigation()
    setNavigation(nav)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        navigation={navigation}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          title={title}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
