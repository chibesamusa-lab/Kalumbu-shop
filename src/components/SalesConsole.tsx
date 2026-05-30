import React, { useState } from "react";
import { Product, Sale, User } from "../types";
import { 
  ShoppingCart, 
  Trash2, 
  Check, 
  Search, 
  Barcode, 
  Printer,
  TrendingUp,
  AlertTriangle,
  Coins,
  CreditCard,
  Smartphone
} from "lucide-react";

interface SalesConsoleProps {
  products: Product[];
  sales: Sale[];
  currentUser: User;
  onLogSale: (
    newSales: Sale[],
    updatedProducts: Product[],
    auditMessage: string
  ) => void;
  onTriggerScanner: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function SalesConsole({
  products,
  sales,
  currentUser,
  onLogSale,
  onTriggerScanner
}: SalesConsoleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Mobile Pay">("Cash");
  const [saleInvoiceRecord, setSaleInvoiceRecord] = useState<Sale[] | null>(null);
  const [notif, setNotif] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cashGiven, setCashGiven] = useState<string>("");
  const [cashierName, setCashierName] = useState<string>(currentUser.name);

  // Filter products that matched searches and have stock > 0
  const availableProducts = products.filter(p => {
    const isStock = p.quantity > 0;
    const isMatch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    return isStock && isMatch;
  });

  // Add Item to cart
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (currentQtyInCart >= product.quantity) {
      setNotif({
        type: "error",
        text: `Cannot add more. Only ${product.quantity} units available in stock.`
      });
      return;
    }

    setNotif(null);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Quick adjust cartilage
  const adjustCartQty = (productId: string, value: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    const nextQty = item.quantity + value;
    if (nextQty <= 0) {
      setCart(cart.filter(i => i.product.id !== productId));
      return;
    }

    if (nextQty > item.product.quantity) {
      setNotif({
        type: "error",
        text: `Cannot exceed available physical shop inventory (${item.product.quantity} max).`
      });
      return;
    }

    setNotif(null);
    setCart(cart.map(i => 
      i.product.id === productId ? { ...i, quantity: nextQty } : i
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Totals calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const cartCostTotal = cart.reduce((acc, item) => acc + (item.product.cost * item.quantity), 0);
  const cartProfit = cartSubtotal - cartCostTotal;
  const cartMargin = cartSubtotal > 0 ? (cartProfit / cartSubtotal) * 105 : 0;

  // Complete Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (paymentMethod === "Cash" && Number(cashGiven) < cartSubtotal) {
      setNotif({
        type: "error",
        text: `Insufficient cash given. Need at least K${cartSubtotal.toFixed(2)}.`
      });
      return;
    }

    // Create unique sales invoice reference
    const invoiceId = `INV-${Date.now().toString().slice(-6)}`;
    const newSales: Sale[] = [];
    
    // Decrement stock from products
    const updatedProducts = products.map(p => {
      const cartMatch = cart.find(item => item.product.id === p.id);
      if (cartMatch) {
         const revenue = cartMatch.product.price * cartMatch.quantity;
         const cost = cartMatch.product.cost * cartMatch.quantity;
         const profit = revenue - cost;

         const saleObj: Sale = {
           id: `${invoiceId}-${cartMatch.product.id}`,
           productId: p.id,
           productName: p.name,
           quantity: cartMatch.quantity,
           price: p.price,
           cost: p.cost,
           revenue,
           profit,
           date: new Date().toISOString(),
           warehouseId: "wh-1", // default storefront
           loggedBy: cashierName || currentUser.name
         };

         // Attach custom paymentMethod property seamlessly
         (saleObj as any).paymentMethod = paymentMethod;

         newSales.push(saleObj);

         return {
           ...p,
           quantity: p.quantity - cartMatch.quantity,
           lastSyncedAt: new Date().toISOString()
         };
      }
      return p;
    });

    onLogSale(
      newSales, 
      updatedProducts, 
      `Processed Checkout Invoice {${invoiceId}} containing ${cart.length} lines. Mode: ${paymentMethod}. Total: K${cartSubtotal.toFixed(2)}`
    );

    setSaleInvoiceRecord(newSales);
    setCart([]);
    setCashGiven("");
    setNotif({
      type: "success",
      text: `Checkout successful! Invoice ${invoiceId} compiled using payment method: ${paymentMethod}`
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header controls */}
      <div>
        <h2 className="text-xl font-bold font-sans text-slate-900">Direct POS Checkout</h2>
        <p className="text-xs text-slate-500 font-mono uppercase">Instant Sales Register cash drawer</p>
      </div>

      {notif && (
        <div className={`border p-4 rounded-xl flex items-center justify-between shadow-sm animate-fade-in ${
          notif.type === "success" 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center space-x-2.5">
            <span className={`p-1 rounded ${notif.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100"}`}>
              {notif.type === "success" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </span>
            <span className="text-xs font-semibold">{notif.text}</span>
          </div>
          <button 
            onClick={() => setNotif(null)}
            className="text-[10px] uppercase font-bold tracking-wider opacity-85 hover:opacity-100 cursor-pointer px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid Layout for catalog on left and checkout drawer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Catalog list */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 lg:col-span-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold font-mono text-slate-650 uppercase tracking-tight">Active Items Catalog</span>
            <span className="text-[10px] font-mono text-slate-450 uppercase">{availableProducts.length} items on shelves</span>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name, barcode, or SKU..."
                className="w-full bg-slate-50 border border-slate-205 rounded py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-[#3b82f6] focus:bg-white transition"
              />
            </div>
            <button
              onClick={onTriggerScanner}
              type="button"
              className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-blue-600 rounded transition cursor-pointer"
              title="Touch Barcode Scanner HUD"
            >
              <Barcode className="h-4 w-4" />
            </button>
          </div>

          {/* Available Catalog Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {availableProducts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded border border-slate-150 col-span-2">
                <p className="text-xs text-slate-500 font-mono">No active products match search filters.</p>
                <p className="text-[10px] text-slate-405 mt-1">Make sure you have added products with quantities &gt; 0</p>
              </div>
            ) : (
              availableProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 bg-slate-50/70 border border-slate-200 hover:border-blue-400 hover:bg-white rounded cursor-pointer transition text-left flex flex-col justify-between h-28"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tight">{p.sku}</span>
                      <span className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-blue-600 font-bold">
                        {p.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-805 mt-1.5 line-clamp-1">{p.name}</h4>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-mono">Sell Price</p>
                      <p className="text-xs font-bold text-slate-800 font-mono">K{p.price.toFixed(2)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-450">Stock</p>
                      <span className={`text-[10px] font-bold font-mono ${p.quantity <= p.reorderPoint ? "text-amber-600 font-black animate-pulse" : "text-green-750"}`}>
                        {p.quantity} pcs
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Checkout Drawer panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 lg:col-span-5 shadow-sm">
          
          <div className="flex items-center space-x-2 pb-3.5 border-b border-slate-100">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">Current Shopping Bill</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded border border-slate-200">
                <ShoppingCart className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-500 font-mono">Bill is currently empty</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Select items on the left menu catalog</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex-1 min-w-0 pr-2">
                    <h5 className="text-xs font-bold text-slate-800 truncate">{item.product.name}</h5>
                    <p className="text-[10px] text-slate-505 font-mono">
                      K{item.product.price.toFixed(2)} ea · <span className="text-slate-400">{item.product.sku}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => adjustCartQty(item.product.id, -1)}
                      className="text-xs font-bold bg-white border border-slate-205 hover:bg-slate-100 text-slate-700 w-5 h-5 flex items-center justify-center rounded cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-800 font-mono w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => adjustCartQty(item.product.id, 1)}
                      className="text-xs font-bold bg-white border border-slate-205 hover:bg-slate-100 text-slate-700 w-5 h-5 flex items-center justify-center rounded cursor-pointer"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-red-500 hover:text-red-750 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method Selector and Cashier Input */}
          {cart.length > 0 && (
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider">CASHIER ON DUTY</span>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  placeholder="Enter Cashier Name"
                  className="w-full bg-slate-50 border border-slate-205 rounded py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-[#3b82f6] focus:bg-white transition"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-wider">CHOOSE PAYMENT METHOD</span>
                <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Cash")}
                  className={`py-2 rounded-lg text-xs font-semibold border flex flex-col items-center justify-center cursor-pointer transition ${
                    paymentMethod === "Cash" 
                      ? "bg-green-50 border-green-500 text-green-700" 
                      : "bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Coins className="h-4 w-4 mb-1" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Card")}
                  className={`py-2 rounded-lg text-xs font-semibold border flex flex-col items-center justify-center cursor-pointer transition ${
                    paymentMethod === "Card" 
                      ? "bg-blue-50 border-blue-550 text-blue-700" 
                      : "bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Mobile Pay")}
                  className={`py-2 rounded-lg text-xs font-semibold border flex flex-col items-center justify-center cursor-pointer transition ${
                    paymentMethod === "Mobile Pay" 
                      ? "bg-purple-50 border-purple-500 text-purple-700" 
                      : "bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Smartphone className="h-4 w-4 mb-1" />
                  <span>Mobile Pay</span>
                </button>
              </div>
            </div>
            </div>
          )}

          {/* Subtotal Calculations */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Gross Total</span>
              <span className="font-mono text-slate-705">K{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Est. Product Cost</span>
              <span className="font-mono text-slate-500">K{cartCostTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-baseline border-t border-slate-200 pt-2 text-slate-900">
              <span className="text-xs font-bold uppercase font-mono tracking-wide">NET BILL DUE</span>
              <span className="text-xl font-bold font-mono text-blue-600">
                K{cartSubtotal.toFixed(2)}
              </span>
            </div>

            {paymentMethod === "Cash" && (
              <div className="pt-3 mt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase font-mono tracking-wide text-slate-700">Cash Given</span>
                  <div className="relative w-28">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-slate-500 text-xs font-mono">
                      K
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded py-1.5 pl-6 pr-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500 text-right shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                {cashGiven !== "" && (
                  <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold uppercase font-mono tracking-wide text-slate-700">Change Due</span>
                    <span className={`text-lg font-bold font-mono ${Number(cashGiven) >= cartSubtotal ? "text-green-600" : "text-red-500"}`}>
                      K{(Number(cashGiven) - cartSubtotal).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkout triggers */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
              cart.length === 0 
                ? "bg-slate-100 text-slate-400 border border-slate-205 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10"
            }`}
          >
            <Check className="h-4 w-4 text-white" />
            <span>Complete Order Checkout</span>
          </button>

        </div>

      </div>

      {/* RECIEPT OVERLAY SCREEN */}
      {saleInvoiceRecord && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xl relative max-w-md mx-auto animate-fade-in border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold font-mono text-emerald-600 uppercase tracking-widest">
                ✓ RETAIL CHECKOUT RECEIPT
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Bill Invoice Ref: {saleInvoiceRecord[0]?.id.split("-")[0]}</p>
            </div>
            
            <button
              onClick={() => setSaleInvoiceRecord(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-mono bg-white border border-slate-200 py-1 px-3 rounded shadow-sm cursor-pointer font-bold"
            >
              Close
            </button>
          </div>

          <div id="invoice-bill-printable" className="p-4 bg-slate-50 border border-slate-205 rounded-lg space-y-4 font-mono text-left text-xs text-slate-705">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h3 className="font-bold text-slate-900 uppercase text-sm tracking-wide">STORE REGISTER OUTLET</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">Instant Payment Cleared</p>
              <p className="text-[10px] text-slate-500">Date: {new Date(saleInvoiceRecord[0]?.date).toLocaleString()}</p>
            </div>

            <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300 text-xs">
              {saleInvoiceRecord.map((s, index) => (
                <div key={index} className="flex justify-between">
                  <span>{s.productName} (x{s.quantity})</span>
                  <span className="font-bold text-slate-800">K{s.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Net)</span>
                <span>K{(saleInvoiceRecord.reduce((acc, s) => acc + s.revenue, 0) * 0.8333).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>VAT (20% Inc)</span>
                <span>K{(saleInvoiceRecord.reduce((acc, s) => acc + s.revenue, 0) * 0.1667).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-950 text-sm border-t border-slate-200 pt-2 font-mono">
                <span>TOTAL PAYABLE</span>
                <span>K{saleInvoiceRecord.reduce((acc, s) => acc + s.revenue, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 pt-1.5 font-medium border-t border-slate-100 mt-2">
                <span>Payment Method</span>
                <span className="font-bold text-slate-800">{paymentMethod}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 font-medium">
              <p>Thank you for shopping at our store!</p>
              <p className="mt-1">Staff: {saleInvoiceRecord[0]?.loggedBy || currentUser.name}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 rounded border border-slate-250 flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="h-4 w-4 text-blue-650" />
              <span>Print Customer Bill</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
