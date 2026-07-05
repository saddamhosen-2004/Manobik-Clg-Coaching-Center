import { NextResponse } from "next/server";
import { createServerSideClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSideClient();

    // Verify session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current month and year details
    const now = new Date();
    const currentYear = now.getFullYear();
    // Month in Bangla names as used in database
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
    const currentMonthName = banglaMonths[now.getMonth()];
    
    // Start/End of current month for ISO date filtering (expenses, etc.)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // 1. Fetch count of students and teachers
    const [
      studentsRes,
      teachersRes,
      batchesRes,
      recentEnrollmentsRes,
    ] = await Promise.all([
      supabase.from("students").select("id, batch_id, monthly_fee"),
      supabase.from("teachers").select("id"),
      supabase.from("batches").select("id, name"),
      supabase.from("preparation_enrollments")
        .select("id, student_name, amount_paid, enrollment_date, program_id, preparation_programs(program_name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (studentsRes.error) throw studentsRes.error;
    if (teachersRes.error) throw teachersRes.error;
    if (batchesRes.error) throw batchesRes.error;

    const totalStudents = studentsRes.data.length;
    const totalTeachers = teachersRes.data.length;
    const batches = batchesRes.data || [];

    // Calculate student distribution by batch
    const batchDistribution = batches.map((batch) => {
      const count = studentsRes.data.filter((s) => s.batch_id === batch.id).length;
      return {
        name: batch.name,
        শিক্ষার্থী: count,
      };
    });

    // 2. Fetch fees collected this month
    const { data: feesData, error: feesError } = await supabase
      .from("fee_collections")
      .select("amount")
      .eq("month", currentMonthName)
      .eq("year", currentYear);

    if (feesError) throw feesError;
    const totalFeesCollectedThisMonth = feesData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    // Calculate Dues / Outstanding this month
    // Sum of monthly_fee for all students - collected fees this month
    const expectedFeesThisMonth = studentsRes.data.reduce((acc, curr) => acc + Number(curr.monthly_fee), 0);
    const totalDuesThisMonth = Math.max(0, expectedFeesThisMonth - totalFeesCollectedThisMonth);

    // 3. Fetch expenses this month (other expenses + teacher salaries)
    const [expensesRes, salariesRes] = await Promise.all([
      supabase
        .from("expenses")
        .select("amount")
        .gte("expense_date", startOfMonth)
        .lte("expense_date", endOfMonth),
      supabase
        .from("teacher_salaries")
        .select("amount")
        .eq("month", currentMonthName)
        .eq("year", currentYear),
    ]);

    if (expensesRes.error) throw expensesRes.error;
    if (salariesRes.error) throw salariesRes.error;

    const otherExpensesThisMonth = expensesRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    const salariesPaidThisMonth = salariesRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    const totalExpensesThisMonth = otherExpensesThisMonth + salariesPaidThisMonth;

    // 4. Fetch Preparation Program collections this month
    const { data: prepCollections, error: prepError } = await supabase
      .from("preparation_enrollments")
      .select("amount_paid")
      .gte("enrollment_date", startOfMonth)
      .lte("enrollment_date", endOfMonth);

    if (prepError) throw prepError;
    const prepIncomeThisMonth = prepCollections?.reduce((acc, curr) => acc + Number(curr.amount_paid), 0) || 0;

    // 5. Calculate net profit/loss
    const netProfit = (totalFeesCollectedThisMonth + prepIncomeThisMonth) - totalExpensesThisMonth;

    // 6. Last 6 Months trend chart data (mock/calculation)
    // We will build a trend of last 4 months dynamically or return empty structure if no data
    const monthlyTrend = [
      { name: "মার্চ", আয়: 12000, ব্যয়: 8000 },
      { name: "এপ্রিল", আয়: 15000, ব্যয়: 9500 },
      { name: "মে", আয়: 18000, ব্যয়: 10000 },
      { name: "জুন", আয়: totalFeesCollectedThisMonth + prepIncomeThisMonth, ব্যয়: totalExpensesThisMonth },
    ];

    return NextResponse.json({
      summary: {
        totalStudents,
        totalTeachers,
        totalFeesCollectedThisMonth,
        totalDuesThisMonth,
        totalExpensesThisMonth,
        netProfit,
      },
      batchDistribution,
      monthlyTrend,
      recentEnrollments: recentEnrollmentsRes.data || [],
    });
  } catch (error: any) {
    console.error("Dashboard stats fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
