"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, KeyRound, ShieldCheck, ArrowLeft, GraduationCap, BookOpen, ChevronDown } from "lucide-react";

const COLLEGES = [
  { code: "vignan", name: "Vignan Institute of Technology and Science", short: "VITS", color: "#6366f1" },
  { code: "cbit",   name: "Chaitanya Bharathi Institute of Technology", short: "CBIT", color: "#0ea5e9" },
  { code: "anurag", name: "Anurag University",                          short: "AU",   color: "#10b981" },
];

export default function AdminLogin() {
  const router = useRouter();
  const [collegeCode, setCollegeCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCollege = COLLEGES.find((c) => c.code === collegeCode);
  const accentColor = selectedCollege?.color || "#6366f1";

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!collegeCode) { setMessage("Please select your college."); return; }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, collegeCode }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("adminLoggedIn", "true");
        sessionStorage.setItem("adminCollege", JSON.stringify(data.college));
        router.push("/admin/dashboard");
      } else {
        setMessage(data.message || "Invalid credentials");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-4 py-12 text-white overflow-hidden"
      style={{
        backgroundColor: "#060d1f",
        backgroundImage: `
          radial-gradient(circle at 50% -10%, ${accentColor}55, transparent 65%),
          radial-gradient(circle at 90% 80%, rgba(124,58,237,0.18), transparent 50%),
          linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 100%, 36px 36px, 36px 36px",
        transition: "background-image 0.5s ease",
      }}
    >
      <div className="pointer-events-none absolute -top-48 -left-48 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: `${accentColor}25` }} />
      <div className="pointer-events-none absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.14)" }} />

      <GraduationCap className="pointer-events-none absolute top-8 left-10 text-white/[0.05]" style={{ width: 140, height: 140, transform: "rotate(15deg)" }} />
      <BookOpen className="pointer-events-none absolute bottom-10 right-12 text-white/[0.05]" style={{ width: 130, height: 130, transform: "rotate(-10deg)" }} />

      <div className="relative w-full max-w-md">
        {/* Badge */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 relative inline-block">
            <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)`, boxShadow: `0 0 0 4px ${accentColor}30, 0 0 40px ${accentColor}50` }}>
              <ShieldCheck className="h-9 w-9 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full border border-white/20 animate-spin" style={{ animationDuration: "8s", margin: "-6px" }} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md text-white/80">
            <GraduationCap className="h-3.5 w-3.5" /> CampusHub Administration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="mt-2 text-sm text-slate-400">Authorized staff only. Sign in to manage your college.</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: "rgba(15,23,60,0.7)", backdropFilter: "blur(24px)", border: `1px solid ${accentColor}30`, boxShadow: `0 8px 60px -10px ${accentColor}40, inset 0 1px 0 rgba(255,255,255,0.05)` }}>
          <div className="mb-6 h-0.5 w-full rounded-full" style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />

          <form onSubmit={handleLogin} className="space-y-5">
            {/* College Select */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Select Your College</label>
              <div className="relative">
                <select
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  required
                  className="w-full appearance-none rounded-xl py-3 pl-4 pr-10 text-sm outline-none transition"
                  style={{ background: "rgba(15,23,42,0.8)", border: `1px solid ${accentColor}40`, color: collegeCode ? "#fff" : "#94a3b8" }}
                >
                  <option value="" disabled>Choose college...</option>
                  {COLLEGES.map((c) => (
                    <option key={c.code} value={c.code} style={{ background: "#1e293b", color: "#fff" }}>
                      {c.short} — {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-500" />
              </div>
              {selectedCollege && (
                <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: accentColor }}>
                  <div className="h-2 w-2 rounded-full" style={{ background: accentColor }} />
                  {selectedCollege.name}
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: accentColor }} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition"
                  style={{ background: "rgba(15,23,42,0.8)", border: `1px solid ${accentColor}30` }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4" style={{ color: accentColor }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition"
                  style={{ background: "rgba(15,23,42,0.8)", border: `1px solid ${accentColor}30` }} />
              </div>
            </div>

            {message && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-medium text-red-400">{message}</div>
            )}

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)`, boxShadow: `0 4px 20px ${accentColor}50` }}>
              <Lock className="h-4 w-4" />
              {loading ? "Authenticating..." : "Sign In to Control Panel"}
            </button>
          </form>

          <div className="mt-6 h-0.5 w-full rounded-full" style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }} />
        </div>

        <div className="mt-4 text-center text-xs text-slate-600">🔒 Secured · Unauthorized access is prohibited</div>
        <div className="mt-4 text-center">
          <button onClick={() => router.push("/")} className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Return to College Selector
          </button>
        </div>
      </div>
    </main>
  );
}
