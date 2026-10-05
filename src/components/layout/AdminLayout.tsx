import React, { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
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
  GraduationCap,
} from "lucide-react";
import { logout } from "../../store/authSlice";
import { useTheme } from "../../context/ThemeContext";

export default function AdminLayout() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Mentorship Cockpit", path: "/admin/submissions", icon: ClipboardCheck },
    { name: "Files", path: "/admin/files", icon: FolderArchive },
    { name: "Students", path: "/admin/students", icon: Users },
  ];

  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "MENTOR"
      ? "Mentor"
      : "Staff";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold text-sm tracking-tight">Unisole Portal</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
            {roleLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:flex flex-col w-full md:w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 md:sticky md:top-0 md:h-screen z-30 transition-all`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 hidden md:flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              U
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Unisole LMS
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Course Management
              </div>
            </div>
          </Link>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold border border-zinc-200 dark:border-zinc-700">
            {roleLabel}
          </span>
        </div>

        {/* Quick Switch to Student View */}
        <div className="p-3">
          <Link
            to="/enrolled"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors border border-indigo-200/60 dark:border-indigo-800/60"
          >
            <span className="flex items-center gap-2 font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Student View
            </span>
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400">Exit Studio</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {user?.name || user?.phone || "Staff Member"}
              </div>
              <div className="text-[10px] text-zinc-400 font-mono truncate">
                {user?.phone || user?.email || user?.id}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
