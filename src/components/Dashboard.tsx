import React, { useState } from "react";
import { Product, Sale, User } from "../types";
import { 
  TrendingUp, 
  Layers, 
  ArrowUpRight, 
  AlertTriangle, 
  DollarSign, 
  ShoppingCart,
  Receipt,
  Sparkles,
  ShoppingBag,
  PackageCheck
} from "lucide-react";

interface DashboardProps {
  products: Product[];
  sales: Sale[];
  lowStockCount: number;
  onNavigate: (tab: string) => void;
  currentUser: User;
}

export default function Dashboard({
  products,
  sales,
  lowStockCount,
  onNavigate,
  currentUser
}: DashboardProps) {
  // Calculate Key metrics for a single shop
  const totalStockQty = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalProductsCount = products.length;
  
  // Total costs and retail inventory valuations
  const inventoryCostValue = products.reduce((acc, p) => acc + (p.quantity * p.cost), 0);
  const inventoryRetailValue = products.reduce((acc, p) => acc + (p.quantity * p.price), 0);

  // Filter Sales list (for stats, display all)
  const totalRevenue = sales.reduce((acc, s) => acc + s.revenue, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
  const averageTicket = sales.length > 0 ? (totalRevenue / sales.length) : 0;

  // Group current logs to draw a visual trend
  const dailyTrendData = React.useMemo(() => {
    const dates: { [key: string]: number } = {};
    const sortedSales = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Select last 7 records for a beautiful sparkline style format
    const recent = sortedSales.slice(-7);
    recent.forEach(s => {
      const dateString = new Date(s.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      dates[dateString] = (dates[dateString] || 0) + s.revenue;
    });

    return Object.keys(dates).map(key => ({ date: key, amount: dates[key] }));
  }, [sales]);

  const maxDailyAmount = Math.max(...dailyTrendData.map(d => d.amount), 500);

  // SVG dimensions for trend chart
  const padding = 35;
  const height = 150;
  const width = 500;

  // Render a responsive path for the sales trend SVG
  const trendPoints = dailyTrendData.map((d, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(dailyTrendData.length - 1, 1);
    const y = height - padding - (d.amount / maxDailyAmount) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = dailyTrendData.length > 0 ? `
    ${padding},${height - padding} 
    ${trendPoints} 
    ${padding + (dailyTrendData.length - 1) * (width - padding * 2) / Math.max(dailyTrendData.length - 1, 1)},${height - padding}
  ` : "";

  // Last 5 checkout receipts log
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 text-left">
      
      {/* Welcome Hero Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono bg-blue-50 text-blue-600 border border-blue-100 rounded font-bold uppercase tracking-wider">
                My Storefront active
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight mt-2">
              Welcome to <span className="text-blue-600 font-semibold">Kalumbu Shop</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 sm:max-w-xl leading-relaxed">
              Here is your shop's simplified on-hand inventory, daily sales, and register cash metrics overview. Add stock, scan items, or process checkouts instantly.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2.5">
            <button
               onClick={() => onNavigate("inventory")}
               className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded transition duration-150 flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <PackageCheck className="h-4 w-4 text-slate-550" />
              <span>Modify Stock List</span>
            </button>
            <button
               onClick={() => onNavigate("sales")}
               className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-150 shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>POS Sales Checkout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Shop Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">TOTAL SALES</span>
            <div className="p-1 px-1.5 rounded-sm bg-green-50 text-green-600 border border-green-100 text-xs font-bold font-mono">
              K
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold font-mono text-slate-900">
              K{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>{sales.length} checkouts processed</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">EST. PROFITS</span>
            <div className="p-1 px-1.5 rounded-sm bg-blue-50 text-blue-600 border border-blue-105 text-xs font-bold font-mono">
              %
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold font-mono text-slate-900">
              K{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Margin: <strong className="text-blue-600">{totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(0) : 0}%</strong> gross yields
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">UNITS ON HAND</span>
            <div className="p-1 px-1.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold font-mono">
              PCS
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-bold font-mono text-slate-900">
              {totalStockQty.toLocaleString()} items
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Across <strong className="text-slate-800 font-semibold">{totalProductsCount} distinct products</strong>
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`border rounded-xl p-5 shadow-sm transition duration-150 ${
          lowStockCount > 0 
            ? "bg-red-50/50 border-red-200 text-red-700"
            : "bg-white border-slate-200 text-slate-700"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider font-mono ${lowStockCount > 0 ? "text-red-500" : "text-slate-400"}`}>LOW STOCK ALERTS</span>
            <div className={`p-1 px-2 rounded font-semibold text-[10px] ${lowStockCount > 0 ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-50 text-slate-400"}`}>
              {lowStockCount > 0 ? "WARN" : "OK"}
            </div>
          </div>
          <div className="mt-2.5">
            <h3 className={`text-2xl font-bold font-mono ${lowStockCount > 0 ? "text-red-600" : "text-slate-900"}`}>{lowStockCount} items</h3>
            <p className={`text-[11px] mt-1 ${lowStockCount > 0 ? "text-red-550 font-medium" : "text-slate-450"}`}>
              {lowStockCount > 0 ? "Action needed: stock levels low" : "All levels healthy"}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Trend Chart & Recent Activities Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Sparkline Graph */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans font-semibold text-slate-800 tracking-tight">Recent Sales Revenue Trend</h3>
              <p className="text-[10px] text-slate-450 font-mono uppercase">Past active storefront transactions tracking</p>
            </div>
            
            <div className="text-[10px] bg-slate-50 border border-slate-200 py-1 px-2.5 rounded font-mono text-slate-655 font-bold">
              Avg Bill: K{averageTicket.toFixed(2)}
            </div>
          </div>

          <div className="w-full relative h-[150px]">
            {dailyTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-slate-50 rounded border border-slate-100">
                <p className="text-xs text-slate-400">Process your first sales checkouts to view graph.</p>
              </div>
            ) : (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="dashboardGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* horizontal guideline */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const y = padding + ratio * (height - padding * 2);
                  return (
                    <line 
                      key={i}
                      x1={padding} 
                      y1={y} 
                      x2={width - padding} 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth="1.5" 
                    />
                  );
                })}

                {/* Area Points */}
                {areaPoints && (
                  <polygon points={areaPoints} fill="url(#dashboardGradient)" />
                )}

                {/* Line overlay */}
                {trendPoints && (
                  <polyline 
                    points={trendPoints} 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Circles for points */}
                {dailyTrendData.map((d, index) => {
                  const x = padding + (index * (width - padding * 2)) / Math.max(dailyTrendData.length - 1, 1);
                  const y = height - padding - (d.amount / maxDailyAmount) * (height - padding * 2);
                  return (
                    <circle 
                      key={index}
                      cx={x} 
                      cy={y} 
                      r="3.5" 
                      fill="#ffffff" 
                      stroke="#2563eb" 
                      strokeWidth="2" 
                    />
                  );
                })}

                {/* Dates markers */}
                {dailyTrendData.map((d, index) => {
                  const x = padding + (index * (width - padding * 2)) / Math.max(dailyTrendData.length - 1, 1);
                  return (
                    <text 
                      key={index} 
                      x={x} 
                      y={height - padding + 15} 
                      textAnchor="middle" 
                      fill="#94a3b8" 
                      className="text-[9px] font-mono leading-none"
                    >
                      {d.date}
                    </text>
                  );
                })}
              </svg>
            )}
          </div>
        </div>

        {/* Recent Checkout Bills lists */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-semibold text-slate-800 tracking-tight">Recent Cashier Receipts</h3>
            <p className="text-[10px] text-slate-450 font-mono uppercase mb-3.5">Latest 5 sales transactions</p>

            <div className="space-y-2.5">
              {recentSales.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-slate-150 rounded">
                  <Receipt className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-400">No historic sales recorded.</p>
                </div>
              ) : (
                recentSales.map((s) => {
                  const method = (s as any).paymentMethod || "Cash";
                  return (
                    <div key={s.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-150">
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{s.productName}</p>
                        <span className="text-[9px] font-mono text-slate-450">
                          {s.id.split("-")[0]} · {method}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-905 font-mono">K{s.revenue.toFixed(2)}</p>
                        <span className="text-[9px] text-slate-450 font-mono">x{s.quantity} pcs</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {recentSales.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => onNavigate("sales_history")}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center transition cursor-pointer"
              >
                <span>View Full Sales History</span>
                <ArrowUpRight className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
