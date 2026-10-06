import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Code2,
  Video,
  FileText,
  ExternalLink,
  MessageSquare,
  Award,
  Send,
  Sparkles,
} from "lucide-react";

interface Mentee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  college: string;
  progressPercent: number;
  submittedCount: number;
  pendingReviews: number;
  status: "NEEDS_REVIEW" | "ON_TRACK" | "AT_RISK";
  lastActive: string;
  latestSubmission?: any;
}

interface MentorCockpitProps {
  mentees: Mentee[];
  milestones: {
    submitted: number;
    evaluated: number;
    pendingReview: number;
    atRisk: number;
  };
  onGradeSubmission?: (menteeId: string, submissionId: string, score: number, feedback: string) => void;
}

export default function MentorCockpitView({
  mentees,
  milestones,
  onGradeSubmission,
}: MentorCockpitProps) {
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(mentees[0] || null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [mentorFeedback, setMentorFeedback] = useState<string>("");
  const [submittedFeedbackSuccess, setSubmittedFeedbackSuccess] = useState<boolean>(false);

  useEffect(() => {
    setSelectedMentee(mentees[0] || null);
  }, [mentees]);

  // Submission item for the active mentee
  const activeSubmission = selectedMentee?.latestSubmission || {
    id: `sub_${selectedMentee?.id || "demo"}`,
    title: "Practical Assignment: Capstone Module",
    category: "PROJECT",
    type: "CODING_TEST",
    submittedAt: "Submitted via Course Player",
    codeSnippet: `// Learner submitted codebase for review\nimport torch\n\ndef model_inference(x):\n    return x * 2`,
    testResults: "Automated Checks Verified",
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGradeSubmission && selectedMentee) {
      onGradeSubmission(selectedMentee.id, activeSubmission.id, gradeScore, mentorFeedback);
    }
    setSubmittedFeedbackSuccess(true);
    setTimeout(() => setSubmittedFeedbackSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Diamond Milestones Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">{milestones?.submitted ?? 7}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Submissions
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Total Attempted</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">{milestones?.evaluated ?? 6}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Evaluated
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Graded & Feedback</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">{milestones?.pendingReview ?? 4}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Pending Review
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Awaiting Marks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">{milestones?.atRisk ?? 5}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              At Risk
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Lagging Behind</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Mentees Roster | Right Review Cockpit */}
      {mentees.length === 0 ? (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 space-y-2 shadow-2xs">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Mentees Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no active students allocated to this mentorship cohort. An administrator can assign students from the Students page.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mentees List */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between px-1 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-500" />
              <span>Assigned Mentees ({mentees.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Direct Batch</span>
          </div>

          <div className="space-y-2">
            {mentees.map((mentee) => {
              const isSelected = selectedMentee?.id === mentee.id;

              return (
                <div
                  key={mentee.id}
                  onClick={() => setSelectedMentee(mentee)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/10 border-sky-500/40 dark:border-sky-500/40 shadow-2xs"
                      : "bg-slate-50/50 dark:bg-[#070A11] border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={mentee.avatar}
                      alt={mentee.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {mentee.name}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            mentee.status === "NEEDS_REVIEW"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : mentee.status === "AT_RISK"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {mentee.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {mentee.college}
                      </p>
                      {/* Mini Progress */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full transition-all"
                            style={{ width: `${mentee.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          {mentee.progressPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Mentee Evaluation Console */}
        <div className="lg:col-span-8 space-y-4">
          {selectedMentee && (
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-2xs">
              {/* Mentee Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedMentee.avatar}
                    alt={selectedMentee.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {selectedMentee.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedMentee.email} • {selectedMentee.college}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                    <span>Huddle</span>
                  </a>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    Active: {selectedMentee.lastActive}
                  </span>
                </div>
              </div>

              {/* Active Milestone Deliverable Showcase */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeSubmission.title}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      CODING TASK
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {activeSubmission.submittedAt}
                  </span>
                </div>

                {/* Code Snippet Box */}
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#070A11] p-4 font-mono text-xs text-sky-300">
                  <pre className="overflow-x-auto">{activeSubmission.codeSnippet}</pre>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>{activeSubmission.testResults}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Benchmark Passed</span>
                </div>
              </div>

              {/* Live Grading & Feedback Form */}
              <form onSubmit={handleGradeSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-xs font-bold text-slate-900 dark:text-white">
                    Award Milestone Score
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(Number(e.target.value))}
                      className="w-44 accent-sky-500"
                    />
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      {gradeScore} / 100
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mentor Architecture & Viva Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Write detailed critique, memory-leak observations, or congratulations for the mentee..."
                    value={mentorFeedback}
                    onChange={(e) => setMentorFeedback(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {submittedFeedbackSuccess ? (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Score & Feedback Recorded!</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Directly syncs to learner's milestone diamond tracker.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Publish Evaluation</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
