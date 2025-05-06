"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface Campaign {
  id: string;
  name: string;
  description: string;
  audience: string;
  budget: number;
  start_date: string;
  end_date: string;
  created_by: string;
}

export default function CampaignBrowser() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [proposal, setProposal] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      alert("Failed to load campaigns. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("proposals").insert([
        {
          campaign_id: selectedCampaign,
          message: proposal,
          influencer_email: "influencer@example.com", // TODO: Replace with actual user email
          submitted_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert("Proposal submitted successfully!");
      setSelectedCampaign(null);
      setProposal("");
    } catch (error) {
      console.error("Error submitting proposal:", error);
      alert("Failed to submit proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Available Campaigns</h1>
        <p className="text-gray-600">
          Browse campaigns and apply directly with your proposal.
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No campaigns available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">
                  {campaign.name}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  ₹{campaign.budget.toLocaleString()}
                </span>
              </div>

              <p className="text-gray-600 mt-2">{campaign.description}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {campaign.audience}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                  {new Date(campaign.end_date).toLocaleDateString()}
                </div>
              </div>

              {selectedCampaign === campaign.id ? (
                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                  <textarea
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Write your proposal... Include your experience, content ideas, and why you're a good fit for this campaign."
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    required
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Proposal"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCampaign(null)}
                      disabled={isSubmitting}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSelectedCampaign(campaign.id)}
                  className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
