'use client'

export interface ExplorerNode {
  id: string
  label: string
  kind: string
  itemId: string
  description: string
  data: any
  children?: ExplorerNode[]
}

export interface DesignerMode {
  id: string
  label: string
}

export type StudioComponentSize = 'small' | 'medium' | 'large'

export interface StudioComponent {
  id: string
  kind: string
  title: string
  entityId?: string
  size: StudioComponentSize
  properties: Record<string, unknown>
}

export interface StudioPage {
  id: string
  name: string
  title: string
  entityId?: string
  components: StudioComponent[]
}

export interface StudioWorkspace {
  id: string
  name: string
  pages: StudioPage[]
}

export interface StudioLog {
  id: string
  message: string
  timestamp: number
}

export interface StudioLayoutState {
  horizontalLayout: {
    explorer: number
    canvas: number
    inspector: number
  }
  consoleOpen: boolean
}
