"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    translations: 0,
    products: 0,
    news: 0,
  });
  
  const [loading, setLoading] = useState(true);

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
          news: 0,
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-blue-600 font-semibold p-8">جاري تحميل البيانات...</div>;

  return (
    <div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">نظرة عامة على لوحة التحكم</h1>
      <p className="text-gray-500 mb-8">مرحباً بك في لوحة تحكم سلطان موبايل.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">نصوص الموقع (الترجمات)</h3>
          <div className="text-4xl font-black text-gray-900">{stats.translations}</div>
          <p className="text-xs text-gray-400 mt-2 font-medium">نصوص نشطة في قاعدة البيانات</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">المنتجات / الخدمات</h3>
          <div className="text-4xl font-black text-blue-600">{stats.products}</div>
          <p className="text-xs text-gray-400 mt-2 font-medium">عناصر يمكن إدارتها</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">الأخبار والمقالات</h3>
          <div className="text-4xl font-black text-blue-500">{stats.news}</div>
          <p className="text-xs text-gray-400 mt-2 font-medium">المحتوى المنشور</p>
        </div>
      </div>

      <div className="mt-10 bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/translations" className="bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors border border-gray-200 hover:border-blue-200">
            تعديل نصوص الموقع
          </Link>
          <Link href="/admin/products" className="bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors border border-gray-200 hover:border-blue-200">
            إدارة المنتجات
          </Link>
          <Link href="/admin/media" className="bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors border border-gray-200 hover:border-blue-200">
            تعديل الإعدادات
          </Link>
        </div>
      </div>
    </div>
  );
}
