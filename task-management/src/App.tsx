import { useContext, useEffect, useState, type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Login from "./pages/login/Login";
import Register from "./pages/registration/Registration";
import Dashboard from "./pages/dashboard/Dashboard";
import NotFound from "./pages/not-found/NotFound";
import { Snackbar, Alert } from "@mui/material";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) return null;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

const GlobalErrorToast = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      setMessage(String(ce.detail || "An error occurred"));
      setOpen(true);
    };
    window.addEventListener("api-error", handler as EventListener);
    return () =>
      window.removeEventListener("api-error", handler as EventListener);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity="error"
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

const GlobalSuccessToast = (): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      setMessage(String(ce.detail || "Success"));
      setOpen(true);
    };
    window.addEventListener("api-success", handler as EventListener);
    return () =>
      window.removeEventListener("api-success", handler as EventListener);
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity="success"
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlobalErrorToast />
        <GlobalSuccessToast />
      </BrowserRouter>
    </AuthProvider>
  );
}
