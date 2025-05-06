"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Earnings {
  total_earned: number;
  withdrawable: number;
  pending: number;
}

export default function WalletPage() {
  const { publicKey } = useWallet();
  const [earnings, setEarnings] = useState<Earnings>({
    total_earned: 0,
    withdrawable: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const uid = session?.user?.id;

        if (!uid) {
          setError("No user session found");
          return;
        }

        // In a real app, this would fetch from your database
        // For now, we'll use mock data
        setEarnings({
          total_earned: 11500,
          withdrawable: 4200,
          pending: 2300,
        });
      } catch (err) {
        setError("Failed to load earnings");
        console.error("Error loading earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const handleWithdraw = async () => {
    if (!publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    setWithdrawing(true);
    setError(null);

    try {
      // In a real app, this would:
      // 1. Create a transaction
      // 2. Sign it with the user's wallet
      // 3. Send it to the network
      // 4. Update the database

      // For now, we'll just simulate a successful withdrawal
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEarnings((prev) => ({
        ...prev,
        withdrawable: 0,
        total_earned: prev.total_earned,
      }));

      alert("Withdrawal successful! (mock)");
    } catch (err) {
      setError("Failed to process withdrawal");
      console.error("Error processing withdrawal:", err);
    } finally {
      setWithdrawing(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Wallet</h1>
          <WalletMultiButton />
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
        )}

        {publicKey && (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">Connected Wallet</p>
            <p className="font-mono text-sm mt-1 break-all">
              {publicKey.toString()}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Earnings</p>
            <h2 className="text-2xl font-bold text-blue-900 mt-1">
              ₹{earnings.total_earned.toLocaleString()}
            </h2>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Withdrawable</p>
            <h2 className="text-2xl font-bold text-green-900 mt-1">
              ₹{earnings.withdrawable.toLocaleString()}
            </h2>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-900 mt-1">
              ₹{earnings.pending.toLocaleString()}
            </h2>
          </div>
        </div>

        {earnings.withdrawable > 0 && (
          <button
            onClick={handleWithdraw}
            disabled={!publicKey || withdrawing}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              !publicKey || withdrawing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {withdrawing ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Withdraw to Wallet"
            )}
          </button>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-900 mb-2">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>1. Connect your Phantom wallet</li>
            <li>2. Verify your withdrawable balance</li>
            <li>3. Click withdraw to receive your earnings</li>
            <li>4. Funds will be sent to your connected wallet</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
