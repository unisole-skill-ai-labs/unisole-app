import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Mail,
  Phone,
  Globe,
  X,
  CheckCircle2,
} from "lucide-react";
import { updateUser, logout } from "../store/authSlice";
import Button from "../components/ui/Button";

export default function ProfilePage() {
  const { user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Edit Modal State
  const [activeModal, setActiveModal] = useState<
    "name" | "email" | "phone" | "timezone" | "linkedin" | "resetPassword" | null
  >(null);

  const [editValue, setEditValue] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-zinc-500">Please login to view account settings.</p>
          <Link to="/login">
            <Button variant="primary" size="sm">
              Login to Unisole
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = user.name || "Girish";
  const email = user.email || (user.phone ? `${user.phone}@unisole.org` : "learner@unisole.org");
  const phone = user.phone
    ? user.phone.startsWith("+")
      ? user.phone
      : `+91 ${user.phone}`
    : "+91 8091748041";
  const timezone = user.timezone || "Asia/Kolkata";
  const linkedin = user.linkedin || "";

  const openEdit = (field: "name" | "email" | "phone" | "timezone" | "linkedin") => {
    if (field === "name") setEditValue(user.name || "");
    if (field === "email") setEditValue(user.email || "");
    if (field === "phone") setEditValue(user.phone || "");
    if (field === "timezone") setEditValue(user.timezone || "Asia/Kolkata");
    if (field === "linkedin") setEditValue(user.linkedin || "");
    setActiveModal(field);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;

    const updates: Record<string, string> = {};
    if (activeModal === "name") updates.name = editValue.trim();
    if (activeModal === "email") updates.email = editValue.trim();
    if (activeModal === "phone") updates.phone = editValue.trim();
    if (activeModal === "timezone") updates.timezone = editValue.trim();
    if (activeModal === "linkedin") updates.linkedin = editValue.trim();

    dispatch(updateUser(updates));
    setActiveModal(null);
  };

  const handleTriggerReset = () => {
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setActiveModal(null);
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#0B0D13] py-6 sm:py-10 transition-colors">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Account Settings
          </h1>
        </div>

        {/* Profile Card / Identity */}
        <div className="space-y-4 pt-1">
          {/* Avatar circle */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-zinc-200/90 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-xs">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-slate-200 via-zinc-300 to-slate-400 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 text-2xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Name with Edit */}
          <div className="flex items-center gap-3">
            <span className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {name}
            </span>
            <button
              onClick={() => openEdit("name")}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          {/* Details List (Email, Phone, Timezone) */}
          <div className="space-y-2.5 pt-1 text-sm">
            {/* Email Row */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Mail className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 stroke-[1.8]" />
                <span className="text-zinc-800 dark:text-zinc-200 truncate font-normal">
                  {email}
                </span>
              </div>
              <button
                onClick={() => openEdit("email")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline shrink-0 cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Phone Row */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Phone className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 stroke-[1.8]" />
                <span className="text-zinc-800 dark:text-zinc-200 truncate font-normal">
                  {phone}
                </span>
              </div>
              <button
                onClick={() => openEdit("phone")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline shrink-0 cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Timezone Row */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Globe className="w-4 h-4 text-zinc-700 dark:text-zinc-300 shrink-0 stroke-[1.8]" />
                <span className="text-zinc-800 dark:text-zinc-200 truncate font-normal">
                  {timezone}
                </span>
              </div>
              <button
                onClick={() => openEdit("timezone")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline shrink-0 cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Reset Password Action */}
          <div className="pt-2">
            <button
              onClick={() => setActiveModal("resetPassword")}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Section Divider */}
        <hr className="border-zinc-200/80 dark:border-zinc-800/80 my-4" />

        {/* Professional Details Section */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Professional Details
          </h2>

          <div className="flex items-center gap-2.5">
            {/* LinkedIn Logo SVG */}
            <svg
              className="w-5 h-5 text-blue-600 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>

            {linkedin ? (
              <div className="flex items-center gap-2 min-w-0">
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {linkedin}
                </a>
                <button
                  onClick={() => openEdit("linkedin")}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ) : (
              <button
                onClick={() => openEdit("linkedin")}
                className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Add LinkedIn
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-16 pb-8 text-center space-y-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          <p>© 2026 Unisole Skill AI Labs Pvt. Ltd. All rights reserved</p>
          <div className="flex items-center justify-center gap-2 text-[11px]">
            <Link to="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-300">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Edit Field Modal */}
      {activeModal && activeModal !== "resetPassword" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="bg-white dark:bg-[#121622] w-full max-w-sm rounded-3xl shadow-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                Edit {activeModal}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 capitalize">
                  {activeModal}
                </label>
                <input
                  type={activeModal === "email" ? "email" : "text"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter your ${activeModal}`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {activeModal === "resetPassword" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setActiveModal(null)}
        >
          <div className="bg-white dark:bg-[#121622] w-full max-w-sm rounded-3xl shadow-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Reset Password
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  Password reset link sent to {email}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  We will send a password reset verification link to your registered email address:{" "}
                  <strong className="text-zinc-800 dark:text-zinc-200">{email}</strong>.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleTriggerReset}>
                    Send Reset Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
