"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Megaphone, Search, AlertTriangle, ArrowLeft, BookOpen } from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };
type Announcement = { id: string; title: string; description: string; category: string; department: string; date: string; urgent: boolean };
type Student = { rollNumber: string; collegeId: number; collegeName: string; collegeCode: string; year: string; department: string };

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

// Departments considered "General" — visible to all students regardless of department
const GENERAL_DEPTS = ["General", "All", "Administration", "Examination Branch", "Student Council", "Student Activities", "Library Administration", "Physical Education Dept", "Training & Placement Cell", "Alumni Relations Cell"];

const CATEGORIES = ["All", "Academic", "Placement", "Exam", "Finance", "General"];

export default function AnnouncementsPage() {
  const params = useParams();
  const code = String(params.collegeCode);

  const [college, setCollege] = useState<College | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function load() {
      // Get student session
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
          const aRes = await fetch(`/api/admin/announcements?collegeId=${found.id}`);
          const aData = await aRes.json();
          if (aData.success) setAnnouncements(aData.announcements);
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

  // Filter: show student's dept announcements + general ones; or all if showAll toggled
  const deptFiltered = announcements.filter((a) => {
    if (showAll || !student) return true;
    return (
      GENERAL_DEPTS.some(g => a.department.toLowerCase().includes(g.toLowerCase())) ||
      a.department.toLowerCase().includes(student.department.toLowerCase()) ||
      a.category === "Exam" || a.category === "Placement" || a.urgent
    );
  });

  const filtered = deptFiltered.filter((a) => {
    const matchQ = !query || a.title.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase());
    const matchC = category === "All" || a.category === category;
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: accentColor }}>
                <Megaphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold sm:text-3xl">Announcements</h1>
                <p className="text-sm text-slate-400">{college?.name}</p>
              </div>
            </div>
            {student && (
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs backdrop-blur-md">
                <BookOpen className="h-3.5 w-3.5" style={{ color: accentColor }} />
                <span className="text-white/80">Showing for</span>
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
              Showing announcements relevant to <strong className="text-slate-800">{student.department}</strong> department and general notices.
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

        {/* Search + Category Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search announcements..."
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
            <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">No announcements found</p>
            <p className="mt-1 text-sm text-slate-400">Try switching to "Show All" or a different category filter.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((ann) => (
              <article key={ann.id} className="glass-card hover-lift rounded-2xl p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: accentColor }}>{ann.category}</span>
                  {ann.urgent && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      <AlertTriangle className="h-3 w-3" /> URGENT
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900">{ann.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{ann.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>{ann.department}</span>
                  <span>{ann.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
