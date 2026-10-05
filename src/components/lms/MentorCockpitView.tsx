import React, { useState } from "react";
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
  const [selectedMentee, setSelectedMentee] = useState<Mentee>(mentees[0]);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [mentorFeedback, setMentorFeedback] = useState<string>("");
  const [submittedFeedbackSuccess, setSubmittedFeedbackSuccess] = useState<boolean>(false);

  // Mock submission item for the active mentee
  const activeSubmission = {
    id: `sub_${selectedMentee?.id || "demo"}`,
    title: "Coding Test: High-Throughput Matrix Multiplier",
    category: "TEST",
    type: "CODING_TEST",
    submittedAt: "Today at 2:45 PM",
    codeSnippet: `import torch\n\ndef matrix_multiply(A: torch.Tensor, B: torch.Tensor) -> torch.Tensor:\n    """\n    Optimized GEMM computation with FP16 precision\n    """\n    assert A.shape[1] == B.shape[0], "Inner dimensions must match"\n    return torch.matmul(A.cuda().half(), B.cuda().half()).float()`,
    testResults: "2 of 2 Automated Test Cases Passed (Runtime: 12ms)",
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGradeSubmission) {
      onGradeSubmission(selectedMentee.id, activeSubmission.id, gradeScore, mentorFeedback);
    }
    setSubmittedFeedbackSuccess(true);
    setTimeout(() => setSubmittedFeedbackSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Diamond Milestones Bar (Matching Diagram) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0B1120] border border-sky-500/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">7</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Submissions
            </span>
            <span className="text-sm font-bold text-white">Total Attempted</span>
          </div>
        </div>

        <div className="bg-[#0B1120] border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">6</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Evaluated
            </span>
            <span className="text-sm font-bold text-white">Graded & Feedback</span>
          </div>
        </div>

        <div className="bg-[#0B1120] border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">4</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Pending Review
            </span>
            <span className="text-sm font-bold text-white">Awaiting Marks</span>
          </div>
        </div>

        <div className="bg-[#0B1120] border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">5</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              At Risk
            </span>
            <span className="text-sm font-bold text-white">Lagging Behind</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Mentees Roster | Right Review Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mentees List (Mentee1, Mentee2, Mentee3...) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
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
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-sm"
                      : "bg-slate-50/50 dark:bg-[#070A11] border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
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
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                            mentee.status === "NEEDS_REVIEW"
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300"
                              : mentee.status === "AT_RISK"
                              ? "bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300"
                              : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300"
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
                        <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full"
                            style={{ width: `${mentee.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
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
            <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
              {/* Mentee Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedMentee.avatar}
                    alt={selectedMentee.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedMentee.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedMentee.email} • {selectedMentee.college}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>Send Query</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition-colors shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Schedule 1:1</span>
                  </button>
                </div>
              </div>

              {/* Submission Queue Item */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    Latest Submission to Review
                  </span>
                  <span className="text-[11px] text-slate-400">{activeSubmission.submittedAt}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {activeSubmission.title}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {activeSubmission.testResults}
                    </span>
                  </div>

                  {/* Code Diff Display */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 text-[11px] font-mono bg-zinc-950 text-slate-200 p-3.5 leading-relaxed">
                    <pre className="overflow-x-auto whitespace-pre">
                      {activeSubmission.codeSnippet}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Grading Console Form */}
              <form onSubmit={handleGradeSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
                      Score (out of 100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
                      Mentor Review Feedback
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Excellent memory alignment. Consider caching cuda tensor allocations."
                      value={mentorFeedback}
                      onChange={(e) => setMentorFeedback(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {submittedFeedbackSuccess ? (
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Graded & feedback dispatched to mentee!</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Assigning a score marks this milestone completed for the student.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Submit Evaluation</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
