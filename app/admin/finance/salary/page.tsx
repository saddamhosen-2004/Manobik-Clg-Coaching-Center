"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Coins,
  GraduationCap,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  monthly_salary: number;
}

interface SalaryRecord {
  id: string;
  teacher_id: string;
  month: string;
  year: number;
  amount: number;
  paid_date: string;
  teachers?: {
    name: string;
    monthly_salary: number;
  } | null;
}

export default function SalaryPage() {
  const supabase = createClient();

  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [month, setMonth] = useState("জানুয়ারি");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState("");
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [salaryToDelete, setSalaryToDelete] = useState<SalaryRecord | null>(null);

  const banglaMonths = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch salaries join teachers
      const { data: salData, error: salErr } = await supabase
        .from("teacher_salaries")
        .select(`
          id,
          teacher_id,
          month,
          year,
          amount,
          paid_date,
          teachers (
            name,
            monthly_salary
          )
        `)
        .order("created_at", { ascending: false });

      if (salErr) throw salErr;

      // 2. Fetch all teachers for selection
      const { data: teachData, error: teachErr } = await supabase
        .from("teachers")
        .select("id, name, monthly_salary")
        .order("name", { ascending: true });

      if (teachErr) throw teachErr;

      const mappedSalaries = (salData || []).map((sal: any) => ({
        id: sal.id,
        teacher_id: sal.teacher_id,
        month: sal.month,
        year: sal.year,
        amount: sal.amount,
        paid_date: sal.paid_date,
        teachers: Array.isArray(sal.teachers) ? sal.teachers[0] : sal.teachers,
      }));

      setSalaries(mappedSalaries);
      setTeachers(teachData || []);
    } catch (err: any) {
      setError(err.message || "বেতন বিবরণী লোড করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Autofill monthly salary when teacher selection changes
  useEffect(() => {
    if (selectedTeacherId) {
      const teacher = teachers.find((t) => t.id === selectedTeacherId);
      if (teacher) {
        setAmount(teacher.monthly_salary.toString());
      }
    } else {
      setAmount("");
    }
  }, [selectedTeacherId, teachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!selectedTeacherId || !month || !year || !amount || !paidDate) {
      setError("অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        teacher_id: selectedTeacherId,
        month,
        year: parseInt(year),
        amount: parseFloat(amount),
        paid_date: paidDate,
      };

      const { error: insertErr } = await supabase
        .from("teacher_salaries")
        .insert([payload]);

      if (insertErr) throw insertErr;

      setSuccess("বেতন প্রদান সফলভাবে সংরক্ষিত হয়েছে।");
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "সংরক্ষণ করতে সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (record: SalaryRecord) => {
    setSalaryToDelete(record);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!salaryToDelete) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: deleteErr } = await supabase
        .from("teacher_salaries")
        .delete()
        .eq("id", salaryToDelete.id);

      if (deleteErr) throw deleteErr;

      setSuccess("রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে।");
      setDeleteConfirmOpen(false);
      setSalaryToDelete(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || "রেকর্ড মুছতে সমস্যা হয়েছে।");
      setDeleteConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm">শিক্ষকগণের বেতন প্রদানের খতিয়ান ও নতুন বিবরণ রেকর্ড প্যানেল</p>
        </div>
        <button
          onClick={() => {
            setSelectedTeacherId("");
            setError(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>বেতন পরিশোধ করুন</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Salary table card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">বেতন বিবরণী লোড হচ্ছে...</p>
          </div>
        ) : salaries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-500 font-semibold">
                  <th className="px-6 py-4">পদক্ষেপ</th>
                  <th className="px-6 py-4">পরিশোধের তারিখ</th>
                  <th className="px-6 py-4">টাকার পরিমাণ</th>
                  <th className="px-6 py-4">মাস ও বছর</th>
                  <th className="px-6 py-4">শিক্ষকের নাম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaries.map((sal) => (
                  <tr key={sal.id} className="text-slate-700 hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => confirmDelete(sal)}
                        className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sal.paid_date).toLocaleDateString("bn-BD")}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ৳ {Number(sal.amount).toLocaleString("bn-BD")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-teal-50 border border-teal-100 text-teal-700 rounded-lg text-xs font-semibold">
                        {sal.month} {sal.year.toString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{sal.teachers?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-sm">
            বেতন প্রদানের কোনো ইতিহাস পাওয়া যায়নি।
          </div>
        )}
      </div>

      {/* Payment Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between h-14 px-6 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-teal-600" />
                <span>বেতন পরিশোধ ফরম</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                  শিক্ষক নির্বাচন করুন
                </label>
                <select
                  value={selectedTeacherId}
                  required
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-xs"
                >
                  <option value="">-- শিক্ষক নির্বাচন করুন --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} (বেতন: ৳{teacher.monthly_salary})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    পরিশোধের মাস
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-xs"
                  >
                    {banglaMonths.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    বছর
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-xs"
                  >
                    <option value={new Date().getFullYear() - 1}>
                      {(new Date().getFullYear() - 1).toString()}
                    </option>
                    <option value={new Date().getFullYear()}>
                      {new Date().getFullYear().toString()}
                    </option>
                    <option value={new Date().getFullYear() + 1}>
                      {(new Date().getFullYear() + 1).toString()}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    বেতনের পরিমাণ (৳)
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="বেতন পরিমাণ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-xs font-semibold mb-1.5">
                    পরিশোধের তারিখ
                  </label>
                  <input
                    type="date"
                    required
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/70 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>বেতন পরিশোধ সম্পন্ন</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mb-2">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                আপনি কি নিশ্চিত মুছে ফেলতে চান?
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed text-center font-sans">
                আপনি কি নিশ্চিতভাবে এই বেতন পরিশোধের রেকর্ডটি মুছে ফেলতে চান? ডাটাবেজ থেকে এর সমস্ত বিবরণ স্থায়ীভাবে মুছে যাবে।
              </p>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                না, বাতিল
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {submitting ? "মুছা হচ্ছে..." : "হ্যাঁ, মুছে ফেলুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
