"use client";

import React, { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { LogOut, User, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();
  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-neon-dark flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-neon-dark selection:bg-neon-green selection:text-neon-dark">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden" dir={dir}>
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-neon-green/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-lg relative z-10">
          <div className="bg-black/40 backdrop-blur-2xl border border-neon-green/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(57,255,20,0.15)] flex flex-col items-center">
            
            {/* Avatar */}
            <div className="relative mb-6 group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-neon-green shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-transform duration-500 group-hover:scale-105">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-neon-dark flex items-center justify-center text-neon-green">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-[#39ff14] text-black p-2 rounded-full border-2 border-black shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* User Info */}
            <h1 className="text-3xl font-black text-white mb-2 text-center">
              {session?.user?.name || t("profile.title")}
            </h1>
            
            <div className="flex items-center gap-2 text-gray-400 mb-8 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <Mail className="w-4 h-4 text-neon-green" />
              <span className="text-sm font-medium">{session?.user?.email}</span>
            </div>

            {/* Welcome Message */}
            <div className="w-full bg-neon-green/10 border border-neon-green/20 rounded-2xl p-4 mb-8 text-center">
              <p className="text-neon-green font-bold flex items-center justify-center gap-2">
                <span className="animate-pulse">❖</span> 
                {t("profile.welcome")} 
                <span className="animate-pulse">❖</span>
              </p>
            </div>

            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full flex items-center justify-center gap-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold">{t("profile.logout")}</span>
            </Button>
            
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
