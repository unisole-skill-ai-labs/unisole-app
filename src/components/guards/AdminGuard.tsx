import React from "react";
import { Navigate, useLocation, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ShieldAlert, LogOut, ArrowRight, ArrowLeft } from "lucide-react";
import { logout } from "../../store/authSlice";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, user, token } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Not signed in: redirect directly to the separate /admin/login page
  if (!isAuthenticated || !token) {
    return <Navigate to="/admin/login" replace />;
  }

  // 2. Check Role
  const role = user?.role ? String(user.role).toUpperCase() : "";
  const userRoles = [
    role,
    ...(Array.isArray(user?.roles) ? user.roles.map((r: any) => String(r).toUpperCase()) : []),
    ...(Array.isArray(user?.metadata?.roles) ? user.metadata.roles.map((r: any) => String(r).toUpperCase()) : []),
  ];
  const isAllowed = userRoles.some((r) =>
    ["ADMIN", "SUPER_ADMIN", "MENTOR", "MEMBER", "PROGRAM_MANAGER"].includes(r)
  );

  // 3. User is logged in as a STUDENT: Show informative Access Restricted screen
  if (!isAllowed) {
    const handleSwitchToStaff = () => {
      dispatch(logout());
      navigate("/admin/login");
    };

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-md w-full p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl text-center space-y-5 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-tight">Staff / Mentor Access Required</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              You are currently signed in as{" "}
              <strong className="text-zinc-800 dark:text-zinc-200">
                {user?.name || user?.phone || "Student"}
              </strong>{" "}
              with the role <span className="font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">{role || "STUDENT"}</span>.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The Course Studio & CMS requires an authorized <strong>Administrator</strong> or <strong>Mentor</strong> account.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleSwitchToStaff}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign In with Staff / Mentor Account</span>
            </button>

            <Link
              to="/enrolled"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Student Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
