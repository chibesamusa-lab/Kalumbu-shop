import { Product, Warehouse, Sale, AuditLog, StocktakeSession, CloudSyncLog, User, UserRole } from "../types";

export const DEFAULT_USERS: User[] = [
  {
    id: "user-1",
    name: "Alice Smith",
    role: "Admin",
    email: "alice.smith@stocksync.io",
    avatarColor: "bg-indigo-600 text-white"
  },
  {
    id: "user-2",
    name: "Marcus Brody",
    role: "Inventory Manager",
    email: "marcus.brody@stocksync.io",
    avatarColor: "bg-emerald-600 text-white"
  },
  {
    id: "user-3",
    name: "Danny Cole",
    role: "Sales Agent",
    email: "danny.cole@stocksync.io",
    avatarColor: "bg-amber-600 text-white"
  }
];

export const DEFAULT_WAREHOUSES: Warehouse[] = [
  { id: "wh-1", name: "London Central Hub", location: "Park Royal, London", status: "Synced" },
  { id: "wh-2", name: "Manchester Depot", location: "Trafford Park, Manchester", status: "Synced" },
  { id: "wh-3", name: "Birmingham Fulfillment", location: "Aston, Birmingham", status: "Synced" }
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_SYNC_LOGS: CloudSyncLog[] = [];

// Helper to initialize local storage
export const getLocalStorageData = () => {
  if (typeof window === "undefined") {
    return {
      products: INITIAL_PRODUCTS,
      sales: INITIAL_SALES,
      warehouses: DEFAULT_WAREHOUSES,
      auditLogs: INITIAL_AUDIT_LOGS,
      syncLogs: INITIAL_SYNC_LOGS,
      stocktakes: [] as StocktakeSession[],
      currentUser: DEFAULT_USERS[0]
    };
  }

  const productsStr = localStorage.getItem("ks_products");
  const salesStr = localStorage.getItem("ks_sales");
  const warehousesStr = localStorage.getItem("ks_warehouses");
  const auditLogsStr = localStorage.getItem("ks_audit_logs");
  const syncLogsStr = localStorage.getItem("ks_sync_logs");
  const stocktakesStr = localStorage.getItem("ks_stocktakes");
  const currentUserStr = localStorage.getItem("ks_current_user");

  const products = productsStr ? JSON.parse(productsStr) : INITIAL_PRODUCTS;
  const sales = salesStr ? JSON.parse(salesStr) : INITIAL_SALES;
  const warehouses = warehousesStr ? JSON.parse(warehousesStr) : DEFAULT_WAREHOUSES;
  const auditLogs = auditLogsStr ? JSON.parse(auditLogsStr) : INITIAL_AUDIT_LOGS;
  const syncLogs = syncLogsStr ? JSON.parse(syncLogsStr) : INITIAL_SYNC_LOGS;
  const stocktakes = stocktakesStr ? JSON.parse(stocktakesStr) : [] as StocktakeSession[];
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : DEFAULT_USERS[0];

  // Save back to verify everything is set
  if (!productsStr) localStorage.setItem("ks_products", JSON.stringify(products));
  if (!salesStr) localStorage.setItem("ks_sales", JSON.stringify(sales));
  if (!warehousesStr) localStorage.setItem("ks_warehouses", JSON.stringify(warehouses));
  if (!auditLogsStr) localStorage.setItem("ks_audit_logs", JSON.stringify(auditLogs));
  if (!syncLogsStr) localStorage.setItem("ks_sync_logs", JSON.stringify(syncLogs));
  if (!stocktakesStr) localStorage.setItem("ks_stocktakes", JSON.stringify(stocktakes));
  if (!currentUserStr) localStorage.setItem("ks_current_user", JSON.stringify(currentUser));

  return { products, sales, warehouses, auditLogs, syncLogs, stocktakes, currentUser };
};

export const saveLocalStorageData = {
  products: (data: Product[]) => localStorage.setItem("ks_products", JSON.stringify(data)),
  sales: (data: Sale[]) => localStorage.setItem("ks_sales", JSON.stringify(data)),
  warehouses: (data: Warehouse[]) => localStorage.setItem("ks_warehouses", JSON.stringify(data)),
  auditLogs: (data: AuditLog[]) => localStorage.setItem("ks_audit_logs", JSON.stringify(data)),
  syncLogs: (data: CloudSyncLog[]) => localStorage.setItem("ks_sync_logs", JSON.stringify(data)),
  stocktakes: (data: StocktakeSession[]) => localStorage.setItem("ks_stocktakes", JSON.stringify(data)),
  currentUser: (data: User) => localStorage.setItem("ks_current_user", JSON.stringify(data))
};

export const addAuditLog = (userId: string, userName: string, role: UserRole, action: string, details: string, category: AuditLog["category"]): AuditLog => {
  const currentLogs = JSON.parse(localStorage.getItem("ks_audit_logs") || "[]") as AuditLog[];
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    role,
    action,
    details,
    category
  };
  const updated = [newLog, ...currentLogs];
  localStorage.setItem("ks_audit_logs", JSON.stringify(updated));
  return newLog;
};

export const addSyncLog = (apiName: CloudSyncLog["apiName"], type: CloudSyncLog["type"], status: CloudSyncLog["status"], payload: string): CloudSyncLog => {
  const currentLogs = JSON.parse(localStorage.getItem("ks_sync_logs") || "[]") as CloudSyncLog[];
  const newLog: CloudSyncLog = {
    id: `sync-${Date.now()}`,
    timestamp: new Date().toISOString(),
    apiName,
    type,
    status,
    payload,
    responseTimeMs: Math.floor(Math.random() * 200) + 150
  };
  const updated = [newLog, ...currentLogs];
  localStorage.setItem("ks_sync_logs", JSON.stringify(updated));
  return newLog;
};
