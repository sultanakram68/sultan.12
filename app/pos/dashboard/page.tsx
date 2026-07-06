"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, ShoppingBag, AlertCircle, DollarSign, Package, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function POSDashboardCorporate() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isInternalNav = sessionStorage.getItem("pos_internal_nav") === "true";
      if (!isInternalNav) {
        router.replace("/pos");
        return;
      }
    }
  }, [router]);

  const [stats, setStats] = useState({
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    ordersCount: 0,
    customersCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Orders
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) => {
      let today = 0, week = 0, month = 0;
      const now = new Date();
      const last7Days: any = {};
      // Initialize last 7 days for chart
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        last7Days[d.toLocaleDateString()] = 0;
      }

      const fetched: any[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        fetched.push({ id: doc.id, ...data });
        const date = new Date(data.createdAt);
        const amount = data.total || 0;
        
        // Calculate for today
        if (date.toLocaleDateString() === now.toLocaleDateString()) today += amount;
        
        // Calculate for chart
        if (last7Days[date.toLocaleDateString()] !== undefined) {
          last7Days[date.toLocaleDateString()] += amount;
        }
      });
      
      const chartArr = Object.keys(last7Days).map(date => ({
        name: date.split('/')[0] + '/' + date.split('/')[1], // Short date
        total: last7Days[date]
      }));
      setChartData(chartArr);

      setRecentTransactions(fetched.slice(0, 5));
      setStats(prev => ({ ...prev, todaySales: today, ordersCount: fetched.length }));
    });

    // Customers
    const unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
      setStats(prev => ({ ...prev, customersCount: snap.size }));
    });

    // Products (Inventory + Top selling mock)
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      let lowStock = 0, outOfStock = 0;
      const productsArr: any[] = [];
      snap.forEach(doc => {
        const p = doc.data();
        if (p.stock <= 0) outOfStock++;
        else if (p.stock <= p.minStock) lowStock++;
        productsArr.push({ id: doc.id, ...p });
      });
      setStats(prev => ({ ...prev, lowStockCount: lowStock, outOfStockCount: outOfStock }));
      
      // Since we don't track sales per product yet, we mock top selling from products list
      setTopProducts(productsArr.slice(0, 3));
    });

    return () => {
      unsubOrders(); unsubCustomers(); unsubProducts();
    };
  }, []);

  const StatCard = ({ title, value, icon, trend, trendUp, subtitle, alert }: any) => (
    <div className={`bg-white border p-6 rounded-2xl shadow-sm relative overflow-hidden group transition-all duration-300 ${alert ? 'border-red-200' : 'border-slate-200 hover:border-[#1E3A8A]/30 hover:shadow-md'}`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl transition-colors ${alert ? 'bg-red-50' : 'bg-slate-50 group-hover:bg-[#1E3A8A]/5'}`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-slate-500 font-semibold mb-1 text-sm">{title}</h3>
          <h2 className={`text-3xl font-black tracking-tight ${alert ? 'text-red-600' : 'text-[#0F172A]'}`}>{value}</h2>
        </div>
        <div className={`p-3 rounded-xl border transition-colors ${alert ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white'}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm relative z-10 font-medium">
        {trend && (
          <span className={`flex items-center gap-0.5 ${trendUp ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-red-600 bg-red-50 px-2 py-0.5 rounded-md'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}%
          </span>
        )}
        <span className={alert ? 'text-red-500' : 'text-slate-400'}>{subtitle}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0F172A] mb-1">لوحة القيادة</h1>
          <p className="text-slate-500 font-medium">مرحباً بك في نظام الإدارة المؤسسي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="مبيعات اليوم" value={`₺${stats.todaySales.toFixed(2)}`} icon={<DollarSign size={24} />} trend="12.5" trendUp={true} subtitle="مقارنة بأمس" />
        <StatCard title="إجمالي الطلبات" value={stats.ordersCount} icon={<ShoppingBag size={24} />} subtitle="الطلبات المسجلة في النظام" />
        <StatCard title="العملاء المسجلين" value={stats.customersCount} icon={<Users size={24} />} subtitle="قاعدة بيانات العملاء" />
        <StatCard title="تنبيهات المخزون" value={stats.lowStockCount + stats.outOfStockCount} icon={<AlertCircle size={24} />} alert={stats.outOfStockCount > 0} subtitle={`${stats.outOfStockCount} نفذت، ${stats.lowStockCount} على وشك النفاذ`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2"><TrendingUp size={20} className="text-[#1E3A8A]" /> المبيعات خلال 7 أيام</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="total" stroke="#1E3A8A" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions & Top Products */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Clock className="text-[#1E3A8A]" size={20} /> أحدث العمليات
            </h2>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#0F172A]">لا توجد مبيعات مسجلة اليوم</p>
                    <p className="text-xs text-slate-400">ستظهر هنا أحدث فواتير البيع فور إتمام أول عملية عبر الكاشير</p>
                  </div>
                </div>
              ) : recentTransactions.map((trx, i) => (
                <div key={trx.id || i} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-sm">{trx.customerName || "عميل نقدي"}</h4>
                    <span className="text-xs text-slate-400 font-mono">{new Date(trx.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-[#1E3A8A] block">₺{trx.total?.toFixed(2)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${trx.paymentMethod === 'debt' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {trx.paymentMethod === 'debt' ? 'آجل' : 'نقدي'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Package className="text-[#1E3A8A]" size={20} /> منتجات متوفرة
            </h2>
            <div className="space-y-3">
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400">
                    <Package size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#0F172A]">المخزون فارغ حالياً</p>
                    <p className="text-xs text-slate-400">قم بإضافة منتجات جديدة عبر صفحة المشتريات والمخزون</p>
                  </div>
                </div>
              ) : topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                    {p.imageUrl ? (/* eslint-disable-next-line @next/next/no-img-element */ <img src={p.imageUrl} alt="" className="object-contain w-full h-full p-1 mix-blend-multiply" />) : <Package size={16} className="text-[#1E3A8A]" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#0F172A] font-bold text-sm mb-0.5 line-clamp-1">{p.name}</h4>
                    <p className="text-slate-500 text-xs font-medium">مخزون: {p.stock}</p>
                  </div>
                  <div className="text-[#1E3A8A] font-black text-sm">
                    ₺{parseFloat(p.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
