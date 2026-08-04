'use client'

import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExplorerNode } from './types'

interface StudioExplorerProps {
  explorerTree: ExplorerNode[]
  selectedNodeId: string
  selectedPageId: string
  onSelectNode: (node: ExplorerNode) => void
  onSelectPage: (pageId: string) => void
}

export function StudioExplorer({
  explorerTree,
  selectedNodeId,
  selectedPageId,
  onSelectNode,
  onSelectPage,
}: StudioExplorerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['pages-root', 'entities-root', 'components-root'])
  )

  const handleToggle = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderNode = (node: ExplorerNode, depth = 0) => {
    const isGroup = node.kind === 'group' || node.kind === 'workspace'
    const isExpanded = expandedIds.has(node.id)

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
            selectedNodeId === node.id ? 'bg-primary/10 text-foreground' : 'text-foreground hover:bg-muted'
          }`}
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
        >
          {isGroup ? (
            <button
              type="button"
              onClick={() => handleToggle(node.id)}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {node.label}
            </button>
          ) : (
            <Button
              variant={selectedNodeId === node.id ? 'default' : 'ghost'}
              onClick={() => {
                onSelectNode(node)
                if (node.kind === 'page') {
                  onSelectPage(node.itemId)
                }
              }}
              className="w-full justify-start px-0 py-0 text-left text-sm"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span>{node.label}</span>
                {node.kind === 'page' && node.itemId === selectedPageId ? (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">Active</span>
                ) : null}
              </span>
            </Button>
          )}
        </div>

        {isGroup && isExpanded && node.children?.length ? (
          <div className="space-y-1">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        ) : null}
      </div>
    )
  }

  const renderedTree = useMemo(
    () => explorerTree.map((node) => renderNode(node, 0)),
    [explorerTree, selectedNodeId, selectedPageId, expandedIds]
  )

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card/80">
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Explorer</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">Workspace Tree</h2>
        <p className="text-sm text-muted-foreground">Pages, entities, components, and automation.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-3">{renderedTree}</div>
      </div>
    </div>
  )
}
