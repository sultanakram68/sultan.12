"use client";

import React, { useState, useEffect, useRef } from "react";
import { Package, Truck, Search, Plus, Save, Barcode, X, Camera, Printer, Sparkles, Eye } from "lucide-react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Script from "next/script";

// Reads a Blob as a base64 data URL (Firebase Storage isn't provisioned on this
// project, so product images are stored inline in Firestore instead).
const readBlobAsDataURL = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// Downscales an image blob (preserving transparency) so it stays well under
// Firestore's ~1MB document size limit once base64-encoded.
const resizeImageBlob = (blob: Blob, maxDim: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Resize failed"))),
        "image/png"
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Could not load image for resizing"));
    img.src = URL.createObjectURL(blob);
  });

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

  // Image Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [removeBgEnabled, setRemoveBgEnabled] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const checkerboardStyle = {
    backgroundImage:
      "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
    backgroundSize: "10px 10px",
    backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
  } as const;

  // Background removal (@imgly/background-removal) ships onnxruntime-web
  // bundles that Next.js 14's webpack can't compile. It's loaded straight
  // from the CDN at runtime instead, via a browser-native import map, so
  // the bundler never touches it.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector('script[data-bg-removal-importmap]')) return;
    const map = document.createElement("script");
    map.type = "importmap";
    map.setAttribute("data-bg-removal-importmap", "true");
    map.textContent = JSON.stringify({
      imports: {
        "onnxruntime-web": "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.bundle.min.mjs",
        "onnxruntime-web/webgpu": "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.webgpu.bundle.min.mjs",
      },
    });
    document.head.prepend(map);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح!");
      return;
    }

    let imageBlob: Blob = file;

    if (removeBgEnabled) {
      setIsRemovingBg(true);
      try {
        const bgRemovalUrl = "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/index.mjs";
        const { removeBackground } = await import(/* webpackIgnore: true */ bgRemovalUrl);
        imageBlob = await removeBackground(file, { device: "cpu", model: "isnet" });
      } catch (error) {
        console.error("Background removal failed, using original image:", error);
      } finally {
        setIsRemovingBg(false);
      }
    }

    setIsUploading(true);

    try {
      // Keep shrinking the max dimension until the base64 payload fits Firestore's
      // ~1MB document limit — never reject a photo outright, just compress harder.
      let dim = 1200;
      let dataUrl = await readBlobAsDataURL(await resizeImageBlob(imageBlob, dim));
      while (dataUrl.length > 900_000 && dim > 150) {
        dim = Math.round(dim * 0.75);
        dataUrl = await readBlobAsDataURL(await resizeImageBlob(imageBlob, dim));
      }

      setFormData((prev: any) => ({ ...prev, imageUrl: dataUrl }));
    } catch (error) {
      console.error("Image processing error:", error);
      alert("حدث خطأ أثناء معالجة الصورة.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snap: any) => {
      const fetched: any[] = [];
      snap.forEach((doc: any) => fetched.push({ id: doc.id, ...doc.data() }));
      setProducts(fetched);
    });
    const unsubSuppliers = onSnapshot(collection(db, "suppliers"), (snap: any) => {
      const fetched: any[] = [];
      snap.forEach((doc: any) => fetched.push({ id: doc.id, ...doc.data() }));
      setSuppliers(fetched);
    });
    return () => { unsubProducts(); unsubSuppliers(); };
  }, []);

  useEffect(() => {
    if (activeTab !== "purchases" || isFormOpen) return;
    // Only auto-open if the query is a full numeric barcode (>= 8 digits) to avoid opening on manual word search
    if (searchQuery.length >= 8 && /^\d+$/.test(searchQuery) && !isCameraOpen) {
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

      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
      compressor.knee.setValueAtTime(30, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.25, audioCtx.currentTime);
      compressor.connect(audioCtx.destination);

      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.setValueAtTime(1760, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(3520, audioCtx.currentTime);

      gain.gain.setValueAtTime(2.0, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.24);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(compressor);

      osc1.start(audioCtx.currentTime);
      osc2.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.24);
      osc2.stop(audioCtx.currentTime + 0.24);
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
          try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (err) { }
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
            if (!text || text.trim().length < 3) return;
            const cleanText = text.trim();
            playCashierBeep();
            try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { }
            if (target === "form") {
              setFormData((prev: any) => ({ ...prev, barcode: cleanText }));
            } else {
              const existingProduct = products.find(p => String(p.barcode || "").trim() === cleanText || String(p.sku || "").trim() === cleanText);
              if (existingProduct) {
                setFormData({ ...existingProduct, id: existingProduct.id });
              } else {
                setFormData({ id: "", name: "", barcode: cleanText, sku: "", imageUrl: "", category: "هواتف وأجهزة ذكية", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: "" });
              }
              setIsFormOpen(true);
            }
            setIsCameraOpen(false);
            setScannerError(null);
            if (scannerRef.current) {
              try {
                scannerRef.current.stop().then(() => {
                  try { scannerRef.current.clear(); } catch (e) { }
                }).catch(() => {
                  try { scannerRef.current.clear(); } catch (e) { }
                });
              } catch (e) {
                try { scannerRef.current.clear(); } catch (err) { }
              }
            }
          },
          () => { }
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

  const stopCameraTracks = () => {
    try {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => {
            try { scannerRef.current.clear(); } catch (e) { }
          }).catch(() => {
            try { scannerRef.current.clear(); } catch (e) { }
          });
        } catch (e) {
          try { scannerRef.current.clear(); } catch (err) { }
        }
      }
    } catch (e) { }

    try {
      const videoElements = document.querySelectorAll("#reader video, video");
      videoElements.forEach((video: any) => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => {
            try { track.stop(); track.enabled = false; } catch (err) { }
          });
          video.srcObject = null;
        }
      });
    } catch (e) { }

    try {
      if (navigator.mediaDevices && (window as any).localMediaStream) {
        ((window as any).localMediaStream as MediaStream).getTracks().forEach(track => {
          try { track.stop(); track.enabled = false; } catch (err) { }
        });
      }
    } catch (e) { }
  };

  const toggleCamera = (target: "search" | "form" = "search") => {
    if (isCameraOpen) {
      stopCameraTracks();
      setIsCameraOpen(false);
      setScannerError(null);
    } else {
      setCameraTarget(target);
      setIsCameraOpen(true);
      setTimeout(() => startScanner(target, 0), 300);
    }
  };

  useEffect(() => {
    const handleLeave = () => {
      if (isCameraOpen) {
        stopCameraTracks();
        setIsCameraOpen(false);
      }
    };
    window.addEventListener("popstate", handleLeave);
    window.addEventListener("pagehide", handleLeave);
    window.addEventListener("beforeunload", handleLeave);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && isCameraOpen) {
        stopCameraTracks();
        setIsCameraOpen(false);
      }
    });
    return () => {
      window.removeEventListener("popstate", handleLeave);
      window.removeEventListener("pagehide", handleLeave);
      window.removeEventListener("beforeunload", handleLeave);
      stopCameraTracks();
    };
  }, [isCameraOpen]);

  const filteredProducts = products.filter(p => String(p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || String(p.barcode || "").includes(searchQuery));

  const duplicateProduct = products.find(p => p.id !== formData.id && (
    (formData.barcode && String(formData.barcode).trim() !== "" && String(formData.barcode).trim() !== "-" && (String(p.barcode || "").trim() === String(formData.barcode).trim() || String(p.sku || "").trim() === String(formData.barcode).trim())) ||
    (formData.sku && String(formData.sku).trim() !== "" && String(formData.sku).trim() !== "-" && (String(p.sku || "").trim() === String(formData.sku).trim() || String(p.barcode || "").trim() === String(formData.sku).trim()))
  ));

  const handleDeleteProduct = async () => {
    if (!formData.id) return;
    const confirmDelete = window.confirm("⚠️ هل أنت متأكد من حذف هذا المنتج نهائياً من المخزون؟ لا يمكن التراجع عن هذه الخطوة!");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", formData.id));
      alert("تم حذف المنتج بنجاح!");
      setIsFormOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      alert("حدث خطأ أثناء حذف المنتج.");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicateProduct) {
      alert(`خطأ: الكود مسجل مسبقاً باسم المنتج (${duplicateProduct.name})! لا يمكنك تكرار المنتجات في المخزون.`);
      return;
    }
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] mb-0.5">المشتريات والموردين</h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm">إدارة المخزون، المشتريات الجديدة، وحسابات الموردين</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'purchases' ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Package size={18} /> المشتريات
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'suppliers' ? 'bg-white text-[#1E3A8A] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <Truck size={18} /> الموردين
            </button>
          </div>
        </div>

        {activeTab === "purchases" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو امسح الباركود واضغط Enter..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 sm:py-3.5 pr-11 sm:pr-12 pl-11 sm:pl-12 text-[#0F172A] focus:outline-none focus:border-[#1E3A8A] focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all shadow-sm font-medium text-sm sm:text-base"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim().length > 0) {
                      const q = searchQuery.trim();
                      const existingProduct = products.find(p => String(p.barcode || "") === q || String(p.sku || "") === q);
                      if (existingProduct) {
                        setFormData({ ...existingProduct, id: existingProduct.id });
                      } else {
                        setFormData({ id: "", name: "", barcode: q, sku: "", imageUrl: "", category: "هواتف وأجهزة ذكية", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: "" });
                      }
                      setIsFormOpen(true);
                      setSearchQuery("");
                    }
                  }}
                />
                <Barcode className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 text-slate-300" />
              </div>
              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <button
                  onClick={handleAutoLinkAllBarcodes}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-3 sm:px-5 py-3 rounded-xl font-bold transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-amber-500/20"
                  title="توليد وربط الباركود تلقائياً لجميع المنتجات التي ليس لها باركود"
                >
                  <Sparkles size={16} /> <span className="hidden sm:inline">ربط باركود</span><span className="sm:hidden">ربط</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-5 py-3 rounded-xl font-bold transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                  title="طباعة ملصقات الباركود لجميع المنتجات"
                >
                  <Printer size={16} /> <span className="hidden sm:inline">طباعة</span><span className="sm:hidden">طباعة</span>
                </button>
                <button
                  onClick={() => toggleCamera("search")}
                  className={`px-3 sm:px-5 py-3 rounded-xl font-bold transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 border ${isCameraOpen && cameraTarget === 'search' ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'}`}
                >
                  {isCameraOpen && cameraTarget === 'search' ? <X size={18} /> : <Barcode size={18} />} <span className="hidden sm:inline">{isCameraOpen && cameraTarget === 'search' ? 'إغلاق' : 'كاميرا'}</span><span className="sm:hidden">{isCameraOpen && cameraTarget === 'search' ? 'إغلاق' : 'كاميرا'}</span>
                </button>
                <button
                  onClick={() => { setFormData({ id: "", name: "", barcode: "", sku: "", imageUrl: "", category: "هواتف وأجهزة ذكية", purchasePrice: "", wholesalePrice: "", price: "", stock: "", minStock: "", supplier: "" }); setIsFormOpen(true); }}
                  className="bg-[#1E3A8A] hover:bg-[#152960] text-white px-3 sm:px-6 py-3 rounded-xl font-bold transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm shadow-[#1E3A8A]/20"
                >
                  <Plus size={18} /> <span className="hidden sm:inline">إضافة منتج</span><span className="sm:hidden">إضافة</span>
                </button>
              </div>
            </div>

            {isCameraOpen && cameraTarget === "search" && (
              <div className="bg-white border border-slate-200 p-4 rounded-2xl relative z-20 w-full flex flex-col items-center justify-center my-4 shadow-sm">
                <div className="flex justify-between items-center w-full max-w-sm mb-3 text-[#0F172A]">
                  <span className="font-bold text-sm flex items-center gap-2">
                    <Barcode size={18} className="text-[#1E3A8A]" />
                    قارئ الباركود
                  </span>
                  <button onClick={() => toggleCamera("search")} className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors">
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
                <div id="reader" className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-black min-h-[250px]" />
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] mb-4 sm:mb-6">قائمة المنتجات (المخزون)</h2>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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
                            {p.imageUrl ? ( /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt="" className="object-contain w-full h-full p-1 mix-blend-multiply" />) : (<Package size={20} className="text-slate-400" />)}
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
                          <button onClick={() => { setFormData({ ...p }); setIsFormOpen(true); }} className="text-sm font-bold text-[#1E3A8A] hover:text-[#0F2557] transition-colors bg-[#1E3A8A]/10 px-3 py-1.5 rounded-lg">
                            تعديل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="block md:hidden space-y-4">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {p.imageUrl ? ( /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt="" className="object-contain w-full h-full p-1 mix-blend-multiply" />) : (<Package size={24} className="text-slate-400" />)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[#0F172A] truncate">{p.name}</h3>
                        <span className="bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold text-[10px] px-2 py-0.5 rounded-md mt-1 inline-block">
                          {p.category || "هواتف وأجهزة ذكية"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200/60 pt-3">
                      <div>
                        <span className="text-slate-400 block mb-0.5">الباركود:</span>
                        <span className="font-mono font-medium text-slate-700">{p.barcode || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">المخزون:</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${p.stock <= p.minStock ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-200/60 text-slate-700'}`}>
                          {p.stock}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-slate-400 block mb-0.5">سعر الشراء:</span>
                        <span className="font-bold text-slate-700">₺{p.purchasePrice || 0}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-slate-400 block mb-0.5">سعر البيع:</span>
                        <span className="font-black text-[#1E3A8A]">₺{p.price || 0}</span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button onClick={() => { setFormData({ ...p }); setIsFormOpen(true); }} className="w-full text-center text-xs font-bold text-[#1E3A8A] hover:text-[#0F2557] bg-[#1E3A8A]/10 py-2.5 rounded-lg transition-colors">
                        تعديل المنتج
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center sm:p-4">
            <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Mobile drag handle */}
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />
              <div className="flex justify-between items-center mb-4 sm:mb-6 border-b border-slate-100 pb-3 sm:pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A]">{formData.id ? "تعديل مشتريات منتج" : "إضافة منتج جديد"}</h2>
                <button onClick={() => { setIsFormOpen(false); if (isCameraOpen) setIsCameraOpen(false); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {duplicateProduct && (
                <div className="mb-4 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 border border-red-500 font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl animate-pulse">⚠️</span>
                    <span>تنبيه: الكود <span className="font-mono bg-red-700 px-2 py-0.5 rounded text-amber-300 mx-1">#{formData.barcode || formData.sku}</span> مسجل مسبقاً للمنتج: <span className="underline decoration-amber-300 font-black">{duplicateProduct.name}</span>! لا يمكنك إضافته لمنع تكرار المنتج.</span>
                  </div>
                  <span className="text-xs bg-red-700/90 px-2.5 py-1 rounded-lg text-red-100 whitespace-nowrap">كود مكرر</span>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">

                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-sm font-bold text-slate-700">اسم المنتج</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1E3A8A] flex items-center gap-1.5">
                      <span>🗂️ القسم على الموقع الرسمي</span>
                    </label>
                    <select
                      required
                      value={formData.category || "هواتف وأجهزة ذكية"}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
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
                          onClick={() => setFormData({ ...formData, barcode: "869" + Math.floor(100000000 + Math.random() * 900000000) })}
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
                      <input type="text" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none font-mono text-left transition-all pr-10" dir="ltr" placeholder="امسح بالكاميرا أو اكتب..." />
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
                        <div id="reader" className="w-full rounded-xl overflow-hidden border border-slate-600 bg-black min-h-[200px] [&_video]:scale-[1.5] [&_video]:origin-center" />
                        <p className="text-[11px] text-slate-400 mt-2 text-center">سيتم تعبئة حقل الباركود تلقائياً عند قراءته</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <label className="text-sm font-bold text-slate-700">صورة المنتج</label>
                      {isRemovingBg ? (
                        <span className="text-xs text-purple-700 font-bold animate-pulse flex items-center gap-1">
                          <Sparkles size={12} /> جاري إزالة الخلفية تلقائياً...
                        </span>
                      ) : isUploading ? (
                        <span className="text-xs text-[#1E3A8A] font-bold animate-pulse">
                          جاري المعالجة...
                        </span>
                      ) : (
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={removeBgEnabled}
                            onChange={e => setRemoveBgEnabled(e.target.checked)}
                            className="rounded accent-[#1E3A8A]"
                          />
                          إزالة الخلفية تلقائياً
                        </label>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                      <label className={`cursor-pointer shrink-0 bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 text-[#1E3A8A] border-2 border-dashed border-[#1E3A8A]/30 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${isUploading || isRemovingBg ? 'opacity-50 pointer-events-none' : ''}`}>
                        <span>📤 تحميل صورة</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading || isRemovingBg} />
                      </label>
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none font-mono text-left transition-all text-xs sm:text-sm"
                        dir="ltr"
                        placeholder="رابط الصورة (تلقائي) أو الصق رابط..."
                      />
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(true)}
                          title="معاينة الصورة كاملة"
                          className="relative shrink-0 w-16 h-16 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center hover:border-[#1E3A8A] transition-all"
                          style={checkerboardStyle}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formData.imageUrl} alt="معاينة" className="object-contain w-full h-full p-1" />
                          <span className="absolute bottom-0.5 right-0.5 bg-[#1E3A8A] text-white rounded-full p-1 shadow">
                            <Eye size={11} />
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200/50">
                    <label className="text-sm font-bold text-amber-700">سعر الشراء (التكلفة)</label>
                    <input type="number" step="0.01" required value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })} className="w-full bg-white border border-amber-200 rounded-lg px-4 py-2 text-[#0F172A] focus:border-amber-400 outline-none text-left font-bold" dir="ltr" />
                  </div>
                  <div className="space-y-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/50 lg:col-span-2">
                    <label className="text-sm font-bold text-emerald-700">سعر البيع النهائي (المفرق)</label>
                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white border border-emerald-200 rounded-lg px-4 py-2 text-[#0F172A] focus:border-emerald-400 outline-none text-left font-black text-lg" dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الكمية المشتراة (المخزون)</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] outline-none text-left font-bold" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">الحد الأدنى للتنبيه</label>
                    <input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] outline-none text-left" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">المورد</label>
                    <select value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[#0F172A] focus:border-[#1E3A8A] outline-none">
                      <option value="">-- اختر المورد --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.company})</option>)}
                    </select>
                  </div>
                </div>

                {formData.purchasePrice && formData.price && (
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex gap-4 sm:gap-8 items-center">
                    <div>
                      <span className="text-slate-500 text-[10px] sm:text-xs block mb-1 font-medium">الربح المتوقع بالقطعة</span>
                      <span className="text-emerald-600 font-bold text-base sm:text-lg">₺{(parseFloat(formData.price) - parseFloat(formData.purchasePrice)).toFixed(2)}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <div>
                      <span className="text-slate-500 text-[10px] sm:text-xs block mb-1 font-medium">هامش الربح</span>
                      <span className="text-[#1E3A8A] font-bold text-base sm:text-lg">{(((parseFloat(formData.price) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice)) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center pt-4 sm:pt-6 border-t border-slate-100 gap-3">
                  <div>
                    {formData.id && (
                      <button
                        type="button"
                        onClick={handleDeleteProduct}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold transition-colors text-sm"
                      >
                        🗑️ حذف المنتج
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2 sm:gap-3">
                    <button type="button" onClick={() => { setIsFormOpen(false); if (isCameraOpen) setIsCameraOpen(false); }} className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors text-sm">إلغاء</button>
                    <button type="submit" disabled={!!duplicateProduct} className="flex-1 sm:flex-none px-5 sm:px-8 py-2.5 bg-[#1E3A8A] hover:bg-[#152960] disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                      <Save size={16} /> حفظ المنتج
                    </button>
                  </div>
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

        {/* Full-size Image Preview Modal (check for background-removal defects) */}
        {isPreviewOpen && formData.imageUrl && (
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className="relative bg-white rounded-2xl p-4 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-[#0F172A] text-sm">معاينة صورة المنتج</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className="w-full aspect-square rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center"
                style={checkerboardStyle}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.imageUrl} alt="معاينة كاملة" className="object-contain w-full h-full p-2" />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                إذا لاحظت أي عيوب أو بقايا من الخلفية، ارفع الصورة من جديد أو عطّل "إزالة الخلفية تلقائياً" وارفعها كما هي.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
