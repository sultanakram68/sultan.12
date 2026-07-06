"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Download, Calendar, ArrowUpRight, FileText, Printer } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function POSReportsCorporate() {
  const [dateRange, setDateRange] = useState("today");
  const [logs, setLogs] = useState<any[]>([]);
  
  // Real stats state
  const [stats, setStats] = useState({
    totalRevenue: 0,
    estimatedProfit: 0,
    totalDebts: 0
  });

  useEffect(() => {
    // Fetch Logs
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(100));
    const unsubLogs = onSnapshot(q, (snap) => {
      const fetched: any[] = [];
      snap.forEach((doc) => fetched.push({ id: doc.id, ...doc.data() }));
      setLogs(fetched);
    });

    // Fetch Orders for Revenue & Profit
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      let revenue = 0;
      let cost = 0;
      
      const now = new Date();
      
      snap.forEach(doc => {
        const data = doc.data();
        const orderDate = new Date(data.createdAt);
        
        // Filter by date range
        let include = false;
        if (dateRange === "today" && orderDate.toLocaleDateString() === now.toLocaleDateString()) include = true;
        if (dateRange === "week" && (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24) <= 7) include = true;
        if (dateRange === "month" && orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) include = true;
        if (dateRange === "year" && orderDate.getFullYear() === now.getFullYear()) include = true;
        if (dateRange === "all") include = true;

        if (include) {
          revenue += data.total || 0;
          
          // Calculate cost from items if available
          if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item: any) => {
              // Assume purchasePrice is stored, or default to 75% of price if missing for estimation
              const itemCost = item.purchasePrice ? parseFloat(item.purchasePrice) : (parseFloat(item.price) * 0.75);
              cost += (itemCost * item.quantity);
            });
          }
        }
      });
      
      setStats(prev => ({ ...prev, totalRevenue: revenue, estimatedProfit: revenue - cost }));
    });

    // Fetch Customers for Debts
    const unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
      let debts = 0;
      snap.forEach(doc => {
        const d = doc.data().debt;
        if (d && d > 0) debts += d;
      });
      setStats(prev => ({ ...prev, totalDebts: debts }));
    });

    return () => { unsubLogs(); unsubOrders(); unsubCustomers(); };
  }, [dateRange]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "التاريخ,الوقت,العملية,التفاصيل\n";
    logs.forEach(row => {
      const d = new Date(row.timestamp);
      const rowString = `"${d.toLocaleDateString()}","${d.toLocaleTimeString()}","${row.action}","${row.details}"`;
      csvContent += rowString + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_عمليات_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const StatCard = ({ title, value, icon, subtitle }: any) => (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <h3 className="text-slate-500 font-semibold mb-1 text-sm">{title}</h3>
          <h2 className="text-2xl font-black text-[#0F172A]">{value}</h2>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[#1E3A8A]">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm relative z-10">
        <span className="text-slate-400 font-medium">{subtitle}</span>
      </div>
    </div>
  );

  const profitMargin = stats.totalRevenue > 0 ? ((stats.estimatedProfit / stats.totalRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] mb-1">التقارير والإحصائيات</h1>
          <p className="text-slate-500 font-medium">مراقبة الأداء، الأرباح، وتصدير البيانات</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 text-[#0F172A] px-4 py-2.5 rounded-lg font-bold text-sm focus:outline-none focus:border-[#1E3A8A]"
          >
            <option value="today">اليوم</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
            <option value="all">كل الأوقات</option>
          </select>
          <button onClick={handleExportCSV} className="bg-white border border-slate-200 hover:bg-slate-50 text-[#0F172A] px-5 py-2.5 rounded-lg font-bold transition-all text-sm flex items-center gap-2 shadow-sm">
            <Download size={16} /> تصدير CSV (Excel)
          </button>
          <button onClick={handlePrintPDF} className="bg-[#1E3A8A] hover:bg-[#152960] text-white px-5 py-2.5 rounded-lg font-bold transition-all text-sm flex items-center gap-2 shadow-sm">
            <Printer size={16} /> طباعة / PDF
          </button>
        </div>
      </div>

      <div className="hidden print:block text-center mb-8 border-b border-black pb-4">
        <h1 className="text-2xl font-black mb-2">تقرير النظام المالي والتشغيلي</h1>
        <p>تاريخ استخراج التقرير: {new Date().toLocaleDateString()}</p>
        <p>نطاق التقرير: {dateRange}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="إجمالي الإيرادات" value={`₺${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign size={24} />} subtitle={`خلال فترة: ${dateRange}`} />
        <StatCard title="صافي الأرباح (التقديري)" value={`₺${stats.estimatedProfit.toFixed(2)}`} icon={<TrendingUp size={24} />} subtitle={`هامش الربح ~${profitMargin}%`} />
        <StatCard title="الديون الآجلة" value={`₺${stats.totalDebts.toFixed(2)}`} icon={<FileText size={24} />} subtitle="إجمالي الديون المعلقة في النظام" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Activity Logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">سجل العمليات (Activity Log)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="pb-3 font-semibold px-4">التاريخ</th>
                  <th className="pb-3 font-semibold px-4">الوقت</th>
                  <th className="pb-3 font-semibold px-4">العملية</th>
                  <th className="pb-3 font-semibold px-4">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                          <FileText size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-base">لا توجد عمليات مسجلة بعد</p>
                          <p className="text-xs text-slate-400 mt-1">ستظهر هنا تفاصيل حركات المبيعات وسداد الديون والمشتريات تلقائياً</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const d = new Date(log.timestamp);
                    return (
                      <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-600 font-mono">{d.toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-slate-600 font-mono">{d.toLocaleTimeString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            log.action === 'بيع' ? 'bg-emerald-50 text-emerald-600' :
                            log.action === 'سداد دين' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#0F172A] font-medium">{log.details}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
