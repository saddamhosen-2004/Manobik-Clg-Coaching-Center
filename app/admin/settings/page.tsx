"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImageToImageKit } from "@/lib/imagekit";
import {
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Upload,
  RotateCcw,
  Eye,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminSettingsPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  /* ── Load current hero banner URL from DB ── */
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error: fetchErr } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "hero_banner_url")
          .single();

        if (fetchErr) throw fetchErr;
        setCurrentBannerUrl(data?.value || null);
        setPreviewUrl(data?.value || null);
      } catch (err: any) {
        setError("সেটিংস লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  /* ── Process a File object (from input OR drag) ── */
  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("শুধুমাত্র ইমেজ ফাইল আপলোড করা যাবে।");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ফাইলের সাইজ ৫MB এর বেশি হওয়া যাবে না।");
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const url = await uploadImageToImageKit(file, "hero-banner");
      setPreviewUrl(url);
      setSuccess("ছবি প্রস্তুত! এখন 'পরিবর্তন সংরক্ষণ করুন' বাটন চাপুন।");
    } catch (err: any) {
      setError("ছবি আপলোড করতে ব্যর্থ: " + (err.message || "অজানা ত্রুটি।"));
    } finally {
      setUploading(false);
    }
  };

  /* ── File input change ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };

  /* ── Drag & Drop ── */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  /* ── Save to Supabase ── */
  const handleSave = async () => {
    if (!previewUrl || previewUrl === currentBannerUrl) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: upsertErr } = await supabase
        .from("site_settings")
        .upsert({ key: "hero_banner_url", value: previewUrl, updated_at: new Date().toISOString() });

      if (upsertErr) throw upsertErr;
      setCurrentBannerUrl(previewUrl);
      setSuccess("হিরো ব্যানার সফলভাবে আপডেট করা হয়েছে! পাবলিক হোমপেজে এখনই দেখা যাবে।");
    } catch (err: any) {
      setError("সংরক্ষণ করতে ব্যর্থ হয়েছে: " + (err.message || "অজানা ত্রুটি।"));
    } finally {
      setSaving(false);
    }
  };

  /* ── Reset to original ── */
  const handleReset = () => {
    setPreviewUrl(currentBannerUrl);
    setSuccess(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasChanges = previewUrl !== currentBannerUrl;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page description */}
      <p className="text-slate-500 text-sm">
        ওয়েবসাইটের পাবলিক হোমপেজে প্রদর্শিত হিরো ব্যানার ছবি পরিবর্তন করুন।
      </p>

      {/* Notifications */}
      {success && (
        <div className="flex items-start gap-2.5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-slide-down">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm animate-slide-down">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Banner Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-teal-600" />
            হিরো ব্যানার প্রিভিউ
          </h2>
          {!loading && (
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              লাইভ দেখুন
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 bg-slate-50 rounded-xl">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : previewUrl ? (
          <div className="relative w-full h-52 rounded-xl overflow-hidden border border-slate-100">
            <Image
              src={previewUrl}
              alt="হিরো ব্যানার প্রিভিউ"
              fill
              className="object-cover"
              unoptimized={previewUrl.startsWith("/uploads/")}
            />
            {/* overlay label */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-semibold">
                {hasChanges ? "⚡ নতুন ব্যানার (সংরক্ষণ করা হয়নি)" : "✅ বর্তমান ব্যানার"}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl text-slate-400 gap-2 border border-dashed border-slate-200">
            <ImageIcon className="w-10 h-10" />
            <p className="text-xs">কোনো ব্যানার সেট করা নেই</p>
          </div>
        )}
      </div>


      {/* Upload Zone */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Upload className="w-4 h-4 text-teal-600" />
          নতুন ব্যানার আপলোড করুন
        </h2>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            dragOver
              ? "border-teal-500 bg-teal-50 scale-[1.01]"
              : "border-slate-200 bg-slate-50/50 hover:border-teal-400 hover:bg-teal-50/40"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
              <p className="text-sm font-semibold text-teal-600">আপলোড হচ্ছে...</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100">
                <Camera className="w-7 h-7 text-teal-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-700">
                  এখানে ছবি টেনে আনুন অথবা ক্লিক করুন
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, WEBP সমর্থিত · সর্বোচ্চ ৫MB
                </p>
                <p className="text-xs text-slate-400">
                  প্রস্তাবিত আকার: ১৪৪০ × ৫৬০ পিক্সেল বা বড়
                </p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleReset}
            disabled={!hasChanges || uploading || saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            আগের ব্যানারে ফিরে যান
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || uploading || saving}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                সংরক্ষণ হচ্ছে...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                পরিবর্তন সংরক্ষণ করুন
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-xs text-sky-700 space-y-1.5">
        <p className="font-bold text-sky-800">📌 ব্যানার আপলোড গাইড:</p>
        <ul className="list-disc list-inside space-y-1 text-sky-600">
          <li>ছবি আপলোড করার পরে <strong>সংরক্ষণ বাটন</strong> অবশ্যই চাপতে হবে।</li>
          <li>সংরক্ষণ করার পরে পাবলিক হোমপেজে তাৎক্ষণিকভাবে নতুন ব্যানার দেখা যাবে।</li>
          <li>১৪৪০×৫৬০ বা বড় রেজোলিউশনের প্রশস্ত ছবি সবচেয়ে ভালো দেখায়।</li>
        </ul>
      </div>
    </div>
  );
}
