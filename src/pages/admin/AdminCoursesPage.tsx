import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BookOpen,
  Search,
  Plus,
  ArrowRight,
  MoreVertical,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Award,
} from "lucide-react";
import {
  useGetAdminCoursesQuery,
  useCreateAdminCourseMutation,
} from "../../store/apiSlice";

export default function AdminCoursesPage() {
  const { user } = useSelector((state: any) => state.auth);
  const { data: courses = [], isLoading, refetch } = useGetAdminCoursesQuery(undefined);
  const [createCourse, { isLoading: isCreating }] = useCreateAdminCourseMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New course form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [formError, setFormError] = useState("");

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role || "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setFormError("Title and slug are required.");
      return;
    }
    setFormError("");

    try {
      await createCourse({
        title,
        slug,
        shortDescription,
        status: "DRAFT",
      }).unwrap();

      setTitle("");
      setSlug("");
      setShortDescription("");
      setShowCreateModal(false);
      refetch();
    } catch (err: any) {
      setFormError(err?.data?.error || "Failed to create course. Please try again.");
    }
  };

  const filteredCourses = courses.filter((c: any) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-5 sm:p-7 lg:p-8 space-y-6 max-w-[1560px] mx-auto animate-fade-in font-sans">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-500" />
            <span>Courses & Curriculum Outlines</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Author curriculum chapters, configure lesson media, and structure grading criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Course</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
        </div>

        {/* Filter Pill Switcher */}
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-[#0B1120] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            All ({courses.length})
          </button>
          <button
            onClick={() => setStatusFilter("PUBLISHED")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "PUBLISHED"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter("DRAFT")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "DRAFT"
                ? "bg-white dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold shadow-2xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading courses...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            No courses found
          </h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course: any, idx: number) => {
            const colors = [
              "bg-blue-500/10 text-blue-500",
              "bg-amber-500/10 text-amber-500",
              "bg-rose-500/10 text-rose-500",
              "bg-emerald-500/10 text-emerald-500",
            ];
            const iconBg = colors[idx % colors.length];

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                        <BookOpen className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          /{course.slug}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 p-0.5">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {course.shortDescription || course.description || "Comprehensive hands-on modules and coding assignments."}
                  </p>
                </div>

                {/* Footer Metadata & Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      course.status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {course.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>

                  <Link
                    to={`/admin/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <span>Edit Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Create New Course
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Advanced AI Systems Engineering"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., advanced-ai-systems"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief course overview for prospective students..."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {isCreating ? "Creating..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
