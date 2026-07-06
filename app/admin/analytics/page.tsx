"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  DollarSign, ShoppingCart, Users, Activity, 
  ArrowUpRight, TrendingUp, Package
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    productsCount: 0,
    customersCount: 0,
    todayOrders: 0,
  });
  
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // 1. جلب بيانات الطلبات الحقيقية ومبيعات الأيام السبعة الأخيرة من فايربيس
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) => {
      let totalRev = 0;
      let todayOrd = 0;
      const now = new Date();
      
      const daysMap: { [key: string]: { name: string, revenue: number, orders: number } } = {};
      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString();
        daysMap[dateStr] = {
          name: dayNames[d.getDay()],
          revenue: 0,
          orders: 0
        };
      }

      snap.forEach((doc) => {
        const data = doc.data();
        const amount = Number(data.total) || 0;
        totalRev += amount;
        
        if (data.createdAt) {
          const orderDate = new Date(data.createdAt);
          if (orderDate.toLocaleDateString() === now.toLocaleDateString()) {
            todayOrd++;
          }
          const dateStr = orderDate.toLocaleDateString();
          if (daysMap[dateStr]) {
            daysMap[dateStr].revenue += amount;
            daysMap[dateStr].orders += 1;
          }
        }
      });

      setChartData(Object.values(daysMap));
      setStats(prev => ({
        ...prev,
        totalRevenue: totalRev,
        ordersCount: snap.size,
        todayOrders: todayOrd
      }));
    }, (err) => {
      console.error("Error fetching real orders for analytics:", err);
    });

    // 2. جلب العدد الحقيقي للمنتجات في المتجر
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setStats(prev => ({ ...prev, productsCount: snap.size }));
    });

    // 3. جلب العدد الحقيقي للعملاء المسجلين
    const unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
      setStats(prev => ({ ...prev, customersCount: snap.size }));
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubCustomers();
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight mb-1">الإحصائيات والأرباح (بيانات حقيقية 100%)</h1>
          <p className="text-zinc-500 text-sm">مراقبة الأداء والمبيعات وتحليل الإيرادات الحقيقية من قاعدة بيانات فايربيس.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md border border-zinc-800 transition-colors text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-700 active:scale-95">
            تصدير التقرير
          </button>
        </div>
      </div>

      {/* Stats Cards - Real Firebase Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">إجمالي الأرباح الحقيقية</h3>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">${stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-[11px] font-medium text-emerald-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>إيرادات كافة الطلبات المسجلة</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">إجمالي الطلبات</h3>
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">{stats.ordersCount}</div>
            <div className="flex items-center text-[11px] font-medium text-blue-400">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>{stats.todayOrders} طلبات جديدة اليوم</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">منتجات المتجر</h3>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">{stats.productsCount}</div>
            <div className="flex items-center text-[11px] font-medium text-purple-400">
              <Activity className="w-3 h-3 mr-1" />
              <span>منتجات فعالة في المخزون</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">قاعدة العملاء</h3>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">{stats.customersCount}</div>
            <div className="flex items-center text-[11px] font-medium text-amber-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>عملاء مسجلين في النظام</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
        
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">تحليل الأرباح اليومية (آخر 7 أيام)</h3>
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                  cursor={{stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '3 3'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">عدد الطلبات اليومية (آخر 7 أيام)</h3>
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#27272a'}}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#e4e4e7" radius={[2, 2, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
