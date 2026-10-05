import React, { useState } from "react";
import {
  Video,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Link,
  Send,
} from "lucide-react";

interface SubjectiveVideoTestRunnerProps {
  type: "SUBJECTIVE_TEST" | "VIDEO_TEST";
  title: string;
  description: string;
  config?: any;
  onSubmit: (data: { text?: string; videoUrl?: string }) => void;
  isCompleted?: boolean;
}

export default function SubjectiveVideoTestRunner({
  type,
  title,
  description,
  config,
  onSubmit,
  isCompleted,
}: SubjectiveVideoTestRunnerProps) {
  const isVideo = type === "VIDEO_TEST";
  const [responseContent, setResponseContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitted, setSubmitted] = useState(isCompleted || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    onSubmit({
      text: responseContent,
      videoUrl: videoUrl || "https://drive.google.com/file/d/sample-demo-viva",
    });
  };

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 animate-fade-in shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                isVideo
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              }`}
            >
              {isVideo ? "Video Demonstration & Viva Test" : "Subjective Evaluation Test"}
            </span>
            <span className="text-xs text-slate-400 font-medium">Max Marks: {isVideo ? 35 : 30}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {submitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Submission Under Mentor Review</span>
          </div>
        )}
      </div>

      {/* Guidelines / Rubric Checklist */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
          Evaluation Rubric & Guidelines
        </h4>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
          {isVideo ? (
            <>
              <li>Keep video recording under {config?.maxDurationSec ? Math.round(config.maxDurationSec / 60) : 3} minutes.</li>
              <li>Include a clear screen recording walkthrough of your deployed service.</li>
              <li>Explain key architectural decisions and performance trade-offs.</li>
            </>
          ) : (
            <>
              <li>Provide in-depth architectural reasoning with pros and cons.</li>
              <li>Include concrete performance figures, latency calculations, and failure recovery modes.</li>
              <li>Ensure clear formatting with headers and bullet points.</li>
            </>
          )}
        </ul>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isVideo ? (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
              Video Recording Link (Google Drive, Loom, or YouTube Unlisted)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                required
                disabled={submitted}
                placeholder="https://loom.com/share/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <textarea
              rows={3}
              disabled={submitted}
              placeholder="Optional notes or timestamps for your video walkthrough..."
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
              Written Subjective Response
            </label>
            <textarea
              rows={8}
              required
              disabled={submitted}
              placeholder="Write your comprehensive technical response here..."
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500 leading-relaxed font-sans"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500">
            Submissions are routed directly to your assigned mentor for grading.
          </span>

          <button
            type="submit"
            disabled={submitted}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              submitted
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 cursor-pointer"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{submitted ? "Submitted for Review" : "Submit for Evaluation"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
