import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  User,
  Clock,
  X,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { StudentSubmission } from "../../types";
import { getSubmissions, updateSubmissionReview } from "../../utils/submissionsStorage";
import { useGetMentorCockpitQuery, useGradeSubmissionMutation } from "../../store/apiSlice";
import MentorCockpitView from "../../components/lms/MentorCockpitView";

export default function SubmissionsPage() {
  const { user } = useSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState<"cockpit" | "table">("cockpit");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "CHANGES_REQUESTED">(
    "ALL"
  );
  const [search, setSearch] = useState("");

  const { data: mentorCockpitData, refetch: refetchCockpit } = useGetMentorCockpitQuery(undefined);
  const [gradeSubmissionApi] = useGradeSubmissionMutation();

  const handleGradeSubmission = async (
    menteeId: string,
    submissionId: string,
    score: number,
    feedback: string
  ) => {
    try {
      await gradeSubmissionApi({
        id: submissionId,
        body: { score, mentorFeedback: feedback },
      }).unwrap();
      refetchCockpit();
    } catch {
      // Non-critical fallback
    }
  };

  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => getSubmissions());

  // Selected Submission for Review Modal
  const [selectedSub, setSelectedSub] = useState<StudentSubmission | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "CHANGES_REQUESTED">("APPROVED");
  const [reviewFeedback, setReviewFeedback] = useState("");

  const handleOpenReview = (sub: StudentSubmission) => {
    setSelectedSub(sub);
    setReviewStatus(sub.status === "CHANGES_REQUESTED" ? "CHANGES_REQUESTED" : "APPROVED");
    setReviewFeedback(sub.mentorFeedback || "");
  };

  const handleSaveReview = () => {
    if (!selectedSub) return;
    updateSubmissionReview(
      selectedSub.id,
      reviewStatus,
      reviewFeedback,
      user?.name || "Mentor"
    );
    setSubmissions(getSubmissions());
    setSelectedSub(null);
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesFilter = filter === "ALL" ? true : s.status === filter;
    const matchesSearch =
      (s.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.courseTitle || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.lessonTitle || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-5 h-5 text-sky-500" />
            <span>Mentorship Cockpit & Evaluations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track student milestones, evaluate coding deliverables, and grade assessment vivas.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "cockpit"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Mentorship Cockpit
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "table"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Submissions Audit ({submissions.length})
          </button>
        </div>
      </div>

      {activeTab === "cockpit" ? (
        <MentorCockpitView
          mentees={mentorCockpitData?.mentees || []}
          milestones={
            mentorCockpitData?.milestones || {
              submitted: 7,
              evaluated: 6,
              pendingReview: 4,
              atRisk: 5,
            }
          }
          onGradeSubmission={handleGradeSubmission}
        />
      ) : (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student, course, or lesson..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start sm:self-auto overflow-x-auto">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "ALL"
                    ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "PENDING"
                    ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Pending ({submissions.filter((s) => s.status === "PENDING").length})
              </button>
              <button
                onClick={() => setFilter("APPROVED")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "APPROVED"
                    ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter("CHANGES_REQUESTED")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "CHANGES_REQUESTED"
                    ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Changes Requested
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/60">
                    <th className="p-4">Student</th>
                    <th className="p-4">Course & Assignment</th>
                    <th className="p-4">Submission Link</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400">
                        No submissions found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4 font-medium">
                          <div className="text-slate-900 dark:text-white font-bold">
                            {sub.studentName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {sub.studentEmail}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800 dark:text-slate-200 font-semibold">
                            {sub.lessonTitle}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {sub.courseTitle}
                          </div>
                        </td>
                        <td className="p-4">
                          {sub.submissionUrl ? (
                            <a
                              href={sub.submissionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-mono text-[11px]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View Deliverable</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No URL</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === "APPROVED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : sub.status === "CHANGES_REQUESTED"
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenReview(sub)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                          >
                            <span>Grade & Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Review & Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Grade Submission: {selectedSub.studentName}
              </h2>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedSub.lessonTitle}</p>
                <p className="text-slate-400">{selectedSub.courseTitle}</p>
                {selectedSub.submissionUrl && (
                  <a
                    href={selectedSub.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sky-500 hover:underline pt-1 font-mono"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open Code Repository</span>
                  </a>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Evaluation Verdict
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e: any) => setReviewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                >
                  <option value="APPROVED">APPROVED (Pass Milestone)</option>
                  <option value="CHANGES_REQUESTED">CHANGES_REQUESTED (Resubmit)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mentor Feedback & Viva Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide concrete architecture observations, code feedback, and milestone tips..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
