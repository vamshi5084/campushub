"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  Calendar,
  Globe,
  LogOut,
  Shield,
  GraduationCap,
} from "lucide-react";

type College = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  color: string;
};

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("adminCollege");
    if (saved) {
      try {
        setCollege(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  function logout() {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminCollege");
    router.push("/admin");
  }

  const accentColor = college?.color || "#6366f1";

  const links = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Student Queries",
      path: "/admin/queries",
      icon: MessageSquare,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: Megaphone,
    },
    {
      name: "Events",
      path: "/admin/events",
      icon: Calendar,
    },
  ];

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-64 flex-col justify-between border-r border-slate-800 bg-slate-950 text-white shrink-0">
      <div>
        {/* Brand Banner */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all"
            style={{
              background: accentColor,
              boxShadow: `0 0 15px ${accentColor}50`,
            }}
          >
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">
              Campus<span style={{ color: accentColor }}>Hub</span>
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {college?.shortName || "Admin"} Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Management Tools
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  active ? "" : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
                style={
                  active
                    ? {
                        backgroundColor: accentColor,
                        color: "#ffffff",
                        boxShadow: `0 4px 12px ${accentColor}30`,
                      }
                    : {}
                }
              >
                <Icon
                  className="h-4 w-4"
                  style={active ? { color: "#ffffff" } : { color: "#64748b" }}
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-slate-800/80 p-4 space-y-2">
        <Link
          href={college ? `/${college.code}` : "/"}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <Globe className="h-3.5 w-3.5" style={{ color: accentColor }} />
          View Public Website
        </Link>

        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600/10 border border-rose-500/20 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-600 hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
