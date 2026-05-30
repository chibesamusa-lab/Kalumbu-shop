export type UserRole = "Admin" | "Inventory Manager" | "Sales Agent";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarColor: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  status: "Synced" | "Pending Sync" | "Error";
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  cost: number;
  price: number;
  warehouseId: string;
  lastSyncedAt?: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  cost: number;
  revenue: number;
  profit: number;
  date: string; // ISO String or YYYY-MM-DD
  warehouseId: string;
  loggedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  category: "Inventory" | "Sales" | "Stocktake" | "Sync" | "Access";
}

export interface StocktakeItem {
  productId: string;
  productName: string;
  sku: string;
  bookQty: number;
  physicalQty: number;
  variance: number;
  cost: number;
  varianceValue: number;
  status: "Discrepancy" | "Matched";
}

export interface StocktakeSession {
  id: string;
  date: string;
  status: "Draft" | "Approved" | "Cancelled";
  warehouseId: string;
  items: StocktakeItem[];
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface CloudSyncLog {
  id: string;
  timestamp: string;
  apiName: "Xero" | "QuickBooks" | "Zoho Books" | "Warehouse Sync";
  type: "Push Inventory" | "Push Sales Invoice" | "Pull Multi-Warehouse" | "System Update";
  status: "Success" | "Failed" | "Warning";
  payload: string;
  responseTimeMs: number;
}
