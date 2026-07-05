"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2, CalendarDays, BookOpen, Clock, MapPin, Layers, StickyNote,
} from "lucide-react";

interface Batch { id: string; name: string }

interface ExamSlot {
  id: string;
  exam_title: string;
  subject_id: string | null;
  batch_id: string;
  exam_date: string;
  start_time: string | null;
  venue: string | null;
  notes: string | null;
  subjects?: { name: string } | null;
  batches?: { name: string } | null;
}

export default function PublicExamSchedulePage() {
  const supabase = createClient();
  const [slots, setSlots]           = useState<ExamSlot[]>([]);
  const [batches, setBatches]       = useState<Batch[]>([]);
  const [filterBatch, setFilterBatch] = useState("all");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [{ data: batchData }, { data: slotData, error: slotErr }] = await Promise.all([
          supabase.from("batches").select("id, name").order("name"),
          supabase
            .from("exam_schedule")
            .select("*, subjects(name), batches(name)")
            .order("exam_date", { ascending: true })
            .order("start_time", { ascending: true }),
        ]);
        if (slotErr) throw slotErr;
        setBatches(batchData || []);
        const mapped = (slotData || []).map((s: any) => ({
          ...s,
          subjects: Array.isArray(s.subjects) ? s.subjects[0] : s.subjects,
          batches:  Array.isArray(s.batches)  ? s.batches[0]  : s.batches,
        }));
        setSlots(mapped);
      } catch (err: any) {
        setError(err.message || "পরীক্ষার সময়সূচী লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = filterBatch === "all"
    ? slots
    : slots.filter(s => s.batch_id === filterBatch);

  const upcoming = filtered.filter(s => new Date(s.exam_date) >= today);
  const past     = filtered.filter(s => new Date(s.exam_date) < today);

  // Group upcoming by exam_title
  const upcomingGrouped: Record<string, ExamSlot[]> = {};
  upcoming.forEach(s => {
    if (!upcomingGrouped[s.exam_title]) upcomingGrouped[s.exam_title] = [];
    upcomingGrouped[s.exam_title].push(s);
  });

  const getDaysLeft = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return { label: "আজ!", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
    if (diff === 1) return { label: "আগামীকাল", color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA" };
    if (diff <= 7)  return { label: `${diff} দিন বাকি`, color: "#CA8A04", bg: "#FEFCE8", border: "#FEF08A" };
    return { label: `${diff} দিন বাকি`, color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" };
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("bn-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const formatTime = (t: string | null) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    const ampm = h < 12 ? "AM" : "PM";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:py-12">
      <div className="space-y-8 text-left">

        {/* Header */}
        <div className="space-y-1 animate-fade-in-up">
          <h1 className="text-2xl font-black text-slate-800 font-sans">পরীক্ষার সময়সূচী</h1>
          <p className="text-slate-400 text-xs">
            কোন পরীক্ষা কখন, কোথায় — বিস্তারিত সময়সূচী দেখুন
          </p>
        </div>

        {/* Batch filter tabs */}
        {!loading && batches.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-fade-in-up stagger-1">
            <button
              onClick={() => setFilterBatch("all")}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
              style={filterBatch === "all"
                ? { background: "#3B6FA8", color: "#fff", boxShadow: "0 4px 16px rgba(59,111,168,0.3)" }
                : { background: "#fff", color: "#3B6FA8", border: "1.5px solid #3B6FA8" }}
            >
              <Layers className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              সকল ব্যাচ
            </button>
            {batches.map(b => (
              <button
                key={b.id}
                onClick={() => setFilterBatch(b.id)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                style={filterBatch === b.id
                  ? { background: "#3B6FA8", color: "#fff", boxShadow: "0 4px 16px rgba(59,111,168,0.3)" }
                  : { background: "#fff", color: "#3B6FA8", border: "1.5px solid #3B6FA8" }}
              >
                <Layers className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                {b.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 bg-white border border-slate-200/60 rounded-2xl shadow-xs">
            <Loader2 className="w-8 h-8 text-[#3B6FA8] animate-spin" />
            <p className="text-slate-400 text-xs">সময়সূচী লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl text-xs">
            {error}
          </div>
        ) : (
          <>
            {/* ── Upcoming ── */}
            <div className="space-y-6 animate-fade-in-up stagger-2">
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3B6FA8]" />
                আসন্ন পরীক্ষাসমূহ
                {upcoming.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#EFF6FF", color: "#3B6FA8" }}>
                    {upcoming.length}টি
                  </span>
                )}
              </h2>

              {Object.keys(upcomingGrouped).length === 0 ? (
                <div className="py-14 text-center text-slate-400 text-sm bg-white border border-slate-200/60 rounded-2xl shadow-xs">
                  এই ব্যাচের কোনো আসন্ন পরীক্ষা নেই।
                </div>
              ) : (
                Object.entries(upcomingGrouped).map(([examTitle, slotList]) => {
                  /* find the nearest date in this group */
                  const nearestDate = slotList.reduce((a, b) =>
                    a.exam_date < b.exam_date ? a : b
                  ).exam_date;
                  const badge = getDaysLeft(nearestDate);

                  return (
                    <div key={examTitle} className="bg-white border border-slate-200/50 rounded-2xl shadow-xs overflow-hidden animate-fade-in-up">
                      {/* Group header */}
                      <div className="flex items-center justify-between px-5 py-3.5"
                        style={{ background: "linear-gradient(135deg,#EFF6FF 0%,#DBEAFE 100%)", borderBottom: "1px solid #BFDBFE" }}>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-[#3B6FA8]" />
                          <h3 className="font-bold text-[#1E3A5F] text-sm">{examTitle}</h3>
                          {slotList[0].batches?.name && (
                            <span className="px-2 py-0.5 bg-white/70 text-[#3B6FA8] rounded-full text-[10px] font-semibold border border-blue-200">
                              {slotList[0].batches.name}
                            </span>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold"
                          style={{ background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}` }}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Subject rows */}
                      <div className="divide-y divide-slate-50">
                        {slotList.map((slot, i) => (
                          <div key={slot.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            {/* Subject name */}
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px]"
                                style={{ background: "#EFF6FF", color: "#3B6FA8" }}>
                                {i + 1}
                              </div>
                              <span className="font-semibold text-slate-800 text-sm">
                                {slot.subjects?.name || <span className="text-slate-400 italic font-normal text-xs">বিষয় উল্লেখ নেই</span>}
                              </span>
                            </div>

                            {/* Meta pills */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-9 sm:pl-0">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="w-3 h-3 text-slate-400" />
                                {formatDate(slot.exam_date)}
                              </span>
                              {slot.start_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {formatTime(slot.start_time)}
                                </span>
                              )}
                              {slot.venue && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {slot.venue}
                                </span>
                              )}
                              {slot.notes && (
                                <span className="flex items-center gap-1 italic text-slate-400">
                                  <StickyNote className="w-3 h-3" />
                                  {slot.notes}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Past ── */}
            {past.length > 0 && (
              <div className="space-y-4 animate-fade-in-up stagger-3">
                <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-300" />
                  সম্পন্ন পরীক্ষাসমূহ
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" }}>
                    {past.length}টি
                  </span>
                </h2>
                <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                          <th className="px-5 py-3.5">পরীক্ষা</th>
                          <th className="px-5 py-3.5">বিষয়</th>
                          <th className="px-5 py-3.5">তারিখ</th>
                          <th className="px-5 py-3.5">সময়</th>
                          <th className="px-5 py-3.5">স্থান</th>
                          <th className="px-5 py-3.5">ব্যাচ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {past.map(slot => (
                          <tr key={slot.id} className="text-slate-500 hover:bg-slate-50/40">
                            <td className="px-5 py-3 font-semibold text-slate-700">{slot.exam_title}</td>
                            <td className="px-5 py-3">{slot.subjects?.name || "—"}</td>
                            <td className="px-5 py-3">
                              {new Date(slot.exam_date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                            </td>
                            <td className="px-5 py-3">{formatTime(slot.start_time) || "—"}</td>
                            <td className="px-5 py-3">{slot.venue || "—"}</td>
                            <td className="px-5 py-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-semibold">
                                {slot.batches?.name || "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
