import React from "react";
import { useSelector } from "react-redux";
import { Award, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useGetTestsQuery, useGetTestAttemptsQuery } from "../store/apiSlice";
import TestCard from "../features/tests/TestCard";
import Spinner from "../components/ui/Spinner";

export default function TestsPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { data: tests = [], isLoading: isTestsLoading } = useGetTestsQuery();
  const { data: attempts = [], isLoading: isAttemptsLoading } = useGetTestAttemptsQuery(
    undefined,
    { skip: !isAuthenticated }
  );

  const passedTestsCount = tests.filter((test) => {
    const userAttempts = attempts.filter((a) => a.test_id === test.id);
    const passingMarks = test.passing_marks || 30;
    return userAttempts.some((a) => parseFloat(a.score) >= passingMarks);
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Assessments & Quizzes
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Test your knowledge with timed multiple-choice assessments and earn verifiable scores
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 mb-1.5">
            <Award className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Tests
            </span>
          </div>
          <span className="text-xl sm:text-3xl font-black text-slate-900">{tests.length}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 mb-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Passed
            </span>
          </div>
          <span className="text-xl sm:text-3xl font-black text-slate-900">{passedTestsCount}</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-purple-600 mb-1.5">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Attempts Logged
            </span>
          </div>
          <span className="text-xl sm:text-3xl font-black text-slate-900">{attempts.length}</span>
        </div>
      </div>

      {/* Tests Grid */}
      {isTestsLoading ? (
        <Spinner label="Loading assessments..." size="lg" />
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-slate-500 text-xs">
          No tests currently published. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} userAttempts={attempts} />
          ))}
        </div>
      )}
    </div>
  );
}
