import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 prose max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul>
              <li>Account information (email, name, role)</li>
              <li>Profile information (bio, social media links)</li>
              <li>Campaign and proposal data</li>
              <li>Communication data</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our services</li>
              <li>Process transactions</li>
              <li>Send notifications and updates</li>
              <li>Improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>3. Data Storage and Security</h2>
            <p>
              We use Supabase for secure data storage and authentication. Your
              data is encrypted and protected using industry-standard security
              measures.
            </p>

            <h2>4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li>Supabase for authentication and database</li>
              <li>Twitter API for influencer insights</li>
              <li>Solana wallet integration for payments</li>
            </ul>

            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of communications</li>
            </ul>

            <h2>6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to improve your
              experience on our platform. You can control cookie settings
              through your browser preferences.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at support@kreatorboard.com
            </p>

            <div className="mt-8 text-center">
              <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                View Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
