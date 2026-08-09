"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, ArrowLeft, Plus, Edit2, Trash2, Save, X, Sparkles, MapPin, Clock, ExternalLink } from "lucide-react";

type Event = {
  id: string;
  title: string;
  description: string;
  category: string;
  department: string;
  date: string;
  time: string;
  venue: string;
  registration_link?: string;
};

type College = {
  id: number;
  code: string;
  name: string;
  shortName: string;
  color: string;
};

export default function AdminEvents() {
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [department, setDepartment] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");

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
      fetchEvents(parsed.id);
    } catch {
      router.push("/admin");
    }
  }, [router]);

  async function fetchEvents(cId: number) {
    try {
      const response = await fetch(`/api/admin/events?collegeId=${cId}`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        setStatus(data.message || "Failed to load events.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!college) return;
    setStatus("");

    const ev = {
      id,
      title,
      description,
      category,
      department,
      date,
      time,
      venue,
      registration_link: registrationLink,
      collegeId: college.id,
    };

    try {
      const response = await fetch("/api/admin/events", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ev),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data.message);
        clearForm();
        await fetchEvents(college.id);
      } else {
        setStatus(data.message || "Operation failed.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong.");
    }
  }

  function editEvent(ev: Event) {
    setEditingId(ev.id);
    setId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description);
    setCategory(ev.category);
    setDepartment(ev.department);
    setDate(ev.date);
    setTime(ev.time);
    setVenue(ev.venue);
    setRegistrationLink(ev.registration_link || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteEvent(eId: string) {
    if (!college || !window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const response = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eId }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.message);
        await fetchEvents(college.id);
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
    setCategory("Technical");
    setDepartment("");
    setDate("");
    setTime("");
    setVenue("");
    setRegistrationLink("");
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
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Manage Events &amp; Fests</h1>
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
              {editingId ? "Edit Event Details" : "Schedule New Event"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Event ID</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. EVT-001"
                  required
                  disabled={editingId !== null}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter event title"
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
                  placeholder="Details of event scheduled..."
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
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Placement">Placement</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
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

              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Auditorium"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Registration Link (Optional)</label>
                <input
                  type="url"
                  value={registrationLink}
                  onChange={(e) => setRegistrationLink(e.target.value)}
                  placeholder="https://forms.gle/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-slate-400">Hosting Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. CSE Department"
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                />
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
                  {editingId ? "Update" : "Schedule"}
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
          <h2 className="text-lg font-bold mb-5">Scheduled Events ({events.length})</h2>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center text-slate-500">
              No events scheduled yet.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((ev) => (
                <div key={ev.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: accentColor }}>
                      {ev.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => editEvent(ev)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="p-1.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/30 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-100">{ev.title}</h3>
                  <p className="mt-1 text-sm text-slate-400 leading-relaxed">{ev.description}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-500" />{ev.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-500" />{ev.venue}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3 text-xs text-slate-500 font-mono">
                    <span>ID: {ev.id} · Dept: {ev.department}</span>
                    <span>{ev.date}</span>
                  </div>

                  {ev.registration_link && (
                    <a
                      href={ev.registration_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                      style={{ color: accentColor }}
                    >
                      Registration Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
