import React, { useState, useEffect, useRef } from "react";
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
  Heading,
  List,
  Link as LinkIcon,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
  Loader2,
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
  const [lessonType, setLessonType] = useState<LessonType>("READING");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [videoUrl, setVideoUrl] = useState("");

  // Code Block State
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [codeSnippet, setCodeSnippet] = useState("");

  // Quiz State
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

  // Assignment State
  const [assignmentInstructions, setAssignmentInstructions] = useState("");
  const [allowedTypes, setAllowedTypes] = useState<("URL" | "GITHUB" | "FILE" | "TEXT")[]>([
    "URL",
  ]);
  const [maxPoints, setMaxPoints] = useState(100);

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
            setAllowedTypes(parsed.assignment.allowedTypes || ["URL"]);
            setMaxPoints(parsed.assignment.maxPoints || 100);
          }
          if (parsed.attachments) {
            setAttachments(parsed.attachments);
          }
        } else {
          const raw = activeLessonData.content || activeLessonData.description || "";
          setContentMarkdown(raw);
          setContentHtml(renderMarkdownToHtml(raw));
          setLessonType("READING");
        }
      } catch {
        const raw = activeLessonData.content || "";
        setContentMarkdown(raw);
        setContentHtml(renderMarkdownToHtml(raw));
      }
    }
  }, [activeLessonData]);

  // Aggregate formData for autosave
  const formData = {
    title: lessonTitle,
    status: lessonStatus,
    durationMinutes,
    videoUrl,
    type: lessonType,
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
    attachments,
  };

  // Autosave handler
  const handleSaveLesson = async (currentData: typeof formData) => {
    if (!activeLessonId) return;

    const payloadContent = JSON.stringify({
      type: currentData.type,
      isFreePreview: currentData.isFreePreview,
      contentMarkdown: currentData.contentMarkdown,
      contentHtml: currentData.contentHtml,
      codeLanguage: currentData.codeLanguage,
      codeSnippet: currentData.codeSnippet,
      quiz: currentData.quiz,
      assignment: currentData.assignment,
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
        description: currentData.contentMarkdown ? currentData.contentMarkdown.replace(/<[^>]*>/g, "").slice(0, 200) : "",
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
            <button
              onClick={() => setShowAddChapter(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Chapter</span>
            </button>
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
                  {/* Type Selector */}
                  <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#070A11] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start">
                    <button
                      onClick={() => setLessonType("READING")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        lessonType === "READING"
                          ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      Notes
                    </button>
                    <button
                      onClick={() => setLessonType("QUIZ")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        lessonType === "QUIZ"
                          ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      Quiz
                    </button>
                    <button
                      onClick={() => setLessonType("ASSIGNMENT")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        lessonType === "ASSIGNMENT"
                          ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      Assignment
                    </button>
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

                {/* Video Link & Estimated Duration */}
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
              </div>

              {/* ──────────────── TYPE === NOTES ──────────────── */}
              {lessonType === "READING" && (
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

              {/* ──────────────── TYPE === QUIZ ──────────────── */}
              {lessonType === "QUIZ" && (
                <div className="space-y-6">
                  {/* Passing Score Box */}
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070A11]/60">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Passing Score Percentage
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Score required for students to mark this quiz as completed.
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
                                className="text-sky-500 focus:ring-sky-500"
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
                      className="w-full py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-sky-500 dark:hover:border-sky-400 hover:text-sky-500 transition-colors cursor-pointer"
                    >
                      + Add Another Question
                    </button>
                  </div>
                </div>
              )}

              {/* ──────────────── TYPE === ASSIGNMENT ──────────────── */}
              {lessonType === "ASSIGNMENT" && (
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                      Assignment Prompt & Problem Statement
                    </label>
                    <textarea
                      rows={8}
                      value={assignmentInstructions}
                      onChange={(e) => setAssignmentInstructions(e.target.value)}
                      placeholder="Detail the project requirements, architecture specifications, expected outputs, and submission instructions..."
                      className="w-full p-4 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>

                  {/* Submission Type & Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Allowed Submissions
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
                            className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                          />
                          <span>URLs / GitHub Repositories</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowedTypes.includes("FILE")}
                            onChange={(e) => {
                              if (e.target.checked) setAllowedTypes([...allowedTypes, "FILE"]);
                              else setAllowedTypes(allowedTypes.filter((t) => t !== "FILE"));
                            }}
                            className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                          />
                          <span>File / Project ZIP Upload</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allowedTypes.includes("TEXT")}
                            onChange={(e) => {
                              if (e.target.checked) setAllowedTypes([...allowedTypes, "TEXT"]);
                              else setAllowedTypes(allowedTypes.filter((t) => t !== "TEXT"));
                            }}
                            className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                          />
                          <span>Text Writeup</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] space-y-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Maximum Score
                      </span>
                      <input
                        type="number"
                        min={10}
                        max={1000}
                        value={maxPoints}
                        onChange={(e) => setMaxPoints(Number(e.target.value))}
                        className="w-24 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100"
                      />
                      <p className="text-[11px] text-slate-400">
                        Default grading points for mentor assessment.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────── SUBCOMPONENT: Chapter Section with Lessons ────────────────
interface ChapterSectionProps {
  moduleId: string;
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
  position,
  activeLessonId,
  onSelectLesson,
  addingLessonForModuleId,
  setAddingLessonForModuleId,
  newLessonTitle,
  setNewLessonTitle,
  onAddLesson,
}: ChapterSectionProps) {
  const { data: moduleLessons = [], refetch } = useGetAdminModuleLessonsQuery(moduleId);
  const [collapsed, setCollapsed] = useState(false);

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
            Chapter {position}
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
              return (
                <button
                  key={les.lessonId}
                  onClick={() => onSelectLesson(les.lessonId)}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30 shadow-2xs"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <span className="text-xs font-semibold truncate flex-1">
                    {les.lessonId}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-sky-500/20 text-sky-700 dark:text-sky-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      }`}
                    >
                      Lesson
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
