import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sparkles,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Search,
  Code,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { useGetCoursesQuery, useGetCategoriesQuery } from "../store/apiSlice";
import CourseCard from "../features/courses/CourseCard";
import CourseFilter from "../features/courses/CourseFilter";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

export default function DashboardPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: courses = [], isLoading: isCoursesLoading } = useGetCoursesQuery({
    category: selectedCategory,
    search: searchTerm,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useGetCategoriesQuery();

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // Client-side filtering in case query params are omitted
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchCat = selectedCategory ? course.category_id === selectedCategory : true;
      const matchSearch = searchTerm
        ? course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.slug && course.slug.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;
      return matchCat && matchSearch;
    });
  }, [courses, selectedCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Hero Banner with Modern Gradient */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Multi-Language Curriculum</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Master Modern Software Engineering
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-indigo-100/90 leading-relaxed">
            Hands-on courses in TypeScript, React, Python, Go, Docker, and Cloud Architecture with
            interactive coding assessments and industry certificates.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <Link to="/enrolled">
                <Button variant="white" size="md" icon={BookOpen}>
                  Go to My Enrollments
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="primary" size="md" icon={GraduationCap} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold shadow-md shadow-indigo-950/20">
                    Start Learning Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="glass" size="md" className="font-bold border-white/40 hover:bg-white/20 text-white shadow-sm">
                    Student Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick Platform Stats Bar */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/10 text-center max-w-xl">
          <div>
            <span className="block text-xl sm:text-2xl font-black text-white">11+</span>
            <span className="text-[10px] sm:text-xs text-indigo-200 font-medium uppercase tracking-wider">Courses</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-white">95+</span>
            <span className="text-[10px] sm:text-xs text-indigo-200 font-medium uppercase tracking-wider">Lessons</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-white">100%</span>
            <span className="text-[10px] sm:text-xs text-indigo-200 font-medium uppercase tracking-wider">Interactive</span>
          </div>
        </div>
      </div>

      {/* Courses Catalog Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Explore Course Catalog
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Filter by engineering domain or search specific programming concepts
            </p>
          </div>
        </div>

        {/* Filters */}
        <CourseFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={() => {
            setSelectedCategory("");
            setSearchTerm("");
          }}
        />

        {/* Course Grid */}
        {isCoursesLoading ? (
          <Spinner label="Loading programming courses..." size="lg" />
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
            <Code className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No courses matched your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the selected category filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("");
                setSearchTerm("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                categoryName={categoryMap[course.category_id] || course.category?.name || course.category_name || "Programming"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
