import React, { useState } from "react";
import {
  X,
  FileText,
  FileQuestion,
  Code2,
  Video,
  Layers,
  Save,
  Plus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface AuthorStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modules: { id: string; title: string }[];
  onSaveContent: (item: any) => void;
}

export default function AuthorStudioDrawer({
  isOpen,
  onClose,
  modules,
  onSaveContent,
}: AuthorStudioDrawerProps) {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<"LECTURE" | "PRACTICE" | "TEST">("PRACTICE");
  const [activeType, setActiveType] = useState<"MCQ" | "CODING_TEST" | "SUBJECTIVE_TEST" | "VIDEO_TEST" | "PROJECT" | "NOTES">("MCQ");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id || "");
  const [maxScore, setMaxScore] = useState<number>(100);

  // Notes state
  const [markdownContent, setMarkdownContent] = useState("");
  const [resourceLink, setResourceLink] = useState("");

  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState("");

  // Coding Test state
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [starterCode, setStarterCode] = useState("def solve(input_data):\n    # Write your solution here\n    pass\n");
  const [testCaseInput, setTestCaseInput] = useState("[1, 2, 3]");
  const [testCaseOutput, setTestCaseOutput] = useState("6");

  // Video Test state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [maxDurationSec, setMaxDurationSec] = useState(180);

  // Subjective Test state
  const [rubricText, setRubricText] = useState("Architecture Design (30%), Code Correctness (40%), Performance (30%)");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload: any = {
      id: `custom_${Date.now()}`,
      moduleId: selectedModuleId,
      title,
      description,
      category: activeCategory === "LECTURE" ? "PRACTICE" : activeCategory,
      type: activeCategory === "LECTURE" ? "NOTES" : activeType,
      maxScore,
      duration: activeType === "VIDEO_TEST" ? `${Math.round(maxDurationSec / 60)} Mins` : "20 Mins",
      config: {},
    };

    if (activeType === "MCQ") {
      payload.config = {
        questions: [
          {
            id: `q_${Date.now()}`,
            question: quizQuestion,
            options: quizOptions,
            answerIndex: correctOptionIdx,
            explanation: quizExplanation,
          },
        ],
      };
    } else if (activeType === "CODING_TEST") {
      payload.config = {
        language: codeLanguage,
        starterCode,
        testCases: [{ input: testCaseInput, expected: testCaseOutput, isHidden: false }],
      };
    } else if (activeType === "VIDEO_TEST") {
      payload.config = {
        videoPrompt,
        maxDurationSec,
      };
    } else if (activeType === "SUBJECTIVE_TEST") {
      payload.config = {
        rubric: rubricText,
      };
    } else {
      payload.config = {
        notes: markdownContent,
        resourceLink,
      };
    }

    onSaveContent(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1120] border-l border-sky-500/20 text-white w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#0F172A] to-[#0A192F]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
              CMS Course Manager Studio
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Author Curriculum Content
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Category Selector: Lecture vs Practice vs Test */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Content Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("LECTURE");
                  setActiveType("NOTES");
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  activeCategory === "LECTURE"
                    ? "bg-sky-500/10 border-sky-400 text-sky-400 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Lecture & Notes
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("PRACTICE");
                  setActiveType("MCQ");
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  activeCategory === "PRACTICE"
                    ? "bg-amber-500/10 border-amber-400 text-amber-400 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Practice Assignment
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory("TEST");
                  setActiveType("CODING_TEST");
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                  activeCategory === "TEST"
                    ? "bg-indigo-500/10 border-indigo-400 text-indigo-400 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                Test Assignment
              </button>
            </div>
          </div>

          {/* Subtype Selector */}
          {activeCategory === "PRACTICE" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Practice Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveType("MCQ")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    activeType === "MCQ"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  MCQ Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setActiveType("PROJECT")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                    activeType === "PROJECT"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  Practice Project
                </button>
              </div>
            </div>
          )}

          {activeCategory === "TEST" && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Evaluation Test Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveType("CODING_TEST")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border ${
                    activeType === "CODING_TEST"
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  Coding Test
                </button>
                <button
                  type="button"
                  onClick={() => setActiveType("SUBJECTIVE_TEST")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border ${
                    activeType === "SUBJECTIVE_TEST"
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  Subjective
                </button>
                <button
                  type="button"
                  onClick={() => setActiveType("VIDEO_TEST")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border ${
                    activeType === "VIDEO_TEST"
                      ? "bg-sky-500/20 border-sky-400 text-sky-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  Video Test
                </button>
              </div>
            </div>
          )}

          {/* Module Target */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Target Module</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-white focus:outline-hidden focus:border-sky-500"
            >
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Practice: PyTorch Autograd Graph Mechanics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Short Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary of requirements or goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Specific Designer Form */}
          {activeType === "MCQ" && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Quiz Question Builder
              </span>
              <input
                type="text"
                placeholder="Question prompt..."
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <div className="space-y-2">
                {quizOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIdx === idx}
                      onChange={() => setCorrectOptionIdx(idx)}
                      className="accent-amber-400"
                    />
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...quizOptions];
                        newOpts[idx] = e.target.value;
                        setQuizOptions(newOpts);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Explanation for correct answer..."
                value={quizExplanation}
                onChange={(e) => setQuizExplanation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>
          )}

          {activeType === "CODING_TEST" && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Coding Test Studio
                </span>
                <select
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Starter Code Template</label>
                <textarea
                  rows={4}
                  value={starterCode}
                  onChange={(e) => setStarterCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl font-mono text-xs bg-slate-900 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Test Case Input</label>
                  <input
                    type="text"
                    value={testCaseInput}
                    onChange={(e) => setTestCaseInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Expected Output</label>
                  <input
                    type="text"
                    value={testCaseOutput}
                    onChange={(e) => setTestCaseOutput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeType === "VIDEO_TEST" && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">
                Video Test Prompt
              </span>
              <textarea
                rows={3}
                placeholder="e.g. Record an architectural walkthrough of your inference service..."
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Max Video Duration (Seconds)</label>
                <input
                  type="number"
                  value={maxDurationSec}
                  onChange={(e) => setMaxDurationSec(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Publish to Curriculum</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
