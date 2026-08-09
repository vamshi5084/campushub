"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { GraduationCap, User, ArrowLeft, ShieldAlert, Sparkles, LogOut, BookOpen, Clock } from "lucide-react";

type College = { id: number; code: string; name: string; short_name: string; color: string };
type Student = { rollNumber: string; collegeId: number; collegeName: string; collegeCode: string; collegeColor: string };

const FALLBACK_COLLEGES: College[] = [
  { id: 1, code: "vignan", name: "Vignan Institute of Technology and Science", short_name: "VITS", color: "#6366f1" },
  { id: 2, code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short_name: "CBIT", color: "#0ea5e9" },
  { id: 3, code: "anurag", name: "Anurag University",                          short_name: "AU",   color: "#10b981" },
];

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const code = String(params.collegeCode);

  const [college, setCollege] = useState<College | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [rollInput, setRollInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cRes = await fetch("/api/colleges");
        const cData = await cRes.json();
        const list: College[] = (cData.success && Array.isArray(cData.colleges) && cData.colleges.length > 0)
          ? cData.colleges
          : FALLBACK_COLLEGES;
        
        const found = list.find((c) => c.code === code) || null;
        setCollege(found);
      } catch {
        setCollege(FALLBACK_COLLEGES.find((c) => c.code === code) || null);
      } finally {
        setLoading(false);
      }

      // Check session
      const saved = sessionStorage.getItem("studentSession");
      if (saved) {
        try {
          const parsed: Student = JSON.parse(saved);
          if (parsed.collegeCode === code) {
            setStudent(parsed);
          }
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
      setLoginError("Login service offline. Please try again later.");
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
        <h1 className="text-2xl font-bold">Institution Not Configured</h1>
        <p className="mt-2 text-slate-400">The requested campus code "{code}" does not exist in our directory.</p>
        <Link href="/" className="mt-6 text-indigo-400 hover:underline">← Back to Portal Home</Link>
      </div>
    );
  }

  const accentColor = college.color;

  // Render Login Gate if not authenticated
  if (!student) {
    return (
      <main
        className="relative flex min-h-screen items-center justify-center px-4 py-12 text-white overflow-hidden"
        style={{
          backgroundColor: "#060d1f",
          backgroundImage: `
            radial-gradient(circle at 50% -10%, ${accentColor}55, transparent 65%),
            radial-gradient(circle at 90% 80%, rgba(124, 58, 237, 0.15), transparent 50%),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 36px 36px, 36px 36px",
        }}
      >
        <GraduationCap className="pointer-events-none absolute top-10 left-12 text-white/[0.04]" style={{ width: 140, height: 140, transform: "rotate(12deg)" }} />
        <BookOpen className="pointer-events-none absolute bottom-8 right-14 text-white/[0.04]" style={{ width: 120, height: 120, transform: "rotate(-8deg)" }} />

        <div className="relative w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Return to Campus Selector
            </Link>

            <div className="mx-auto mt-4 mb-4 relative inline-block">
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
              style={{
                background: `${accentColor}18`,
                border: `1px solid ${accentColor}40`,
                color: accentColor,
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {college.short_name} Student Gateway
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">{college.name}</h1>
          </div>

          {/* Login Card */}
          <div
            className="rounded-3xl p-8"
            style={{
              background: "rgba(15, 23, 60, 0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 8px 60px -10px ${accentColor}30, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Student Roll Number
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={rollInput}
                    onChange={(e) => setRollInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 24891A0548"
                    required
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-mono text-white placeholder-slate-600 outline-none transition"
                    style={{
                      background: "rgba(15,23,42,0.8)",
                      border: `1px solid ${accentColor}35`,
                    }}
                  />
                </div>
                <span className="mt-2 block text-[11px] text-slate-500 leading-normal">
                  Enter your official university Roll Number to unlock access to announcements, campus events, and student desks.
                </span>
              </div>

              {loginError && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #7c3aed)`,
                  boxShadow: `0 4px 20px ${accentColor}40`,
                }}
              >
                <GraduationCap className="h-4 w-4" />
                {loginLoading ? "Verifying Roll..." : "Unlock Portal Access"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Once student session is present, show header + student details + children pages
  return (
    <div>
      {/* Top Session Ribbon */}
      <div className="bg-slate-950 border-b border-slate-900 px-6 py-2.5 text-white text-xs">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Signed in as student:</span>
            <span className="font-mono font-bold text-white">{student.rollNumber}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition"
          >
            <LogOut className="h-3 w-3 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
