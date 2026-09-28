import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  SlidersHorizontal,
  FileText,
  FileQuestion,
  Check,
  ChevronDown,
} from "lucide-react";

interface ScheduledActivity {
  id: string;
  type: "assignment" | "quiz" | "practice-quiz";
  category: string;
  course: string;
  title: string;
  dateText: string;
  isUrgent?: boolean; // Red highlighted date text
  iconStyle: "rose" | "crimson" | "lime";
}

interface MonthGroup {
  month: string;
  items: ScheduledActivity[];
}

const SCHEDULED_ACTIVITIES: MonthGroup[] = [
  {
    month: "December 2025",
    items: [
      {
        id: "act-1",
        type: "assignment",
        category: "Assignment",
        course: "Program Overview AIML",
        title: "Multiple file upload",
        dateText: "From: 23 Dec 25 6:35 PM",
        iconStyle: "rose",
      },
    ],
  },
  {
    month: "February 2026",
    items: [
      {
        id: "act-2",
        type: "quiz",
        category: "Quiz",
        course: "Introduction to Python",
        title: "Unpublished quiz 2",
        dateText: "17 Feb 26 12:00 AM - 26 Feb 26 12:00 AM",
        isUrgent: true,
        iconStyle: "crimson",
      },
      {
        id: "act-3",
        type: "quiz",
        category: "Quiz",
        course: "Introduction to Python",
        title: "Mid Term Assessment - Slot 1 - Proctored",
        dateText: "24 Feb 26 2:45 PM - 24 Feb 26 5:45 PM",
        isUrgent: true,
        iconStyle: "crimson",
      },
    ],
  },
  {
    month: "June 2026",
    items: [
      {
        id: "act-4",
        type: "quiz",
        category: "Quiz",
        course: "Business Intelligence using Excel",
        title: "Sample Quiz",
        dateText: "02 Jun 26 7:45 PM - 08 Jun 26 7:45 PM",
        isUrgent: true,
        iconStyle: "crimson",
      },
    ],
  },
  {
    month: "August 2026",
    items: [
      {
        id: "act-5",
        type: "practice-quiz",
        category: "Practice Quiz",
        course: "Machine Learning AIML",
        title: "AIML Basics",
        dateText: "From: 06 Aug 26 6:10 PM",
        iconStyle: "lime",
      },
    ],
  },
];

export default function ActivitiesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "assignment" | "quiz">("all");
  const [selectedMonth, setSelectedMonth] = useState("November 2025");

  const filteredGroups = SCHEDULED_ACTIVITIES.map((group) => {
    const items = group.items.filter((item) => {
      if (selectedFilter === "assignment") return item.type === "assignment";
      if (selectedFilter === "quiz") return item.type === "quiz" || item.type === "practice-quiz";
      return true;
    });
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#0B0D13] py-5 sm:py-8 transition-colors">
      <div className="max-w-xl mx-auto px-4 space-y-5 animate-fade-in">
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
            {selectedMonth}
          </span>
        </div>

        {/* Grouped Month Timelines */}
        <div className="space-y-6 pt-1">
          {filteredGroups.map((group) => (
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
                    className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center gap-3.5"
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
          ))}
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
