import React from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Code2,
  FileQuestion,
  Video,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface MilestoneItem {
  id: string;
  title: string;
  category: "PRACTICE" | "TEST";
  type: "MCQ" | "CODING_TEST" | "SUBJECTIVE_TEST" | "VIDEO_TEST" | "PROJECT" | "quiz" | "assignment";
  maxScore?: number;
  duration?: string;
  week?: string;
  isCompleted?: boolean;
}

interface MilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: MilestoneItem[];
  completedIds: string[];
  onSelectMilestone: (item: MilestoneItem) => void;
}

export default function MilestonesModal({
  isOpen,
  onClose,
  milestones,
  completedIds,
  onSelectMilestone,
}: MilestonesModalProps) {
  if (!isOpen) return null;

  const completedCount = milestones.filter(
    (m) => m.isCompleted || completedIds.includes(m.id)
  ).length;
  const practiceCount = milestones.filter(
    (m) => m.category === "PRACTICE" || m.type === "quiz"
  ).length;
  const testCount = milestones.length - practiceCount;

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "CODING_TEST":
        return <Code2 className="w-4 h-4 text-sky-400" />;
      case "VIDEO_TEST":
        return <Video className="w-4 h-4 text-sky-400" />;
      case "SUBJECTIVE_TEST":
        return <FileText className="w-4 h-4 text-indigo-400" />;
      case "MCQ":
      case "QUIZ":
        return <FileQuestion className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-sky-500/20 text-slate-900 dark:text-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between bg-slate-50 dark:bg-gradient-to-r dark:from-[#0F172A] dark:to-[#0A192F]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              Curriculum Roadmap
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              Course Assessment Milestones
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Complete practice checks and official tests to achieve pathway certification.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Summary Ribbon */}
        <div className="grid grid-cols-4 gap-2.5 p-4 bg-slate-100/70 dark:bg-[#070A11] border-b border-slate-200 dark:border-slate-800/60">
          <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-center shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{milestones.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-center shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Practice</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">{practiceCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-center shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Tests</span>
            <span className="text-lg font-black text-sky-600 dark:text-sky-400">{testCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-center shadow-2xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Completed</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {completedCount}/{milestones.length}
            </span>
          </div>
        </div>

        {/* Milestones List */}
        <div className="p-6 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {milestones.map((item, index) => {
            const isDone = item.isCompleted || completedIds.includes(item.id);
            const isTest = item.category === "TEST";

            return (
              <div
                key={item.id || index}
                onClick={() => {
                  onSelectMilestone(item);
                  onClose();
                }}
                className="pt-2 first:pt-0 flex items-center justify-between gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDone
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : isTest
                        ? "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400"
                        : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" /> : getTypeIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider border ${
                          isTest
                            ? "bg-sky-50 dark:bg-sky-950/70 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300"
                            : "bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {isTest ? "Evaluated Test" : "Practice Task"}
                      </span>
                      {item.week && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {item.week}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate mt-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {item.type.replace(/_/g, " ")} • Max Marks: {item.maxScore || 100}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isDone
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {isDone ? "Completed" : "Pending"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
