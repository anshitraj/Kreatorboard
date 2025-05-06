import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";

export default function StartupDashboard() {
  const companyName = "Webcoin Labs"; // replace with dynamic value later
  const logoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${companyName.replaceAll(
    " ",
    "+"
  )}`;

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16">
          <img
            src={logoUrl}
            alt="Company Logo"
            className="rounded-full ring-2 ring-green-500"
          />
          <span className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        </div>
        <div>
          <h1 className="text-xl font-bold">{companyName}</h1>
          <p className="text-gray-500">Verified Startup</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Campaigns Launched" value="12" />
        <StatCard title="Proposals Received" value="38" />
        <StatCard title="Approved Creators" value="16" />
        <StatCard title="Budget Spent" value="₹45,000" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow text-gray-800">
        <h2 className="text-xl font-semibold mb-2">Welcome, Startup!</h2>
        <p>Manage your influencer campaigns and company presence here.</p>
      </div>
    </DashboardLayout>
  );
}
