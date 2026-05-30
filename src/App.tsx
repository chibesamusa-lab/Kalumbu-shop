import React, { useState, useEffect } from "react";
import { User, Product, Sale } from "./types";
import { getLocalStorageData, saveLocalStorageData } from "./utils/mockData";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import InventoryList from "./components/InventoryList";
import SalesConsole from "./components/SalesConsole";
import SalesHistory from "./components/SalesHistory";
import Stocktake from "./components/Stocktake";
import BarcodeScanner from "./components/BarcodeScanner";
import LoginPage from "./components/LoginPage";
import { ShoppingBag } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Sync core variables with LocalStorage state engine
  const [currentUser] = useState<User>(() => getLocalStorageData().currentUser);
  const [products, setProducts] = useState<Product[]>(() => getLocalStorageData().products);
  const [sales, setSales] = useState<Sale[]>(() => getLocalStorageData().sales);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Layout Tab selection
  const [activeTab, setActiveTab] = useState("dashboard");
  // Popup state for scanner HUD
  const [scannerOpen, setScannerOpen] = useState(false);

  // Hook-up alert badges counting low items
  const lowStockCount = products.filter(p => p.quantity <= p.reorderPoint).length;

  // Central Inventory updater
  const handleUpdateProducts = (
    newProducts: Product[],
    auditData: { action: string; details: string; category: "Inventory" }
  ) => {
    setProducts(newProducts);
    saveLocalStorageData.products(newProducts);
  };

  // Pos checkouts checkout logger
  const handleLogSale = (
    newSales: Sale[],
    updatedProducts: Product[],
    auditMessage: string
  ) => {
    // Append sales records
    const refreshedSales = [...newSales, ...sales];
    setSales(refreshedSales);
    saveLocalStorageData.sales(refreshedSales);

    // Rewriting stock levels
    setProducts(updatedProducts);
    saveLocalStorageData.products(updatedProducts);
  };

  // Barcode Scanning dispatch outcomes
  const handleScannedResultDispatch = (
    product: Product,
    scanType: "Intake" | "Checkout"
  ) => {
    if (scanType === "Intake") {
      // Quick increment stock of item
      const list = products.map(p => {
        if (p.id === product.id) {
          return { ...p, quantity: p.quantity + 10 };
        }
        return p;
      });

      handleUpdateProducts(list, {
        action: "Barcode Intake Process",
        details: `Simulated scan intake of barcode: ${product.barcode} (+10 SKU: ${product.sku})`,
        category: "Inventory"
      });
    } else {
      // Swap immediately to Sales Console and close scanner
      setActiveTab("sales");
      setScannerOpen(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Dynamic Navigation Header */}
      <Header 
        currentUser={currentUser}
        lowStockCount={lowStockCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Render simple Workspace Panels */}
        {activeTab === "dashboard" && (
          <Dashboard 
            products={products}
            sales={sales}
            lowStockCount={lowStockCount}
            onNavigate={setActiveTab}
            currentUser={currentUser}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryList 
            products={products}
            currentUser={currentUser}
            onUpdateProducts={handleUpdateProducts}
            onTriggerScanner={() => setScannerOpen(true)}
          />
        )}

        {activeTab === "sales" && (
          <SalesConsole 
            products={products}
            sales={sales}
            currentUser={currentUser}
            onLogSale={handleLogSale}
            onTriggerScanner={() => setScannerOpen(true)}
          />
        )}

        {activeTab === "sales_history" && (
          <SalesHistory 
            sales={sales}
            products={products}
          />
        )}

        {activeTab === "stocktake" && (
          <Stocktake 
            products={products}
            onUpdateInventory={(updatedProducts) => handleUpdateProducts(updatedProducts, {
              action: "Stocktake Application",
              details: "Physical counts applied.",
              category: "Inventory"
            })}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 text-center py-5 text-slate-450 text-[10px] sm:text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="flex items-center space-x-1 justify-center sm:justify-start">
            <span>Shopkeeper Inventory Control Panel © 2026.</span>
          </p>
          <div className="flex items-center space-x-1.5 font-mono text-[10px] tracking-tight uppercase">
            <span className="inline-block h-1.5 w-1.5 bg-green-500 rounded-full"></span>
            <span>Digital Register Active</span>
          </div>
        </div>
      </footer>

      {/* POPUP MODAL: BARCODE SCANNER HUD */}
      {scannerOpen && (
        <BarcodeScanner 
          products={products}
          currentUser={currentUser}
          onClose={() => setScannerOpen(false)}
          onScannedAction={handleScannedResultDispatch}
        />
      )}
    </div>
  );
}
