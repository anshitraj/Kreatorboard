"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface ChatPartner {
  id: string;
  full_name: string;
  role: "startup" | "influencer";
}

export default function ChatPage() {
  const { partnerId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [partner, setPartner] = useState<ChatPartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getSessionAndLoad = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;

        if (!uid) {
          setError("No user session found");
          return;
        }

        setUserId(uid);

        // Fetch partner details
        const { data: partnerData, error: partnerError } = await supabase
          .from("users")
          .select("id, full_name, role")
          .eq("id", partnerId)
          .single();

        if (partnerError) throw partnerError;
        setPartner(partnerData);

        // Fetch existing messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`
          )
          .order("created_at", { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

        // Subscribe to new messages
        const channel = supabase
          .channel(`chat:${uid}:${partnerId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `or(and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid}))`,
            },
            (payload) => {
              setMessages((prev) => [...prev, payload.new as Message]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        setError("Failed to load chat");
        console.error("Error loading chat:", err);
      } finally {
        setLoading(false);
      }
    };

    getSessionAndLoad();
  }, [partnerId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !userId) return;

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: userId,
        receiver_id: partnerId,
        message: newMsg.trim(),
      });

      if (error) throw error;
      setNewMsg("");
    } catch (err) {
      setError("Failed to send message");
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md h-[80vh] flex flex-col">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Chat with {partner?.full_name}
          </h1>
          <p className="text-sm text-gray-500 capitalize">{partner?.role}</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === userId
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!newMsg.trim()}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !newMsg.trim()
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
