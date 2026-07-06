"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Barcode, Plus, Minus, Trash2, CreditCard, Receipt, Printer, Phone, ShoppingCart } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function POSCashier() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snap) => {
      const fetched: any[] = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setProducts(fetched);
    });
    return () => unsubscribe();
  }, []);

  // Barcode Auto-Search effect (When typing fast like a barcode scanner)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus search input when not typing in other inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Auto add product if barcode perfectly matches
  useEffect(() => {
    if (searchQuery.length > 3) {
      const exactMatch = products.find(p => String(p.barcode || "") === String(searchQuery) || String(p.sku || "") === String(searchQuery));
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery(""); // clear for next scan
      }
    }
  }, [searchQuery, products]);

  const filteredProducts = products.filter(p => 
    String(p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(p.barcode || "").includes(searchQuery) ||
    String(p.sku || "").includes(searchQuery)
  );

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      alert("عذراً، هذا المنتج غير متوفر في المخزون!");
      return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert("لا يمكن إضافة المزيد، الكمية في المخزون لا تكفي.");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        if (newQty <= 0) return item; // Don't allow 0, use remove instead
        if (newQty > item.stock) {
          alert("الكمية المطلوبة تتجاوز المخزون المتوفر!");
          return item;
        }
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const total = (subtotal - discount) + taxAmount;
  const remaining = paidAmount > 0 ? paidAmount - total : 0;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      // In a real app, we'd also create an Invoice document in Firebase here.
      
      // Update stock
      for (const item of cart) {
        const productRef = doc(db, "products", item.id);
        await updateDoc(productRef, {
          stock: increment(-item.qty)
        });
      }
      
      const orderId = `ord_${Date.now()}`;
      await setDoc(doc(db, "orders", orderId), {
        items: cart,
        subtotal: subtotal,
        discount: discount,
        tax: taxAmount,
        total: total,
        paid: paidAmount,
        remaining: remaining,
        paymentMethod: "cash",
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      });
      await setDoc(doc(collection(db, "activity_logs")), {
        action: "بيع", details: `فاتورة بـ $${total.toFixed(2)}`, timestamp: new Date().toISOString()
      });
      
      alert("تم إتمام البيع بنجاح!");
      setCart([]);
      setPaidAmount(0);
      setDiscount(0);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("حدث خطأ أثناء إتمام البيع.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 max-h-screen">
      
      {/* Products & Search Area (Left Side in RTL) */}
      <div className="flex-1 flex flex-col h-full bg-[#1a1d24]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-lg">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-white/5 bg-black/20">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="text-gray-500 w-5 h-5" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="ابحث بالباركود، رقم الصنف (SKU)، أو اسم المنتج..."
              className="w-full bg-[#0f1115] border border-white/10 rounded-2xl py-3 pr-10 pl-12 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Barcode className="text-[#FFD700] w-6 h-6 opacity-70" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-[#0f1115] border border-white/5 rounded-2xl p-3 cursor-pointer hover:border-[#FFD700]/50 hover:shadow-[0_0_15px_rgba(255,215,0,0.15)] transition-all group relative overflow-hidden"
              >
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">نفذت الكمية</span>
                  </div>
                )}
                <div className="aspect-square bg-white rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt={product.name} className="object-contain w-full h-full p-2 group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="text-gray-400 text-xs">لا توجد صورة</span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-bold text-sm truncate" title={product.name}>{product.name}</h3>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">{product.barcode || "No barcode"}</span>
                    <span className="text-[#FFD700] font-black">${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    المخزون: <span className={product.stock > 5 ? "text-emerald-400" : "text-red-400"}>{product.stock || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart & Invoice Area (Right Side in RTL) */}
      <div className="w-full lg:w-96 flex flex-col h-full bg-[#1a1d24]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-lg">
        
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Receipt className="text-[#FFD700]" />
            الفاتورة الحالية
          </h2>
          <span className="bg-[#FFD700]/10 text-[#FFD700] px-3 py-1 rounded-full text-xs font-bold">
            {cart.length} منتجات
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
              <ShoppingCart size={48} className="opacity-20" />
              <p>قم بمسح الباركود أو اختر منتجاً للبدء</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="bg-[#0f1115] border border-white/5 rounded-xl p-3 flex gap-3 relative group">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2 left-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-1" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight pr-6">{item.name}</h4>
                      <p className="text-xs text-[#FFD700]">${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-black/50 rounded-lg p-1 border border-white/5">
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white/10 rounded-md text-white">
                          <Plus size={14} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white/10 rounded-md text-white">
                          <Minus size={14} />
                        </button>
                      </div>
                      <span className="font-black text-white text-sm">
                        ${(parseFloat(item.price) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Actions */}
        <div className="bg-[#0f1115] p-4 border-t border-white/5 space-y-4">
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>المجموع الفرعي:</span>
              <span className="text-white">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-400 gap-2">
              <span>الخصم ($):</span>
              <input 
                type="number" 
                value={discount || ""} 
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-20 bg-[#1a1d24] border border-white/10 rounded-lg px-2 py-1 text-white text-left focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>

            <div className="flex justify-between items-center text-gray-400 gap-2">
              <span>الضريبة (%):</span>
              <input 
                type="number" 
                value={taxRate || ""} 
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-20 bg-[#1a1d24] border border-white/10 rounded-lg px-2 py-1 text-white text-left focus:outline-none focus:border-[#FFD700]/50"
              />
            </div>
            
            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="text-lg font-bold text-white">الإجمالي:</span>
              <span className="text-3xl font-black text-[#FFD700]">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center text-gray-400 gap-2 pt-2 border-t border-white/5">
              <span>المبلغ المدفوع ($):</span>
              <input 
                type="number" 
                value={paidAmount || ""} 
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white text-left font-bold text-lg focus:outline-none focus:border-[#FFD700]/50"
              />
          </div>
          
          {paidAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">الباقي للعميل:</span>
              <span className={`font-bold ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                ${remaining.toFixed(2)}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5"
            >
              <Printer size={18} />
              حفظ كمسودة
            </button>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="bg-gradient-to-l from-[#FFD700] to-[#E5C100] hover:to-[#FFD700] text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_15px_rgba(255,215,0,0.2)]"
            >
              <CreditCard size={18} />
              دفع وإتمام
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
