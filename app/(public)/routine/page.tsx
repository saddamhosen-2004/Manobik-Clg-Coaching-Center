"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Calendar, Clock, BookOpen, User, Layers } from "lucide-react";

interface Routine {
  id: string;
  batch_id: string;
  day_of_week: string;
  time: string;
  subject_id: string;
  teacher_id: string;
  batches?: {
    name: string;
  } | null;
  subjects?: {
    name: string;
  } | null;
  teachers?: {
    name: string;
  } | null;
}

interface Batch {
  id: string;
  name: string;
}

export default function PublicRoutinePage() {
  const supabase = createClient();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const daysOfWeek = [
    "শনিবার",
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch routines
      const { data: routineData, error: routineErr } = await supabase
        .from("routines")
        .select(`
          id,
          batch_id,
          day_of_week,
          time,
          subject_id,
          teacher_id,
          batches ( name ),
          subjects ( name ),
          teachers ( name )
        `);

      if (routineErr) throw routineErr;

      // 2. Fetch batches
      const { data: batchData, error: batchErr } = await supabase
        .from("batches")
        .select("id, name")
        .order("name", { ascending: true });

      if (batchErr) throw batchErr;

      const mappedRoutines = (routineData || []).map((r: any) => ({
        id: r.id,
        batch_id: r.batch_id,
        day_of_week: r.day_of_week,
        time: r.time,
        subject_id: r.subject_id,
        teacher_id: r.teacher_id,
        batches: Array.isArray(r.batches) ? r.batches[0] : r.batches,
        subjects: Array.isArray(r.subjects) ? r.subjects[0] : r.subjects,
        teachers: Array.isArray(r.teachers) ? r.teachers[0] : r.teachers,
      }));

      setRoutines(mappedRoutines);
      setBatches(batchData || []);
      
      if (batchData && batchData.length > 0) {
        setSelectedBatchId(batchData[0].id);
      }
    } catch (err: any) {
      setError(err.message || "রুটিন লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter routines by selected batch
  const filteredRoutines = routines.filter((r) => r.batch_id === selectedBatchId);

  // Group routines by day of the week
  const getRoutinesForDay = (day: string) => {
    return filteredRoutines.filter(
      (r) => r.day_of_week.trim() === day.trim()
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:py-12">
    <div className="space-y-8 text-left font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-800">ক্লাস রুটিন</h1>
        <p className="text-slate-400 text-xs mt-1">ব্যাচভিত্তিক সাপ্তাহিক ক্লাসের সময়সূচী</p>
      </div>

      {/* Batch selector tabs */}
      {batches.length > 0 && (
        <div className="flex flex-wrap items-center justify-start gap-2 border-b border-slate-200 pb-4">
          {batches.map((batch) => (
            <button
              key={batch.id}
              onClick={() => setSelectedBatchId(batch.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                selectedBatchId === batch.id
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/10"
                  : "bg-white hover:bg-slate-50 border border-slate-200 text-slate-600"
              }`}
            >
              {batch.name}
            </button>
          ))}
        </div>
      )}

      {/* Routine Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 bg-white border border-slate-200/60 rounded-2xl shadow-xs">
          <Loader2 className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs">রুটিন লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl text-xs">
          {error}
        </div>
      ) : selectedBatchId ? (
        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const dayRoutines = getRoutinesForDay(day);
            return (
              <div
                key={day}
                className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Day Header */}
                <div className="flex items-center justify-start gap-2 md:w-40 shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-600">
                    <Calendar className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{day}</span>
                </div>

                {/* Day Classes Schedule list */}
                <div className="flex-1">
                  {dayRoutines.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {dayRoutines.map((routine) => (
                        <div
                          key={routine.id}
                          className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 space-y-2 text-left"
                        >
                          <div className="flex items-center justify-start gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="font-semibold">{routine.time}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {routine.subjects?.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 flex items-center justify-start gap-1">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>শিক্ষক: {routine.teachers?.name || "নিযুক্ত নেই"}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic py-2 md:text-left">এই দিনে কোনো ক্লাস নেই</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400 text-sm bg-white border border-slate-200/60 rounded-2xl shadow-xs">
          রুটিন দেখার জন্য আগে অ্যাডমিন প্যানেলে ব্যাচ তৈরি করুন।
        </div>
      )}
    </div>
    </div>
  );
}
