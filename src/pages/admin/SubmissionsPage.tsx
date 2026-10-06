import React, { useState, useMemo } from "react";
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
  ShieldAlert,
} from "lucide-react";
import {
  useGetMentorCockpitQuery,
  useGetSubmissionsAuditQuery,
  useGetAdminMentorsQuery,
  useGradeSubmissionMutation,
} from "../../store/apiSlice";
import MentorCockpitView from "../../components/lms/MentorCockpitView";

export default function SubmissionsPage() {
  const { user } = useSelector((state: any) => state.auth);

  const userRoles: string[] = useMemo(() => {
    const primary = (user?.role || "").toUpperCase();
    const secondary = Array.isArray(user?.roles)
      ? user.roles.map((r: any) => String(r).toUpperCase())
      : Array.isArray(user?.metadata?.roles)
      ? user.metadata.roles.map((r: any) => String(r).toUpperCase())
      : [];
    return [primary, ...secondary];
  }, [user]);

  const isAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");
  const isProgramManager = userRoles.includes("PROGRAM_MANAGER") && !isAdmin;
  const isMentor = userRoles.includes("MENTOR") && !isAdmin;

  const [activeTab, setActiveTab] = useState<"cockpit" | "table">("cockpit");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "CHANGES_REQUESTED">("ALL");
  const [search, setSearch] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("ALL");

  // Fetch live mentors from DB (for Program Manager & Admin)
  const { data: mentors = [] } = useGetAdminMentorsQuery(undefined, {
    skip: isMentor,
  });

  // Queries
  const { data: mentorCockpitData, refetch: refetchCockpit } = useGetMentorCockpitQuery(
    selectedMentorId !== "ALL" ? { mentorId: selectedMentorId } : undefined
  );

  const {
    data: submissionsAudit = [],
    isLoading: isLoadingSubmissions,
    refetch: refetchSubmissions,
  } = useGetSubmissionsAuditQuery({
    status: filter !== "ALL" ? filter : undefined,
    mentorId: selectedMentorId !== "ALL" ? selectedMentorId : undefined,
    search: search ? search : undefined,
  });

  const [gradeSubmissionApi, { isLoading: isGrading }] = useGradeSubmissionMutation();

  const handleGradeSubmission = async (
    menteeId: string,
    submissionId: string,
    score: number,
    feedback: string
  ) => {
    try {
      await gradeSubmissionApi({
        id: submissionId,
        body: { score, mentorFeedback: feedback, status: "GRADED" },
      }).unwrap();
      refetchCockpit();
      refetchSubmissions();
    } catch {
      // Non-critical fallback
    }
  };

  // Selected Submission for Review Modal
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "CHANGES_REQUESTED">("APPROVED");
  const [reviewScore, setReviewScore] = useState<number>(85);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [gradingError, setGradingError] = useState<string | null>(null);

  const handleOpenReview = (sub: any) => {
    setSelectedSub(sub);
    setReviewStatus(sub.status === "CHANGES_REQUESTED" ? "CHANGES_REQUESTED" : "APPROVED");
    setReviewScore(sub.score || 85);
    setReviewFeedback(sub.mentorFeedback || "");
    setGradingError(null);
  };

  const handleSaveReview = async () => {
    if (!selectedSub) return;
    try {
      setGradingError(null);
      await gradeSubmissionApi({
        id: selectedSub.id,
        body: {
          score: reviewStatus === "APPROVED" ? reviewScore : 40,
          mentorFeedback: reviewFeedback,
          status: reviewStatus === "APPROVED" ? "GRADED" : "CHANGES_REQUESTED",
        },
      }).unwrap();

      refetchSubmissions();
      refetchCockpit();
      setSelectedSub(null);
    } catch (err: any) {
      setGradingError(err?.data?.error || "Failed to submit evaluation verdict.");
    }
  };

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-5 h-5 text-sky-500" />
            <span>
              {isMentor
                ? "Mentorship Cockpit & Evaluations"
                : isProgramManager
                ? "Program Manager Mentorship Hub"
                : "Mentorship Cockpit & Evaluations"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isMentor
              ? "Evaluate deliverables, submit viva marks, and guide your assigned mentees."
              : isProgramManager
              ? "Program Manager view: Monitor live mentor cohorts and review deliverables submitted across mentors."
              : "Platform view: Track student milestones, evaluate coding deliverables, and audit assessment vivas."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mentor Selector for Program Manager & Admin */}
          {(isProgramManager || isAdmin) && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#0B1120] px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs shadow-2xs">
              <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span className="text-slate-400 font-medium">Cohort Mentor:</span>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Mentors (Full Cohort)</option>
                {mentors.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.activeMenteesCount || 0} Mentees)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
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
              Submissions Audit ({submissionsAudit.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "cockpit" ? (
        <MentorCockpitView
          mentees={mentorCockpitData?.mentees || []}
          milestones={
            mentorCockpitData?.milestones || {
              submitted: 0,
              evaluated: 0,
              pendingReview: 0,
              atRisk: 0,
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
                All ({submissionsAudit.length})
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "PENDING"
                    ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Pending (
                {submissionsAudit.filter((s: any) => s.status === "PENDING").length}
                )
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
                    <th className="p-4">Assigned Mentor</th>
                    <th className="p-4">Deliverable Link</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {isLoadingSubmissions ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        Loading student submissions audit from live database...
                      </td>
                    </tr>
                  ) : submissionsAudit.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        {isMentor
                          ? "No submissions from your assigned mentees found."
                          : "No submissions found matching filter."}
                      </td>
                    </tr>
                  ) : (
                    submissionsAudit.map((sub: any) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4 font-medium">
                          <div className="text-slate-900 dark:text-white font-bold">
                            {sub.studentName || "Student"}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {sub.studentEmail || sub.studentPhone || sub.studentId}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-800 dark:text-slate-200 font-semibold">
                            {sub.lessonTitle || sub.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {sub.courseTitle}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {sub.mentorName || "—"}
                          </span>
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
                          ) : sub.codeSnippet ? (
                            <span className="text-[11px] font-mono text-slate-400">
                              Code submitted
                            </span>
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {gradingError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{gradingError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-100 dark:border-slate-800/80 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedSub.lessonTitle || selectedSub.title}
                </p>
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
                {selectedSub.submissionText && (
                  <p className="text-slate-600 dark:text-slate-300 pt-1">
                    {selectedSub.submissionText}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Score / 100
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewScore}
                    onChange={(e) => setReviewScore(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                </div>
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
                disabled={isGrading}
                onClick={handleSaveReview}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isGrading ? "Saving..." : "Save Evaluation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
