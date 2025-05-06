"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface Stats {
  users: number;
  campaigns: number;
  proposals: number;
  payouts: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  full_name: string;
}

interface Campaign {
  id: string;
  name: string;
  created_by: string;
  budget: number;
  created_at: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    campaigns: 0,
    proposals: 0,
    payouts: 0,
  });
  const [latestUsers, setLatestUsers] = useState<User[]>([]);
  const [latestCampaigns, setLatestCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counts
        const [
          { count: users },
          { count: campaigns },
          { count: proposals },
          { data: payoutsData },
        ] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase
            .from("campaigns")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("proposals")
            .select("*", { count: "exact", head: true }),
          supabase.from("earnings").select("amount").eq("status", "withdrawn"),
        ]);

        // Calculate total payouts
        const totalPayouts =
          payoutsData?.reduce(
            (sum, record) => sum + Number(record.amount),
            0
          ) || 0;

        setStats({
          users: users || 0,
          campaigns: campaigns || 0,
          proposals: proposals || 0,
          payouts: totalPayouts,
        });

        // Fetch latest users
        const { data: recentUsers, error: usersError } = await supabase
          .from("users")
          .select("id, email, role, created_at, full_name")
          .order("created_at", { ascending: false })
          .limit(5);

        if (usersError) throw usersError;
        setLatestUsers(recentUsers || []);

        // Fetch latest campaigns
        const { data: recentCampaigns, error: campaignsError } = await supabase
          .from("campaigns")
          .select("id, name, created_by, budget, created_at, status")
          .order("created_at", { ascending: false })
          .limit(5);

        if (campaignsError) throw campaignsError;
        setLatestCampaigns(recentCampaigns || []);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.users.toLocaleString()}
                </h2>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Campaigns</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.campaigns.toLocaleString()}
                </h2>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Proposals</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.proposals.toLocaleString()}
                </h2>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Payouts</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  ₹{stats.payouts.toLocaleString()}
                </h2>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latest Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Latest Users
              </h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-100">
                  {latestUsers.map((user) => (
                    <li key={user.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.full_name || user.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.role} •{" "}
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === "startup"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Latest Campaigns */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Latest Campaigns
              </h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-100">
                  {latestCampaigns.map((campaign) => (
                    <li key={campaign.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {campaign.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Budget: ₹{campaign.budget.toLocaleString()} •{" "}
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              campaign.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
