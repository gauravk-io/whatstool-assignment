import React, { useState, useEffect } from "react";
import { teamAPI } from "../utils/api";

function Dashboard({ user, onLogout }) {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const userIsAdmin = user && user.role === "admin";

  useEffect(() => {
    if (user) {
      loadTeam();
    }
  }, [user]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await teamAPI.getTeam();
      setTeam(response.teamMembers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage("");
    setInviteLink("");
    setCopyFeedback("");
    setError("");

    try {
      const response = await teamAPI.inviteMember(inviteEmail);
      setInviteMessage("Invitation link generated successfully!");
      setInviteLink(response.inviteLink);
      setInviteEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (err) {
      setCopyFeedback("Failed to copy");
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) {
      return;
    }

    try {
      await teamAPI.removeMember(userId);
      setTeam(team.filter((member) => member._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="text-center sm:text-left">
          {userIsAdmin ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">
                Team Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
            </>
          )}
        </div>
        <button
          onClick={onLogout}
          className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Invite Section - Admin Only */}
      {userIsAdmin && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Invite Team Member
          </h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="grow">
                <label className="sr-only">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={inviteLoading}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                />
              </div>
              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 whitespace-nowrap"
              >
                {inviteLoading ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </form>

          {inviteMessage && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in-up">
              <div className="text-green-800 font-medium mb-3">
                {inviteMessage}
              </div>
              {inviteLink && (
                <div className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 border-none focus:ring-0 text-gray-600 text-sm font-mono bg-transparent w-full"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded hover:bg-green-600 transition-colors shrink-0"
                    title="Copy to clipboard"
                  >
                    {copyFeedback || "Copy Link"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Team List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Team Members ({team.length})
          </h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-center border-b border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading team members...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  {userIsAdmin && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {team.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    {userIsAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {member.role !== "admin" && (
                          <button
                            onClick={() => handleRemove(member._id)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
