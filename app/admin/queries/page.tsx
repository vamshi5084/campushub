"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Send, CheckCircle2, Clock, Calendar, ShieldAlert } from "lucide-react";

type Query = {
  id: string;
  student_roll: string;
  name: string;
  department: string;
  message: string;
  answer: string | null;
  answered: boolean;
  created_at: number;
};

type College = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  color: string;
};

export default function AdminQueries() {
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);

  const [queries, setQueries] = useState<Query[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loggedIn = sessionStorage.getItem("adminLoggedIn");
    const savedCollege = sessionStorage.getItem("adminCollege");

    if (loggedIn !== "true" || !savedCollege) {
      router.push("/admin");
      return;
    }

    try {
      const parsed = JSON.parse(savedCollege);
      setCollege(parsed);
      loadQueries(parsed.id);
    } catch {
      router.push("/admin");
    }
  }, [router]);

  async function loadQueries(cId: number) {
    try {
      const response = await fetch(`/api/admin/queries?collegeId=${cId}`);
      const data = await response.json();

      if (data.success) {
        setQueries(data.queries);
        const existingAnswers: Record<string, string> = {};
        data.queries.forEach((query: Query) => {
          existingAnswers[query.id] = query.answer || "";
        });
        setAnswers(existingAnswers);
      } else {
        setMessage(data.message || "Failed to load queries.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load student queries.");
    } finally {
      setLoading(false);
    }
  }

  function handleAnswerChange(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>, queryId: string) {
    event.preventDefault();
    if (!college) return;
    const answer = answers[queryId]?.trim();

    if (!answer) {
      setMessage("Please enter an answer.");
      return;
    }

    setSaving(queryId);
    setMessage("");

    try {
      const response = await fetch("/api/admin/queries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: queryId, answer }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Answer submitted successfully.");
        await loadQueries(college.id);
      } else {
        setMessage(data.message || "Failed to save answer.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while saving the answer.");
    } finally {
      setSaving(null);
    }
  }

  function formatDate(timestamp: number) {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleString();
  }

  if (loading || !college) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const accentColor = college.color;

  return (
    <div className="min-h-screen pb-16 bg-slate-900 text-white">
      {/* Top Banner */}
      <section
        className="relative overflow-hidden pt-12 pb-10 border-b border-slate-800"
        style={{
          backgroundImage: `radial-gradient(circle at 50% -10%, ${accentColor}35, transparent 65%)`,
        }}
      >
        <div className="mx-auto max-w-4xl px-6">
          <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: accentColor }}>
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Student Queries</h1>
              <p className="text-sm text-slate-400">{college.name}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 pt-8">
        {message && (
          <div className="mb-6 rounded-2xl bg-slate-950 border border-slate-800 p-4 text-sm font-medium text-slate-300">
            {message}
          </div>
        )}

        {queries.length === 0 ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-950 p-12 text-center text-slate-500">
            <ShieldAlert className="mx-auto h-12 w-12 text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-200">No student queries</h3>
            <p className="mt-1 text-sm">There are currently no queries submitted by students.</p>
          </section>
        ) : (
          <section className="space-y-6">
            {queries.map((query) => (
              <article key={query.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">ID: {query.id}</span>
                  </div>
                  <div>
                    {query.answered ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Answered
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 animate-pulse">
                        <Clock className="h-3 w-3" /> Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-5 text-sm">
                  <div>
                    <span className="block text-xs font-bold uppercase text-slate-500 mb-0.5">Roll Number</span>
                    <span className="font-mono font-bold text-slate-300">{query.student_roll}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase text-slate-500 mb-0.5">Student Name</span>
                    <span className="font-bold text-slate-300">{query.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase text-slate-500 mb-0.5">Department/Subject</span>
                    <span className="font-bold text-slate-300">{query.department}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase text-slate-500 mb-0.5">Submitted At</span>
                    <span className="font-medium text-slate-400">{formatDate(query.created_at)}</span>
                  </div>
                </div>

                {/* Question body */}
                <div className="rounded-2xl bg-slate-900 border border-slate-900 p-4 mb-5">
                  <span className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Query Message</span>
                  <p className="text-slate-300 leading-relaxed text-sm">{query.message}</p>
                </div>

                {/* Answer form */}
                <form onSubmit={(e) => handleSubmit(e, query.id)} className="space-y-3">
                  <label htmlFor={`answer-${query.id}`} className="block text-xs font-bold uppercase text-slate-400">
                    Administrative Reply
                  </label>
                  <textarea
                    id={`answer-${query.id}`}
                    value={answers[query.id] || ""}
                    onChange={(e) => handleAnswerChange(query.id, e.target.value)}
                    rows={3}
                    placeholder="Provide a reply to resolve this query..."
                    required
                    className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={saving === query.id}
                    className="flex items-center gap-1.5 rounded-xl py-2.5 px-5 text-sm font-bold text-white transition disabled:opacity-50"
                    style={{ background: accentColor }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {saving === query.id ? "Submitting..." : query.answered ? "Update Answer" : "Submit Answer"}
                  </button>
                </form>

                {query.answered && query.answer && (
                  <div className="mt-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
                    <span className="block text-xs font-bold uppercase text-emerald-400 mb-1">Active Answer</span>
                    <p className="text-sm text-emerald-300/90 leading-relaxed">{query.answer}</p>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
