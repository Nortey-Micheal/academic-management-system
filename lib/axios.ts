import axios, { AxiosError, AxiosRequestConfig } from "axios";

/* ===========================
   AXIOS INSTANCE
=========================== */
const api = axios.create({
  withCredentials: true, // 🔑 cookies are sent automatically
});

/* ===========================
   LOGOUT HELPER
=========================== */
const forceLogout = () => {
  window.location.href = "/login";
};

/* ===========================
   REFRESH QUEUE LOGIC
=========================== */
let isRefreshing = false;

type FailedRequest = {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve();
  });

  failedQueue = [];
};

/* ===========================
   RESPONSE INTERCEPTOR
=========================== */
api.interceptors.response.use(
  response => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      // Queue requests during refresh
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 🔁 Refresh token (cookie-based)
        await api.post("/api/auth/refresh-token");

        processQueue();

        // 🔁 Retry original request
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError);
        forceLogout();
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
