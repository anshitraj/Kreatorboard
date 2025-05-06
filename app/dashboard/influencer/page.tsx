import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";

export default function InfluencerDashboard() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Earnings" value="₹35,000" />
        <StatCard title="Active Campaigns" value="4" />
        <StatCard title="Proposals Sent" value="11" />
        <StatCard title="Engagement Score" value="82%" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow text-gray-800">
        <h2 className="text-xl font-semibold mb-2">Welcome, Influencer!</h2>
        <p>Track your campaigns, proposals, and earnings here.</p>
      </div>
    </DashboardLayout>
  );
}
