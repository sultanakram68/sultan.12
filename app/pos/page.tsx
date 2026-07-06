"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Barcode, QrCode, Plus, Minus, Trash2, CreditCard, Banknote, Printer, Save, Camera, X, Package, CheckCircle2 } from "lucide-react";
import { collection, onSnapshot, doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Script from "next/script";

export default function POSCashierCorporate() {
  const [searchQuery, setSearchQuery] = useState("");
  const [scanMode, setScanMode] = useState<"barcode" | "qrcode">("barcode");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLaserEnabled, setIsLaserEnabled] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  
  const [discount, setDiscount] = useState<number | "">("");
  const [taxRate, setTaxRate] = useState<number | "">("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<any>(null);
  const lastScannedCodeRef = useRef<string>("");
  const lastScanTimeRef = useRef<number>(0);

  // Keyboard Shortcuts & Global Hardware Barcode Scanner (USB/Bluetooth) Detection
  useEffect(() => {
    let buffer = "";
    let lastTime = Date.now();

    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCameraOpen) toggleCamera();
        else if (searchQuery) setSearchQuery("");
        return;
      }

      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInput = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

      // Detect rapid hardware scanner typing (< 100ms between keystrokes)
      const currentTime = Date.now();
      if (currentTime - lastTime > 100) buffer = "";
      lastTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length >= 4) {
          playCashierBeep();
          try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (err) {}
          const match = products.find(p => String(p.barcode || "") === String(buffer) || String(p.sku || "") === String(buffer));
          if (match) {
            addToCart(match);
            setSearchQuery("");
          } else {
            alert(`الباركود (${buffer}) غير مسجل في المنتجات!`);
          }
          buffer = "";
          return;
        }
      } else if (e.key.length === 1 && !isInput) {
        buffer += e.key;
      }

      // Auto-focus search input if typing normal letters/numbers slowly and not in input
      if (e.target instanceof HTMLInputElement && e.target !== searchInputRef.current) return;
      if (e.key.length === 1 && searchInputRef.current && document.activeElement !== searchInputRef.current && buffer.length < 2) {
        searchInputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isCameraOpen, searchQuery, products, cart]);

  // Fetch products
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snap) => {
      const fetched: any[] = [];
      snap.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
      setProducts(fetched);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("pos_laser_enabled") === "true") {
      setIsLaserEnabled(true);
    }
  }, []);

  // Auto scan logic
  useEffect(() => {
    if (searchQuery.length > 3 && !isCameraOpen) {
      const exactMatch = products.find(p => String(p.barcode || "") === String(searchQuery) || String(p.sku || "") === String(searchQuery));
      if (exactMatch) {
        playCashierBeep();
        addToCart(exactMatch);
        setSearchQuery(""); 
      }
    }
  }, [searchQuery, products, isCameraOpen]);

  const isAdmin = true; // Assume admin for now

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      alert("عذراً، هذا المنتج غير متوفر في المخزون!");
      return;
    }
    if (!isAdmin && product.purchasePrice && parseFloat(product.price) < parseFloat(product.purchasePrice)) {
      alert("خطأ: سعر البيع أقل من سعر الشراء. غير مسموح بهذه العملية بدون صلاحيات الإدارة.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          alert("الكمية المطلوبة تتجاوز المخزون المتوفر!");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [{ ...product, qty: 1 }, ...prev];
    });
  };

  const updateQty = (id: string, newQty: number) => {
    if (newQty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (newQty > item.stock) { alert("تتجاوز المخزون!"); return item; }
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  const discountVal = Number(discount) || 0;
  const taxRateVal = Number(taxRate) || 0;
  const taxAmount = (subtotal - discountVal) * (taxRateVal / 100);
  const total = (subtotal - discountVal) + taxAmount;
  const paidVal = Number(paidAmount) || 0;
  const remaining = paidVal > 0 ? paidVal - total : 0;

  const playCashierBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2600, audioCtx.currentTime); // Supermarket scanner frequency
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.error("Audio beep error:", e);
    }
  };

  const handleCheckout = async (paymentMethod: "cash" | "card") => {
    if (cart.length === 0) return;
    try {
      for (const item of cart) {
        await updateDoc(doc(db, "products", item.id), { stock: increment(-item.qty) });
      }
      const orderId = `ord_${Date.now()}`;
      await setDoc(doc(db, "orders", orderId), {
        items: cart,
        subtotal: subtotal,
        discount: discountVal,
        tax: taxAmount,
        total: total,
        paid: paidVal,
        remaining: remaining,
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      });
      await setDoc(doc(collection(db, "activity_logs")), {
        action: "بيع", details: `فاتورة بـ ₺${total.toFixed(2)} (${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'})`, timestamp: new Date().toISOString()
      });
      alert(`تم البيع بنجاح (${paymentMethod === 'cash' ? 'نقدي' : 'بطاقة'})`);
      setCart([]); setPaidAmount(""); setDiscount(""); setSearchQuery("");
      if (searchInputRef.current) searchInputRef.current.focus();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("حدث خطأ أثناء البيع.");
    }
  };

  const handleWhatsApp = () => {
    if (cart.length === 0) return;
    let msg = `*فاتورة مشتريات* 🛒\n\n`;
    cart.forEach(item => { msg += `- ${item.name} (${item.qty}) = ₺${(item.price * item.qty).toFixed(2)}\n`; });
    msg += `\n*الإجمالي: ₺${total.toFixed(2)}*\n\nشكراً لتسوقكم معنا!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const startScanner = (retryCount = 0) => {
    setScannerError(null);
    if ((window as any).Html5Qrcode) {
      const html5Qrcode = new (window as any).Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      const startWithConfig = (config: any) => {
        html5Qrcode.start(
          config,
          { fps: 15, qrbox: { width: 250, height: 250 } },
          (text: string) => {
            const now = Date.now();
            if (text === lastScannedCodeRef.current && now - lastScanTimeRef.current < 2500) {
              return;
            }
            lastScannedCodeRef.current = text;
            lastScanTimeRef.current = now;

            playCashierBeep();
            try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
            const p = products.find(x => String(x.barcode || "") === String(text) || String(x.sku || "") === String(text));
            if (p) {
              addToCart(p);
            } else {
              alert(`الباركود (${text}) غير مسجل في المنتجات!`);
            }
          },
          () => {}
        ).catch(() => {
          if (config && config.facingMode === "environment") {
            startWithConfig({ facingMode: "user" });
          } else {
            setScannerError("تعذر تشغيل الكاميرا أو الشاشة سوداء. يرجى التأكد من سماحيات الكاميرا في المتصفح وإغلاق أي تطبيقات أخرى.");
          }
        });
      };

      startWithConfig({ facingMode: "environment" });
    } else {
      if (retryCount < 6) {
        setTimeout(() => startScanner(retryCount + 1), 600);
      } else {
        setScannerError("تأخر تحميل مكتبة قراءة الباركود بسبب ضعف شبكة الإنترنت. يرجى إعادة المحاولة.");
      }
    }
  };

  const toggleCamera = () => {
    if (isCameraOpen) {
      setIsCameraOpen(false);
      setScannerError(null);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => {
            try { scannerRef.current.clear(); } catch(e) {}
          }).catch(() => {
            try { scannerRef.current.clear(); } catch(e) {}
          });
        } catch(e) {
          try { scannerRef.current.clear(); } catch(err) {}
        }
      }
    } else {
      setIsCameraOpen(true);
      setTimeout(() => startScanner(0), 300);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => {
            try { scannerRef.current.clear(); } catch(e) {}
          }).catch(() => {
            try { scannerRef.current.clear(); } catch(e) {}
          });
        } catch(e) {}
      }
      try {
        const videoElements = document.querySelectorAll("#reader video, video");
        videoElements.forEach(video => {
          if (video.srcObject) {
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => {
              try { track.stop(); } catch(err) {}
            });
          }
        });
      } catch(e) {}
    };
  }, [isCameraOpen]);

  const filteredProducts = searchQuery ? products.filter(p => String(p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || String(p.barcode || "").includes(searchQuery) || String(p.sku || "").includes(searchQuery)) : [];

  return (
    <>
      <div className="flex flex-col min-h-[calc(100vh-1rem)] lg:min-h-[calc(100vh-3rem)] w-full relative animate-in fade-in duration-500 font-sans print:h-auto pb-12">
        
        {/* Top Scanner & Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-sm relative flex flex-col md:flex-row gap-4 print:hidden transition-all">
          
          <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0 justify-between gap-1">
            {isLaserEnabled && (
              <button onClick={() => setScanMode("barcode")} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 ${scanMode === 'barcode' ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                <Barcode size={18} /> <span className="hidden sm:inline">ليزر</span>
              </button>
            )}
            <button onClick={toggleCamera} className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex justify-center items-center gap-2 ${isCameraOpen ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
              {isCameraOpen ? <X size={18} /> : <Barcode size={18} />} <span className="hidden sm:inline">{isCameraOpen ? 'إغلاق الكاميرا' : 'الكاميرا'}</span>
            </button>
          </div>

          <div className="flex-1 relative w-full group">
            <input
              ref={searchInputRef} type="text" placeholder="امسح الرمز أو ابحث يدوياً (التركيز تلقائي)..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E3A8A] focus:bg-white focus:ring-4 focus:ring-[#1E3A8A]/10 rounded-xl py-3.5 pr-12 pl-12 text-[#0F172A] text-lg transition-all outline-none"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && filteredProducts.length === 1) { addToCart(filteredProducts[0]); setSearchQuery(""); } }}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-[#1E3A8A]" />
          </div>
        </div>

        {isCameraOpen && (
          <div className="bg-white p-6 border border-slate-200 relative z-10 w-full flex flex-col items-center justify-center print:hidden mb-4 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center w-full max-w-sm mb-4 text-[#0F172A]">
              <span className="font-bold text-sm flex items-center gap-2">
                <Barcode size={18} className="text-[#1E3A8A]" />
                قارئ الباركود (يضيف المنتج لسلة العميل مباشرة من المخزون)
              </span>
              <button onClick={toggleCamera} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            {scannerError && (
              <div className="w-full max-w-sm bg-red-900/40 border border-red-500/50 rounded-2xl p-4 text-center text-white space-y-3 mb-2">
                <p className="text-xs font-bold text-red-200 leading-relaxed">{scannerError}</p>
                <button onClick={() => startScanner(0)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all">
                  إعادة المحاولة
                </button>
              </div>
            )}
            <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-600 bg-black min-h-[250px]" />
            <p className="text-xs text-slate-400 mt-3 text-center font-semibold">بمجرد توجيه الكاميرا للباركود سيتم إضافته لسلة المشتريات فوراً</p>
          </div>
        )}

        {/* نسخة الإجمالي الصافي (فوق إطار المنتجات مباشرة) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-5 mb-4 shadow-sm flex items-center justify-between print:hidden transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-2xl border border-slate-200 text-[#1E3A8A]">
              💰
            </div>
            <div>
              <h3 className="text-base lg:text-lg font-black text-[#0F172A] tracking-tight">الإجمالي الصافي</h3>
              <p className="text-xs text-slate-400 font-medium">يتم التحديث تلقائياً مع قراءة الأكواد وإضافة المنتجات</p>
            </div>
          </div>
          <div className="text-left bg-slate-50 px-5 py-2 rounded-xl border border-slate-200">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#1E3A8A] font-mono">₺{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Main Content Area - Stacked vertically so options appear BELOW cart list */}
        <div className="flex flex-col gap-4 flex-1 relative z-10 p-2 lg:p-0">
          
          {/* Cart List - Compact & Auto-extending frame */}
          <div className="w-full bg-white lg:border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-auto min-h-[160px] transition-all duration-300 flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between print:hidden">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <span>تفاصيل الفاتورة والمنتجات المقروءة</span>
                <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] text-xs font-black px-2.5 py-0.5 rounded-full">{cart.reduce((s, i) => s + i.qty, 0)} عنصر</span>
              </h2>
              <button onClick={() => { setCart([]); setDiscount(""); setPaidAmount(""); }} className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100">
                <Trash2 size={16} /> تفريغ السلة
              </button>
            </div>
            {/* Print Header */}
            <div className="hidden print:block text-center py-6 border-b border-black mb-4">
              <h1 className="text-2xl font-bold text-black mb-1">فاتورة مبيعات</h1>
              <p className="text-gray-500 text-sm">التاريخ: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="p-3 lg:p-4 space-y-2">
              {cart.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 print:hidden">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3"><Barcode className="opacity-30" size={28} /></div>
                  <p className="font-bold text-slate-500 text-base">سلة المشتريات فارغة</p>
                  <p className="text-xs text-slate-400 mt-1">قم بقراءة الباركود أو البحث لإضافة المنتجات هنا</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 hover:border-slate-300 rounded-xl p-2.5 flex items-center gap-3 transition-all shadow-sm">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100 print:hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" /> : <Package size={18} className="text-slate-400" />}
                    </div>
                    
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex justify-between items-start flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#0F172A] leading-tight truncate pr-2">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="sm:hidden p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors print:hidden">
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 print:hidden">
                          <button onClick={() => updateQty(item.id, item.qty + 1)} className="p-1.5 hover:bg-[#1E3A8A] hover:text-white rounded-md text-slate-600 transition-colors"><Plus size={14} /></button>
                          <span className="w-8 text-center text-[#0F172A] font-bold text-sm">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty - 1)} className="p-1.5 hover:bg-[#1E3A8A] hover:text-white rounded-md text-slate-600 transition-colors"><Minus size={14} /></button>
                        </div>
                        <span className="hidden print:inline-block font-bold text-sm">الكمية: {item.qty}</span>
                        <div className="text-left min-w-[80px]">
                           <div className="text-[11px] text-slate-500 mb-0.5">₺{parseFloat(item.price).toFixed(2)} القطعة</div>
                           <span className="font-bold text-[#1E3A8A] text-base print:text-black">₺{(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="hidden sm:block p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors print:hidden">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Summary Panel - Placed directly below cart list (NOT fixed at bottom) */}
          <div className="w-full flex flex-col bg-white lg:border border-slate-200 rounded-2xl shadow-sm z-30 transition-all duration-300 mt-2 print:hidden">
            
            <div className="p-5 lg:p-6 space-y-4">
              
              <div className="space-y-3 mb-2 border-b border-slate-100 pb-4">
                <div className="flex justify-between text-sm text-slate-500 font-medium"><span>المجموع الفرعي:</span><span className="text-[#0F172A]">₺{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between items-center text-sm text-slate-500 font-medium">
                  <span>خصم (₺):</span>
                  <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value===""?"":parseFloat(e.target.value))} className="w-24 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-[#0F172A] font-bold text-left outline-none focus:border-[#1E3A8A]" placeholder="0" />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-[#0F172A]">الإجمالي الصافي</span>
                <span className="text-3xl lg:text-4xl font-black text-[#1E3A8A]">₺{total.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => handleCheckout("card")} disabled={cart.length===0} className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  <CreditCard size={20} /> بطاقة
                </button>
                <button onClick={() => handleCheckout("cash")} disabled={cart.length===0} className="bg-[#1E3A8A] hover:bg-[#152960] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-[#1E3A8A]/20">
                  <Banknote size={20} /> كاش
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => window.print()} disabled={cart.length===0} className="bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  <Printer size={18} /> طباعة
                </button>
                <button onClick={handleWhatsApp} disabled={cart.length===0} className="bg-[#25D366] hover:bg-[#1EBE5A] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  إرسال واتساب
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
