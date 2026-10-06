import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "./authSlice";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined"
    ? window.location.hostname.includes("stg")
      ? "https://stg.engine.unisole.org"
      : window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
      ? "https://api.unisole.org"
      : "http://localhost:3000"
    : "http://localhost:3000")
).replace(/\/+$/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any)?.auth?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as any)?.auth?.refreshToken;
    if (refreshToken) {
      // Try to get a new access token
      const refreshResult = await rawBaseQuery(
        {
          url: "/api/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new tokens
        api.dispatch(setCredentials(refreshResult.data));
        // Retry the original query with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Pathway",
    "Category",
    "College",
    "Branch",
    "Enrollment",
    "Lesson",
    "User",
    "Payment",
    "AdminCourses",
    "AdminModules",
    "AdminLessons",
    "AdminStudents",
    "Progress",
    "Submissions",
    "Activities",
    "Notes",
    "Cohort",
  ],
  endpoints: (builder) => ({
    // ─── Auth Endpoints ──────────────────────────────────────────────────────────
    checkUser: builder.mutation({
      query: (body) => ({
        url: "/api/auth/check-user",
        method: "POST",
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Handled in component
        }
      },
      invalidatesTags: ["User", "Enrollment", "Pathway"],
    }),
    adminLogin: builder.mutation({
      query: (body) => ({
        url: "/api/auth/admin-login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Handled in component
        }
      },
      invalidatesTags: ["User", "AdminCourses"],
    }),
    sendOtp: builder.mutation({
      query: (body) => ({
        url: "/api/auth/send-otp",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Handled in component
        }
      },
      invalidatesTags: ["User", "Enrollment", "Pathway"],
    }),
    getMe: builder.query({
      query: () => "/api/auth/me",
      providesTags: ["User"],
    }),

    // ─── Public Catalog Endpoints ────────────────────────────────────────────────
    getPublicPathways: builder.query({
      query: () => "/api/public/pathways",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }: { id: string }) => ({ type: "Pathway" as const, id })),
              { type: "Pathway", id: "LIST" },
            ]
          : [{ type: "Pathway", id: "LIST" }],
    }),
    getPublicPathwayBySlug: builder.query({
      query: (slug) => `/api/public/pathways/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: "Pathway", id: slug }],
    }),
    getCategories: builder.query({
      query: () => "/api/public/categories",
      providesTags: [{ type: "Category", id: "LIST" }],
    }),
    getColleges: builder.query({
      query: () => "/api/public/colleges",
      providesTags: [{ type: "College", id: "LIST" }],
    }),
    getBranches: builder.query({
      query: (collegeId) =>
        collegeId ? `/api/public/branches?collegeId=${collegeId}` : "/api/public/branches",
      providesTags: [{ type: "Branch", id: "LIST" }],
    }),

    // ─── Student LMS Endpoints (Authenticated) ───────────────────────────────────
    getMyPathways: builder.query({
      query: () => "/api/lms/pathways",
      providesTags: [{ type: "Pathway", id: "MY_LIST" }, { type: "Enrollment", id: "LIST" }],
    }),
    getPathwayContent: builder.query({
      query: (pathwayId) => `/api/lms/pathways/${pathwayId}`,
      providesTags: (_result, _error, id) => [{ type: "Pathway", id: `${id}-CONTENT` }],
    }),
    getLessonContent: builder.query({
      query: (lessonId) => `/api/lms/lessons/${lessonId}`,
      providesTags: (_result, _error, id) => [{ type: "Lesson", id }],
    }),
    getMyEnrollments: builder.query({
      query: () => "/api/lms/enrollments",
      providesTags: [{ type: "Enrollment", id: "LIST" }],
    }),

    // ─── Student Progress, Submissions & Activities ──────────────────────────────
    getStudentProgress: builder.query({
      query: (pathwayId) => (pathwayId ? `/api/lms/progress/${pathwayId}` : "/api/lms/progress"),
      providesTags: ["Progress"],
    }),
    markLessonProgress: builder.mutation({
      query: (body) => ({
        url: "/api/lms/progress",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Progress", "Activities"],
    }),
    getStudentSubmissions: builder.query({
      query: (pathwayId) => (pathwayId ? `/api/lms/submissions/${pathwayId}` : "/api/lms/submissions"),
      providesTags: ["Submissions"],
    }),
    submitAssignment: builder.mutation({
      query: (body) => ({
        url: "/api/lms/submissions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Submissions", "Progress", "Activities"],
    }),
    getStudentActivities: builder.query({
      query: () => "/api/lms/activities",
      providesTags: ["Activities"],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/api/lms/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getNotes: builder.query({
      query: (pathwayId) => (pathwayId ? `/api/lms/notes/${pathwayId}` : "/api/lms/notes"),
      providesTags: ["Notes"],
    }),
    saveNote: builder.mutation({
      query: (body) => ({
        url: "/api/lms/notes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notes"],
    }),
    getCohortData: builder.query({
      query: (pathwayId) => (pathwayId ? `/api/lms/cohort/${pathwayId}` : "/api/lms/cohort"),
      providesTags: ["Cohort"],
    }),

    // ─── Payments & Commerce Endpoints ───────────────────────────────────────────
    createPaymentOrder: builder.mutation({
      query: (body) => ({
        url: "/api/lms/payments/create-order",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),
    verifyPayment: builder.mutation({
      query: (body) => ({
        url: "/api/lms/payments/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Enrollment", id: "LIST" },
        { type: "Pathway", id: "MY_LIST" },
        "Payment",
      ],
    }),

    // ─── Admin & Mentor CMS Studio Endpoints ─────────────────────────────────────
    getAdminDashboardStats: builder.query({
      query: (period = "Monthly") => `/api/admin/dashboard/stats?period=${period}`,
      providesTags: ["AdminCourses", "AdminLessons", "AdminStudents", "Submissions", "Enrollment"],
    }),
    getAdminCourses: builder.query({
      query: () => "/api/admin/courses",
      providesTags: ["AdminCourses"],
    }),
    getAdminCourseById: builder.query({
      query: (id) => `/api/admin/courses/${id}`,
      providesTags: (_res, _err, id) => [{ type: "AdminCourses", id }],
    }),
    createAdminCourse: builder.mutation({
      query: (body) => ({
        url: "/api/admin/courses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminCourses"],
    }),
    updateAdminCourse: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/courses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => ["AdminCourses", { type: "AdminCourses", id }],
    }),
    getAdminCourseModules: builder.query({
      query: (id) => `/api/admin/courses/${id}/modules`,
      providesTags: (_res, _err, id) => [{ type: "AdminModules", id: `${id}-modules` }],
    }),
    attachAdminCourseModule: builder.mutation({
      query: ({ courseId, moduleId, position }) => ({
        url: `/api/admin/courses/${courseId}/modules`,
        method: "POST",
        body: { moduleId, position },
      }),
      invalidatesTags: (_res, _err, { courseId }) => [
        "AdminCourses",
        { type: "AdminModules", id: `${courseId}-modules` },
      ],
    }),
    detachAdminCourseModule: builder.mutation({
      query: ({ courseId, moduleId }) => ({
        url: `/api/admin/courses/${courseId}/modules/${moduleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { courseId }) => [
        "AdminCourses",
        { type: "AdminModules", id: `${courseId}-modules` },
      ],
    }),
    clearAdminCourseModules: builder.mutation({
      query: (courseId) => ({
        url: `/api/admin/courses/${courseId}/modules`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, courseId) => [
        "AdminCourses",
        "AdminModules",
        "AdminLessons",
        { type: "AdminModules", id: `${courseId}-modules` },
      ],
    }),
    reorderAdminCourseModules: builder.mutation({
      query: ({ courseId, moduleIds }) => ({
        url: `/api/admin/courses/${courseId}/reorder-modules`,
        method: "POST",
        body: { moduleIds },
      }),
      invalidatesTags: (_res, _err, { courseId }) => [
        "AdminCourses",
        { type: "AdminModules", id: `${courseId}-modules` },
      ],
    }),

    // Modules
    getAdminModules: builder.query({
      query: () => "/api/admin/modules",
      providesTags: ["AdminModules"],
    }),
    createAdminModule: builder.mutation({
      query: (body) => ({
        url: "/api/admin/modules",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminModules"],
    }),
    updateAdminModule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/modules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AdminModules"],
    }),
    getAdminModuleLessons: builder.query({
      query: (id) => `/api/admin/modules/${id}/lessons`,
      providesTags: (_res, _err, id) => [{ type: "AdminLessons", id: `${id}-lessons` }],
    }),
    attachAdminModuleLesson: builder.mutation({
      query: ({ moduleId, lessonId, position }) => ({
        url: `/api/admin/modules/${moduleId}/lessons`,
        method: "POST",
        body: { lessonId, position },
      }),
      invalidatesTags: (_res, _err, { moduleId }) => [
        "AdminModules",
        { type: "AdminLessons", id: `${moduleId}-lessons` },
      ],
    }),
    detachAdminModuleLesson: builder.mutation({
      query: ({ moduleId, lessonId }) => ({
        url: `/api/admin/modules/${moduleId}/lessons/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { moduleId }) => [
        "AdminModules",
        { type: "AdminLessons", id: `${moduleId}-lessons` },
      ],
    }),
    reorderAdminModuleLessons: builder.mutation({
      query: ({ moduleId, lessonIds }) => ({
        url: `/api/admin/modules/${moduleId}/reorder-lessons`,
        method: "POST",
        body: { lessonIds },
      }),
      invalidatesTags: (_res, _err, { moduleId }) => [
        "AdminModules",
        { type: "AdminLessons", id: `${moduleId}-lessons` },
      ],
    }),
    moveAdminModuleLesson: builder.mutation({
      query: ({ sourceModuleId, targetModuleId, lessonId, targetPosition }) => ({
        url: `/api/admin/modules/${sourceModuleId}/move-lesson`,
        method: "POST",
        body: { targetModuleId, lessonId, targetPosition },
      }),
      invalidatesTags: (_res, _err, { sourceModuleId, targetModuleId }) => [
        "AdminModules",
        { type: "AdminLessons", id: `${sourceModuleId}-lessons` },
        { type: "AdminLessons", id: `${targetModuleId}-lessons` },
      ],
    }),

    // Lessons
    getAdminLessons: builder.query({
      query: () => "/api/admin/lessons",
      providesTags: ["AdminLessons"],
    }),
    getAdminLessonById: builder.query({
      query: (id) => `/api/admin/lessons/${id}`,
      providesTags: (_res, _err, id) => [{ type: "AdminLessons", id }],
    }),
    createAdminLesson: builder.mutation({
      query: (body) => ({
        url: "/api/admin/lessons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminLessons"],
    }),
    updateAdminLesson: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/admin/lessons/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => ["AdminLessons", { type: "AdminLessons", id }],
    }),

    // Students & Roster
    getAdminStudents: builder.query({
      query: (params) => ({
        url: "/api/admin/students",
        params,
      }),
      providesTags: ["AdminStudents"],
    }),
    getAdminEnrollments: builder.query({
      query: () => "/api/admin/enrollments",
      providesTags: ["AdminStudents"],
    }),

    // Mentorship & Cockpit
    getStudentMentor: builder.query({
      query: () => "/api/lms/mentor/me",
      providesTags: ["Cohort"],
    }),
    getMentorCockpit: builder.query({
      query: (params) => ({
        url: "/api/lms/mentor/cockpit",
        params,
      }),
      providesTags: ["Cohort", "Submissions"],
    }),
    getSubmissionsAudit: builder.query({
      query: (params) => ({
        url: "/api/lms/submissions/audit",
        params,
      }),
      providesTags: ["Submissions"],
    }),

    // Mentorship Allocation Endpoints
    getAdminMentors: builder.query({
      query: () => "/api/lms/mentors",
      providesTags: ["Cohort"],
    }),
    assignMentor: builder.mutation({
      query: (body) => ({
        url: "/api/admin/mentorship/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminStudents", "Cohort", "Submissions"],
    }),
    unassignMentor: builder.mutation({
      query: (body) => ({
        url: "/api/admin/mentorship/unassign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminStudents", "Cohort", "Submissions"],
    }),

    // Course Assignments Studio (Practice vs Test)
    getCourseAssignments: builder.query({
      query: (params) => ({
        url: "/api/lms/assignments",
        params,
      }),
      providesTags: ["Lesson"],
    }),
    createCourseAssignment: builder.mutation({
      query: (body) => ({
        url: "/api/lms/assignments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Lesson"],
    }),
    submitAssessmentTask: builder.mutation({
      query: (body) => ({
        url: "/api/lms/assignments/submit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Submissions", "Progress", "Activities"],
    }),
    gradeSubmission: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/lms/submissions/${id}/grade`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Submissions", "Cohort", "Activities"],
    }),
  }),
});

export const {
  useCheckUserMutation,
  useLoginMutation,
  useAdminLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetMeQuery,
  useGetPublicPathwaysQuery,
  useGetPublicPathwayBySlugQuery,
  useGetCategoriesQuery,
  useGetCollegesQuery,
  useGetBranchesQuery,
  useGetMyPathwaysQuery,
  useGetPathwayContentQuery,
  useGetLessonContentQuery,
  useGetMyEnrollmentsQuery,
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,

  // Admin & Mentor hooks
  useGetAdminDashboardStatsQuery,
  useGetAdminCoursesQuery,
  useGetAdminCourseByIdQuery,
  useCreateAdminCourseMutation,
  useUpdateAdminCourseMutation,
  useGetAdminCourseModulesQuery,
  useAttachAdminCourseModuleMutation,
  useDetachAdminCourseModuleMutation,
  useClearAdminCourseModulesMutation,
  useReorderAdminCourseModulesMutation,
  useGetAdminModulesQuery,
  useCreateAdminModuleMutation,
  useUpdateAdminModuleMutation,
  useGetAdminModuleLessonsQuery,
  useAttachAdminModuleLessonMutation,
  useDetachAdminModuleLessonMutation,
  useReorderAdminModuleLessonsMutation,
  useMoveAdminModuleLessonMutation,
  useGetAdminLessonsQuery,
  useGetAdminLessonByIdQuery,
  useCreateAdminLessonMutation,
  useUpdateAdminLessonMutation,
  useGetAdminStudentsQuery,
  useGetAdminEnrollmentsQuery,

  // Student LMS Progress & Submissions hooks
  useGetStudentProgressQuery,
  useMarkLessonProgressMutation,
  useGetStudentSubmissionsQuery,
  useSubmitAssignmentMutation,
  useGetStudentActivitiesQuery,
  useUpdateProfileMutation,
  useGetNotesQuery,
  useSaveNoteMutation,
  useGetCohortDataQuery,

  // Mentorship & Assessment Studio hooks
  useGetStudentMentorQuery,
  useGetMentorCockpitQuery,
  useGetSubmissionsAuditQuery,
  useGetAdminMentorsQuery,
  useAssignMentorMutation,
  useUnassignMentorMutation,
  useGetCourseAssignmentsQuery,
  useCreateCourseAssignmentMutation,
  useSubmitAssessmentTaskMutation,
  useGradeSubmissionMutation,
} = apiSlice;
