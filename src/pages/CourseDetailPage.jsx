import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Users,
  CheckCircle2,
  BookOpen,
  Clock,
  Award,
  ArrowLeft,
  GraduationCap,
  Play,
  FileText,
  AlertCircle,
  Share2,
  ShieldCheck,
} from "lucide-react";
import {
  useGetCourseByIdQuery,
  useGetCourseTreeQuery,
  useGetEnrollmentsQuery,
  useEnrollCourseMutation,
  useGetReviewsQuery,
} from "../store/apiSlice";
import { extractErrorMessage } from "../utils/error";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import Modal from "../components/ui/Modal";
import CurriculumAccordion from "../features/courses/CurriculumAccordion";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { data: course, isLoading: isCourseLoading } = useGetCourseByIdQuery(courseId);
  const { data: treeData, isLoading: isTreeLoading } = useGetCourseTreeQuery(courseId);
  const { data: enrollments = [] } = useGetEnrollmentsQuery(undefined, { skip: !isAuthenticated });
  const { data: allReviews = [] } = useGetReviewsQuery();

  const [enrollCourse, { isLoading: isEnrolling }] = useEnrollCourseMutation();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [enrollSuccessMsg, setEnrollSuccessMsg] = useState("");
  const [enrollErrorMsg, setEnrollErrorMsg] = useState("");

  const isEnrolled = enrollments.some(
    (e) => e.course_id === courseId || (e.course && e.course.id === courseId)
  );

  const courseReviews = allReviews.filter((r) => r.course_id === courseId);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${courseId}`);
      return;
    }

    setEnrollErrorMsg("");
    setEnrollSuccessMsg("");

    try {
      await enrollCourse({ course_id: courseId }).unwrap();
      setEnrollSuccessMsg("Successfully enrolled! You now have full access to this course.");
    } catch (err) {
      if (err.status === 409) {
        setEnrollSuccessMsg("You are already enrolled in this course!");
      } else {
        setEnrollErrorMsg(extractErrorMessage(err, "Failed to enroll. Please try again."));
      }
    }
  };

  if (isCourseLoading || isTreeLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Spinner label="Loading course curriculum..." size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-xs text-slate-500">The course you requested does not exist or was removed.</p>
        <Link to="/">
          <Button variant="primary" size="sm" icon={ArrowLeft}>
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const modules = treeData?.modules || [];
  const enrollmentsCount = course.total_enrollments || 120;
  const price = parseFloat(course.price) || 49.99;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Back Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Courses
        </Link>
      </div>

      {/* Course Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Details (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="md">
                Certified Curriculum
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Comprehensive industry-standard training designed to take you from foundational syntax
              to building and deploying production-grade distributed architectures.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium pt-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{enrollmentsCount} active students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>{modules.length} detailed modules</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-400" />
                <span>Verifiable Completion Certificate</span>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {enrollSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{enrollSuccessMsg}</span>
            </div>
          )}

          {enrollErrorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{enrollErrorMsg}</span>
            </div>
          )}

          {/* What you'll learn */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> What You'll Master in This Course
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Full end-to-end architecture & type safety patterns</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Practical hands-on coding assignments & live tests</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Optimized performance & distributed microservices</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Production deployment and cloud containerization</span>
              </div>
            </div>
          </Card>

          {/* Curriculum Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-extrabold text-slate-900">Course Curriculum</h3>
            <CurriculumAccordion
              modules={modules}
              isEnrolled={isEnrolled}
              onSelectLesson={(lesson) => setSelectedLesson(lesson)}
            />
          </div>

          {/* Reviews Section */}
          {courseReviews.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900">Student Feedback</h3>
              <div className="space-y-3">
                {courseReviews.map((rev) => (
                  <Card key={rev.id} className="p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-700">Verified Review</span>
                      <span className="text-[10px] text-slate-400">Student</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enrollment Sticky Sidebar Card (Right 1 col) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
          <Card className="p-6 shadow-md border-indigo-100">
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Full Access Pass
                </span>
                <span className="text-3xl font-black text-slate-900">${price.toFixed(2)}</span>
              </div>

              {isEnrolled ? (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> You Are Enrolled
                  </div>
                  <Link to="/enrolled" className="block">
                    <Button variant="primary" size="md" icon={Play} className="w-full">
                      Resume Studying
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  loading={isEnrolling}
                  onClick={handleEnroll}
                  icon={GraduationCap}
                  className="w-full shadow-md shadow-indigo-200"
                >
                  Enroll in Course
                </Button>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block text-xs">Course Includes:</span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Full lifetime access to all lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Interactive quizzes & test runner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Downloadable code resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Access on mobile, tablet & desktop</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lesson Content Viewer Modal (Preview / Reader) */}
      <Modal
        isOpen={!!selectedLesson}
        onClose={() => setSelectedLesson(null)}
        title={selectedLesson?.title || "Lesson Viewer"}
      >
        {selectedLesson && (
          <div className="space-y-4 text-slate-800">
            <div className="flex items-center justify-between">
              <Badge variant="indigo" size="sm">
                Type: {selectedLesson.type}
              </Badge>
              {selectedLesson.content_url && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedLesson.content_url}
                </span>
              )}
            </div>

            {selectedLesson.type === "quiz" ? (
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-3">
                <p className="font-bold">This module contains an interactive knowledge quiz!</p>
                <Link to="/tests">
                  <Button variant="primary" size="sm" icon={Award}>
                    Take Associated Test
                  </Button>
                </Link>
              </div>
            ) : selectedLesson.content_body ? (
              <div className="prose prose-slate max-w-none text-xs leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono whitespace-pre-wrap">
                {selectedLesson.content_body}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-indigo-500 mx-auto" />
                <p className="font-semibold text-slate-800">{selectedLesson.title}</p>
                <p>Interactive content player is ready for this module item.</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLesson(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
