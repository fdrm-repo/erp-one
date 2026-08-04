/**
 * Workspace Engine
 * Every entity opens the same generic Workspace
 * Never create CustomerPage, ShipmentPage, VendorPage, etc.
 * The Workspace Engine renders everything
 */

import type { Entity, EntityMetadata } from '@/types/runtime';
import { metadataEngine } from './metadata-engine';

interface WorkspaceLayout {
  header: WorkspaceHeader;
  actions: WorkspaceActions;
  tabs: WorkspaceTab[];
  content: WorkspaceContent;
  sidebar: WorkspaceSidebar;
  activity: WorkspaceActivity;
}

interface WorkspaceHeader {
  entity: string;
  title: string;
  subtitle?: string;
  icon?: string;
  breadcrumbs: Array<{ label: string; path: string }>;
}

interface WorkspaceActions {
  primary: Array<{ id: string; label: string; icon?: string }>;
  secondary: Array<{ id: string; label: string; icon?: string }>;
  menu: Array<{ id: string; label: string; icon?: string }>;
}

interface WorkspaceTab {
  id: string;
  label: string;
  icon?: string;
  active: boolean;
}

interface WorkspaceContent {
  sections: Array<{ id: string; name: string; fields: string[] }>;
  relationships?: Array<{ id: string; name: string; entity: string }>;
}

interface WorkspaceSidebar {
  attachments?: boolean;
  activities?: boolean;
  timeline?: boolean;
  approvals?: boolean;
}

interface WorkspaceActivity {
  enabled: boolean;
  maxItems: number;
}

class WorkspaceEngine {
  /**
   * Generate workspace layout for any entity
   */
  generateWorkspace(
    entityMetadata: EntityMetadata,
    entity: Entity
  ): WorkspaceLayout {
    const entityName = entityMetadata.label || entityMetadata.name;

    const workspace: WorkspaceLayout = {
      header: {
        entity: entityMetadata.id,
        title: entityName,
        subtitle: `ID: ${entity.id}`,
        breadcrumbs: [
          { label: 'Home', path: '/' },
          { label: entityMetadata.plural, path: `/entities/${entityMetadata.name}` },
          { label: entityName, path: `/entities/${entityMetadata.name}/${entity.id}` },
        ],
      },
      actions: this.generateActions(entityMetadata),
      tabs: this.generateTabs(entityMetadata),
      content: this.generateContent(entityMetadata),
      sidebar: this.generateSidebar(entityMetadata),
      activity: { enabled: true, maxItems: 50 },
    };

    return workspace;
  }

  /**
   * Generate actions based on entity features
   */
  private generateActions(metadata: EntityMetadata): WorkspaceActions {
    const actions: WorkspaceActions = {
      primary: [{ id: 'save', label: 'Save', icon: 'save' }],
      secondary: [],
      menu: [
        { id: 'duplicate', label: 'Duplicate', icon: 'copy' },
        { id: 'export', label: 'Export', icon: 'download' },
        { id: 'print', label: 'Print', icon: 'printer' },
      ],
    };

    if (metadata.features.approvals) {
      actions.secondary.push(
        { id: 'approve', label: 'Approve', icon: 'check' },
        { id: 'reject', label: 'Reject', icon: 'x' }
      );
    }

    if (metadata.features.attachments) {
      actions.secondary.push({ id: 'attach', label: 'Attach', icon: 'paperclip' });
    }

    actions.menu.push({ id: 'delete', label: 'Delete', icon: 'trash' });
    actions.menu.push({ id: 'archive', label: 'Archive', icon: 'archive' });

    return actions;
  }

  /**
   * Generate tabs based on entity features
   */
  private generateTabs(metadata: EntityMetadata): WorkspaceTab[] {
    const tabs: WorkspaceTab[] = [
      { id: 'details', label: 'Details', icon: 'file', active: true },
    ];

    if (metadata.relationships.size > 0) {
      tabs.push({ id: 'relationships', label: 'Relationships', icon: 'link' });
    }

    if (metadata.features.attachments) {
      tabs.push({ id: 'attachments', label: 'Attachments', icon: 'paperclip' });
    }

    if (metadata.features.activities) {
      tabs.push({ id: 'activities', label: 'Activities', icon: 'message-square' });
    }

    if (metadata.features.timeline) {
      tabs.push({ id: 'timeline', label: 'Timeline', icon: 'clock' });
    }

    if (metadata.features.approvals) {
      tabs.push({ id: 'approvals', label: 'Approvals', icon: 'check-circle' });
    }

    return tabs;
  }

  /**
   * Generate content sections
   */
  private generateContent(metadata: EntityMetadata): WorkspaceContent {
    const fields = Array.from(metadata.fields.values());
    const relationships = Array.from(metadata.relationships.values());

    const sections: Array<{ id: string; name: string; fields: string[] }> = [];

    // Main details section
    const detailsSection = {
      id: 'details',
      name: 'Details',
      fields: fields
        .filter(f => !f.readOnly)
        .slice(0, 20)
        .map(f => f.name),
    };
    sections.push(detailsSection);

    // Custom sections based on field groups
    const fieldsByGroup: Record<string, string[]> = {};
    fields.forEach(f => {
      const group = (f.metadata?.group as string) || 'General';
      if (!fieldsByGroup[group]) {
        fieldsByGroup[group] = [];
      }
      fieldsByGroup[group].push(f.name);
    });

    Object.entries(fieldsByGroup).forEach(([group, groupFields]) => {
      if (group !== 'General' && groupFields.length > 0) {
        sections.push({
          id: group.toLowerCase().replace(/\s+/g, '-'),
          name: group,
          fields: groupFields.slice(0, 10),
        });
      }
    });

    return {
      sections,
      relationships: relationships.map(r => ({
        id: r.name,
        name: r.name,
        entity: r.targetEntity,
      })),
    };
  }

  /**
   * Generate sidebar configuration
   */
  private generateSidebar(metadata: EntityMetadata): WorkspaceSidebar {
    return {
      attachments: metadata.features.attachments,
      activities: metadata.features.activities,
      timeline: metadata.features.timeline,
      approvals: metadata.features.approvals,
    };
  }

  /**
   * Get workspace header
   */
  getHeader(
    entityId: string,
    entity: Entity
  ): WorkspaceHeader | null {
    const metadata = metadataEngine.getEntity(entityId);
    if (!metadata) return null;

    return {
      entity: entityId,
      title: metadata.label,
      subtitle: `ID: ${entity.id}`,
      breadcrumbs: [
        { label: 'Home', path: '/' },
        { label: metadata.plural, path: `/entities/${metadata.name}` },
        { label: metadata.label, path: `/entities/${metadata.name}/${entity.id}` },
      ],
    };
  }

  /**
   * Get workspace actions
   */
  getActions(entityId: string): WorkspaceActions | null {
    const metadata = metadataEngine.getEntity(entityId);
    if (!metadata) return null;
    return this.generateActions(metadata);
  }

  /**
   * Get workspace tabs
   */
  getTabs(entityId: string): WorkspaceTab[] | null {
    const metadata = metadataEngine.getEntity(entityId);
    if (!metadata) return null;
    return this.generateTabs(metadata);
  }

  /**
   * Get workspace content
   */
  getContent(entityId: string): WorkspaceContent | null {
    const metadata = metadataEngine.getEntity(entityId);
    if (!metadata) return null;
    return this.generateContent(metadata);
  }
}

// Singleton instance
export const workspaceEngine = new WorkspaceEngine();

export type {
  WorkspaceLayout,
  WorkspaceHeader,
  WorkspaceActions,
  WorkspaceTab,
  WorkspaceContent,
  WorkspaceSidebar,
  WorkspaceActivity,
};
