import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Search,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import {
  useGetAdminStudentsQuery,
  useGetAdminCoursesQuery,
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

  const isProgramManager =
    userRoles.includes("PROGRAM_MANAGER") &&
    !userRoles.includes("SUPER_ADMIN") &&
    !userRoles.includes("ADMIN");

  const [selectedCourseId, setSelectedCourseId] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Fetch Courses for Dropdown Filter
  const { data: courses = [] } = useGetAdminCoursesQuery(undefined);

  // Fetch Students (Enrolled-only for Program Managers)
  const { data: students = [], isLoading } = useGetAdminStudentsQuery({
    enrolledOnly: isProgramManager ? true : undefined,
    courseId: selectedCourseId !== "ALL" ? selectedCourseId : undefined,
  });

  // Client-side quick filter
  const filteredStudents = useMemo(() => {
    return students.filter((st: any) => {
      // If program manager: only show students with at least 1 course
      if (isProgramManager && (!st.enrolledCourses || st.enrolledCourses.length === 0)) {
        return false;
      }

      const query = search.trim().toLowerCase();
      if (!query) return true;

      const nameMatch = (st.name || "").toLowerCase().includes(query);
      const phoneMatch = (st.phone || "").toLowerCase().includes(query);
      const emailMatch = (st.email || "").toLowerCase().includes(query);
      const courseMatch = (st.enrolledCourses || []).some(
        (c: any) =>
          (c.title || "").toLowerCase().includes(query) ||
          (c.slug || "").toLowerCase().includes(query)
      );

      return nameMatch || phoneMatch || emailMatch || courseMatch;
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
            <span>Enrolled Students</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isProgramManager
              ? "Program Manager view: Tracking enrolled students across courses and learning tracks."
              : "Directory of enrolled students across courses and curriculum tracks."}
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="flex items-center gap-2">
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
            placeholder="Search by student name, phone, or course..."
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
      {/* Students & Courses Table */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/60">
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Enrolled Course(s)</th>
                <th className="py-3.5 px-5 text-right">Enrolled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    Loading student course roster from database...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    {isProgramManager
                      ? "No enrolled students found. Only students with active course enrollments are visible."
                      : "No students matching your filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st: any) => {
                  const enrolledCourses: any[] = st.enrolledCourses || [];
                  const hasEnrollments = enrolledCourses.length > 0;

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

                      {/* Column 3: Enrolled Course(s) (Clean, Elegant List - No Janky Tags) */}
                      <td className="py-4 px-5">
                        {hasEnrollments ? (
                          <div className="space-y-1.5 max-w-xl">
                            {enrolledCourses.map((c: any, cIdx: number) => (
                              <div
                                key={c.enrollmentId || `${c.id}-${cIdx}`}
                                className="flex items-center gap-2"
                              >
                                <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                  <BookOpen className="w-3 h-3" />
                                </div>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
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

                      {/* Column 4: Enrolled Date */}
                      <td className="py-4 px-5 text-right text-slate-500 dark:text-slate-400 font-medium text-xs whitespace-nowrap">
                        {enrolledCourses[0]?.enrolledAt
                          ? new Date(enrolledCourses[0].enrolledAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : st.createdAt
                          ? new Date(st.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Active"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


