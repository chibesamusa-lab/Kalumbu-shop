import React, { useState } from "react";
import { User } from "../types";
import { Bell, ShoppingBag, Receipt, Menu, AlertTriangle, ShieldCheck, Heart, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface HeaderProps {
  currentUser: User;
  lowStockCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({
  currentUser,
  lowStockCount,
  activeTab,
  setActiveTab
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "inventory", label: "Inventory List" },
    { id: "sales", label: "POS Register" },
    { id: "sales_history", label: "Sales History" },
    { id: "stocktake", label: "Stocktake" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-xs text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Shop Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/10">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-bold tracking-tight text-lg text-slate-900 block leading-tight">
                Kalumbu Shop
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                Storefront & POS register
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-150 relative cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                  }`}
                >
                  <span>{item.label}</span>
                  
                  {item.id === "inventory" && lowStockCount > 0 && (
                    <span className="ml-1.5 px-2 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 rounded-full border border-rose-200 shadow-xs animate-pulse">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Profile / Alerts indicators */}
          <div className="flex items-center space-x-3.5">
            {/* Low stock general notification trigger */}
            {lowStockCount > 0 && (
              <div 
                onClick={() => setActiveTab("inventory")}
                className="relative p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100 transition duration-150 cursor-pointer flex items-center space-x-1"
                title={`${lowStockCount} items are below their reorder point!`}
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 hidden sm:inline-block font-mono">Stock Warning</span>
              </div>
            )}

            {/* Flat profile pill (Simple shopkeeper, no dropdown user swapper) */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="h-6 w-6 rounded bg-blue-105 text-blue-600 flex items-center justify-center font-bold text-xs bg-slate-200">
                SO
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-bold leading-none text-slate-805">Shop Owner</p>
                <p className="text-[9px] text-slate-450 font-mono mt-0.5 uppercase tracking-wide font-medium">Administrator</p>
              </div>
              <button
                onClick={() => signOut(auth)}
                className="ml-2 p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Menu Toggler */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 bg-slate-50 border border-slate-205 rounded-lg text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 py-2.5 px-4 space-y-1 shadow-inner animate-fade-in text-left">
          <p className="text-[10px] font-mono text-slate-400 px-3 py-1 font-bold">STORE CONSOLE TAB</p>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition duration-150 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center">
                  {item.label}
                  {item.id === "inventory" && lowStockCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-[9px] font-black bg-rose-100 text-rose-700 border border-rose-150 rounded-full animate-pulse">
                      {lowStockCount}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
