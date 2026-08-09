"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, ArrowLeft, Plus, Edit2, Trash2, Save, X, Sparkles } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  date: string;
  urgent: boolean;
};

type College = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  color: string;
};

export default function AdminAnnouncements() {
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Academic");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [urgent, setUrgent] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

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
      fetchAnnouncements(parsed.id);
    } catch {
      router.push("/admin");
    }
  }, [router]);

  async function fetchAnnouncements(cId: number) {
    try {
      const response = await fetch(`/api/admin/announcements?collegeId=${cId}`);
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        setStatus(data.message || "Failed to load announcements.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!college) return;
    setStatus("");

    const announcement = {
      id,
      title,
      description,
      category,
      department,
      date,
      urgent,
      collegeId: college.id,
    };

    try {
      const response = await fetch("/api/admin/announcements", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(announcement),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.message);
        clearForm();
        await fetchAnnouncements(college.id);
      } else {
        setStatus(data.message || "Operation failed.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong.");
    }
  }

  function editAnnouncement(announcement: Announcement) {
    setEditingId(announcement.id);
    setId(announcement.id);
    setTitle(announcement.title);
    setDescription(announcement.description);
    setCategory(announcement.category);
    setDepartment(announcement.department);
    setDate(announcement.date);
    setUrgent(announcement.urgent);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteAnnouncement(aId: string) {
    if (!college || !window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: aId }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.message);
        await fetchAnnouncements(college.id);
      } else {
        setStatus(data.message || "Failed to delete.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Failed to delete.");
    }
  }

  function clearForm() {
    setEditingId(null);
    setId("");
    setTitle("");
    setDescription("");
    setCategory("Academic");
    setDepartment("");
    setDate("");
    setUrgent(false);
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
        <div className="mx-auto max-w-6xl px-6">
          <Link href="/admin/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: accentColor }}>
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Manage Announcements</h1>
              <p className="text-sm text-slate-400">{college.name}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pt-10 grid gap-8 lg:grid-cols-5">
        {/* Editor Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
              {editingId ? "Edit Announcement" : "Create Announcement"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Announcement ID</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. ANN-001"
                  required
                  disabled={editingId !== null}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notice title"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Details of the announcement..."
                  required
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Placement">Placement</option>
                    <option value="Exam">Exam</option>
                    <option value="Finance">Finance</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Publishing Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Examination Cell"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="urgent" className="text-sm font-semibold select-none cursor-pointer">
                  Mark as urgent announcement
                </label>
              </div>

              {status && (
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 text-xs font-medium text-slate-300">
                  {status}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white transition"
                  style={{ background: accentColor }}
                >
                  <Save className="h-4 w-4" />
                  {editingId ? "Update" : "Publish"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700 px-4 text-slate-400 hover:text-white transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Existing Listings */}
        <div className="lg:col-span-3">
          <h2 className="text-lg font-bold mb-5">Existing Announcements ({announcements.length})</h2>

          {announcements.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center text-slate-500">
              No announcements published yet.
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <div className="flex gap-2">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: accentColor }}>
                        {ann.category}
                      </span>
                      {ann.urgent && (
                        <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => editAnnouncement(ann)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAnnouncement(ann.id)}
                        className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-100">{ann.title}</h3>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{ann.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3 text-xs text-slate-500 font-mono">
                    <span>ID: {ann.id} · Dept: {ann.department}</span>
                    <span>{ann.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
