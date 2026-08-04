/**
 * Platform Adapter Architecture
 *
 * ONE Platform generates Render Trees that are platform-agnostic.
 * Platform Adapters translate Render Trees to target formats:
 *
 * - React Adapter → React components (web)
 * - Flutter Adapter → Flutter widgets (iOS/Android/web)
 * - SwiftUI Adapter → SwiftUI views (iOS/macOS)
 * - Vue Adapter → Vue components (web)
 * - REST Adapter → JSON API (backend)
 * - PDF Adapter → PDF document (reporting)
 * - Email Adapter → HTML email (notifications)
 * - CLI Adapter → Terminal commands (automation)
 *
 * This allows ONE Platform to target unlimited platforms without
 * modifying the core rendering engine.
 */

import type {
  RenderNode,
  RenderComponent,
  RenderProps,
  RenderAction,
  RenderPage,
  RenderWorkspace,
  RenderList,
  RenderDashboard,
} from './render-tree';

// ============================================================================
// PLATFORM ADAPTER BASE
// ============================================================================

/**
 * PlatformAdapter - Base adapter interface
 * All platform-specific adapters implement this interface
 */
export interface PlatformAdapter {
  id: string;
  name: string;
  platform: AdapterPlatform;
  version: string;

  // Lifecycle
  initialize(config: AdapterConfig): Promise<void>;
  dispose(): Promise<void>;

  // Rendering
  renderNode(node: RenderNode, context: RenderContext): Promise<any>;
  renderPage(page: RenderPage, context: RenderContext): Promise<any>;
  renderWorkspace(workspace: RenderWorkspace, context: RenderContext): Promise<any>;
  renderList(list: RenderList, context: RenderContext): Promise<any>;
  renderDashboard(dashboard: RenderDashboard, context: RenderContext): Promise<any>;

  // Component mapping
  mapComponent(component: RenderComponent, props: RenderProps, context: RenderContext): Promise<any>;
  mapAction(action: RenderAction, context: RenderContext): Promise<any>;

  // Utilities
  serializeOutput(output: any, format: string): Promise<Buffer | string>;
  validate(node: RenderNode): Promise<AdapterValidationResult>;
}

export type AdapterPlatform = 'react' | 'flutter' | 'swiftui' | 'vue' | 'rest' | 'pdf' | 'email' | 'cli' | 'custom';

/**
 * AdapterConfig - Configuration for adapter initialization
 */
export interface AdapterConfig {
  theme?: string;
  locale?: string;
  apiBaseUrl?: string;
  assetBaseUrl?: string;
  customProps?: Record<string, any>;
  plugins?: AdapterPlugin[];
  debug?: boolean;
}

/**
 * RenderContext - Context passed during rendering
 */
export interface RenderContext {
  // Runtime context
  userId?: string;
  tenantId?: string;
  locale: string;
  timezone?: string;

  // Execution environment
  environment: 'development' | 'staging' | 'production';
  platform: AdapterPlatform;
  device?: 'mobile' | 'tablet' | 'desktop';
  screenSize?: { width: number; height: number };

  // Feature flags and permissions
  featureFlags?: Record<string, boolean>;
  permissions?: string[];
  roles?: string[];

  // Data context
  data?: Record<string, any>;
  entityData?: Record<string, any>;
  queryParams?: Record<string, any>;

  // Callbacks
  onNavigate?: (url: string) => void;
  onSubmit?: (data: Record<string, any>) => void;
  onError?: (error: AdapterError) => void;
  onLog?: (level: string, message: string) => void;
}

// ============================================================================
// ADAPTER IMPLEMENTATIONS
// ============================================================================

/**
 * ReactAdapter - Renders Render Tree to React components
 */
export interface ReactAdapter extends PlatformAdapter {
  platform: 'react';
  renderNode(node: RenderNode, context: RenderContext): Promise<React.ReactNode>;
  renderPage(page: RenderPage, context: RenderContext): Promise<React.ReactNode>;
  mapComponent(component: RenderComponent, props: RenderProps, context: RenderContext): Promise<React.ReactNode>;
}

/**
 * FlutterAdapter - Renders Render Tree to Flutter widgets
 */
export interface FlutterAdapter extends PlatformAdapter {
  platform: 'flutter';
  renderNode(node: RenderNode, context: RenderContext): Promise<string>; // Dart code
  generateDartFile(page: RenderPage, context: RenderContext): Promise<string>;
  generatePubspec(dependencies: string[]): Promise<string>;
}

/**
 * SwiftUIAdapter - Renders Render Tree to SwiftUI views
 */
export interface SwiftUIAdapter extends PlatformAdapter {
  platform: 'swiftui';
  renderNode(node: RenderNode, context: RenderContext): Promise<string>; // Swift code
  generateSwiftFile(page: RenderPage, context: RenderContext): Promise<string>;
  generateXcodeProject(pages: RenderPage[]): Promise<Buffer>;
}

/**
 * VueAdapter - Renders Render Tree to Vue components
 */
export interface VueAdapter extends PlatformAdapter {
  platform: 'vue';
  renderNode(node: RenderNode, context: RenderContext): Promise<string>; // Vue SFC
  renderPage(page: RenderPage, context: RenderContext): Promise<string>;
  generateVueComponent(node: RenderNode): Promise<string>;
}

/**
 * RESTAdapter - Generates REST API from Render Tree
 * Enables backend API generation from same metadata
 */
export interface RESTAdapter extends PlatformAdapter {
  platform: 'rest';
  renderNode(node: RenderNode, context: RenderContext): Promise<RESTEndpoint>;
  generateOpenAPI(pages: RenderPage[]): Promise<OpenAPISchema>;
  generateSDK(pages: RenderPage[], language: string): Promise<string>;
}

export interface RESTEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  parameters?: Record<string, RESTParameter>;
  requestBody?: OpenAPISchema;
  responses: Record<number, OpenAPIResponse>;
}

export interface RESTParameter {
  name: string;
  in: 'path' | 'query' | 'header';
  type: string;
  required: boolean;
}

export interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, Record<string, any>>;
  components: {
    schemas: Record<string, any>;
  };
}

export interface OpenAPIResponse {
  description: string;
  content?: Record<string, { schema: any }>;
}

/**
 * PDFAdapter - Generates PDF documents from Render Tree
 * For reports, invoices, statements, etc.
 */
export interface PDFAdapter extends PlatformAdapter {
  platform: 'pdf';
  renderNode(node: RenderNode, context: RenderContext): Promise<PDFElement>;
  renderPage(page: RenderPage, context: RenderContext): Promise<Buffer>;
  renderReport(report: any, context: RenderContext): Promise<Buffer>;
  setPageSize(size: 'A4' | 'Letter' | 'Legal'): void;
  setMargins(top: number, right: number, bottom: number, left: number): void;
}

export interface PDFElement {
  type: 'text' | 'table' | 'image' | 'shape' | 'page-break';
  content: any;
  style?: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
  };
}

/**
 * EmailAdapter - Generates HTML email from Render Tree
 * For notifications, alerts, newsletters, etc.
 */
export interface EmailAdapter extends PlatformAdapter {
  platform: 'email';
  renderNode(node: RenderNode, context: RenderContext): Promise<EmailContent>;
  renderPage(page: RenderPage, context: RenderContext): Promise<EmailMessage>;
  addTemplate(name: string, template: string): void;
  previewInBrowser(content: EmailContent): Promise<string>; // returns URL
}

export interface EmailContent {
  subject: string;
  htmlContent: string;
  textContent: string;
  from: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailMessage extends EmailContent {
  to: string[];
  cc?: string[];
  bcc?: string[];
  scheduled?: Date;
}

/**
 * CLIAdapter - Generates CLI commands from Render Tree
 * For automation, scripts, and terminal interfaces
 */
export interface CLIAdapter extends PlatformAdapter {
  platform: 'cli';
  renderNode(node: RenderNode, context: RenderContext): Promise<CLICommand>;
  renderPage(page: RenderPage, context: RenderContext): Promise<CLIProgram>;
  generateYargsCLI(pages: RenderPage[]): Promise<string>;
  generateCobraCommand(pages: RenderPage[]): Promise<string>;
}

export interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  action: (args: Record<string, any>) => Promise<void>;
}

export interface CLIOption {
  name: string;
  short?: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  default?: any;
  description: string;
}

export interface CLIProgram {
  name: string;
  description: string;
  commands: CLICommand[];
}

// ============================================================================
// ADAPTER REGISTRY AND PLUGIN SYSTEM
// ============================================================================

/**
 * AdapterRegistry - Manages all available adapters
 */
export interface AdapterRegistry {
  register(adapter: PlatformAdapter): void;
  unregister(adapterId: string): void;
  get(platform: AdapterPlatform): PlatformAdapter | undefined;
  list(): PlatformAdapter[];
  registerPlugin(plugin: AdapterPlugin): void;
  getPlugin(pluginId: string): AdapterPlugin | undefined;
}

/**
 * AdapterPlugin - Extend adapter functionality
 */
export interface AdapterPlugin {
  id: string;
  name: string;
  version: string;
  supportedPlatforms: AdapterPlatform[];
  hooks: AdapterPluginHooks;
}

export interface AdapterPluginHooks {
  beforeRender?: (node: RenderNode, context: RenderContext) => Promise<void>;
  afterRender?: (output: any, node: RenderNode, context: RenderContext) => Promise<any>;
  transformComponent?: (component: RenderComponent, platform: AdapterPlatform) => Promise<RenderComponent>;
  transformAction?: (action: RenderAction, platform: AdapterPlatform) => Promise<RenderAction>;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface AdapterError {
  code: string;
  message: string;
  platform: AdapterPlatform;
  nodeId?: string;
  originalError?: Error;
}

export interface AdapterValidationResult {
  valid: boolean;
  errors: AdapterError[];
  warnings: string[];
  compatibilityScore?: number; // 0-100
}

// ============================================================================
// ADAPTER FACTORY
// ============================================================================

/**
 * AdapterFactory - Creates and configures adapters
 */
export interface AdapterFactory {
  createAdapter(platform: AdapterPlatform, config: AdapterConfig): Promise<PlatformAdapter>;
  createMultiAdapter(platforms: AdapterPlatform[], config: AdapterConfig): Promise<MultiPlatformAdapter>;
}

/**
 * MultiPlatformAdapter - Renders to multiple platforms at once
 */
export interface MultiPlatformAdapter {
  render(page: RenderPage, context: RenderContext): Promise<MultiPlatformOutput>;
  renderWorkspace(workspace: RenderWorkspace, context: RenderContext): Promise<MultiPlatformOutput>;
}

export interface MultiPlatformOutput {
  react?: React.ReactNode;
  flutter?: string;
  swiftui?: string;
  vue?: string;
  rest?: RESTEndpoint[];
  pdf?: Buffer;
  email?: EmailContent;
  cli?: CLIProgram;
}

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

/**
 * AdapterUtils - Common utilities for all adapters
 */
export interface AdapterUtils {
  // Type checking
  isRenderNode(obj: any): obj is RenderNode;
  isRenderPage(obj: any): obj is RenderPage;
  isRenderAction(obj: any): obj is RenderAction;

  // Traversal
  walkTree(node: RenderNode, callback: (node: RenderNode, depth: number) => void): void;
  collectNodes(node: RenderNode, predicate: (n: RenderNode) => boolean): RenderNode[];
  findNode(node: RenderNode, id: string): RenderNode | undefined;

  // Transformation
  transformProps(props: RenderProps, platform: AdapterPlatform): Record<string, any>;
  translateTheme(theme: string, platform: AdapterPlatform): Record<string, string>;

  // Serialization
  serialize(obj: any, format: 'json' | 'yaml' | 'xml'): string;
  deserialize(content: string, format: 'json' | 'yaml' | 'xml'): any;
}
