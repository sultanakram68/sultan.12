"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, Settings, User } from "lucide-react";

/** Flyout panel: account info + auth actions. */
export default function AccountPanel() {
  const { data: session } = useSession();

  return (
    <div>
      <h2 id="flyout-panel-title" className="text-white text-lg font-semibold mb-4">الحساب</h2>

      {session ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {session.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <span className="w-12 h-12 rounded-full bg-white/10 grid place-items-center text-white">
                <User size={20} />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{session.user?.name}</p>
              <p className="text-[#8A8A8A] text-xs truncate">{session.user?.email}</p>
            </div>
          </div>

          <a
            href="/profile"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#8A8A8A] hover:text-white hover:bg-white/[0.04] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <Settings size={16} /> الملف الشخصي والإعدادات
          </a>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#8A8A8A] hover:text-white hover:bg-white/[0.04] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[#8A8A8A] text-sm leading-relaxed">سجّل الدخول للوصول إلى طلباتك ومفضلتك.</p>
          <button
            onClick={() => signIn("google")}
            className="w-full px-3 py-2.5 rounded-lg bg-white text-[#0A0A0A] text-sm font-semibold hover:bg-white/90 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            تسجيل الدخول بجوجل
          </button>
        </div>
      )}
    </div>
  );
}
