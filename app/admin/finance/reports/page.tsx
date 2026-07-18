"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Printer,
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";

interface ReportData {
  regularFees: number;
  prepFees: number;
  totalIncome: number;
  teacherSalaries: number;
  otherExpenses: number;
  totalExpense: number;
  netProfit: boolean; // true = profit, false = loss
  amountProfitLoss: number;
}

export default function ReportsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState("সকল মাস");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Data state
  const [report, setReport] = useState<ReportData>({
    regularFees: 0,
    prepFees: 0,
    totalIncome: 0,
    teacherSalaries: 0,
    otherExpenses: 0,
    totalExpense: 0,
    netProfit: true,
    amountProfitLoss: 0,
  });

  const banglaMonths = [
    "সকল মাস",
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

  // Mapping of Bangla month names to JavaScript month index (0-11) for filtering ISO date ranges
  const monthMap: Record<string, number> = {
    "জানুয়ারি": 0,
    "ফেব্রুয়ারি": 1,
    "মার্চ": 2,
    "এপ্রিল": 3,
    "মে": 4,
    "জুন": 5,
    "জুলাই": 6,
    "আগস্ট": 7,
    "সেপ্টেম্বর": 8,
    "অক্টোবর": 9,
    "নভেম্বর": 10,
    "ডিসেম্বর": 11,
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const yearInt = parseInt(selectedYear);
      
      // Determine date ranges for ISO strings (expenses, prep enrollments)
      let startDateStr = `${yearInt}-01-01`;
      let endDateStr = `${yearInt}-12-31`;

      if (selectedMonth !== "সকল মাস") {
        const monthIdx = monthMap[selectedMonth];
        const start = new Date(yearInt, monthIdx, 1);
        const end = new Date(yearInt, monthIdx + 1, 0);
        startDateStr = start.toISOString().split("T")[0];
        endDateStr = end.toISOString().split("T")[0];
      }

      // 1. Fetch Regular Fees
      let feesQuery = supabase.from("fee_collections").select("amount");
      if (selectedMonth !== "সকল মাস") {
        feesQuery = feesQuery.eq("month", selectedMonth).eq("year", yearInt);
      } else {
        feesQuery = feesQuery.eq("year", yearInt);
      }
      const { data: feesData, error: feesErr } = await feesQuery;
      if (feesErr) throw feesErr;

      // 2. Fetch Prep Program Fees
      const { data: prepData, error: prepErr } = await supabase
        .from("preparation_enrollments")
        .select("amount_paid")
        .gte("enrollment_date", startDateStr)
        .lte("enrollment_date", endDateStr);
      if (prepErr) throw prepErr;

      // 3. Fetch Teacher Salaries
      let salariesQuery = supabase.from("teacher_salaries").select("amount");
      if (selectedMonth !== "সকল মাস") {
        salariesQuery = salariesQuery.eq("month", selectedMonth).eq("year", yearInt);
      } else {
        salariesQuery = salariesQuery.eq("year", yearInt);
      }
      const { data: salariesData, error: salariesErr } = await salariesQuery;
      if (salariesErr) throw salariesErr;

      // 4. Fetch Other Expenses
      const { data: expensesData, error: expensesErr } = await supabase
        .from("expenses")
        .select("amount")
        .gte("expense_date", startDateStr)
        .lte("expense_date", endDateStr);
      if (expensesErr) throw expensesErr;

      // Sum values
      const regularFeesSum = feesData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      const prepFeesSum = prepData?.reduce((acc, curr) => acc + Number(curr.amount_paid), 0) || 0;
      const salariesSum = salariesData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      const otherExpensesSum = expensesData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

      const totalIncome = regularFeesSum + prepFeesSum;
      const totalExpense = salariesSum + otherExpensesSum;
      const amountProfitLoss = totalIncome - totalExpense;

      setReport({
        regularFees: regularFeesSum,
        prepFees: prepFeesSum,
        totalIncome,
        teacherSalaries: salariesSum,
        otherExpenses: otherExpensesSum,
        totalExpense,
        netProfit: amountProfitLoss >= 0,
        amountProfitLoss: Math.abs(amountProfitLoss),
      });
    } catch (err: any) {
      setError(err.message || "রিপোর্ট তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, [selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Print area representation (HIDDEN ON SCREEN, SHOWS IN PRINT) */}
      <div className="hidden print:block print-area p-8 border-2 border-slate-900 rounded-3xl max-w-2xl mx-auto text-left text-xs">
        <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
          <h2 className="text-lg font-black">সাইন্স কর্নার কোচিং সেন্টার</h2>
          <p className="text-slate-500 text-[10px]">শিক্ষা ও অগ্রগতির পথে আমাদের যাত্রা</p>
          <h3 className="font-bold text-teal-700 text-xs mt-3 pt-1 border-t border-slate-100">
            আর্থিক খতিয়ান বিবরণী রিপোর্ট
          </h3>
          <p className="text-[10px] text-slate-400">
            রিপোর্ট সেশন: {selectedMonth} {selectedYear}
          </p>
        </div>

        <div className="py-6 space-y-4">
          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">১. আয়সমূহ (Incomes)</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">শিক্ষার্থীদের নিয়মিত ফিস:</span>
              <span className="font-bold text-slate-800">৳ {report.regularFees.toLocaleString("bn-BD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">প্রস্তুতি প্রোগ্রাম ফিস:</span>
              <span className="font-bold text-slate-800">৳ {report.prepFees.toLocaleString("bn-BD")}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-slate-100 pt-2 text-slate-900">
              <span className="text-slate-900">সর্বমোট আয়:</span>
              <span className="text-slate-900">৳ {report.totalIncome.toLocaleString("bn-BD")}</span>
            </div>
          </div>

          <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 pt-4">২. ব্যয়সমূহ (Expenses)</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">শিক্ষকদের নিয়মিত বেতন:</span>
              <span className="font-bold text-slate-800">৳ {report.teacherSalaries.toLocaleString("bn-BD")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">অন্যান্য অফিস খরচ:</span>
              <span className="font-bold text-slate-800">৳ {report.otherExpenses.toLocaleString("bn-BD")}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-slate-100 pt-2 text-slate-900">
              <span className="text-slate-900">সর্বমোট ব্যয়:</span>
              <span className="text-slate-900">৳ {report.totalExpense.toLocaleString("bn-BD")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 bg-slate-50 border-2 border-dashed border-slate-300 px-4 rounded-xl my-6">
            <span className="font-bold">আর্থিক স্থিতি (নিট লাভ/ক্ষতি):</span>
            <span className="text-sm font-bold text-slate-900">
              ৳ {report.amountProfitLoss.toLocaleString("bn-BD")} ({report.netProfit ? "লাভ" : "ক্ষতি"})
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end pt-20 text-xs">
          <div className="text-center w-36 border-t border-slate-400 pt-1">
            <span>পরীক্ষকের স্বাক্ষর</span>
          </div>
          <div className="text-center w-36 border-t border-slate-400 pt-1">
            <span>পরিচালকের স্বাক্ষর</span>
          </div>
        </div>
      </div>

      {/* Screen Interface Wrapper (Hidden on print) */}
      <div className="print:hidden space-y-6">
        
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-slate-200/60 rounded-2xl shadow-xs">
          {/* Action Button */}
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>রিপোর্ট প্রিন্ট করুন</span>
          </button>

          {/* Filters dropdowns */}
          <div className="flex flex-wrap items-center justify-end gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1 font-semibold shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              সময়কাল নির্বাচন:
            </span>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden text-xs font-semibold"
            >
              {banglaMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden text-xs font-semibold"
            >
              <option value={(new Date().getFullYear() - 1).toString()}>
                {(new Date().getFullYear() - 1).toString()}
              </option>
              <option value={new Date().getFullYear().toString()}>
                {new Date().getFullYear().toString()}
              </option>
              <option value={(new Date().getFullYear() + 1).toString()}>
                {(new Date().getFullYear() + 1).toString()}
              </option>
            </select>
          </div>
        </div>

        {/* Content Report Panels */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-2xl shadow-xs gap-3">
            <Loader2 className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">হিসাব বিবরণী প্রস্তুত করা হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Profit & Loss Main Indicator Banner */}
            <div
              className={`p-6 border rounded-2xl flex items-center justify-between gap-6 shadow-sm ${
                report.netProfit
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">নিট লাভ / ক্ষতি বিবরণী</span>
                <p className="text-2xl font-black">
                  ৳ {report.amountProfitLoss.toLocaleString("bn-BD")}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${report.netProfit ? "bg-emerald-100" : "bg-rose-100"}`}>
                {report.netProfit ? (
                  <ArrowUpRight className="w-8 h-8 shrink-0 text-emerald-600" />
                ) : (
                  <ArrowDownRight className="w-8 h-8 shrink-0 text-rose-600" />
                )}
              </div>
            </div>

            {/* Income and Expense Grid Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Panel */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">আয়সমূহ (Incomes)</h4>
                
                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">৳ {report.regularFees.toLocaleString("bn-BD")}</span>
                    <span>শিক্ষার্থীদের নিয়মিত ফিস কালেকশন</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">৳ {report.prepFees.toLocaleString("bn-BD")}</span>
                    <span>প্রস্তুতি প্রোগ্রাম সেশন কালেকশন</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-900 border-t border-slate-150 pt-3 text-sm">
                    <span>৳ {report.totalIncome.toLocaleString("bn-BD")}</span>
                    <span>সর্বমোট আয়</span>
                  </div>
                </div>
              </div>

              {/* Expense Panel */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">ব্যয়সমূহ (Expenses)</h4>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">৳ {report.teacherSalaries.toLocaleString("bn-BD")}</span>
                    <span>শিক্ষকদের মোট বেতন পরিশোধ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">৳ {report.otherExpenses.toLocaleString("bn-BD")}</span>
                    <span>অন্যান্য সাধারণ ভাউচার খরচ</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-slate-900 border-t border-slate-150 pt-3 text-sm">
                    <span>৳ {report.totalExpense.toLocaleString("bn-BD")}</span>
                    <span>সর্বমোট ব্যয়</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
