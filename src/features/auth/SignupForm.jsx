import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import GoogleButton from "./GoogleButton";
import { useRegisterMutation } from "../../store/apiSlice";
import { setCredentials } from "../../store/authSlice";

export default function SignupForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [registerUser, { isLoading }] = useRegisterMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await registerUser({
        name,
        email,
        password,
        role: "student",
      }).unwrap();

      dispatch(setCredentials(response));
      navigate("/enrolled");
    } catch (err) {
      setErrorMsg(err.data?.error || err.data?.message || "Registration failed. Try a different email.");
    }
  };

  return (
    <Card className="p-6 sm:p-8 max-w-md w-full mx-auto shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Create Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Join thousands of learners mastering real-world coding skills
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
          label="Full Name"
          type="text"
          icon={User}
          placeholder="Alex Johnson"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="alex@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password (min 6 chars)"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          icon={UserPlus}
          className="w-full"
        >
          Create Student Account
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
        label="Sign up with Google"
        onSuccess={() => navigate("/enrolled")}
        onError={(err) => setErrorMsg(err.data?.error || "Google sign up failed")}
      />

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-bold text-indigo-600 hover:underline">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
