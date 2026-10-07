import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Clock,
  Video,
  ExternalLink,
  X,
  Trash2,
  CheckCircle2,
  BookOpen,
  Award,
  Users,
  Filter,
  Layers,
  Sparkles,
  MapPin,
  Compass,
} from "lucide-react";
import {
  useGetCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useGetAdminCoursesQuery,
  useGetAdminMentorsQuery,
  useGetAdminStudentsQuery,
} from "../store/apiSlice";

const START_HOUR = 9;
const SLOT_HEIGHT_PX = 44;
const HOURS = [
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
];

const COLOR_CLASSES: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  blue: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    border: "border-sky-200 dark:border-sky-800/60",
    text: "text-sky-900 dark:text-sky-200",
    dot: "bg-sky-500",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800/60",
    text: "text-purple-900 dark:text-purple-200",
    dot: "bg-purple-500",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800/60",
    text: "text-rose-900 dark:text-rose-200",
    dot: "bg-rose-500",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800/60",
    text: "text-emerald-900 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/60",
    text: "text-amber-900 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  slate: {
    bg: "bg-slate-100/80 dark:bg-slate-800/60",
    border: "border-slate-200 dark:border-slate-700/80",
    text: "text-slate-900 dark:text-slate-100",
    dot: "bg-slate-500",
  },
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);

  const userRoles: string[] = useMemo(() => {
    const primary = (user?.role || "").toUpperCase();
    const secondary = Array.isArray(user?.roles)
      ? user.roles.map((r: any) => String(r).toUpperCase())
      : Array.isArray(user?.metadata?.roles)
      ? user.metadata.roles.map((r: any) => String(r).toUpperCase())
      : [];
    return [primary, ...secondary];
  }, [user]);

  const isAdmin = userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");
  const isProgramManager = userRoles.includes("PROGRAM_MANAGER");
  const isMentor = userRoles.includes("MENTOR");
  const canManageEvents = isAdmin || isProgramManager || isMentor;

  // View & Filter States
  const [activeFilter, setActiveFilter] = useState<"ALL" | "MILESTONE" | "LIVE_CLASS" | "VIVA_1ON1">("ALL");
  const [viewMode, setViewMode] = useState<"week" | "month" | "day">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [search, setSearch] = useState("");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Form State for creating new event
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEventType, setNewEventType] = useState<string>("LIVE_CLASS");
  const [newDate, setNewDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [newStartTime, setNewStartTime] = useState("10:00");
  const [newEndTime, setNewEndTime] = useState("11:00");
  const [newScope, setNewScope] = useState("GLOBAL");
  const [newCourseId, setNewCourseId] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newMeetUrl, setNewMeetUrl] = useState("");
  const [newColorScheme, setNewColorScheme] = useState("blue");

  // RTK Query
  const { data: events = [], isLoading } = useGetCalendarEventsQuery({
    eventType: activeFilter !== "ALL" ? activeFilter : undefined,
    search: search ? search : undefined,
  });

  const [createCalendarEventApi, { isLoading: isCreating }] = useCreateCalendarEventMutation();
  const [deleteCalendarEventApi, { isLoading: isDeleting }] = useDeleteCalendarEventMutation();

  const { data: courses = [] } = useGetAdminCoursesQuery(undefined, {
    skip: !canManageEvents,
  });
  const { data: students = [] } = useGetAdminStudentsQuery(undefined, {
    skip: !canManageEvents,
  });

  // Calculate Week Days
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Calculate Month Grid (full 35/42 days matrix)
  const monthGridDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { date: Date; dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      cells.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        dayNum: d.getDate(),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      cells.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    const totalNeeded = cells.length > 35 ? 42 : 35;
    const remaining = totalNeeded - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        dateStr: d.toISOString().split("T")[0],
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentDate]);

  // Current Month & Date range formatting
  const formattedMonth = useMemo(() => {
    return currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  }, [currentDate]);

  const formattedDateRange = useMemo(() => {
    if (viewMode === "week") {
      const first = weekDays[0];
      const last = weekDays[6];
      return `${first.toLocaleDateString("default", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`;
    } else if (viewMode === "day") {
      return currentDate.toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    }
    return `${currentDate.toLocaleString("default", { month: "long" })} ${currentDate.getFullYear()}`;
  }, [viewMode, weekDays, currentDate, formattedMonth]);

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === "week") next.setDate(next.getDate() - 7);
    else if (viewMode === "month") next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === "week") next.setDate(next.getDate() + 7);
    else if (viewMode === "month") next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Form Submit
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const startIso = new Date(`${newDate}T${newStartTime}:00`).toISOString();
    const endIso = new Date(`${newDate}T${newEndTime}:00`).toISOString();

    try {
      await createCalendarEventApi({
        title: newTitle.trim(),
        description: newDescription.trim(),
        eventType: newEventType,
        startTime: startIso,
        endTime: endIso,
        scope: newScope,
        courseId: newScope === "COURSE" ? newCourseId : null,
        studentId: newScope === "STUDENT" ? newStudentId : null,
        meetUrl: newMeetUrl.trim() || null,
        colorScheme: newColorScheme,
      }).unwrap();

      setIsAddModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewMeetUrl("");
    } catch {
      // Handled
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteCalendarEventApi(id).unwrap();
      setSelectedEvent(null);
    } catch {}
  };

  // Current Time calculation for the red/dashed indicator line
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isCurrentTimeInRange = currentHour >= START_HOUR && currentHour <= 19;
  const currentTimeTopPercent = isCurrentTimeInRange
    ? ((currentHour - START_HOUR + currentMinute / 60) / HOURS.length) * 100
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 animate-fade-in font-sans">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calendar
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40 w-44 sm:w-56"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setActiveFilter("ALL")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeFilter === "ALL"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          All events
        </button>
        <button
          onClick={() => setActiveFilter("MILESTONE")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeFilter === "MILESTONE"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Course Milestones
        </button>
        <button
          onClick={() => setActiveFilter("LIVE_CLASS")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeFilter === "LIVE_CLASS"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          Live Sessions
        </button>
        <button
          onClick={() => setActiveFilter("VIVA_1ON1")}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeFilter === "VIVA_1ON1"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          1-on-1 Reviews
        </button>
      </div>

      {/* Date Navigation & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        {/* Date Month Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-center text-center shrink-0">
            <span className="text-[9px] font-extrabold uppercase text-slate-400 leading-none">
              {currentDate.toLocaleString("default", { month: "short" })}
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {currentDate.getDate()}
            </span>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {formattedMonth}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              {formattedDateRange}
            </p>
          </div>
        </div>

        {/* View mode switcher & Navigation */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <button
              onClick={handlePrev}
              aria-label="Previous Period"
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 border-x border-slate-200/80 dark:border-slate-800 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Period"
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Dropdown */}
          <select
            value={viewMode}
            onChange={(e: any) => setViewMode(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="week">Week view</option>
            <option value="month">Month view</option>
            <option value="day">Day view</option>
          </select>

          {/* Add Event Button */}
          {canManageEvents && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all hover:opacity-90 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add event</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Calendar View Area */}
      {viewMode === "week" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800/80 text-center bg-slate-50/50 dark:bg-[#070A11]/60">
            <div className="p-3 text-[11px] font-bold text-slate-400 border-r border-slate-100 dark:border-slate-800/80">
              Time
            </div>
            {weekDays.map((date, idx) => {
              const isToday =
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear();

              const dayName = date.toLocaleDateString("default", { weekday: "short" });
              const dayNum = date.getDate();

              return (
                <div
                  key={idx}
                  className="p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800/80 last:border-r-0 flex items-center justify-center gap-1.5"
                >
                  <span className="text-slate-400">{dayName}</span>
                  {isToday ? (
                    <span className="w-6 h-6 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-extrabold flex items-center justify-center">
                      {dayNum}
                    </span>
                  ) : (
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {dayNum}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Grid with Events (Compact Fit) */}
          <div className="relative overflow-hidden">
            {/* Realtime dotted line indicator */}
            {isCurrentTimeInRange && currentTimeTopPercent !== null && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                style={{ top: `${currentTimeTopPercent}%` }}
              >
                <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-sky-400 -ml-1 shrink-0" />
                <div className="flex-1 border-t border-dashed border-slate-400 dark:border-sky-400" />
              </div>
            )}

            <div className="grid grid-cols-8 divide-x divide-slate-100 dark:divide-slate-800/80">
              {/* Left Column: Hours */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-[11px] font-medium text-slate-400 text-right pr-2.5 bg-slate-50/20 dark:bg-[#070A11]/30">
                {HOURS.map((hour, hIdx) => (
                  <div key={hIdx} className="h-[44px] flex items-start justify-end pt-1">
                    {hour}
                  </div>
                ))}
              </div>

              {/* 7 Days Columns */}
              {weekDays.map((dayDate, dayIdx) => {
                const dayDateStr = dayDate.toISOString().split("T")[0];

                // Filter events matching this day
                const dayEvents = (events || []).filter((ev: any) => {
                  if (!ev.startTime) return false;
                  const evDate = new Date(ev.startTime).toISOString().split("T")[0];
                  return evDate === dayDateStr;
                });

                return (
                  <div
                    key={dayIdx}
                    className="relative divide-y divide-slate-100/80 dark:divide-slate-800/60 min-h-[484px]"
                  >
                    {/* Hour Slot Grid Background */}
                    {HOURS.map((_, slotIdx) => (
                      <div
                        key={slotIdx}
                        onClick={() => {
                          if (canManageEvents) {
                            setNewDate(dayDateStr);
                            const slotHour = slotIdx + START_HOUR;
                            const hh = slotHour < 10 ? `0${slotHour}` : `${slotHour}`;
                            setNewStartTime(`${hh}:00`);
                            const endH = slotHour + 1 < 10 ? `0${slotHour + 1}` : `${slotHour + 1}`;
                            setNewEndTime(`${endH}:00`);
                            setIsAddModalOpen(true);
                          }
                        }}
                        className="h-[44px] hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                      />
                    ))}

                    {/* Placed Event Blocks */}
                    {dayEvents.map((ev: any) => {
                      const startDate = new Date(ev.startTime);
                      const endDate = new Date(ev.endTime || ev.startTime);
                      const startH = startDate.getHours() + startDate.getMinutes() / 60;
                      const endH = endDate.getHours() + endDate.getMinutes() / 60;
                      const duration = Math.max(0.5, endH - startH);

                      const topOffset = Math.max(0, (startH - START_HOUR) * SLOT_HEIGHT_PX);
                      const height = Math.max(34, duration * SLOT_HEIGHT_PX - 3);

                      const color = COLOR_CLASSES[ev.colorScheme || "blue"] || COLOR_CLASSES.blue;

                      const timeDisplay = startDate.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          style={{
                            top: `${topOffset}px`,
                            height: `${height}px`,
                          }}
                          className={`absolute left-1 right-1 rounded-lg p-1.5 sm:p-2 border transition-all hover:scale-[1.01] hover:shadow-xs z-10 flex flex-col justify-between cursor-pointer overflow-hidden shadow-2xs ${color.bg} ${color.border} ${color.text}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-[11px] sm:text-xs font-bold truncate leading-tight">
                              {ev.title}
                            </h4>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} />
                          </div>

                          <span className="text-[10px] font-mono opacity-80 mt-0.5">
                            {timeDisplay}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Month Calendar View */}
      {viewMode === "month" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] overflow-hidden shadow-2xs">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800/80 text-center bg-slate-50/50 dark:bg-[#070A11]/60">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/80 last:border-r-0 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Matrix */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-100/30 dark:bg-slate-900/20">
            {monthGridDays.map((cell, idx) => {
              const isToday =
                cell.date.getDate() === now.getDate() &&
                cell.date.getMonth() === now.getMonth() &&
                cell.date.getFullYear() === now.getFullYear();

              const dayEvents = (events || []).filter((ev: any) => {
                if (!ev.startTime) return false;
                const evDate = new Date(ev.startTime).toISOString().split("T")[0];
                return evDate === cell.dateStr;
              });

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (canManageEvents && dayEvents.length === 0) {
                      setNewDate(cell.dateStr);
                      setIsAddModalOpen(true);
                    }
                  }}
                  className={`min-h-[108px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-colors bg-white dark:bg-[#0B1120] group ${
                    !cell.isCurrentMonth
                      ? "opacity-35 bg-slate-50/50 dark:bg-[#070A11]/40"
                      : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {isToday ? (
                      <span className="w-6 h-6 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-extrabold flex items-center justify-center shadow-xs">
                        {cell.dayNum}
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-bold ${
                          cell.isCurrentMonth
                            ? "text-slate-700 dark:text-slate-300"
                            : "text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                    )}

                    {canManageEvents && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewDate(cell.dateStr);
                          setIsAddModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity cursor-pointer"
                        title="Add event"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Day Events List */}
                  <div className="space-y-1 mt-1.5 flex-1">
                    {dayEvents.slice(0, 3).map((ev: any) => {
                      const color = COLOR_CLASSES[ev.colorScheme || "blue"] || COLOR_CLASSES.blue;
                      const startTimeStr = new Date(ev.startTime).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`px-1.5 py-1 rounded-md border text-[11px] font-semibold truncate cursor-pointer transition-all hover:scale-[1.02] hover:shadow-2xs flex items-center gap-1.5 ${color.bg} ${color.border} ${color.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} />
                          <span className="truncate flex-1">{ev.title}</span>
                          <span className="text-[9px] font-mono opacity-70 shrink-0 hidden sm:inline">
                            {startTimeStr}
                          </span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentDate(cell.date);
                          setViewMode("day");
                        }}
                        className="text-[10px] font-bold text-sky-600 dark:text-sky-400 pl-1 hover:underline cursor-pointer"
                      >
                        +{dayEvents.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View */}
      {viewMode === "day" && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] p-6 max-w-2xl mx-auto space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Schedule for {formattedDateRange}
          </h3>
          <div className="space-y-2">
            {(events || [])
              .filter(
                (e: any) =>
                  new Date(e.startTime).toISOString().split("T")[0] ===
                  currentDate.toISOString().split("T")[0]
              )
              .map((e: any) => {
                const badgeInfo = (() => {
                  switch (e.eventType) {
                    case "LIVE_CLASS":
                      return { label: "Live Class", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" };
                    case "VIVA_1ON1":
                      return { label: "1-on-1 Sync", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
                    case "MILESTONE":
                      return { label: "Milestone", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
                    case "DEADLINE":
                      return { label: "Deliverable Due", cls: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
                    default:
                      return { label: "Event", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
                  }
                })();

                return (
                  <div
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {e.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(e.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} –{" "}
                        {new Date(e.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeInfo.cls}`}>
                      {badgeInfo.label}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (() => {
        const isCustomEvent = selectedEvent.id && !String(selectedEvent.id).startsWith("ev_");
        const badge = (() => {
          switch (selectedEvent.eventType) {
            case "LIVE_CLASS":
              return { label: "Live Online Class", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" };
            case "VIVA_1ON1":
              return { label: "1-on-1 Mentorship Sync", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
            case "MILESTONE":
              return { label: "Quiz & Milestone", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
            case "DEADLINE":
              return { label: "Deliverable Due", cls: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
            default:
              return { label: selectedEvent.eventType?.replace(/_/g, " ") || "Event", cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
          }
        })();

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0B1120] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${badge.cls}`}>
                  {badge.label}
                </span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedEvent.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  {selectedEvent.description || "Curriculum milestone & scheduled learning session."}
                </p>
              </div>

              {/* Info Tiles */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#070A11]/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                  <span className="font-medium">
                    {new Date(selectedEvent.startTime).toLocaleString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(selectedEvent.endTime).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {selectedEvent.mentorName && (
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Users className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>
                      Mentor: <strong className="text-slate-900 dark:text-white font-semibold">{selectedEvent.mentorName}</strong>
                    </span>
                  </div>
                )}

                {selectedEvent.courseTitle && (
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>
                      Course: <strong className="text-slate-900 dark:text-white font-semibold">{selectedEvent.courseTitle}</strong>
                    </span>
                  </div>
                )}

                {selectedEvent.studentName && (
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      Student: <strong className="text-slate-900 dark:text-white font-semibold">{selectedEvent.studentName}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 gap-2">
                {canManageEvents && isCustomEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  {selectedEvent.meetUrl && (
                    <a
                      href={selectedEvent.meetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Video Call</span>
                    </a>
                  )}

                  {selectedEvent.courseId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvent(null);
                        navigate(`/player/${selectedEvent.courseId}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold transition-all hover:opacity-90 shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in LMS</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0B1120] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Schedule New Event & Milestone
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Learning in Production: PyTorch"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="LIVE_CLASS">Live Session / Class</option>
                    <option value="MILESTONE">Course Milestone</option>
                    <option value="DEADLINE">Submission Deadline</option>
                    <option value="VIVA_1ON1">1-on-1 Viva / Review</option>
                    <option value="GENERAL">General Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Audience Scope
                  </label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="GLOBAL">Global (All Students)</option>
                    <option value="COURSE">Enrolled Course Cohort</option>
                    <option value="STUDENT">Individual Student (Private)</option>
                  </select>
                </div>
              </div>

              {newScope === "COURSE" && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Course
                  </label>
                  <select
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white"
                  >
                    <option value="">Choose Course...</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newScope === "STUDENT" && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Student
                  </label>
                  <select
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white"
                  >
                    <option value="">Choose Student...</option>
                    {students.map((st: any) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Link (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={newMeetUrl}
                  onChange={(e) => setNewMeetUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070A11] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Scheme
                </label>
                <div className="flex items-center gap-2">
                  {["blue", "purple", "rose", "green", "amber", "slate"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColorScheme(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        c === "blue"
                          ? "bg-sky-500"
                          : c === "purple"
                          ? "bg-purple-500"
                          : c === "rose"
                          ? "bg-rose-500"
                          : c === "green"
                          ? "bg-emerald-500"
                          : c === "amber"
                          ? "bg-amber-500"
                          : "bg-slate-500"
                      } ${newColorScheme === c ? "border-slate-900 dark:border-white scale-110" : "border-transparent"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold transition-all hover:opacity-90 shadow-xs cursor-pointer"
                >
                  {isCreating ? "Scheduling..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
