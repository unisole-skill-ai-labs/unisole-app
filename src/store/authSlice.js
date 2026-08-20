import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "unisole-app:token";
const REFRESH_TOKEN_KEY = "unisole-app:refreshToken";
const USER_KEY = "unisole-app:user";

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  token: localStorage.getItem(TOKEN_KEY) || null,
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || null,
  user: getInitialUser(),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, accessToken, refreshToken, user } = action.payload;
      const effectiveToken = accessToken || token;

      if (effectiveToken) {
        state.token = effectiveToken;
        localStorage.setItem(TOKEN_KEY, effectiveToken);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      if (user) {
        state.user = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
      state.isAuthenticated = true;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    },
    logout(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
