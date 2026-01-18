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
import { isAuthenticated, logout, getUserFromToken } from "./utils/api";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
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
