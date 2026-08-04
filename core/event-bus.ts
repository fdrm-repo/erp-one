/**
 * Event Bus
 * Central event dispatcher for all platform events
 * Enables loose coupling between modules and systems
 */

export type EventPayload = Record<string, unknown>;
export type EventHandler = (payload: EventPayload) => void | Promise<void>;

export enum SystemEvents {
  // Module Events
  MODULE_INSTALLED = 'module:installed',
  MODULE_UNINSTALLED = 'module:uninstalled',
  MODULE_ENABLED = 'module:enabled',
  MODULE_DISABLED = 'module:disabled',

  // Entity Events
  ENTITY_CREATED = 'entity:created',
  ENTITY_UPDATED = 'entity:updated',
  ENTITY_DELETED = 'entity:deleted',
  ENTITY_VALIDATED = 'entity:validated',

  // Workflow Events
  WORKFLOW_STATE_CHANGED = 'workflow:state_changed',
  WORKFLOW_TRANSITION = 'workflow:transition',
  APPROVAL_REQUESTED = 'approval:requested',
  APPROVAL_APPROVED = 'approval:approved',
  APPROVAL_REJECTED = 'approval:rejected',

  // Notification Events
  NOTIFICATION_CREATED = 'notification:created',
  NOTIFICATION_READ = 'notification:read',

  // Permission Events
  PERMISSION_CHANGED = 'permission:changed',
  ROLE_ASSIGNED = 'role:assigned',

  // Theme Events
  THEME_CHANGED = 'theme:changed',

  // Workspace Events
  WORKSPACE_CREATED = 'workspace:created',
  WORKSPACE_UPDATED = 'workspace:updated',
  WORKSPACE_DELETED = 'workspace:deleted',

  // Authentication Events
  USER_LOGGED_IN = 'auth:login',
  USER_LOGGED_OUT = 'auth:logout',
}

class EventBus {
  private static instance: EventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: Array<{ event: string; payload: EventPayload; timestamp: Date }> = [];
  private maxHistorySize: number = 1000;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event
   */
  public subscribe(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  /**
   * Subscribe to an event once
   */
  public once(event: string, handler: EventHandler): () => void {
    const wrappedHandler = async (payload: EventPayload) => {
      await handler(payload);
      unsubscribe();
    };

    const unsubscribe = this.subscribe(event, wrappedHandler);
    return unsubscribe;
  }

  /**
   * Emit an event
   */
  public async emit(event: string, payload: EventPayload = {}): Promise<void> {
    // Add to history
    this.addToHistory(event, payload);

    const handlers = this.handlers.get(event);
    if (!handlers || handlers.size === 0) {
      return;
    }

    // Execute all handlers
    const promises = Array.from(handlers).map((handler) =>
      Promise.resolve().then(() => handler(payload))
    );

    await Promise.all(promises);
  }

  /**
   * Emit event synchronously
   */
  public emitSync(event: string, payload: EventPayload = {}): void {
    // Add to history
    this.addToHistory(event, payload);

    const handlers = this.handlers.get(event);
    if (!handlers || handlers.size === 0) {
      return;
    }

    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    });
  }

  /**
   * Get all handlers for an event
   */
  public getHandlers(event: string): Set<EventHandler> {
    return this.handlers.get(event) || new Set();
  }

  /**
   * Remove all handlers for an event
   */
  public unsubscribeAll(event: string): void {
    this.handlers.delete(event);
  }

  /**
   * Clear all handlers
   */
  public clear(): void {
    this.handlers.clear();
  }

  /**
   * Get event history
   */
  public getHistory(event?: string): Array<{ event: string; payload: EventPayload; timestamp: Date }> {
    if (event) {
      return this.eventHistory.filter((entry) => entry.event === event);
    }
    return this.eventHistory;
  }

  /**
   * Clear event history
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Add event to history
   */
  private addToHistory(event: string, payload: EventPayload): void {
    this.eventHistory.push({
      event,
      payload,
      timestamp: new Date(),
    });

    // Keep history size under control
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get stats
   */
  public getStats(): {
    uniqueEvents: number;
    totalHandlers: number;
    historySize: number;
  } {
    return {
      uniqueEvents: this.handlers.size,
      totalHandlers: Array.from(this.handlers.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      historySize: this.eventHistory.length,
    };
  }
}

export const eventBus = EventBus.getInstance();
