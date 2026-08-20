import React from "react";
import { Link } from "react-router-dom";
import { Play, CheckCircle2, Award, Calendar, BookOpen } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ProgressBar from "../../components/ui/ProgressBar";
import Button from "../../components/ui/Button";

export default function EnrolledCard({ enrollment }) {
  const course = enrollment.course || {};
  const progress = enrollment.progress_percent || 0;
  const isCompleted = enrollment.status === "completed" || progress >= 100;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <Card hover className="p-5 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant={isCompleted ? "emerald" : "indigo"}
            size="sm"
          >
            {isCompleted ? "Completed" : "In Progress"}
          </Badge>

          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(enrollment.enrolled_at)}
          </span>
        </div>

        <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          {course.title || "Untitled Course"}
        </h3>

        <div className="mt-4">
          <ProgressBar
            progress={progress}
            color={isCompleted ? "emerald" : "indigo"}
            size="md"
          />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/courses/${course.id || enrollment.course_id}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Curriculum
        </Link>

        <Link to={`/courses/${course.id || enrollment.course_id}`}>
          <Button
            size="sm"
            variant={isCompleted ? "outline" : "primary"}
            icon={isCompleted ? Award : Play}
          >
            {isCompleted ? "Review" : "Continue"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
