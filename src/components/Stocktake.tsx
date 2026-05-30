import React, { useState, useMemo } from "react";
import { Product } from "../types";
import { ClipboardList, Search, Save, Download, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StocktakeProps {
  products: Product[];
  onUpdateInventory: (updatedProducts: Product[]) => void;
}

export default function Stocktake({ products, onUpdateInventory }: StocktakeProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lower = searchTerm.toLowerCase();
    return products.filter((p) => 
      p.name.toLowerCase().includes(lower) || 
      p.sku.toLowerCase().includes(lower) ||
      p.barcode.toLowerCase().includes(lower)
    );
  }, [products, searchTerm]);

  const handleApplyCounts = () => {
    setIsUpdating(true);
    const updatedProducts = products.map((p) => {
      const physicalCountStr = physicalCounts[p.id];
      if (physicalCountStr !== undefined && physicalCountStr.trim() !== "") {
        const physicalCount = parseInt(physicalCountStr, 10);
        if (!isNaN(physicalCount)) {
          return { ...p, quantity: physicalCount };
        }
      }
      return p;
    });

    onUpdateInventory(updatedProducts);
    setPhysicalCounts({});
    setSuccessMsg("Inventory successfully updated with physical counts.");
    setTimeout(() => setSuccessMsg(""), 3000);
    setIsUpdating(false);
  };

  const calculateVariance = (product: Product) => {
    const physicalCountStr = physicalCounts[product.id];
    if (physicalCountStr === undefined || physicalCountStr.trim() === "") return null;
    const physicalCount = parseInt(physicalCountStr, 10);
    if (isNaN(physicalCount)) return null;
    return physicalCount - product.quantity;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Stocktake Variance Report", 14, 22);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ["Product Name", "SKU", "Book Qty", "Physical Qty", "Variance"];
    const tableRows: any[] = [];

    products.forEach((p) => {
      const physicalCountStr = physicalCounts[p.id];
      const physicalCount = (physicalCountStr !== undefined && physicalCountStr.trim() !== "") 
        ? parseInt(physicalCountStr, 10) 
        : null;

      const variance = physicalCount !== null ? physicalCount - p.quantity : null;

      tableRows.push([
        p.name,
        p.sku,
        p.quantity.toString(),
        physicalCount !== null ? physicalCount.toString() : "Not Counted",
        variance !== null ? `${variance > 0 ? "+" : ""}${variance}` : "-"
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`stocktake-report-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-4 animate-fade-in text-left">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products to count..."
            className="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-[#3b82f6] focus:bg-white transition"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 flex-1 sm:flex-none justify-center rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Variance Report</span>
          </button>
          
          <button
            onClick={handleApplyCounts}
            disabled={isUpdating || Object.keys(physicalCounts).length === 0}
            className="px-4 py-2 flex-1 sm:flex-none justify-center rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm cursor-pointer bg-blue-600 border border-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>Apply Counts</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center space-x-2 text-sm font-medium">
          <ClipboardList className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Book Qty</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Physical Qty</th>
                <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">Variance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const variance = calculateVariance(product);
                let varianceColor = "text-slate-400"; // default grey if null or 0
                if (variance !== null) {
                  if (variance > 0) varianceColor = "text-green-600 font-bold bg-green-50";
                  if (variance < 0) varianceColor = "text-red-600 font-bold bg-red-50";
                }

                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-800">{product.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">SKU: {product.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700">{product.quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={physicalCounts[product.id] || ""}
                        onChange={(e) => setPhysicalCounts((prev) => ({ ...prev, [product.id]: e.target.value }))}
                        className="w-20 text-center bg-white border border-slate-300 rounded py-1 px-2 text-sm focus:outline-[#3b82f6] focus:ring-2 focus:ring-blue-100 transition"
                        placeholder="Count"
                      />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {variance !== null ? (
                        <div className={`mx-auto inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded text-sm ${varianceColor}`}>
                          {variance > 0 ? "+" : ""}{variance}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="h-8 w-8 mb-2 text-slate-300" />
                      <p className="text-sm font-medium">No products found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
