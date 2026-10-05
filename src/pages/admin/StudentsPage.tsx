import React, { useState } from "react";
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
} from "lucide-react";
import { useGetAdminStudentsQuery } from "../../store/apiSlice";

export default function StudentsPage() {
  const { data: students = [], isLoading } = useGetAdminStudentsQuery(undefined);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "STUDENT" | "MENTOR">("ALL");

  const filteredStudents = students.filter((s: any) => {
    const nameMatch = (s.name || "").toLowerCase().includes(search.toLowerCase());
    const phoneMatch = (s.phone || "").toLowerCase().includes(search.toLowerCase());
    const emailMatch = (s.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesSearch = nameMatch || phoneMatch || emailMatch;
    const matchesRole =
      roleFilter === "ALL"
        ? true
        : roleFilter === "STUDENT"
        ? s.role === "STUDENT" || !s.role
        : s.role === "MENTOR" || s.role === "ADMIN";
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-sky-500" />
            <span>Students & Cohort Members</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Directory of enrolled students, learner status, and account activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            Total Learners: {students.length}
          </span>
        </div>
      </div>

      {/* Search Bar & Role Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start sm:self-auto">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              roleFilter === "ALL"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setRoleFilter("STUDENT")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              roleFilter === "STUDENT"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter("MENTOR")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              roleFilter === "MENTOR"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Mentors & Staff
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-[#070A11]/60">
                <th className="p-4">Student</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Loading student roster...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No students found matching your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st: any) => (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center shrink-0 border border-sky-500/20 text-xs">
                          {(st.name || st.phone || "S")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {st.name || "Student"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: {st.id.slice(0, 10)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {st.phone || st.email || "No direct phone"}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                        {st.role || "STUDENT"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Active Learner</span>
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-400 font-mono text-[11px]">
                      {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : "Active"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
