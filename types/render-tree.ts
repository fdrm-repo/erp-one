/**
 * Render Tree Specification
 * Platform-independent UI representation
 *
 * The Rendering Engine generates a Render Tree, not React JSX.
 * Platform Adapters then convert the Render Tree to their target format:
 * - React Adapter → React components
 * - Flutter Adapter → Flutter widgets
 * - SwiftUI Adapter → SwiftUI views
 * - Vue Adapter → Vue components
 * - REST Adapter → JSON API
 * - PDF Adapter → PDF document
 * - Email Adapter → HTML email
 *
 * This allows ONE Platform to render the same business logic across
 * unlimited frontends without code duplication.
 */

// ============================================================================
// RENDER TREE TYPES
// ============================================================================

/**
 * RenderNode - Base node in the render tree
 */
export interface RenderNode {
  id: string;
  type: RenderNodeType;
  component: RenderComponent;
  metadata: RenderMetadata;
  children?: RenderNode[];
  events?: RenderEvent[];
}

export type RenderNodeType =
  | 'page'
  | 'section'
  | 'container'
  | 'grid'
  | 'card'
  | 'form'
  | 'table'
  | 'list'
  | 'tree'
  | 'chart'
  | 'field'
  | 'button'
  | 'link'
  | 'image'
  | 'text'
  | 'group'
  | 'tabpane'
  | 'modal'
  | 'drawer'
  | 'notification'
  | 'menu'
  | 'breadcrumb'
  | 'pagination'
  | 'loading'
  | 'error'
  | 'empty-state';

/**
 * RenderComponent - Component specification
 */
export interface RenderComponent {
  id: string;
  name: string; // 'TextInput', 'Button', 'DataTable', etc.
  category: 'input' | 'display' | 'container' | 'navigation' | 'feedback' | 'layout';
  props: RenderProps;
  slots?: Record<string, RenderNode[]>;
}

/**
 * RenderProps - Generic properties (adapter-agnostic)
 */
export interface RenderProps {
  // Layout
  layout?: 'vertical' | 'horizontal' | 'grid' | 'flex' | 'absolute';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: string; // CSS-like: "10px 20px"
  margin?: string;
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;

  // Styling
  className?: string;
  style?: Record<string, string | number>;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;

  // Visibility
  visible?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;

  // Content
  label?: string;
  placeholder?: string;
  value?: any;
  defaultValue?: any;
  options?: RenderOption[];
  children?: string | RenderNode[];

  // Behavior
  onClick?: RenderAction;
  onChange?: RenderAction;
  onSubmit?: RenderAction;
  onFocus?: RenderAction;
  onBlur?: RenderAction;
  onHover?: RenderAction;

  // Form
  name?: string;
  type?: string; // 'text', 'email', 'number', 'password', 'date', etc.
  required?: boolean;
  validation?: RenderValidation;
  error?: string;
  helpText?: string;

  // Data
  dataSource?: RenderDataSource;
  columns?: RenderTableColumn[];
  rowSelection?: 'single' | 'multiple' | 'none';
  pagination?: RenderPagination;
  sorting?: RenderSorting[];
  filtering?: RenderFilter[];

  // Internationalization
  i18n?: {
    key: string;
    params?: Record<string, any>;
  };

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
  tabIndex?: number;
  role?: string;

  // Custom
  [key: string]: any;
}

export interface RenderOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface RenderValidation {
  type: 'required' | 'email' | 'phone' | 'url' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max' | 'custom';
  message: string;
  pattern?: string;
  value?: any;
}

export interface RenderDataSource {
  type: 'static' | 'api' | 'query' | 'computed';
  source: string; // URL, query name, or expression
  params?: Record<string, any>;
  transform?: string; // JavaScript expression
  cache?: boolean;
  cacheTtl?: number; // seconds
}

export interface RenderTableColumn {
  key: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  renderer?: string; // Component name or template
  format?: string; // Date format, number format, etc.
  align?: 'left' | 'center' | 'right';
}

export interface RenderPagination {
  pageSize: number;
  pageSizeOptions: number[];
  position: 'top' | 'bottom' | 'both';
}

export interface RenderSorting {
  key: string;
  direction: 'asc' | 'desc';
}

export interface RenderFilter {
  key: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'between' | 'in';
  value: any;
}

/**
 * RenderMetadata - Context information
 */
export interface RenderMetadata {
  // Identification
  id: string;
  name: string;
  description?: string;

  // Theming
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: string; // 'primary', 'success', 'warning', 'error', 'info'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: string; // 'solid', 'outline', 'ghost', 'soft'

  // Responsive
  responsive?: {
    mobile?: RenderNode;
    tablet?: RenderNode;
    desktop?: RenderNode;
  };
  breakpoints?: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  // Permissions
  permissions?: RenderPermission[];

  // Analytics
  trackingId?: string;
  trackingEvents?: string[];

  // Performance
  lazy?: boolean;
  preload?: boolean;
  virtualized?: boolean;

  // State
  state?: Record<string, any>;
  context?: Record<string, any>;
}

export interface RenderPermission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'execute';
  requiredRole?: string[];
}

/**
 * RenderAction - User interaction handler
 */
export interface RenderAction {
  type:
    | 'navigate'
    | 'submit'
    | 'validate'
    | 'fetch'
    | 'mutate'
    | 'toggle'
    | 'openModal'
    | 'closeModal'
    | 'showNotification'
    | 'downloadFile'
    | 'print'
    | 'custom'
    | 'workflow';
  target?: string;
  payload?: Record<string, any>;
  conditions?: RenderCondition[];
  onSuccess?: RenderAction;
  onError?: RenderAction;
}

export interface RenderCondition {
  type: 'permission' | 'state' | 'expression';
  value: string;
}

/**
 * RenderPage - Complete page tree
 */
export interface RenderPage {
  id: string;
  name: string;
  path: string;
  title: string;
  description?: string;
  metadata: RenderMetadata;
  layout: RenderNode; // root node
  header?: RenderNode;
  footer?: RenderNode;
  sidebar?: RenderNode;
  modals?: RenderNode[];
  scripts?: RenderScript[];
}

export interface RenderScript {
  type: 'javascript' | 'css' | 'data-script';
  content: string;
  inline?: boolean;
}

/**
 * RenderWorkspace - Entity workspace page
 * For displaying detail/edit view of any entity
 */
export interface RenderWorkspace extends RenderPage {
  entityType: string;
  entityId?: string;
  mode: 'view' | 'edit' | 'create';
  tabs?: RenderTab[];
  actions?: RenderWorkspaceAction[];
  sidebar?: RenderWorkspaceSidebar;
}

export interface RenderTab {
  id: string;
  label: string;
  content: RenderNode;
  icon?: string;
  badge?: number | string;
}

export interface RenderWorkspaceAction {
  id: string;
  label: string;
  icon?: string;
  type: 'primary' | 'secondary' | 'danger';
  action: RenderAction;
}

export interface RenderWorkspaceSidebar {
  sections: RenderSidebarSection[];
}

export interface RenderSidebarSection {
  title: string;
  items: RenderSidebarItem[];
}

export interface RenderSidebarItem {
  label: string;
  value: any;
  icon?: string;
  type: 'text' | 'link' | 'button' | 'section';
}

/**
 * RenderList - Entity list page
 */
export interface RenderList extends RenderPage {
  entityType: string;
  columns: RenderTableColumn[];
  defaultSort?: RenderSorting[];
  defaultFilters?: RenderFilter[];
  bulkActions?: RenderBulkAction[];
  rowActions?: RenderRowAction[];
  viewModes?: ('table' | 'kanban' | 'calendar' | 'map' | 'gallery')[];
}

export interface RenderBulkAction {
  id: string;
  label: string;
  icon?: string;
  action: RenderAction;
  confirm?: boolean;
}

export interface RenderRowAction {
  id: string;
  label: string;
  icon?: string;
  action: RenderAction;
  hidden?: boolean;
}

/**
 * RenderDashboard - Dashboard page
 */
export interface RenderDashboard extends RenderPage {
  widgets: RenderWidget[];
  layout?: 'grid' | 'responsive' | 'masonry';
  columns?: number;
  refreshInterval?: number; // seconds
}

export interface RenderWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list' | 'timeline' | 'calendar' | 'custom';
  title: string;
  dataSource: RenderDataSource;
  config: Record<string, any>;
  size?: { width: number; height: number };
  actions?: RenderAction[];
}

/**
 * RenderReport - Report page
 */
export interface RenderReport extends RenderPage {
  reportType: 'tabular' | 'pivot' | 'crosstab' | 'custom';
  dataSource: RenderDataSource;
  columns: RenderTableColumn[];
  grouping?: RenderGrouping[];
  aggregations?: RenderAggregation[];
  format?: 'screen' | 'pdf' | 'excel' | 'csv';
}

export interface RenderGrouping {
  key: string;
  header?: boolean;
  subtotal?: boolean;
}

export interface RenderAggregation {
  column: string;
  type: 'sum' | 'avg' | 'count' | 'min' | 'max';
  label?: string;
}

/**
 * Render Tree Builder Result
 */
export interface RenderTreeBuilderResult {
  success: boolean;
  tree: RenderNode | RenderPage | null;
  errors: RenderError[];
  warnings: RenderWarning[];
  statistics: RenderStatistics;
}

export interface RenderError {
  code: string;
  message: string;
  path: string; // Path in render tree
  line?: number;
  column?: number;
}

export interface RenderWarning {
  code: string;
  message: string;
  suggestion?: string;
}

export interface RenderStatistics {
  totalNodes: number;
  nodesByType: Record<RenderNodeType, number>;
  totalComponents: number;
  totalActions: number;
  estimatedFileSizeKb: number;
}
