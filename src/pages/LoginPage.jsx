import React from "react";
import LoginForm from "../features/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <LoginForm />
    </div>
  );
}
