import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
const requestQueue: Array<(token: string) => void> = [];

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  isRefreshing = true;
  const storedRefresh = localStorage.getItem("refresh_token");
  refreshPromise = (async () => {
    try {
      // Support both body-based and cookie-based refresh
      const res = await api.post(
        "/auth/refresh",
        storedRefresh ? { refresh_token: storedRefresh } : undefined
      );
      const newToken: string = res?.data?.access_token;
      if (!newToken) throw new Error("No access_token in refresh response");
      localStorage.setItem("token", newToken);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      return newToken;
    } catch (e) {
      // On refresh failure: drop token and notify app to logout
      localStorage.removeItem("token");
      try {
        const message =
          (e as any)?.response?.data?.message ||
          (e as Error)?.message ||
          "Session expired. Please login again.";
        window.dispatchEvent(new CustomEvent("api-error", { detail: message }));
      } catch {
        // no-op
      }
      window.dispatchEvent(new Event("auth-logout"));
      throw e;
    } finally {
      isRefreshing = false;
    }
  })();

  try {
    const token = await refreshPromise;
    // Flush queued requests
    requestQueue.splice(0).forEach((cb) => {
      try {
        cb(token);
      } catch {
        // ignore
      }
    });
    return token;
  } finally {
    refreshPromise = null;
  }
}

// Response interceptor: handle 401 with refresh, otherwise bubble error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config as any;

    // If unauthorized, try refresh once
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const token =
          isRefreshing && refreshPromise
            ? await refreshPromise
            : await refreshAccessToken();

        // Update header and retry original request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (e) {
        // Refresh failed: propagate error after logout event has fired
        return Promise.reject(e);
      }
    }

    // For non-401 errors, dispatch global toast and propagate error
    try {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      window.dispatchEvent(new CustomEvent("api-error", { detail: message }));
    } catch {
      // no-op
    }
    return Promise.reject(error);
  }
);

export default api;
