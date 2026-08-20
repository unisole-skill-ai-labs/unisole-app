import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { BookOpen, Award, CheckCircle2, TrendingUp, Sparkles, Compass } from "lucide-react";
import { useGetEnrollmentsQuery } from "../store/apiSlice";
import EnrolledCard from "../features/enrollments/EnrolledCard";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

export default function EnrolledCoursesPage() {
  const { user } = useSelector((state) => state.auth);
  const { data: enrollments = [], isLoading } = useGetEnrollmentsQuery();

  const completedCount = enrollments.filter(
    (e) => e.status === "completed" || (e.progress_percent || 0) >= 100
  ).length;

  const inProgressCount = enrollments.length - completedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Enrolled Courses
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track your ongoing lessons, progress benchmarks, and completed certifications
          </p>
        </div>

        <Link to="/">
          <Button variant="outline" size="sm" icon={Compass}>
            Explore More Courses
          </Button>
        </Link>
      </div>

      {/* Progress Metric Highlights */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1.5">
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Enrolled
            </span>
          </div>
          <span className="text-xl sm:text-3xl font-black text-slate-900">{enrollments.length}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 mb-1.5">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              In Progress
            </span>
          </div>
          <span className="text-xl sm:text-3xl font-black text-slate-900">{inProgressCount}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed
            </span>
          </div>
          <span className="text-xl sm:text-3xl font-black text-slate-900">{completedCount}</span>
        </div>
      </div>

      {/* Enrolled Courses Grid */}
      {isLoading ? (
        <Spinner label="Loading your enrolled courses..." size="lg" />
      ) : enrollments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No active enrollments yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You haven't enrolled in any programming courses yet. Explore our course catalog to start learning!
          </p>
          <Link to="/">
            <Button variant="primary" size="md" icon={Compass}>
              Browse Course Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <EnrolledCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
