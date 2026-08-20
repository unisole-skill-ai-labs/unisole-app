import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import GoogleButton from "./GoogleButton";
import { useLoginMutation } from "../../store/apiSlice";
import { setCredentials } from "../../store/authSlice";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = new URLSearchParams(location.search).get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await login({ email, password }).unwrap();
      dispatch(setCredentials(response));
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.data?.error || err.data?.message || "Invalid email or password");
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMsg("");
  };

  return (
    <Card className="p-6 sm:p-8 max-w-md w-full mx-auto shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Sign in to access your enrolled courses and quizzes
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="student@unisole.test"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">Password</span>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Forgot?
            </Link>
          </div>
          <Input
            type="password"
            icon={Lock}
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          icon={LogIn}
          className="w-full"
        >
          Sign In
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-slate-400 font-semibold uppercase tracking-wider">
            Or
          </span>
        </div>
      </div>

      <GoogleButton
        onSuccess={() => navigate(from, { replace: true })}
        onError={(err) => setErrorMsg(err.data?.error || "Google login failed")}
      />

      {/* Quick 1-Click Demo Logins */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
          Quick Demo Accounts
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoFill("john@unisole.test", "password123")}
            className="p-2 text-center rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-xs font-bold transition-all text-slate-700"
          >
            Student John
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill("jane@unisole.test", "password123")}
            className="p-2 text-center rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-xs font-bold transition-all text-slate-700"
          >
            Student Jane
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill("admin@unisole.test", "password123")}
            className="p-2 text-center rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-xs font-bold transition-all text-slate-700"
          >
            Admin User
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-bold text-indigo-600 hover:underline">
          Sign up now
        </Link>
      </div>
    </Card>
  );
}
