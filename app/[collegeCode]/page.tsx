"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Megaphone, Calendar, HelpCircle, ArrowRight, GraduationCap,
  BookOpen, AlertTriangle, Clock, ArrowLeft,
} from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };
type Announcement = { id: string; title: string; description: string; category: string; department: string; date: string; urgent: boolean };
type Event = { id: string; title: string; description: string; category: string; department: string; date: string; time: string; venue: string; registration_link?: string };

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

export default function CollegeHome() {
  const params = useParams();
  const code = String(params.collegeCode);

  const [college, setCollege] = useState<College | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Load colleges
        const cRes = await fetch("/api/colleges");
        const cData = await cRes.json();
        const list: College[] = cData.success ? cData.colleges : FALLBACK_COLLEGES;
        const found = list.find((c) => c.code === code) || null;
        setCollege(found);

        if (found) {
          const [aRes, eRes] = await Promise.all([
            fetch(`/api/admin/announcements?collegeId=${found.id}`),
            fetch(`/api/admin/events?collegeId=${found.id}`),
          ]);
          const aData = await aRes.json();
          const eData = await eRes.json();
          if (aData.success) setAnnouncements(aData.announcements.slice(0, 3));
          if (eData.success) setEvents(eData.events.slice(0, 3));
        }
      } catch (err) {
        console.error(err);
        const found = FALLBACK_COLLEGES.find((c) => c.code === code) || null;
        setCollege(found);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-slate-900">College not found</h1>
        <p className="mt-2 text-slate-500">The college "{code}" does not exist.</p>
        <Link href="/" className="mt-6 text-indigo-600 hover:underline">← Back to home</Link>
      </div>
    );
  }

  const accentColor = college.color;
  const urgentAnnouncements = announcements.filter((a) => a.urgent);

  return (
    <main className="min-h-screen pb-16">
      {/* Hero */}
      <section
        className="relative overflow-hidden pt-16 pb-14 text-white"
        style={{
          backgroundColor: "#060d1f",
          backgroundImage: `
            radial-gradient(circle at 50% -10%, ${accentColor}55, transparent 65%),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 36px 36px, 36px 36px",
        }}
      >
        <GraduationCap className="pointer-events-none absolute top-8 left-10 text-white/[0.04]" style={{ width: 130, height: 130 }} />
        <BookOpen className="pointer-events-none absolute bottom-6 right-12 text-white/[0.04]" style={{ width: 110, height: 110 }} />

        <div className="relative mx-auto max-w-5xl px-6">
          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-3.5 w-3.5" /> All Colleges
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-extrabold text-white"
              style={{ background: accentColor, boxShadow: `0 0 30px ${accentColor}66` }}
            >
              {college.short_name.slice(0, 2)}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
                {college.short_name}
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">{college.name}</h1>
              <p className="mt-1 text-sm text-slate-400">Campus Notices · Events · Student Queries</p>
            </div>
          </div>

          {/* Nav Pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: "Announcements", href: `/${code}/announcements`, icon: <Megaphone className="h-4 w-4" /> },
              { label: "Events",        href: `/${code}/events`,        icon: <Calendar className="h-4 w-4" /> },
              { label: "Queries",       href: `/${code}/queries`,       icon: <HelpCircle className="h-4 w-4" /> },
            ].map((nav) => (
              <Link
                key={nav.label}
                href={nav.href}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-105"
                style={{ background: `${accentColor}25`, border: `1px solid ${accentColor}50` }}
              >
                {nav.icon} {nav.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Urgent Alerts */}
      {urgentAnnouncements.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pt-8">
          {urgentAnnouncements.map((ann) => (
            <div key={ann.id} className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">URGENT</p>
                <p className="mt-1 font-semibold text-red-900">{ann.title}</p>
                <p className="mt-1 text-sm text-red-700">{ann.description}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="mx-auto max-w-5xl px-6 pt-10 grid gap-10 lg:grid-cols-2">
        {/* Recent Announcements */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Recent Announcements</h2>
            <Link href={`/${code}/announcements`} className="flex items-center gap-1 text-xs font-bold transition hover:gap-2" style={{ color: accentColor }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {announcements.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">No announcements yet.</div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="glass-card hover-lift rounded-2xl p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: accentColor }}>{ann.category}</span>
                    {ann.urgent && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">URGENT</span>}
                  </div>
                  <h3 className="font-bold text-slate-900">{ann.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{ann.description}</p>
                  <p className="mt-2 text-xs text-slate-400">{ann.department} · {ann.date}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Events */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Upcoming Events</h2>
            <Link href={`/${code}/events`} className="flex items-center gap-1 text-xs font-bold transition hover:gap-2" style={{ color: accentColor }}>
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">No events scheduled yet.</div>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => {
                const d = new Date(ev.date);
                const month = d.toLocaleString("default", { month: "short" }).toUpperCase();
                const day = d.getDate();
                return (
                  <div key={ev.id} className="glass-card hover-lift flex gap-4 rounded-2xl p-5">
                    <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-white" style={{ background: accentColor }}>
                      <span className="text-[10px] font-bold">{month}</span>
                      <span className="text-xl font-extrabold leading-none">{day}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{ev.title}</h3>
                      <p className="mt-1 text-xs text-slate-500 truncate">{ev.venue}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" /> {ev.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Quick Query CTA */}
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <Link href={`/${code}/queries`}
          className="flex items-center justify-between rounded-2xl p-6 text-white transition hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
        >
          <div>
            <h3 className="font-bold text-lg">Have a Question?</h3>
            <p className="text-sm text-white/80">Submit your query using your roll number. Get answers from admin.</p>
          </div>
          <ArrowRight className="h-6 w-6 shrink-0" />
        </Link>
      </div>
    </main>
  );
}
