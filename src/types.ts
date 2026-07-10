/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Types definition for Gaza Cash (غزة كاش)

export type UserRole = 'admin' | 'cashier';

export interface Currency {
  id: string; // e.g. "ILS", "USD", "JOD"
  name: string; // e.g. "شيكل", "دولار أمريكي", "دينار أردني"
  symbol: string; // e.g. "₪", "$", "د.أ"
  exchangeRate: number; // 1 unit of this currency = how many units of the base currency (ILS) (e.g., 1 USD = 3.7 ILS, so exchangeRate is 3.7)
  isBase: boolean;
}

export interface ShopSettings {
  name: string;
  address: string;
  phone: string;
  logoText: string;
  logoColor: string;
  logoUrl?: string;
  themeColor?: string; // App primary theme color selection (e.g. 'emerald', 'blue', 'indigo', 'purple', 'amber', 'rose')
  showInvoiceDate?: boolean;
  showInvoiceBranch?: boolean;
  showInvoiceLogo?: boolean;
}

export interface Group {
  id: string;
  name: string;
  settings: ShopSettings;
}

export interface Unit {
  name: string;      // e.g., "كارتونة" (Box)
  isSubUnit: boolean;
  parentUnitName?: string; // e.g., "كارتونة"
  conversionRate?: number; // e.g., 12 (1 Box = 12 Pieces)
}

export interface Item {
  id: string;
  barcode: string;
  name: string;
  category: string;
  
  // Units configuration
  mainUnit: string;        // e.g., "كارتونة"
  hasSubUnit: boolean;
  subUnitName?: string;    // e.g., "حبة"
  conversionRate?: number; // e.g., 12 (1 Box = 12 Pieces)
  
  // Cost and prices (based on main unit)
  purchasePrice: number;   // Cost of main unit
  salePrice: number;       // Sale price of main unit
  subUnitSalePrice?: number; // Sale price of sub-unit

  // Stock tracking (quantities stored in main unit units)
  minStockAlert: number;  // Alert when stock (in main unit equivalent) drops below this
}

export interface Branch {
  id: string;
  name: string;
  location: string;
}

// Branch stock tracking
export interface BranchStock {
  itemId: string;
  branchId: string;
  quantity: number; // Stored as a decimal in terms of main units (e.g. 1.5 boxes)
}

export interface CustomerSupplier {
  id: string;
  name: string;
  type: 'customer' | 'supplier' | 'both';
  phone: string;
  address: string;
  initialBalance: number; // + is credit (له), - is debit (عليه)
  currentBalance: number;
}

export interface TransactionItem {
  itemId: string;
  itemName: string;
  isSubUnitUsed: boolean;
  quantity: number; // relative to the unit used
  unitName: string;
  price: number;    // per unit used
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  branchId: string;
  branchName: string;
  items: TransactionItem[];
  subTotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  paymentType: 'cash' | 'credit'; // نقدي أو آجل
  notes?: string;
  currencyId?: string;
  currencyRate?: number;
}

export interface Purchase {
  id: string;
  invoiceNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  items: TransactionItem[];
  subTotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  paymentType: 'cash' | 'credit';
  notes?: string;
  currencyId?: string;
  currencyRate?: number;
}

export interface SalesReturn {
  id: string;
  returnNo: string;
  date: string;
  originalInvoiceNo?: string;
  customerId: string;
  customerName: string;
  branchId: string;
  items: TransactionItem[];
  total: number;
  notes?: string;
}

export interface PurchaseReturn {
  id: string;
  returnNo: string;
  date: string;
  originalInvoiceNo?: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  items: TransactionItem[];
  total: number;
  notes?: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  items: TransactionItem[];
  subTotal: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface BranchTransfer {
  id: string;
  transferNo: string;
  date: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number; // in terms of main units
    unitName: string;
  }[];
  notes?: string;
}

export interface ItemMovement {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  type: 'sale' | 'purchase' | 'return_in' | 'transfer_out' | 'transfer_in' | 'initial_stock' | 'manual_adjust';
  referenceNo: string; // invoice number or transfer number
  branchId: string;
  branchName: string;
  quantityChange: number; // + for incoming, - for outgoing (in terms of main units)
  unitName: string;
  description: string;
}

export interface CustomerSupplierStatement {
  date: string;
  type: string;
  referenceNo: string;
  amount: number; // original operation value
  debit: number;  // عليه
  credit: number; // له
  runningBalance: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;      // e.g. "تعديل رصيد صنف", "حذف فاتورة", "إضافة صنف"
  operator: string;    // user role or active operator
  details: string;     // textual details of the operation
  severity: 'info' | 'warning' | 'critical';
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  notes: string;
  type: 'delivery' | 'payment' | 'visit' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'cashier';
  name: string;
  permissions: {
    canDeleteInvoices: boolean;
    canAccessSettings: boolean;
    canEditInventory: boolean;
    canAccessReports: boolean;
    canManageUsers: boolean;
  };
}

export interface FirewallSettings {
  enabled: boolean;
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  highSecurityMode: boolean;
  blockedIps: string[];
  whitelistedIps: string[];
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'brute_force' | 'unauthorized_access' | 'admin_bypass' | 'ip_blocked' | 'setting_change';
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}


