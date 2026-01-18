import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./index.css";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import AcceptInvite from "./components/AcceptInvite";
import {
  isAuthenticated,
  logout,
  getUserFromToken,
  pingBackend,
} from "./utils/api";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    // Wake up backend on app load
    const wakeBackend = async () => {
      await pingBackend();
      setBackendReady(true);
    };
    wakeBackend();

    if (isAuthenticated()) {
      const userData = getUserFromToken();
      setUser(userData);
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setAuthenticated(false);
  };

  // Show loading screen while backend wakes up
  if (!backendReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Waking up backend server...</p>
          <p className="text-gray-400 text-sm mt-2">This may take 60 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public route for accepting invitations */}
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />

          {/* Main app route */}
          <Route
            path="/"
            element={
              authenticated ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Auth onLogin={handleLogin} />
              )
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
