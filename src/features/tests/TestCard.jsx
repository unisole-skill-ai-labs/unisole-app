import React from "react";
import { Link } from "react-router-dom";
import { Clock, Award, CheckCircle, Play, AlertCircle, RefreshCw } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

export default function TestCard({ test, userAttempts = [] }) {
  const attempts = userAttempts.filter((a) => a.test_id === test.id);
  const bestAttempt = attempts.reduce(
    (max, a) => (parseFloat(a.score) > (max ? parseFloat(max.score) : -1) ? a : max),
    null
  );

  const passingMarks = test.passing_marks || 30;
  const totalMarks = test.total_marks || 50;
  const isPassed = bestAttempt && parseFloat(bestAttempt.score) >= passingMarks;

  const courseTitle = test.course ? test.course.title : "Programming Core Assessment";

  return (
    <Card hover className="p-5 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant={isPassed ? "emerald" : attempts.length > 0 ? "amber" : "purple"}
            size="sm"
          >
            {isPassed
              ? "Passed"
              : attempts.length > 0
              ? `Attempted (${bestAttempt.score}/${totalMarks})`
              : "Not Attempted"}
          </Badge>

          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-slate-400" />
            {test.duration_min || 20} mins
          </span>
        </div>

        <h3 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
          {test.title}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
          {courseTitle}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Passing Score</span>
            <span className="font-bold text-slate-800">
              {passingMarks} / {totalMarks} pts
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Attempts Allowed</span>
            <span className="font-bold text-slate-800">
              {test.max_attempts || 3} max ({attempts.length} used)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          {bestAttempt ? (
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Award className="w-3.5 h-3.5 text-indigo-600" /> Best: {bestAttempt.score} pts
            </span>
          ) : (
            <span>Ready to test</span>
          )}
        </div>

        <Link to={`/tests/${test.id}`}>
          <Button
            size="sm"
            variant={isPassed ? "outline" : "primary"}
            icon={attempts.length > 0 ? RefreshCw : Play}
          >
            {attempts.length > 0 ? "Retake Quiz" : "Start Test"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
