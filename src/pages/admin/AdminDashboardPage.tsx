import React, { useState, useMemo } from "react";
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
  GraduationCap,
  Clock,
  Code2,
  Video,
} from "lucide-react";
import {
  useGetAdminDashboardStatsQuery,
  useGetAdminCoursesQuery,
  useGetAdminLessonsQuery,
  useGetAdminStudentsQuery,
} from "../../store/apiSlice";

export default function AdminDashboardPage() {
  const { user } = useSelector((state: any) => state.auth);

  // Velocity Period Filter (Weekly, Monthly, Yearly)
  const [velocityPeriod, setVelocityPeriod] = useState<"Weekly" | "Monthly" | "Yearly">("Monthly");
  const [funnelPeriod, setFunnelPeriod] = useState<"Active" | "All">("Active");

  // Fetch Live Data from Backend Database
  const { data: statsRes, isLoading: statsLoading } = useGetAdminDashboardStatsQuery(velocityPeriod);
  const stats = statsRes?.data;

  const { data: courses = [] } = useGetAdminCoursesQuery(undefined);
  const { data: lessons = [] } = useGetAdminLessonsQuery(undefined);
  const { data: students = [] } = useGetAdminStudentsQuery({ role: "STUDENT", enrolledOnly: true });

  // Live Counts from Database
  const summary = stats?.summary || {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c: any) => c.status === "PUBLISHED").length,
    totalModules: 0,
    totalLessons: lessons.length,
    publishedLessons: lessons.filter((l: any) => l.status === "PUBLISHED").length,
    totalStudents: students.length,
    totalEnrollments: 0,
    activeEnrollments: 0,
    pendingSubmissions: 0,
    gradedSubmissions: 0,
  };

  const funnel = stats?.funnel || {
    enrolled: summary.totalStudents,
    activeLearners: 0,
    assessed: 0,
    certified: 0,
    enrolledPct: summary.totalStudents > 0 ? 100 : 0,
    activePct: 0,
    assessedPct: 0,
    certifiedPct: 0,
  };

  const benchmarks = stats?.benchmarks || {
    avgScore: 0,
    vivaPassRate: 0,
    codingPassRate: 0,
    avgTurnaroundHours: 0,
    totalEvaluations: 0,
  };

  // Top Highlight Cards from Real DB Courses
  const highlightCards = useMemo(() => {
    if (!stats?.highlightCards || stats.highlightCards.length === 0) {
      return [];
    }

    const icons = [BookOpen, Layers, Award, Sparkles];
    const iconColors = [
      "bg-blue-500/10 text-blue-500",
      "bg-purple-500/10 text-purple-500",
      "bg-amber-500/10 text-amber-500",
      "bg-emerald-500/10 text-emerald-500",
    ];

    return stats.highlightCards.map((c: any, index: number) => ({
      id: c.id,
      icon: icons[index % icons.length],
      iconColor: iconColors[index % iconColors.length],
      title: c.title,
      desc: c.desc,
      tag: c.tag,
      modulesCount: c.modulesCount,
      enrollmentsCount: c.enrollmentsCount,
      link: `/admin/courses/${c.id}`,
    }));
  }, [stats?.highlightCards]);

  // Construct Dynamic SVG Path for the Learning Velocity Area Chart from Real Postgres Dates
  const { areaPath, linePath, maxCount, xLabels } = useMemo(() => {
    const rawData = stats?.velocity?.data || [];
    if (rawData.length === 0) {
      return {
        areaPath: "",
        linePath: "",
        maxCount: 0,
        xLabels: [],
      };
    }

    const counts = rawData.map((d: any) => d.count);
    const maxVal = Math.max(1, ...counts);
    const len = rawData.length;

    const points = rawData.map((d: any, i: number) => {
      const x = len > 1 ? (i / (len - 1)) * 600 : 300;
      const y = maxVal > 0 ? 180 - (d.count / maxVal) * 140 : 180;
      return { x, y };
    });

    if (points.length < 2) {
      return {
        areaPath: "M 0,180 L 600,180 L 600,200 L 0,200 Z",
        linePath: "M 0,180 L 600,180",
        maxCount: maxVal,
        xLabels: rawData.map((d: any) => d.dayLabel),
      };
    }

    // Build smooth bezier curves
    let dLine = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      dLine += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }

    const dArea = `${dLine} L 600,200 L 0,200 Z`;
    
    // Pick 5-7 evenly spaced real dates from Postgres
    const step = Math.max(1, Math.floor(len / 6));
    const labels = rawData
      .filter((_: any, idx: number) => idx === 0 || idx === len - 1 || idx % step === 0)
      .map((d: any) => d.dayLabel);

    return {
      areaPath: dArea,
      linePath: dLine,
      maxCount: maxVal,
      xLabels: labels,
    };
  }, [stats?.velocity?.data]);

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* ------------------------------------------------------------- */}
      {/* ROW 1: Real Course & Track Highlights (Carousel Cards) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
        {highlightCards.length > 0 ? (
          highlightCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                to={card.link}
                className="min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-1 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${card.iconColor} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                          {card.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {card.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                  <span className="font-mono text-slate-400">
                    {card.modulesCount} {card.modulesCount === 1 ? "Module" : "Modules"}
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {card.enrollmentsCount} {card.enrollmentsCount === 1 ? "Mentee" : "Mentees"}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="w-full bg-white dark:bg-[#0B1120] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80 p-5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">No courses in database yet</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  All metrics update automatically once courses and modules are created in Curriculum Studio.
                </p>
              </div>
            </div>
            <Link
              to="/admin/courses"
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-1 shrink-0"
            >
              + Create Course
            </Link>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 2: Learning Velocity Chart + Mentee Progress Funnel */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Learning Velocity & Daily Active Mentees Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Learning Velocity
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Daily student lesson completions & assessment submissions from DB
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-xl text-[11px] font-semibold">
                {(["Weekly", "Monthly", "Yearly"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setVelocityPeriod(tab)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      velocityPeriod === tab
                        ? "bg-white dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold shadow-2xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Spline Area Chart Canvas */}
          <div className="relative pt-6 pb-2 min-h-[260px] flex">
            {/* Y-Axis Scale */}
            <div className="flex flex-col justify-between text-[11px] text-slate-400 font-mono pr-4 select-none pb-6">
              <span>{maxCount}</span>
              <span>{Math.round(maxCount * 0.75)}</span>
              <span>{Math.round(maxCount * 0.5)}</span>
              <span>{Math.round(maxCount * 0.25)}</span>
              <span>0</span>
            </div>

            {/* SVG Chart Graphic */}
            <div className="flex-1 relative flex flex-col justify-between">
              {/* Horizontal Guidelines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 opacity-30">
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
                    <linearGradient id="velocityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area */}
                  <path d={areaPath} fill="url(#velocityGrad)" />

                  {/* Top Line Stroke */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Floating Tooltip Callout Pill */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none drop-shadow-md">
                  <div className="bg-purple-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{stats?.velocity?.totalActivity?.toLocaleString() ?? 0} Completed Actions</span>
                  </div>
                </div>
              </div>

              {/* X-Axis Scale */}
              <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                {xLabels.map((lbl: string, i: number) => (
                  <span key={i} className={i === Math.floor(xLabels.length / 2) ? "font-bold text-purple-600 dark:text-purple-400" : ""}>
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Mentee Progress & Completion Funnel */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Progress Funnel
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Cohort progression across course milestones
              </p>
            </div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800/60">
              Live DB
            </span>
          </div>

          {/* Metrics List + Vertical Pill Bar Gauges */}
          <div className="py-6 flex items-center justify-between gap-4">
            {/* Metric Items */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Enrolled Mentees</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">
                  {funnel.enrolled.toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Active in Modules</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">
                  {funnel.activeLearners.toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>Assessments Cleared</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">
                  {funnel.assessed.toLocaleString()}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Certified / Graduated</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">
                  {funnel.certified.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 4 Vertical Pill Progress Bars */}
            <div className="flex items-end gap-3.5 h-[170px] pr-2">
              {/* Bar 1: Enrolled */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-purple-400 rounded-full transition-all duration-700"
                    style={{ height: `${Math.max(5, funnel.enrolledPct)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">{funnel.enrolledPct}%</span>
              </div>

              {/* Bar 2: Active */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-rose-500 rounded-full transition-all duration-700"
                    style={{ height: `${Math.max(5, funnel.activePct)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">{funnel.activePct}%</span>
              </div>

              {/* Bar 3: Assessed */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-orange-400 rounded-full transition-all duration-700"
                    style={{ height: `${Math.max(5, funnel.assessedPct)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">{funnel.assessedPct}%</span>
              </div>

              {/* Bar 4: Certified */}
              <div className="flex flex-col items-center gap-1.5 h-full justify-end">
                <div className="w-3.5 h-[140px] bg-slate-100 dark:bg-slate-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                  <div
                    className="w-full bg-blue-600 rounded-full transition-all duration-700"
                    style={{ height: `${Math.max(5, funnel.certifiedPct)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">{funnel.certifiedPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ROW 3: 4 Academic KPI Radial Cards + Evaluation Benchmarks */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 4 Metric Cards with Circular Radial Progress Rings */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Published Courses */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Published Courses</p>
                <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  {summary.totalCourses > 0
                    ? `${Math.round((summary.publishedCourses / summary.totalCourses) * 100)}%`
                    : "0%"}
                </p>
              </div>
              <BookOpen className="w-4 h-4 text-purple-400" />
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
                    strokeDasharray={`${
                      summary.totalCourses > 0
                        ? Math.round((summary.publishedCourses / summary.totalCourses) * 100)
                        : 0
                    }, 100`}
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
                {summary.publishedCourses} / {summary.totalCourses}
              </div>
              <Link to="/admin/courses" className="text-[10px] text-slate-400 hover:text-purple-600 font-semibold block mt-0.5">
                View Courses
              </Link>
            </div>
          </div>

          {/* Card 2: Curriculum Lessons & Labs */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Modules & Labs</p>
                <p className="text-[11px] font-bold text-rose-500">
                  {summary.totalLessons > 0
                    ? `${Math.round((summary.publishedLessons / summary.totalLessons) * 100)}%`
                    : "0%"}
                </p>
              </div>
              <Layers className="w-4 h-4 text-rose-400" />
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
                    strokeDasharray={`${
                      summary.totalLessons > 0
                        ? Math.round((summary.publishedLessons / summary.totalLessons) * 100)
                        : 0
                    }, 100`}
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
                {summary.totalLessons} Lessons
              </div>
              <Link to="/admin/courses" className="text-[10px] text-slate-400 hover:text-rose-600 font-semibold block mt-0.5">
                Curriculum Studio
              </Link>
            </div>
          </div>

          {/* Card 3: Pending Reviews */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Review Queue</p>
                <p className="text-[11px] font-bold text-amber-500">
                  {summary.pendingSubmissions > 0 ? "Pending Action" : "Up to Date"}
                </p>
              </div>
              <ClipboardCheck className="w-4 h-4 text-amber-400" />
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
                    strokeDasharray={`${Math.min(
                      100,
                      summary.pendingSubmissions > 0
                        ? Math.max(15, summary.pendingSubmissions * 10)
                        : 0
                    )}, 100`}
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
                {summary.pendingSubmissions} In Queue
              </div>
              <Link to="/admin/submissions" className="text-[10px] text-slate-400 hover:text-amber-600 font-semibold block mt-0.5">
                Review Submissions
              </Link>
            </div>
          </div>

          {/* Card 4: Enrolled Students */}
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Enrolled Students</p>
                <p className="text-[11px] font-bold text-emerald-500">
                  {funnel.activePct}% Active
                </p>
              </div>
              <Users className="w-4 h-4 text-emerald-400" />
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
                    className="text-emerald-500"
                    strokeDasharray={`${funnel.activePct}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <ArrowUpRight className="w-4 h-4 text-emerald-500 absolute" />
              </div>
            </div>

            <div className="text-center pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <div className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">
                {summary.totalStudents} Mentees
              </div>
              <Link to="/admin/students" className="text-[10px] text-slate-400 hover:text-emerald-600 font-semibold block mt-0.5">
                View Roster
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Academic Evaluation Benchmarks Speedometer */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Academic Benchmarks
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluation quality & student test scores
              </p>
            </div>
            <Award className="w-4 h-4 text-purple-400" />
          </div>

          {/* Diagnostics Content */}
          <div className="py-4 flex items-center justify-between gap-4">
            {/* 4 Academic Metric Chips */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Avg Test Score</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                  {benchmarks.avgScore > 0 ? `${benchmarks.avgScore}%` : "No tests yet"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Viva Pass Rate</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                  {benchmarks.vivaPassRate > 0 ? `${benchmarks.vivaPassRate}%` : "No viva yet"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Coding Pass Rate</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                  {benchmarks.codingPassRate > 0 ? `${benchmarks.codingPassRate}%` : "No coding yet"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Evaluations</span>
                </div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
                  {benchmarks.totalEvaluations}
                </p>
              </div>
            </div>

            {/* Radial Speedometer / Donut Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="academicScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
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
                  stroke="url(#academicScoreGrad)"
                  strokeDasharray={`${Math.max(5, benchmarks.avgScore)}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono leading-none">
                  {benchmarks.avgScore > 0 ? `${benchmarks.avgScore}%` : "N/A"}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                  {benchmarks.avgScore >= 80 ? "Grade A" : benchmarks.avgScore >= 60 ? "Grade B" : "Score"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
