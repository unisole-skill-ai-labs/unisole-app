import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/guards/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import EnrolledCoursesPage from "./pages/EnrolledCoursesPage";
import TestsPage from "./pages/TestsPage";
import QuizActivePage from "./pages/QuizActivePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Catalog Routes */}
        <Route index element={<DashboardPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Student Routes */}
        <Route
          path="tests"
          element={
            <ProtectedRoute>
              <TestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="tests/:testId"
          element={
            <ProtectedRoute>
              <QuizActivePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="enrolled"
          element={
            <ProtectedRoute>
              <EnrolledCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
