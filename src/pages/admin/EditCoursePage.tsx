import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Check,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Bold,
  Italic,
  Code,
  Code2,
  Heading,
  List,
  Link as LinkIcon,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
  Loader2,
  PlayCircle,
  FileQuestion,
  Award,
  Video,
  BookOpen,
  Clock,
  Users,
  UserCheck,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  useGetAdminCourseByIdQuery,
  useGetAdminCourseModulesQuery,
  useAttachAdminCourseModuleMutation,
  useCreateAdminModuleMutation,
  useGetAdminModuleLessonsQuery,
  useAttachAdminModuleLessonMutation,
  useCreateAdminLessonMutation,
  useGetAdminLessonByIdQuery,
  useUpdateAdminLessonMutation,
  useClearAdminCourseModulesMutation,
  useGetAdminStudentsQuery,
  useGetAdminMentorsQuery,
  useAssignMentorMutation,
  useUnassignMentorMutation,
} from "../../store/apiSlice";
import { useAutosave } from "../../utils/useAutosave";
import { LessonType, ContentStatus, QuizQuestion } from "../../types";
import RichEditor from "../../components/ui/RichEditor";
import { renderMarkdownToHtml } from "../../utils/formatContent";

export default function EditCoursePage() {
  const { courseId = "" } = useParams();

  // Queries
  const { data: course, isLoading: isCourseLoading } = useGetAdminCourseByIdQuery(courseId, {
    skip: !courseId,
  });
  const { data: courseModules = [], refetch: refetchModules } = useGetAdminCourseModulesQuery(
    courseId,
    { skip: !courseId }
  );

  // Mutations
  const [createModule] = useCreateAdminModuleMutation();
  const [attachModule] = useAttachAdminCourseModuleMutation();
  const [createLesson] = useCreateAdminLessonMutation();
  const [attachLesson] = useAttachAdminModuleLessonMutation();
  const [updateLessonMutation] = useUpdateAdminLessonMutation();
  const [clearCourseModulesMutation] = useClearAdminCourseModulesMutation();

  // Mentorship & Cohort Allocation State
  const { user } = useSelector((state: any) => state.auth);
  const userRoles = useMemo(() => {
    const primary = user?.role ? String(user.role).toUpperCase() : "";
    const secondary = Array.isArray(user?.roles)
      ? user.roles.map((r: any) => String(r).toUpperCase())
      : Array.isArray(user?.metadata?.roles)
      ? user.metadata.roles.map((r: any) => String(r).toUpperCase())
      : [];
    return [primary, ...secondary];
  }, [user]);

  const isAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");

  const [showMentorsModal, setShowMentorsModal] = useState(false);
  const [cohortMentorId, setCohortMentorId] = useState("");
  const [cohortFeedback, setCohortFeedback] = useState<string | null>(null);

  const { data: courseStudents = [], refetch: refetchCourseStudents } = useGetAdminStudentsQuery(
    { courseId, role: "STUDENT", enrolledOnly: true },
    { skip: !courseId }
  );
  const { data: mentorsList = [] } = useGetAdminMentorsQuery(undefined);
  const [assignMentorApi, { isLoading: isAssigningMentor }] = useAssignMentorMutation();
  const [unassignMentorApi, { isLoading: isUnassigningMentor }] = useUnassignMentorMutation();

  const handleAssignCourseMentor = async (studentId: string, mentorId: string) => {
    try {
      setCohortFeedback(null);
      await assignMentorApi({
        mentorId,
        menteeIds: [studentId],
        courseId,
      }).unwrap();
      refetchCourseStudents();
      setCohortFeedback("Mentor assigned successfully!");
      setTimeout(() => setCohortFeedback(null), 2500);
    } catch (err: any) {
      setCohortFeedback(err?.data?.error || "Failed to assign mentor. Admin access required.");
    }
  };

  const handleUnassignCourseMentor = async (studentId: string) => {
    try {
      setCohortFeedback(null);
      await unassignMentorApi({
        menteeId: studentId,
        courseId,
      }).unwrap();
      refetchCourseStudents();
      setCohortFeedback("Mentor unassigned successfully.");
      setTimeout(() => setCohortFeedback(null), 2500);
    } catch (err: any) {
      setCohortFeedback(err?.data?.error || "Failed to unassign mentor.");
    }
  };

  // Selected State
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [addingLessonForModuleId, setAddingLessonForModuleId] = useState<string | null>(null);

  // Active Lesson Form State
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonStatus, setLessonStatus] = useState<ContentStatus>("DRAFT");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [curriculumMode, setCurriculumMode] = useState<"LECTURE" | "PRACTICE" | "TEST">("LECTURE");
  const [practiceType, setPracticeType] = useState<"MCQ" | "PROJECT">("MCQ");
  const [testType, setTestType] = useState<"CODING_TEST" | "SUBJECTIVE_TEST" | "VIDEO_TEST" | "PROJECT">("CODING_TEST");
  const [lessonType, setLessonType] = useState<LessonType>("READING");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [videoUrl, setVideoUrl] = useState("");

  // Code Block State
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [codeSnippet, setCodeSnippet] = useState("");

  // Quiz State (Practice MCQ)
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "q-1",
      question: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      explanation: "",
    },
  ]);

  // Practice Project & Capstone Assignment State
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [allowedTypes, setAllowedTypes] = useState<("URL" | "GITHUB" | "FILE" | "TEXT")[]>([
    "URL",
    "GITHUB",
  ]);
  const [maxPoints, setMaxPoints] = useState(100);

  // Evaluated Coding Test State
  const [codingStarterCode, setCodingStarterCode] = useState(
    "import torch\n\ndef matrix_multiply(A: torch.Tensor, B: torch.Tensor) -> torch.Tensor:\n    # Implement your tensor matrix multiplication\n    pass\n"
  );
  const [codingLanguage, setCodingLanguage] = useState("python");
  const [codingTestCases, setCodingTestCases] = useState<
    Array<{ input: string; expected: string; isHidden: boolean }>
  >([
    { input: "A = torch.tensor([[1, 2], [3, 4]]), B = torch.tensor([[5, 6], [7, 8]])", expected: "tensor([[19, 22], [43, 50]])", isHidden: false },
    { input: "A = torch.eye(3), B = torch.eye(3)", expected: "tensor([[1., 0., 0.], [0., 1., 0.], [0., 0., 1.]])", isHidden: true },
  ]);

  // Evaluated Subjective Test State
  const [subjectivePrompt, setSubjectivePrompt] = useState("");
  const [subjectiveRubric, setSubjectiveRubric] = useState(
    "1. Architectural rationale & trade-offs (10 pts)\n2. Production scalability & memory profiling (10 pts)\n3. Edge case resilience & latency benchmarks (10 pts)"
  );

  // Evaluated Video Viva Test State
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDurationLimitSec, setVideoDurationLimitSec] = useState(180);

  // Attachments State
  const [attachments, setAttachments] = useState<
    Array<{ id: string; name: string; url: string; size?: string }>
  >([]);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [showAddAttachment, setShowAddAttachment] = useState(false);

  // Fetch full details of active lesson
  const { data: activeLessonData, refetch: refetchActiveLesson } = useGetAdminLessonByIdQuery(
    activeLessonId || "",
    { skip: !activeLessonId }
  );

  // Populate editor when active lesson changes
  useEffect(() => {
    if (activeLessonData) {
      setLessonTitle(activeLessonData.title || "");
      setLessonStatus(activeLessonData.status || "DRAFT");
      setDurationMinutes(activeLessonData.durationMinutes || 15);
      setVideoUrl(activeLessonData.videoUrl || "");

      // Try to parse structured content
      try {
        if (activeLessonData.content && activeLessonData.content.startsWith("{")) {
          const parsed = JSON.parse(activeLessonData.content);
          if (parsed.curriculumMode) {
            setCurriculumMode(parsed.curriculumMode);
          } else if (parsed.type === "QUIZ" || parsed.type === "quiz") {
            setCurriculumMode("PRACTICE");
            setPracticeType("MCQ");
          } else if (parsed.type === "CODING_TEST" || parsed.testType === "CODING_TEST") {
            setCurriculumMode("TEST");
            setTestType("CODING_TEST");
          } else if (parsed.type === "VIDEO_TEST" || parsed.testType === "VIDEO_TEST") {
            setCurriculumMode("TEST");
            setTestType("VIDEO_TEST");
          } else if (parsed.type === "SUBJECTIVE_TEST" || parsed.testType === "SUBJECTIVE_TEST") {
            setCurriculumMode("TEST");
            setTestType("SUBJECTIVE_TEST");
          } else if (parsed.category === "TEST") {
            setCurriculumMode("TEST");
          } else if (parsed.category === "PRACTICE") {
            setCurriculumMode("PRACTICE");
          } else {
            setCurriculumMode("LECTURE");
          }

          if (parsed.practiceType) setPracticeType(parsed.practiceType);
          if (parsed.testType) setTestType(parsed.testType);

          setLessonType(parsed.type || "READING");
          setIsFreePreview(!!parsed.isFreePreview);
          const rawMd = parsed.contentMarkdown || "";
          const rawHtml = parsed.contentHtml || renderMarkdownToHtml(rawMd);
          setContentMarkdown(rawMd || rawHtml);
          setContentHtml(rawHtml);
          setCodeLanguage(parsed.codeLanguage || "typescript");
          setCodeSnippet(parsed.codeSnippet || "");

          if (parsed.quiz) {
            setPassingScore(parsed.quiz.passingScorePercent || 70);
            setQuestions(parsed.quiz.questions || []);
          }
          if (parsed.assignment) {
            setAssignmentInstructions(parsed.assignment.instructions || "");
            setAllowedTypes(parsed.assignment.allowedTypes || ["URL", "GITHUB"]);
            setMaxPoints(parsed.assignment.maxPoints || 100);
          }
          if (parsed.codingTest) {
            setCodingStarterCode(parsed.codingTest.starterCode || "");
            setCodingLanguage(parsed.codingTest.language || "python");
            if (Array.isArray(parsed.codingTest.testCases)) {
              setCodingTestCases(parsed.codingTest.testCases);
            }
          }
          if (parsed.subjectiveTest) {
            setSubjectivePrompt(parsed.subjectiveTest.prompt || "");
            setSubjectiveRubric(parsed.subjectiveTest.rubrics || "");
          }
          if (parsed.videoTest) {
            setVideoPrompt(parsed.videoTest.prompt || "");
            setVideoDurationLimitSec(parsed.videoTest.maxDurationSec || 180);
          }
          if (parsed.attachments) {
            setAttachments(parsed.attachments);
          }
        } else {
          const raw = activeLessonData.content || activeLessonData.description || "";
          setContentMarkdown(raw);
          setContentHtml(renderMarkdownToHtml(raw));
          setLessonType("READING");
          setCurriculumMode("LECTURE");
        }
      } catch {
        const raw = activeLessonData.content || "";
        setContentMarkdown(raw);
        setContentHtml(renderMarkdownToHtml(raw));
        setCurriculumMode("LECTURE");
      }
    }
  }, [activeLessonData]);

  // Aggregate formData for autosave
  const formData = {
    title: lessonTitle,
    status: lessonStatus,
    durationMinutes,
    videoUrl,
    type:
      curriculumMode === "LECTURE"
        ? "READING"
        : curriculumMode === "PRACTICE"
        ? practiceType === "MCQ"
          ? "QUIZ"
          : "ASSIGNMENT"
        : testType === "CODING_TEST"
        ? "CODING_TEST"
        : testType === "VIDEO_TEST"
        ? "VIDEO_TEST"
        : testType === "SUBJECTIVE_TEST"
        ? "SUBJECTIVE_TEST"
        : "ASSIGNMENT",
    category:
      curriculumMode === "PRACTICE"
        ? "PRACTICE"
        : curriculumMode === "TEST"
        ? "TEST"
        : "LECTURE",
    curriculumMode,
    practiceType,
    testType,
    isFreePreview,
    contentMarkdown,
    contentHtml,
    codeLanguage,
    codeSnippet,
    quiz: {
      passingScorePercent: passingScore,
      questions,
    },
    assignment: {
      instructions: assignmentInstructions,
      allowedTypes,
      maxPoints,
    },
    codingTest: {
      starterCode: codingStarterCode,
      language: codingLanguage,
      testCases: codingTestCases,
      maxScore: maxPoints,
    },
    subjectiveTest: {
      prompt: subjectivePrompt,
      rubrics: subjectiveRubric,
      maxScore: maxPoints,
    },
    videoTest: {
      prompt: videoPrompt,
      maxDurationSec: videoDurationLimitSec,
      maxScore: maxPoints,
    },
    attachments,
  };

  // Autosave handler
  const handleSaveLesson = async (currentData: typeof formData) => {
    if (!activeLessonId) return;

    const payloadContent = JSON.stringify({
      type: currentData.type,
      category: currentData.category,
      curriculumMode: currentData.curriculumMode,
      practiceType: currentData.practiceType,
      testType: currentData.testType,
      isFreePreview: currentData.isFreePreview,
      contentMarkdown: currentData.contentMarkdown,
      contentHtml: currentData.contentHtml,
      codeLanguage: currentData.codeLanguage,
      codeSnippet: currentData.codeSnippet,
      quiz: currentData.quiz,
      assignment: currentData.assignment,
      codingTest: currentData.codingTest,
      subjectiveTest: currentData.subjectiveTest,
      videoTest: currentData.videoTest,
      attachments: currentData.attachments,
    });

    await updateLessonMutation({
      id: activeLessonId,
      body: {
        title: currentData.title,
        status: currentData.status,
        durationMinutes: currentData.durationMinutes,
        videoUrl: currentData.videoUrl,
        content: payloadContent,
        description: currentData.contentMarkdown
          ? currentData.contentMarkdown.replace(/<[^>]*>/g, "").slice(0, 200)
          : "",
      },
    }).unwrap();
  };

  const { status: saveStatus, forceSave } = useAutosave({
    data: formData,
    onSave: handleSaveLesson,
    enabled: !!activeLessonId,
    itemKey: activeLessonId,
    delayMs: 1200,
  });

  // Test case management for Coding Test
  const addTestCase = () => {
    setCodingTestCases((prev) => [
      ...prev,
      { input: "", expected: "", isHidden: false },
    ]);
  };

  const updateTestCase = (
    idx: number,
    field: "input" | "expected" | "isHidden",
    value: any
  ) => {
    setCodingTestCases((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const removeTestCase = (idx: number) => {
    setCodingTestCases((prev) => prev.filter((_, i) => i !== idx));
  };

  // Create & attach a new Chapter (Module)
  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;

    try {
      const slug = `${course?.slug || "course"}-ch-${Date.now()}`;
      const createdMod = await createModule({
        title: newChapterTitle.trim(),
        slug,
        status: "DRAFT",
      }).unwrap();

      const nextPosition = (courseModules?.length || 0) + 1;
      await attachModule({
        courseId,
        moduleId: createdMod.id,
        position: nextPosition,
      }).unwrap();

      setNewChapterTitle("");
      setShowAddChapter(false);
      refetchModules();
    } catch (err) {
      console.error("Failed to add chapter:", err);
    }
  };

  // Clear all chapters from this course
  const handleClearAllChapters = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove all chapters and lessons from this course? You can manually add new ones."
      )
    ) {
      return;
    }
    try {
      await clearCourseModulesMutation(courseId).unwrap();
      setActiveLessonId(null);
      refetchModules();
    } catch (err) {
      console.error("Failed to clear chapters:", err);
    }
  };

  // Create & attach a new Lesson
  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) return;

    try {
      const slug = `${course?.slug || "course"}-les-${Date.now()}`;
      const defaultContent = JSON.stringify({
        type: "READING",
        isFreePreview: false,
        contentMarkdown: "Write lesson reading notes here...",
        codeLanguage: "typescript",
        codeSnippet: "",
      });

      const created = await createLesson({
        title: newLessonTitle.trim(),
        slug,
        status: "DRAFT",
        content: defaultContent,
        durationMinutes: 15,
      }).unwrap();

      await attachLesson({
        moduleId,
        lessonId: created.id,
        position: 1,
      }).unwrap();

      setNewLessonTitle("");
      setAddingLessonForModuleId(null);
      setActiveLessonId(created.id);
      refetchModules();
    } catch (err) {
      console.error("Failed to create lesson:", err);
    }
  };



  // Quiz question management
  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: "",
        options: ["", "", "", ""],
        correctOptionIndex: 0,
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx].question = text;
      return copy;
    });
  };

  const updateQuestionOption = (qIdx: number, optIdx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options[optIdx] = text;
      return copy;
    });
  };

  const setCorrectOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].correctOptionIndex = optIdx;
      return copy;
    });
  };

  const updateQuestionExplanation = (idx: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx].explanation = text;
      return copy;
    });
  };

  // Attachment management
  const handleAddAttachment = () => {
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        name: newAttachmentName.trim(),
        url: newAttachmentUrl.trim(),
      },
    ]);
    setNewAttachmentName("");
    setNewAttachmentUrl("");
    setShowAddAttachment(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  if (isCourseLoading) {
    return (
      <div className="p-16 text-center text-xs text-slate-400">
        Loading course editor...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070A11] text-slate-800 dark:text-slate-100 font-sans">
      {/* Top Bar */}
      <div className="h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Curriculum /</span>
            <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {course?.title || "Untitled Course"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Autosave Status Pill */}
          {activeLessonId && saveStatus !== "idle" && (
            <div className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200">
              {saveStatus === "saving" && (
                <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
                  <span>Autosaving...</span>
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Saved</span>
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-rose-500 flex items-center gap-1 text-[11px] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Save error</span>
                </span>
              )}
            </div>
          )}

          {/* Quick Manual Save */}
          {activeLessonId && (
            <button
              onClick={forceSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/80 dark:border-slate-800/80 cursor-pointer"
              title="Save changes"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          )}

          {/* Course Mentors & Cohort Cockpit */}
          <button
            type="button"
            onClick={() => setShowMentorsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/60 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Manage mentors for enrolled students in this course"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Course Mentors & Cohort</span>
          </button>

          {/* Student View Link */}
          <Link
            to="/enrolled"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Student View</span>
          </Link>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column (30%): Chapters & Lessons Outline */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] flex flex-col md:h-[calc(100vh-56px)] overflow-y-auto">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Chapters & Lessons
            </span>
            <div className="flex items-center gap-1.5">
              {courseModules.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllChapters}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Remove all existing / dummy chapters"
                >
                  <Trash2 className="w-3 h-3 stroke-[2]" />
                  <span>Clear All</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAddChapter(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Chapter</span>
              </button>
            </div>
          </div>

          {/* Inline Add Chapter Form */}
          {showAddChapter && (
            <form onSubmit={handleAddChapter} className="p-3 bg-slate-50 dark:bg-[#070A11] border-b border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <input
                type="text"
                autoFocus
                placeholder="Chapter title..."
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddChapter(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-xs cursor-pointer"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          )}

          {/* Chapters & Lessons Tree */}
          <div className="p-3 space-y-3 flex-1">
            {courseModules.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <p>No chapters in this course yet.</p>
                <button
                  onClick={() => setShowAddChapter(true)}
                  className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                >
                  + Add First Chapter
                </button>
              </div>
            ) : (
              courseModules.map((cMod: any, idx: number) => (
                <ChapterSection
                  key={cMod.moduleId}
                  moduleId={cMod.moduleId}
                  moduleTitle={cMod.title}
                  position={idx + 1}
                  activeLessonId={activeLessonId}
                  onSelectLesson={(lessonId) => setActiveLessonId(lessonId)}
                  addingLessonForModuleId={addingLessonForModuleId}
                  setAddingLessonForModuleId={setAddingLessonForModuleId}
                  newLessonTitle={newLessonTitle}
                  setNewLessonTitle={setNewLessonTitle}
                  onAddLesson={handleAddLesson}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column (70%): Lesson Editor */}
        <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#070A11] md:h-[calc(100vh-56px)] overflow-y-auto p-4 sm:p-6 lg:p-8">
          {!activeLessonId ? (
            <div className="m-auto text-center p-8 max-w-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto border border-sky-500/20">
                <FileCode className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Select a lesson to edit
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose any lesson from the outline on the left, or add a new lesson to start writing notes, creating quizzes, or setting assignments.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-2xs space-y-6 animate-fade-in">
              {/* Lesson Details Header */}
              <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Mode & Category Hierarchy Selector */}
                  <div className="flex flex-col gap-2.5">
                    {/* Level 1: Curriculum Mode */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 dark:bg-[#070A11] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start">
                      <button
                        type="button"
                        onClick={() => setCurriculumMode("LECTURE")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          curriculumMode === "LECTURE"
                            ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 shadow-2xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        <PlayCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Lecture (Lec)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurriculumMode("PRACTICE")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          curriculumMode === "PRACTICE"
                            ? "bg-white dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 shadow-2xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        <FileQuestion className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Practice Assignment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurriculumMode("TEST")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          curriculumMode === "TEST"
                            ? "bg-white dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Test Assignment</span>
                      </button>
                    </div>

                    {/* Level 2 Sub-selectors */}
                    {curriculumMode === "PRACTICE" && (
                      <div className="flex items-center gap-1.5 p-1 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-800/40 self-start">
                        <button
                          type="button"
                          onClick={() => setPracticeType("MCQ")}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            practiceType === "MCQ"
                              ? "bg-amber-500 text-slate-950 shadow-2xs"
                              : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
                          }`}
                        >
                          MCQ (Knowledge Check)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPracticeType("PROJECT")}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            practiceType === "PROJECT"
                              ? "bg-amber-500 text-slate-950 shadow-2xs"
                              : "text-amber-800 dark:text-amber-300 hover:text-amber-950"
                          }`}
                        >
                          Projects (Hands-on Lab)
                        </button>
                      </div>
                    )}

                    {curriculumMode === "TEST" && (
                      <div className="flex items-center gap-1.5 p-1 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 self-start overflow-x-auto max-w-full">
                        <button
                          type="button"
                          onClick={() => setTestType("CODING_TEST")}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                            testType === "CODING_TEST"
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "text-indigo-800 dark:text-indigo-300 hover:text-indigo-950"
                          }`}
                        >
                          <Code2 className="w-3 h-3" />
                          <span>Coding Test</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestType("SUBJECTIVE_TEST")}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                            testType === "SUBJECTIVE_TEST"
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "text-indigo-800 dark:text-indigo-300 hover:text-indigo-950"
                          }`}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Subjective Test</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestType("VIDEO_TEST")}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                            testType === "VIDEO_TEST"
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "text-indigo-800 dark:text-indigo-300 hover:text-indigo-950"
                          }`}
                        >
                          <Video className="w-3 h-3" />
                          <span>Video Tests</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestType("PROJECT")}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
                            testType === "PROJECT"
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "text-indigo-800 dark:text-indigo-300 hover:text-indigo-950"
                          }`}
                        >
                          <Award className="w-3 h-3" />
                          <span>Projects (Capstone)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status & Free Preview Controls */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={isFreePreview}
                        onChange={(e) => setIsFreePreview(e.target.checked)}
                        className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                      />
                      <span>Free Preview</span>
                    </label>

                    <button
                      onClick={() =>
                        setLessonStatus(lessonStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED")
                      }
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                        lessonStatus === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {lessonStatus === "PUBLISHED" ? "Published" : "Draft"}
                    </button>
                  </div>
                </div>

                {/* Lesson Title Input */}
                <div>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Lesson Title..."
                    className="w-full text-xl sm:text-2xl font-black bg-transparent border-0 border-b border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none px-0 py-1 transition-colors text-slate-900 dark:text-white"
                  />
                </div>

                {/* Video Link & Estimated Duration (for Lectures & Video Tests) */}
                {(curriculumMode === "LECTURE" || (curriculumMode === "TEST" && testType === "VIDEO_TEST")) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Video URL (Optional: YouTube, Vimeo, or MP4 link)
                      </label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtu.be/..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────────── MODE: LECTURE ──────────────── */}
              {curriculumMode === "LECTURE" && (
                <div className="space-y-6">
                  {/* WYSIWYG Notes Editor */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Lesson Notes & Explanation
                    </label>
                    <RichEditor
                      initialValue={contentHtml || contentMarkdown}
                      onChange={(html) => {
                        setContentHtml(html);
                        setContentMarkdown(html);
                      }}
                      placeholder="Write your study notes, breakdown of concepts, architecture points, and instructions..."
                    />
                  </div>

                  {/* Code Box with Language Selector */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070A11]/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Code Example (Optional)
                      </span>
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] font-mono text-slate-700 dark:text-slate-200"
                      >
                        <option value="typescript">TypeScript</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash</option>
                        <option value="cpp">C++</option>
                      </select>
                    </div>
                    <textarea
                      rows={6}
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      placeholder={`// Paste sample ${codeLanguage} code here...`}
                      className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-[#070A11] text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>

                  {/* Attachments Section */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        Files & Downloadable Resources
                      </span>
                      <button
                        onClick={() => setShowAddAttachment(!showAddAttachment)}
                        className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        + Add File Link
                      </button>
                    </div>

                    {showAddAttachment && (
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] space-y-2">
                        <input
                          type="text"
                          placeholder="File name (e.g. Module 1 Slides.pdf)"
                          value={newAttachmentName}
                          onChange={(e) => setNewAttachmentName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120]"
                        />
                        <input
                          type="url"
                          placeholder="Public file URL (PDF, GitHub repo, Google Drive, ZIP)"
                          value={newAttachmentUrl}
                          onChange={(e) => setNewAttachmentUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] font-mono"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setShowAddAttachment(false)}
                            className="px-3 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddAttachment}
                            className="px-3.5 py-1 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-xs cursor-pointer"
                          >
                            Attach File
                          </button>
                        </div>
                      </div>
                    )}

                    {attachments.length === 0 ? (
                      <div className="text-xs text-slate-400 py-1">
                        No supplementary files attached.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070A11]/40 text-xs"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {att.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-600 dark:text-sky-400 font-mono hover:underline text-[11px]"
                              >
                                View
                              </a>
                              <button
                                onClick={() => removeAttachment(att.id)}
                                className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ──────────────── MODE: PRACTICE (MCQ) ──────────────── */}
              {curriculumMode === "PRACTICE" && practiceType === "MCQ" && (
                <div className="space-y-6">
                  {/* Passing Score Box */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070A11]/60">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Passing Score Percentage
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Score required for students to mark this practice quiz as mastered.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        className="w-16 px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-center font-bold text-slate-900 dark:text-white"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {questions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-4 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            Question {qIdx + 1}
                          </span>
                          {questions.length > 1 && (
                            <button
                              onClick={() => removeQuestion(qIdx)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Question Prompt */}
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                          placeholder="Type question prompt..."
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                        />

                        {/* 4 Choices */}
                        <div className="space-y-2">
                          <span className="text-[11px] text-slate-400 font-semibold">
                            Choices (Select the radio button for the correct answer):
                          </span>
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                checked={q.correctOptionIndex === optIdx}
                                onChange={() => setCorrectOption(qIdx, optIdx)}
                                className="text-amber-500 focus:ring-amber-500"
                              />
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                                placeholder={`Option ${optIdx + 1}`}
                                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                            Explanation (Optional: shown after answering)
                          </label>
                          <textarea
                            rows={2}
                            value={q.explanation || ""}
                            onChange={(e) => updateQuestionExplanation(qIdx, e.target.value)}
                            placeholder="Why is this option correct?"
                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addQuestion}
                      className="w-full py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-amber-500 dark:hover:border-amber-400 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      + Add Another Question
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────── MODE: PRACTICE (PROJECT LAB) ──────────────── */}
              {curriculumMode === "PRACTICE" && practiceType === "PROJECT" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                    <span className="font-bold">Ungraded Practice Lab: </span>
                    Students can submit repository links or code outputs to test their understanding. No formal mentor grading required.
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Lab Instructions & Exercise Requirements
                    </label>
                    <textarea
                      rows={8}
                      value={assignmentInstructions}
                      onChange={(e) => setAssignmentInstructions(e.target.value)}
                      placeholder="Detail the hands-on lab steps, sample dataset, or repository setup instructions..."
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Permitted Submission Formats
                    </span>
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowedTypes.includes("URL") || allowedTypes.includes("GITHUB")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAllowedTypes([...allowedTypes.filter((t) => t !== "GITHUB"), "URL"]);
                            } else {
                              setAllowedTypes(allowedTypes.filter((t) => t !== "URL" && t !== "GITHUB"));
                            }
                          }}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span>GitHub Repository / Live Demo URL</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={allowedTypes.includes("FILE")}
                          onChange={(e) => {
                            if (e.target.checked) setAllowedTypes([...allowedTypes, "FILE"]);
                            else setAllowedTypes(allowedTypes.filter((t) => t !== "FILE"));
                          }}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span>ZIP Archive Upload</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── MODE: TEST (CODING TEST) ──────────────── */}
              {curriculumMode === "TEST" && testType === "CODING_TEST" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-indigo-50/40 dark:bg-[#0B1120]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Automated Coding Test
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Executed inside the student runner with automated test cases.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={codingLanguage}
                        onChange={(e) => setCodingLanguage(e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070A11] font-mono font-bold text-slate-800 dark:text-slate-100"
                      >
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="rust">Rust</option>
                        <option value="go">Go</option>
                      </select>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          min={10}
                          max={500}
                          value={maxPoints}
                          onChange={(e) => setMaxPoints(Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070A11] text-center font-bold"
                        />
                        <span className="text-xs text-slate-400 font-sans">pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Starter Code */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Starter Code / Boilerplate
                    </label>
                    <textarea
                      rows={8}
                      value={codingStarterCode}
                      onChange={(e) => setCodingStarterCode(e.target.value)}
                      placeholder="// Provide starting code signature..."
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-[#070A11] text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  {/* Test Cases Manager */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Automated Test Cases ({codingTestCases.length})
                      </span>
                      <button
                        type="button"
                        onClick={addTestCase}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        + Add Test Case
                      </button>
                    </div>

                    <div className="space-y-3">
                      {codingTestCases.map((tc, tcIdx) => (
                        <div
                          key={tcIdx}
                          className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-slate-400 font-bold">
                              Test Case #{tcIdx + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={tc.isHidden}
                                  onChange={(e) => updateTestCase(tcIdx, "isHidden", e.target.checked)}
                                  className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                                />
                                <span>Hidden / Evaluated Only</span>
                              </label>
                              {codingTestCases.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeTestCase(tcIdx)}
                                  className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Input Expression / Argument
                              </label>
                              <input
                                type="text"
                                value={tc.input}
                                onChange={(e) => updateTestCase(tcIdx, "input", e.target.value)}
                                placeholder="[1, 2, 3], target = 4"
                                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Expected Output
                              </label>
                              <input
                                type="text"
                                value={tc.expected}
                                onChange={(e) => updateTestCase(tcIdx, "expected", e.target.value)}
                                placeholder="true"
                                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── MODE: TEST (SUBJECTIVE TEST) ──────────────── */}
              {curriculumMode === "TEST" && testType === "SUBJECTIVE_TEST" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-indigo-50/40 dark:bg-[#0B1120]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Subjective Evaluation Test
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Students write detailed architectural designs or code analyses for mentor review.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min={10}
                        max={500}
                        value={maxPoints}
                        onChange={(e) => setMaxPoints(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070A11] text-center font-bold"
                      />
                      <span className="text-xs text-slate-400 font-sans">pts</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Subjective Prompt & Question Statement
                    </label>
                    <textarea
                      rows={6}
                      value={subjectivePrompt}
                      onChange={(e) => setSubjectivePrompt(e.target.value)}
                      placeholder="Outline the architectural scenario, constraints, and questions the student must answer..."
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mentor Evaluation Rubric & Grading Breakdown
                    </label>
                    <textarea
                      rows={5}
                      value={subjectiveRubric}
                      onChange={(e) => setSubjectiveRubric(e.target.value)}
                      placeholder="Criteria 1 (10 pts): Architectural correctness&#10;Criteria 2 (10 pts): Edge-case resilience&#10;Criteria 3 (10 pts): Performance profiling"
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>
              )}

              {/* ──────────────── MODE: TEST (VIDEO VIVA TEST) ──────────────── */}
              {curriculumMode === "TEST" && testType === "VIDEO_TEST" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-purple-50/40 dark:bg-[#0B1120]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Video Viva / Presentation Test
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Students record a live video walkthrough or screen share explaining their architecture.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] text-slate-500">Max:</span>
                        <input
                          type="number"
                          min={30}
                          max={600}
                          step={30}
                          value={videoDurationLimitSec}
                          onChange={(e) => setVideoDurationLimitSec(Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070A11] text-center font-bold"
                        />
                        <span className="text-xs text-slate-400">sec</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          min={10}
                          max={500}
                          value={maxPoints}
                          onChange={(e) => setMaxPoints(Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070A11] text-center font-bold"
                        />
                        <span className="text-xs text-slate-400 font-sans">pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Viva Walkthrough Prompt & Topics
                    </label>
                    <textarea
                      rows={6}
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      placeholder="Prompt students to record their camera and explain their codebase trade-offs..."
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Viva Evaluation Rubrics & Criteria
                    </label>
                    <textarea
                      rows={5}
                      value={subjectiveRubric}
                      onChange={(e) => setSubjectiveRubric(e.target.value)}
                      placeholder="1. Technical depth and clarity of communication&#10;2. Architecture walkthrough reasoning&#10;3. Demonstration of working deliverables"
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    />
                  </div>
                </div>
              )}

              {/* ──────────────── MODE: TEST (CAPSTONE PROJECT) ──────────────── */}
              {curriculumMode === "TEST" && testType === "PROJECT" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-indigo-50/40 dark:bg-[#0B1120]">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Evaluated Capstone Project
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Formal end-of-module capstone assessed by lead mentors.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <input
                        type="number"
                        min={10}
                        max={1000}
                        value={maxPoints}
                        onChange={(e) => setMaxPoints(Number(e.target.value))}
                        className="w-20 px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#070A11] text-center font-bold"
                      />
                      <span className="text-xs text-slate-400 font-sans">pts</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Capstone Project Specification & Deliverables
                    </label>
                    <textarea
                      rows={8}
                      value={assignmentInstructions}
                      onChange={(e) => setAssignmentInstructions(e.target.value)}
                      placeholder="Detail the complete fullstack/AI capstone deliverable, API requirements, and test suites..."
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Submission Requirements
                      </span>
                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowedTypes.includes("URL") || allowedTypes.includes("GITHUB")}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAllowedTypes([...allowedTypes.filter((t) => t !== "GITHUB"), "URL"]);
                              } else {
                                setAllowedTypes(allowedTypes.filter((t) => t !== "URL" && t !== "GITHUB"));
                              }
                            }}
                            className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                          />
                          <span>GitHub Repo & Live URL</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowedTypes.includes("FILE")}
                            onChange={(e) => {
                              if (e.target.checked) setAllowedTypes([...allowedTypes, "FILE"]);
                              else setAllowedTypes(allowedTypes.filter((t) => t !== "FILE"));
                            }}
                            className="rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                          />
                          <span>ZIP Deliverable</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Evaluation Rubric
                      </span>
                      <textarea
                        rows={4}
                        value={subjectiveRubric}
                        onChange={(e) => setSubjectiveRubric(e.target.value)}
                        placeholder="Mentor grading rubrics..."
                        className="w-full p-2.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Mentors & Cohort Modal */}
      {showMentorsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Course Cohort Mentors
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {course?.title || "Course"} — Enrolled Learners & Guided Mentors
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMentorsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification / Feedback Banner */}
            {cohortFeedback && (
              <div className="mx-6 mt-4 p-3 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{cohortFeedback}</span>
              </div>
            )}

            {!isAdmin && (
              <div className="mx-6 mt-4 p-3 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Mentee-to-mentor allocation is managed by Platform Administrators.</span>
              </div>
            )}

            {/* Content Roster */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {courseStudents.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  No enrolled students currently registered for this course.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {courseStudents.map((st: any) => {
                    const assigned = st.assignedMentor;
                    return (
                      <div
                        key={st.id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {st.name || "Student"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {st.phone || ""}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {assigned ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                <span>Mentor: {assigned.mentorName} ({assigned.specialization || "Technical Mentor"})</span>
                              </span>
                            ) : (
                              <span className="text-amber-500 italic">No mentor assigned</span>
                            )}
                          </div>
                        </div>

                        {/* Admin Action */}
                        {isAdmin ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              value={assigned?.mentorId || ""}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignCourseMentor(st.id, e.target.value);
                                }
                              }}
                              disabled={isAssigningMentor}
                              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                            >
                              <option value="" disabled>
                                Select Mentor...
                              </option>
                              {mentorsList.map((m: any) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.activeMenteesCount} mentees)
                                </option>
                              ))}
                            </select>

                            {assigned && (
                              <button
                                type="button"
                                onClick={() => handleUnassignCourseMentor(st.id)}
                                disabled={isUnassigningMentor}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Remove mentor assignment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Admin Managed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#070A11]/40">
              <span className="text-[11px] text-slate-400">
                {courseStudents.length} total enrolled learner{courseStudents.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => setShowMentorsModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────── SUBCOMPONENT: Chapter Section with Lessons ────────────────
interface ChapterSectionProps {
  moduleId: string;
  moduleTitle?: string;
  position: number;
  activeLessonId: string | null;
  onSelectLesson: (id: string) => void;
  addingLessonForModuleId: string | null;
  setAddingLessonForModuleId: (id: string | null) => void;
  newLessonTitle: string;
  setNewLessonTitle: (title: string) => void;
  onAddLesson: (moduleId: string) => void;
}

function ChapterSection({
  moduleId,
  moduleTitle,
  position,
  activeLessonId,
  onSelectLesson,
  addingLessonForModuleId,
  setAddingLessonForModuleId,
  newLessonTitle,
  setNewLessonTitle,
  onAddLesson,
}: ChapterSectionProps) {
  const { data: moduleLessons = [] } = useGetAdminModuleLessonsQuery(moduleId);
  const [collapsed, setCollapsed] = useState(false);

  const getLessonBadge = (les: any) => {
    if (les.videoUrl) {
      return {
        label: "Video",
        bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
      };
    }
    const text = `${les.title || ""} ${les.slug || ""} ${les.lessonId || ""}`.toLowerCase();
    if (text.includes("quiz") || text.includes("mcq")) {
      return {
        label: "MCQ",
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      };
    }
    if (text.includes("coding") || text.includes("code")) {
      return {
        label: "Coding",
        bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
      };
    }
    if (text.includes("viva") || text.includes("video")) {
      return {
        label: "Viva",
        bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      };
    }
    if (text.includes("subjective") || text.includes("theory")) {
      return {
        label: "Subjective",
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
      };
    }
    if (text.includes("project") || text.includes("lab") || text.includes("capstone")) {
      return {
        label: "Project",
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      };
    }
    return {
      label: "Lesson",
      bg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60",
    };
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
      {/* Chapter Bar */}
      <div className="p-3 flex items-center justify-between bg-slate-50/70 dark:bg-[#070A11]/60 border-b border-slate-100 dark:border-slate-800/60">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-left truncate flex-1 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            Chapter {position}{moduleTitle ? ` — ${moduleTitle}` : ""}
          </span>
        </button>

        <button
          onClick={() => setAddingLessonForModuleId(moduleId)}
          className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline px-1.5 py-0.5 rounded cursor-pointer"
        >
          + Lesson
        </button>
      </div>

      {!collapsed && (
        <div className="p-2 space-y-1">
          {/* Lessons List */}
          {moduleLessons.length === 0 ? (
            <div className="py-3 px-2 text-[11px] text-slate-400 text-center">
              No lessons yet. Click + Lesson to add.
            </div>
          ) : (
            moduleLessons.map((les: any) => {
              const isSelected = activeLessonId === les.lessonId;
              const badge = getLessonBadge(les);
              const displayTitle = les.title && les.title.trim().length > 0 ? les.title : les.lessonId;
              return (
                <button
                  key={les.lessonId}
                  onClick={() => onSelectLesson(les.lessonId)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30 shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span className="text-xs font-semibold truncate flex-1">
                    {displayTitle}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </button>
              );
            })
          )}

          {/* Inline Add Lesson Input */}
          {addingLessonForModuleId === moduleId && (
            <div className="p-2.5 bg-slate-50 dark:bg-[#070A11] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 mt-1">
              <input
                type="text"
                autoFocus
                placeholder="Lesson title..."
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setAddingLessonForModuleId(null)}
                  className="px-2.5 py-1 text-xs text-slate-500 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onAddLesson(moduleId)}
                  className="px-3 py-1 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-xs cursor-pointer"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
