import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "./store/authSlice";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/guards/ProtectedRoute";

import DashboardPage from "./pages/DashboardPage";
import CatalogPage from "./pages/CatalogPage";
import PathwayDetailPage from "./pages/PathwayDetailPage";
import EnrolledCoursesPage from "./pages/EnrolledCoursesPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import LmsPlayerPage from "./pages/LmsPlayerPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import NotFoundPage from "./pages/NotFoundPage";
import CalendarPage from "./pages/CalendarPage";

// Admin & Mentor Portal
import AdminGuard from "./components/guards/AdminGuard";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCoursesPage from "./pages/admin/AdminCoursesPage";
import EditCoursePage from "./pages/admin/EditCoursePage";
import SubmissionsPage from "./pages/admin/SubmissionsPage";
import FilesPage from "./pages/admin/FilesPage";
import StudentsPage from "./pages/admin/StudentsPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token") || params.get("auth_token");
    if (token) {
      dispatch(setCredentials({ token }));
      params.delete("token");
      params.delete("auth_token");
      const newSearch = params.toString() ? `?${params.toString()}` : "";
      window.history.replaceState({}, "", `${location.pathname}${newSearch}`);
    }
  }, [location, dispatch]);
  return (
    <Routes>
      {/* Dedicated Admin & Mentor Login */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin & Mentor Portal */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="courses" element={<AdminCoursesPage />} />
        <Route path="courses/:courseId" element={<EditCoursePage />} />
        <Route path="submissions" element={<SubmissionsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="students" element={<StudentsPage />} />
      </Route>
      <Route path="/" element={<Layout />}>
        {/* sargam - Public Auth Entrypoints */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="signup" element={<Navigate to="/register" replace />} />

        {/* Protected LMS Routes - Full LMS Wall behind Login / Register */}
        <Route
          index
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="catalog"
          element={
            <ProtectedRoute>
              <CatalogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pathways/:slug"
          element={
            <ProtectedRoute>
              <PathwayDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="courses/:slug"
          element={
            <ProtectedRoute>
              <PathwayDetailPage />
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
          path="activities"
          element={
            <ProtectedRoute>
              <ActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="learn/:pathwayId"
          element={
            <ProtectedRoute>
              <LmsPlayerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="player/:pathwayId"
          element={
            <ProtectedRoute>
              <LmsPlayerPage />
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
        <Route
          path="payment-success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="thank-you"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
