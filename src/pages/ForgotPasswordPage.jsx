import React from "react";
import ForgotPasswordForm from "../features/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <ForgotPasswordForm />
    </div>
  );
}
