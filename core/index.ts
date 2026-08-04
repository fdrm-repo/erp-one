/**
 * Core Platform Exports
 * All platform engines and services in one place
 */

// Metadata Engine - Register, load, validate, cache, version metadata
export { metadataEngine } from './engines/metadata-engine';

// Entity Engine - Every business object becomes a generic Entity
export { entityEngine } from './engines/entity-engine';

// Component Registry - UI components self-register
export { componentRegistry } from './engines/component-registry';

// Template Registry - Templates define UI without code
export { templateRegistry } from './engines/template-registry';

// Workspace Engine - Generic workspace for any entity
export { workspaceEngine } from './engines/workspace-engine';

// Module SDK - Convention over Configuration module installation
export { moduleSDK } from './module-sdk';

// Event System
export { eventBus, SystemEvents } from './event-bus';
export type { EventPayload, EventHandler } from './event-bus';

// Theme System
export { themeEngine } from './theme-engine';

// Legacy Module System (deprecated - use moduleSDK instead)
export { moduleLoader } from './module-loader';
export type { IModule } from './module-loader';

// Authentication
export { authService } from './auth';

// Layout System
export { layoutEngine } from './layout-engine';
export type { ResolvedLayout, ResolvedSection } from './layout-engine';

// Navigation System
export { navigationEngine } from './navigation-engine';

// Platform Context
export type { PlatformContext } from '@/types';
