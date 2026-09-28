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
  Check,
  Award,
  AlertCircle,
  Code,
  Github,
} from "lucide-react";
import {
  useGetPathwayContentQuery,
  useGetLessonContentQuery,
} from "../store/apiSlice";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import {
  getCurriculum,
  getEmbedVideoUrl,
  CourseCurriculum,
  ModuleSection,
  LessonItem,
  QuizQuestion,
} from "../constants/curriculumData";
import {
  saveSubmission,
  getSubmissionForLesson,
} from "../utils/submissionsStorage";

export default function LmsPlayerPage() {
  const { pathwayId } = useParams();
  const navigate = useNavigate();

  // Active canonical curriculum fallback
  const canonical = useMemo(() => getCurriculum(pathwayId), [pathwayId]);

  const {
    data: pathwayData,
    isLoading: isPathwayLoading,
    error: pathwayError,
  } = useGetPathwayContentQuery(pathwayId);

  const pathway = pathwayData?.pathway;
  const courses = pathwayData?.courses || [];

  // Dynamic Course Title & Duration
  const courseTitle = pathway?.title || canonical.title;
  const courseEyebrow = canonical.eyebrow;

  // Build modules from backend DB or rich canonical curriculum
  const modules: ModuleSection[] = useMemo(() => {
    if (courses.length > 0 && courses[0].modules?.length > 0) {
      return courses[0].modules.map((m: any, idx: number) => {
        const backendLessons = m.lessons || [];
        return {
          id: m.id || `mod-${idx}`,
          title: m.title || `Week ${idx + 1}`,
          meta: `${backendLessons.filter((l: any) => l.contentType !== "QUIZ" && l.contentType !== "ASSIGNMENT").length || 3} Videos · ${backendLessons.filter((l: any) => l.contentType === "QUIZ" || l.contentType === "ASSIGNMENT").length || 2} Assessments`,
          items: backendLessons.map((l: any, lIdx: number) => {
            const isQuiz = l.contentType === "QUIZ" || l.id?.includes("_quiz");
            const isAssignment = l.contentType === "ASSIGNMENT" || l.id?.includes("_lab") || l.id?.includes("_cap");
            
            // Try parse quiz questions if in content
            let parsedQuestions: QuizQuestion[] | undefined;
            let parsedInstructions = l.description || l.content;
            if (isQuiz && l.content) {
              try {
                const parsed = JSON.parse(l.content);
                if (parsed.questions) parsedQuestions = parsed.questions;
              } catch {
                // Not JSON
              }
            }
            if (isAssignment && l.content) {
              try {
                const parsed = JSON.parse(l.content);
                if (parsed.instructions) parsedInstructions = parsed.instructions;
              } catch {
                // Not JSON
              }
            }

            const fallbackMod = canonical.modules[idx];
            const fallbackItem = fallbackMod?.items?.find(
              (fi) => fi.type === (isQuiz ? "quiz" : isAssignment ? "assignment" : "video")
            );

            return {
              id: l.id || `item-${idx}-${lIdx}`,
              title: l.title || `${idx + 1}.${lIdx + 1} Lesson`,
              duration: l.durationMinutes ? `${l.durationMinutes} Mins` : `${lIdx * 3 + 12} Mins`,
              type: isQuiz ? ("quiz" as const) : isAssignment ? ("assignment" as const) : ("video" as const),
              videoUrl: l.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1",
              description: l.description,
              questions: parsedQuestions || fallbackItem?.questions,
              instructions: parsedInstructions || fallbackItem?.instructions,
            };
          }),
        };
      });
    }
    return canonical.modules;
  }, [courses, canonical]);

  // View state: "overview" (SS1) | "chapter" (SS2) | "player" (SS3)
  const [currentView, setCurrentView] = useState<"overview" | "chapter" | "player">("overview");
  const [selectedModule, setSelectedModule] = useState<ModuleSection>(modules[0]);
  const [selectedLesson, setSelectedLesson] = useState<LessonItem>(
    modules[0]?.items[0]
  );

  // Sync selected module/lesson if modules change
  useEffect(() => {
    if (modules.length > 0) {
      if (!selectedModule || !modules.some((m) => m.id === selectedModule.id)) {
        setSelectedModule(modules[0]);
        setSelectedLesson(modules[0].items[0]);
      }
    }
  }, [modules, selectedModule]);

  // Track completed lessons in localStorage
  const storageKey = `unisole_progress_${pathwayId || "cs-genai"}`;
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessonIds((prev) => {
      if (prev.includes(lessonId)) return prev;
      const updated = [...prev, lessonId];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  // Tabs on Overview: "learning" | "groups" | "notes"
  const [overviewTab, setOverviewTab] = useState<"learning" | "groups" | "notes">("learning");

  // Tabs on Player: "notes" | "help"
  const [playerTab, setPlayerTab] = useState<"notes" | "help">("help");

  // Interactive Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Reset quiz state when switching lessons
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setAssignmentSubmitted(false);
  }, [selectedLesson?.id]);

  // Interactive Lab Assignment State
  const [assignmentRepoUrl, setAssignmentRepoUrl] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  // Existing submission check
  useEffect(() => {
    if (selectedLesson && selectedLesson.type === "assignment") {
      const existing = getSubmissionForLesson(selectedLesson.id);
      if (existing) {
        setAssignmentSubmitted(true);
        setAssignmentRepoUrl(existing.submissionUrl);
        setAssignmentNotes(existing.submissionText || "");
      }
    }
  }, [selectedLesson]);

  // Notes state
  const [userNotes, setUserNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // AI Chat & Support Ticket Modals
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [supportTicketOpen, setSupportTicketOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "ai" | "user"; text: string }>>([
    {
      role: "ai",
      text: "Hello! I am Glaide, your real-time course AI mentor. Ask me anything about this lecture or hands-on implementation.",
    },
  ]);

  // All lessons flat array for navigation
  const allLessonItems = useMemo(() => {
    return modules.flatMap((m) => m.items);
  }, [modules]);

  const currentLessonIndex = allLessonItems.findIndex((l) => l.id === selectedLesson?.id);
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = currentLessonIndex >= 0 && currentLessonIndex < allLessonItems.length - 1;

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      setSelectedLesson(allLessonItems[currentLessonIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      setSelectedLesson(allLessonItems[currentLessonIndex + 1]);
    }
  };

  // Progress metrics
  const totalLessons = allLessonItems.length || 1;
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  const totalAssessments = allLessonItems.filter((l) => l.type === "quiz" || l.type === "assignment").length || 24;
  const completedAssessments = allLessonItems.filter(
    (l) => (l.type === "quiz" || l.type === "assignment") && completedLessonIds.includes(l.id)
  ).length;
  const currentMarks = completedAssessments * 10;
  const maxMarks = totalAssessments * 10;

  const totalVideos = allLessonItems.filter((l) => l.type === "video").length || 36;
  const completedVideos = allLessonItems.filter((l) => l.type === "video" && completedLessonIds.includes(l.id)).length;

  // Handle Quiz Submission
  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson.questions || selectedLesson.questions.length === 0) return;

    let correct = 0;
    selectedLesson.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });

    const percent = Math.round((correct / selectedLesson.questions.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);
    markLessonComplete(selectedLesson.id);
  };

  // Handle Assignment Submission
  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentRepoUrl.trim()) return;

    saveSubmission({
      assignmentId: selectedLesson.id,
      courseTitle: courseTitle,
      lessonTitle: selectedLesson.title,
      submissionUrl: assignmentRepoUrl.trim(),
      submissionText: assignmentNotes.trim(),
    });

    setAssignmentSubmitted(true);
    markLessonComplete(selectedLesson.id);
  };

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMessage.trim()) return;
    const userText = aiMessage.trim();
    setChatHistory((prev) => [...prev, { role: "user", text: userText }]);
    setAiMessage("");

    setTimeout(() => {
      let reply = `In ${selectedLesson?.title || "this module"}, the architecture isolates critical state logic to ensure reliable execution. Would you like a step-by-step code demonstration or architecture explanation?`;
      if (userText.toLowerCase().includes("rag") || userText.toLowerCase().includes("vector")) {
        reply = "Hybrid RAG combines dense semantic embeddings with sparse lexical BM25 matching, reranking candidates using Reciprocal Rank Fusion for optimal recall.";
      } else if (userText.toLowerCase().includes("mvp") || userText.toLowerCase().includes("pitch")) {
        reply = "For your incubator MVP, prioritize the single core wedge feature delivering 10x value to early users before expanding your feature scope.";
      }
      setChatHistory((prev) => [...prev, { role: "ai", text: reply }]);
    }, 500);
  };

  // -------------------------------------------------------------
  // VIEW 1: Course Overview (Screenshot 1 Exact Design)
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
                    onClick={() => navigate("/activities")}
                    aria-label="Notifications"
                    className="p-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFEAD8] text-[#D96B27]">
                  {progressPercent === 0 ? "AT RISK" : progressPercent >= 70 ? "ON TRACK" : "IN PROGRESS"}
                </span>
              </div>

              {/* Course Title & Syllabus Stats */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {courseTitle}
                </h1>
                <p className="text-xs text-teal-100/90 mt-1 font-medium">
                  {completedVideos} / {totalVideos} Videos · {completedAssessments} / {totalAssessments} Assessments · 0 / 48 Resources
                </p>
              </div>

              {/* Progress Bar with Dynamic Percentage */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-1.5 bg-teal-900/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-teal-100/90 shrink-0">
                  {progressPercent}%
                </span>
              </div>

              {/* Action Cards Row: Mandatory Assessments & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {/* Mandatory Assessments Card */}
                <div
                  onClick={() => {
                    setSelectedModule(modules[0]);
                    setCurrentView("chapter");
                  }}
                  className="sm:col-span-3 bg-white/10 hover:bg-white/15 backdrop-blur-xs border border-white/20 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-sky-200 text-sky-900 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileQuestion className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        Curriculum Assessments ({totalAssessments})
                      </p>
                      <p className="text-[10px] text-teal-100 truncate mt-0.5 font-medium">
                        View All Milestones
                      </p>
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
                    <p className="text-xs font-bold text-white truncate mt-0.5">
                      {currentMarks} / {maxMarks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs: Learning, Groups, Notes */}
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
            {modules.map((mod, idx) => {
              const modItems = mod.items || [];
              const modCompletedCount = modItems.filter((i) => completedLessonIds.includes(i.id)).length;
              const isModCompleted = modItems.length > 0 && modCompletedCount === modItems.length;

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedModule(mod);
                    setCurrentView("chapter");
                  }}
                  className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-4 sm:p-4.5 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="pr-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#0B4D5D] dark:group-hover:text-teal-400 transition-colors">
                        {mod.title}
                      </h3>
                      {isModCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                      {mod.meta} {modCompletedCount > 0 && `· ${modCompletedCount}/${modItems.length} Done`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Floating Sticky Bar with Responsive Container */}
        <div className="sticky bottom-0 z-20 bg-[#E3F2FD] dark:bg-[#0c2438] border-t border-sky-200/60 dark:border-sky-900/40 py-3">
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedModule(modules[0]);
                setCurrentView("chapter");
              }}
              className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200 hover:text-sky-950 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 stroke-[2]" />
              <span>Course Outline</span>
            </button>

            <button
              onClick={() => {
                setSelectedModule(modules[0]);
                setSelectedLesson(modules[0]?.items[0]);
                setCurrentView("player");
              }}
              className="bg-[#0B4D5D] hover:bg-[#093e4b] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {progressPercent > 0 ? "Continue Course" : "Start Course"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Chapter Details / Week Breakdown (Screenshot 2 Exact Design)
  // -------------------------------------------------------------
  if (currentView === "chapter") {
    const videoLessons = selectedModule?.items.filter((i) => i.type === "video") || [];
    const assessmentLessons = selectedModule?.items.filter((i) => i.type === "quiz" || i.type === "assignment") || [];

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
              {selectedModule?.title || "Module Curriculum"}
            </h1>
          </div>
        </div>

        {/* Content Area with Responsive Container */}
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Section 1: Lecture Videos */}
          <div className="space-y-3">
            <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Lecture Videos ({videoLessons.length})
            </h2>

            <div className="space-y-2.5">
              {videoLessons.map((item) => {
                const isDone = completedLessonIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedLesson(item);
                      setCurrentView("player");
                    }}
                    className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-full text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0 group-hover:text-blue-600 transition-colors">
                        <PlayCircle className="w-5 h-5 stroke-[2]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h3>
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        {item.duration && (
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate font-medium">
                            {item.duration} {item.description ? `· ${item.description}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Quizzes & Practical Lab Deliverables */}
          {assessmentLessons.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Quizzes & Hands-on Deliverables ({assessmentLessons.length})
              </h2>

              <div className="space-y-2.5">
                {assessmentLessons.map((item) => {
                  const isDone = completedLessonIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedLesson(item);
                        setCurrentView("player");
                      }}
                      className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100/90 dark:border-zinc-800/80 p-3.5 sm:p-4 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        {item.type === "quiz" ? (
                          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <FileQuestion className="w-4 h-4 stroke-[2.2]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Code className="w-4 h-4 stroke-[2.2]" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h3>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate font-medium">
                            {item.type === "quiz" ? "Graded Quiz" : "Hands-on Deliverable"} · {item.duration || "20 Mins"}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: Video Player / Interactive Quiz / Lab Assignment (Screenshot 3)
  // -------------------------------------------------------------
  const isVideo = selectedLesson?.type === "video";
  const isQuiz = selectedLesson?.type === "quiz";
  const isAssignment = selectedLesson?.type === "assignment";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#0B0D13] flex flex-col justify-between animate-fade-in">
      <div>
        {/* VIDEO PLAYER VIEW */}
        {isVideo && (
          <div className="bg-black/95 dark:bg-black w-full">
            <div className="max-w-4xl mx-auto sm:px-4 sm:pt-4">
              <div className="relative bg-zinc-900 w-full aspect-video sm:max-h-[480px] lg:max-h-[520px] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Top Video Header Overlay */}
                <div className="p-3 sm:p-4 flex items-center justify-between text-white bg-black/60 backdrop-blur-xs z-10 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => setCurrentView("chapter")}
                      aria-label="Back to Chapter Videos"
                      className="p-1 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                    </button>
                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                      {selectedLesson?.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markLessonComplete(selectedLesson.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{completedLessonIds.includes(selectedLesson.id) ? "Completed" : "Mark Complete"}</span>
                    </button>
                    <div className="text-[10px] font-black tracking-tight bg-white/20 px-2 py-1 rounded text-white">
                      UNISOLE
                    </div>
                  </div>
                </div>

                {/* Embedded YouTube Player */}
                <div className="flex-1 w-full h-full relative">
                  <iframe
                    src={getEmbedVideoUrl(selectedLesson?.videoUrl)}
                    title={selectedLesson?.title || "Curriculum Video"}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE QUIZ VIEW */}
        {isQuiz && (
          <div className="bg-white dark:bg-[#121622] border-b border-slate-200 dark:border-zinc-800 py-6">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentView("chapter")}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Week Lessons</span>
                </button>
                <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                  Passing Score: 70%
                </span>
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedLesson.title}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Answer the multiple-choice questions below to test your understanding of this module.
                </p>
              </div>

              {quizScore !== null && (
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    quizScore >= 70
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 stroke-[2]" />
                    <div>
                      <h4 className="text-sm font-bold">
                        {quizScore >= 70 ? "Quiz Passed!" : "Needs Review"} — Score: {quizScore}%
                      </h4>
                      <p className="text-xs opacity-90">
                        {quizScore >= 70
                          ? "Great job! This assessment has been credited to your progress."
                          : "Review the lecture notes and try again."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizScore(null);
                    }}
                    className="text-xs font-bold underline cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}

              <form onSubmit={handleQuizSubmit} className="space-y-6 pt-2">
                {(selectedLesson.questions || []).map((q, qIdx) => {
                  const userAnswer = quizAnswers[q.id];
                  const isCorrect = userAnswer === q.correctOptionIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-slate-50 dark:bg-[#0E121B] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-3"
                    >
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {qIdx + 1}. {q.question}
                      </h3>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          return (
                            <label
                              key={optIdx}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-sky-50 dark:bg-sky-950/50 border-sky-400 text-sky-950 dark:text-sky-200 font-semibold shadow-2xs"
                                  : "bg-white dark:bg-[#121622] border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                value={optIdx}
                                checked={isSelected}
                                onChange={() => {
                                  if (!quizSubmitted) {
                                    setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }));
                                  }
                                }}
                                disabled={quizSubmitted}
                                className="mt-0.5 accent-sky-600 cursor-pointer"
                              />
                              <span className="flex-1">{opt}</span>
                            </label>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div
                          className={`p-3 rounded-xl text-xs font-medium ${
                            isCorrect
                              ? "bg-emerald-100/70 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-rose-100/70 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                          }`}
                        >
                          <p className="font-bold">{isCorrect ? "Correct!" : "Incorrect"}</p>
                          <p className="mt-0.5">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizSubmitted && (
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#0B4D5D] hover:bg-[#093e4b] text-white font-bold text-xs py-3 px-8 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Submit Quiz Answers
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* INTERACTIVE LAB ASSIGNMENT VIEW */}
        {isAssignment && (
          <div className="bg-white dark:bg-[#121622] border-b border-slate-200 dark:border-zinc-800 py-6">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentView("chapter")}
                  className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Week Lessons</span>
                </button>
                <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Practical Deliverable
                </span>
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedLesson.title}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Complete the hands-on project tasks and submit your implementation repository link.
                </p>
              </div>

              {/* Lab Instructions Box */}
              <div className="bg-slate-50 dark:bg-[#0E121B] rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Lab Specification & Deliverable Requirements
                </h3>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed font-medium">
                  {selectedLesson.instructions || selectedLesson.description}
                </p>
              </div>

              {assignmentSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Lab Deliverable Submitted!</span>
                  </div>
                  <p className="text-xs opacity-90">
                    Your code has been queued for mentor evaluation. Submission URL:{" "}
                    <a
                      href={assignmentRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-mono text-emerald-700 dark:text-emerald-300"
                    >
                      {assignmentRepoUrl}
                    </a>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleAssignmentSubmit} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      GitHub Repository or Project Link *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                        <Github className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        required
                        value={assignmentRepoUrl}
                        onChange={(e) => setAssignmentRepoUrl(e.target.value)}
                        placeholder="https://github.com/your-username/repo-name"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121622] text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B4D5D]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Implementation Notes / Architecture Highlights (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="Brief notes explaining your architectural choices, containerization, or benchmark results..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#121622] text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B4D5D]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0B4D5D] hover:bg-[#093e4b] text-white font-bold text-xs py-3 px-8 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Submit Lab Deliverable
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Player Sub-tabs: Notes & Help (Screenshot 3 Exact Tabs) */}
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

        {/* Tab Content: Help (Glaide AI & Support Ticket) or Notes */}
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
                      Real-time AI mentor assistance
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>

              {/* Card 2: Contact Support */}
              <div
                onClick={() => setSupportTicketOpen(true)}
                className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-100 dark:border-zinc-800/80 p-4 shadow-2xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 transition-colors">
                      Contact Program Support
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      Academic, technical, or mentor ticket
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0 transition-transform group-hover:translate-x-0.5" />
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
                rows={4}
                placeholder="Take personal lecture notes, write code snippets, or save mentor feedback..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0B0D13] text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0B4D5D]"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setNotesSaved(true);
                    setTimeout(() => setNotesSaved(false), 2000);
                  }}
                  className="bg-[#0B4D5D] text-white text-xs font-bold py-1.5 px-4 rounded-lg cursor-pointer hover:bg-[#093e4b] transition-colors"
                >
                  Save Notes
                </button>
                {notesSaved && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Lesson Navigation (Left/Right Arrows in Amber Buttons) */}
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121622] w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col h-[520px] animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Glaide AI Mentor</h3>
                  <p className="text-[10px] text-zinc-500">Real-time Concept & Code Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setAiChatOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendAiMessage} className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask Glaide about this lecture..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121622] w-full max-w-sm rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create Support Ticket</h3>
              <button onClick={() => setSupportTicketOpen(false)} className="p-1 text-zinc-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Our academic mentoring team reviews tickets within 2 business hours.
            </p>
            <textarea
              rows={3}
              placeholder="Describe the issue you're facing..."
              className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSupportTicketOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Support ticket created. Reference #UNS-8921");
                  setSupportTicketOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0B4D5D] text-white hover:bg-[#093e4b] cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
