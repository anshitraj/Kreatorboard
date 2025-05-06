"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { ready, authenticated, user, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated && user) {
      // Sync user data with Supabase
      const syncToSupabase = async () => {
        const { error } = await supabase.from("users").upsert({
          id: user.id,
          email: user.email?.address,
          wallet_address: user.wallet?.address,
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error syncing user to Supabase:", error);
        }
      };

      syncToSupabase();
      router.push("/dashboard");
    }
  }, [ready, authenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6C63FF] to-[#4338CA] text-white">
      <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.svg" alt="Kreatorboard Logo" className="w-14 h-14" />
          <h1 className="text-2xl font-bold text-center">
            Welcome to Kreatorboard
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Login with email or wallet to get started
          </p>
          <button
            onClick={login}
            className="w-full py-2 px-4 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition"
          >
            Sign in with Privy
          </button>
        </div>
      </div>
    </div>
  );
}
