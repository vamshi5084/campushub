"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  HelpCircle, ArrowLeft, GraduationCap, CheckCircle2,
  Clock, Send, Search, LogOut, User,
} from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };
type Student = { rollNumber: string; collegeId: number; collegeName: string; collegeCode: string };
type Query = { id: string; student_roll: string; name: string; department: string; message: string; answer: string | null; answered: boolean; created_at: number };

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

export default function QueriesPage() {
  const params = useParams();
  const code = String(params.collegeCode);

  const [college, setCollege] = useState<College | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  // Login form
  const [rollInput, setRollInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Query submission
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [message, setMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Query tracking
  const [myQueries, setMyQueries] = useState<Query[]>([]);
  const [trackRoll, setTrackRoll] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await fetch("/api/colleges");
        const cData = await cRes.json();
        const list: College[] = cData.success ? cData.colleges : FALLBACK_COLLEGES;
        setCollege(list.find((c) => c.code === code) || null);
      } catch {
        setCollege(FALLBACK_COLLEGES.find((c) => c.code === code) || null);
      } finally {
        setPageLoading(false);
      }
      // Restore session
      const saved = sessionStorage.getItem("studentSession");
      if (saved) {
        try {
          const parsed: Student = JSON.parse(saved);
          if (parsed.collegeCode === code) setStudent(parsed);
        } catch { /* ignore */ }
      }
    }
    load();
  }, [code]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNumber: rollInput, collegeId: college?.id, collegeName: college?.name, collegeCode: code }),
      });
      const data = await res.json();
      if (data.success) {
        setStudent(data.student);
        sessionStorage.setItem("studentSession", JSON.stringify(data.student));
      } else {
        setLoginError(data.message);
      }
    } catch {
      setLoginError("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("studentSession");
    setStudent(null);
    setMyQueries([]);
  }

  async function handleSubmitQuery(e: FormEvent) {
    e.preventDefault();
    if (!student || !college) return;
    setSubmitting(true);
    setSubmitStatus("");
    try {
      const res = await fetch("/api/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentRoll: student.rollNumber, name, department, message, collegeId: college.id }),
      });
      const data = await res.json();
      setSubmitStatus(data.message);
      if (data.success) { setName(""); setDepartment(""); setMessage(""); }
    } catch {
      setSubmitStatus("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    if (!college) return;
    setTrackLoading(true);
    try {
      const res = await fetch(`/api/my-queries?roll=${trackRoll.trim().toUpperCase()}&collegeId=${college.id}`);
      const data = await res.json();
      if (data.success) setMyQueries(data.queries);
    } catch { /* ignore */ }
    finally { setTrackLoading(false); }
  }

  const accentColor = college?.color || "#6366f1";

  if (pageLoading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>;
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
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold sm:text-3xl">Student Queries</h1>
                <p className="text-sm text-slate-400">{college?.name}</p>
              </div>
            </div>
            {student && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                  <GraduationCap className="h-4 w-4" style={{ color: accentColor }} />
                  <span className="font-bold">{student.rollNumber}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pt-8">
        {/* Login Gate */}
        {!student ? (
          <div className="mx-auto max-w-md">
            <div className="glass-card rounded-3xl p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${accentColor}20` }}>
                <GraduationCap className="h-7 w-7" style={{ color: accentColor }} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Student Login</h2>
              <p className="mt-1 text-sm text-slate-500">Enter your roll number to submit and track queries</p>

              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Roll Number</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={rollInput}
                      onChange={(e) => setRollInput(e.target.value.toUpperCase())}
                      placeholder="e.g. 24891A0548"
                      required
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm font-mono outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">Format: 24891A0548 (year + college code + branch + number)</p>
                </div>

                {loginError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">{loginError}</div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50"
                  style={{ background: accentColor }}
                >
                  <GraduationCap className="h-4 w-4" />
                  {loginLoading ? "Validating..." : "Continue with Roll Number"}
                </button>
              </form>

              {/* Track without login */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="mb-3 text-sm font-semibold text-slate-700">Track existing queries</p>
                <form onSubmit={handleTrack} className="flex gap-2">
                  <input
                    type="text"
                    value={trackRoll}
                    onChange={(e) => setTrackRoll(e.target.value.toUpperCase())}
                    placeholder="Your roll number"
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-indigo-400"
                  />
                  <button type="submit" disabled={trackLoading} className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-50" style={{ background: accentColor }}>
                    <Search className="h-4 w-4" />
                  </button>
                </form>

                {myQueries.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {myQueries.map((q) => (
                      <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500">{q.department}</span>
                          {q.answered
                            ? <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Answered</span>
                            : <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700"><Clock className="h-3 w-3" /> Pending</span>
                          }
                        </div>
                        <p className="text-sm font-medium text-slate-800">{q.message}</p>
                        {q.answered && q.answer && (
                          <div className="mt-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800"><strong>Answer:</strong> {q.answer}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Logged In: Submit / Track Tabs */
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Submit Query */}
            <div className="lg:col-span-3">
              <div className="glass-card rounded-3xl p-7">
                <h2 className="text-lg font-extrabold text-slate-900 mb-5">Submit a Query</h2>
                <form onSubmit={handleSubmitQuery} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Your Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Department / Subject</label>
                    <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required placeholder="e.g. Computer Science, Fee, Library" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Your Query</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} placeholder="Describe your question in detail..." className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  </div>

                  {submitStatus && (
                    <div className={`rounded-xl p-3 text-xs font-medium ${submitStatus.includes("success") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-700"}`}>
                      {submitStatus}
                    </div>
                  )}

                  <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50" style={{ background: accentColor }}>
                    <Send className="h-4 w-4" />
                    {submitting ? "Submitting..." : "Submit Query"}
                  </button>
                </form>
              </div>
            </div>

            {/* Track My Queries */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-3xl p-7">
                <h2 className="text-lg font-extrabold text-slate-900 mb-2">My Queries</h2>
                <p className="mb-5 text-xs text-slate-500">Showing queries for roll <strong className="font-mono text-slate-700">{student.rollNumber}</strong></p>

                <button
                  onClick={async () => {
                    if (!college) return;
                    setTrackLoading(true);
                    try {
                      const res = await fetch(`/api/my-queries?roll=${student.rollNumber}&collegeId=${college.id}`);
                      const data = await res.json();
                      if (data.success) setMyQueries(data.queries);
                    } finally { setTrackLoading(false); }
                  }}
                  disabled={trackLoading}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50"
                >
                  <Search className="h-4 w-4" />
                  {trackLoading ? "Loading..." : "Refresh My Queries"}
                </button>

                {myQueries.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-sm text-slate-400">No queries submitted yet.</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {myQueries.map((q) => (
                      <div key={q.id} className="rounded-xl border border-slate-100 bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-500">{q.department}</span>
                          {q.answered
                            ? <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Answered</span>
                            : <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700"><Clock className="h-3 w-3" /> Pending</span>
                          }
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2">{q.message}</p>
                        {q.answered && q.answer && (
                          <div className="mt-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800">
                            <strong>Answer:</strong> {q.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
