"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User, ArrowLeft, ShieldAlert, Sparkles, LogOut, BookOpen, ChevronDown } from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };
type Student = {
  rollNumber: string;
  collegeId: number;
  collegeName: string;
  collegeCode: string;
  collegeColor: string;
  year: string;
  department: string;
};

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const DEPARTMENTS = [
  "CSE", "IT", "ECE", "EEE", "Mechanical", "Civil",
  "AI & ML", "Data Science", "Chemical", "MBA", "MCA",
];

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const code = String(params.collegeCode);

  const [college, setCollege] = useState<College | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [rollInput, setRollInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [deptInput, setDeptInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await fetch("/api/colleges");
        const cData = await cRes.json();
        const list: College[] = (cData.success && Array.isArray(cData.colleges) && cData.colleges.length > 0)
          ? cData.colleges : FALLBACK_COLLEGES;
        setCollege(list.find((c) => c.code === code) || null);
      } catch {
        setCollege(FALLBACK_COLLEGES.find((c) => c.code === code) || null);
      } finally {
        setLoading(false);
      }

      const saved = sessionStorage.getItem("studentSession");
      if (saved) {
        try {
          const parsed: Student = JSON.parse(saved);
          if (parsed.collegeCode === code) setStudent(parsed);
        } catch {
          sessionStorage.removeItem("studentSession");
        }
      }
    }
    load();
  }, [code]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!college) return;
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber: rollInput,
          collegeId: college.id,
          collegeName: college.name,
          collegeCode: college.code,
          collegeColor: college.color,
          year: yearInput,
          department: deptInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStudent(data.student);
        sessionStorage.setItem("studentSession", JSON.stringify(data.student));
      } else {
        setLoginError(data.message);
      }
    } catch {
      setLoginError("Login service offline. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("studentSession");
    setStudent(null);
    router.push(`/${code}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center px-6 bg-slate-950 text-white">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Institution Not Found</h1>
        <p className="mt-2 text-slate-400">The campus code "{code}" does not exist.</p>
        <Link href="/" className="mt-6 text-indigo-400 hover:underline">← Back to Portal Home</Link>
      </div>
    );
  }

  const accentColor = college.color;

  if (!student) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center px-4 py-12 text-white overflow-hidden"
        style={{
          backgroundColor: "#060d1f",
          backgroundImage: `
            radial-gradient(circle at 50% -10%, ${accentColor}55, transparent 65%),
            radial-gradient(circle at 90% 80%, rgba(124,58,237,0.15), transparent 50%),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 36px 36px, 36px 36px",
        }}
      >
        <GraduationCap className="pointer-events-none absolute top-10 left-12 text-white/[0.04]" style={{ width: 150, height: 150, transform: "rotate(12deg)" }} />
        <BookOpen className="pointer-events-none absolute bottom-8 right-14 text-white/[0.04]" style={{ width: 130, height: 130, transform: "rotate(-8deg)" }} />

        <div className="relative w-full max-w-md">
          {/* Back */}
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Campus Selector
            </Link>
          </div>

          {/* Icon + Title */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 relative inline-block">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${accentColor} 0%, #7c3aed 100%)`,
                  boxShadow: `0 0 0 4px ${accentColor}20, 0 0 40px ${accentColor}40`,
                }}
              >
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
            </div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-3"
              style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40`, color: accentColor }}
            >
              <Sparkles className="h-3.5 w-3.5" /> {college.short_name} Student Gateway
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">{college.name}</h1>
            <p className="mt-1.5 text-sm text-slate-400">Sign in with your roll number to access personalized campus information</p>
          </div>

          {/* Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "rgba(15,23,60,0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 8px 60px -10px ${accentColor}30, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Roll Number */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Roll Number</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={rollInput}
                    onChange={(e) => setRollInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 24891A0548"
                    required
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white placeholder-slate-600 outline-none transition"
                    style={{ background: "rgba(15,23,42,0.8)", border: `1px solid ${accentColor}35` }}
                  />
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Year of Study</label>
                <div className="relative">
                  <select
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    required
                    className="w-full appearance-none rounded-xl py-3 pl-4 pr-10 text-sm outline-none transition"
                    style={{
                      background: "rgba(15,23,42,0.8)",
                      border: `1px solid ${accentColor}35`,
                      color: yearInput ? "#fff" : "#64748b",
                    }}
                  >
                    <option value="" disabled style={{ background: "#1e293b" }}>Select year...</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y} style={{ background: "#1e293b", color: "#fff" }}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Department</label>
                <div className="relative">
                  <select
                    value={deptInput}
                    onChange={(e) => setDeptInput(e.target.value)}
                    required
                    className="w-full appearance-none rounded-xl py-3 pl-4 pr-10 text-sm outline-none transition"
                    style={{
                      background: "rgba(15,23,42,0.8)",
                      border: `1px solid ${accentColor}35`,
                      color: deptInput ? "#fff" : "#64748b",
                    }}
                  >
                    <option value="" disabled style={{ background: "#1e293b" }}>Select department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} style={{ background: "#1e293b", color: "#fff" }}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs font-semibold text-red-400">{loginError}</div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50 mt-1"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)`, boxShadow: `0 4px 20px ${accentColor}40` }}
              >
                <GraduationCap className="h-4 w-4" />
                {loginLoading ? "Verifying..." : "Access Campus Portal"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Authenticated — render portal with session ribbon
  return (
    <div>
      {/* Session Bar */}
      <div style={{ background: accentColor }} className="px-6 py-2 text-white text-xs">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-white/70 animate-pulse" />
            <span className="font-mono font-bold tracking-wider">{student.rollNumber}</span>
            <span className="opacity-70">·</span>
            <span className="opacity-80">{student.department}</span>
            <span className="opacity-70">·</span>
            <span className="opacity-80">{student.year}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 opacity-80 hover:opacity-100 transition"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
