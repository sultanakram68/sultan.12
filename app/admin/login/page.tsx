"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Temporary for first account
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/admin");
    } catch (err: any) {
      if (isSignUp) {
        setError("فشل إنشاء الحساب: " + err.message);
      } else {
        setError("بيانات الدخول خاطئة أو الحساب غير موجود.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-900" dir="rtl">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
        <h1 className="text-3xl font-black text-gray-900 text-center mb-2">
          {isSignUp ? "إنشاء حساب مدير" : "تسجيل الدخول للإدارة"}
        </h1>
        <p className="text-gray-500 text-center mb-8">الوصول الآمن للوحة التحكم</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 border border-red-100 text-sm">{error}</div>}
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left"
              required 
              dir="ltr"
            />
          </div>
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600 mb-1 block">كلمة المرور</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-3 pl-12 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-left"
                required 
                dir="ltr"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-6 text-base rounded-lg transition-colors mt-2">
            {loading ? "جاري التحقق..." : (isSignUp ? "إنشاء حساب جديد" : "تسجيل الدخول")}
          </Button>
          
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:underline mt-2 text-center"
          >
            {isSignUp ? "لدي حساب بالفعل، تسجيل الدخول" : "إنشاء حساب مدير لأول مرة"}
          </button>
        </form>
      </div>
    </div>
  );
}
