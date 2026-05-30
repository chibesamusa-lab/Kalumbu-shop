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

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    sku: "EL-LAP-X1",
    barcode: "5012345678901",
    name: "ProBook Laptop X1",
    category: "Electronics",
    quantity: 18,
    reorderPoint: 25,
    cost: 450,
    price: 799,
    warehouseId: "wh-1",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    sku: "EL-MON-4K",
    barcode: "5012345678918",
    name: "UltraSharp 4K Monitor 27\"",
    category: "Electronics",
    quantity: 35,
    reorderPoint: 15,
    cost: 180,
    price: 349,
    warehouseId: "wh-1",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    sku: "EL-MOU-WL",
    barcode: "5012345678925",
    name: "Ergonomic Wireless Mouse",
    category: "Electronics",
    quantity: 8,
    reorderPoint: 20,
    cost: 15,
    price: 45,
    warehouseId: "wh-1",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-4",
    sku: "AP-TEE-WH",
    barcode: "5012345678932",
    name: "Organic Cotton Tee (White/L)",
    category: "Apparel",
    quantity: 110,
    reorderPoint: 50,
    cost: 8,
    price: 24,
    warehouseId: "wh-2",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-5",
    sku: "AP-JCK-DN",
    barcode: "5012345678949",
    name: "Classic Denim Jacket (M)",
    category: "Apparel",
    quantity: 12,
    reorderPoint: 15,
    cost: 35,
    price: 85,
    warehouseId: "wh-2",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-6",
    sku: "GR-COF-BL",
    barcode: "5012345678956",
    name: "Guatemalan Single Origin Coffee 1kg",
    category: "Groceries",
    quantity: 45,
    reorderPoint: 30,
    cost: 12,
    price: 28,
    warehouseId: "wh-3",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-7",
    sku: "GR-TEA-MT",
    barcode: "5012345678963",
    name: "Ceremonial Grade Matcha 100g",
    category: "Groceries",
    quantity: 5,
    reorderPoint: 12,
    cost: 18,
    price: 39,
    warehouseId: "wh-3",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-8",
    sku: "SP-BOT-SS",
    barcode: "5012345678970",
    name: "Insulated Stainless Steel Bottle 1L",
    category: "Sporting Goods",
    quantity: 65,
    reorderPoint: 25,
    cost: 10,
    price: 25,
    warehouseId: "wh-2",
    lastSyncedAt: new Date().toISOString()
  },
  {
    id: "prod-9",
    sku: "SP-MAT-YO",
    barcode: "5012345678987",
    name: "Eco-Friendly Yoga Mat 6mm",
    category: "Sporting Goods",
    quantity: 4,
    reorderPoint: 10,
    cost: 15,
    price: 38,
    warehouseId: "wh-1",
    lastSyncedAt: new Date().toISOString()
  }
];

export const INITIAL_SALES: Sale[] = [
  // Past Month (April)
  {
    id: "sale-1",
    productId: "prod-1",
    productName: "ProBook Laptop X1",
    quantity: 4,
    price: 799,
    cost: 450,
    revenue: 3196,
    profit: 1396,
    date: "2026-04-12T14:30:00Z",
    warehouseId: "wh-1",
    loggedBy: "Danny Cole"
  },
  {
    id: "sale-2",
    productId: "prod-3",
    productName: "Ergonomic Wireless Mouse",
    quantity: 15,
    price: 45,
    cost: 15,
    revenue: 675,
    profit: 450,
    date: "2026-04-15T10:15:00Z",
    warehouseId: "wh-1",
    loggedBy: "Danny Cole"
  },
  {
    id: "sale-3",
    productId: "prod-6",
    productName: "Guatemalan Single Origin Coffee 1kg",
    quantity: 20,
    price: 28,
    cost: 12,
    revenue: 560,
    profit: 320,
    date: "2026-04-22T11:45:00Z",
    warehouseId: "wh-3",
    loggedBy: "Alice Smith"
  },
  // Current Month (May) - Historical consumption
  {
    id: "sale-4",
    productId: "prod-2",
    productName: "UltraSharp 4K Monitor 27\"",
    quantity: 8,
    price: 349,
    cost: 180,
    revenue: 2792,
    profit: 1352,
    date: "2026-05-02T09:15:00Z",
    warehouseId: "wh-1",
    loggedBy: "Danny Cole"
  },
  {
    id: "sale-5",
    productId: "prod-4",
    productName: "Organic Cotton Tee (White/L)",
    quantity: 42,
    price: 24,
    cost: 8,
    revenue: 1008,
    profit: 672,
    date: "2026-05-10T16:20:00Z",
    warehouseId: "wh-2",
    loggedBy: "Danny Cole"
  },
  {
    id: "sale-6",
    productId: "prod-5",
    productName: "Classic Denim Jacket (M)",
    quantity: 6,
    price: 85,
    cost: 35,
    revenue: 510,
    profit: 300,
    date: "2026-05-14T11:00:00Z",
    warehouseId: "wh-2",
    loggedBy: "Marcus Brody"
  },
  {
    id: "sale-7",
    productId: "prod-7",
    productName: "Ceremonial Grade Matcha 100g",
    quantity: 11,
    price: 39,
    cost: 18,
    revenue: 429,
    profit: 231,
    date: "2026-05-20T14:40:00Z",
    warehouseId: "wh-3",
    loggedBy: "Danny Cole"
  },
  {
    id: "sale-8",
    productId: "prod-8",
    productName: "Insulated Stainless Steel Bottle 1L",
    quantity: 14,
    price: 25,
    cost: 10,
    revenue: 350,
    profit: 210,
    date: "2026-05-25T15:30:00Z",
    warehouseId: "wh-2",
    loggedBy: "Danny Cole"
  },
  {
    id: "sale-9",
    productId: "prod-9",
    productName: "Eco-Friendly Yoga Mat 6mm",
    quantity: 8,
    price: 38,
    cost: 15,
    revenue: 304,
    profit: 184,
    date: "2026-05-26T10:05:00Z",
    warehouseId: "wh-1",
    loggedBy: "Danny Cole"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-05-27T09:00:00Z",
    userId: "user-1",
    userName: "Alice Smith",
    role: "Admin",
    action: "System Initialized",
    details: "Initialized core inventory parameters and mapped warehouse APIs.",
    category: "Access"
  },
  {
    id: "log-2",
    timestamp: "2026-05-27T14:15:00Z",
    userId: "user-2",
    userName: "Marcus Brody",
    role: "Inventory Manager",
    action: "Stock Adjust",
    details: "Added 20 units of Guatemalan Single Origin Coffee 1kg (SKU: GR-COF-BL).",
    category: "Inventory"
  },
  {
    id: "log-3",
    timestamp: "2026-05-27T16:45:00Z",
    userId: "user-1",
    userName: "Alice Smith",
    role: "Admin",
    action: "API Config Synced",
    details: "Synchronized with cloud accounting framework (Xero API pipeline activated).",
    category: "Sync"
  }
];

export const INITIAL_SYNC_LOGS: CloudSyncLog[] = [
  {
    id: "sync-1",
    timestamp: "2026-05-28T07:30:00Z",
    apiName: "Xero",
    type: "Push Inventory",
    status: "Success",
    payload: JSON.stringify({ items_count: 9, updated_at: "2026-05-28T07:30:00Z", hash: "sha256:7fa1e" }),
    responseTimeMs: 340
  },
  {
    id: "sync-2",
    timestamp: "2026-05-28T07:35:00Z",
    apiName: "QuickBooks",
    type: "Push Sales Invoice",
    status: "Success",
    payload: JSON.stringify({ sales_count: 9, invoice_total_gbp: 9524, sync_job_id: "qbo-91823" }),
    responseTimeMs: 290
  },
  {
    id: "sync-3",
    timestamp: "2026-05-28T08:00:00Z",
    apiName: "Warehouse Sync",
    type: "Pull Multi-Warehouse",
    status: "Success",
    payload: JSON.stringify({ warehouses: ["wh-1", "wh-2", "wh-3"], channels_healthy: true }),
    responseTimeMs: 410
  }
];

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

  const productsStr = localStorage.getItem("ss_products");
  const salesStr = localStorage.getItem("ss_sales");
  const warehousesStr = localStorage.getItem("ss_warehouses");
  const auditLogsStr = localStorage.getItem("ss_audit_logs");
  const syncLogsStr = localStorage.getItem("ss_sync_logs");
  const stocktakesStr = localStorage.getItem("ss_stocktakes");
  const currentUserStr = localStorage.getItem("ss_current_user");

  const products = productsStr ? JSON.parse(productsStr) : INITIAL_PRODUCTS;
  const sales = salesStr ? JSON.parse(salesStr) : INITIAL_SALES;
  const warehouses = warehousesStr ? JSON.parse(warehousesStr) : DEFAULT_WAREHOUSES;
  const auditLogs = auditLogsStr ? JSON.parse(auditLogsStr) : INITIAL_AUDIT_LOGS;
  const syncLogs = syncLogsStr ? JSON.parse(syncLogsStr) : INITIAL_SYNC_LOGS;
  const stocktakes = stocktakesStr ? JSON.parse(stocktakesStr) : [] as StocktakeSession[];
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : DEFAULT_USERS[0];

  // Save back to verify everything is set
  if (!productsStr) localStorage.setItem("ss_products", JSON.stringify(products));
  if (!salesStr) localStorage.setItem("ss_sales", JSON.stringify(sales));
  if (!warehousesStr) localStorage.setItem("ss_warehouses", JSON.stringify(warehouses));
  if (!auditLogsStr) localStorage.setItem("ss_audit_logs", JSON.stringify(auditLogs));
  if (!syncLogsStr) localStorage.setItem("ss_sync_logs", JSON.stringify(syncLogs));
  if (!stocktakesStr) localStorage.setItem("ss_stocktakes", JSON.stringify(stocktakes));
  if (!currentUserStr) localStorage.setItem("ss_current_user", JSON.stringify(currentUser));

  return { products, sales, warehouses, auditLogs, syncLogs, stocktakes, currentUser };
};

export const saveLocalStorageData = {
  products: (data: Product[]) => localStorage.setItem("ss_products", JSON.stringify(data)),
  sales: (data: Sale[]) => localStorage.setItem("ss_sales", JSON.stringify(data)),
  warehouses: (data: Warehouse[]) => localStorage.setItem("ss_warehouses", JSON.stringify(data)),
  auditLogs: (data: AuditLog[]) => localStorage.setItem("ss_audit_logs", JSON.stringify(data)),
  syncLogs: (data: CloudSyncLog[]) => localStorage.setItem("ss_sync_logs", JSON.stringify(data)),
  stocktakes: (data: StocktakeSession[]) => localStorage.setItem("ss_stocktakes", JSON.stringify(data)),
  currentUser: (data: User) => localStorage.setItem("ss_current_user", JSON.stringify(data))
};

export const addAuditLog = (userId: string, userName: string, role: UserRole, action: string, details: string, category: AuditLog["category"]): AuditLog => {
  const currentLogs = JSON.parse(localStorage.getItem("ss_audit_logs") || "[]") as AuditLog[];
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
  localStorage.setItem("ss_audit_logs", JSON.stringify(updated));
  return newLog;
};

export const addSyncLog = (apiName: CloudSyncLog["apiName"], type: CloudSyncLog["type"], status: CloudSyncLog["status"], payload: string): CloudSyncLog => {
  const currentLogs = JSON.parse(localStorage.getItem("ss_sync_logs") || "[]") as CloudSyncLog[];
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
  localStorage.setItem("ss_sync_logs", JSON.stringify(updated));
  return newLog;
};
