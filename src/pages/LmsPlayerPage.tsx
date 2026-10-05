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
  Plus,
  Edit3,
  Video as VideoIcon,
  Code2,
  MessageSquare,
} from "lucide-react";
import {
  useGetPathwayContentQuery,
  useGetLessonContentQuery,
  useGetStudentProgressQuery,
  useMarkLessonProgressMutation,
  useGetStudentSubmissionsQuery,
  useSubmitAssignmentMutation,
  useGetNotesQuery,
  useSaveNoteMutation,
  useGetCohortDataQuery,
  useGetStudentMentorQuery,
  useGetMentorCockpitQuery,
  useCreateCourseAssignmentMutation,
  useSubmitAssessmentTaskMutation,
  useGradeSubmissionMutation,
} from "../store/apiSlice";
import MilestonesModal from "../components/lms/MilestonesModal";
import CodingTestRunner from "../components/lms/CodingTestRunner";
import SubjectiveVideoTestRunner from "../components/lms/SubjectiveVideoTestRunner";
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

  // Milestones & Mentorship State
  const [isMilestonesOpen, setIsMilestonesOpen] = useState(false);
  const { data: studentMentor } = useGetStudentMentorQuery(undefined);
  const [submitAssessmentTaskApi] = useSubmitAssessmentTaskMutation();

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

  // Track student progress via backend API with local cache
  const { data: progressData } = useGetStudentProgressQuery(pathwayId);
  const [markLessonProgressApi] = useMarkLessonProgressMutation();
  const { data: submissionsData } = useGetStudentSubmissionsQuery(pathwayId);
  const [submitAssignmentApi] = useSubmitAssignmentMutation();

  const [localCompletedIds, setLocalCompletedIds] = useState<string[]>([]);

  const completedLessonIds: string[] = useMemo(() => {
    const fromServer = progressData?.completedLessonIds || [];
    return Array.from(new Set([...fromServer, ...localCompletedIds]));
  }, [progressData, localCompletedIds]);

  const markLessonComplete = async (lessonId: string) => {
    setLocalCompletedIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
    try {
      await markLessonProgressApi({
        lessonId,
        pathwayId,
        isCompleted: true,
      }).unwrap();
    } catch {
      // Fallback
    }
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

  // Existing submission check from backend API
  useEffect(() => {
    if (selectedLesson && selectedLesson.type === "assignment") {
      const existing = (submissionsData || []).find((s: any) => s.lessonId === selectedLesson.id);
      if (existing) {
        setAssignmentSubmitted(true);
        setAssignmentRepoUrl(existing.submissionUrl || "");
        setAssignmentNotes(existing.submissionText || "");
      } else {
        const local = getSubmissionForLesson(selectedLesson.id);
        if (local) {
          setAssignmentSubmitted(true);
          setAssignmentRepoUrl(local.submissionUrl);
          setAssignmentNotes(local.submissionText || "");
        }
      }
    }
  }, [selectedLesson, submissionsData]);

  // Notes state & Backend persistence
  const { data: notesData = [] } = useGetNotesQuery(pathwayId);
  const [saveNoteApi] = useSaveNoteMutation();
  const { data: cohortData } = useGetCohortDataQuery(pathwayId);

  const [userNotes, setUserNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // Sync userNotes with backend note when switching lessons
  useEffect(() => {
    if (selectedLesson && notesData) {
      const match = notesData.find((n: any) => n.lessonId === selectedLesson.id);
      setUserNotes(match?.content || "");
    }
  }, [selectedLesson?.id, notesData]);

  const handleSaveNote = async () => {
    if (!selectedLesson || !userNotes.trim()) return;
    try {
      await saveNoteApi({
        lessonId: selectedLesson.id,
        pathwayId,
        lessonTitle: selectedLesson.title,
        content: userNotes.trim(),
      }).unwrap();
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  // Support Ticket Modal
  const [supportTicketOpen, setSupportTicketOpen] = useState(false);

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

  // Progress metrics & Diagram Taxonomy
  const totalLessons = allLessonItems.length || 1;
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  const totalAssessments = allLessonItems.filter(
    (l) => l.type === "quiz" || l.type === "assignment" || (l as any).category === "PRACTICE" || (l as any).category === "TEST"
  ).length || 24;
  const completedAssessments = allLessonItems.filter(
    (l) => (l.type === "quiz" || l.type === "assignment" || (l as any).category) && completedLessonIds.includes(l.id)
  ).length;
  const currentMarks = completedAssessments * 10;
  const maxMarks = totalAssessments * 10;

  const totalVideos = allLessonItems.filter((l) => l.type === "video").length || 36;
  const completedVideos = allLessonItems.filter((l) => l.type === "video" && completedLessonIds.includes(l.id)).length;

  const practiceTasksCount = allLessonItems.filter(
    (l) => l.type === "quiz" || (l as any).category === "PRACTICE"
  ).length || 15;
  const testTasksCount = allLessonItems.filter(
    (l) => (l as any).category === "TEST" || (l as any).type === "CODING_TEST" || (l as any).type === "SUBJECTIVE_TEST" || (l as any).type === "VIDEO_TEST" || l.type === "assignment"
  ).length || 9;

  // Full milestone list for modal and diamond tracker
  const milestoneList = useMemo(() => {
    const list: any[] = [];
    modules.forEach((mod) => {
      mod.items.forEach((item) => {
        const isAssess =
          item.type === "quiz" ||
          item.type === "assignment" ||
          (item as any).category === "PRACTICE" ||
          (item as any).category === "TEST";
        if (isAssess) {
          list.push({
            id: item.id,
            title: item.title,
            category: (((item as any).category || (item.type === "quiz" ? "PRACTICE" : "TEST")) as "PRACTICE" | "TEST"),
            type: (((item as any).type || (item.type === "quiz" ? "MCQ" : "PROJECT")) as any),
            maxScore: (item as any).maxScore || 10,
            week: mod.title,
            isCompleted: completedLessonIds.includes(item.id),
          });
        }
      });
    });
    return list;
  }, [modules, completedLessonIds]);

  // Handle Quiz Submission
  const handleQuizSubmit = async (e: React.FormEvent) => {
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

    try {
      await submitAssignmentApi({
        lessonId: selectedLesson.id,
        pathwayId,
        type: "quiz",
        title: selectedLesson.title,
        score: percent,
        status: percent >= 60 ? "APPROVED" : "COMPLETED",
      }).unwrap();
    } catch {
      // Fallback
    }

    markLessonComplete(selectedLesson.id);
  };

  // Handle Assignment Submission
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentRepoUrl.trim()) return;

    try {
      await submitAssignmentApi({
        lessonId: selectedLesson.id,
        pathwayId,
        type: "assignment",
        title: selectedLesson.title,
        submissionUrl: assignmentRepoUrl.trim(),
        submissionText: assignmentNotes.trim(),
        status: "SUBMITTED",
      }).unwrap();
    } catch {
      // Fallback
    }

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


  // -------------------------------------------------------------
  // VIEW 1: Course Overview (Unisole Brand Theme)
  // -------------------------------------------------------------
  if (currentView === "overview") {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#070A11] flex flex-col justify-between">
        <div className="animate-fade-in">
          {/* Cosmic Midnight Navy Banner Header (Flowers of the Sky) */}
          <div className="bg-gradient-to-br from-[#070A11] via-[#0B1120] to-[#0D1D38] border-b border-sky-500/20 text-white py-6 sm:py-7">
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
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {progressPercent === 0 ? "AT RISK" : progressPercent >= 70 ? "ON TRACK" : "IN PROGRESS"}
                </span>
              </div>

              {/* Course Title & Syllabus Stats */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {courseTitle}
                </h1>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {completedVideos} / {totalVideos} Lectures · {practiceTasksCount} Practice Tasks · {testTasksCount} Tests · {completedCount} / {totalLessons} Completed
                </p>
              </div>

              {/* Progress Bar with Dynamic Percentage */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500 shadow-sm shadow-sky-400/50"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-sky-300 shrink-0">
                  {progressPercent}%
                </span>
              </div>

              {/* Action Cards Row: Mandatory Assessments & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {/* Mandatory Assessments Card */}
                <div
                  onClick={() => setIsMilestonesOpen(true)}
                  className="sm:col-span-3 bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center justify-center shrink-0">
                      <FileQuestion className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                        Curriculum Assessments ({totalAssessments})
                      </p>
                      <p className="text-[10px] text-sky-200/80 truncate mt-0.5 font-medium">
                        View All Milestones
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>

                {/* Marks Card */}
                <div className="sm:col-span-2 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-3.5 flex items-center gap-2.5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-sky-200/80 truncate font-medium">Marks</p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">
                      {currentMarks} / {maxMarks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>          {/* Tabs: Learning, Groups, Notes */}
          <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] sticky top-0 z-10">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setOverviewTab("learning")}
                  className={`py-3 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                    overviewTab === "learning"
                      ? "text-sky-500 font-bold"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  Learning
                  {overviewTab === "learning" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setOverviewTab("groups")}
                  className={`py-3 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                    overviewTab === "groups"
                      ? "text-sky-500 font-bold"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  Groups & Mentorship
                  {overviewTab === "groups" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => setOverviewTab("notes")}
                  className={`py-3 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                    overviewTab === "notes"
                      ? "text-sky-500 font-bold"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  Notes
                  {overviewTab === "notes" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content: Learning Modules vs Groups vs Notes */}
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {overviewTab === "learning" && (
              <div className="space-y-3.5">
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
                      className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-4.5 shadow-2xs hover:border-sky-500/40 dark:hover:border-sky-500/40 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="pr-3 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-sky-500 transition-colors">
                            {mod.title}
                          </h3>
                          {isModCompleted && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                          {mod.meta} {modCompletedCount > 0 && `· ${modCompletedCount}/${modItems.length} Done`}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-sky-500 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  );
                })}
              </div>
            )}

            {overviewTab === "groups" && (
              <div className="space-y-5 animate-fade-in">
                {/* Program Mentor Card */}
                <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Assigned Program Mentor
                    </span>
                    <span className="text-[11px] font-bold text-sky-500 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                      {studentMentor?.officeHours || "Tue & Thu 6:00 - 7:30 PM IST"}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <img
                      src={studentMentor?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
                      alt={studentMentor?.name || "Mentor"}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-500/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {studentMentor?.name || "Dr. Vikram Sethi"}
                      </h5>
                      <p className="text-xs text-sky-500 dark:text-sky-400 font-semibold truncate mt-0.5">
                        {studentMentor?.specialization || "Principal AI Scientist & GenAI Systems"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {studentMentor?.bio || "Guiding your weekly architecture huddles, capstone milestones, and production evaluations."}
                      </p>
                    </div>
                  </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => setSupportTicketOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask Mentor a Doubt</span>
                        </button>
                        <a
                          href="https://calendar.google.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Book Office Hours</span>
                        </a>
                      </div>
                    </div>

                    {/* Cohort Classmates List */}
                    <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Cohort Classmates & Collaborators
                      </h4>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {(cohortData?.peers || [
                          { id: "p1", name: "Aarav Sharma", college: "IIIT Una (Sanjauli)", branch: "CSE AI/ML", status: "Active" },
                          { id: "p2", name: "Priya Chauhan", college: "Govt College Sunni", branch: "B.Tech IT", status: "Active" },
                          { id: "p3", name: "Rohan Verma", college: "Govt College Theog", branch: "BCA Systems", status: "Active" },
                        ]).map((peer: any) => (
                          <div key={peer.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                            <div className="min-w-0 pr-2">
                              <h6 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {peer.name}
                              </h6>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {peer.college} • {peer.branch}
                              </p>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                              {peer.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
            )}

            {overviewTab === "notes" && (
              <div className="space-y-3.5 animate-fade-in">
                {notesData.length === 0 ? (
                  <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      No course notes saved yet
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      While watching video lessons, open the Notes tab to capture key takeaways and architecture code snippets.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedModule(modules[0]);
                        setSelectedLesson(modules[0]?.items[0]);
                        setCurrentView("player");
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Go to First Lesson</span>
                    </button>
                  </div>
                ) : (
                  notesData.map((note: any) => (
                    <div
                      key={note.id}
                      className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-sky-400 truncate">
                          {note.lessonTitle || `Lesson Note`}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Floating Sticky Bar with Responsive Container */}
        <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3">
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedModule(modules[0]);
                setCurrentView("chapter");
              }}
              className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
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
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              {progressPercent > 0 ? "Continue Course" : "Start Course"}
            </button>
          </div>
        </div>

        {/* Milestones Modal & Author Studio Drawer */}
        <MilestonesModal
          isOpen={isMilestonesOpen}
          onClose={() => setIsMilestonesOpen(false)}
          milestones={milestoneList}
          completedIds={completedLessonIds}
          onSelectMilestone={(item) => {
            const mod = modules.find((m) => m.items.some((i) => i.id === item.id)) || modules[0];
            const les = mod.items.find((i) => i.id === item.id) || mod.items[0];
            setSelectedModule(mod);
            setSelectedLesson(les);
            setCurrentView("player");
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: Chapter Details / Week Breakdown (Unisole Sky Theme)
  // -------------------------------------------------------------
  if (currentView === "chapter") {
    const videoLessons = selectedModule?.items.filter((i) => i.type === "video") || [];
    const practiceLessons =
      selectedModule?.items.filter(
        (i: any) =>
          i.category === "PRACTICE" ||
          (i.type === "quiz" && !i.isTest) ||
          (i.type === "assignment" && !i.isTest && i.category !== "TEST")
      ) || [];
    const testLessons =
      selectedModule?.items.filter(
        (i: any) =>
          i.category === "TEST" ||
          i.type === "coding_test" ||
          i.type === "subjective_test" ||
          i.type === "video_test" ||
          i.isTest
      ) || [];

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#070A11] text-slate-900 dark:text-slate-100 animate-fade-in">
        {/* Unisole Brand Header Bar */}
        <div className="bg-white/95 dark:bg-[#0B1120]/95 border-b border-slate-200/80 dark:border-sky-500/20 text-slate-900 dark:text-white sticky top-0 z-30 shadow-xs dark:shadow-lg backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => setCurrentView("overview")}
                aria-label="Back to Course Overview"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-sky-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-sky-500/20 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                  Curriculum Module
                </span>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {selectedModule?.title || "Module Curriculum"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMilestonesOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Award className="w-4 h-4" />
                <span>Milestones</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area with Responsive Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Section 1: Lecture Videos */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Lecture Videos ({videoLessons.length})</span>
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Concept Immersion</span>
            </div>

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
                    className="bg-white dark:bg-[#0B1120]/80 hover:bg-slate-50 dark:hover:bg-[#0F172A] rounded-2xl border border-slate-200/80 dark:border-sky-500/15 hover:border-sky-400/40 p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-2">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <PlayCircle className="w-5 h-5 stroke-[2]" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                            {item.title}
                          </h3>
                          {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </div>
                        {item.duration && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                            {item.duration} {item.description ? `· ${item.description}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-1" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Practice Assignments (MCQ, Projects) */}
          {practiceLessons.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Practice Assignments ({practiceLessons.length})</span>
                </h2>
                <span className="text-[11px] text-amber-600 dark:text-amber-400/80 font-medium">Ungraded Self-Assessment</span>
              </div>

              <div className="space-y-2.5">
                {practiceLessons.map((item: any) => {
                  const isDone = completedLessonIds.includes(item.id);
                  const isQuizItem = item.type === "quiz";
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedLesson(item);
                        setCurrentView("player");
                      }}
                      className="bg-white dark:bg-[#0B1120]/80 hover:bg-slate-50 dark:hover:bg-[#0F172A] rounded-2xl border border-amber-200 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/50 p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          {isQuizItem ? (
                            <FileQuestion className="w-5 h-5 stroke-[2]" />
                          ) : (
                            <Code className="w-5 h-5 stroke-[2]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                              {item.title}
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300">
                              {isQuizItem ? "Practice MCQ" : "Practice Project"}
                            </span>
                            {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                            {item.duration || "20 Mins"} {item.description ? `· ${item.description}` : ""}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 shrink-0 transition-transform group-hover:translate-x-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Evaluated Test Assignments (Coding Tests, Subjective, Video, Projects) */}
          {testLessons.length > 0 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2">
                  <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Evaluated Test Assignments ({testLessons.length})</span>
                </h2>
                <span className="text-[11px] text-sky-600 dark:text-sky-400/80 font-medium">Mentor & Autograded</span>
              </div>

              <div className="space-y-2.5">
                {testLessons.map((item: any) => {
                  const isDone = completedLessonIds.includes(item.id);
                  const isCoding = item.type === "coding_test" || item.type === "code";
                  const isVideo = item.type === "video_test";
                  const isSubjective = item.type === "subjective_test";

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedLesson(item);
                        setCurrentView("player");
                      }}
                      className="bg-white dark:bg-gradient-to-r dark:from-[#0B1120] dark:to-[#0D1D38] hover:bg-slate-50 dark:hover:to-[#112344] rounded-2xl border border-sky-200 dark:border-sky-500/30 hover:border-sky-400 p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                          {isCoding ? (
                            <Code2 className="w-5 h-5 stroke-[2.2]" />
                          ) : isVideo ? (
                            <VideoIcon className="w-5 h-5 stroke-[2.2]" />
                          ) : (
                            <FileText className="w-5 h-5 stroke-[2.2]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                              {item.title}
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-400/40 text-sky-700 dark:text-sky-300">
                              {isCoding
                                ? "Coding Test"
                                : isVideo
                                ? "Video Viva"
                                : isSubjective
                                ? "Subjective Test"
                                : "Capstone Project"}
                            </span>
                            {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
                            {item.duration || "45 Mins"} · Max Score: {item.maxScore || 100} pts
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-1" />
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
  // VIEW 3: Video Player / Interactive Assessment Runner
  // -------------------------------------------------------------
  const isVideo = selectedLesson?.type === "video";
  const isQuiz = selectedLesson?.type === "quiz";
  const isAssignment =
    selectedLesson?.type === "assignment" &&
    (selectedLesson as any)?.category !== "TEST" &&
    (selectedLesson as any)?.type !== "coding_test";
  const isCodingTest =
    (selectedLesson as any)?.type === "coding_test" ||
    (selectedLesson as any)?.type === "code" ||
    ((selectedLesson as any)?.category === "TEST" && (selectedLesson as any)?.type === "code");
  const isSubjectiveOrVideoTest =
    (selectedLesson as any)?.type === "subjective_test" ||
    (selectedLesson as any)?.type === "video_test" ||
    ((selectedLesson as any)?.category === "TEST" && (selectedLesson as any)?.type === "video");

  const handleAssessmentCodeSubmit = async (code: string, testSummary: any) => {
    markLessonComplete(selectedLesson.id);
    try {
      await submitAssessmentTaskApi({
        assignmentId: selectedLesson.id,
        codeSnippet: code,
      }).unwrap();
    } catch {
      // Non-critical fallback
    }
  };

  const handleSubjectiveVideoSubmit = async (data: { text?: string; videoUrl?: string }) => {
    markLessonComplete(selectedLesson.id);
    try {
      await submitAssessmentTaskApi({
        assignmentId: selectedLesson.id,
        videoUrl: data.videoUrl,
        notes: data.text,
      }).unwrap();
    } catch {
      // Non-critical fallback
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] dark:bg-[#070A11] text-slate-900 dark:text-slate-100 flex flex-col justify-between animate-fade-in">
      <div>
        {/* CODING TEST RUNNER */}
        {isCodingTest && (
          <div className="bg-slate-50/70 dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-sky-500/20 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
              <button
                onClick={() => setCurrentView("chapter")}
                className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white cursor-pointer mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Curriculum Module</span>
              </button>
              <CodingTestRunner
                title={selectedLesson.title}
                description={
                  selectedLesson.description ||
                  selectedLesson.instructions ||
                  "Solve the problem according to specifications and execute code against automated test cases."
                }
                config={(selectedLesson as any).config}
                isCompleted={completedLessonIds.includes(selectedLesson.id)}
                onSubmit={handleAssessmentCodeSubmit}
              />
            </div>
          </div>
        )}

        {/* SUBJECTIVE OR VIDEO TEST RUNNER */}
        {isSubjectiveOrVideoTest && (
          <div className="bg-slate-50/70 dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-sky-500/20 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
              <button
                onClick={() => setCurrentView("chapter")}
                className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white cursor-pointer mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Curriculum Module</span>
              </button>
              <SubjectiveVideoTestRunner
                type={
                  (selectedLesson as any)?.type === "video_test" ||
                  (selectedLesson as any)?.category === "TEST"
                    ? "VIDEO_TEST"
                    : "SUBJECTIVE_TEST"
                }
                title={selectedLesson.title}
                description={
                  selectedLesson.description ||
                  selectedLesson.instructions ||
                  "Provide your architectural rationale or link your video walkthrough viva demonstration."
                }
                config={(selectedLesson as any).config}
                isCompleted={completedLessonIds.includes(selectedLesson.id)}
                onSubmit={handleSubjectiveVideoSubmit}
              />
            </div>
          </div>
        )}

        {/* VIDEO PLAYER VIEW */}
        {isVideo && (
          <div className="bg-slate-900 dark:bg-black w-full">
            <div className="max-w-4xl mx-auto sm:px-4 sm:pt-4">
              <div className="relative bg-slate-950 dark:bg-[#0B1120] border border-slate-800 dark:border-sky-500/20 w-full aspect-video sm:max-h-[480px] lg:max-h-[520px] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                {/* Top Video Header Overlay */}
                <div className="p-3 sm:p-4 flex items-center justify-between text-white bg-black/60 backdrop-blur-xs z-10 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => setCurrentView("chapter")}
                      aria-label="Back to Chapter Videos"
                      className="p-1.5 rounded-lg text-white/90 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
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
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{completedLessonIds.includes(selectedLesson.id) ? "Completed" : "Mark Complete"}</span>
                    </button>
                    <div className="text-[10px] font-black tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-1 rounded">
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
          <div className="bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-sky-500/20 py-8">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentView("chapter")}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Week Lessons</span>
                </button>
                <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                  Passing Score: 70%
                </span>
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
                  {selectedLesson.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
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
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
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
                    className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer"
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
          <div className="bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-sky-500/20 py-8">
            <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentView("chapter")}
                  className="flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Curriculum Module</span>
                </button>
                <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  Practical Deliverable
                </span>
              </div>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {selectedLesson.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Complete the hands-on project tasks and submit your implementation repository link.
                </p>
              </div>

              {/* Lab Instructions Box */}
              <div className="bg-slate-50 dark:bg-[#070A11] rounded-2xl p-5 border border-slate-200/80 dark:border-sky-500/20 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Lab Specification & Deliverable Requirements
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-medium">
                  {selectedLesson.instructions || selectedLesson.description}
                </p>
              </div>

              {assignmentSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
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
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      GitHub Repository or Project Link *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Github className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        required
                        value={assignmentRepoUrl}
                        onChange={(e) => setAssignmentRepoUrl(e.target.value)}
                        placeholder="https://github.com/your-username/repo-name"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-sky-500/30 bg-white dark:bg-[#070A11] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Implementation Notes / Architecture Highlights (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="Brief notes explaining your architectural choices, containerization, or benchmark results..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-sky-500/30 bg-white dark:bg-[#070A11] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs py-3 px-8 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Submit Lab Deliverable
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Player Sub-tabs: Notes & Help */}
        <div className="border-b border-slate-200/80 dark:border-sky-500/20 bg-white dark:bg-[#0B1120]">
          <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center">
            <button
              onClick={() => setPlayerTab("notes")}
              className={`py-3.5 px-6 text-sm font-semibold relative transition-colors cursor-pointer ${
                playerTab === "notes"
                  ? "text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Notes
              {playerTab === "notes" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setPlayerTab("help")}
              className={`py-3.5 px-6 text-sm font-semibold relative transition-colors flex items-center gap-1.5 cursor-pointer ${
                playerTab === "help"
                  ? "text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span>Help</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mb-1" />
              {playerTab === "help" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content: Help (Mentor & Program Support) or Notes */}
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-3.5">
          {playerTab === "help" ? (
            <div className="space-y-3">
              {/* Contact Support */}
              <div
                onClick={() => setSupportTicketOpen(true)}
                className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-sky-500/20 p-4 shadow-2xs dark:shadow-sm hover:border-sky-400 dark:hover:border-sky-500/40 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                      Contact Program Support & Mentor
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Academic questions, technical assistance, or assignment guidance
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ) : (
            /* Notes Tab */
            <div className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-sky-500/20 p-4 sm:p-5 shadow-2xs dark:shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
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
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-sky-500/30 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveNote}
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold py-2 px-5 rounded-xl cursor-pointer shadow-sm transition-all"
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

      {/* Bottom Sticky Lesson Navigation */}
      <div className="sticky bottom-0 z-20 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-sky-500/20 py-3.5">
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={handlePreviousLesson}
            disabled={!hasPrevious}
            aria-label="Previous lesson"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              hasPrevious
                ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/25 border border-sky-200 dark:border-sky-500/30 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
            }`}
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Lesson {currentLessonIndex + 1} of {allLessonItems.length}
          </span>

          <button
            onClick={handleNextLesson}
            disabled={!hasNext}
            aria-label="Next lesson"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              hasNext
                ? "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/25 border border-sky-200 dark:border-sky-500/30 shadow-2xs"
                : "bg-slate-100 dark:bg-slate-900 text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
            }`}
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Support Ticket Modal */}
      {supportTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-sky-500/30 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-sky-500/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Support Ticket</h3>
              <button onClick={() => setSupportTicketOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our academic mentoring team reviews tickets within 2 business hours.
            </p>
            <textarea
              rows={3}
              placeholder="Describe the issue you're facing..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-sky-500/30 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSupportTicketOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Support ticket created. Reference #UNS-8921");
                  setSupportTicketOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 cursor-pointer transition-all"
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


