import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  SlidersHorizontal,
  FileText,
  FileQuestion,
  Check,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useGetStudentActivitiesQuery } from "../store/apiSlice";

interface ScheduledActivity {
  id: string;
  lessonId?: string;
  pathwayId?: string;
  type: "assignment" | "quiz" | "practice-quiz";
  category: string;
  course: string;
  title: string;
  dateText: string;
  isUrgent?: boolean;
  iconStyle: "rose" | "crimson" | "lime";
}

interface MonthGroup {
  month: string;
  items: ScheduledActivity[];
}

export default function ActivitiesPage() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "assignment" | "quiz">("all");

  const { data: activitiesData, isLoading } = useGetStudentActivitiesQuery(undefined);

  const currentMonthLabel = useMemo(() => {
    return new Date().toLocaleString("default", { month: "long", year: "numeric" });
  }, []);

  const scheduledGroups: MonthGroup[] = useMemo(() => {
    return activitiesData?.scheduled || [];
  }, [activitiesData]);

  const filteredGroups = useMemo(() => {
    return scheduledGroups
      .map((group) => {
        const items = group.items.filter((item) => {
          if (selectedFilter === "assignment") return item.type === "assignment";
          if (selectedFilter === "quiz") return item.type === "quiz" || item.type === "practice-quiz";
          return true;
        });
        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [scheduledGroups, selectedFilter]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#0B0D13] py-5 sm:py-8 transition-colors">
      <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        {/* Title Bar with Filter Button */}
        <div className="flex items-center justify-between relative">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Activities
          </h1>

          <div className="relative">
            <button
              onClick={() => setFilterOpen((prev) => !prev)}
              aria-label="Filter Activities"
              className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-[#121622] rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-1.5 z-30 animate-fade-in text-xs space-y-0.5">
                <button
                  onClick={() => {
                    setSelectedFilter("all");
                    setFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                    selectedFilter === "all"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span>All Activities</span>
                  {selectedFilter === "all" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter("assignment");
                    setFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                    selectedFilter === "assignment"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span>Assignments Only</span>
                  {selectedFilter === "assignment" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  onClick={() => {
                    setSelectedFilter("quiz");
                    setFilterOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                    selectedFilter === "quiz"
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <span>Quizzes Only</span>
                  {selectedFilter === "quiz" && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Calendar / Month Navigation Header Bar */}
        <div className="flex items-center gap-2.5 py-1">
          <CalendarIcon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[2]" />
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {filteredGroups[0]?.month || currentMonthLabel}
          </span>
        </div>

        {/* Grouped Month Timelines */}
        <div className="space-y-6 pt-1">
          {filteredGroups.length === 0 ? (
            <div className="bg-white dark:bg-[#121622] rounded-3xl border border-slate-200/90 dark:border-zinc-800/90 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                You're all caught up!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                There are no pending activities or upcoming deadlines for your enrolled courses right now.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-2 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-5 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                <span>Return to Dashboard</span>
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <section key={group.month} className="space-y-2.5">
                {/* Month Section Header */}
                <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {group.month}
                </h2>

                {/* Cards within this month */}
                <div className="space-y-2.5">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => item.pathwayId && navigate(`/learn/${item.pathwayId}`)}
                      className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center gap-3.5 cursor-pointer group"
                    >
                    {/* Left Icon Badge */}
                    <div className="relative shrink-0">
                      {item.iconStyle === "rose" && (
                        <div className="w-11 h-11 rounded-xl bg-rose-100/80 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-2xs">
                          <FileText className="w-5 h-5 stroke-[1.8]" />
                        </div>
                      )}

                      {item.iconStyle === "crimson" && (
                        <div className="w-11 h-11 rounded-xl bg-[#C51E28] flex items-center justify-center text-white shadow-2xs">
                          <FileQuestion className="w-5 h-5 stroke-[2]" />
                        </div>
                      )}

                      {item.iconStyle === "lime" && (
                        <div className="w-11 h-11 rounded-xl bg-[#DCF8C6]/90 dark:bg-lime-950/50 border border-lime-200/70 dark:border-lime-900/30 flex items-center justify-center text-lime-800 dark:text-lime-400 shadow-2xs">
                          <FileQuestion className="w-5 h-5 stroke-[1.8]" />
                        </div>
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                        {item.category} · {item.course}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                        {item.title}
                      </h3>
                      <div
                        className={`text-[11px] truncate mt-0.5 font-medium ${
                          item.isUrgent
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {item.dateText}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )))}
        </div>

        {/* Footer matching screenshot */}
        <div className="pt-16 pb-8 text-center space-y-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <p>© 2026 Unisole Skill AI Labs Pvt. Ltd. All rights reserved</p>
          <div className="flex items-center justify-center gap-2 text-[11px]">
            <Link to="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
