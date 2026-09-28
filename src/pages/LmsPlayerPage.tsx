import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Bell,
  FileQuestion,
  BookOpen,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Settings,
  Maximize2,
  ChevronLeft,
  X,
  Send,
  CheckCircle2,
  Users,
  ExternalLink,
  Bot,
  Sparkles,
  PlayCircle,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import {
  useGetPathwayContentQuery,
  useGetLessonContentQuery,
} from "../store/apiSlice";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

// Curriculum Data Structure
interface ModuleItem {
  id: string;
  title: string;
  duration?: string;
  type: "video" | "quiz";
}

interface ChapterModule {
  id: string;
  title: string;
  meta: string;
  items: ModuleItem[];
}

const DEFAULT_CHAPTER_MODULES: ChapterModule[] = [
  {
    id: "mod-0",
    title: "Course Overview",
    meta: "3 Resources",
    items: [
      { id: "item-0-1", title: "Program Welcome & Onboarding", duration: "1 Min 10 Secs", type: "video" },
      { id: "item-0-2", title: "Course Syllabus & Lab Setup Guide", duration: "3 Mins", type: "video" },
      { id: "item-0-3", title: "Prerequisites Assessment", type: "quiz" },
    ],
  },
  {
    id: "mod-1",
    title: "Week 1: Linear Regression & Introduction",
    meta: "3 Videos · 4 Assessments · 6 Resources",
    items: [
      { id: "item-1-1", title: "1.1 Faculty Introduction", duration: "42 Secs", type: "video" },
      { id: "item-1-2", title: "1.2 Learning Objectives and Agenda", duration: "4 Mins 10 Secs", type: "video" },
      { id: "item-1-3", title: "1.3 Business Problem and Solution Space", duration: "14 Mins 2 Secs", type: "video" },
      { id: "item-1-4", title: "1.3 Test Your Understanding", type: "quiz" },
      { id: "item-1-5", title: "1.4 Problem Statement", duration: "11 Mins 12 Secs", type: "video" },
      { id: "item-1-6", title: "1.5 Visualizing Relationships and Correlation", duration: "18 Mins 56 Secs", type: "video" },
      { id: "item-1-7", title: "1.5 Test Your Understanding", type: "quiz" },
      { id: "item-1-8", title: "1.6 Pearson's Correlation Coefficient", duration: "13 Mins 17 Secs", type: "video" },
      { id: "item-1-9", title: "1.6 Test Your Understanding", type: "quiz" },
    ],
  },
  {
    id: "mod-2",
    title: "Practice Hands-on Quiz - Introduction to Computer Vision",
    meta: "1 Assessment · 1 Resource",
    items: [
      { id: "item-2-1", title: "Image Processing & Filter Convolution", duration: "8 Mins 45 Secs", type: "video" },
      { id: "item-2-2", title: "Hands-on Practice Quiz - Computer Vision", type: "quiz" },
    ],
  },
  {
    id: "mod-3",
    title: "Week 1 : Additional Case Study",
    meta: "3 Resources",
    items: [
      { id: "item-3-1", title: "Case Study: Medical Diagnostics using Vision AI", duration: "15 Mins", type: "video" },
      { id: "item-3-2", title: "Case Study Analysis Quiz", type: "quiz" },
    ],
  },
  {
    id: "mod-4",
    title: "Week 1: Reference Material",
    meta: "3 Resources",
    items: [
      { id: "item-4-1", title: "Research Paper: Feature Extraction in Convolutional Nets", duration: "5 Mins", type: "video" },
      { id: "item-4-2", title: "Code Notebook: PyTorch Matrix Operations", type: "quiz" },
    ],
  },
];

export default function LmsPlayerPage() {
  const { pathwayId } = useParams();
  const navigate = useNavigate();

  const {
    data: pathwayData,
    isLoading: isPathwayLoading,
    error: pathwayError,
  } = useGetPathwayContentQuery(pathwayId);

  const pathway = pathwayData?.pathway;
  const courses = pathwayData?.courses || [];

  // Dynamic course title
  const courseTitle = pathway?.title || "Introduction to Computer Vision";

  // Build modules from backend or fallback to default
  const modules: ChapterModule[] = useMemo(() => {
    if (courses.length > 0 && courses[0].modules?.length > 0) {
      return courses[0].modules.map((m: any, idx: number) => ({
        id: m.id || `mod-${idx}`,
        title: m.title || `Week ${idx + 1}`,
        meta: `${m.lessons?.length || 3} Videos · 2 Assessments · 4 Resources`,
        items: (m.lessons || []).map((l: any, lIdx: number) => ({
          id: l.id || `item-${idx}-${lIdx}`,
          title: l.title || `${idx + 1}.${lIdx + 1} Lesson`,
          duration: l.durationSeconds ? `${Math.round(l.durationSeconds / 60)} Mins` : `${lIdx * 3 + 2} Mins`,
          type: l.contentType === "QUIZ" ? ("quiz" as const) : ("video" as const),
        })),
      }));
    }
    return DEFAULT_CHAPTER_MODULES;
  }, [courses]);

  // View state: "overview" (SS1) | "chapter" (SS2) | "player" (SS3)
  const [currentView, setCurrentView] = useState<"overview" | "chapter" | "player">("overview");
  const [selectedModule, setSelectedModule] = useState<ChapterModule>(modules[1] || modules[0]);
  const [selectedLesson, setSelectedLesson] = useState<ModuleItem>(
    modules[1]?.items[0] || modules[0]?.items[0]
  );

  // Tabs on Overview: "learning" | "groups" | "notes"
  const [overviewTab, setOverviewTab] = useState<"learning" | "groups" | "notes">("learning");

  // Tabs on Player: "notes" | "help"
  const [playerTab, setPlayerTab] = useState<"notes" | "help">("help");

  // Video Player Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(21);
  const duration = 41;
  const [userNotes, setUserNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // Interactive Modals
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [supportTicketOpen, setSupportTicketOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "Hello! I am Glaide, your real-time course AI mentor. Ask me anything about this lecture or concepts.",
    },
  ]);

  // Handle Video navigation next/prev
  const allLessonItems = useMemo(() => {
    return modules.flatMap((m) => m.items);
  }, [modules]);

  const currentLessonIndex = allLessonItems.findIndex((l) => l.id === selectedLesson?.id);
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = currentLessonIndex >= 0 && currentLessonIndex < allLessonItems.length - 1;

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      setSelectedLesson(allLessonItems[currentLessonIndex - 1]);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      setSelectedLesson(allLessonItems[currentLessonIndex + 1]);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;
    const userText = aiMessage.trim();
    setChatHistory((prev) => [...prev, { role: "user", text: userText }]);
    setAiMessage("");

    setTimeout(() => {
      let reply = "Linear regression models the relationship between dependent and independent variables using a best-fit line. Would you like a mathematical breakdown or a code example?";
      if (userText.toLowerCase().includes("clustering") || userText.toLowerCase().includes("vision")) {
        reply = "Computer vision models analyze spatial pixel arrays through convolutional feature detectors and pooling layers to detect hierarchical structures.";
      }
      setChatHistory((prev) => [...prev, { role: "ai", text: reply }]);
    }, 600);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // -------------------------------------------------------------
  // VIEW 1: Course Overview (Screenshot 1)
  // -------------------------------------------------------------
  if (currentView === "overview") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#0B0D13] flex flex-col justify-between">
        <div className="animate-fade-in">
          {/* Deep Teal Course Banner Header with Responsive Container */}
          <div className="bg-[#0B4D5D] text-white py-5 sm:py-7">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
              {/* Top Navigation Row */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate("/")}
                  aria-label="Back to Dashboard"
                  className="p-1 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/catalog")}
                    aria-label="Search"
                    className="p-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="Notifications"
                    className="p-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* At Risk Badge */}
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFEAD8] text-[#D96B27]">
                  AT RISK
                </span>
              </div>

              {/* Course Title */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {courseTitle}
                </h1>
                <p className="text-xs text-teal-100/90 mt-1 font-medium">
                  0 / 11 Videos · 0 / 14 Assessments · 0 / 49 Resources
                </p>
              </div>

              {/* Progress Bar with 0% */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-1 bg-teal-900/60 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-300 w-0" />
                </div>
                <span className="text-[11px] font-bold text-teal-100/90 shrink-0">0%</span>
              </div>

              {/* Action Cards Row: Mandatory Assessments & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {/* Mandatory Assessments Card */}
                <div
                  onClick={() => {
                    setSelectedModule(modules[1] || modules[0]);
                    setCurrentView("chapter");
                  }}
                  className="sm:col-span-3 bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/20 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-sky-200 text-sky-900 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileQuestion className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">Mandatory Assessments</p>
                      <p className="text-[10px] text-teal-100 truncate mt-0.5">View All</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />
                </div>

                {/* Marks Card */}
                <div className="sm:col-span-2 bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-3 sm:p-3.5 flex items-center gap-2.5 shadow-xs">
                  <div className="w-9 h-9 rounded-xl bg-sky-200 text-sky-900 flex items-center justify-center shrink-0 shadow-2xs">
                    <BookOpen className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-teal-100 truncate font-medium">Marks</p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">0 / 30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Learning, Groups, Notes with Responsive Container */}
          <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121622] sticky top-0 z-10">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center">
              <button
                onClick={() => setOverviewTab("learning")}
                className={`py-3 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                  overviewTab === "learning"
                    ? "text-[#0B4D5D] dark:text-teal-400 font-bold"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                }`}
              >
                Learning
                {overviewTab === "learning" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B4D5D] dark:bg-teal-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setOverviewTab("groups")}
                className={`py-3 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                  overviewTab === "groups"
                    ? "text-[#0B4D5D] dark:text-teal-400 font-bold"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                }`}
              >
                Groups
                {overviewTab === "groups" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B4D5D] dark:bg-teal-400 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setOverviewTab("notes")}
                className={`py-3 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                  overviewTab === "notes"
                    ? "text-[#0B4D5D] dark:text-teal-400 font-bold"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                }`}
              >
                Notes
                {overviewTab === "notes" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B4D5D] dark:bg-teal-400 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Module Chapter List with Responsive Container */}
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3.5">
            {modules.map((mod) => (
              <div
                key={mod.id}
                onClick={() => {
                  setSelectedModule(mod);
                  setCurrentView("chapter");
                }}
                className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="pr-3 min-w-0">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#0B4D5D] dark:group-hover:text-teal-400 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                    {mod.meta}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Floating Sticky Bar with Responsive Container */}
        <div className="sticky bottom-0 z-20 bg-[#E3F2FD] dark:bg-[#0c2438] border-t border-sky-200/60 dark:border-sky-900/40 py-3">
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedModule(modules[1] || modules[0]);
                setCurrentView("chapter");
              }}
              className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200 hover:text-sky-950 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 stroke-[2]" />
              <span>Course Outline</span>
            </button>

            <button
              onClick={() => {
                setSelectedModule(modules[1] || modules[0]);
                setSelectedLesson(modules[1]?.items[0] || modules[0]?.items[0]);
                setCurrentView("player");
              }}
              className="bg-[#0B4D5D] hover:bg-[#093e4b] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Start Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Chapter Details / Week Breakdown (Screenshot 2)
  // -------------------------------------------------------------
  if (currentView === "chapter") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#0B0D13] animate-fade-in">
        {/* Golden-brown / Olive Header Bar with Responsive Container */}
        <div className="bg-[#6E551C] text-white sticky top-0 z-30 shadow-xs">
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3.5">
            <button
              onClick={() => setCurrentView("overview")}
              aria-label="Back to Course Overview"
              className="p-1 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h1 className="text-sm sm:text-base font-bold text-white truncate">
              {selectedModule?.title || "Week 1: Linear Regression"}
            </h1>
          </div>
        </div>

        {/* Content Area with Responsive Container */}
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Lecture Videos
          </h2>

          <div className="space-y-2.5">
            {selectedModule?.items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedLesson(item);
                  setCurrentView("player");
                }}
                className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  {item.type === "video" ? (
                    <div className="w-7 h-7 rounded-full text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 group-hover:text-blue-600 transition-colors">
                      <PlayCircle className="w-5 h-5 stroke-[2]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-md text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 group-hover:text-blue-600 transition-colors">
                      <FileQuestion className="w-5 h-5 stroke-[2]" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    {item.duration && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate font-medium">
                        {item.duration}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: Video Player Screen (Screenshot 3)
  // -------------------------------------------------------------
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#0B0D13] flex flex-col justify-between animate-fade-in">
      <div>
        {/* Custom Video Player Container with Desktop Sizing */}
        <div className="bg-black/95 dark:bg-black w-full">
          <div className="max-w-4xl mx-auto sm:px-4 sm:pt-4">
            <div className="relative bg-zinc-900 w-full aspect-video sm:max-h-[460px] lg:max-h-[500px] sm:rounded-2xl overflow-hidden select-none shadow-2xl">
              {/* Simulated Faculty / Lesson Video Background */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80')`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/70" />
              </div>

              {/* Top Video Header Overlay */}
              <div className="absolute top-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between text-white z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setCurrentView("chapter")}
                    aria-label="Back to Chapter Videos"
                    className="p-1 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>
                  <span className="text-xs sm:text-sm font-bold text-white truncate">
                    {selectedLesson?.title || "1.1 Faculty Introduction"}
                  </span>
                </div>
                <div className="text-[10px] font-black tracking-tight bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-white">
                  UNISOLE
                </div>
              </div>

              {/* Center Playback Controls */}
              <div className="absolute inset-0 flex items-center justify-center gap-8 text-white z-10">
                <button
                  onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                  aria-label="Rewind 10 seconds"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-zinc-900 flex items-center justify-center shadow-xl transition-all cursor-pointer hover:scale-105"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => setCurrentTime((t) => Math.min(duration, t + 10))}
                  className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
                  aria-label="Fast forward 10 seconds"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>

              {/* Bottom Video Controls Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white z-10 space-y-2">
                <div className="w-full bg-white/30 h-1 rounded-full cursor-pointer relative overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-white/90">
                      {formatSeconds(currentTime)} / {formatSeconds(duration)}
                    </span>
                    <span className="hidden sm:inline-block bg-black/60 text-white/90 text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                      how variables are related to
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => alert("Video playback quality: 1080p HD (Auto)")}
                      className="p-1 hover:text-white/80 transition-colors cursor-pointer"
                      aria-label="Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert("Toggle Fullscreen")}
                      className="p-1 hover:text-white/80 transition-colors cursor-pointer"
                      aria-label="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Sub-tabs: Notes & Help */}
        <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#121622]">
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center">
            <button
              onClick={() => setPlayerTab("notes")}
              className={`py-3 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                playerTab === "notes"
                  ? "text-zinc-900 dark:text-white font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              Notes
              {playerTab === "notes" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6E551C] dark:bg-amber-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setPlayerTab("help")}
              className={`py-3 px-6 text-sm font-semibold relative transition-colors flex items-center gap-1.5 cursor-pointer ${
                playerTab === "help"
                  ? "text-zinc-900 dark:text-white font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              <span>Help</span>
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block mb-1" />
              {playerTab === "help" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6E551C] dark:bg-amber-400 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3.5">
          {playerTab === "help" ? (
            <div className="space-y-3">
              {/* Card 1: Glaide / AI Chat Assistance */}
              <div
                onClick={() => setAiChatOpen(true)}
                className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-4 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <Bot className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                        Glaide
                      </h4>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/50 dark:text-rose-400">
                        NEW
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      Real-time AI chat assistance
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0" />
              </div>

              {/* Card 2: Support Ticket */}
              <div
                onClick={() => setSupportTicketOpen(true)}
                className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-4 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors">
                      Did not find what you needed?
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      Create a support ticket here
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0" />
              </div>
            </div>
          ) : (
            /* Notes Tab */
            <div className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-4 sm:p-5 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Lecture Notes for {selectedLesson?.title}
              </h4>
              <textarea
                value={userNotes}
                onChange={(e) => {
                  setUserNotes(e.target.value);
                  setNotesSaved(false);
                }}
                placeholder="Take personal study notes while watching this lesson..."
                className="w-full h-36 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">
                  {notesSaved ? "Saved to your study notebook" : "Unsaved changes"}
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setNotesSaved(true)}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Lesson Navigation */}
      <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-[#121622]/95 backdrop-blur-xs border-t border-slate-200/80 dark:border-zinc-800 py-3">
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={handlePreviousLesson}
            disabled={!hasPrevious}
            aria-label="Previous lesson"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              hasPrevious
                ? "bg-[#FDE8B3] text-[#B87708] hover:bg-amber-200 shadow-xs"
                : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
            Lesson {currentLessonIndex + 1} of {allLessonItems.length}
          </span>

          <button
            onClick={handleNextLesson}
            disabled={!hasNext}
            aria-label="Next lesson"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              hasNext
                ? "bg-[#FDE8B3] text-[#B87708] hover:bg-amber-200 shadow-xs"
                : "bg-zinc-100 text-zinc-300 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed"
            }`}
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Glaide AI Assistant Modal */}
      {aiChatOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setAiChatOpen(false)}
        >
          <div className="bg-white dark:bg-[#121622] w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col h-[500px] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-blue-50/50 dark:bg-blue-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>Glaide AI Mentor</span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  </h3>
                  <p className="text-[10px] text-zinc-500">Live course companion</p>
                </div>
              </div>
              <button
                onClick={() => setAiChatOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-xs"
                        : "bg-slate-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendAiMessage} className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask Glaide about this concept..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {supportTicketOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setSupportTicketOpen(false)}
        >
          <div className="bg-white dark:bg-[#121622] w-full max-w-sm rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create Support Ticket</h3>
              <button onClick={() => setSupportTicketOpen(false)} className="p-1 text-zinc-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Category</label>
                <select className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs">
                  <option>Academic Doubts & Syllabus</option>
                  <option>Video Playback & Technical</option>
                  <option>Quiz & Assessment Evaluation</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Issue Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your question or technical blocker..."
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-xs focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSupportTicketOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  alert("Ticket submitted! A faculty mentor will respond within 24 hours.");
                  setSupportTicketOpen(false);
                }}
              >
                Submit Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
