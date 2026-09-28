import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Home,
  Calendar,
  Tv,
  Bell,
  HelpCircle,
  X,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Layers,
  Check,
  ExternalLink,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { logout } from "../../store/authSlice";
import { useTheme } from "../../context/ThemeContext";
import { useGetMyPathwaysQuery } from "../../store/apiSlice";

interface LearnerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LearnerDrawer({ isOpen, onClose }: LearnerDrawerProps) {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [cohortDropdownOpen, setCohortDropdownOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [activeModal, setActiveModal] = useState<"support" | "notifications" | null>(null);

  const { data: myPathways = [] } = useGetMyPathwaysQuery(undefined, {
    skip: !isAuthenticated,
  });

  const enrolledCourses = useMemo(() => {
    return myPathways
      .map((item: any) => item.pathway || item)
      .filter((p: any) => p && (p.title || p.name));
  }, [myPathways]);

  useEffect(() => {
    if (enrolledCourses.length > 0 && !selectedCohort) {
      setSelectedCohort(enrolledCourses[0].title || enrolledCourses[0].name);
    }
  }, [enrolledCourses, selectedCohort]);

  const activeCohortTitle = selectedCohort || (enrolledCourses[0]?.title || enrolledCourses[0]?.name) || "No Enrolled Courses";

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setCohortDropdownOpen(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeModal) {
          setActiveModal(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeModal, onClose]);

  // Close on route change
  useEffect(() => {
    onClose();
    setActiveModal(null);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    onClose();
    dispatch(logout());
    navigate("/login");
  };

  const isCurrentActive = (type: string, path?: string) => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");

    if (type === "dashboard") {
      return (location.pathname === "/" || location.pathname === "/dashboard") && !tab;
    }
    if (type === "activities") {
      return tab === "activities";
    }
    if (type === "courses") {
      return location.pathname === "/enrolled" || location.pathname.startsWith("/courses");
    }
    if (path) {
      return location.pathname === path;
    }
    return false;
  };

  const navItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
      to: "/",
      isAction: false,
    },
    {
      id: "activities",
      name: "Activities",
      icon: Calendar,
      to: "/?tab=activities",
      isAction: false,
    },
    {
      id: "courses",
      name: "Courses",
      icon: Tv,
      to: "/enrolled",
      isAction: false,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
      isAction: true,
      onClick: () => setActiveModal("notifications"),
    },
    {
      id: "support",
      name: "Support",
      icon: HelpCircle,
      isAction: true,
      onClick: () => setActiveModal("support"),
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        aria-label="Learner Navigation Drawer"
        className="fixed inset-y-0 left-0 z-50 w-[300px] sm:w-[330px] max-w-[85vw] bg-white dark:bg-[#121622] text-zinc-900 dark:text-zinc-100 shadow-2xl flex flex-col border-r border-zinc-200/80 dark:border-zinc-800/80 animate-in slide-in-from-left duration-300 select-none overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <img
              src="https://res.cloudinary.com/hehmsemf/image/upload/f_auto,q_auto,w_64/v1785299421/Unisole_logo_new_mhqbma.png"
              alt="Unisole Logo"
              className="w-7 h-7 rounded-lg object-contain shadow-xs"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight leading-none text-zinc-900 dark:text-white">
                Unisole <span className="text-indigo-600 dark:text-indigo-400">LMS</span>
              </span>
              <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
                Skill AI Labs
              </span>
            </div>
          </Link>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
          {/* Cohort / Experience Selector Card */}
          <div className="relative">
            <button
              onClick={() => setCohortDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 transition-all text-left shadow-2xs group"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {activeCohortTitle}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                  {enrolledCourses.length > 0 ? `${enrolledCourses.length} Enrolled ${enrolledCourses.length === 1 ? "Course" : "Courses"}` : "No Active Enrollments"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                  cohortDropdownOpen ? "rotate-180 text-indigo-500" : ""
                }`}
              />
            </button>

            {/* Cohort Dropdown */}
            {cohortDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-2 bg-white dark:bg-[#121622] rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-30 animate-fade-in space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Enrolled Courses ({enrolledCourses.length})
                </div>
                {enrolledCourses.length === 0 ? (
                  <div className="p-3 text-center space-y-2">
                    <p className="text-xs text-zinc-500">No enrolled courses yet</p>
                    <Link
                      to="/catalog"
                      onClick={() => {
                        setCohortDropdownOpen(false);
                        onClose();
                      }}
                      className="inline-block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Browse Catalog →
                    </Link>
                  </div>
                ) : (
                  enrolledCourses.map((c: any) => {
                    const title = c.title || c.name;
                    const isSelected = activeCohortTitle === title;
                    return (
                      <button
                        key={c.id || title}
                        onClick={() => {
                          setSelectedCohort(title);
                          setCohortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                        }`}
                      >
                        <span className="truncate">{title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = isCurrentActive(item.id, item.to);
              const Icon = item.icon;

              if (item.isAction) {
                return (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between px-4 py-3 min-h-[48px] rounded-2xl text-[13px] sm:text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <Icon className="w-[18px] h-[18px] text-zinc-500 dark:text-zinc-400 stroke-[1.8]" />
                      <span>{item.name}</span>
                    </div>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.to!}
                  onClick={onClose}
                  className={`flex items-center justify-between px-4 py-3 min-h-[48px] rounded-2xl text-[13px] sm:text-sm transition-colors ${
                    active
                      ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon
                      className={`w-[18px] h-[18px] stroke-[1.8] ${
                        active ? "text-indigo-600 dark:text-indigo-400 stroke-[2.2]" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Footer: User Profile & Quick Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3.5">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : (user.phone ? user.phone.charAt(0) : "S")}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {user.name || "Student"}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate">
                      {user.phone ? `+91 ${user.phone}` : user.email || "Verified Learner"}
                    </span>
                  </div>
                </div>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-zinc-600" />
                  )}
                </button>
              </div>

              {/* Admin / Mentor CMS Link if authorized */}
              {["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER"].includes(user.role) && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200/60 dark:border-indigo-800/60"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Course Studio & CMS</span>
                  </div>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                onClick={onClose}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              >
                Sign In / Register
              </Link>
              <div className="flex items-center justify-center">
                <button
                  onClick={toggleTheme}
                  className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 flex items-center gap-1.5 py-1"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Modal: Support */}
      {activeModal === "support" && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white dark:bg-[#121622] max-w-md w-full rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Learner Support</h3>
                  <span className="text-[11px] text-zinc-400">We are here to help you succeed</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Have doubts on your coursework, coding assignments, or platform features? Reach out directly to our mentor support channel.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@unisole.in"
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800 transition-colors text-xs font-semibold text-zinc-800 dark:text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>Email Mentor Desk (support@unisole.in)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Notifications */}
      {activeModal === "notifications" && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white dark:bg-[#121622] max-w-md w-full rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifications</h3>
                  <span className="text-[11px] text-zinc-400">Recent alerts & feedback</span>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 text-center text-xs text-zinc-400">
              No new unread notifications. You are all caught up!
            </div>
          </div>
        </div>
      )}
    </>
  );
}
