import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { apiFetch } from "./api.js";
import NavBar from "./components/NavBar.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventDetailPage from "./pages/EventDetailPage.jsx";
import EventFormPage from "./pages/EventFormPage.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import StationsPage from "./pages/StationsPage.jsx";
import StationDetailPage from "./pages/StationDetailPage.jsx";
import StationFormPage from "./pages/StationFormPage.jsx";
import StationDashboardPage from "./pages/StationDashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import "./App.css";

export default function App() {
  // undefined while checking the session, null when logged out
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    apiFetch("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return (
    <div className="app">
      <NavBar user={user} onLogout={handleLogout} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={<AuthPage mode="login" onAuth={setUser} />}
          />
          <Route
            path="/register"
            element={<AuthPage mode="register" onAuth={setUser} />}
          />

          <Route path="/events" element={<EventsPage user={user} />} />
          <Route path="/events/summary" element={<SummaryPage />} />
          <Route
            path="/events/new"
            element={
              <RequireAuth user={user}>
                <EventFormPage user={user} />
              </RequireAuth>
            }
          />
          <Route path="/events/:id" element={<EventDetailPage user={user} />} />
          <Route
            path="/events/:id/edit"
            element={
              <RequireAuth user={user}>
                <EventFormPage user={user} />
              </RequireAuth>
            }
          />

          <Route path="/stations" element={<StationsPage user={user} />} />
          <Route
            path="/stations/:id"
            element={<StationDetailPage user={user} />}
          />
          <Route
            path="/stations/new"
            element={
              <RequireAuth user={user}>
                <StationFormPage />
              </RequireAuth>
            }
          />
          <Route
            path="/stations/:id/edit"
            element={
              <RequireAuth user={user}>
                <StationFormPage />
              </RequireAuth>
            }
          />
          <Route
            path="/stations/dashboard"
            element={<StationDashboardPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

App.propTypes = {};
