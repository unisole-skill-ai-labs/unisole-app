import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Search,
  User,
  Award,
  ArrowRight,
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

  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-5 h-5 text-sky-500" />
            <span>Mentor View</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mentor Selector for Program Manager & Admin */}
          {(isProgramManager || isAdmin) && (
            <div className="flex items-center gap-2 bg-white dark:bg-[#0B1120] px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs shadow-2xs">
              <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">
                  All Mentors ({mentorCockpitData?.mentees?.length || 0} Mentees)
                </option>
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
              Mentor View
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
          mentor={mentorCockpitData?.mentor}
          mentees={mentorCockpitData?.mentees || []}
          milestones={
            mentorCockpitData?.milestones || {
              submitted: 0,
              evaluated: 0,
              pendingReview: 0,
              atRisk: 0,
            }
          }
          selectedMenteeId={selectedMenteeId}
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
                placeholder="Search by student, email, or mentor..."
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
                All Students
              </button>
              <button
                onClick={() => setFilter("PENDING")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "PENDING"
                    ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setFilter("APPROVED")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === "APPROVED"
                    ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                Evaluated
              </button>
            </div>
          </div>

          {/* Student-Grouped Submissions Audit Table */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/60">
                    <th className="p-4">Student</th>
                    <th className="p-4">Assigned Mentor</th>
                    <th className="p-4">Pending Deliverables</th>
                    <th className="p-4">Total Submissions</th>
                    <th className="p-4">Latest Activity</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {isLoadingSubmissions ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        Loading student submissions audit...
                      </td>
                    </tr>
                  ) : (() => {
                    // Group submissions by student
                    const studentMap = new Map<string, any>();
                    submissionsAudit.forEach((sub: any) => {
                      const sKey = sub.studentId || sub.studentEmail || sub.studentName || "unknown";
                      if (!studentMap.has(sKey)) {
                        studentMap.set(sKey, {
                          studentId: sub.studentId,
                          studentName: sub.studentName || "Student",
                          studentEmail: sub.studentEmail || "",
                          studentPhone: sub.studentPhone || "",
                          mentorName: sub.mentorName || "—",
                          totalSubmissions: 0,
                          pendingCount: 0,
                          approvedCount: 0,
                          latestDate: sub.createdAt,
                          latestSub: sub,
                        });
                      }
                      const entry = studentMap.get(sKey)!;
                      entry.totalSubmissions += 1;
                      if (sub.status === "PENDING" || sub.status === "SUBMITTED") {
                        entry.pendingCount += 1;
                      } else {
                        entry.approvedCount += 1;
                      }
                      if (new Date(sub.createdAt) > new Date(entry.latestDate)) {
                        entry.latestDate = sub.createdAt;
                        entry.latestSub = sub;
                      }
                    });

                    let studentList = Array.from(studentMap.values());
                    if (filter === "PENDING") {
                      studentList = studentList.filter((s) => s.pendingCount > 0);
                    } else if (filter === "APPROVED") {
                      studentList = studentList.filter((s) => s.pendingCount === 0 && s.approvedCount > 0);
                    }

                    if (studentList.length === 0) {
                      return (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-400">
                            No student records found matching this filter.
                          </td>
                        </tr>
                      );
                    }

                    return studentList.map((st: any) => (
                      <tr
                        key={st.studentId || st.studentEmail}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4 font-medium">
                          <div className="text-slate-900 dark:text-white font-bold">
                            {st.studentName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {st.studentEmail || st.studentPhone || st.studentId}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {st.mentorName}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              st.pendingCount > 0
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            }`}
                          >
                            {st.pendingCount} Pending
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                          {st.totalSubmissions} Submitted
                        </td>
                        <td className="p-4 text-[11px] text-slate-400 font-mono">
                          {st.latestDate ? new Date(st.latestDate).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (st.studentId) {
                                setSelectedMenteeId(st.studentId);
                              }
                              setActiveTab("cockpit");
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-500/20 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-all cursor-pointer"
                          >
                            <span>Review Submissions</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
