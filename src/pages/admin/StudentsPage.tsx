import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  User as UserIcon,
  Shield,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  Filter,
  Layers,
  ArrowUpRight,
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PURCHASED">("ALL");

  // Fetch Courses for Dropdown Filter
  const { data: courses = [] } = useGetAdminCoursesQuery(undefined);

  // Fetch Students (Scoping enrolledOnly for Program Managers or by default)
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
      const nameMatch = (st.name || "").toLowerCase().includes(query);
      const phoneMatch = (st.phone || "").toLowerCase().includes(query);
      const emailMatch = (st.email || "").toLowerCase().includes(query);
      const courseMatch = (st.enrolledCourses || []).some(
        (c: any) =>
          (c.title || "").toLowerCase().includes(query) ||
          (c.slug || "").toLowerCase().includes(query)
      );
      const matchesSearch = !query || nameMatch || phoneMatch || emailMatch || courseMatch;

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "ACTIVE") {
        matchesStatus = (st.enrolledCourses || []).some((c: any) => c.status === "ACTIVE");
      } else if (statusFilter === "PURCHASED") {
        matchesStatus = (st.enrolledCourses || []).some(
          (c: any) => c.source === "PURCHASE" || Boolean(c.orderId)
        );
      }

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter, isProgramManager]);

  // Aggregate stats
  const totalEnrolledCount = students.filter(
    (s: any) => s.enrolledCourses && s.enrolledCourses.length > 0
  ).length;

  const totalPurchasesCount = students.reduce(
    (acc: number, s: any) =>
      acc +
      (s.enrolledCourses || []).filter(
        (c: any) => c.source === "PURCHASE" || Boolean(c.orderId)
      ).length,
    0
  );

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* ------------------------------------------------------------- */}
      {/* Top Header */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Enrolled Students & Course Roster</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isProgramManager
              ? "Program Manager view: Tracking students enrolled in courses, purchased tracks, and learning progress."
              : "Directory of students enrolled in courses, active cohort members, and purchased tracks."}
          </p>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Enrolled Students: {totalEnrolledCount}</span>
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Purchased Courses: {totalPurchasesCount}</span>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Filters Bar: Search + Course Dropdown + Status Pills */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, phone, or course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Course Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#0B1120] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 text-xs shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-purple-500 shrink-0" />
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

          {/* Quick Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === "ALL"
                  ? "bg-white dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              All ({filteredStudents.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-white dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter("PURCHASED")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === "PURCHASED"
                  ? "bg-white dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold shadow-2xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              Purchased ({totalPurchasesCount})
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Students & Courses Table */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/60">
                <th className="p-4">Student</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Enrolled Course(s) & Tracks</th>
                <th className="p-4">Enrollment Status</th>
                <th className="p-4 text-right">Enrolled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Loading student course roster from database...
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

                  return (
                    <tr
                      key={st.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="p-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold flex items-center justify-center shrink-0 border border-purple-500/20 text-xs shadow-2xs">
                            {(st.name || st.phone || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{st.name || "Student"}</span>
                              {hasEnrollments && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
                                  {enrolledCourses.length}{" "}
                                  {enrolledCourses.length === 1 ? "Track" : "Tracks"}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {st.id.slice(0, 10)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {st.phone || "No phone"}
                          </span>
                          {st.email && (
                            <span className="text-[10px] text-slate-400 font-sans">
                              {st.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Enrolled Courses Badges (Visible Courses) */}
                      <td className="p-4">
                        {hasEnrollments ? (
                          <div className="flex flex-wrap items-center gap-1.5 max-w-lg">
                            {enrolledCourses.map((c: any, cIdx: number) => {
                              const isPaid = c.source === "PURCHASE" || Boolean(c.orderId);
                              return (
                                <div
                                  key={c.enrollmentId || `${c.id}-${cIdx}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px]"
                                >
                                  <BookOpen className="w-3 h-3 text-purple-500 shrink-0" />
                                  <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-[200px]">
                                    {c.title}
                                  </span>

                                  {isPaid && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      Bought
                                    </span>
                                  )}

                                  {c.status && (
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                        c.status === "ACTIVE"
                                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                          : c.status === "COMPLETED"
                                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                      }`}
                                    >
                                      {c.status}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            No enrolled courses
                          </span>
                        )}
                      </td>

                      {/* Enrollment Status */}
                      <td className="p-4">
                        {hasEnrollments ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Enrolled Learner</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            Registered Account
                          </span>
                        )}
                      </td>

                      {/* Enrolled Date */}
                      <td className="p-4 text-right text-slate-400 font-mono text-[11px]">
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

