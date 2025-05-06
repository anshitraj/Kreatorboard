"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  email: string;
  role: "startup" | "influencer";
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, is_admin, is_blocked, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id: string, block: boolean) => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from("users")
        .update({ is_blocked: block })
        .eq("id", id);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      setError("Failed to update user status");
      console.error("Error updating user:", err);
    } finally {
      setUpdating(null);
    }
  };

  const toggleAdmin = async (id: string, makeAdmin: boolean) => {
    try {
      setUpdating(id);
      const { error } = await supabase
        .from("users")
        .update({ is_admin: makeAdmin })
        .eq("id", id);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      setError("Failed to update admin status");
      console.error("Error updating admin status:", err);
    } finally {
      setUpdating(null);
    }
  };

  const exportCSV = () => {
    const header = ["Email", "Role", "Admin", "Blocked", "Created At"];
    const rows = users.map((u) => [
      u.email,
      u.role,
      u.is_admin ? "Yes" : "No",
      u.is_blocked ? "Yes" : "No",
      new Date(u.created_at).toLocaleString(),
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kreatorboard_users_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blocked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "startup"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.is_admin ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.is_blocked ? (
                      <span className="text-red-600">🚫</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleBlock(user.id, !user.is_blocked)}
                        disabled={updating === user.id}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                          user.is_blocked
                            ? "text-green-700 bg-green-100 hover:bg-green-200"
                            : "text-red-700 bg-red-100 hover:bg-red-200"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                      >
                        {updating === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : user.is_blocked ? (
                          "Unblock"
                        ) : (
                          "Block"
                        )}
                      </button>
                      <button
                        onClick={() => toggleAdmin(user.id, !user.is_admin)}
                        disabled={updating === user.id}
                        className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                          user.is_admin
                            ? "text-red-700 bg-red-100 hover:bg-red-200"
                            : "text-blue-700 bg-blue-100 hover:bg-blue-200"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {updating === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : user.is_admin ? (
                          "Remove Admin"
                        ) : (
                          "Make Admin"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
