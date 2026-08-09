"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Search, ArrowLeft, MapPin, Clock, ExternalLink, GraduationCap } from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };
type Event = { id: string; title: string; description: string; category: string; department: string; date: string; time: string; venue: string; registration_link?: string };
type Student = { rollNumber: string; collegeId: number; collegeName: string; collegeCode: string; year: string; department: string };

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

const GENERAL_DEPTS = ["General", "All", "Student Activities", "Student Council", "Cultural Club", "Cultural Committee", "Sports", "Physical Education", "Alumni Relations Cell"];

const CATEGORIES = ["All", "Technical", "Cultural", "Placement", "Sports", "Workshop", "Academic"];

export default function EventsPage() {
  const params = useParams();
  const code = String(params.collegeCode);

  const [college, setCollege] = useState<College | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      const saved = sessionStorage.getItem("studentSession");
      if (saved) {
        try {
          const parsed: Student = JSON.parse(saved);
          if (parsed.collegeCode === code) setStudent(parsed);
        } catch { /* ignore */ }
      }
      try {
        const cRes = await fetch("/api/colleges");
        const cData = await cRes.json();
        const list: College[] = (cData.success && Array.isArray(cData.colleges) && cData.colleges.length > 0)
          ? cData.colleges : FALLBACK_COLLEGES;
        const found = list.find((c) => c.code === code) || null;
        setCollege(found);
        if (found) {
          const eRes = await fetch(`/api/admin/events?collegeId=${found.id}`);
          const eData = await eRes.json();
          if (eData.success) setEvents(eData.events);
        }
      } catch (err) {
        console.error(err);
        setCollege(FALLBACK_COLLEGES.find((c) => c.code === code) || null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  // Department filter: show events for student's dept + general/cultural/placement events
  const deptFiltered = events.filter((e) => {
    if (showAll || !student) return true;
    return (
      GENERAL_DEPTS.some(g => e.department.toLowerCase().includes(g.toLowerCase())) ||
      e.department.toLowerCase().includes(student.department.toLowerCase()) ||
      e.category === "Cultural" || e.category === "Placement" || e.category === "Sports"
    );
  });

  const filtered = deptFiltered.filter((e) => {
    const matchQ = !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.description.toLowerCase().includes(query.toLowerCase());
    const matchC = category === "All" || e.category === category;
    return matchQ && matchC;
  });

  const accentColor = college?.color || "#6366f1";

  function dateBlock(dateStr: string) {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? { month: "AUG", day: "--" }
      : { month: d.toLocaleString("default", { month: "short" }).toUpperCase(), day: String(d.getDate()) };
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <section
        className="relative overflow-hidden pt-14 pb-12 text-white"
        style={{
          backgroundColor: "#060d1f",
          backgroundImage: `radial-gradient(circle at 50% -10%, ${accentColor}55, transparent 65%), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 36px 36px, 36px 36px",
        }}
      >
        <div className="relative mx-auto max-w-5xl px-6">
          <Link href={`/${code}`} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-3.5 w-3.5" /> {college?.short_name || code.toUpperCase()} Home
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: accentColor }}>
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold sm:text-3xl">Events & Fests</h1>
                <p className="text-sm text-slate-400">{college?.name}</p>
              </div>
            </div>
            {student && (
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs backdrop-blur-md">
                <GraduationCap className="h-3.5 w-3.5" style={{ color: accentColor }} />
                <span className="font-bold text-white">{student.department} · {student.year}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pt-8">
        {/* Department filter notice */}
        {student && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">
              Showing events for <strong className="text-slate-800">{student.department}</strong> and open events (cultural, placement, sports).
            </p>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="ml-4 shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              style={showAll ? { background: accentColor, color: "#fff" } : { background: "#e2e8f0", color: "#475569" }}
            >
              {showAll ? "My Dept Only" : "Show All"}
            </button>
          </div>
        )}

        {/* Search + Category */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
                style={category === cat ? { background: accentColor, color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">No events found</p>
            <p className="mt-1 text-sm text-slate-400">Try clicking "Show All" or changing the category filter.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((ev) => {
              const { month, day } = dateBlock(ev.date);
              return (
                <article key={ev.id} className="glass-card hover-lift rounded-2xl p-6 flex gap-4">
                  {/* Date block */}
                  <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl px-4 py-3 text-white" style={{ background: accentColor, minWidth: 60 }}>
                    <span className="text-[10px] font-bold uppercase">{month}</span>
                    <span className="text-2xl font-extrabold leading-none">{day}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: accentColor }}>{ev.category}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-snug">{ev.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">{ev.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.venue}</span>
                    </div>
                    {ev.registration_link && (
                      <a href={ev.registration_link} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: accentColor }}>
                        Register Now <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
