"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  Receipt,
  PlusCircle,
  TrendingUpIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface Summary {
  totalStudents: number;
  totalTeachers: number;
  totalFeesCollectedThisMonth: number;
  totalDuesThisMonth: number;
  totalExpensesThisMonth: number;
  netProfit: number;
}

interface BatchDistribution {
  name: string;
  শিক্ষার্থী: number;
}

interface Trend {
  name: string;
  আয়: number;
  ব্যয়: number;
}

interface Enrollment {
  id: string;
  student_name: string;
  amount_paid: number;
  enrollment_date: string;
  preparation_programs?: {
    program_name: string;
  };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [batchData, setBatchData] = useState<BatchDistribution[]>([]);
  const [trendData, setTrendData] = useState<Trend[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setSummary(data.summary);
        setBatchData(data.batchDistribution);
        setTrendData(data.monthlyTrend);
        setRecentEnrollments(data.recentEnrollments);
      } catch (err: any) {
        setError(err.message || "পরিসংখ্যান লোড করতে ব্যর্থ হয়েছে।");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">ড্যাশবোর্ড তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex flex-col gap-3">
        <h3 className="font-bold text-lg">ত্রুটি দেখা দিয়েছে!</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 w-fit px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all cursor-pointer"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "মোট শিক্ষার্থী",
      value: summary?.totalStudents || 0,
      icon: Users,
      color: "bg-teal-50 text-teal-600 border-teal-200/50",
      prefix: "",
      suffix: " জন",
    },
    {
      title: "মোট শিক্ষক",
      value: summary?.totalTeachers || 0,
      icon: GraduationCap,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200/50",
      prefix: "",
      suffix: " জন",
    },
    {
      title: "চলতি মাসের কালেকশন",
      value: summary?.totalFeesCollectedThisMonth || 0,
      icon: CircleDollarSign,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
      prefix: "৳ ",
      suffix: "",
    },
    {
      title: "চলতি মাসের বকেয়া ফিস",
      value: summary?.totalDuesThisMonth || 0,
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600 border-amber-200/50",
      prefix: "৳ ",
      suffix: "",
    },
    {
      title: "চলতি মাসের মোট খরচ",
      value: summary?.totalExpensesThisMonth || 0,
      icon: TrendingDown,
      color: "bg-rose-50 text-rose-600 border-rose-200/50",
      prefix: "৳ ",
      suffix: "",
    },
    {
      title: "নিট লাভ/ক্ষতি",
      value: summary?.netProfit || 0,
      icon: summary?.netProfit && summary.netProfit >= 0 ? TrendingUp : TrendingDown,
      color:
        summary?.netProfit && summary.netProfit >= 0
          ? "bg-emerald-100 text-emerald-700 border-emerald-200/70"
          : "bg-rose-100 text-rose-700 border-rose-200/70",
      prefix: "৳ ",
      suffix: "",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl shadow-md border border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-sans">
            স্বাগতম, সুপার অ্যাডমিন!
          </h1>
          <p className="text-slate-350 text-xs md:text-sm mt-1">
            কোচিং সেন্টারের সমস্ত কার্যক্রম ও আর্থিক হিসাব এখান থেকে পরিচালনা করুন।
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/students"
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-500/10 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন শিক্ষার্থী</span>
          </Link>
          <Link
            href="/admin/finance/fees"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
          >
            <Receipt className="w-4 h-4" />
            <span>ফি গ্রহণ করুন</span>
          </Link>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`flex items-center justify-between p-6 bg-white border rounded-2xl shadow-xs transition-all hover:shadow-md hover:scale-[1.01]`}
            >
              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {card.prefix}
                  {card.value.toLocaleString("bn-BD")}
                  {card.suffix}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${card.color}`}>
                <Icon className="w-6 h-6 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income vs Expenses trend */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs">
          <h3 className="text-slate-800 font-bold text-base mb-6 font-sans">
            আর্থিক গতিবিধি (আয় বনাম ব্যয়)
          </h3>
          <div className="h-80 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                      color: "white",
                      border: "none",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="আয়"
                    stroke="#10b981"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="ব্যয়" stroke="#f43f5e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                পর্যাপ্ত তথ্য নেই
              </div>
            )}
          </div>
        </div>

        {/* Batch wise Student Distribution */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs">
          <h3 className="text-slate-800 font-bold text-base mb-6 font-sans">
            ব্যাচভিত্তিক শিক্ষার্থী সংখ্যা
          </h3>
          <div className="h-80 w-full">
            {batchData.length > 0 && batchData.some((b) => b.শিক্ষার্থী > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "12px",
                      color: "white",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="শিক্ষার্থী" fill="#0d9488" radius={[8, 8, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                কোন ব্যাচে এখনও কোনো শিক্ষার্থী ভর্তি করা হয়নি
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity / Preparation Program Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Prep Program Enrollments */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-800 font-bold text-base font-sans">
              প্রস্তুতি প্রোগ্রাম রিসেন্ট ভর্তি
            </h3>
            <Link
              href="/preparation-program"
              className="flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-bold transition-colors"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {recentEnrollments.length > 0 ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 text-left">নাম</th>
                    <th className="pb-3 text-left">প্রোগ্রাম</th>
                    <th className="pb-3 text-left">ভর্তি ফি</th>
                    <th className="pb-3 text-left">তারিখ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="text-slate-700 hover:bg-slate-50/50">
                      <td className="py-3 font-medium text-slate-900 text-left">
                        {enrollment.student_name}
                      </td>
                      <td className="py-3 text-slate-500 text-left">
                        {enrollment.preparation_programs?.program_name || "প্রস্তুতি প্রোগ্রাম"}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 text-left">
                        ৳ {Number(enrollment.amount_paid).toLocaleString("bn-BD")}
                      </td>
                      <td className="py-3 text-slate-500 text-left">
                        {new Date(enrollment.enrollment_date).toLocaleDateString("bn-BD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                প্রস্তুতি প্রোগ্রামে এখনও কোনো শিক্ষার্থী ভর্তি হয়নি।
              </div>
            )}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="text-slate-800 font-bold text-base font-sans">
            কুইক একশন
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/batches"
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200/50 hover:border-teal-200 text-slate-700 hover:text-teal-800 transition-all group"
            >
              <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-teal-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold">নতুন ব্যাচ তৈরি</p>
                <p className="text-[10px] text-slate-400">সময় ও ধারণক্ষমতা ঠিক করুন</p>
              </div>
            </Link>

            <Link
              href="/subjects"
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200/50 hover:border-teal-200 text-slate-700 hover:text-teal-800 transition-all group"
            >
              <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-teal-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold">নতুন বিষয় যোগ</p>
                <p className="text-[10px] text-slate-400">বিষয় তৈরি ও শিক্ষক নিয়োগ দিন</p>
              </div>
            </Link>

            <Link
              href="/exams"
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200/50 hover:border-teal-200 text-slate-700 hover:text-teal-800 transition-all group"
            >
              <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-teal-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold">পরীক্ষা ও রেজাল্ট</p>
                <p className="text-[10px] text-slate-400">পরীক্ষা নিয়ে নম্বর ইনপুট করুন</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
