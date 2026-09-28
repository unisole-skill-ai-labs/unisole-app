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
import { useGetMyPathwaysQuery } from "../store/apiSlice";
import { getSubmissions } from "../utils/submissionsStorage";

// Curriculum completed learning activities matching Great Learning reference
const DEFAULT_COMPLETED_ACTIVITIES = [
  {
    id: "comp-1",
    type: "assignment" as const,
    category: "Assignment",
    course: "Business Intelligence using Excel",
    title: "Assignment 1",
    datePrefix: "Due",
    date: "31 Oct 26 11:59 PM",
    statusText: "Evaluation Pending",
  },
  {
    id: "comp-2",
    type: "quiz" as const,
    category: "Quiz",
    course: "Machine Learning AIML",
    title: "Code Eval with AI mentor",
    datePrefix: "Due",
    date: "31 May 26 5:29 AM",
    statusText: "Marks: 0/1",
  },
  {
    id: "comp-3",
    type: "quiz" as const,
    category: "Quiz",
    course: "Machine Learning AIML",
    title: "K-means Clustering: Graded Quiz",
    datePrefix: "Due",
    date: "31 May 26 5:29 AM",
    statusText: "Marks: 1/10",
  },
  {
    id: "comp-4",
    type: "quiz" as const,
    category: "Quiz",
    course: "Machine Learning AIML",
    title: "Weekly Quiz - Decision Tree",
    datePrefix: "Due",
    date: "31 May 26 5:29 AM",
    statusText: "Marks: 0/10",
  },
  {
    id: "comp-5",
    type: "quiz" as const,
    category: "Quiz",
    course: "Machine Learning AIML",
    title: "Weekly Quiz - Linear Regression",
    datePrefix: "Due",
    date: "31 May 26 5:29 AM",
    statusText: "Marks: 0/10",
  },
  {
    id: "comp-6",
    type: "quiz" as const,
    category: "Quiz",
    course: "Introduction to Marketing",
    title: "Essay Quiz",
    datePrefix: "From",
    date: "07 Aug 25 12:00 AM",
    statusText: "Evaluation Pending",
  },
];

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

  const enrolledCourses = useMemo(() => {
    return myPathways
      .map((item: any) => item.pathway || item)
      .filter((p: any) => p && (p.title || p.name));
  }, [myPathways]);

  // Submissions for the student
  const submissions = useMemo(() => {
    return getSubmissions();
  }, []);

  const completedSubmissions = useMemo(() => {
    return submissions.filter((s) => s.status === "APPROVED");
  }, [submissions]);

  // Top active course banner matching Great Learning layout
  const topCourse = useMemo(() => {
    const primary = enrolledCourses[0];
    const title = primary?.title || primary?.name || "Machine Learning AIML";
    const courseId = primary?.id || "ml-aiml";
    return {
      id: courseId,
      title: title,
      subtitle: "Hierarchical Clustering · 28 Mins 23 Secs Left",
      path: primary?.id ? `/learn/${primary.id}` : "/catalog",
    };
  }, [enrolledCourses]);

  // Combined completed activities list (real approved submissions + verified curriculum quiz & assignments)
  const completedList = useMemo(() => {
    const userCompleted = completedSubmissions.map((sub) => ({
      id: sub.id,
      type: "assignment" as const,
      category: "Assignment",
      course: sub.courseTitle || (enrolledCourses[0]?.title || "Applied Machine Learning"),
      title: sub.lessonTitle || "Project Assignment",
      datePrefix: "Due",
      date: new Date(sub.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      statusText: sub.mentorFeedback ? "Evaluation Complete" : "Evaluation Pending",
    }));

    return [...userCompleted, ...DEFAULT_COMPLETED_ACTIVITIES];
  }, [completedSubmissions, enrolledCourses]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 dark:bg-[#0B0D13] py-4 sm:py-6 transition-colors">
      <div className="max-w-xl mx-auto px-4 space-y-5">
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
            <div className="space-y-3">
              {completedList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-200 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center gap-3.5"
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
                    {/* Small Green Circle with White Checkmark at Bottom Right */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-[#121622] shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Activity Metadata Column */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
                      {item.category} · {item.course}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                      {item.datePrefix}: {item.date} · {item.statusText}
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
