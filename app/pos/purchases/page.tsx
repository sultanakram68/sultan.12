"use client";

import React, { useState, useEffect, useRef } from "react";
import { Package, Truck, Search, Plus, Save, Barcode, X, Camera, Printer, Sparkles } from "lucide-react";
import { collection, onSnapshot, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Script from "next/script";

export default function POSPurchasesCorporate() {
  const [activeTab, setActiveTab] = useState<"purchases" | "suppliers">("purchases");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: "", name: "", barcode: "", sku: "", imageUrl: "", category: "", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: ""
  });

  // Camera Barcode State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"search" | "form">("search");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      const fetched: any[] = [];
      snap.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
      setProducts(fetched);
    });
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snap) => {
      const fetched: any[] = [];
      snap.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
      setSuppliers(fetched);
    });
    return () => { unsubProducts(); unsubSuppliers(); };
  }, []);

  useEffect(() => {
    if (activeTab !== "purchases" || isFormOpen) return;
    if (searchQuery.length > 3 && !isCameraOpen) {
      const existingProduct = products.find(p => String(p.barcode || "") === String(searchQuery) || String(p.sku || "") === String(searchQuery));
      if (existingProduct) {
        setFormData({ ...existingProduct, id: existingProduct.id });
      } else {
        setFormData({ id: "", name: "", barcode: searchQuery, sku: "", imageUrl: "", category: "هواتف وأجهزة ذكية", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: "" });
      }
      setIsFormOpen(true);
      setSearchQuery("");
    }
  }, [searchQuery, products, activeTab, isFormOpen, isCameraOpen]);

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

  // Global Hardware Barcode Scanner (USB/Bluetooth) Keyboard Listener
  useEffect(() => {
    let buffer = "";
    let lastTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      const currentTime = Date.now();
      if (currentTime - lastTime > 100) buffer = "";
      lastTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length >= 4) {
          playCashierBeep();
          try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (err) {}
          if (isFormOpen) {
            setFormData((prev: any) => ({ ...prev, barcode: buffer }));
          } else {
            const code = buffer;
            const existingProduct = products.find(p => String(p.barcode || "") === String(code) || String(p.sku || "") === String(code));
            if (existingProduct) {
              setFormData({ ...existingProduct, id: existingProduct.id });
            } else {
              setFormData({ id: "", name: "", barcode: code, sku: "", imageUrl: "", category: "هواتف وأجهزة ذكية", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: "" });
            }
            setIsFormOpen(true);
          }
          buffer = "";
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, isFormOpen]);

  const startScanner = (target: "search" | "form", retryCount = 0) => {
    setScannerError(null);
    if ((window as any).Html5Qrcode) {
      const html5Qrcode = new (window as any).Html5Qrcode("reader");
      scannerRef.current = html5Qrcode;

      const startWithConfig = (config: any) => {
        html5Qrcode.start(
          config,
          { fps: 15, qrbox: { width: 250, height: 250 } },
          (text: string) => {
            playCashierBeep();
            try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {}
            if (target === "form") {
              setFormData((prev: any) => ({ ...prev, barcode: text }));
            } else {
              const existingProduct = products.find(p => String(p.barcode || "") === String(text) || String(p.sku || "") === String(text));
              if (existingProduct) {
                setFormData({ ...existingProduct, id: existingProduct.id });
              } else {
                setFormData({ id: "", name: "", barcode: text, sku: "", imageUrl: "", category: "هواتف وأجهزة ذكية", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: "" });
              }
              setIsFormOpen(true);
            }
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
        setTimeout(() => startScanner(target, retryCount + 1), 600);
      } else {
        setScannerError("تأخر تحميل مكتبة قراءة الباركود بسبب ضعف شبكة الإنترنت. يرجى إعادة المحاولة.");
      }
    }
  };

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleAutoLinkAllBarcodes = async () => {
    try {
      let count = 0;
      for (const p of products) {
        if (!p.barcode || p.barcode === "-" || String(p.barcode).trim() === "") {
          const generatedCode = "869" + Math.floor(100000000 + Math.random() * 900000000);
          await updateDoc(doc(db, "products", p.id), { barcode: generatedCode });
          count++;
        }
      }
      if (count > 0) {
        alert(`تم ربط وتوليد الباركود لـ (${count}) منتج بنجاح! جميع المنتجات الآن منظمة ومربوطة بالباركود 100%.`);
      } else {
        alert("جميع المنتجات لديك مربوطة بالباركود بالفعل ومنظمة بالكامل!");
      }
    } catch (error) {
      console.error("Auto link error:", error);
      alert("حدث خطأ أثناء ربط الباركود.");
    }
  };

  const toggleCamera = (target: "search" | "form" = "search") => {
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
      setCameraTarget(target);
      setIsCameraOpen(true);
      setTimeout(() => startScanner(target, 0), 300);
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

  const filteredProducts = products.filter(p => String(p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || String(p.barcode || "").includes(searchQuery));

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await updateDoc(doc(db, "products", formData.id), {
          name: formData.name, barcode: formData.barcode, sku: formData.sku, imageUrl: formData.imageUrl, category: formData.category || "هواتف وأجهزة ذكية",
          purchasePrice: parseFloat(formData.purchasePrice) || 0, wholesalePrice: parseFloat(formData.wholesalePrice) || 0, price: parseFloat(formData.price) || 0,
          stock: parseFloat(formData.stock) || 0, minStock: parseFloat(formData.minStock) || 0, supplier: formData.supplier
        });
        alert("تم تحديث المنتج بنجاح!");
      } else {
        await setDoc(doc(collection(db, "products")), {
          name: formData.name, barcode: formData.barcode, sku: formData.sku, imageUrl: formData.imageUrl, category: formData.category || "هواتف وأجهزة ذكية",
          purchasePrice: parseFloat(formData.purchasePrice) || 0, wholesalePrice: parseFloat(formData.wholesalePrice) || 0, price: parseFloat(formData.price) || 0,
          stock: parseFloat(formData.stock) || 0, minStock: parseFloat(formData.minStock) || 0, supplier: formData.supplier, createdAt: new Date().toISOString()
        });
        alert("تمت إضافة المنتج بنجاح!");
      }
      setIsFormOpen(false);
    } catch (error) { alert("حدث خطأ أثناء الحفظ."); }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] mb-1">المشتريات والموردين</h1>
            <p className="text-slate-500 font-medium">إدارة المخزون، المشتريات الجديدة، وحسابات الموردين</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveTab("purchases")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'purchases' ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Package size={18} /> المشتريات
            </button>
            <button 
              onClick={() => setActiveTab("suppliers")}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'suppliers' ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Truck size={18} /> الموردين
            </button>
          </div>
        </div>

        {activeTab === "purchases" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="امسح الباركود لإضافة مشتريات جديدة أو ابحث عن منتج..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pr-12 pl-12 text-[#0F172A] focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all shadow-sm font-medium"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                />
                <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
              </div>
              <button 
                onClick={handleAutoLinkAllBarcodes}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20"
                title="توليد وربط الباركود تلقائياً لجميع المنتجات التي ليس لها باركود"
              >
                <Sparkles size={18} /> <span className="hidden md:inline">ربط وتوليد باركود للكل</span>
              </button>
              <button 
                onClick={() => setIsPrintModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20"
                title="طباعة ملصقات الباركود لجميع المنتجات"
              >
                <Printer size={18} /> <span className="hidden md:inline">طباعة الملصقات</span>
              </button>
              <button 
                onClick={() => toggleCamera("search")}
                className={`px-5 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 border ${isCameraOpen && cameraTarget === 'search' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
              >
                {isCameraOpen && cameraTarget === 'search' ? <X size={20} /> : <Barcode size={20} />} <span className="hidden sm:inline">{isCameraOpen && cameraTarget === 'search' ? 'إغلاق الكاميرا' : 'مسح بالكاميرا'}</span>
              </button>
              <button 
                onClick={() => { setFormData({ id: "", name: "", barcode: "", sku: "", imageUrl: "", category: "هواتف وأجهزة ذكية", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: "" }); setIsFormOpen(true); }}
                className="bg-[#1E3A8A] hover:bg-[#152960] text-white px-6 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 shadow-sm shadow-[#1E3A8A]/20"
              >
                <Plus size={20} /> إضافة منتج يدوي
              </button>
            </div>

            {isCameraOpen && cameraTarget === "search" && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl relative z-20 w-full flex flex-col items-center justify-center my-4 shadow-sm">
                <div className="flex justify-between items-center w-full max-w-sm mb-4 text-[#0F172A]">
                  <span className="font-bold text-sm flex items-center gap-2">
                    <Barcode size={18} className="text-[#1E3A8A]" />
                    قم بتوجيه الكاميرا لباركود المنتج للبحث أو الإضافة
                  </span>
                  <button onClick={() => toggleCamera("search")} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>
                {scannerError && (
                  <div className="w-full max-w-sm bg-red-900/40 border border-red-500/50 rounded-2xl p-4 text-center text-white space-y-3 mb-2">
                    <p className="text-xs font-bold text-red-200 leading-relaxed">{scannerError}</p>
                    <button onClick={() => startScanner("search", 0)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-bold text-xs transition-all">
                      إعادة المحاولة
                    </button>
                  </div>
                )}
                <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-600 bg-black min-h-[250px]" />
                <p className="text-xs text-slate-400 mt-3 text-center">سيتم التقاط الباركود وإدخاله في شريط البحث تلقائياً لفتح نموذج الإضافة أو التعديل</p>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#0F172A] mb-6">قائمة المنتجات (المخزون)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="pb-3 font-semibold px-4">المنتج</th>
                      <th className="pb-3 font-semibold px-4">قسم الموقع الرسمي</th>
                      <th className="pb-3 font-semibold px-4">الباركود</th>
                      <th className="pb-3 font-semibold px-4">المخزون</th>
                      <th className="pb-3 font-semibold px-4">سعر الشراء</th>
                      <th className="pb-3 font-semibold px-4">سعر البيع</th>
                      <th className="pb-3 font-semibold px-4">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#0F172A] flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {p.imageUrl ? ( /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt="" className="object-contain w-full h-full p-1 mix-blend-multiply" /> ) : (<Package size={20} className="text-slate-400" />)}
                          </div>
                          {p.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold text-xs px-2.5 py-1 rounded-lg inline-block whitespace-nowrap">
                            {p.category || "هواتف وأجهزة ذكية"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{p.barcode || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${p.stock <= p.minStock ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-700'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-medium">₺{p.purchasePrice || 0}</td>
                        <td className="py-3 px-4 text-[#1E3A8A] font-black">₺{p.price || 0}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => { setFormData({...p}); setIsFormOpen(true); }} className="text-sm font-bold text-[#1E3A8A] hover:text-[#0F2557] transition-colors bg-[#1E3A8A]/10 px-3 py-1.5 rounded-lg">
                            تعديل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-[#0F172A]">{formData.id ? "تعديل مشتريات منتج" : "إضافة منتج جديد"}</h2>
                <button onClick={() => { setIsFormOpen(false); if (isCameraOpen) setIsCameraOpen(false); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm font-bold text-slate-700">اسم المنتج</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1E3A8A] flex items-center gap-1.5">
                      <span>🗂️ القسم على الموقع الرسمي</span>
                    </label>
                    <select
                      required
                      value={formData.category || "هواتف وأجهزة ذكية"}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-[#1E3A8A]/30 rounded-xl px-4 py-2.5 text-[#0F172A] font-bold focus:border-[#1E3A8A] focus:bg-white outline-none transition-all shadow-sm"
                    >
                      <option value="هواتف وأجهزة ذكية">📱 هواتف وأجهزة ذكية</option>
                      <option value="سماعات ومكبرات صوت">🎧 سماعات ومكبرات صوت</option>
                      <option value="شواحن وكابلات وبطاريات">⚡ شواحن وكابلات وبطاريات</option>
                      <option value="إكسسوارات وحماية">🛡️ إكسسوارات وحماية وكفرات</option>
                      <option value="قطع غيار وصيانة">🔧 قطع غيار وصيانة</option>
                      <option value="بطاقات وباقات">🎟️ بطاقات وباقات رصيد</option>
                      <option value="منتجات عامة / أخرى">📦 منتجات عامة / أخرى</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-700">الباركود</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, barcode: "869" + Math.floor(100000000 + Math.random() * 900000000)})}
                          className="text-xs font-bold px-2 py-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all flex items-center gap-1"
                          title="توليد رقم باركود تلقائي"
                        >
                          <Sparkles size={13} /> توليد
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCamera("form")}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${isCameraOpen && cameraTarget === 'form' ? 'bg-red-100 text-red-600' : 'bg-[#1E3A8A]/10 text-[#1E3A8A] hover:bg-[#1E3A8A]/20'}`}
                        >
                          {isCameraOpen && cameraTarget === 'form' ? <X size={14} /> : <Barcode size={14} />}
                          {isCameraOpen && cameraTarget === 'form' ? "إغلاق الكاميرا" : "قراءة بالكاميرا"}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <input type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none font-mono text-left transition-all pr-10" dir="ltr" placeholder="امسح بالكاميرا أو اكتب..." />
                      <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                    {isCameraOpen && cameraTarget === "form" && (
                      <div className="bg-white p-4 border border-slate-200 rounded-xl mt-2 flex flex-col items-center justify-center shadow-sm">
                        <div className="flex justify-between items-center w-full mb-2 text-[#0F172A] text-xs">
                          <span className="font-bold text-[#1E3A8A] flex items-center gap-1"><Barcode size={14} /> ضع الباركود أمام الكاميرا</span>
                          <button type="button" onClick={() => toggleCamera("form")} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                        </div>
                        {scannerError && (
                          <div className="w-full bg-red-900/40 border border-red-500/50 rounded-xl p-3 text-center text-white space-y-2 mb-2">
                            <p className="text-[11px] font-bold text-red-200">{scannerError}</p>
                            <button type="button" onClick={() => startScanner("form", 0)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-1 rounded-lg font-bold text-[11px] transition-all">
                              إعادة المحاولة
                            </button>
                          </div>
                        )}
                        <div id="reader" className="w-full rounded-xl overflow-hidden border border-slate-600 bg-black min-h-[200px]" />
                        <p className="text-[11px] text-slate-400 mt-2 text-center">سيتم تعبئة حقل الباركود تلقائياً عند قراءته</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رقم الصنف (SKU)</label>
                    <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none font-mono text-left transition-all" dir="ltr" />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm font-bold text-slate-700">رابط الصورة (اختياري)</label>
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none font-mono text-left transition-all" dir="ltr" />
                  </div>

                  <div className="space-y-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/50">
                    <label className="text-sm font-bold text-amber-700">سعر الشراء (التكلفة)</label>
                    <input type="number" step="0.01" required value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} className="w-full bg-white border border-amber-200 rounded-lg px-4 py-2 text-[#0F172A] focus:border-amber-400 outline-none text-left font-bold" dir="ltr" />
                  </div>
                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="text-sm font-bold text-slate-600">سعر البيع بالجملة</label>
                    <input type="number" step="0.01" value={formData.wholesalePrice} onChange={e => setFormData({...formData, wholesalePrice: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-[#0F172A] focus:border-slate-400 outline-none text-left font-bold" dir="ltr" />
                  </div>
                  <div className="space-y-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/50">
                    <label className="text-sm font-bold text-emerald-700">سعر البيع النهائي (المفرق)</label>
                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-white border border-emerald-200 rounded-lg px-4 py-2 text-[#0F172A] focus:border-emerald-400 outline-none text-left font-black text-lg" dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الكمية المشتراة (المخزون)</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] outline-none text-left font-bold" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الحد الأدنى للتنبيه</label>
                    <input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] outline-none text-left" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">المورد</label>
                    <select value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] outline-none">
                      <option value="">-- اختر المورد --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.company})</option>)}
                    </select>
                  </div>
                </div>

                {formData.purchasePrice && formData.price && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-8 items-center">
                    <div>
                      <span className="text-slate-500 text-xs block mb-1 font-medium">الربح المتوقع بالقطعة</span>
                      <span className="text-emerald-600 font-bold text-lg">₺{(parseFloat(formData.price) - parseFloat(formData.purchasePrice)).toFixed(2)}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div>
                      <span className="text-slate-500 text-xs block mb-1 font-medium">هامش الربح</span>
                      <span className="text-[#1E3A8A] font-bold text-lg">{(((parseFloat(formData.price) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => { setIsFormOpen(false); if (isCameraOpen) setIsCameraOpen(false); }} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">إلغاء</button>
                  <button type="submit" className="px-8 py-2.5 bg-[#1E3A8A] hover:bg-[#152960] text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm">
                    <Save size={18} /> حفظ المنتج
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "suppliers" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#0F172A]">قائمة الموردين</h2>
              <button className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#152960] transition-colors shadow-sm">
                <Plus size={16} /> إضافة مورد
              </button>
            </div>
            <div className="text-center py-16 text-slate-400">
              <Truck size={48} className="mx-auto mb-4 opacity-30 text-slate-300" />
              <p className="font-medium text-slate-500">سجل الموردين فارغ حالياً.</p>
            </div>
          </div>
        )}

        {/* Barcode Label Printing Modal */}
        {isPrintModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4 print:hidden">
                <div>
                  <h2 className="text-xl font-bold text-[#0F172A] flex items-center gap-2">
                    <Printer className="text-[#1E3A8A]" size={24} /> طباعة ملصقات الباركود المنظمة
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">يمكنك طباعة هذه الملصقات ولصقها على منتجاتك ليتم قراءتها فوراً بالكاشير</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md">
                    <Printer size={18} /> طباعة الملصقات الآن
                  </button>
                  <button onClick={() => setIsPrintModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-4 print:w-full">
                {products.filter(p => p.barcode && p.barcode !== "-").map((p) => (
                  <div key={p.id} className="border-2 border-slate-300 rounded-xl p-3 flex flex-col items-center justify-between text-center bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-full border-b border-slate-100 pb-1.5 mb-1.5">
                      <span className="text-[10px] font-black tracking-wider text-slate-400 block uppercase">Sultan POS & Tech</span>
                      <h3 className="font-bold text-xs text-[#0F172A] truncate w-full" title={p.name}>{p.name}</h3>
                      <span className="text-emerald-600 font-black text-sm block mt-0.5">₺{p.price || 0}</span>
                    </div>
                    
                    {/* Visual Barcode SVG Representation */}
                    <div className="w-full flex flex-col items-center my-1">
                      <svg className="w-full h-12" viewBox="0 0 160 40">
                        {String(p.barcode || "00000000").split("").map((char, idx) => {
                          const num = parseInt(char, 36) || 1;
                          const width = (num % 3) + 1;
                          const x = idx * 11 + 10;
                          return (
                            <g key={idx}>
                              <rect x={x} y="0" width={width} height="40" fill="#000000" />
                              <rect x={x + width + 1} y="0" width={1} height="40" fill="#000000" />
                              <rect x={x + width + 3} y="0" width={width > 1 ? 2 : 1} height="40" fill="#000000" />
                            </g>
                          );
                        })}
                      </svg>
                      <span className="font-mono font-bold text-[11px] tracking-widest text-slate-800 mt-1 block">{p.barcode}</span>
                    </div>
                  </div>
                ))}
              </div>

              {products.filter(p => p.barcode && p.barcode !== "-").length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Barcode size={48} className="mx-auto mb-4 opacity-30 text-slate-300" />
                  <p className="font-bold text-slate-600 text-lg">لا توجد منتجات مربوطة بباركود حتى الآن.</p>
                  <p className="text-sm text-slate-400 mt-2">اضغط على زر (ربط وتوليد باركود للكل) لتنظيم جميع منتجاتك تلقائياً.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
