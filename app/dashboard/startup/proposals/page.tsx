"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/DashboardLayout";

interface Influencer {
  full_name: string;
  bio: string;
  instagram: string;
  youtube: string;
  media_kit_url: string;
  twitter_handle?: string;
}

interface Campaign {
  name: string;
}

interface Proposal {
  id: string;
  message: string;
  influencer_email: string;
  submitted_at: string;
  status: "pending" | "accepted" | "rejected";
  campaigns: Campaign;
  influencers: Influencer;
}

interface TwitterInsights {
  tweet_count: number;
  avg_likes: number;
  avg_retweets: number;
  top_hashtags: string[];
  error?: string;
}

export default function StartupProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [twitterInsights, setTwitterInsights] = useState<
    Record<string, TwitterInsights>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;

        if (!uid) {
          setError("No user session found");
          return;
        }

        const { data, error } = await supabase
          .from("proposals")
          .select(
            `
            id, message, influencer_email, submitted_at, status,
            campaigns(name),
            influencers(full_name, bio, instagram, youtube, media_kit_url, twitter_handle)
          `
          )
          .eq("campaign_owner", uid);

        if (error) throw error;

        // Transform the data to match our types
        const transformedData = (data || []).map((proposal) => ({
          ...proposal,
          campaigns: proposal.campaigns[0],
          influencers: proposal.influencers[0],
        }));

        setProposals(transformedData);

        // Fetch Twitter insights for each proposal
        transformedData.forEach((proposal) => {
          if (proposal.influencers?.twitter_handle) {
            fetchTwitterInsights(proposal.influencers.twitter_handle);
          }
        });
      } catch (err) {
        setError("Failed to load proposals");
        console.error("Error loading proposals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTwitterInsights = async (handle: string) => {
    if (!handle || twitterInsights[handle]) return;

    try {
      const res = await fetch("/api/twitter-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.replace("@", "") }),
      });

      const data = await res.json();
      if (!data.error) {
        setTwitterInsights((prev) => ({
          ...prev,
          [handle]: data,
        }));
      }
    } catch (error) {
      console.error("Error fetching Twitter insights:", error);
    }
  };

  const updateStatus = async (
    proposalId: string,
    newStatus: "accepted" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from("proposals")
        .update({ status: newStatus })
        .eq("id", proposalId);

      if (error) throw error;

      setProposals(
        proposals.map((proposal) =>
          proposal.id === proposalId
            ? { ...proposal, status: newStatus }
            : proposal
        )
      );
    } catch (err) {
      setError("Failed to update proposal status");
      console.error("Error updating proposal:", err);
    }
  };

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
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Campaign Proposals</h1>

        {proposals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No proposals received yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {proposal.campaigns.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Submitted on{" "}
                      {new Date(proposal.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      proposal.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : proposal.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {proposal.status.charAt(0).toUpperCase() +
                      proposal.status.slice(1)}
                  </span>
                </div>

                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700">{proposal.message}</p>
                </div>

                {proposal.influencers && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Influencer Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium text-gray-700">Name:</span>{" "}
                        {proposal.influencers.full_name}
                      </p>

                      {proposal.influencers.bio && (
                        <p>
                          <span className="font-medium text-gray-700">
                            Bio:
                          </span>{" "}
                          {proposal.influencers.bio}
                        </p>
                      )}

                      <div className="flex gap-4 items-center mt-2">
                        {proposal.influencers.instagram && (
                          <a
                            href={proposal.influencers.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            Instagram
                          </a>
                        )}

                        {proposal.influencers.youtube && (
                          <a
                            href={proposal.influencers.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                            </svg>
                            YouTube
                          </a>
                        )}
                      </div>

                      <div className="mt-3">
                        {proposal.influencers.media_kit_url ? (
                          <a
                            href={proposal.influencers.media_kit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Media Kit
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-md">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            No Media Kit Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {proposal.influencers?.twitter_handle && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Twitter Insights
                    </h3>
                    {twitterInsights[proposal.influencers.twitter_handle] ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
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
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span>
                              {
                                twitterInsights[
                                  proposal.influencers.twitter_handle
                                ].tweet_count
                              }{" "}
                              tweets analyzed
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
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
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                              />
                            </svg>
                            <span>
                              {
                                twitterInsights[
                                  proposal.influencers.twitter_handle
                                ].avg_likes
                              }{" "}
                              avg likes
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
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
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                            <span>
                              {
                                twitterInsights[
                                  proposal.influencers.twitter_handle
                                ].avg_retweets
                              }{" "}
                              avg retweets
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Top Hashtags:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {twitterInsights[
                              proposal.influencers.twitter_handle
                            ].top_hashtags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                )}

                {proposal.status === "pending" && (
                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => updateStatus(proposal.id, "accepted")}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(proposal.id, "rejected")}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
