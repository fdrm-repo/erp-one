/**
 * Canonical Business Model
 * Universal business concepts shared by ALL industries
 *
 * Every business entity in ONE Platform extends from these canonical types.
 * This enables:
 * - Unlimited industry support without duplication
 * - Cross-industry data integration
 * - Platform-wide consistency
 * - Semantic understanding
 *
 * Example:
 * - Customer extends Party
 * - Vendor extends Party
 * - Employee extends Person
 * - Invoice extends FinancialDocument
 * - Shipment extends Movement
 */

// ============================================================================
// FOUNDATIONAL CONCEPTS
// ============================================================================

/**
 * Party - Any entity that can interact with the business
 * Base for: Customer, Vendor, Employee, Carrier, Agent, Broker, etc.
 */
export interface CanonicalParty {
  id: string;
  name: string;
  code: string;
  type: 'individual' | 'organization' | 'group';
  status: 'active' | 'inactive' | 'suspended';
  registrationDate: Date;
  deactivationDate?: Date;
  metadata: Record<string, any>;
}

/**
 * Organization - Formal business entity
 * Base for: Company, Department, Branch, Supplier, etc.
 */
export interface CanonicalOrganization extends CanonicalParty {
  type: 'organization';
  registrationNumber?: string;
  taxId?: string;
  industry?: string;
  size?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  parentOrganization?: string; // reference to parent org
}

/**
 * Person - Individual human
 * Base for: Employee, Customer, Vendor Contact, User, etc.
 */
export interface CanonicalPerson extends CanonicalParty {
  type: 'individual';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
}

/**
 * Location - Physical or logical location
 * Base for: Warehouse, Store, Branch, Port, Region, etc.
 */
export interface CanonicalLocation {
  id: string;
  name: string;
  code: string;
  locationType: 'warehouse' | 'store' | 'branch' | 'port' | 'office' | 'region' | 'customs';
  address?: CanonicalAddress;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  capacity?: {
    value: number;
    unit: string;
  };
  operatingHours?: {
    openTime: string;
    closeTime: string;
  };
  status: 'active' | 'inactive' | 'temporary';
}

/**
 * Address - Physical address component
 * Used by: Party, Location, ShippingAddress, BillingAddress, etc.
 */
export interface CanonicalAddress {
  id: string;
  addressType: 'billing' | 'shipping' | 'business' | 'personal' | 'warehouse';
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  building?: string;
  floor?: string;
  unit?: string;
  isDefault?: boolean;
  validFrom: Date;
  validUntil?: Date;
}

/**
 * Contact - Communication channel
 * Used by: Party, Location
 */
export interface CanonicalContact {
  id: string;
  contactType: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'linkedin' | 'whatsapp';
  value: string;
  isDefault?: boolean;
  isVerified?: boolean;
  verifiedDate?: Date;
}

/**
 * Asset - Something of value owned or managed
 * Base for: Equipment, Vehicle, Building, Container, etc.
 */
export interface CanonicalAsset {
  id: string;
  name: string;
  code: string;
  assetType: 'equipment' | 'vehicle' | 'building' | 'container' | 'tool' | 'technology';
  owner: string; // Party ID
  custodian?: string; // Party ID (who's currently using it)
  location?: string; // Location ID
  purchaseDate: Date;
  purchasePrice: number;
  currency: string;
  warrantyExpiryDate?: Date;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed' | 'lost';
  metadata: Record<string, any>;
}

/**
 * Document - Any formal business document
 * Base for: Invoice, PO, SO, Quote, BL, etc.
 */
export interface CanonicalDocument {
  id: string;
  documentNumber: string;
  documentType: string; // 'Invoice', 'PurchaseOrder', 'SalesOrder', 'Quote', 'BL', etc.
  issueDate: Date;
  dueDate?: Date;
  issuer: string; // Party ID
  recipient: string; // Party ID
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  lineItems: CanonicalLineItem[];
  totalAmount: number;
  currency: string;
  exchangeRate?: number;
  notes?: string;
  attachments?: string[]; // Attachment IDs
  linkedDocuments?: string[]; // Document IDs (PO links to Invoice, etc.)
  approvals?: CanonicalApproval[];
  workflow?: CanonicalWorkflow;
  createdDate: Date;
  modifiedDate: Date;
}

/**
 * LineItem - Single item in a document
 * Used by: Invoice, PO, SO, Quote, etc.
 */
export interface CanonicalLineItem {
  id: string;
  sequenceNumber: number;
  itemReference: string; // Product/Service ID
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  lineTotal: number;
  fulfillmentStatus?: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
}

/**
 * FinancialDocument - Monetary transaction document
 * Base for: Invoice, Bill, CreditNote, DebitNote, Receipt, etc.
 */
export interface CanonicalFinancialDocument extends CanonicalDocument {
  documentType: 'Invoice' | 'Bill' | 'CreditNote' | 'DebitNote' | 'Receipt' | 'Refund';
  paymentTerms?: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  amountPaid?: number;
  remainingAmount?: number;
  payments?: CanonicalPayment[];
}

/**
 * Payment - Money movement
 */
export interface CanonicalPayment {
  id: string;
  paymentDate: Date;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'check' | 'wire' | 'card' | 'bankTransfer' | 'cryptocurrency';
  reference: string;
  status: 'pending' | 'processed' | 'failed' | 'reversed';
}

/**
 * Transaction - Any business transaction
 * Base for: Sales, Purchase, Transfer, Return, Adjustment, etc.
 */
export interface CanonicalTransaction {
  id: string;
  transactionNumber: string;
  transactionType: 'sale' | 'purchase' | 'transfer' | 'return' | 'adjustment' | 'consumption';
  transactionDate: Date;
  parties: {
    from: string; // Party ID
    to: string; // Party ID
  };
  items: CanonicalTransactionItem[];
  totalAmount: number;
  currency: string;
  status: 'draft' | 'posted' | 'reconciled' | 'reversed';
  reference?: string; // Link to document (Invoice, PO, etc.)
  approvals?: CanonicalApproval[];
}

export interface CanonicalTransactionItem {
  id: string;
  itemReference: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  fromLocation?: string;
  toLocation?: string;
}

/**
 * Movement - Physical movement of goods/assets
 * Base for: Shipment, Delivery, Pickup, Transfer, etc.
 */
export interface CanonicalMovement {
  id: string;
  movementNumber: string;
  movementType: 'shipment' | 'delivery' | 'pickup' | 'transfer' | 'return' | 'disposal';
  originLocation: string; // Location ID
  destinationLocation: string; // Location ID
  originParty?: string; // Party ID
  destinationParty?: string; // Party ID
  startDate: Date;
  expectedEndDate?: Date;
  actualEndDate?: Date;
  items: CanonicalMovementItem[];
  totalQuantity: number;
  totalWeight?: number;
  totalVolume?: number;
  status: 'planned' | 'in-transit' | 'delivered' | 'cancelled' | 'lost' | 'damaged';
  tracking?: CanonicalTracking[];
  shipmentMethod?: string; // 'air' | 'ocean' | 'land' | 'multimodal'
  carrier?: string; // Party ID
  vehicles?: string[]; // Asset IDs
  linkedDocuments?: string[]; // Document IDs (BL, PO, etc.)
}

export interface CanonicalMovementItem {
  id: string;
  itemReference: string;
  quantity: number;
  unit: string;
  description: string;
  weight?: number;
  volume?: number;
  serialNumbers?: string[];
}

export interface CanonicalTracking {
  id: string;
  trackingNumber: string;
  timestamp: Date;
  location?: string; // Location ID
  status: string;
  notes?: string;
}

/**
 * Money - Monetary value with currency
 */
export interface CanonicalMoney {
  amount: number;
  currency: string;
  exchangeRate?: number;
  originalCurrency?: string;
  originalAmount?: number;
}

/**
 * Activity - Any notable business activity
 * Base for: Call, Meeting, Task, Note, Email, etc.
 */
export interface CanonicalActivity {
  id: string;
  activityType: 'call' | 'meeting' | 'email' | 'task' | 'note' | 'appointment';
  title: string;
  description?: string;
  relatedParty: string; // Party ID
  relatedDocument?: string; // Document ID
  assignedTo: string; // Party ID (usually employee)
  startTime: Date;
  endTime?: Date;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  outcome?: string;
  attachments?: string[]; // Attachment IDs
}

/**
 * Approval - Decision/sign-off on document or transaction
 */
export interface CanonicalApproval {
  id: string;
  approverParty: string; // Party ID
  approvalType: 'review' | 'approval' | 'sign' | 'authorize' | 'verify';
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  approvalDate?: Date;
  notes?: string;
  requiredApprovals?: number;
  approvalLevel?: number;
}

/**
 * Workflow - State machine definition
 */
export interface CanonicalWorkflow {
  id: string;
  workflowType: string; // 'ApprovalFlow', 'SalesFlow', etc.
  currentState: string;
  transitions: CanonicalTransition[];
  history: CanonicalWorkflowHistory[];
}

export interface CanonicalTransition {
  from: string;
  to: string;
  trigger: string;
  condition?: string;
  action?: string;
}

export interface CanonicalWorkflowHistory {
  id: string;
  fromState: string;
  toState: string;
  transitionDate: Date;
  triggeredBy: string; // Party ID
  reason?: string;
}

/**
 * Attachment - File attached to entity
 */
export interface CanonicalAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: string; // Party ID
  relatedEntity: {
    entityType: string;
    entityId: string;
  };
  url: string;
  description?: string;
  isPublic: boolean;
}

/**
 * Comment - Discussion on entity
 */
export interface CanonicalComment {
  id: string;
  text: string;
  createdBy: string; // Party ID
  createdDate: Date;
  modifiedDate?: Date;
  relatedEntity: {
    entityType: string;
    entityId: string;
  };
  mentions?: string[]; // Party IDs
  attachments?: string[]; // Attachment IDs
}

/**
 * Event - System or business event
 */
export interface CanonicalEvent {
  id: string;
  eventType: string;
  eventTime: Date;
  source: string; // 'system' | 'user' | 'integration' | 'automation'
  actor: string; // Party ID or system name
  entityType: string;
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'transitioned' | 'approved';
  changes?: Record<string, { oldValue: any; newValue: any }>;
  metadata?: Record<string, any>;
}

/**
 * Entity Inheritance Marker
 * Indicates that an entity extends a canonical type
 */
export interface CanonicalInheritance {
  extendsType: keyof typeof CanonicalTypes;
  overriddenFields?: string[];
  additionalTraits?: string[];
}

// ============================================================================
// CANONICAL TYPES REGISTRY
// ============================================================================

export const CanonicalTypes = {
  // Core concepts
  Party: 'CanonicalParty',
  Organization: 'CanonicalOrganization',
  Person: 'CanonicalPerson',
  Location: 'CanonicalLocation',
  Address: 'CanonicalAddress',
  Contact: 'CanonicalContact',
  Asset: 'CanonicalAsset',

  // Documents
  Document: 'CanonicalDocument',
  LineItem: 'CanonicalLineItem',
  FinancialDocument: 'CanonicalFinancialDocument',
  Payment: 'CanonicalPayment',

  // Transactions
  Transaction: 'CanonicalTransaction',
  TransactionItem: 'CanonicalTransactionItem',

  // Movement
  Movement: 'CanonicalMovement',
  MovementItem: 'CanonicalMovementItem',
  Tracking: 'CanonicalTracking',

  // Money
  Money: 'CanonicalMoney',

  // Activities
  Activity: 'CanonicalActivity',
  Approval: 'CanonicalApproval',

  // Workflows
  Workflow: 'CanonicalWorkflow',
  Transition: 'CanonicalTransition',
  WorkflowHistory: 'CanonicalWorkflowHistory',

  // Collaboration
  Attachment: 'CanonicalAttachment',
  Comment: 'CanonicalComment',

  // Events
  Event: 'CanonicalEvent',
};

/**
 * Universal Entity Model (UEM)
 * Maps business entities to canonical types
 *
 * Example:
 * Customer → Party
 * Vendor → Party
 * Employee → Person
 * Invoice → FinancialDocument
 * PurchaseOrder → Document
 * Shipment → Movement
 */
export interface UniversalEntityMapping {
  businessEntityName: string; // 'Customer', 'Vendor', 'Invoice', etc.
  canonicalType: keyof typeof CanonicalTypes;
  extendedFields: Record<string, any>;
  associatedCapabilities: string[]; // 'CRM', 'Finance', 'Freight', etc.
}
