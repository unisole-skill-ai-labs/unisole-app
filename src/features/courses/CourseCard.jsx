import React from "react";
import { Link } from "react-router-dom";
import { Users, ArrowRight, Code2, BookOpen, Clock } from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

export default function CourseCard({ course, categoryName }) {
  // Deterministic color themes based on course slug or title
  const getGradient = (slug = "") => {
    if (slug.includes("typescript") || slug.includes("javascript") || slug.includes("react")) {
      return "from-indigo-600 via-indigo-700 to-blue-800";
    }
    if (slug.includes("python") || slug.includes("data")) {
      return "from-emerald-600 via-teal-700 to-cyan-800";
    }
    if (slug.includes("docker") || slug.includes("aws") || slug.includes("cloud") || slug.includes("go")) {
      return "from-sky-600 via-blue-700 to-slate-900";
    }
    if (slug.includes("flutter") || slug.includes("mobile")) {
      return "from-violet-600 via-purple-700 to-fuchsia-800";
    }
    return "from-slate-700 via-slate-800 to-slate-900";
  };

  const enrollments = course.total_enrollments || 120;
  const price = parseFloat(course.price) || 49.99;

  return (
    <Card hover className="flex flex-col h-full overflow-hidden group">
      {/* Banner / Thumbnail */}
      <div className={`relative h-40 bg-gradient-to-br ${getGradient(course.slug)} p-4 flex flex-col justify-between text-white overflow-hidden`}>
        {/* Subtle decorative circles */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-sm pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-sm pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <Badge variant="glass" size="sm">
            {categoryName || "Programming"}
          </Badge>
        </div>

        <div className="z-10 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white">
            <Code2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium text-white/80">Interactive Curriculum</span>
        </div>
      </div>

      {/* Course Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{enrollments} enrolled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Verified Certificate</span>
            </div>
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Price</span>
            <span className="text-lg font-black text-slate-900">${price.toFixed(2)}</span>
          </div>

          <Link to={`/courses/${course.id}`}>
            <Button size="sm" variant="primary" icon={ArrowRight}>
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
