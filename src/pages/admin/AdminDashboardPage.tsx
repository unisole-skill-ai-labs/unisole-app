import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  ClipboardCheck,
  FolderArchive,
  Users,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  FileText,
  Layers,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  useGetAdminCoursesQuery,
  useGetAdminLessonsQuery,
  useGetAdminStudentsQuery,
} from "../../store/apiSlice";
import { getSubmissions } from "../../utils/submissionsStorage";

export default function AdminDashboardPage() {
  const { user } = useSelector((state: any) => state.auth);
  const { data: courses = [], isLoading: coursesLoading } = useGetAdminCoursesQuery(undefined);
  const { data: lessons = [], isLoading: lessonsLoading } = useGetAdminLessonsQuery(undefined);
  const { data: students = [], isLoading: studentsLoading } = useGetAdminStudentsQuery(undefined);

  const publishedCourses = courses.filter((c: any) => c.status === "PUBLISHED").length;
  const publishedLessons = lessons.filter((l: any) => l.status === "PUBLISHED").length;
  const draftLessons = lessons.filter((l: any) => l.status === "DRAFT").length;

  const allSubmissions = getSubmissions();
  const pendingSubmissionsCount = allSubmissions.filter((s) => s.status === "PENDING").length;

  // State for Chart Filters matching the reference
  const [velocityPeriod, setVelocityPeriod] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");
  const [statsPeriod, setStatsPeriod] = useState<"New" | "Today" | "Month">("Today");
  const [diagnosticsPeriod, setDiagnosticsPeriod] = useState<"New" | "Today" | "Month">("Today");

  // Quick Action / Course entity cards (Row 1 Carousel)
  const quickCards = [
    {
      id: "qc-1",
      icon: FileText,
      iconColor: "bg-blue-500/10 text-blue-500",
      title: "AI Agent Architecture",
      desc: "Production multi-agent routing with state memory store and live evaluations...",
      time: "11:32",
      tag: "Core Module",
      author: "May Padilla",
      authorRole: "Course Author",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60",
      link: "/admin/courses",
    },
    {
      id: "qc-2",
      icon: Layers,
      iconColor: "bg-amber-500/10 text-amber-500",
      title: "Category <Templates>",
      desc: "Dense vector embeddings and hybrid BM25 reciprocal rank fusion pipelines...",
      time: "11:20",
      tag: "New Category",
      author: "Erik Pitman",
      authorRole: "Curriculum Lead",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60",
      link: "/admin/courses",
    },
    {
      id: "qc-3",
      icon: Users,
      iconColor: "bg-rose-500/10 text-rose-500",
      title: "New User Alberta Colon",
      desc: "Mentee onboarding completed with diagnostic assessment benchmark score...",
      time: "11:32",
      tag: "New Mentee",
      author: "Erik Pitman",
      authorRole: "Lead Mentor",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60",
      link: "/admin/students",
    },
    {
      id: "qc-4",
      icon: Award,
      iconColor: "bg-emerald-500/10 text-emerald-500",
      title: "Add New Post <Second Post>",
      desc: "Weekly sprint capstone milestone evaluations ready for mentor scoring...",
      time: "11:32",
      tag: "Milestone",
      author: "Lucinda Wills",
      authorRole: "Staff Reviewer",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60",
      link: "/admin/submissions",
    },
  ];

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* ------------------------------------------------------------- */}
      {/* ROW 1: Quick Action / Entity Carousel Cards */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-w-[760px] lg:min-w-0">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${card.iconColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                        {card.title}
                      </h4>
                    </div>
                    <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300 p-0.5">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Summary Text */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{card.time}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {card.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    <img
                      src={card.authorAvatar}
                      alt={card.author}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate max-w-[80px]">{card.author}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Next Arrow Button */}
        <button
          className="hidden xl:flex w-9 h-9 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-2xs hover:shadow-xs transition-all shrink-0 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 2: Velocity Chart (Left) + Cohort Bar Statistics (Right) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: User Stat / Submission Velocity Area Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              User Stat
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl text-[11px] font-semibold">
                {(["Weekly", "Monthly", "Yearly"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setVelocityPeriod(tab)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      velocityPeriod === tab
                        ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Spline Area Chart Canvas */}
          <div className="relative pt-6 pb-2 min-h-[260px] flex">
            {/* Y-Axis scale */}
            <div className="flex flex-col justify-between text-[11px] text-slate-400 font-mono pr-4 select-none pb-6">
              <span>500</span>
              <span>400</span>
              <span>300</span>
              <span>200</span>
              <span>100</span>
              <span>0</span>
            </div>

            {/* SVG Chart Graphic */}
            <div className="flex-1 relative flex flex-col justify-between">
              {/* Horizontal guide lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 opacity-30">
                <div className="border-b border-slate-200 dark:border-slate-800 border-dashed w-full" />
                <div className="border-b border-slate-200 dark:border-slate-800 border-dashed w-full" />
                <div className="border-b border-slate-200 dark:border-slate-800 border-dashed w-full" />
                <div className="border-b border-slate-200 dark:border-slate-800 border-dashed w-full" />
                <div className="border-b border-slate-200 dark:border-slate-800 border-dashed w-full" />
                <div className="border-b border-slate-200 dark:border-slate-800 w-full" />
              </div>

              {/* The Area Gradient Curve */}
              <div className="relative h-[210px] w-full">
                <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="userStatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area */}
                  <path
                    d="M 0,90 
                       C 30,50 60,65 90,55 
                       C 120,45 140,80 170,70 
                       C 200,60 220,50 250,55 
                       C 280,60 300,105 330,85 
                       C 360,65 375,45 400,50 
                       C 415,55 425,120 440,110 
                       C 455,100 470,160 490,145 
                       C 510,130 540,165 570,150 
                       L 600,155 L 600,200 L 0,200 Z"
                    fill="url(#userStatGrad)"
                  />

                  {/* Top Line Stroke */}
                  <path
                    d="M 0,90 
                       C 30,50 60,65 90,55 
                       C 120,45 140,80 170,70 
                       C 200,60 220,50 250,55 
                       C 280,60 300,105 330,85 
                       C 360,65 375,45 400,50 
                       C 415,55 425,120 440,110 
                       C 455,100 470,160 490,145 
                       C 510,130 540,165 570,150 
                       L 600,155"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Milestone Marker Dot & Dashed Line at Day 21 */}
                  <line x1="400" y1="50" x2="400" y2="120" stroke="#8B5CF6" strokeDasharray="3 3" strokeWidth="1.5" />
                  <circle cx="400" cy="50" r="4.5" fill="#8B5CF6" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* Floating Tooltip Callout Pill (Matching Reference 1450) */}
                <div className="absolute top-3 left-[63%] -translate-x-1/2 flex flex-col items-center pointer-events-none drop-shadow-md">
                  <div className="bg-purple-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Users className="w-3 h-3" />
                    <span>1,450</span>
                  </div>
                </div>
              </div>

              {/* X-Axis scale */}
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>9</span>
                <span>11</span>
                <span>13</span>
                <span>15</span>
                <span>17</span>
                <span>19</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">21</span>
                <span>23</span>
                <span>25</span>
                <span>27</span>
                <span>29</span>
                <span>31</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Cohort Statistics Vertical Pill Bars */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Statistics
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl text-[11px] font-semibold">
                {(["New", "Today", "Month"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatsPeriod(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      statsPeriod === tab
                        ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metrics List + Vertical Pill Bar Gauges */}
          <div className="py-6 flex items-center justify-between gap-4">
            {/* Metric Items */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Visitors</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">10,113</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Subscriber</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">1,123</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Contributer</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">1,100</p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Author</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">56</p>
              </div>
            </div>

            {/* 4 Vertical Pill Progress Bars (Matching Reference Image) */}
            <div className="flex items-end gap-3.5 h-[170px] pr-2">
              {/* Bar 1: 90% */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div className="w-full h-[90%] bg-purple-400 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">90%</span>
              </div>

              {/* Bar 2: 80% */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div className="w-full h-[80%] bg-rose-500 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">80%</span>
              </div>

              {/* Bar 3: 75% */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div className="w-full h-[75%] bg-orange-400 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">75%</span>
              </div>

              {/* Bar 4: 50% */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div className="w-full h-[50%] bg-blue-600 rounded-full" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">50%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 3: 4 Circular Radial KPI Cards (Left) + Diagnostics (Right) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 4 Metric Cards with Circular Radial Progress Rings */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Comments 50% */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Comments</p>
                <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">50%</p>
              </div>
              <button className="text-slate-300 hover:text-slate-500">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Gauge */}
            <div className="py-4 flex justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-purple-500"
                    strokeDasharray="50, 100"
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <ArrowUpRight className="w-4 h-4 text-purple-500 absolute" />
              </div>
            </div>

            <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">
                12,200
              </div>
              <Link to="/admin/submissions" className="text-[10px] text-slate-400 hover:text-purple-600 font-semibold block mt-0.5">
                View All
              </Link>
            </div>
          </div>

          {/* Card 2: Posts 85% */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Posts</p>
                <p className="text-[11px] font-bold text-rose-500">85%</p>
              </div>
              <button className="text-slate-300 hover:text-slate-500">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Gauge */}
            <div className="py-4 flex justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500"
                    strokeDasharray="85, 100"
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <ArrowUpRight className="w-4 h-4 text-rose-500 absolute" />
              </div>
            </div>

            <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">
                12 456
              </div>
              <Link to="/admin/courses" className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold block mt-0.5">
                View All
              </Link>
            </div>
          </div>

          {/* Card 3: Pages 70% */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Pages</p>
                <p className="text-[11px] font-bold text-amber-500">70%</p>
              </div>
              <button className="text-slate-300 hover:text-slate-500">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Gauge */}
            <div className="py-4 flex justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-500"
                    strokeDasharray="70, 100"
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <ArrowUpRight className="w-4 h-4 text-amber-500 absolute" />
              </div>
            </div>

            <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">
                1 345
              </div>
              <Link to="/admin/courses" className="text-[10px] text-slate-400 hover:text-amber-600 font-semibold block mt-0.5">
                View All
              </Link>
            </div>
          </div>

          {/* Card 4: Categories 60% */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Categories</p>
                <p className="text-[11px] font-bold text-orange-400">60%</p>
              </div>
              <button className="text-slate-300 hover:text-slate-500">
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Circular Gauge */}
            <div className="py-4 flex justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-orange-400"
                    strokeDasharray="60, 100"
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <ArrowUpRight className="w-4 h-4 text-orange-400 absolute" />
              </div>
            </div>

            <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">
                1,200
              </div>
              <Link to="/admin/courses" className="text-[10px] text-slate-400 hover:text-orange-600 font-semibold block mt-0.5">
                View All
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Diagnostics & Turnaround Speedometer Gauge */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Statistics
            </h3>
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl text-[11px] font-semibold">
              {(["New", "Today", "Month"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDiagnosticsPeriod(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    diagnosticsPeriod === tab
                      ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostics Content */}
          <div className="py-4 flex items-center justify-between gap-4">
            {/* 4 Diagnostic Chips */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Grade</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">75.4%</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Page Size</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">1.9 mb</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Load Time</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">631 ms</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Requests</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">42</p>
              </div>
            </div>

            {/* Radial Speedometer / Donut Ring (Matching Reference 631 ms) */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  stroke="url(#speedGrad)"
                  strokeDasharray="72, 100"
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono leading-none">
                  631
                </span>
                <span className="text-[9px] text-slate-400 font-semibold mt-0.5">ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
