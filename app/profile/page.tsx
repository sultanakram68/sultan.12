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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-white text-black selection:bg-black selection:text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden" dir={dir}>
        <div className="w-full max-w-lg relative z-10">
          <div className="bg-white border border-black/10 rounded-3xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex flex-col items-center">

            {/* Avatar */}
            <div className="relative mb-6 group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black transition-transform duration-500 group-hover:scale-105">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center text-white">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full border-2 border-white shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* User Info */}
            <h1 className="text-3xl font-black text-black mb-2 text-center">
              {session?.user?.name || t("profile.title")}
            </h1>

            <div className="flex items-center gap-2 text-gray-600 mb-8 bg-black/[0.03] px-4 py-2 rounded-full border border-black/10">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">{session?.user?.email}</span>
            </div>

            {/* Welcome Message */}
            <div className="w-full bg-black/[0.03] border border-black/10 rounded-2xl p-4 mb-8 text-center">
              <p className="text-black font-bold flex items-center justify-center gap-2">
                <span>❖</span>
                {t("profile.welcome")}
                <span>❖</span>
              </p>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center gap-2 border-black/30 text-black hover:bg-black hover:text-white"
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
