import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FileQuestion,
  Video,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  ChevronDown,
  Check,
} from "lucide-react";
import { useGetMyPathwaysQuery } from "../store/apiSlice";
import { getSubmissions } from "../utils/submissionsStorage";

const COURSE_STORAGE_KEY = "unisole_selected_course";

export default function DashboardPage() {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<string>(() => {
    return localStorage.getItem(COURSE_STORAGE_KEY) || "";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: myPathways = [] } = useGetMyPathwaysQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrolledCourses = useMemo(() => {
    return myPathways
      .map((item: any) => item.pathway || item)
      .filter((p: any) => p && (p.title || p.name));
  }, [myPathways]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      const exists = enrolledCourses.some((c: any) => (c.title || c.name) === selectedCohort);
      if (!selectedCohort || !exists) {
        const initial = enrolledCourses[0].title || enrolledCourses[0].name;
        setSelectedCohort(initial);
        localStorage.setItem(COURSE_STORAGE_KEY, initial);
      }
    }
  }, [enrolledCourses, selectedCohort]);

  // Sync with drawer and external events
  useEffect(() => {
    const handleCourseChange = (e: any) => {
      if (e.detail) {
        setSelectedCohort(e.detail);
      }
    };
    window.addEventListener("unisole:course-change", handleCourseChange as any);
    return () => {
      window.removeEventListener("unisole:course-change", handleCourseChange as any);
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCourseDropdownOpen(false);
      }
    };
    if (courseDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [courseDropdownOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCourseDropdownOpen(false);
      }
    };
    if (courseDropdownOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [courseDropdownOpen]);

  const activeCourse = useMemo(() => {
    if (!enrolledCourses.length) return null;
    return (
      enrolledCourses.find((c: any) => (c.title || c.name) === selectedCohort) ||
      enrolledCourses[0]
    );
  }, [enrolledCourses, selectedCohort]);

  const activeCourseTitle =
    activeCourse?.title || activeCourse?.name || selectedCohort || "Generative AI Engineering";

  const handleSelectCourse = (title: string) => {
    setSelectedCohort(title);
    setCourseDropdownOpen(false);
    localStorage.setItem(COURSE_STORAGE_KEY, title);
    window.dispatchEvent(new CustomEvent("unisole:course-change", { detail: title }));
  };

  // Submissions for the student
  const submissions = useMemo(() => {
    return getSubmissions();
  }, []);

  const completedSubmissions = useMemo(() => {
    return submissions.filter((s) => s.status === "APPROVED");
  }, [submissions]);

  // Determine continue learning items (prioritizing the active selected course)
  const continueLearningItems = useMemo(() => {
    if (enrolledCourses.length === 0) return [];
    const targetCourses = activeCourse ? [activeCourse] : enrolledCourses;
    return targetCourses.map((p: any, idx: number) => {
      const isOdd = idx % 2 === 1;
      return {
        id: p.id,
        title: p.title || p.name,
        type: isOdd ? "video" : "quiz",
        subtitle: isOdd
          ? "Interactive Module Lessons"
          : `Quiz & Notes - ${p.title?.split(" ")[0] || "Foundations"}`,
        path: `/learn/${p.id}`,
      };
    });
  }, [activeCourse, enrolledCourses]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 dark:bg-[#0B0D13] py-4 sm:py-6 transition-colors">
      <div className="max-w-2xl mx-auto px-4 space-y-5">
        {/* Active Course Switcher Card on Top */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setCourseDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#121622] hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 border border-slate-200/90 dark:border-zinc-800/90 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600/70 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {activeCourseTitle}
                  </span>
                  {enrolledCourses.length > 1 && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                      Switch
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                  {enrolledCourses.length > 0
                    ? `${enrolledCourses.length} Enrolled ${enrolledCourses.length === 1 ? "Course" : "Courses"}`
                    : "Curated Learning Track"}
                </span>
              </div>
            </div>

            <ChevronDown
              className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 ${
                courseDropdownOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
              }`}
            />
          </button>

          {/* Course Selector Dropdown Menu */}
          {courseDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-[#121622] rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 z-30 animate-fade-in space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Enrolled Courses ({enrolledCourses.length})
              </div>
              {enrolledCourses.length === 0 ? (
                <div className="p-4 text-center space-y-2">
                  <p className="text-xs text-zinc-500">No enrolled courses yet</p>
                  <Link
                    to="/catalog"
                    onClick={() => setCourseDropdownOpen(false)}
                    className="inline-block text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Browse Pathways Catalog →
                  </Link>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {enrolledCourses.map((c: any) => {
                    const title = c.title || c.name;
                    const isSelected = activeCourseTitle === title;
                    return (
                      <button
                        key={c.id || title}
                        type="button"
                        onClick={() => handleSelectCourse(title)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <span className="truncate">{title}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {enrolledCourses.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 px-2 flex items-center justify-between">
                  <Link
                    to="/enrolled"
                    onClick={() => setCourseDropdownOpen(false)}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    Manage all courses
                  </Link>
                  <Link
                    to="/catalog"
                    onClick={() => setCourseDropdownOpen(false)}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Explore Catalog →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Continue Learning Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Continue Learning
            </h2>
            <Link
              to="/enrolled"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Courses
            </Link>
          </div>

          {continueLearningItems.length === 0 ? (
            <div className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 p-8 text-center space-y-3 shadow-2xs">
              <BookOpen className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                No active courses in progress
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                You are not currently enrolled in any learning pathways. Explore our curated tracks to get started.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-xs transition-colors"
              >
                <span>Browse Pathways Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {continueLearningItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 p-3.5 sm:p-4 flex items-center gap-3.5 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-600/70 hover:shadow-xs transition-all cursor-pointer group"
                >
                  {/* Yellow/Amber Course Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-300 shadow-2xs group-hover:scale-105 transition-transform">
                    <div className="w-6 h-6 rounded-md bg-amber-200/70 dark:bg-amber-800/40 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Course & Activity Metadata */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {item.type === "quiz" ? (
                        <FileQuestion className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      ) : (
                        <Video className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      )}
                      <span className="truncate">{item.subtitle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Learning Activities Section */}
        <section className="space-y-3 pt-1">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Learning Activities
          </h2>

          {/* Tab Switcher */}
          <div className="flex items-center border-b border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-2 px-4 text-xs font-bold transition-all relative ${
                activeTab === "active"
                  ? "text-blue-600 dark:text-blue-400 font-extrabold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Active
              {activeTab === "active" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-2 px-4 text-xs font-bold transition-all relative ${
                activeTab === "completed"
                  ? "text-blue-600 dark:text-blue-400 font-extrabold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Completed
              {activeTab === "completed" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "active" ? (
            <div className="bg-white dark:bg-[#121622] rounded-3xl border border-slate-200/90 dark:border-zinc-800/90 p-8 sm:p-10 shadow-2xs flex flex-col items-center justify-center text-center">
              {/* Illustration Matching Great Learning Design */}
              <div className="w-48 h-40 relative flex items-center justify-center">
                <svg
                  className="w-full h-full max-w-[190px]"
                  viewBox="0 0 200 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Clock */}
                  <circle cx="85" cy="70" r="42" stroke="#CBD5E1" strokeWidth="2.5" strokeDasharray="4 4" fill="#F8FAFC" />
                  <path d="M85 45V70L102 70" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="85" cy="70" r="3" fill="#64748B" />

                  {/* Gear Accent */}
                  <circle cx="50" cy="115" r="10" stroke="#CBD5E1" strokeWidth="2" fill="#FFFFFF" />
                  <circle cx="50" cy="115" r="4" fill="#94A3B8" />

                  {/* Growth Bar Chart / Steps */}
                  <rect x="70" y="105" width="22" height="45" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.8" />
                  <rect x="95" y="85" width="24" height="65" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.8" />
                  <rect x="122" y="65" width="24" height="85" rx="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.8" />

                  {/* Learner Character Sitting on Step */}
                  {/* Legs */}
                  <path d="M108 95L108 120L95 120" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M116 95L116 122L125 122" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Torso */}
                  <rect x="106" y="65" width="16" height="30" rx="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
                  {/* Head */}
                  <circle cx="114" cy="54" r="7" fill="#FEF3C7" stroke="#1E293B" strokeWidth="1.8" />
                  <path d="M110 50C110 46 117 46 119 50" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Arms & Laptop */}
                  <path d="M106 75L94 85" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="85" y="82" width="14" height="8" rx="1.5" transform="rotate(-15 85 82)" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
                  {/* Pointing Arm towards clock */}
                  <path d="M120 72L100 58" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                You're all caught up
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                Check in later for new activities
              </p>

              {/* Solid Blue Button */}
              <button
                onClick={() => navigate("/enrolled")}
                className="mt-5 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                <span>View All Activities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121622] rounded-3xl border border-slate-200/90 dark:border-zinc-800/90 p-4 sm:p-6 shadow-2xs space-y-3">
              {completedSubmissions.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    No completed activities yet
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Submit your assignment URLs and pass module quizzes to record your verified progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {completedSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {sub.lessonTitle || "Assignment Submission"}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                        {sub.submissionUrl}
                      </p>
                      {sub.mentorFeedback && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                          <span className="font-semibold">Mentor Feedback:</span> {sub.mentorFeedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Explore More Catalog Link */}
        <div className="text-center pt-2 pb-4">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Looking for more pathways? Browse Full Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
