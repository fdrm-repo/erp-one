/**
 * Universal Entity Model (UEM)
 * Inheritance hierarchy for business entities
 *
 * Every business entity in ONE Platform is a specialization of canonical types.
 * This enables unlimited industry support without duplication.
 *
 * Examples:
 * - Customer, Vendor, Carrier, Broker all inherit from Party
 * - Invoice, CreditNote, DebitNote inherit from FinancialDocument
 * - Shipment, Delivery, Pickup inherit from Movement
 * - Product, Service, Material all represent items in transactions
 */

import type { CanonicalParty, CanonicalPerson, CanonicalOrganization, CanonicalAsset, CanonicalDocument, CanonicalFinancialDocument, CanonicalMovement, CanonicalActivity } from './canonical-model';

// ============================================================================
// PARTY HIERARCHY
// ============================================================================

/**
 * CRM Domain: Customer
 * Extends: Party
 */
export interface Customer extends CanonicalParty {
  type: 'individual' | 'organization';
  segment?: 'enterprise' | 'mid-market' | 'smb' | 'startup';
  annualRevenue?: number;
  industryVertical?: string;
  preferredLanguage?: string;
  paymentTerms?: string;
  creditLimit?: number;
  discountPercentage?: number;
  isPreferred?: boolean;
  salesRepresentative?: string; // Party ID
  accountManager?: string; // Party ID
}

/**
 * Finance/Procurement Domain: Vendor
 * Extends: Party
 */
export interface Vendor extends CanonicalParty {
  type: 'organization';
  vendorType?: 'supplier' | 'service-provider' | 'manufacturer' | 'distributor';
  paymentTerms?: string;
  preferredPaymentMethod?: string;
  minimumOrderValue?: number;
  leadTimeDays?: number;
  qualityRating?: number;
  isApproved?: boolean;
  vendorRiskLevel?: 'low' | 'medium' | 'high';
  procurementContactPerson?: string; // Party ID
}

/**
 * Freight/Logistics Domain: Carrier
 * Extends: Organization
 */
export interface Carrier extends CanonicalOrganization {
  type: 'organization';
  carrierType?: 'air' | 'ocean' | 'land' | 'multimodal';
  certifications?: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  averageDeliveryTimeHours?: number;
  costPerKilometer?: number;
  costPerKilogram?: number;
  maxWeightCapacity?: number;
  maxVolumeCapacity?: number;
  operatingCountries?: string[];
  hazmatCertified?: boolean;
  temperatureControlled?: boolean;
}

/**
 * Healthcare Domain: Patient
 * Extends: Party
 */
export interface Patient extends CanonicalParty {
  type: 'individual';
  dateOfBirth: Date;
  medicalRecordNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: string; // Party ID
  primaryPhysician?: string; // Party ID
  preexistingConditions?: string[];
}

/**
 * Retail Domain: Guest/Customer
 * Extends: Party
 */
export interface Guest extends CanonicalParty {
  type: 'individual' | 'organization';
  loyaltyProgramMemberId?: string;
  preferredLocation?: string; // Location ID
  frequencyOfVisit?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  averageSpendValue?: number;
  preferredPaymentMethod?: string;
}

/**
 * HR Domain: Employee
 * Extends: Person
 */
export interface Employee extends CanonicalPerson {
  type: 'individual';
  employeeId: string;
  department?: string;
  designation?: string;
  reportingManager?: string; // Party ID
  dateOfJoining: Date;
  dateOfSeparation?: Date;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'temporary';
  salary?: number;
  currency?: string;
  workLocation?: string; // Location ID
  skills?: string[];
  certifications?: string[];
  performanceRating?: number;
}

/**
 * Real Estate Domain: Owner/Tenant
 * Extends: Party
 */
export interface PropertyParty extends CanonicalParty {
  partyRole: 'owner' | 'tenant' | 'agent' | 'manager';
  propertyManagedOrOwned?: string[]; // Asset IDs
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  leaseMonthlyRent?: number;
  leaseSecurityDeposit?: number;
}

// ============================================================================
// ASSET HIERARCHY
// ============================================================================

/**
 * Vehicle
 * Extends: Asset
 */
export interface Vehicle extends CanonicalAsset {
  assetType: 'vehicle';
  vehicleType?: 'car' | 'truck' | 'van' | 'bicycle' | 'motorcycle' | 'aircraft' | 'ship';
  registrationNumber?: string;
  vin?: string; // Vehicle Identification Number
  fuelType?: string;
  fuelEfficiency?: number;
  maxCapacityWeight?: number;
  maxCapacityVolume?: number;
  mileageOrHours?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

/**
 * Equipment
 * Extends: Asset
 */
export interface Equipment extends CanonicalAsset {
  assetType: 'equipment';
  equipmentCategory?: 'machinery' | 'tools' | 'ict' | 'furniture' | 'medical' | 'industrial';
  specifications?: Record<string, any>;
  maintenanceSchedule?: string;
  calibrationRequired?: boolean;
  lastCalibrationDate?: Date;
  nextCalibrationDate?: Date;
  serialNumber?: string;
  manufacturer?: string;
  modelNumber?: string;
}

/**
 * Container
 * Extends: Asset
 */
export interface Container extends CanonicalAsset {
  assetType: 'container';
  containerType?: 'teu20' | 'teu40' | 'teu45' | 'reefer' | 'tank' | 'open-top' | 'flat-rack';
  containerNumber: string;
  isoCode?: string;
  tare?: number; // Empty weight
  maxGrossWeight?: number;
  internalDimensions?: {
    length: number;
    width: number;
    height: number;
  };
  currentLocation?: string; // Location ID
  currentOccupancy?: number;
  nextMaintenance?: Date;
  owner?: string; // Party ID (Carrier or Leasing company)
}

/**
 * Building
 * Extends: Asset
 */
export interface Building extends CanonicalAsset {
  assetType: 'building';
  buildingType?: 'warehouse' | 'office' | 'retail' | 'factory' | 'residential';
  address: string;
  usableArea?: number; // in square meters
  totalArea?: number;
  noOfFloors?: number;
  noOfUnits?: number;
  yearBuilt?: number;
  constructionType?: string;
  utilities?: string[]; // 'electricity', 'water', 'gas', 'internet'
  certifications?: string[]; // 'iso', 'leed', 'safety'
}

// ============================================================================
// DOCUMENT HIERARCHY
// ============================================================================

/**
 * Quote/Quotation
 * Extends: Document
 */
export interface Quotation extends CanonicalDocument {
  documentType: 'Quote';
  validUntilDate: Date;
  discountPercentage?: number;
  discountAmount?: number;
  convertedToPOId?: string; // Purchase Order ID
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';
}

/**
 * Purchase Order
 * Extends: Document
 */
export interface PurchaseOrder extends CanonicalDocument {
  documentType: 'PurchaseOrder';
  requisitionId?: string;
  expectedDeliveryDate: Date;
  shippingTerms?: 'FOB' | 'CIF' | 'DDP' | 'EXW' | 'DAP';
  paymentTerms?: string;
  linkedQuotationId?: string;
  status: 'draft' | 'approved' | 'sent' | 'acknowledged' | 'partially-received' | 'received' | 'cancelled' | 'closed';
  receiptStatus?: 'pending' | 'partial' | 'complete';
  linkedInvoiceIds?: string[];
}

/**
 * Sales Order
 * Extends: Document
 */
export interface SalesOrder extends CanonicalDocument {
  documentType: 'SalesOrder';
  quotationId?: string;
  expectedDeliveryDate: Date;
  shippingTerms?: 'FOB' | 'CIF' | 'DDP' | 'EXW' | 'DAP';
  shippingAddress?: string; // Address ID
  paymentTerms?: string;
  deliveryMethod?: string;
  status: 'draft' | 'confirmed' | 'partially-shipped' | 'shipped' | 'delivered' | 'invoiced' | 'cancelled' | 'closed';
  linkedShipmentIds?: string[];
  linkedInvoiceIds?: string[];
}

/**
 * Bill of Lading
 * Extends: Document (multi-domain: Freight, Shipping, Customs)
 */
export interface BillOfLading extends CanonicalDocument {
  documentType: 'BillOfLading';
  blNumber: string;
  shipper: string; // Party ID
  consignee: string; // Party ID
  notifyParty?: string; // Party ID
  carrier: string; // Party ID
  vesselName?: string; // if ocean freight
  voyageNumber?: string;
  port_of_loading?: string;
  port_of_discharge?: string;
  containers?: string[]; // Container IDs
  totalWeight?: number;
  totalVolume?: number;
  freightCharges?: number;
  status: 'draft' | 'issued' | 'on-board' | 'delivered' | 'cancelled';
}

// ============================================================================
// FINANCIAL DOCUMENT HIERARCHY
// ============================================================================

/**
 * Invoice
 * Extends: FinancialDocument
 */
export interface Invoice extends CanonicalFinancialDocument {
  documentType: 'Invoice';
  invoiceNumber: string;
  purchaseOrderId?: string;
  salesOrderId?: string;
  invoiceDate: Date;
  dueDate: Date;
  taxId?: string;
  grossAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  netAmount: number;
  status: 'draft' | 'sent' | 'viewed' | 'overdue' | 'partially-paid' | 'paid' | 'cancelled' | 'written-off';
}

/**
 * Bill (Payable)
 * Extends: FinancialDocument
 */
export interface Bill extends CanonicalFinancialDocument {
  documentType: 'Bill';
  billNumber: string;
  purchaseOrderId?: string;
  vendorInvoiceNumber?: string;
  receivedDate: Date;
  dueDate: Date;
  grossAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  netAmount: number;
  status: 'draft' | 'received' | 'approved' | 'scheduled' | 'partial-paid' | 'paid' | 'cancelled';
  matchingStatus?: 'unmatched' | 'partial-match' | 'fully-matched'; // 3-way matching: PO, GRN, Bill
}

/**
 * Credit Note
 * Extends: FinancialDocument
 */
export interface CreditNote extends CanonicalFinancialDocument {
  documentType: 'CreditNote';
  creditNoteNumber: string;
  originalInvoiceId: string;
  reason?: 'return' | 'damage' | 'discount' | 'quality' | 'other';
  creditAmount: number;
  appliedToInvoice?: string;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
}

/**
 * Debit Note
 * Extends: FinancialDocument
 */
export interface DebitNote extends CanonicalFinancialDocument {
  documentType: 'DebitNote';
  debitNoteNumber: string;
  originalBillId: string;
  reason?: 'additional-charges' | 'penalty' | 'interest' | 'other';
  debitAmount: number;
  appliedToBill?: string;
  status: 'draft' | 'issued' | 'applied' | 'cancelled';
}

/**
 * Payment Receipt
 * Extends: FinancialDocument
 */
export interface Receipt extends CanonicalFinancialDocument {
  documentType: 'Receipt';
  receiptNumber: string;
  invoiceId?: string;
  billId?: string;
  paymentMethod: 'cash' | 'check' | 'wire' | 'card' | 'bankTransfer';
  paymentReference?: string;
  paymentAmount: number;
  paymentDate: Date;
  status: 'issued' | 'received' | 'reconciled' | 'cancelled';
}

// ============================================================================
// MOVEMENT HIERARCHY
// ============================================================================

/**
 * Shipment
 * Extends: Movement
 */
export interface Shipment extends CanonicalMovement {
  movementType: 'shipment';
  shipmentNumber: string;
  purchaseOrderId?: string;
  salesOrderId?: string;
  shipmentDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  shippingMethod?: 'air' | 'ocean' | 'land' | 'multimodal' | 'courier' | 'parcel';
  carrier?: string; // Party ID
  trackingNumber?: string;
  billOfLadingId?: string;
  insuranceAmount?: number;
  insuranceProvider?: string;
  status: 'draft' | 'ready-to-ship' | 'picked' | 'packed' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled' | 'returned';
}

/**
 * Delivery
 * Extends: Movement
 */
export interface Delivery extends CanonicalMovement {
  movementType: 'delivery';
  deliveryNumber: string;
  shipmentId?: string;
  deliveryDate: Date;
  recipient?: string; // Party ID
  recipientSignature?: boolean;
  proofOfDelivery?: string; // URL or attachment ID
  damagedItems?: number;
  status: 'scheduled' | 'out-for-delivery' | 'delivered' | 'failed' | 'returned';
}

/**
 * Pickup
 * Extends: Movement
 */
export interface Pickup extends CanonicalMovement {
  movementType: 'pickup';
  pickupNumber: string;
  pickupDate: Date;
  pickupTime?: string;
  pickupFrom?: string; // Party ID
  pickupLocation?: string; // Location ID
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'rescheduled';
}

/**
 * Internal Transfer
 * Extends: Movement
 */
export interface Transfer extends CanonicalMovement {
  movementType: 'transfer';
  transferNumber: string;
  transferDate: Date;
  fromWarehouse?: string; // Location ID
  toWarehouse?: string; // Location ID
  reason?: 'stock-balancing' | 'location-change' | 'preparation' | 'returned';
  status: 'draft' | 'in-transit' | 'received' | 'cancelled';
}

/**
 * Return to Vendor
 * Extends: Movement
 */
export interface ReturnToVendor extends CanonicalMovement {
  movementType: 'return';
  rtvNumber: string;
  originalPurchaseOrderId?: string;
  returnReason?: 'defective' | 'unwanted' | 'expired' | 'overstock' | 'quality';
  creditNoteId?: string;
  status: 'initiated' | 'authorized' | 'in-transit' | 'received-by-vendor' | 'completed' | 'cancelled';
}

// ============================================================================
// ACTIVITY HIERARCHY
// ============================================================================

/**
 * Sales Call
 * Extends: Activity
 */
export interface SalesCall extends CanonicalActivity {
  activityType: 'call';
  callDuration?: number; // in minutes
  callOutcome?: 'successful' | 'unsuccessful' | 'voicemail' | 'busy' | 'no-answer';
  nextFollowUpDate?: Date;
  callNotes?: string;
  opportunityId?: string;
}

/**
 * Meeting
 * Extends: Activity
 */
export interface Meeting extends CanonicalActivity {
  activityType: 'meeting';
  meetingLocation?: string;
  meetingAgendaId?: string;
  attendees?: string[]; // Party IDs
  meetingMinutesId?: string;
  nextActionItems?: string[];
}

/**
 * Task
 * Extends: Activity
 */
export interface Task extends CanonicalActivity {
  activityType: 'task';
  dueDate: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  percentComplete?: number;
  dependencies?: string[]; // Task IDs
  status: 'open' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
}

/**
 * Approval Request
 * Extends: Activity
 */
export interface ApprovalRequest extends CanonicalActivity {
  activityType: 'task';
  documentId: string; // Invoice, PO, etc.
  documentType: string;
  approvalLevel: number;
  requiredApprovals: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  rejectionReason?: string;
}
