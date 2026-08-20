import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Mail,
  Shield,
  BookOpen,
  Award,
  LogOut,
  CheckCircle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { logout } from "../store/authSlice";
import { useGetEnrollmentsQuery, useGetTestAttemptsQuery } from "../store/apiSlice";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: enrollments = [] } = useGetEnrollmentsQuery();
  const { data: attempts = [] } = useGetTestAttemptsQuery();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed" || (e.progress_percent || 0) >= 100
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-fade-in">
      {/* Profile Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.name || "Learner"}</h1>
                <Badge variant={user.role === "admin" ? "rose" : user.role === "instructor" ? "amber" : "indigo"} size="sm">
                  {user.role || "student"}
                </Badge>
                {user.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </p>

              <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Auth Provider: <span className="font-semibold text-slate-600 capitalize">{user.auth_provider || "local"}</span>
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            className="text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            Sign Out
          </Button>
        </div>

        {/* Learning Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="block text-xl sm:text-2xl font-black text-slate-900">{enrollments.length}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Enrolled</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="block text-xl sm:text-2xl font-black text-emerald-600">{completedEnrollments}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Completed</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl">
            <span className="block text-xl sm:text-2xl font-black text-indigo-600">{attempts.length}</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Tests Taken</span>
          </div>
        </div>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/enrolled">
          <Card hover className="p-5 flex items-center justify-between group">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  My Enrolled Courses
                </h3>
                <p className="text-xs text-slate-500">Access curriculum & lessons</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600">View →</span>
          </Card>
        </Link>

        <Link to="/tests">
          <Card hover className="p-5 flex items-center justify-between group">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                  Practice Assessments
                </h3>
                <p className="text-xs text-slate-500">Take multiple-choice tests</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600">View →</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
