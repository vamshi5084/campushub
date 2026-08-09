"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Megaphone,
  Calendar,
  Clock,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  LogOut,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Landmark,
  Award,
  Building2,
} from "lucide-react";

type Query = {
  id: string;
  answered: boolean;
};

type College = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  color: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [college, setCollege] = useState<College | null>(null);
  const [queries, setQueries] = useState<Query[]>([]);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("adminLoggedIn");
    const savedCollege = sessionStorage.getItem("adminCollege");

    if (loggedIn !== "true" || !savedCollege) {
      router.push("/admin");
      return;
    }

    let parsedCollege: College;
    try {
      parsedCollege = JSON.parse(savedCollege);
      setCollege(parsedCollege);
    } catch (e) {
      console.error(e);
      router.push("/admin");
      return;
    }

    async function loadDashboard() {
      try {
        // Load queries
        const queryResponse = await fetch(`/api/admin/queries?collegeId=${parsedCollege.id}`);
        const queryData = await queryResponse.json();
        if (queryData.success && Array.isArray(queryData.queries)) {
          setQueries(queryData.queries);
        }

        // Load announcements
        const announcementResponse = await fetch(`/api/admin/announcements?collegeId=${parsedCollege.id}`);
        const announcementData = await announcementResponse.json();
        if (announcementData.success && Array.isArray(announcementData.announcements)) {
          setAnnouncementCount(announcementData.announcements.length);
        }

        // Load events
        const eventResponse = await fetch(`/api/admin/events?collegeId=${parsedCollege.id}`);
        const eventData = await eventResponse.json();
        if (eventData.success && Array.isArray(eventData.events)) {
          setEventCount(eventData.events.length);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function logout() {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminCollege");
    router.push("/admin");
  }

  if (loading || !college) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <h2 className="mt-4 text-base font-bold text-white">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  const total = queries.length;
  const answered = queries.filter((q) => q.answered).length;
  const pending = queries.filter((q) => !q.answered).length;
  const accentColor = college.color;

  return (
    <div
      className="min-h-screen text-white overflow-hidden"
      style={{
        backgroundColor: "#070e22",
        backgroundImage: `
          radial-gradient(circle at 0% 0%, ${accentColor}20, transparent 50%),
          radial-gradient(circle at 100% 0%, rgba(124,58,237,0.15), transparent 50%),
          linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 100%, 36px 36px, 36px 36px",
      }}
    >
      {/* Background patterns */}
      <GraduationCap className="pointer-events-none fixed top-12 right-16 text-white/[0.03]" style={{ width: 160, height: 160, transform: "rotate(10deg)" }} />
      <BookOpen className="pointer-events-none fixed bottom-16 left-12 text-white/[0.03]" style={{ width: 140, height: 140, transform: "rotate(-8deg)" }} />

      <div className="relative mx-auto max-w-7xl py-10 px-6 sm:px-10">
        {/* Header */}
        <section className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div
              className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}30`,
                color: accentColor,
              }}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              {college.name}
            </div>

            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: accentColor,
                  boxShadow: `0 0 20px ${accentColor}50`,
                }}
              >
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Executive Dashboard
                </h1>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout Session
          </button>
        </section>

        {/* Stats Grid */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: accentColor }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              Overview Metrics
            </h2>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl p-6 border border-slate-800 bg-slate-900/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-slate-400">Total Queries</span>
                <HelpCircle className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-3xl font-extrabold">{total}</p>
              <p className="mt-1 text-xs text-slate-500">Tickets submitted</p>
            </div>

            <div className="rounded-2xl p-6 border border-amber-900/30 bg-amber-950/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-amber-400">Pending Review</span>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-amber-400">{pending}</p>
              <p className="mt-1 text-xs text-amber-500/70">Awaiting response</p>
            </div>

            <div className="rounded-2xl p-6 border border-emerald-900/30 bg-emerald-950/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-emerald-400">Answered</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-400">{answered}</p>
              <p className="mt-1 text-xs text-emerald-500/70">Resolved queries</p>
            </div>

            <div className="rounded-2xl p-6 border border-indigo-900/30 bg-indigo-950/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-indigo-400">Announcements</span>
                <Megaphone className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-extrabold text-indigo-400">{announcementCount}</p>
              <p className="mt-1 text-xs text-indigo-500/70">Live notices</p>
            </div>

            <div className="rounded-2xl p-6 border border-purple-900/30 bg-purple-950/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase text-purple-400">Events</span>
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-extrabold text-purple-400">{eventCount}</p>
              <p className="mt-1 text-xs text-purple-500/70">Scheduled events</p>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section>
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-4 w-4" style={{ color: accentColor }} />
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              Management Modules
            </h2>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Student Queries */}
            <div
              onClick={() => router.push("/admin/queries")}
              className="group cursor-pointer rounded-3xl p-7 border border-slate-800 bg-slate-900/30 hover:border-amber-500/40 hover:bg-slate-900/50 transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-5">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                Student Query Queue
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Review submitted student inquiries, write replies, and mark tickets as resolved.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                Open Query Inbox <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Announcements */}
            <div
              onClick={() => router.push("/admin/announcements")}
              className="group cursor-pointer rounded-3xl p-7 border border-slate-800 bg-slate-900/30 hover:border-indigo-500/40 hover:bg-slate-900/50 transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-5">
                <Megaphone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                Manage Announcements
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Publish new notices, flag high-priority updates, and edit existing notices.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                Manage Notice Board <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Events */}
            <div
              onClick={() => router.push("/admin/events")}
              className="group cursor-pointer rounded-3xl p-7 border border-slate-800 bg-slate-900/30 hover:border-purple-500/40 hover:bg-slate-900/50 transition-all hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-5">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                Manage Events & Fests
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Schedule campus fests, workshops, hackathons, and manage registrations.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                Manage Events Directory <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-14 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>CampusHub Admin Desk</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live
          </div>
        </div>
      </div>
    </div>
  );
}
