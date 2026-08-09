"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Calendar, Search, Clock, MapPin, ArrowLeft, ExternalLink } from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };
type Event = { id: string; title: string; description: string; category: string; department: string; date: string; time: string; venue: string; registration_link?: string };

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

const CATEGORIES = ["All", "Technical", "Cultural", "Placement", "Sports", "Workshop"];

export default function EventsPage() {
  const params = useParams();
  const code = String(params.collegeCode);

  const [college, setCollege] = useState<College | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await fetch("/api/colleges");
        const cData = await cRes.json();
        const list: College[] = cData.success ? cData.colleges : FALLBACK_COLLEGES;
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

  const filtered = events.filter((e) => {
    const matchQ = !query || e.title.toLowerCase().includes(query.toLowerCase()) || e.venue.toLowerCase().includes(query.toLowerCase());
    const matchC = category === "All" || e.category === category;
    return matchQ && matchC;
  });

  const accentColor = college?.color || "#6366f1";

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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: accentColor }}>
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold sm:text-3xl">Events & Fests</h1>
              <p className="text-sm text-slate-400">{college?.name}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pt-8">
        {/* Search + Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search events or venue..."
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
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((ev) => {
              const d = new Date(ev.date);
              const month = d.toLocaleString("default", { month: "short" }).toUpperCase();
              const day = d.getDate();
              return (
                <article key={ev.id} className="glass-card hover-lift flex gap-5 rounded-2xl p-6">
                  <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white" style={{ background: accentColor }}>
                    <span className="text-[10px] font-bold">{month}</span>
                    <span className="text-2xl font-extrabold leading-none">{day}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: accentColor }}>{ev.category}</span>
                    <h3 className="mt-2 font-bold text-slate-900 leading-snug">{ev.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{ev.description}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ev.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ev.venue}</span>
                    </div>
                    {ev.registration_link && (
                      <a href={ev.registration_link} target="_blank" rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-80"
                        style={{ background: accentColor }}>
                        Register <ExternalLink className="h-3 w-3" />
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
