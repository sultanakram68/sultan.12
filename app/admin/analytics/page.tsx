"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { 
  DollarSign, ShoppingCart, Users, Activity, 
  ArrowUpRight, ArrowDownRight, TrendingUp
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

const MOCK_REVENUE_DATA = [
  { name: 'الإثنين', revenue: 4000, orders: 24 },
  { name: 'الثلاثاء', revenue: 3000, orders: 18 },
  { name: 'الأربعاء', revenue: 5500, orders: 35 },
  { name: 'الخميس', revenue: 2780, orders: 15 },
  { name: 'الجمعة', revenue: 8900, orders: 58 },
  { name: 'السبت', revenue: 10900, orders: 75 },
  { name: 'الأحد', revenue: 7490, orders: 48 },
];

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    translations: 0,
    products: 0,
    news: 0,
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const transRef = doc(db, "translations", "ar");
        const transDoc = await getDoc(transRef);
        const transCount = transDoc.exists() ? Object.keys(transDoc.data()).length : 0;

        const prodSnap = await getDocs(collection(db, "products"));
        const prodCount = prodSnap.size;

        setStats({
          translations: transCount,
          products: prodCount,
          news: 12,
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
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
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight mb-1">الإحصائيات والأرباح</h1>
          <p className="text-zinc-500 text-sm">مراقبة الأداء والمبيعات وتحليل الإيرادات.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md border border-zinc-800 transition-colors text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-700 active:scale-95">
            تصدير التقرير
          </button>
        </div>
      </div>

      {/* Stats Cards - Minimalist Solid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">إجمالي الأرباح</h3>
            <DollarSign className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">$45,231.89</div>
            <div className="flex items-center text-[11px] font-medium text-emerald-500">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>+20.1% عن الشهر الماضي</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">الطلبات</h3>
            <ShoppingCart className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">+{stats.products > 0 ? stats.products * 14 : 350}</div>
            <div className="flex items-center text-[11px] font-medium text-emerald-500">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>+18.2% عن الشهر الماضي</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">النشاط المباشر</h3>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">573</div>
            <div className="flex items-center text-[11px] font-medium text-zinc-500">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+201 منذ الساعة الماضية</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-zinc-400 text-xs font-medium">عملاء جدد</h3>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-100 mb-1">24</div>
            <div className="flex items-center text-[11px] font-medium text-red-500">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              <span>-4.5% عن الأسبوع الماضي</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-6">
        
        <motion.div variants={itemVariants} className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">تحليل الأرباح</h3>
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <h3 className="text-sm font-semibold text-zinc-300 mb-4">المبيعات حسب التصنيف</h3>
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
