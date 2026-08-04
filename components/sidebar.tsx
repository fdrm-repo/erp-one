'use client'

/**
 * Sidebar Component
 * Renders metadata-driven navigation hierarchy
 * Collapsible, responsive, and permission-aware
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronDown, Menu } from 'lucide-react'
import type { NavigationItem } from '@/types'

interface SidebarProps {
  isOpen: boolean
  navigation: NavigationItem[]
  onToggle: () => void
}

export default function Sidebar({ isOpen, navigation, onToggle }: SidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpanded(newExpanded)
  }

  if (!isOpen) {
    return (
      <div className="w-16 bg-card border-r border-border flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">ERP ONE</h1>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-muted rounded-lg transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <NavItems
          items={navigation}
          expanded={expanded}
          onToggle={toggleExpanded}
          level={0}
        />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground">
        <p>v0.1.0</p>
        <p>Platform Core</p>
      </div>
    </aside>
  )
}

interface NavItemsProps {
  items: NavigationItem[]
  expanded: Set<string>
  onToggle: (id: string) => void
  level: number
}

function NavItems({ items, expanded, onToggle, level }: NavItemsProps) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <NavItem
            item={item}
            isExpanded={expanded.has(item.id)}
            onToggle={onToggle}
            level={level}
            hasChildren={!!(item.children && item.children.length > 0)}
          />

          {item.children && item.children.length > 0 && expanded.has(item.id) && (
            <NavItems
              items={item.children}
              expanded={expanded}
              onToggle={onToggle}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

interface NavItemProps {
  item: NavigationItem
  isExpanded: boolean
  onToggle: (id: string) => void
  level: number
  hasChildren: boolean
}

function NavItem({
  item,
  isExpanded,
  onToggle,
  level,
  hasChildren,
}: NavItemProps) {
  const paddingLeft = `${level * 16}px`

  if (!item.path && hasChildren) {
    return (
      <button
        onClick={() => onToggle(item.id)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left text-sm text-foreground"
        style={{ paddingLeft }}
      >
        <span className="flex-1">{item.label}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    )
  }

  if (item.path) {
    return (
      <Link
        href={item.path}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
        style={{ paddingLeft }}
      >
        {item.icon && <span className="w-4 h-4">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
      </Link>
    )
  }

  return null
}
