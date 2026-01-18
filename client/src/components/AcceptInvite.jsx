import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { teamAPI } from "../utils/api";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [invitation, setInvitation] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Clear any existing session when loading an invite to prevent role confusion
    localStorage.removeItem("token");
    
    const loadInvitation = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await teamAPI.getInvitation(token);
        setInvitation(data);
      } catch (err) {
        setError(err.message || "Invalid or expired invitation.");
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await teamAPI.acceptInvitation(token, formData.name, formData.password);

      setSuccess(true);
      setCreatedUser({
        email: invitation.email,
        password: formData.password
      });
      // Do not redirect or set token
    } catch (err) {
      setError(err.message || "Failed to accept invitation.");
      setLoading(false);
    }
  };

  if (loading && !invitation) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
         <p className="text-gray-500">Loading invitation...</p>
      </div>
    </div>
    );
  }

  if (error && !invitation) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
             <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">Unavailable Invitation</h2>
          <p className="text-center text-gray-500 mb-6">{error}</p>
        </div>
        
        <button 
          onClick={() => navigate("/")}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
    );
  }

  if (success && createdUser) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-green-600">✓ Account Created!</h2>
        <div className="text-center text-gray-600 mb-6">
          Your account has been created successfully.
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-left">
          <p className="mb-4 font-semibold text-gray-700">Use these credentials to login:</p>
          <div className="mb-2">
            <span className="text-gray-500 inline-block w-20">Email:</span> <strong className="text-gray-900">{createdUser.email}</strong>
          </div>
          <div>
            <span className="text-gray-500 inline-block w-20">Password:</span> <strong className="text-gray-900 font-mono bg-gray-200 px-1 rounded">{createdUser.password}</strong>
          </div>
        </div>

        <button 
          onClick={() => navigate("/")}
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Accept Invitation</h2>

        {invitation && (
          <div className="text-center rounded-md bg-blue-50 p-4 border border-blue-100">
            <p className="text-sm text-gray-600">You've been invited to join</p>
            <strong className="block text-xl text-blue-800 mt-1">{invitation.organizationName}</strong>
            <p className="text-xs text-gray-500 mt-2">
              Email: {invitation.email}
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                disabled={loading}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={loading}
                minLength={6}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={loading}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "Creating Account..." : "Accept Invitation"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none underline transition-colors duration-200"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AcceptInvite;
