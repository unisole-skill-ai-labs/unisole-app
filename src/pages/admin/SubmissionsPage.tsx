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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Award className="w-6 h-6 text-sky-500" />
            <span>Mentorship Cockpit & Evaluations</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Track student milestones, evaluate coding deliverables, and grade assessment vivas.
          </p>
        </div>

        <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "cockpit"
                ? "bg-white dark:bg-zinc-800 text-sky-500 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Mentorship Cockpit
          </button>
          <button
            onClick={() => setActiveTab("table")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "table"
                ? "bg-white dark:bg-zinc-800 text-sky-500 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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
        <>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, course, or lesson..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 self-start">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === "ALL"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === "PENDING"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Pending (
            {submissions.filter((s) => s.status === "PENDING").length}
            )
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === "APPROVED"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("CHANGES_REQUESTED")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filter === "CHANGES_REQUESTED"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Changes Requested
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/80 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/40">
                <th className="p-4">Student</th>
                <th className="p-4">Course & Assignment</th>
                <th className="p-4">Submission Link</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
                    No submissions found matching filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="p-4 font-medium">
                      <div className="text-zinc-900 dark:text-zinc-100 font-semibold">
                        {sub.studentName}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {sub.studentEmail}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {sub.lessonTitle}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {sub.courseTitle}
                      </div>
                    </td>
                    <td className="p-4">
                      {sub.submissionUrl ? (
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[11px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Link</span>
                        </a>
                      ) : (
                        <span className="text-zinc-400 italic">Text response only</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                          sub.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : sub.status === "CHANGES_REQUESTED"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {sub.status === "APPROVED"
                          ? "Approved"
                          : sub.status === "CHANGES_REQUESTED"
                          ? "Changes Requested"
                          : "Pending Review"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenReview(sub)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Review Submission
                </h2>
                <span className="text-xs text-zinc-400">
                  {selectedSub.studentName} — {selectedSub.lessonTitle}
                </span>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Preview */}
            <div className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2 text-xs">
              {selectedSub.submissionUrl && (
                <div>
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase block">
                    Repository URL:
                  </span>
                  <a
                    href={selectedSub.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 font-mono hover:underline break-all"
                  >
                    {selectedSub.submissionUrl}
                  </a>
                </div>
              )}
              {selectedSub.submissionText && (
                <div>
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase block">
                    Student Note:
                  </span>
                  <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">
                    {selectedSub.submissionText}
                  </p>
                </div>
              )}
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Evaluation Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus("APPROVED")}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    reviewStatus === "APPROVED"
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewStatus("CHANGES_REQUESTED")}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                    reviewStatus === "CHANGES_REQUESTED"
                      ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Changes Requested</span>
                </button>
              </div>
            </div>

            {/* Mentor Feedback Text Area */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Feedback Note for Student
              </label>
              <textarea
                rows={4}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="Write specific guidance, praise, or requested changes..."
                className="w-full p-3 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-800"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-colors shadow-sm"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
