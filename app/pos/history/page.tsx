"use client";

import React, { useState, useEffect } from "react";
import { 
  History, Search, Filter, Calendar, CreditCard, DollarSign, 
  RotateCcw, Eye, X, CheckCircle2, AlertTriangle, ArrowLeft, 
  Package, User, FileText, RefreshCw, ShieldAlert, ArrowDownRight, Tag, Printer, Check, Clock, AlertCircle, QrCode, Download
} from "lucide-react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function POSHistoryLog() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [returnsLog, setReturnsLog] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"sales" | "returns">("sales");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "week" | "month">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "cash" | "card">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "returned_partial" | "returned_full">("all");
  const [returnsOnly, setReturnsOnly] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("تالف / عيب مصنعي");
  const [customReturnReason, setCustomReturnReason] = useState("");
  const [returnItemsState, setReturnItemsState] = useState<{ [itemId: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // Print format state (80mm thermal, 58mm thermal, or A4 / PDF)
  const [printWidth, setPrintWidth] = useState<"80mm" | "58mm" | "a4">("80mm");

  // Load real-time orders & returns from Firestore
  useEffect(() => {
    const qOrders = query(collection(db, "orders"), orderBy("timestamp", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(list);
      setLoading(false);
    }, (err) => {
      console.error("Error loading orders:", err);
      setLoading(false);
    });

    const qReturns = query(collection(db, "returns"), orderBy("timestamp", "desc"));
    const unsubReturns = onSnapshot(qReturns, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReturnsLog(list);
    }, (err) => {
      console.error("Error loading returns:", err);
    });

    return () => {
      unsubOrders();
      unsubReturns();
    };
  }, []);

  // Filter orders based on criteria
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery.trim() || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item: any) => String(item.name || "").toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.items?.some((item: any) => String(item.barcode || "").includes(searchQuery));

    if (!matchesSearch) return false;

    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter) return false;

    const currentStatus = order.status || "completed";
    if (statusFilter !== "all" && currentStatus !== statusFilter) return false;

    if (returnsOnly && (!order.totalRefunded || order.totalRefunded <= 0)) return false;

    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt || order.timestamp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        if (orderDate < today) return false;
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (orderDate < yesterday || orderDate >= today) return false;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (orderDate < weekAgo) return false;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (orderDate < monthAgo) return false;
      }
    }

    return true;
  });

  const filteredReturnsLog = returnsLog.filter(ret => {
    return !searchQuery.trim() || 
      ret.originalOrderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.returnedItems?.some((item: any) => String(item.name || "").toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleOpenReturnModal = (order: any) => {
    const initialQty: { [itemId: string]: number } = {};
    order.items?.forEach((item: any) => {
      initialQty[item.id] = 0;
    });
    setReturnItemsState(initialQty);
    setReturnReason("تالف / عيب مصنعي");
    setCustomReturnReason("");
    setReturnModalOpen(true);
  };

  const handleSelectAllForReturn = () => {
    if (!selectedOrder) return;
    const allQty: { [itemId: string]: number } = {};
    selectedOrder.items?.forEach((item: any) => {
      const maxAvailable = item.qty - (item.returnedQty || 0);
      allQty[item.id] = Math.max(0, maxAvailable);
    });
    setReturnItemsState(allQty);
  };

  const calculateCurrentRefundTotal = () => {
    if (!selectedOrder) return 0;
    let totalRefund = 0;
    selectedOrder.items?.forEach((item: any) => {
      const returnQty = returnItemsState[item.id] || 0;
      if (returnQty > 0) {
        totalRefund += parseFloat(item.price || 0) * returnQty;
      }
    });
    return totalRefund;
  };

  const handleExecuteReturn = async () => {
    if (!selectedOrder) return;
    const totalRefundThisTime = calculateCurrentRefundTotal();
    if (totalRefundThisTime <= 0) {
      alert("يرجى تحديد كمية منتج واحد على الأقل لإتمام عملية الإرجاع.");
      return;
    }

    const finalReason = returnReason === "أخرى" && customReturnReason.trim() 
      ? customReturnReason.trim() 
      : returnReason;

    try {
      const returnedItemsList: any[] = [];
      const updatedItems = selectedOrder.items.map((item: any) => {
        const returnQty = returnItemsState[item.id] || 0;
        if (returnQty > 0) {
          returnedItemsList.push({
            id: item.id,
            name: item.name,
            price: item.price,
            returnedQty: returnQty,
            refundAmount: parseFloat(item.price || 0) * returnQty
          });
        }
        return {
          ...item,
          returnedQty: (item.returnedQty || 0) + returnQty
        };
      });

      for (const retItem of returnedItemsList) {
        try {
          await updateDoc(doc(db, "products", retItem.id), {
            stock: increment(retItem.returnedQty)
          });
        } catch (e) {
          console.warn(`Could not update stock for ${retItem.id}, product may have been deleted or modified.`, e);
        }
      }

      const newTotalRefunded = (selectedOrder.totalRefunded || 0) + totalRefundThisTime;
      const newNetOrderTotal = Math.max(0, (selectedOrder.total || 0) - newTotalRefunded);
      
      let allReturned = true;
      let anyReturned = false;
      updatedItems.forEach((item: any) => {
        if ((item.returnedQty || 0) > 0) anyReturned = true;
        if ((item.returnedQty || 0) < item.qty) allReturned = false;
      });

      const newStatus = allReturned ? "returned_full" : (anyReturned ? "returned_partial" : "completed");

      await updateDoc(doc(db, "orders", selectedOrder.id), {
        items: updatedItems,
        status: newStatus,
        totalRefunded: newTotalRefunded,
        netTotalAfterReturns: newNetOrderTotal
      });

      const returnId = `ret_${Date.now()}`;
      await setDoc(doc(db, "returns", returnId), {
        originalOrderId: selectedOrder.id,
        returnedItems: returnedItemsList,
        refundAmount: totalRefundThisTime,
        reason: finalReason,
        paymentMethod: selectedOrder.paymentMethod || "cash",
        cashierName: selectedOrder.cashierName || "المدير العام / الكاشير الرئيسي",
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      });

      await setDoc(doc(collection(db, "activity_logs")), {
        action: "إرجاع منتجات",
        details: `إرجاع من فاتورة (#${selectedOrder.id.slice(-6)}) بقيمة ₺${totalRefundThisTime.toFixed(2)} - السبب: ${finalReason}`,
        timestamp: new Date().toISOString()
      });

      alert(`تم إتمام إرجاع المنتجات بنجاح! تم استرداد مبلغ ₺${totalRefundThisTime.toFixed(2)} وإعادة المنتجات للمخزون.`);
      
      setSelectedOrder({
        ...selectedOrder,
        items: updatedItems,
        status: newStatus,
        totalRefunded: newTotalRefunded,
        netTotalAfterReturns: newNetOrderTotal
      });
      setReturnModalOpen(false);
    } catch (error) {
      console.error("Error executing return:", error);
      alert("حدث خطأ أثناء تنفيذ عملية الإرجاع. يرجى المحاولة مرة أخرى.");
    }
  };

  const triggerPrint = (size: "80mm" | "58mm" | "a4") => {
    setPrintWidth(size);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "returned_full":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5"><RotateCcw size={12} /> مسترجع بالكامل</span>;
      case "returned_partial":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1.5"><AlertTriangle size={12} /> مسترجع جزئياً</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5"><CheckCircle2 size={12} /> مكتملة</span>;
    }
  };

  const getPaymentBadge = (method?: string) => {
    if (method === "card") {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1.5"><CreditCard size={12} /> بطاقة بنكية</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5"><DollarSign size={12} /> نقداً (كاش)</span>;
  };

  return (
    <div>
      {/* SCREEN VIEW (HIDDEN ON PRINT) */}
      <div className="space-y-6 animate-in fade-in duration-100 pb-12 print:hidden">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-lg shadow-[#1E3A8A]/30">
              <History size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                سجل العمليات والإرجاع
                <span className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-normal border border-slate-200">
                  History & Returns
                </span>
              </h1>
              <p className="text-slate-500 text-sm font-medium mt-1">
                إدارة الفواتير، متابعة طرق الدفع، واسترداد الأموال مع التحديث التلقائي للمخزون
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab("sales")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "sales"
                  ? "bg-[#1E3A8A] text-white shadow-md shadow-[#1E3A8A]/30"
                  : "text-slate-600 hover:text-[#0F172A]"
              }`}
            >
              <FileText size={16} />
              سجل المبيعات
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-current ml-1 font-mono">
                {orders.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("returns")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "returns"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                  : "text-slate-600 hover:text-[#0F172A]"
              }`}
            >
              <RotateCcw size={16} />
              سجل الإرجاعات
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-current ml-1 font-mono">
                {returnsLog.length}
              </span>
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث برقم الفاتورة أو اسم المنتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-[#0F172A] placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A]">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative">
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Calendar size={16} />
              </div>
              <select
                value={dateFilter}
                onChange={(e: any) => setDateFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-[#0F172A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="all">التاريخ: جميع الأوقات</option>
                <option value="today">اليوم فقط</option>
                <option value="yesterday">أمس</option>
                <option value="week">آخر 7 أيام</option>
                <option value="month">هذا الشهر</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="relative">
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <CreditCard size={16} />
              </div>
              <select
                value={paymentFilter}
                onChange={(e: any) => setPaymentFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-[#0F172A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="all">طريقة الدفع: الكل</option>
                <option value="cash">نقداً (كاش) فقط</option>
                <option value="card">بطاقة بنكية فقط</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Filter size={16} />
              </div>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-[#0F172A] text-sm focus:outline-none focus:border-[#1E3A8A] focus:bg-white transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="all">حالة العملية: الكل</option>
                <option value="completed">مكتملة تماماً (بدون إرجاع)</option>
                <option value="returned_partial">مسترجع جزئياً</option>
                <option value="returned_full">مسترجع بالكامل</option>
              </select>
            </div>

          </div>

          {/* Quick Returns Toggle */}
          {activeTab === "sales" && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-bold text-slate-600 hover:text-[#0F172A] transition-colors">
                <input
                  type="checkbox"
                  checked={returnsOnly}
                  onChange={(e) => setReturnsOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#1E3A8A] rounded border-slate-300 bg-slate-50 cursor-pointer"
                />
                <span className="flex items-center gap-2">
                  <RotateCcw size={15} className="text-amber-500" />
                  عرض العمليات التي تحتوي على إرجاعات فقط
                </span>
              </label>

              <span className="text-xs text-slate-500 font-medium">
                العدد المعروض: <strong className="text-[#0F172A] font-mono">{filteredOrders.length}</strong> من أصل {orders.length}
              </span>
            </div>
          )}
        </div>

        {/* TAB 1: SALES LOG */}
        {activeTab === "sales" && (
          <div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
                <RefreshCw size={32} className="animate-spin text-[#1E3A8A]" />
                <p className="font-bold">جاري تحميل سجل المبيعات الفوري من قاعدة البيانات...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <FileText size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#0F172A]">لا توجد عمليات بيع تطابق البحث</h3>
                  <p className="text-slate-500 text-sm">جرب تغيير الفلاتر أو إتمام عملية بيع جديدة من الكاشير</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredOrders.map((order) => {
                  const totalItemsCount = order.items?.reduce((sum: number, i: any) => sum + (i.qty || 1), 0) || 0;
                  const isReturned = (order.totalRefunded || 0) > 0;

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-[#1E3A8A]/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                    >
                      {isReturned && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-500" />
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#0F172A] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              #{order.id.slice(-8)}
                            </span>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock size={13} className="text-[#1E3A8A]" />
                            <span>{new Date(order.createdAt || order.timestamp).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate justify-end font-mono">
                            <span>{new Date(order.createdAt || order.timestamp).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-500 font-bold">
                            <span>المنتجات ({order.items?.length || 0} صنف / {totalItemsCount} قطعة)</span>
                            {getPaymentBadge(order.paymentMethod)}
                          </div>
                          <div className="text-xs text-[#0F172A] truncate font-medium">
                            {order.items?.map((i: any) => i.name).join(" + ") || "منتجات متنوعة"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">المبلغ الإجمالي</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-[#0F172A] font-mono">
                              ₺{(order.netTotalAfterReturns ?? order.total ?? 0).toFixed(2)}
                            </span>
                            {isReturned && (
                              <span className="text-xs text-slate-400 line-through font-mono">
                                ₺{(order.total || 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button className="px-3.5 py-2 rounded-xl bg-slate-100 group-hover:bg-[#1E3A8A] text-slate-600 group-hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-200 group-hover:border-[#1E3A8A]">
                          <Eye size={14} />
                          التفاصيل
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RETURNS LOG */}
        {activeTab === "returns" && (
          <div>
            {filteredReturnsLog.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <RotateCcw size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#0F172A]">سجل الإرجاعات فارغ حالياً</h3>
                  <p className="text-slate-500 text-sm">ستظهر هنا جميع عمليات استرداد الأموال وإرجاع المنتجات للمخزون بشكل دائم</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredReturnsLog.map((ret) => (
                  <div
                    key={ret.id}
                    className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-amber-500" />

                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5">
                          <RotateCcw size={13} /> إرجاع مسترد
                        </span>
                        <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          فاتورة #{ret.originalOrderId?.slice(-8) || "N/A"}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(ret.createdAt || ret.timestamp).toLocaleString("ar-SA")}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                      <span className="text-xs font-bold text-slate-500 block mb-1">المنتجات التي تم إرجاعها للمخزون:</span>
                      {ret.returnedItems?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-[#0F172A] border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                          <span className="font-bold flex items-center gap-1.5">
                            <Package size={13} className="text-red-500" /> {item.name}
                          </span>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="px-2 py-0.5 rounded bg-white text-amber-600 font-bold border border-slate-200">
                              {item.returnedQty} قطعة
                            </span>
                            <span className="text-[#0F172A] font-bold">
                              ₺{item.refundAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">سبب الإرجاع:</span>
                        <span className="font-bold text-[#0F172A]">{ret.reason || "تالف / عيب مصنعي"}</span>
                      </div>
                      <div className="bg-red-50 p-2.5 rounded-xl border border-red-200 text-right">
                        <span className="text-red-600 block mb-0.5">المبلغ المسترجع:</span>
                        <span className="text-lg font-black text-[#0F172A] font-mono">₺{ret.refundAmount?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSACTION DETAILS MODAL (SCREEN ONLY) */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] flex items-center gap-2">
                      تفاصيل الفاتورة <span className="font-mono text-[#1E3A8A] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">#{selectedOrder.id}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {new Date(selectedOrder.createdAt || selectedOrder.timestamp).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>

                {/* Print & Export Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => triggerPrint("80mm")}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#1E3A8A] text-slate-700 hover:text-white transition-all border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
                    title="طباعة حرارية مقاس 80mm"
                  >
                    <Printer size={15} /> حراري (80mm)
                  </button>
                  <button 
                    onClick={() => triggerPrint("58mm")}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-[#1E3A8A] text-slate-700 hover:text-white transition-all border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
                    title="طباعة حرارية مقاس 58mm"
                  >
                    <Printer size={15} /> حراري (58mm)
                  </button>
                  <button 
                    onClick={() => triggerPrint("a4")}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white transition-all border border-slate-200 flex items-center gap-1.5 text-xs font-bold"
                    title="طباعة كاملة A4 أو تصدير PDF"
                  >
                    <Download size={15} /> PDF / A4
                  </button>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors border border-slate-200"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* Top Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-400 block mb-1">طريقة الدفع</span>
                    <div className="font-bold text-sm text-[#0F172A]">{getPaymentBadge(selectedOrder.paymentMethod)}</div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-400 block mb-1">حالة العملية</span>
                    <div className="font-bold text-sm text-[#0F172A]">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-400 block mb-1">الكاشير المسؤل</span>
                    <div className="font-bold text-sm text-[#0F172A] truncate flex items-center gap-1.5">
                      <User size={14} className="text-[#1E3A8A]" />
                      {selectedOrder.cashierName || "المدير العام"}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-400 block mb-1">عدد المنتجات</span>
                    <div className="font-bold text-sm text-[#0F172A] font-mono">
                      {selectedOrder.items?.reduce((sum: number, i: any) => sum + (i.qty || 1), 0)} قطعة ({selectedOrder.items?.length} أصناف)
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-medium">الإجمالي الأصلي للفاتورة: <strong className="text-[#0F172A] font-mono">₺{(selectedOrder.total || 0).toFixed(2)}</strong></span>
                    {(selectedOrder.totalRefunded || 0) > 0 && (
                      <span className="text-xs text-red-600 block font-medium">
                        تم استرداد (إرجاع): <strong className="font-mono">₺{(selectedOrder.totalRefunded).toFixed(2)}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-right sm:border-r sm:border-slate-200 sm:pr-6">
                    <span className="text-xs text-slate-500 block font-bold">المبلغ النهائي الصافي</span>
                    <span className="text-3xl font-black text-emerald-600 font-mono">
                      ₺{(selectedOrder.netTotalAfterReturns ?? selectedOrder.total ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Products List Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Package size={16} className="text-[#1E3A8A]" />
                    قائمة المنتجات المشترى
                  </h3>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-right border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-xs bg-slate-50 font-bold">
                          <th className="py-3 px-4">المنتج</th>
                          <th className="py-3 px-4 text-center">الكمية</th>
                          <th className="py-3 px-4">سعر القطعة</th>
                          <th className="py-3 px-4">الإجمالي</th>
                          <th className="py-3 px-4 text-center">حالة الإرجاع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                        {selectedOrder.items?.map((item: any, idx: number) => {
                          const returnedQty = item.returnedQty || 0;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                    {item.imageUrl ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img src={item.imageUrl} alt="" className="w-8 h-8 object-contain" />
                                    ) : (
                                      <Package size={18} className="text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-[#0F172A] text-sm">{item.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{item.barcode || "-"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold">
                                {item.qty}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-600">
                                ₺{parseFloat(item.price || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                                ₺{(parseFloat(item.price || 0) * item.qty).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {returnedQty > 0 ? (
                                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-600 border border-red-200 inline-flex items-center gap-1">
                                    <RotateCcw size={11} /> تم إرجاع ({returnedQty})
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-500 font-medium">سليم (بدون إرجاع)</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Return Action Section */}
                <div className="pt-4 border-t border-slate-100">
                  {!returnModalOpen ? (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-[#0F172A] text-sm flex items-center gap-2">
                          <RotateCcw size={16} className="text-amber-500" /> هل ترغب في إرجاع منتجات من هذه الفاتورة؟
                        </h4>
                        <p className="text-xs text-slate-500">
                          يمكنك إرجاع منتج واحد، عدة منتجات، أو كامل الفاتورة مع استرداد المبلغ وتحديث المخزون فوراً.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenReturnModal(selectedOrder)}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 whitespace-nowrap"
                      >
                        <RotateCcw size={16} /> إرجاع المنتجات
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-red-200 rounded-2xl p-5 space-y-5 animate-in fade-in duration-150 shadow-lg">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="font-bold text-[#0F172A] text-base flex items-center gap-2">
                          <RotateCcw size={18} className="text-red-600" /> اختيار المنتجات المراد إرجاعها
                        </h4>
                        <button
                          onClick={handleSelectAllForReturn}
                          className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                        >
                          إرجاع كامل الفاتورة
                        </button>
                      </div>

                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {selectedOrder.items?.map((item: any) => {
                          const maxReturnable = item.qty - (item.returnedQty || 0);
                          const currentVal = returnItemsState[item.id] || 0;

                          return (
                            <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-[#0F172A]">{item.name}</span>
                                <span className="text-xs text-slate-400">({item.qty} قطعة في الفاتورة - متاح للإرجاع: {maxReturnable})</span>
                              </div>

                              {maxReturnable > 0 ? (
                                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => setReturnItemsState({ ...returnItemsState, [item.id]: Math.min(maxReturnable, currentVal + 1) })}
                                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold flex items-center justify-center"
                                  >+</button>
                                  <span className="w-8 text-center font-mono font-bold text-[#0F172A] text-sm">{currentVal}</span>
                                  <button
                                    type="button"
                                    onClick={() => setReturnItemsState({ ...returnItemsState, [item.id]: Math.max(0, currentVal - 1) })}
                                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold flex items-center justify-center"
                                  >-</button>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">تم إرجاعه بالكامل</span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-600">سبب الإرجاع</label>
                          <select
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[#0F172A] text-sm focus:outline-none focus:border-red-500 font-medium"
                          >
                            <option value="تالف / عيب مصنعي">تالف / عيب مصنعي</option>
                            <option value="عدم رغبة العميل / تبديل">عدم رغبة العميل / تبديل</option>
                            <option value="خطأ في إدخال الفاتورة">خطأ في إدخال الفاتورة</option>
                            <option value="أخرى">أخرى (كتابة السبب)</option>
                          </select>
                        </div>

                        {returnReason === "أخرى" && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">توضيح السبب</label>
                            <input
                              type="text"
                              placeholder="اكتب سبب الإرجاع هنا..."
                              value={customReturnReason}
                              onChange={(e) => setCustomReturnReason(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-[#0F172A] text-sm focus:outline-none focus:border-red-500 font-medium"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-xs text-slate-500 block">إجمالي المبلغ المسترجع الآن:</span>
                          <span className="text-xl font-black text-red-600 font-mono">₺{calculateCurrentRefundTotal().toFixed(2)}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setReturnModalOpen(false)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={handleExecuteReturn}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-md shadow-red-600/20 flex items-center gap-2"
                          >
                            <Check size={16} /> تأكيد الإرجاع واسترداد الأموال
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* 100% WHITE CLEAN PRINT / PDF INVOICE SECTION (ONLY VISIBLE ON PRINT) */}
      {selectedOrder && (
        <div 
          id="printable-invoice" 
          className="hidden print:block print:bg-white print:text-black print:w-full print:mx-auto print:p-4 print:shadow-none print:font-sans"
          style={{
            maxWidth: printWidth === "58mm" ? "58mm" : (printWidth === "80mm" ? "80mm" : "210mm"),
            width: printWidth === "58mm" ? "58mm" : (printWidth === "80mm" ? "80mm" : "100%"),
            fontSize: printWidth === "58mm" ? "10px" : (printWidth === "80mm" ? "12px" : "14px"),
            color: "#000000",
            backgroundColor: "#ffffff",
            direction: "rtl",
            fontFamily: "Arial, sans-serif"
          }}
        >
          {/* Store Logo & Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <div className="flex justify-center mb-2">
              <img 
                src="/sultan.logo.jpg" 
                alt="Store Logo" 
                className="h-16 w-auto object-contain grayscale contrast-200"
              />
            </div>
            <h1 className="font-extrabold text-black tracking-tight" style={{ fontSize: printWidth === "a4" ? "24px" : "16px" }}>
              متجري العظيم (POS Store)
            </h1>
            <p className="text-black font-semibold mt-1">الرياض، المملكة العربية السعودية</p>
            <p className="text-black font-mono mt-0.5" dir="ltr">+966 50 000 0000</p>
            <p className="text-black font-bold mt-1">الرقم الضريبي: 300000000000003</p>
          </div>

          {/* Invoice Info */}
          <div className="border-b border-black pb-3 mb-3 text-black font-bold space-y-1" style={{ fontSize: printWidth === "58mm" ? "10px" : "12px" }}>
            <div className="flex justify-between">
              <span>رقم الفاتورة:</span>
              <span className="font-mono">#{selectedOrder.id}</span>
            </div>
            <div className="flex justify-between">
              <span>التاريخ والوقت:</span>
              <span className="font-mono">{new Date(selectedOrder.createdAt || selectedOrder.timestamp).toLocaleString("ar-SA")}</span>
            </div>
            <div className="flex justify-between">
              <span>الكاشير:</span>
              <span>{selectedOrder.cashierName || "المدير العام"}</span>
            </div>
            <div className="flex justify-between">
              <span>طريقة الدفع:</span>
              <span>{selectedOrder.paymentMethod === "card" ? "بطاقة بنكية (Card)" : "نقداً (Cash)"}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table className="w-full text-right border-collapse" style={{ borderColor: "#000000" }}>
              <thead>
                <tr className="border-b-2 border-black font-black text-black">
                  <th className="py-1.5 text-right">المنتج</th>
                  <th className="py-1.5 text-center">الكمية</th>
                  <th className="py-1.5 text-center">سعر الوحدة</th>
                  <th className="py-1.5 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400 text-black font-semibold">
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const returnedQty = item.returnedQty || 0;
                  return (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="py-2 text-right">
                        <div>{item.name}</div>
                        {returnedQty > 0 && (
                          <div className="text-black font-bold text-[10px]">(مسترجع: {returnedQty} قطعة)</div>
                        )}
                      </td>
                      <td className="py-2 text-center font-mono">{item.qty}</td>
                      <td className="py-2 text-center font-mono">₺{parseFloat(item.price || 0).toFixed(2)}</td>
                      <td className="py-2 text-left font-mono font-bold">₺{(parseFloat(item.price || 0) * item.qty).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Final Total Area (Bold & Highlighted) */}
          <div className="border-t-2 border-b-2 border-black py-3 mb-4 text-black space-y-1.5">
            <div className="flex justify-between font-bold">
              <span>المجموع الفرعي:</span>
              <span className="font-mono">₺{(selectedOrder.total || 0).toFixed(2)}</span>
            </div>
            {(selectedOrder.totalRefunded || 0) > 0 && (
              <div className="flex justify-between font-bold">
                <span>إجمالي المسترجع:</span>
                <span className="font-mono">-₺{(selectedOrder.totalRefunded).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black pt-2 border-t border-black" style={{ fontSize: printWidth === "a4" ? "24px" : "16px" }}>
              <span>المبلغ النهائي الصافي:</span>
              <span className="font-mono">₺{(selectedOrder.netTotalAfterReturns ?? selectedOrder.total ?? 0).toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code & Footer */}
          <div className="text-center space-y-3 pt-2">
            <div className="flex justify-center">
              {/* ZATCA E-Invoice Style QR Code Box */}
              <div className="p-2 border-2 border-black inline-block bg-white">
                <svg width="90" height="90" viewBox="0 0 100 100" className="mx-auto">
                  <rect x="5" y="5" width="25" height="25" fill="black" />
                  <rect x="10" y="10" width="15" height="15" fill="white" />
                  <rect x="15" y="15" width="5" height="5" fill="black" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="black" />
                  <rect x="75" y="10" width="15" height="15" fill="white" />
                  <rect x="80" y="15" width="5" height="5" fill="black" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="black" />
                  <rect x="10" y="75" width="15" height="15" fill="white" />
                  <rect x="15" y="80" width="5" height="5" fill="black" />

                  <rect x="35" y="10" width="10" height="10" fill="black" />
                  <rect x="50" y="15" width="15" height="5" fill="black" />
                  <rect x="35" y="35" width="30" height="30" fill="black" />
                  <rect x="40" y="40" width="20" height="20" fill="white" />
                  <rect x="45" y="45" width="10" height="10" fill="black" />
                  <rect x="70" y="35" width="25" height="15" fill="black" />
                  <rect x="10" y="35" width="20" height="10" fill="black" />
                  <rect x="35" y="70" width="15" height="20" fill="black" />
                  <rect x="55" y="75" width="40" height="15" fill="black" />
                  <rect x="65" y="85" width="10" height="10" fill="white" />
                </svg>
                <span className="block text-[8px] font-mono font-bold text-black mt-1">ZATCA E-INVOICE</span>
              </div>
            </div>
            <div className="font-bold text-black space-y-0.5">
              <p>شكراً لزيارتكم! نتطلع لخدمتكم مرة أخرى</p>
              <p className="text-[10px] font-mono">نظام POS العالمي لإدارة المتاجر والمطاعم</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
