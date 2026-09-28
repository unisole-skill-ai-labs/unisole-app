import React, { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FileQuestion,
  FileText,
  Video,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Layers,
  LayoutGrid,
  Check,
} from "lucide-react";
import { useGetMyPathwaysQuery, useGetStudentActivitiesQuery } from "../store/apiSlice";

export default function DashboardPage() {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Default to "completed" tab as shown in the reference screenshot
  const [activeTab, setActiveTab] = useState<"active" | "completed">(() => {
    const tab = searchParams.get("tab");
    return tab === "active" ? "active" : "completed";
  });

  const { data: myPathways = [] } = useGetMyPathwaysQuery(undefined, {
    skip: !isAuthenticated,
  });

  const { data: activitiesData, isLoading: isActivitiesLoading } = useGetStudentActivitiesQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrolledCourses = useMemo(() => {
    return myPathways
      .map((item: any) => item.pathway || item)
      .filter((p: any) => p && (p.title || p.name));
  }, [myPathways]);

  // Top active course banner matching student's enrolled pathway
  const topCourse = useMemo(() => {
    const primary = enrolledCourses[0];
    if (!primary) {
      return {
        id: "",
        title: "Explore Learning Pathways",
        subtitle: "Enroll in a curriculum to start your hands-on journey",
        path: "/catalog",
      };
    }
    const title = primary.title || primary.name;
    const courseId = primary.id || primary.slug;
    return {
      id: courseId,
      title: title,
      subtitle: `${primary.shortDescription || "Continue your next structured learning milestone"} · In Progress`,
      path: `/learn/${courseId}`,
    };
  }, [enrolledCourses]);

  // Dynamic completed and scheduled activities from backend
  const completedList = useMemo(() => {
    return activitiesData?.completed || [];
  }, [activitiesData]);

  const activeList = useMemo(() => {
    const scheduledGroups = activitiesData?.scheduled || [];
    return scheduledGroups.flatMap((g: any) => g.items || []);
  }, [activitiesData]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 dark:bg-[#0B0D13] py-4 sm:py-8 transition-colors">
      <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Active Course & Next Lesson Card (Great Learning Style) */}
        <div
          onClick={() => navigate(topCourse.path)}
          className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 p-4 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all cursor-pointer group"
        >
          {/* Amber 4-Square Thumbnail */}
          <div className="w-12 h-12 rounded-xl bg-[#FDE8B3] dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-center shrink-0 text-[#B87708] dark:text-amber-300 shadow-2xs group-hover:scale-105 transition-transform">
            <LayoutGrid className="w-6 h-6 stroke-[1.8]" />
          </div>

          {/* Course & Next Activity Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {topCourse.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400 truncate">
              <Video className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0 stroke-[2]" />
              <span className="truncate">{topCourse.subtitle}</span>
            </div>
          </div>
        </div>

        {/* Learning Activities Section */}
        <section className="space-y-3.5 pt-1">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Learning Activities
          </h2>

          {/* Tab Switcher */}
          <div className="flex items-center border-b border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-2.5 px-6 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === "active"
                  ? "text-blue-600 dark:text-blue-400 font-bold"
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
              className={`pb-2.5 px-6 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === "completed"
                  ? "text-blue-600 dark:text-blue-400 font-bold"
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
          {activeTab === "completed" ? (
            completedList.length === 0 ? (
              <div className="bg-white dark:bg-[#121622] rounded-3xl border border-slate-200/90 dark:border-zinc-800/90 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  No completed learning activities yet
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                  Complete video lectures, quizzes, or hands-on assignments to track your progress and marks here.
                </p>
                {topCourse.id && (
                  <button
                    onClick={() => navigate(topCourse.path)}
                    className="mt-2 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-5 rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {completedList.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => item.pathwayId && navigate(`/learn/${item.pathwayId}`)}
                    className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center gap-3.5 cursor-pointer group"
                  >
                    {/* Left Icon with Green Checkmark Badge */}
                    <div className="relative shrink-0">
                      {item.type === "assignment" ? (
                        <div className="w-11 h-11 rounded-xl bg-rose-100/80 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-2xs">
                          <FileText className="w-5 h-5 stroke-[1.8]" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#DCF8C6]/80 dark:bg-lime-950/50 border border-lime-200/70 dark:border-lime-900/30 flex items-center justify-center text-lime-800 dark:text-lime-400 shadow-2xs">
                          <FileQuestion className="w-5 h-5 stroke-[1.8]" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-[#121622] shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Activity Metadata Column */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                        {item.category} · {item.course}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                        {item.datePrefix}: {item.date} · {item.statusText}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeList.length > 0 ? (
            <div className="space-y-3">
              {activeList.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => item.pathwayId && navigate(`/learn/${item.pathwayId}`)}
                  className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center gap-3.5 cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-2xs">
                    {item.type === "quiz" ? (
                      <FileQuestion className="w-5 h-5 stroke-[1.8]" />
                    ) : (
                      <FileText className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 truncate">
                      {item.category} · {item.course}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                      {item.dateText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
                  <path d="M108 95L108 120L95 120" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M116 95L116 122L125 122" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <rect x="106" y="65" width="16" height="30" rx="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
                  <circle cx="114" cy="54" r="7" fill="#FEF3C7" stroke="#1E293B" strokeWidth="1.8" />
                  <path d="M110 50C110 46 117 46 119 50" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M106 75L94 85" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="85" y="82" width="14" height="8" rx="1.5" transform="rotate(-15 85 82)" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
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
                onClick={() => navigate("/activities")}
                className="mt-5 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-6 rounded-full shadow-xs transition-colors cursor-pointer"
              >
                <span>View All Activities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
