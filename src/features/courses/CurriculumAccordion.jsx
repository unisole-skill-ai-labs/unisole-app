import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  HelpCircle,
  FileCode,
  CheckCircle2,
  Lock,
  PlayCircle,
} from "lucide-react";
import Badge from "../../components/ui/Badge";

export default function CurriculumAccordion({
  modules = [],
  isEnrolled = false,
  onSelectLesson,
  activeLessonId,
}) {
  // Open the first module by default
  const [openModules, setOpenModules] = useState({ 0: true });

  const toggleModule = (index) => {
    setOpenModules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getItemIcon = (type) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-sky-500" />;
      case "quiz":
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      case "assignment":
        return <FileCode className="w-4 h-4 text-amber-500" />;
      case "pdf":
      case "article":
      default:
        return <FileText className="w-4 h-4 text-indigo-500" />;
    }
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-500 text-sm">
        Curriculum details are being compiled for this course.
      </div>
    );
  }

  const totalLessons = modules.reduce(
    (acc, mod) => acc + (mod.items ? mod.items.length : 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1 pb-1">
        <span>{modules.length} Modules • {totalLessons} Lessons</span>
        <button
          onClick={() => {
            const allOpen = {};
            modules.forEach((_, i) => (allOpen[i] = true));
            setOpenModules(allOpen);
          }}
          className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
        >
          Expand All
        </button>
      </div>

      {modules.map((module, index) => {
        const isOpen = !!openModules[index];
        const items = module.items || [];

        return (
          <div
            key={module.id || index}
            className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs transition-all"
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(index)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-3 pr-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">
                    {module.title}
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    {items.length} {items.length === 1 ? "lesson" : "lessons"}
                  </span>
                </div>
              </div>

              <div className="text-slate-400">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {/* Module Items List */}
            {isOpen && items.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/40 divide-y divide-slate-100/80">
                {items.map((item, itemIdx) => {
                  const isActive = activeLessonId === item.id;
                  const canAccess = isEnrolled || itemIdx === 0; // First item is free preview

                  return (
                    <div
                      key={item.id || itemIdx}
                      onClick={() => {
                        if (canAccess && onSelectLesson) onSelectLesson(item);
                      }}
                      className={`px-5 py-3 flex items-center justify-between text-xs transition-colors ${
                        canAccess
                          ? "cursor-pointer hover:bg-indigo-50/50"
                          : "opacity-60 cursor-not-allowed"
                      } ${isActive ? "bg-indigo-50 text-indigo-900 font-semibold" : "text-slate-700"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-md bg-white border border-slate-200/60 shadow-2xs">
                          {getItemIcon(item.type)}
                        </div>
                        <span className="line-clamp-1">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge size="sm" variant={item.type === "quiz" ? "purple" : "slate"}>
                          {item.type}
                        </Badge>
                        {canAccess ? (
                          <PlayCircle className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
