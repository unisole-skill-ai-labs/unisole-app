import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "./authSlice";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://api.unisole.org"
    : "")
).replace(/\/+$/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;
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
  tagTypes: ["Course", "Category", "Enrollment", "Test", "TestAttempt", "User", "Review"],
  endpoints: (builder) => ({
    // ─── Auth Endpoints ──────────────────────────────────────────────────────────
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Enrollment", "TestAttempt"],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/api/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User", "Enrollment"],
    }),
    googleLogin: builder.mutation({
      query: (payload) => ({
        url: "/api/auth/google",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["User", "Enrollment"],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query({
      query: () => "/api/auth/me",
      providesTags: ["User"],
    }),

    // ─── Courses Endpoints ───────────────────────────────────────────────────────
    getCourses: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.category) searchParams.append("category_id", params.category);
        if (params.search) searchParams.append("search", params.search);
        const qs = searchParams.toString();
        return `/api/courses${qs ? `?${qs}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Course", id })),
              { type: "Course", id: "LIST" },
            ]
          : [{ type: "Course", id: "LIST" }],
    }),
    getCourseById: builder.query({
      query: (id) => `/api/courses/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Course", id }],
    }),
    getCourseTree: builder.query({
      query: (id) => `/api/courses/${id}/tree`,
      providesTags: (_result, _error, id) => [{ type: "Course", id: `${id}-TREE` }],
    }),

    // ─── Categories Endpoints ────────────────────────────────────────────────────
    getCategories: builder.query({
      query: () => "/api/categories",
      providesTags: [{ type: "Category", id: "LIST" }],
    }),

    // ─── Enrollments Endpoints ───────────────────────────────────────────────────
    getEnrollments: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams({ include: "course" });
        if (params.user_id) searchParams.append("user_id", params.user_id);
        return `/api/enrollments?${searchParams.toString()}`;
      },
      providesTags: [{ type: "Enrollment", id: "LIST" }],
    }),
    enrollCourse: builder.mutation({
      query: ({ course_id, user_id }) => ({
        url: "/api/enrollments",
        method: "POST",
        body: { course_id, ...(user_id ? { user_id } : {}) },
      }),
      invalidatesTags: [
        { type: "Enrollment", id: "LIST" },
        { type: "Course", id: "LIST" },
      ],
    }),
    updateEnrollmentProgress: builder.mutation({
      query: ({ id, progress_percent, status }) => ({
        url: `/api/enrollments/${id}`,
        method: "PUT",
        body: { progress_percent, status },
      }),
      invalidatesTags: [{ type: "Enrollment", id: "LIST" }],
    }),

    // ─── Tests & Quiz Endpoints ──────────────────────────────────────────────────
    getTests: builder.query({
      query: () => "/api/tests?details=true",
      providesTags: [{ type: "Test", id: "LIST" }],
    }),
    getTestById: builder.query({
      query: (id) => `/api/tests/${id}?details=true`,
      providesTags: (_result, _error, id) => [{ type: "Test", id }],
    }),
    getTestAttempts: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.test_id) searchParams.append("test_id", params.test_id);
        if (params.user_id) searchParams.append("user_id", params.user_id);
        const qs = searchParams.toString();
        return `/api/test-attempts${qs ? `?${qs}` : ""}`;
      },
      providesTags: [{ type: "TestAttempt", id: "LIST" }],
    }),
    submitTestAttempt: builder.mutation({
      query: (body) => ({
        url: "/api/test-attempts",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "TestAttempt", id: "LIST" },
        { type: "Enrollment", id: "LIST" },
      ],
    }),

    // ─── Reviews Endpoints ───────────────────────────────────────────────────────
    getReviews: builder.query({
      query: () => "/api/reviews",
      providesTags: [{ type: "Review", id: "LIST" }],
    }),
    createReview: builder.mutation({
      query: (body) => ({
        url: "/api/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Review", id: "LIST" }],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useGetMeQuery,
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseTreeQuery,
  useGetCategoriesQuery,
  useGetEnrollmentsQuery,
  useEnrollCourseMutation,
  useUpdateEnrollmentProgressMutation,
  useGetTestsQuery,
  useGetTestByIdQuery,
  useGetTestAttemptsQuery,
  useSubmitTestAttemptMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
} = apiSlice;
