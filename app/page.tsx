"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap, ArrowRight, BookOpen, Calendar, Megaphone,
  HelpCircle, Building2, Sparkles, Shield,
} from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };

const DESCRIPTIONS: Record<string, string> = {
  vignan: "Premier engineering institution in Andhra Pradesh offering world-class technical education and research.",
  cbit: "One of Hyderabad's top autonomous engineering colleges with a legacy of academic excellence since 1979.",
  anurag: "A leading private university in Telangana offering multidisciplinary programs across engineering and management.",
};
const EMOJIS: Record<string, string> = { vignan: "🎓", cbit: "🏛️", anurag: "📚" };

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

export default function Home() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/colleges")
      .then((r) => r.json())
      .then((d) => { if (d.success) setColleges(d.colleges); else setColleges(FALLBACK_COLLEGES); })
      .catch(() => setColleges(FALLBACK_COLLEGES))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="college-hero relative overflow-hidden pt-20 pb-16 text-white">
        <GraduationCap className="pointer-events-none absolute top-10 left-12 text-white/[0.04]" style={{ width: 140, height: 140, transform: "rotate(12deg)" }} />
        <BookOpen className="pointer-events-none absolute bottom-8 right-14 text-white/[0.04]" style={{ width: 120, height: 120, transform: "rotate(-8deg)" }} />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Multi-Campus Smart Notice Board
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to{" "}
            <span className="gradient-text">CampusHub</span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            One unified platform for announcements, events, and student queries —<br className="hidden sm:block" />
            serving <strong className="text-white">Vignan · CBIT · Anurag</strong> colleges.
          </p>

          <p className="mt-6 text-sm text-slate-500">👇 Select your college to continue</p>
        </div>
      </section>

      {/* ── College Cards ── */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Choose Your College</h2>
          <p className="mt-2 text-sm text-slate-500">Access your college's notices, events, and submit queries</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {colleges.map((college) => (
              <Link
                key={college.code}
                href={`/${college.code}`}
                className="glass-card hover-lift group relative overflow-hidden rounded-3xl p-8"
                style={{ borderTopColor: college.color, borderTopWidth: 4 }}
              >
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{ background: `${college.color}18` }}>
                  {EMOJIS[college.code] || "🏫"}
                </div>

                <span className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest text-white"
                  style={{ background: college.color }}>
                  {college.short_name}
                </span>

                <h3 className="text-lg font-bold leading-snug text-slate-900">{college.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {DESCRIPTIONS[college.code] || "Campus information portal."}
                </p>

                <div className="mt-5 space-y-1.5 border-t border-slate-100 pt-4">
                  {[
                    { icon: <Megaphone className="h-3.5 w-3.5" />, label: "Announcements" },
                    { icon: <Calendar className="h-3.5 w-3.5" />, label: "Events" },
                    { icon: <HelpCircle className="h-3.5 w-3.5" />, label: "Queries" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs text-slate-400">
                      {item.icon}<span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5"
                  style={{ color: college.color }}>
                  Enter Portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Features Strip ── */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { icon: <Megaphone className="h-6 w-6" />, title: "Announcements", desc: "Official academic notices, exam schedules, and urgent alerts from your institution.", color: "#6366f1" },
              { icon: <Calendar className="h-6 w-6" />,  title: "Events & Fests",  desc: "Hackathons, cultural fests, workshops, and sports events — all in one place.", color: "#0ea5e9" },
              { icon: <HelpCircle className="h-6 w-6" />, title: "Student Queries", desc: "Submit questions using your roll number and track answers from administration.", color: "#10b981" },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Admin Link ── */}
      <div className="py-6 text-center">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-slate-700">
          <Shield className="h-3.5 w-3.5" /> College Admin Login
        </Link>
      </div>
    </main>
  );
}
