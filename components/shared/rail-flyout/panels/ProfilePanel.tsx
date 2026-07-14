"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Settings, LogOut, User } from "lucide-react";

const CARD = "rounded-xl border border-white/50 bg-white/35 p-3 mb-2";
const CARD_INTERACTIVE = CARD + " w-full text-right flex items-center gap-2 text-sm text-[#5C5C58] hover:bg-white/45 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/20";

/** Flyout panel: profile / account. */
export default function ProfilePanel() {
  const { data: session } = useSession();
  return (
    <div>
      <h2 className="text-[#1A1A18] text-base font-semibold mb-3">الحساب</h2>

      {session ? (
        <>
          <div className={CARD + " flex items-center gap-3"}>
            {session.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-white/50 grid place-items-center text-[#2A2A28]">
                <User size={18} />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-[#1A1A18] text-sm font-semibold truncate">{session.user?.name}</p>
              <p className="text-[#7A7A76] text-xs truncate">{session.user?.email}</p>
            </div>
          </div>
          <a href="/profile" className={CARD_INTERACTIVE}>
            <Settings size={15} /> الملف الشخصي والإعدادات
          </a>
          <button onClick={() => signOut()} className={CARD_INTERACTIVE}>
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </>
      ) : (
        <>
          <div className={CARD + " text-[#5C5C58] text-sm leading-relaxed"}>
            سجّل الدخول للوصول إلى طلباتك ومفضلتك.
          </div>
          <button
            onClick={() => signIn("google")}
            className="w-full rounded-xl border border-white/70 bg-white/55 p-3 text-[#1A1A18] text-sm font-semibold hover:bg-white/70 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/20"
          >
            تسجيل الدخول بجوجل
          </button>
        </>
      )}
    </div>
  );
}
