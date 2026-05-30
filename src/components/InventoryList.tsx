import React, { useState } from "react";
import { Product, User } from "../types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  ChevronsUpDown, 
  Barcode, 
  RefreshCw, 
  Edit, 
  Settings,
  X,
  PackageOpen,
  Minus,
  Download
} from "lucide-react";

interface InventoryListProps {
  products: Product[];
  currentUser: User;
  onUpdateProducts: (newProducts: Product[], auditAction: { action: string; details: string; category: "Inventory" }) => void;
  onTriggerScanner: () => void;
}

export default function InventoryList({
  products,
  currentUser,
  onUpdateProducts,
  onTriggerScanner
}: InventoryListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [cashierName, setCashierName] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "Groceries",
    quantity: 0,
    reorderPoint: 5,
    cost: 0,
    price: 0
  });

  const categories = ["Groceries", "Apparel", "Other"];

  // Sort and filter computation
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || p.quantity <= p.reorderPoint;

    return matchesSearch && matchesCategory && matchesLowStock;
  }).sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === "string") {
      aValue = (aValue as string).toLowerCase();
      bValue = (bValue as string).toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Safe code generations for ease of testing
  const generateRandomSKUAndBarcode = () => {
    const randomBar = "501" + Math.floor(1000000000 + Math.random() * 900000000);
    const randomSKU = `${formData.category.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setFormData(prev => ({
      ...prev,
      barcode: randomBar,
      sku: randomSKU
    }));
  };

  // Create Product Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: formData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      barcode: formData.barcode || "5011112223334",
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      reorderPoint: Number(formData.reorderPoint),
      cost: Number(formData.cost),
      price: Number(formData.price),
      warehouseId: "wh-1", // hardcoded default
      lastSyncedAt: new Date().toISOString()
    };

    onUpdateProducts(
      [newProduct, ...products],
      {
        action: "Create Product",
        details: `Created product ${newProduct.name} (SKU: ${newProduct.sku}) in Shop storefront`,
        category: "Inventory"
      }
    );

    setAddModalOpen(false);
    // Reset Data
    setFormData({
      name: "",
      sku: "",
      barcode: "",
      category: "Groceries",
      quantity: 0,
      reorderPoint: 5,
      cost: 0,
      price: 0
    });
  };

  // Open Edit Dialog
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      quantity: p.quantity,
      reorderPoint: p.reorderPoint,
      cost: p.cost,
      price: p.price
    });
    setEditModalOpen(true);
  };

  // Edit Product Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const updatedList = products.map(p => {
      if (p.id === editingProduct.id) {
         return {
           ...p,
           name: formData.name,
           sku: formData.sku,
           barcode: formData.barcode,
           category: formData.category,
           quantity: Number(formData.quantity),
           reorderPoint: Number(formData.reorderPoint),
           cost: Number(formData.cost),
           price: Number(formData.price),
           lastSyncedAt: new Date().toISOString()
         };
      }
      return p;
    });

    onUpdateProducts(
      updatedList,
      {
        action: "Edit Product",
        details: `Updated info for ${formData.name} (SKU: ${formData.sku}). Quantity on hand: ${formData.quantity}.`,
        category: "Inventory"
      }
    );

    setEditModalOpen(false);
    setEditingProduct(null);
  };

  // Inline Quick Stock Adjustment
  const handleQuickAdjust = (productId: string, diff: number) => {
    const list = products.map(p => {
      if (p.id === productId) {
        const nextQty = Math.max(0, p.quantity + diff);
        return { ...p, quantity: nextQty };
      }
      return p;
    });

    const target = products.find(p => p.id === productId);
    if (!target) return;

    onUpdateProducts(
      list,
      {
        action: "Quick Stock Adjust",
        details: `Manually adjusted stock of ${target.name} from ${target.quantity} to ${Math.max(0, target.quantity + diff)}.`,
        category: "Inventory"
      }
    );
  };

  // Export to PDF
  const handleExportPDF = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Inventory Stock Report", 14, 22);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Cashier / Staff on Duty: ${cashierName || "Not Specified"}`, 14, 36);

    const tableColumn = ["Product Name", "SKU / Barcode", "Category", "Stock Qty", "Cost (K)", "Sell Price (K)"];
    const tableRows: any[] = [];

    filteredProducts.forEach(p => {
      const pData = [
        p.name,
        `${p.sku}\n${p.barcode}`,
        p.category,
        p.quantity.toString(),
        `K${p.cost.toFixed(2)}`,
        `K${p.price.toFixed(2)}`
      ];
      tableRows.push(pData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`inventory-stock-${Date.now()}.pdf`);
    setExportModalOpen(false);
  };

  return (
    <div className="space-y-4 animate-fade-in text-left">
      
      {/* Control filters bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Search container */}
          <div className="relative flex-1 w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => searchQuery(e.target.value)}
              placeholder="Search by barcode, name, SKU..."
              className="w-full bg-slate-50 border border-slate-205 rounded py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-[#3b82f6] focus:bg-white transition"
            />
          </div>

          {/* Inline controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            
            {/* Direct Trigger to Barcode Scanner Simulator */}
            <button
              onClick={onTriggerScanner}
              type="button"
              className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-755 hover:bg-slate-50 rounded shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Barcode className="h-4 w-4 text-blue-600" />
              <span>Simulate Scan</span>
            </button>

            {/* Category Selector */}
            <div className="flex items-center space-x-1 text-slate-600 bg-slate-50 border border-slate-200 p-1 rounded">
              <span className="px-2 text-[10px] font-mono text-slate-400 uppercase tracking-tight font-bold">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-semibold focus:outline-none pr-2 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Low Stock Alerts trigger toggle */}
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`px-3 py-2 rounded text-xs font-semibold transition border cursor-pointer duration-150 flex items-center space-x-1.5 ${
                showLowStockOnly 
                  ? "bg-amber-50 text-amber-700 border-amber-200 font-semibold" 
                  : "bg-white border-slate-200 text-slate-655 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Low-Stock Alerts</span>
            </button>

            {/* Add stock trigger */}
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stock Product</span>
            </button>
            
            {/* Export PDF trigger */}
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>Export PDF</span>
            </button>
            
          </div>

        </div>
      </div>

      {/* Main Table Layout */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono text-[9px] uppercase border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-slate-800" onClick={() => handleSort("name")}>
                  Product Name <ChevronsUpDown className="inline h-3.5 w-3.5 ml-0.5" />
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-slate-800" onClick={() => handleSort("sku")}>
                  SKU / Barcode <ChevronsUpDown className="inline h-3.5 w-3.5 ml-0.5" />
                </th>
                <th className="px-4 py-3 cursor-pointer select-none hover:text-slate-800" onClick={() => handleSort("category")}>
                  Category <ChevronsUpDown className="inline h-3.5 w-3.5 ml-0.5" />
                </th>
                <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-slate-800" onClick={() => handleSort("quantity")}>
                  Stock On Hand <ChevronsUpDown className="inline h-3.5 w-3.5 ml-0.5" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer select-none hover:text-slate-805" onClick={() => handleSort("cost")}>
                  Cost Price <ChevronsUpDown className="inline h-3.5 w-3.5 ml-0.5" />
                </th>
                <th className="px-4 py-3 text-right cursor-pointer select-none hover:text-slate-805" onClick={() => handleSort("price")}>
                  Selling Price <ChevronsUpDown className="inline h-3.5 w-3.5 ml-0.5" />
                </th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <PackageOpen className="h-10 w-10 text-slate-350 mx-auto mb-2" />
                    <p className="text-slate-500 font-medium text-sm font-mono">No products matched query.</p>
                    <p className="text-slate-400 text-xs mt-1">Try resetting the category filter etc.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.quantity <= p.reorderPoint;
                  
                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-50/40 transition duration-100 ${isLow ? "bg-amber-500/[0.015]" : ""}`}
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-800 text-xs font-semibold">{p.name}</span>
                          {isLow && (
                            <span 
                              className="px-1.5 py-0.5 text-[8px] bg-amber-50 text-amber-700 border border-amber-250 font-mono rounded font-bold"
                              title={`Stock alert limit is ${p.reorderPoint}, current is ${p.quantity}`}
                            >
                              LOW STOCK
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <p className="text-slate-700 text-xs font-semibold">{p.sku}</p>
                        <span className="text-[10px] text-slate-450 flex items-center">
                          <Barcode className="h-3 w-3 mr-1 text-slate-400" />
                          {p.barcode}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Quick Adjust controls */}
                          <button
                            onClick={() => handleQuickAdjust(p.id, -1)}
                            disabled={p.quantity === 0}
                            className={`w-5.5 h-5.5 rounded border border-slate-205 bg-white flex items-center justify-center transition cursor-pointer text-slate-550 ${
                              p.quantity === 0
                                ? "opacity-35 cursor-not-allowed"
                                : "hover:bg-slate-50 hover:text-slate-800 shadow-xs"
                            }`}
                            title="Decrease stock 1 unit"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>

                          <span className={`font-mono font-bold w-12 text-center text-xs ${isLow ? "text-amber-600 font-black" : "text-slate-805"}`}>
                            {p.quantity}
                          </span>

                          <button
                            onClick={() => handleQuickAdjust(p.id, 5)}
                            className="w-5.5 h-5.5 rounded border border-slate-205 bg-white flex items-center justify-center transition cursor-pointer text-slate-550 hover:bg-slate-50 hover:text-slate-800 shadow-xs"
                            title="Add 5 units"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-slate-550 font-semibold">
                        K{p.cost.toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-slate-800 font-bold">
                        K{p.price.toFixed(2)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded border transition cursor-pointer bg-white text-slate-600 border-slate-205 hover:border-slate-350 hover:bg-slate-50"
                          title="Edit product details"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD PRODUCT */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl p-6 overflow-hidden max-h-[96vh] overflow-y-auto animate-fade-in relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold font-sans text-slate-900 uppercase tracking-wider flex items-center">
                <PackageOpen className="h-4.5 w-4.5 mr-2 text-blue-600" />
                Add Store Product
              </h3>
              <button 
                onClick={() => setAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded border border-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-left">
              <div>
                <label className="block text-xs text-slate-500 font-semibold font-mono mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Classic Mug or Leather Wallet"
                  className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#3b82f6] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-505 font-semibold font-mono mb-1">Classification Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 focus:outline-none focus:bg-white cursor-pointer"
                >
                  {categories.filter(c => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-slate-500 font-semibold font-mono mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. MS-MUG-01"
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-505 font-semibold font-mono mb-1">Barcode Bar</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 501234567"
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={generateRandomSKUAndBarcode}
                  className="text-[10px] font-mono text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer font-bold"
                >
                  <RefreshCw className="h-3 w-3 mr-0.5" />
                  <span>Generate SKU & Barcode</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Initial Stock (Qty)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Low-Stock Alert Qty Limit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Cost Price Item (K)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Selling Shelf Price (K)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer shadow-xs"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-xl p-6 overflow-hidden max-h-[96vh] overflow-y-auto animate-fade-in relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold font-sans text-slate-900 uppercase tracking-wider flex items-center">
                <Settings className="h-4.5 w-4.5 mr-2 text-blue-600" />
                Edit Details: {editingProduct.name}
              </h3>
              <button 
                onClick={() => setEditModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded border border-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-left">
              <div>
                <label className="block text-xs text-slate-500 font-semibold font-mono mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-505 font-semibold font-mono mb-1">Classification Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 focus:outline-none focus:bg-white cursor-pointer"
                >
                  {categories.filter(c => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-slate-500 font-semibold font-mono mb-1">SKU / Item Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-250 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-505 font-semibold font-mono mb-1">Barcode String</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-850 focus:outline-none focus:border-blue-250 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Stock On Hand (Qty)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Low-Stock Alert Qty Limit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Unit Cost Price (K)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-550 font-semibold font-mono mb-1">Selling Shelf Price (K)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-805 focus:outline-none focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                   type="button"
                   onClick={() => setEditModalOpen(false)}
                   className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                   type="submit"
                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPORT PDF */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl p-6 overflow-hidden animate-fade-in relative text-left">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold font-sans text-slate-900 uppercase tracking-wider flex items-center">
                <Download className="h-4.5 w-4.5 mr-2 text-blue-600" />
                Export Inventory to PDF
              </h3>
              <button 
                onClick={() => setExportModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded border border-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleExportPDF} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs text-slate-500 font-semibold font-mono mb-1">Cashier on Duty</label>
                <input
                  type="text"
                  required
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-55 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer shadow-xs flex items-center"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  <span>Download Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
