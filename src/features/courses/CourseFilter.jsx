import React from "react";
import { Search, X, Layers } from "lucide-react";
import Input from "../../components/ui/Input";

export default function CourseFilter({
  categories = [],
  selectedCategory = "",
  onSelectCategory,
  searchTerm = "",
  onSearchChange,
  onReset,
}) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Input
          icon={Search}
          placeholder="Search courses by title or topic (e.g. TypeScript, React, Python, Docker)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        <button
          onClick={() => onSelectCategory("")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
            selectedCategory === ""
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          All Courses
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat.name}
            </button>
          );
        })}

        {(selectedCategory || searchTerm) && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline px-2 shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
