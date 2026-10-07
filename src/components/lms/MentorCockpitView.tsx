import React, { useState, useEffect, useMemo } from "react";
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
  Inbox,
  FileQuestion,
  Check,
} from "lucide-react";

interface Mentee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  college: string;
  progressPercent: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
  submittedCount: number;
  pendingReviews: number;
  status: "NEEDS_REVIEW" | "ON_TRACK" | "AT_RISK";
  lastActive: string;
  latestSubmission?: any;
  submissions?: any[];
}

interface MentorCockpitProps {
  mentor?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    specialization?: string;
    bio?: string;
  } | null;
  mentees: Mentee[];
  milestones: {
    submitted: number;
    evaluated: number;
    pendingReview: number;
    atRisk: number;
  };
  selectedMenteeId?: string | null;
  onGradeSubmission?: (menteeId: string, submissionId: string, score: number, feedback: string) => void;
}

export default function MentorCockpitView({
  mentor,
  mentees,
  milestones,
  selectedMenteeId,
  onGradeSubmission,
}: MentorCockpitProps) {
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [mentorFeedback, setMentorFeedback] = useState<string>("");
  const [submittedFeedbackSuccess, setSubmittedFeedbackSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (selectedMenteeId) {
      const match = mentees.find((m) => m.id === selectedMenteeId);
      if (match) {
        setSelectedMentee(match);
        return;
      }
    }
    if (!selectedMentee || !mentees.some((m) => m.id === selectedMentee.id)) {
      setSelectedMentee(mentees[0] || null);
    }
  }, [mentees, selectedMenteeId]);

  const menteeSubmissions: any[] = useMemo(() => {
    if (!selectedMentee) return [];
    if (Array.isArray(selectedMentee.submissions) && selectedMentee.submissions.length > 0) {
      return selectedMentee.submissions;
    }
    return selectedMentee.latestSubmission ? [selectedMentee.latestSubmission] : [];
  }, [selectedMentee]);

  useEffect(() => {
    if (menteeSubmissions.length > 0) {
      const exists = menteeSubmissions.find((s) => s.id === selectedSubmissionId);
      if (!exists) {
        setSelectedSubmissionId(menteeSubmissions[0].id);
      }
    } else {
      setSelectedSubmissionId(null);
    }
  }, [menteeSubmissions]);

  const activeSubmission = useMemo(() => {
    if (!menteeSubmissions.length) return null;
    return menteeSubmissions.find((s) => s.id === selectedSubmissionId) || menteeSubmissions[0] || null;
  }, [menteeSubmissions, selectedSubmissionId]);

  useEffect(() => {
    if (activeSubmission) {
      setMentorFeedback(activeSubmission.mentorFeedback || "");
    } else {
      setMentorFeedback("");
    }
  }, [activeSubmission]);

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onGradeSubmission && selectedMentee && activeSubmission) {
      onGradeSubmission(selectedMentee.id, activeSubmission.id, 100, mentorFeedback);
      setSubmittedFeedbackSuccess(true);
      setTimeout(() => setSubmittedFeedbackSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Mentor Profile Banner */}
      {mentor && (
        <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/5 to-transparent border border-sky-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-sky-600 dark:text-sky-300 text-sm overflow-hidden shrink-0">
              {mentor.avatar && !mentor.avatar.includes("unsplash") ? (
                <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
              ) : (
                mentor.name?.charAt(0) || "M"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {mentor.name || "Mentor Dashboard"}
                </h4>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20">
                  {mentor.id === "ALL" ? "Full Cohort" : "Assigned Mentor"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mentor.specialization || "Technical Mentor & Evaluator"} {mentor.email ? `• ${mentor.email}` : ""}
              </p>
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 px-3.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-2xs">
            <span className="text-sky-500 font-bold">{mentees.length}</span> Active Mentees in View
          </div>
        </div>
      )}

      {/* Top Diamond Milestones Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center shrink-0">
            <span className="font-black text-sm tracking-wider">{milestones?.submitted ?? 0}</span>
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
            <span className="font-black text-sm tracking-wider">{milestones?.evaluated ?? 0}</span>
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
            <span className="font-black text-sm tracking-wider">{milestones?.pendingReview ?? 0}</span>
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
            <span className="font-black text-sm tracking-wider">{milestones?.atRisk ?? 0}</span>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              At Risk
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Lagging Behind</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Mentees Roster | Right Review Console */}
      {mentees.length === 0 ? (
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-12 text-center text-slate-400 space-y-2 shadow-2xs">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Mentees Assigned</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are currently no active students allocated to this mentorship batch. An administrator or program manager can assign students from the Students roster.
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
                      {mentee.avatar && !mentee.avatar.includes("unsplash") ? (
                        <img
                          src={mentee.avatar}
                          alt={mentee.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500/15 to-indigo-500/15 border border-sky-500/25 flex items-center justify-center font-bold text-sky-600 dark:text-sky-300 text-xs shrink-0 select-none">
                          {mentee.name
                            ? mentee.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()
                            : "U"}
                        </div>
                      )}
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
                        {/* Real Student Course Progress */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all"
                              style={{ width: `${mentee.progressPercent || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                            {(() => {
                              const total = mentee.totalLessonsCount ?? 10;
                              const completed =
                                mentee.completedLessonsCount ??
                                (mentee.progressPercent > 0
                                  ? Math.max(1, Math.round(((mentee.progressPercent || 0) / 100) * total))
                                  : 0);
                              return `${completed} / ${total}`;
                            })()}
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
                    {selectedMentee.avatar && !selectedMentee.avatar.includes("unsplash") ? (
                      <img
                        src={selectedMentee.avatar}
                        alt={selectedMentee.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/15 to-indigo-500/15 border border-sky-500/25 flex items-center justify-center font-bold text-sky-600 dark:text-sky-300 text-sm shrink-0 select-none">
                        {selectedMentee.name
                          ? selectedMentee.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </div>
                    )}
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
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                      Active: {selectedMentee.lastActive}
                    </span>
                  </div>
                </div>

                {/* Individual Deliverables Selector */}
                {menteeSubmissions.length > 0 && (
                  <div className="space-y-2 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Individual Submissions ({menteeSubmissions.length})
                      </span>
                      <span className="text-[10px] text-slate-400">Click any deliverable to inspect & grade</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                      {menteeSubmissions.map((sub: any, idx: number) => {
                        const isSubActive = activeSubmission?.id === sub.id;
                        const isPending =
                          sub.status === "PENDING" ||
                          sub.status === "SUBMITTED" ||
                          sub.status === "UNDER_REVIEW";
                        return (
                          <button
                            key={sub.id || idx}
                            type="button"
                            onClick={() => setSelectedSubmissionId(sub.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border cursor-pointer ${
                              isSubActive
                                ? "bg-sky-500/15 border-sky-500/50 text-sky-700 dark:text-sky-300 shadow-2xs"
                                : "bg-slate-50 dark:bg-[#070A11] border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            <span className="truncate max-w-[200px]">
                              {sub.title || `Deliverable #${idx + 1}`}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                                isPending
                                  ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                                  : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              }`}
                            >
                              {isPending ? "Pending" : "Evaluated"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Real Deliverable Section */}
                {activeSubmission ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {activeSubmission.title || "Assignment Submission"}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 uppercase">
                          {activeSubmission.type || "CODING_TASK"}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {activeSubmission.createdAt ? new Date(activeSubmission.createdAt).toLocaleString() : "Submitted"}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                        <span>Submission Status: {activeSubmission.status || "COMPLETED"}</span>
                      </span>
                    </div>

                    {/* Student Quiz Answers (for MCQs) */}
                    {(activeSubmission.type?.toLowerCase() === "quiz" ||
                      activeSubmission.title?.toLowerCase().includes("quiz") ||
                      (activeSubmission.submissionText && activeSubmission.submissionText.includes("Question"))) && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Selected Choices & Answers
                        </span>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
                          {activeSubmission.submissionText || "Student completed quiz submission."}
                        </div>
                      </div>
                    )}

                    {/* Code Snippet Box if available */}
                    {activeSubmission.codeSnippet && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#070A11] p-4 font-mono text-xs text-sky-300">
                        <pre className="overflow-x-auto whitespace-pre-wrap">{activeSubmission.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Submission URL / Text if available */}
                    {activeSubmission.submissionUrl && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-md">
                          {activeSubmission.submissionUrl}
                        </span>
                        <a
                          href={activeSubmission.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-sky-500 hover:text-sky-400"
                        >
                          <span>Open Link</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Submission Notes for non-quiz tasks */}
                    {activeSubmission.submissionText &&
                      activeSubmission.type?.toLowerCase() !== "quiz" &&
                      !activeSubmission.title?.toLowerCase().includes("quiz") &&
                      !activeSubmission.submissionText.includes("Question") && (
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {activeSubmission.submissionText}
                        </div>
                      )}

                    {/* Simple Grading Form for Evaluated Projects / Labs only (Not Quiz) */}
                    {activeSubmission.type?.toLowerCase() !== "quiz" &&
                      !activeSubmission.title?.toLowerCase().includes("quiz") &&
                      !activeSubmission.submissionText?.includes("Question") && (
                        <form onSubmit={handleGradeSubmit} className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                              Feedback & Notes
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Write feedback for the student..."
                              value={mentorFeedback}
                              onChange={(e) => setMentorFeedback(e.target.value)}
                              className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            {submittedFeedbackSuccess ? (
                              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Feedback Saved!</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                Syncs to student course progress.
                              </span>
                            )}

                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Save Evaluation</span>
                            </button>
                          </div>
                        </form>
                      )}
                  </div>
                ) : (
                  <div className="py-12 px-6 rounded-2xl bg-slate-50/50 dark:bg-[#070A11] border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <FileQuestion className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto stroke-[1.5]" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No Deliverables Submitted Yet
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {selectedMentee.name} has not submitted any assessments, coding tasks, or project assignments yet. Once they submit work in the LMS course player, their submissions and code snippets will appear here for your review and evaluation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

