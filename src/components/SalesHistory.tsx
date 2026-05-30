import React, { useState } from "react";
import { Sale, Product } from "../types";
import { Search, Printer, Calendar, CalendarDays, ShoppingBag, Receipt, TrendingUp, DollarSign, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SalesHistoryProps {
  sales: Sale[];
  products: Product[];
}

export default function SalesHistory({ sales, products }: SalesHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Format dates beautifully
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Unknown Date";
    }
  };

  // Filter sales
  const filteredSales = sales.filter((s) => {
    const isMatch = 
      s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.loggedBy && s.loggedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Check if s has a cash/card classification or fallback
    const paymentMethod = (s as any).paymentMethod || "Cash";
    const matchesPayment = paymentMethodFilter === "All" || paymentMethod === paymentMethodFilter;

    // Determine if date matches
    const matchesDate = !dateFilter || s.date.startsWith(dateFilter);

    return isMatch && matchesPayment && matchesDate;
  });

  // Calculate gross summary
  const totalRev = filteredSales.reduce((acc, s) => acc + s.revenue, 0);
  const totalCost = filteredSales.reduce((acc, s) => acc + (s.quantity * s.cost), 0);
  const totalProf = totalRev - totalCost;

  // Export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Filtered Sales History", 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 30);
    const dateText = dateFilter ? ` | Selected Date: ${dateFilter}` : "";
    doc.text(`Total Gross Sales: K${totalRev.toFixed(2)} | Net Cost: K${totalCost.toFixed(2)} | Est. Margin: K${totalProf.toFixed(2)}${dateText}`, 14, 36);

    const tableColumn = ["Invoice Ref", "Date & Time", "Product", "Qty", "Unit Price", "Total Bill", "Payment", "Cashier"];
    const tableRows: any[] = [];

    filteredSales.forEach(s => {
      const saleData = [
        s.id.split("-")[0],
        formatDate(s.date),
        s.productName,
        s.quantity,
        `K${s.price.toFixed(2)}`,
        `K${s.revenue.toFixed(2)}`,
        (s as any).paymentMethod || "Cash",
        s.loggedBy || "Staff"
      ];
      tableRows.push(saleData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
    });

    doc.save(`sales-history-export-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-4 animate-fade-in text-left">
      {/* Search and filter controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full flex gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoice number, product name, or cashier..."
                className="w-full bg-slate-50 border border-slate-200 rounded py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-[#3b82f6] focus:bg-white transition"
              />
            </div>
            <div className="relative w-40">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded py-2 px-3 text-xs text-slate-800 focus:outline-[#3b82f6] focus:bg-white transition cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Method:</span>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-[#3b82f6] w-full sm:w-auto cursor-pointer"
              >
                <option value="All">All Payments</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Mobile Pay">Mobile Pay</option>
              </select>
            </div>
            
            <button
              onClick={handleExportToPDF}
              className="px-4 py-2 flex items-center space-x-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-blue-600" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats summaries of filtered list */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Gross Sales in List</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">K{totalRev.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Net Cost value</p>
          <p className="text-xl font-bold font-mono text-slate-550 mt-1">K{totalCost.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">Est. Gross Margin</p>
          <p className="text-xl font-bold font-mono mt-1 text-green-600">
            K{totalProf.toFixed(2)} ({totalRev > 0 ? ((totalProf / totalRev) * 100).toFixed(0) : 0}%)
          </p>
        </div>
      </div>

      {/* Main Table Layout */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-full">
          <table className="min-w-full divide-y divide-slate-100 text-xs">
            <thead className="bg-slate-50 text-slate-550 font-mono text-[9px] uppercase border-b border-slate-150">
              <tr>
                <th className="px-4 py-3 text-left">Invoice Ref</th>
                <th className="px-4 py-3 text-left">Date & Time</th>
                <th className="px-4 py-3 text-left">Product / Item</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total Bill</th>
                <th className="px-4 py-3 text-center">Payment</th>
                <th className="px-4 py-3 text-center">Cashier</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-slate-500">
                    <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-mono text-xs">No sales invoices logged matching filters.</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const payMethod = (s as any).paymentMethod || "Cash";
                  let payColor = "bg-green-50 text-green-700 border-green-200";
                  if (payMethod === "Card") payColor = "bg-blue-50 text-blue-700 border-blue-250";
                  if (payMethod === "Mobile Pay") payColor = "bg-purple-50 text-purple-700 border-purple-200";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/40 transition duration-100">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                        {s.id.split("-")[0]}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">
                        {formatDate(s.date)}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800">
                        {s.productName}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono font-semibold text-slate-700">
                        {s.quantity}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-550">
                        K{s.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        K{s.revenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${payColor}`}>
                          {payMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-500 font-medium">
                        {s.loggedBy || "Staff"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
