"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface ChatPartner {
  id: string;
  full_name: string;
  role: "startup" | "influencer";
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function ChatInbox() {
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchChatPartners = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;

        if (!uid) {
          setError("No user session found");
          return;
        }

        // Get all unique chat partners and their last messages
        const { data, error } = await supabase.rpc("get_chat_partners", {
          user_id: uid,
        });

        if (error) throw error;
        setPartners(data || []);
      } catch (err) {
        setError("Failed to load conversations");
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatPartners();

    // Subscribe to new messages
    const channel = supabase
      .channel("chat-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchChatPartners(); // Refresh the list when new messages arrive
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {partners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No conversations yet
          </div>
        ) : (
          <div className="space-y-4">
            {partners.map((partner) => (
              <button
                key={partner.id}
                onClick={() => router.push(`/chat/${partner.id}`)}
                className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {partner.full_name}
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">
                      {partner.role}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(partner.last_message_time).toLocaleDateString()}
                    </p>
                    {partner.unread_count > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">
                        {partner.unread_count}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 truncate">
                  {partner.last_message}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
