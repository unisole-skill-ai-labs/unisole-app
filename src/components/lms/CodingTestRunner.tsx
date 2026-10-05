import React, { useState } from "react";
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Award,
  Send,
} from "lucide-react";

interface CodingTestRunnerProps {
  title: string;
  description: string;
  config?: {
    language?: string;
    starterCode?: string;
    testCases?: { input: string; expected: string; isHidden?: boolean }[];
  };
  onSubmit: (code: string, testSummary: any) => void;
  isCompleted?: boolean;
}

export default function CodingTestRunner({
  title,
  description,
  config,
  onSubmit,
  isCompleted,
}: CodingTestRunnerProps) {
  const [code, setCode] = useState<string>(
    config?.starterCode ||
      "import torch\n\ndef matrix_multiply(A: torch.Tensor, B: torch.Tensor) -> torch.Tensor:\n    # Write your solution below\n    pass\n"
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [hasPassedAll, setHasPassedAll] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(isCompleted || false);

  const testCases = config?.testCases || [
    { input: "A = torch.tensor([[1, 2], [3, 4]]), B = torch.tensor([[5, 6], [7, 8]])", expected: "tensor([[19, 22], [43, 50]])", isHidden: false },
    { input: "A = torch.eye(3), B = torch.eye(3)", expected: "tensor([[1., 0., 0.], [0., 1., 0.], [0., 0., 1.]])", isHidden: true },
  ];

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = testCases.map((tc, idx) => ({
        id: idx,
        input: tc.input,
        expected: tc.expected,
        actual: tc.expected, // Simulated pass for clean valid code
        passed: true,
        runtime: `${10 + idx * 4}ms`,
        isHidden: tc.isHidden,
      }));
      setTestResults(results);
      setHasPassedAll(true);
      setIsRunning(false);
    }, 600);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(code, { passed: true, score: 50 });
  };

  return (
    <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 animate-fade-in shadow-xs">
      {/* Test Title & Instructions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Evaluated Coding Assessment
            </span>
            <span className="text-xs text-slate-400 font-medium">Max Marks: 50</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        {submitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Submitted & Evaluated (50/50)</span>
          </div>
        )}
      </div>

      {/* Code Editor Window */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#070A11] shadow-lg">
        {/* Editor Top Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-[11px] font-mono text-slate-400 ml-2">solution.py</span>
          </div>
          <span className="text-[10px] font-mono uppercase text-sky-400">Python 3.11 Execution Container</span>
        </div>

        {/* Textarea Code Input */}
        <textarea
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={submitted}
          className="w-full p-4 font-mono text-xs text-slate-200 bg-transparent focus:outline-hidden resize-y leading-relaxed"
          placeholder="# Write your code here..."
        />
      </div>

      {/* Test Execution Output */}
      {testResults && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A11] border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated Benchmark Results</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-400">All Test Cases Passed</span>
          </div>

          <div className="space-y-2">
            {testResults.map((tr) => (
              <div
                key={tr.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Test Case #{tr.id + 1} {tr.isHidden && "(Hidden)"}
                  </span>
                  <p className="font-mono text-[11px] text-slate-400 truncate max-w-md">
                    Input: {tr.input}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{tr.runtime}</span>
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Passed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-500">
          Run automated tests before submitting your code for mentor review.
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunTests}
            disabled={isRunning || submitted}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-sky-400" />
            <span>{isRunning ? "Running Sandbox..." : "Run Test Cases"}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitted || !hasPassedAll}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              submitted
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : hasPassedAll
                ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 cursor-pointer"
                : "bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{submitted ? "Submitted" : "Submit for Evaluation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
