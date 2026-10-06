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
  ArrowUp,
  ArrowDown,
  FolderInput,
  Folder,
  FolderPlus,
  FolderOpen,
  FileArchive,
  Download,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  useGetAdminCourseByIdQuery,
  useGetAdminCourseModulesQuery,
  useAttachAdminCourseModuleMutation,
  useDetachAdminCourseModuleMutation,
  useReorderAdminCourseModulesMutation,
  useCreateAdminModuleMutation,
  useGetAdminModuleLessonsQuery,
  useAttachAdminModuleLessonMutation,
  useDetachAdminModuleLessonMutation,
  useReorderAdminModuleLessonsMutation,
  useMoveAdminModuleLessonMutation,
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
    refetchOnMountOrArgChange: true,
  });
  const { data: courseModules = [], refetch: refetchModules } = useGetAdminCourseModulesQuery(
    courseId,
    { skip: !courseId, refetchOnMountOrArgChange: true }
  );

  // Mutations
  const [createModule] = useCreateAdminModuleMutation();
  const [attachModule] = useAttachAdminCourseModuleMutation();
  const [detachModule] = useDetachAdminCourseModuleMutation();
  const [reorderModulesApi] = useReorderAdminCourseModulesMutation();
  const [createLesson] = useCreateAdminLessonMutation();
  const [attachLesson] = useAttachAdminModuleLessonMutation();
  const [detachLesson] = useDetachAdminModuleLessonMutation();
  const [reorderLessonsApi] = useReorderAdminModuleLessonsMutation();
  const [moveLessonApi] = useMoveAdminModuleLessonMutation();
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
  const [curriculumMode, setCurriculumMode] = useState<"LECTURE" | "PRACTICE" | "TEST" | "FOLDER">("LECTURE");
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
          } else if (parsed.type === "FOLDER" || parsed.category === "FOLDER") {
            setCurriculumMode("FOLDER");
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
  const isLec = curriculumMode === "LECTURE";
  const isPrac = curriculumMode === "PRACTICE";
  const isTst = curriculumMode === "TEST";
  const isFolder = curriculumMode === "FOLDER";

  const resolvedType = isFolder
    ? "FOLDER"
    : isLec
    ? videoUrl ? "VIDEO" : "READING"
    : isPrac
    ? practiceType === "MCQ"
      ? "QUIZ"
      : "ASSIGNMENT"
    : testType === "CODING_TEST"
    ? "CODING_TEST"
    : testType === "VIDEO_TEST"
    ? "VIDEO_TEST"
    : testType === "SUBJECTIVE_TEST"
    ? "SUBJECTIVE_TEST"
    : "ASSIGNMENT";

  const resolvedCategory = isFolder ? "FOLDER" : isPrac ? "PRACTICE" : isTst ? "TEST" : "LECTURE";

  const formData = {
    title: lessonTitle,
    status: lessonStatus,
    durationMinutes,
    videoUrl,
    type: resolvedType,
    category: resolvedCategory,
    curriculumMode,
    practiceType: isPrac ? practiceType : undefined,
    testType: isTst ? testType : undefined,
    isFreePreview,
    contentMarkdown,
    contentHtml,
    codeLanguage,
    codeSnippet,
    quiz: isPrac && practiceType === "MCQ" ? {
      passingScorePercent: passingScore,
      questions,
    } : undefined,
    assignment: isPrac && practiceType === "PROJECT" ? {
      instructions: assignmentInstructions,
      allowedTypes,
      maxPoints,
    } : undefined,
    codingTest: isTst && testType === "CODING_TEST" ? {
      starterCode: codingStarterCode,
      language: codingLanguage,
      testCases: codingTestCases,
      maxScore: maxPoints,
    } : undefined,
    subjectiveTest: isTst && testType === "SUBJECTIVE_TEST" ? {
      prompt: subjectivePrompt,
      rubrics: subjectiveRubric,
      maxScore: maxPoints,
    } : undefined,
    videoTest: isTst && testType === "VIDEO_TEST" ? {
      prompt: videoPrompt,
      maxDurationSec: videoDurationLimitSec,
      maxScore: maxPoints,
    } : undefined,
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

  // Reorder Chapters
  const handleMoveChapter = async (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === courseModules.length - 1) return;

    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const newOrder = [...courseModules];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    const moduleIds = newOrder.map((m: any) => m.moduleId);
    try {
      await reorderModulesApi({ courseId, moduleIds }).unwrap();
      refetchModules();
    } catch (err) {
      console.error("Failed to reorder chapters:", err);
    }
  };

  // Delete Chapter
  const handleDeleteChapter = async (moduleId: string) => {
    if (!window.confirm("Are you sure you want to remove this chapter and its lessons from this course?")) return;
    try {
      await detachModule({ courseId, moduleId }).unwrap();
      refetchModules();
    } catch (err) {
      console.error("Failed to remove chapter:", err);
    }
  };

  // Create & attach a pre-configured Template Lesson
  const handleAddLessonWithType = async (
    moduleId: string,
    lessonTypeKey:
      | "LECTURE_VIDEO"
      | "PRACTICE_MCQ"
      | "PRACTICE_PROJECT"
      | "TEST_CODING"
      | "TEST_VIVA"
      | "TEST_SUBJECTIVE"
      | "TEST_PROJECT"
      | "FOLDER"
      | "CUSTOM",
    customTitle?: string
  ) => {
    try {
      const slug = `${course?.slug || "course"}-les-${Date.now()}`;
      let title = customTitle || "New Lesson";
      let payloadContent: any = {};
      let videoUrl: string | undefined = undefined;

      switch (lessonTypeKey) {
        case "FOLDER":
          title = customTitle || "📁 Resources & Lab Files";
          payloadContent = {
            type: "FOLDER",
            category: "FOLDER",
            curriculumMode: "FOLDER",
            isFreePreview: true,
            contentMarkdown: "### 📁 Resources & Learning Assets\n\nDownload starter files, slides, and supplementary cheat sheets for this chapter.",
            attachments: [
              {
                id: `att-${Date.now()}`,
                name: "Starter Code & Project Files",
                url: "https://github.com",
                size: "2.4 MB",
              },
            ],
          };
          break;

        case "LECTURE_VIDEO":
          title = customTitle || "Lecture Video";
          videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1";
          payloadContent = {
            type: "VIDEO",
            category: "LECTURE",
            curriculumMode: "LECTURE",
            videoUrl,
            isFreePreview: false,
            contentMarkdown: "Watch the lecture video end-to-end and prepare study notes.",
          };
          break;

        case "PRACTICE_MCQ":
          title = customTitle || "Practice Quiz (MCQ)";
          payloadContent = {
            type: "QUIZ",
            category: "PRACTICE",
            curriculumMode: "PRACTICE",
            practiceType: "MCQ",
            isFreePreview: false,
            contentMarkdown: "Test your understanding with these practice multiple choice questions.",
            quiz: {
              passingScorePercent: 70,
              questions: [
                {
                  id: `q-${Date.now()}`,
                  question: "What is the primary objective of this module?",
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctOptionIndex: 0,
                  explanation: "Option A is the correct answer based on lecture concepts.",
                },
              ],
            },
          };
          break;

        case "PRACTICE_PROJECT":
          title = customTitle || "Hands-on Practice Lab";
          payloadContent = {
            type: "ASSIGNMENT",
            category: "PRACTICE",
            curriculumMode: "PRACTICE",
            practiceType: "PROJECT",
            isFreePreview: false,
            contentMarkdown: "Build the lab project locally and verify the test results.",
            assignment: {
              instructions: "Follow instructions to build the feature and submit your repository or notes.",
              allowedTypes: ["URL", "GITHUB"],
              maxPoints: 100,
            },
          };
          break;

        case "TEST_CODING":
          title = customTitle || "Coding Assessment Test";
          payloadContent = {
            type: "CODING_TEST",
            category: "TEST",
            curriculumMode: "TEST",
            testType: "CODING_TEST",
            isFreePreview: false,
            contentMarkdown: "Write optimal code solving the problem specification.",
            codingTest: {
              starterCode: "def solution():\n    # Implement solution here\n    pass\n",
              language: "python",
              testCases: [
                { id: "tc-1", input: "1, 2", expectedOutput: "3", isHidden: false },
                { id: "tc-2", input: "5, 10", expectedOutput: "15", isHidden: true },
              ],
              maxScore: 100,
            },
          };
          break;

        case "TEST_VIVA":
          title = customTitle || "Video Viva Demonstration";
          payloadContent = {
            type: "VIDEO_TEST",
            category: "TEST",
            curriculumMode: "TEST",
            testType: "VIDEO_TEST",
            isFreePreview: false,
            contentMarkdown: "Record a short video walkthrough explaining your architecture and codebase.",
            videoTest: {
              prompt: "Demonstrate working software and explain key design decisions.",
              maxDurationSec: 180,
              maxScore: 100,
            },
          };
          break;

        case "TEST_SUBJECTIVE":
          title = customTitle || "Subjective Architecture Test";
          payloadContent = {
            type: "SUBJECTIVE_TEST",
            category: "TEST",
            curriculumMode: "TEST",
            testType: "SUBJECTIVE_TEST",
            isFreePreview: false,
            contentMarkdown: "Answer the engineering rationale and system design questions below.",
            subjectiveTest: {
              prompt: "Explain system trade-offs and engineering design patterns.",
              rubrics: "Technical accuracy (40 pts), Architecture depth (30 pts), Clarity (30 pts)",
              maxScore: 100,
            },
          };
          break;

        case "TEST_PROJECT":
          title = customTitle || "Capstone Evaluated Project";
          payloadContent = {
            type: "ASSIGNMENT",
            category: "TEST",
            curriculumMode: "TEST",
            testType: "PROJECT",
            isFreePreview: false,
            contentMarkdown: "Deploy your final project and submit for mentor evaluation.",
            assignment: {
              instructions: "Submit production GitHub repository and live deployment URL.",
              allowedTypes: ["URL", "GITHUB"],
              maxPoints: 100,
            },
          };
          break;

        default:
          title = customTitle || "New Lesson";
          payloadContent = {
            type: "READING",
            category: "LECTURE",
            curriculumMode: "LECTURE",
            isFreePreview: false,
            contentMarkdown: "Write lesson reading notes here...",
          };
          break;
      }

      const created = await createLesson({
        title,
        slug,
        status: "DRAFT",
        content: JSON.stringify(payloadContent),
        videoUrl,
        durationMinutes: 15,
      }).unwrap();

      await attachLesson({
        moduleId,
        lessonId: created.id,
        position: 0,
      }).unwrap();

      setNewLessonTitle("");
      setAddingLessonForModuleId(null);
      setActiveLessonId(created.id);
      refetchModules();
    } catch (err) {
      console.error("Failed to create lesson:", err);
    }
  };

  // Create & attach a new generic Lesson
  const handleAddLesson = async (moduleId: string) => {
    await handleAddLessonWithType(moduleId, "CUSTOM", newLessonTitle.trim() || undefined);
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
                  isFirst={idx === 0}
                  isLast={idx === courseModules.length - 1}
                  allModules={courseModules}
                  activeLessonId={activeLessonId}
                  onSelectLesson={(lessonId) => setActiveLessonId(lessonId)}
                  onMoveChapter={(direction) => handleMoveChapter(idx, direction)}
                  onDeleteChapter={() => handleDeleteChapter(cMod.moduleId)}
                  onAddLessonWithType={(typeKey, customTitle) =>
                    handleAddLessonWithType(cMod.moduleId, typeKey, customTitle)
                  }
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
                  {/* Item Type Badge Indicator */}
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border shadow-2xs ${
                      curriculumMode === "LECTURE"
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                        : curriculumMode === "PRACTICE"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : curriculumMode === "TEST"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                        : "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
                    }`}>
                      {curriculumMode === "LECTURE" && (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Video Lecture</span>
                        </>
                      )}
                      {curriculumMode === "PRACTICE" && (
                        <>
                          <FileQuestion className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{practiceType === "MCQ" ? "Practice Quiz (MCQ)" : "Practice Lab"}</span>
                        </>
                      )}
                      {curriculumMode === "TEST" && (
                        <>
                          <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>
                            {testType === "CODING_TEST"
                              ? "Evaluated Coding Test"
                              : testType === "PROJECT"
                              ? "Capstone Project"
                              : testType === "VIDEO_TEST"
                              ? "Video Assessment"
                              : "Subjective Test"}
                          </span>
                        </>
                      )}
                      {curriculumMode === "FOLDER" && (
                        <>
                          <FolderOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Resource Folder</span>
                        </>
                      )}
                    </span>
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

              {/* ──────────────── MODE: FOLDER (RESOURCES CONTAINER) ──────────────── */}
              {curriculumMode === "FOLDER" && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/40 flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-teal-950 dark:text-teal-200">
                        Folder / Sub-Section Container
                      </h3>
                      <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 mt-0.5">
                        Use this folder to organize chapter resources, starter source code, lecture slides, downloadable cheat sheets, and supplementary notes.
                      </p>
                    </div>
                  </div>

                  {/* WYSIWYG Folder Notes / Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Folder Overview & Notes (Markdown)
                    </label>
                    <RichEditor
                      initialValue={contentHtml || contentMarkdown}
                      onChange={(html) => {
                        setContentHtml(html);
                        setContentMarkdown(html);
                      }}
                      placeholder="Write guidelines, description of files in this folder, and download instructions..."
                    />
                  </div>

                  {/* Folder Resource Files & Download Links */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Paperclip className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        Downloadable Assets & Resource Links ({attachments.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddAttachment(!showAddAttachment)}
                        className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                      >
                        + Add File / Asset
                      </button>
                    </div>

                    {showAddAttachment && (
                      <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-800/60 bg-teal-50/40 dark:bg-teal-950/20 space-y-2.5">
                        <input
                          type="text"
                          placeholder="Asset Name (e.g. Starter Repo, Slide Deck, Cheatsheet PDF)..."
                          value={newAttachmentName}
                          onChange={(e) => setNewAttachmentName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                        />
                        <input
                          type="url"
                          placeholder="Resource URL (e.g. https://github.com/... or Google Drive link)..."
                          value={newAttachmentUrl}
                          onChange={(e) => setNewAttachmentUrl(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-teal-500/40 font-mono"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddAttachment(false)}
                            className="px-2.5 py-1 text-xs text-slate-500 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddAttachment}
                            className="px-3 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-xs cursor-pointer"
                          >
                            Add Asset
                          </button>
                        </div>
                      </div>
                    )}

                    {attachments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No files attached yet. Click "+ Add File / Asset" above to add starter code, slides or links.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070A11] group"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileArchive className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {att.name}
                                </p>
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-teal-600 dark:text-teal-400 truncate hover:underline font-mono block"
                                >
                                  {att.url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {att.size && (
                                <span className="text-[10px] text-slate-400">{att.size}</span>
                              )}
                              <button
                                type="button"
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
  isFirst: boolean;
  isLast: boolean;
  allModules: any[];
  activeLessonId: string | null;
  onSelectLesson: (id: string) => void;
  onMoveChapter: (direction: "UP" | "DOWN") => void;
  onDeleteChapter: () => void;
  onAddLessonWithType: (
    typeKey:
      | "LECTURE_VIDEO"
      | "PRACTICE_MCQ"
      | "PRACTICE_PROJECT"
      | "TEST_CODING"
      | "TEST_VIVA"
      | "TEST_SUBJECTIVE"
      | "TEST_PROJECT"
      | "FOLDER"
      | "CUSTOM",
    customTitle?: string
  ) => void;
}

function ChapterSection({
  moduleId,
  moduleTitle,
  position,
  isFirst,
  isLast,
  allModules,
  activeLessonId,
  onSelectLesson,
  onMoveChapter,
  onDeleteChapter,
  onAddLessonWithType,
}: ChapterSectionProps) {
  const { data: moduleLessons = [] } = useGetAdminModuleLessonsQuery(moduleId, {
    refetchOnMountOrArgChange: true,
  });
  const [reorderLessonsApi] = useReorderAdminModuleLessonsMutation();
  const [moveLessonApi] = useMoveAdminModuleLessonMutation();
  const [detachLessonApi] = useDetachAdminModuleLessonMutation();

  const [collapsed, setCollapsed] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLessonTitle, setCustomLessonTitle] = useState("");
  const [movingLessonId, setMovingLessonId] = useState<string | null>(null);

  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    if (showAddMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddMenu]);

  // Lesson reordering within chapter
  const handleMoveLesson = async (e: React.MouseEvent, index: number, direction: "UP" | "DOWN") => {
    e.stopPropagation();
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === moduleLessons.length - 1) return;

    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const newOrder = [...moduleLessons];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    const lessonIds = newOrder.map((l: any) => l.lessonId);
    try {
      await reorderLessonsApi({ moduleId, lessonIds }).unwrap();
    } catch (err) {
      console.error("Failed to reorder lessons:", err);
    }
  };

  // Move lesson to another chapter
  const handleMoveToModule = async (e: React.MouseEvent, lessonId: string, targetModuleId: string) => {
    e.stopPropagation();
    try {
      await moveLessonApi({
        sourceModuleId: moduleId,
        targetModuleId,
        lessonId,
      }).unwrap();
      setMovingLessonId(null);
    } catch (err) {
      console.error("Failed to move lesson:", err);
    }
  };

  // Delete lesson from chapter
  const handleDeleteLesson = async (e: React.MouseEvent, lessonId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this lesson from this chapter?")) return;
    try {
      await detachLessonApi({ moduleId, lessonId }).unwrap();
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    }
  };

  const getLessonBadge = (les: any) => {
    if (les.videoUrl) {
      return {
        label: "Video",
        bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
        isFolder: false,
      };
    }
    const text = `${les.title || ""} ${les.slug || ""} ${les.lessonId || ""}`.toLowerCase();
    if (text.includes("folder") || text.includes("📁") || les.type === "FOLDER" || les.category === "FOLDER") {
      return {
        label: "Folder",
        bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
        isFolder: true,
      };
    }
    if (text.includes("quiz") || text.includes("mcq")) {
      return {
        label: "MCQ",
        bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        isFolder: false,
      };
    }
    if (text.includes("coding") || text.includes("code")) {
      return {
        label: "Coding",
        bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
        isFolder: false,
      };
    }
    if (text.includes("viva") || text.includes("video")) {
      return {
        label: "Viva",
        bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        isFolder: false,
      };
    }
    if (text.includes("subjective") || text.includes("theory")) {
      return {
        label: "Subjective",
        bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
        isFolder: false,
      };
    }
    if (text.includes("project") || text.includes("lab") || text.includes("capstone")) {
      return {
        label: "Project",
        bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        isFolder: false,
      };
    }
    return {
      label: "Lesson",
      bg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60",
      isFolder: false,
    };
  };

  const otherModules = allModules.filter((m) => m.moduleId !== moduleId);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] shadow-2xs">
      {/* Chapter Header */}
      <div className="p-3 flex items-center justify-between bg-slate-50/70 dark:bg-[#070A11]/60 border-b border-slate-100 dark:border-slate-800/60 gap-2">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-left truncate flex-1 min-w-0 cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            Chapter {position}{moduleTitle ? ` — ${moduleTitle}` : ""}
          </span>
        </button>

        {/* Chapter Actions: Shift, Add, Delete */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMoveChapter("UP")}
            title="Shift Chapter Up"
            className={`p-1 rounded-lg transition-colors ${
              isFirst
                ? "text-slate-200 dark:text-slate-800 cursor-not-allowed"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMoveChapter("DOWN")}
            title="Shift Chapter Down"
            className={`p-1 rounded-lg transition-colors ${
              isLast
                ? "text-slate-200 dark:text-slate-800 cursor-not-allowed"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer"
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (collapsed) setCollapsed(false);
              setShowAddMenu(!showAddMenu);
            }}
            title="Add Lesson or Assessment"
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-2xs ${
              showAddMenu
                ? "bg-sky-500 text-white border-sky-500"
                : "bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/25 border-sky-200/80 dark:border-sky-500/30"
            }`}
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Add</span>
          </button>

          <button
            type="button"
            onClick={onDeleteChapter}
            title="Delete this chapter"
            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Content Creator Tray (Never gets clipped by dropdown overflow) */}
      {!collapsed && showAddMenu && (
        <div className="p-3 bg-slate-50/90 dark:bg-[#070A11] border-b border-slate-200 dark:border-slate-800 space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Select Content Type to Add
            </span>
            <button
              type="button"
              onClick={() => setShowAddMenu(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {/* 1. Lecture Video */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  onAddLessonWithType("LECTURE_VIDEO");
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-sky-200/80 dark:border-sky-500/25 hover:border-sky-400 hover:bg-sky-50/40 dark:hover:bg-sky-500/10 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300">
                    Lecture Video (Lec)
                  </p>
                  <p className="text-[10px] text-slate-400">YouTube, Vimeo or MP4 + notes</p>
                </div>
              </button>
            </div>

            {/* 2. Practice Assignments */}
            <div className="space-y-1">
              <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Practice Assignment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onAddLessonWithType("PRACTICE_MCQ");
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-amber-200/70 dark:border-amber-500/20 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-500/10 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FileQuestion className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-amber-600">
                      MCQ Quiz
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">Knowledge check</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onAddLessonWithType("PRACTICE_PROJECT");
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-amber-200/70 dark:border-amber-500/20 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-500/10 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Code className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-amber-600">
                      Practice Lab
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">Hands-on project</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Test Assignments */}
            <div className="space-y-1">
              <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Test Assignment (Evaluated)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onAddLessonWithType("TEST_CODING");
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-indigo-200/70 dark:border-indigo-500/20 hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-500/10 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Code2 className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600">
                      Coding Test
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">Autograded</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onAddLessonWithType("TEST_VIVA");
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-purple-200/70 dark:border-purple-500/20 hover:border-purple-400 hover:bg-purple-50/40 dark:hover:bg-purple-500/10 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Video className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-purple-600">
                      Video Viva
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">Demo link</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onAddLessonWithType("TEST_SUBJECTIVE");
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-rose-200/70 dark:border-rose-500/20 hover:border-rose-400 hover:bg-rose-50/40 dark:hover:bg-rose-500/10 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-rose-600">
                      Subjective
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">Rubric graded</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMenu(false);
                    onAddLessonWithType("TEST_PROJECT");
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-emerald-200/70 dark:border-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-500/10 text-left transition-all group cursor-pointer shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Award className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-emerald-600">
                      Capstone Project
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">Evaluated build</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 4. Folder / Resource Section */}
            <div className="space-y-1">
              <div className="px-1 text-[9px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Folder / Sub-Section
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  onAddLessonWithType("FOLDER");
                }}
                className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#0B1120] border border-teal-200/80 dark:border-teal-500/25 hover:border-teal-400 hover:bg-teal-50/40 dark:hover:bg-teal-500/10 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <FolderPlus className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300">
                    Folder / Resources Container
                  </p>
                  <p className="text-[10px] text-slate-400">Group notes, downloadable files & materials</p>
                </div>
              </button>
            </div>

            {/* Custom Option */}
            <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowAddMenu(false);
                  setShowCustomInput(true);
                }}
                className="w-full text-left px-2 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-800/80 rounded-lg cursor-pointer"
              >
                + Custom Lesson Title...
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Lessons List */}
      {!collapsed && (
        <div className="p-2 space-y-1">
          {moduleLessons.length === 0 ? (
            <div className="py-4 px-2 text-[11px] text-slate-400 text-center space-y-1">
              <p>No content in this chapter yet.</p>
              {!showAddMenu && (
                <button
                  type="button"
                  onClick={() => setShowAddMenu(true)}
                  className="text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                >
                  + Add Lecture, Assignment or Folder
                </button>
              )}
            </div>
          ) : (
            moduleLessons.map((les: any, lIdx: number) => {
              const isSelected = activeLessonId === les.lessonId;
              const badge = getLessonBadge(les);
              const displayTitle = les.title && les.title.trim().length > 0 ? les.title : les.lessonId;
              const isFirstLesson = lIdx === 0;
              const isLastLesson = lIdx === moduleLessons.length - 1;

              return (
                <div
                  key={les.lessonId}
                  className={`group/item w-full rounded-xl transition-all flex items-center justify-between gap-1.5 p-2 ${
                    isSelected
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30 shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {/* Click to edit lesson */}
                  <button
                    type="button"
                    onClick={() => onSelectLesson(les.lessonId)}
                    className="flex-1 text-left min-w-0 flex items-center gap-2 cursor-pointer"
                  >
                    {badge.isFolder ? (
                      <Folder className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    ) : null}
                    <span className="text-xs font-semibold truncate flex-1">
                      {displayTitle}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </button>

                  {/* Shifting & Moving Action Controls */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover/item:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={isFirstLesson}
                      onClick={(e) => handleMoveLesson(e, lIdx, "UP")}
                      title="Move Up"
                      className={`p-1 rounded transition-colors ${
                        isFirstLesson
                          ? "text-slate-200 dark:text-slate-800 cursor-not-allowed"
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      }`}
                    >
                      <ArrowUp className="w-3 h-3 stroke-[2.2]" />
                    </button>

                    <button
                      type="button"
                      disabled={isLastLesson}
                      onClick={(e) => handleMoveLesson(e, lIdx, "DOWN")}
                      title="Move Down"
                      className={`p-1 rounded transition-colors ${
                        isLastLesson
                          ? "text-slate-200 dark:text-slate-800 cursor-not-allowed"
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                      }`}
                    >
                      <ArrowDown className="w-3 h-3 stroke-[2.2]" />
                    </button>

                    {otherModules.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMovingLessonId(movingLessonId === les.lessonId ? null : les.lessonId);
                          }}
                          title="Move to another chapter"
                          className="p-1 rounded text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <FolderInput className="w-3 h-3 stroke-[2]" />
                        </button>

                        {movingLessonId === les.lessonId && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-fade-in">
                            <p className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                              Move to chapter:
                            </p>
                            {otherModules.map((om: any, omIdx: number) => (
                              <button
                                key={om.moduleId}
                                type="button"
                                onClick={(e) => handleMoveToModule(e, les.lessonId, om.moduleId)}
                                className="w-full text-left px-2 py-1 text-xs font-semibold rounded-lg hover:bg-sky-50 dark:hover:bg-sky-500/20 text-slate-700 dark:text-slate-200 truncate cursor-pointer"
                              >
                                Chapter {omIdx + 1}: {om.title || "Module"}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteLesson(e, les.lessonId)}
                      title="Remove lesson"
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 stroke-[2]" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Inline Custom Lesson Title Input */}
          {showCustomInput && (
            <div className="p-2.5 bg-slate-50 dark:bg-[#070A11] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 mt-1">
              <input
                type="text"
                autoFocus
                placeholder="Lesson title..."
                value={customLessonTitle}
                onChange={(e) => setCustomLessonTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-2.5 py-1 text-xs text-slate-500 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customLessonTitle.trim()) {
                      onAddLessonWithType("CUSTOM", customLessonTitle.trim());
                      setCustomLessonTitle("");
                      setShowCustomInput(false);
                    }
                  }}
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
