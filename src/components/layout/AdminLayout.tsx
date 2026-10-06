import React, { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutGrid,
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FolderArchive,
  Users,
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { logout } from "../../store/authSlice";
import { useTheme } from "../../context/ThemeContext";

export default function AdminLayout() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const userRole = (user?.role || "").toUpperCase();
  const metaRoles: string[] = Array.isArray(user?.metadata?.roles)
    ? user.metadata.roles.map((r: string) => String(r).toUpperCase())
    : [];
  const allRoles = [userRole, ...metaRoles];

  const isSuperAdmin = allRoles.includes("SUPER_ADMIN");
  const isAdmin = isSuperAdmin || allRoles.includes("ADMIN");
  const isMentor = isAdmin || allRoles.includes("MENTOR");
  const isProgramManager =
    isAdmin ||
    allRoles.includes("PROGRAM_MANAGER") ||
    allRoles.includes("MEMBER") ||
    allRoles.includes("COURSE_AUTHOR") ||
    (!allRoles.includes("MENTOR") && allRoles.length <= 1); // default author if not explicitly mentor-only

  const hasBoth = isMentor && isProgramManager;

  // Build nav items dynamically based on roles
  const navItems = [
    ...(isProgramManager
      ? [{ name: "Dashboard", path: "/admin", icon: LayoutDashboard, badge: "1", end: true }]
      : []),
    ...(isProgramManager
      ? [{ name: "Program Manager", path: "/admin/courses", icon: BookOpen, badge: "Courses" }]
      : []),
    ...(isMentor
      ? [{ name: "Mentor View", path: "/admin/submissions", icon: ClipboardCheck, badge: "Active" }]
      : []),
    { name: "Students", path: "/admin/students", icon: Users },
  ];

  const roleLabel = isSuperAdmin
    ? "Super Admin"
    : isAdmin
    ? "Admin"
    : hasBoth
    ? "Program Mgr & Mentor"
    : isMentor
    ? "Lead Mentor"
    : "Program Manager";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A11] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-sky-500 flex items-center justify-center text-white dark:text-slate-950 font-bold text-sm shadow-sm">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Unisole Studio</span>
            <span className="ml-2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              {roleLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Modern Left Sidebar (Constructive Style) */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:flex flex-col w-full md:w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0B1120] md:sticky md:top-0 md:h-screen z-30 transition-all select-none overflow-y-auto`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 hidden md:flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-sky-500 flex items-center justify-center text-white dark:text-slate-950 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                Unisole Studio
              </div>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Course CMS & Cockpit
              </div>
            </div>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Switch to Student View */}
        <div className="px-4 pt-4 pb-2">
          <Link
            to="/enrolled"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50/70 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-xl transition-colors border border-sky-200/60 dark:border-sky-800/50"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Student View
            </span>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">Exit</span>
          </Link>
        </div>

        {/* Main Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-sky-500/15 dark:text-sky-400 shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* User Info & Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.name || "Alesia K."}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {roleLabel}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (Clean Workspace without redundant top header) */}
      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
