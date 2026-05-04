import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Reads a cookie value by name.
 * The XSRF-TOKEN cookie is set by the backend and is readable by JS (not HttpOnly).
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

// ─── Instance ─────────────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Send + receive HttpOnly cookies (jwt)
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor — CSRF ───────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken && config.headers) {
      config.headers["X-XSRF-TOKEN"] = xsrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Automatic Token Refresh ──────────────────────────

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processPendingQueue(error: unknown, token: unknown = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh once per request, and only on 401
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh if the failing request IS the refresh endpoint (avoid loop)
    if (originalRequest.url?.includes("/auth/token/refresh")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue subsequent 401s until the in-flight refresh resolves
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then(() => axiosInstance(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Backend sets a new `jwt` cookie; returns refresh token in JSON body
      await axiosInstance.post("/api/v1/auth/token/refresh");
      processPendingQueue(null);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processPendingQueue(refreshError);
      // Redirect to login — token refresh also failed
      // window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;