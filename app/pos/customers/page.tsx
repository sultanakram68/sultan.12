"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Plus, Phone, MapPin, Receipt, Wallet, FileText, X, Printer, Calendar } from "lucide-react";
import { collection, onSnapshot, doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function POSCustomersCorporate() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", notes: "" });
  
  // Advanced features state
  const [paymentAmount, setPaymentAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "customers"), (snap) => {
      const fetched: any[] = [];
      snap.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
      setCustomers(fetched);
      if (selectedCustomer) {
        const updated = fetched.find(c => c.id === selectedCustomer.id);
        if (updated) setSelectedCustomer(updated);
      }
    });
    return () => unsubscribe();
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter(c => String(c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || String(c.phone || "").includes(searchQuery));

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newDocRef = doc(collection(db, "customers"));
      await setDoc(newDocRef, {
        ...formData, ordersCount: 0, totalPurchases: 0, balance: 0, debt: 0, debtDueDate: "",
        installments: [], createdAt: new Date().toISOString()
      });
      alert("تمت إضافة العميل بنجاح!");
      setIsFormOpen(false); setFormData({ name: "", phone: "", address: "", notes: "" });
    } catch (error) { alert("حدث خطأ أثناء حفظ العميل."); }
  };

  const handlePayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0 || !selectedCustomer) return;
    
    if (amount > selectedCustomer.debt) {
      alert("المبلغ المدخل أكبر من قيمة الدين!");
      return;
    }

    try {
      const newInstallments = [...(selectedCustomer.installments || [])];
      newInstallments.push({ amount, date: new Date().toISOString() });

      await updateDoc(doc(db, "customers", selectedCustomer.id), {
        debt: increment(-amount),
        debtDueDate: dueDate || selectedCustomer.debtDueDate || "",
        installments: newInstallments
      });

      await setDoc(doc(collection(db, "activity_logs")), {
        action: "سداد دين", details: `سداد مبلغ ₺${amount} من العميل ${selectedCustomer.name}`, timestamp: new Date().toISOString()
      });

      alert("تم سداد الدفعة بنجاح!");
      setPaymentAmount(""); setDueDate("");
    } catch (error) {
      console.error("Payment error:", error);
      alert("حدث خطأ أثناء السداد.");
    }
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-100 flex flex-col h-full lg:h-[calc(100vh-6rem)]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] mb-1">العملاء والديون</h1>
          <p className="text-slate-500 font-medium">إدارة حسابات العملاء، الأرصدة، وتتبع سداد الديون</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-[#1E3A8A] hover:bg-[#152960] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2">
          <Plus size={20} /> إضافة عميل جديد
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* Customers List */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full overflow-hidden print:hidden">
          <div className="relative mb-6">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="ابحث عن عميل بالاسم أو رقم الهاتف..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-[#0F172A] focus:outline-none focus:border-[#1E3A8A] focus:bg-white focus:ring-4 focus:ring-[#1E3A8A]/10 transition-all font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Users size={48} className="opacity-30 mb-4" />
                <p className="font-medium text-slate-500">لا يوجد عملاء. قم بإضافة عميل جديد للبدء.</p>
              </div>
            ) : (
              filteredCustomers.map(c => (
                <div key={c.id} onClick={() => setSelectedCustomer(c)} className={`bg-white border ${selectedCustomer?.id === c.id ? 'border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/10' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'} rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedCustomer?.id === c.id ? 'bg-[#1E3A8A] text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F172A] text-lg">{c.name}</h3>
                      <p className="text-sm text-slate-500 font-mono">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-500 mb-1 font-medium">الديون المستحقة</p>
                    <p className={`font-black text-lg ${c.debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>₺{c.debt || '0.00'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer Details & Debt Payment */}
        <div className={`w-full lg:w-[450px] bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full overflow-hidden ${!selectedCustomer && 'print:hidden'}`}>
          {selectedCustomer ? (
            <div className="flex flex-col h-full">
              
              {/* Print Only Header */}
              <div className="hidden print:block text-center border-b border-slate-900 pb-4 mb-6">
                <h1 className="text-2xl font-black mb-2">كشف حساب عميل</h1>
                <p className="text-slate-500">التاريخ: {new Date().toLocaleDateString()}</p>
              </div>

              <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-[#0F172A] mb-2">{selectedCustomer.name}</h2>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><Phone size={14} className="text-[#1E3A8A]" /> <span dir="ltr">{selectedCustomer.phone}</span></p>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-2"><MapPin size={14} className="text-[#1E3A8A]" /> {selectedCustomer.address || "لا يوجد عنوان"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <Receipt className="text-slate-400 mb-2 print:hidden" size={20} />
                  <p className="text-xs text-slate-500 mb-1 font-medium">إجمالي المشتريات</p>
                  <p className="text-xl font-bold text-[#0F172A]">₺{selectedCustomer.totalPurchases || 0}</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <Wallet className="text-red-500 mb-2 print:hidden" size={20} />
                  <p className="text-xs text-red-600 mb-1 font-medium">الرصيد المتبقي (الديون)</p>
                  <p className="text-xl font-bold text-red-600">₺{selectedCustomer.debt || 0}</p>
                  {selectedCustomer.debtDueDate && selectedCustomer.debt > 0 && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium"><Calendar size={12}/> الاستحقاق: {selectedCustomer.debtDueDate}</p>
                  )}
                </div>
              </div>

              {/* Installments Log */}
              {selectedCustomer.installments && selectedCustomer.installments.length > 0 && (
                <div className="mb-6 flex-1 overflow-y-auto min-h-[100px] border border-slate-100 rounded-xl p-4 bg-slate-50">
                  <h4 className="text-sm font-bold text-[#0F172A] mb-3">سجل الدفعات السابقة</h4>
                  <ul className="space-y-2">
                    {selectedCustomer.installments.slice().reverse().map((inst: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center text-sm border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{new Date(inst.date).toLocaleDateString()}</span>
                        <span className="text-emerald-600 font-bold">+₺{inst.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action: Pay Debt */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 mt-auto print:hidden">
                <h3 className="font-bold text-[#0F172A] mb-4">تسديد دفعة مالية (سداد دين)</h3>
                <div className="flex gap-2 mb-3">
                  <input type="number" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} placeholder="المبلغ..." className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-[#0F172A] focus:outline-none focus:border-[#1E3A8A] font-bold" />
                  <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-1/2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]" title="تاريخ الاستحقاق للقسط القادم" />
                </div>
                <button onClick={handlePayment} disabled={!paymentAmount || selectedCustomer.debt === 0} className="w-full mb-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 shadow-sm">
                  تسجيل دفعة
                </button>
                <button onClick={handlePrintStatement} className="w-full bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Printer size={18} /> طباعة كشف حساب
                </button>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 print:hidden">
              <Users size={64} className="opacity-20 mb-6" />
              <p className="text-lg font-medium text-slate-500">اختر عميلاً من القائمة لعرض التفاصيل وإدارة حساباته.</p>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#0F172A]">إضافة عميل جديد</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">اسم العميل</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] focus:border-[#1E3A8A] outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] focus:border-[#1E3A8A] outline-none text-left transition-all" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">العنوان</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] focus:border-[#1E3A8A] outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">ملاحظات (اختياري)</label>
                <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0F172A] focus:border-[#1E3A8A] outline-none transition-all" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors">إلغاء</button>
                <button type="submit" className="px-8 py-2.5 bg-[#1E3A8A] hover:bg-[#152960] text-white rounded-xl font-bold transition-all shadow-sm">
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
