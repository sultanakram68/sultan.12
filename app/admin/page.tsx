"use client";

import React from "react";
import { motion } from "framer-motion";
import { Package, ImageIcon, Languages, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminWelcome() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
  };

  const quickLinks = [
    { name: "إدارة المنتجات", desc: "إضافة أو تعديل منتجات المتجر", icon: Package, href: "/admin/products", color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "الوسائط والإعدادات", desc: "تعديل النصوص المتحركة ورقم التواصل", icon: ImageIcon, href: "/admin/media", color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "الترجمة والنصوص", desc: "تعديل جميع نصوص الموقع الثابتة", icon: Languages, href: "/admin/translations", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-4xl mx-auto mt-10"
    >
      <div className="text-center mb-12 flex flex-col items-center">
        <motion.div variants={itemVariants} className="relative w-full flex justify-center mb-6">
          <svg width="0" height="0" className="absolute hidden">
            <filter id="admin-main-logo-filter">
              <feColorMatrix
                type="matrix"
                values="
                  0 0 0 0 0.2235
                  0 0 0 0 1
                  0 0 0 0 0.0784
                  -1 -1 -1 0 2.5
                "
              />
            </filter>
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/sultan.logo.jpg" 
            alt="Sultan Logo" 
            className="h-40 w-auto object-contain drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]" 
            style={{ filter: "url(#admin-main-logo-filter)", clipPath: "inset(3px)" }}
          />
        </motion.div>
        
        <motion.p variants={itemVariants} className="text-zinc-300 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
          هذه هي لوحة التحكم الإدارية الخاصة بك
        </motion.p>
      </div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link, idx) => {
          const Icon = link.icon;
          return (
            <Link key={idx} href={link.href} className="group block">
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 transition-all duration-300 hover:bg-zinc-900 hover:border-zinc-700 hover:shadow-2xl hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${link.bg} ${link.color} group-hover:scale-110 duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-zinc-200 font-bold mb-1 group-hover:text-white transition-colors">{link.name}</h3>
                <p className="text-zinc-500 text-xs mb-4">{link.desc}</p>
                <div className="flex items-center text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                  <span>الانتقال للصفحة</span>
                  <ArrowLeft className="w-3 h-3 mr-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
