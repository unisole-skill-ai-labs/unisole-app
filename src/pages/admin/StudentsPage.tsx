import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Search,
  BookOpen,
  GraduationCap,
  UserCheck,
  ShieldAlert,
  X,
  Check,
  Loader2,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import {
  useGetAdminStudentsQuery,
  useGetAdminCoursesQuery,
  useGetAdminMentorsQuery,
  useAssignMentorMutation,
  useUnassignMentorMutation,
} from "../../store/apiSlice";

export default function StudentsPage() {
  const { user } = useSelector((state: any) => state.auth);

  const userRoles = useMemo(() => {
    const primary = user?.role ? String(user.role).toUpperCase() : "";
    const secondary = Array.isArray(user?.roles)
      ? user.roles.map((r: any) => String(r).toUpperCase())
      : Array.isArray(user?.metadata?.roles)
      ? user.metadata.roles.map((r: any) => String(r).toUpperCase())
      : [];
    return [primary, ...secondary];
  }, [user]);

  const isAdmin =
    userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");

  const isProgramManager =
    userRoles.includes("PROGRAM_MANAGER") && !isAdmin;

  const [selectedCourseId, setSelectedCourseId] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Queries
  const { data: courses = [] } = useGetAdminCoursesQuery(undefined);
  const { data: mentors = [], isLoading: isLoadingMentors } = useGetAdminMentorsQuery(undefined);
  const { data: students = [], isLoading: isLoadingStudents, refetch: refetchStudents } = useGetAdminStudentsQuery({
    role: "STUDENT",
    enrolledOnly: true,
    courseId: selectedCourseId !== "ALL" ? selectedCourseId : undefined,
  });

  // Mutations
  const [assignMentorApi, { isLoading: isAssigning }] = useAssignMentorMutation();
  const [unassignMentorApi, { isLoading: isUnassigning }] = useUnassignMentorMutation();

  // Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState<any>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [assignmentCourseId, setAssignmentCourseId] = useState<string>("");
  const [modalFeedback, setModalFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const openAssignModal = (student: any) => {
    setTargetStudent(student);
    const existing = student.assignedMentor?.mentorId || mentors[0]?.id || "";
    setSelectedMentorId(existing);
    const firstCourse = student.enrolledCourses?.[0]?.id || "";
    setAssignmentCourseId(firstCourse);
    setModalFeedback(null);
    setAssignModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudent || !selectedMentorId) return;

    try {
      setModalFeedback(null);
      await assignMentorApi({
        mentorId: selectedMentorId,
        menteeIds: [targetStudent.id],
        courseId: assignmentCourseId || undefined,
      }).unwrap();

      setModalFeedback({
        type: "success",
        message: "Mentor successfully assigned to learner!",
      });

      refetchStudents();
      setTimeout(() => {
        setAssignModalOpen(false);
        setModalFeedback(null);
      }, 1200);
    } catch (err: any) {
      setModalFeedback({
        type: "error",
        message: err?.data?.error || "Failed to assign mentor. Please verify permissions.",
      });
    }
  };

  const handleUnassignMentor = async () => {
    if (!targetStudent) return;
    try {
      setModalFeedback(null);
      await unassignMentorApi({
        menteeId: targetStudent.id,
      }).unwrap();

      setModalFeedback({
        type: "success",
        message: "Mentor unassigned successfully.",
      });

      refetchStudents();
      setTimeout(() => {
        setAssignModalOpen(false);
        setModalFeedback(null);
      }, 1200);
    } catch (err: any) {
      setModalFeedback({
        type: "error",
        message: err?.data?.error || "Failed to remove mentor assignment.",
      });
    }
  };

  // Client-side quick filter
  const filteredStudents = useMemo(() => {
    return students.filter((st: any) => {
      if (isProgramManager && (!st.enrolledCourses || st.enrolledCourses.length === 0)) {
        return false;
      }

      const query = search.trim().toLowerCase();
      if (!query) return true;

      const nameMatch = (st.name || "").toLowerCase().includes(query);
      const phoneMatch = (st.phone || "").toLowerCase().includes(query);
      const emailMatch = (st.email || "").toLowerCase().includes(query);
      const mentorMatch = (st.assignedMentor?.mentorName || "").toLowerCase().includes(query);
      const courseMatch = (st.enrolledCourses || []).some(
        (c: any) =>
          (c.title || "").toLowerCase().includes(query) ||
          (c.slug || "").toLowerCase().includes(query)
      );

      return nameMatch || phoneMatch || emailMatch || mentorMatch || courseMatch;
    });
  }, [students, search, isProgramManager]);

  const totalEnrolledCount = students.filter(
    (s: any) => s.enrolledCourses && s.enrolledCourses.length > 0
  ).length;

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* ------------------------------------------------------------- */}
      {/* Header */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Enrolled Students & Mentor Allocations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? "Platform Admin view: Manage learner enrollments and assign dedicated mentors to mentees."
              : isProgramManager
              ? "Program Manager view: Tracking enrolled students. Note: Mentor assignments are managed by Platform Admins."
              : "Directory of enrolled students and assigned academic mentors."}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isAdmin && (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Admin-Only Mentor Assignments</span>
            </span>
          )}
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5 shadow-2xs">
            <GraduationCap className="w-4 h-4" />
            <span>Enrolled Students: {totalEnrolledCount}</span>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Filters Bar: Search + Course Dropdown */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, mentor, phone, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40 shadow-2xs"
          />
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#0B1120] px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs shadow-2xs self-start sm:self-auto">
          <BookOpen className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="text-slate-400 font-medium">Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Enrolled Courses</option>
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Students & Mentors Table */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/60">
                <th className="py-3.5 px-5">Learner</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Enrolled Course(s)</th>
                <th className="py-3.5 px-5">Assigned Mentor</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoadingStudents ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Loading student roster & mentor allocations from database...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    {isProgramManager
                      ? "No enrolled students found. Only students with active course enrollments are visible."
                      : "No students matching your filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st: any) => {
                  const enrolledCourses: any[] = st.enrolledCourses || [];
                  const hasEnrollments = enrolledCourses.length > 0;
                  const assignedMentor = st.assignedMentor;

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Column 1: Student Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shrink-0 border border-purple-500/20 text-xs shadow-2xs">
                            {(st.name || st.phone || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {st.name || "Student"}
                              </span>
                              {hasEnrollments && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                                  {enrolledCourses.length}{" "}
                                  {enrolledCourses.length === 1 ? "Course" : "Courses"}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {st.id.slice(0, 10)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Contact Info */}
                      <td className="py-4 px-5 font-mono text-[11px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {st.phone || "—"}
                          </span>
                          {st.email && (
                            <span className="text-[10px] text-slate-400 font-sans">
                              {st.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Enrolled Course(s) */}
                      <td className="py-4 px-5">
                        {hasEnrollments ? (
                          <div className="space-y-1.5 max-w-sm">
                            {enrolledCourses.map((c: any, cIdx: number) => (
                              <div
                                key={c.enrollmentId || `${c.id}-${cIdx}`}
                                className="flex items-center gap-2"
                              >
                                <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                  <BookOpen className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug truncate">
                                  {c.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            No enrolled courses
                          </span>
                        )}
                      </td>

                      {/* Column 4: Assigned Mentor */}
                      <td className="py-4 px-5">
                        {assignedMentor ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center shrink-0 border border-sky-500/20 text-[11px]">
                              {assignedMentor.mentorName[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                {assignedMentor.mentorName}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {assignedMentor.specialization || "Technical Mentor"}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Column 5: Action Controls */}
                      <td className="py-4 px-5 text-right">
                        {isAdmin ? (
                          <button
                            onClick={() => openAssignModal(st)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{assignedMentor ? "Change Mentor" : "Assign Mentor"}</span>
                          </button>
                        ) : (
                          <span
                            title="Only platform administrators can assign mentors to mentees"
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic cursor-not-allowed"
                          >
                            <ShieldAlert className="w-3 h-3 text-slate-400" />
                            <span>Admin Managed</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Assign Mentor Modal (Admin Only) */}
      {/* ------------------------------------------------------------- */}
      {assignModalOpen && targetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Assign Mentor to Learner
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Administrator allocation control
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
              {/* Feedback Alert */}
              {modalFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    modalFeedback.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {modalFeedback.type === "success" ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                  )}
                  <span>{modalFeedback.message}</span>
                </div>
              )}

              {/* Student Summary Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Mentee / Student:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {targetStudent.name || "Student"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Contact Phone:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {targetStudent.phone || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Current Status:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {targetStudent.assignedMentor ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Guided by {targetStudent.assignedMentor.mentorName}
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold">Awaiting Mentor</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Mentor Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                  <span>Select Mentor</span>
                  {isLoadingMentors && <span className="text-[10px] text-slate-400">Loading mentors...</span>}
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                >
                  <option value="" disabled>
                    Choose an authorized mentor...
                  </option>
                  {mentors.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.specialization || "Technical Mentor"} ({m.activeMenteesCount} active mentees)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Select a mentor with available workload capacity.
                </p>
              </div>

              {/* Course Scope (Optional) */}
              {targetStudent.enrolledCourses && targetStudent.enrolledCourses.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Curriculum / Course Scope
                  </label>
                  <select
                    value={assignmentCourseId}
                    onChange={(e) => setAssignmentCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  >
                    <option value="">Global (All enrolled courses)</option>
                    {targetStudent.enrolledCourses.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                {targetStudent.assignedMentor ? (
                  <button
                    type="button"
                    onClick={handleUnassignMentor}
                    disabled={isUnassigning || isAssigning}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isUnassigning ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Unassign</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAssigning || !selectedMentorId}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Confirm Assignment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
