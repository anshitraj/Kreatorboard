import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 prose max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Kreatorboard, you agree to be bound by
              these Terms of Service and all applicable laws and regulations.
            </p>

            <h2>2. User Accounts</h2>
            <p>
              You must be at least 18 years old to use Kreatorboard. You are
              responsible for maintaining the confidentiality of your account
              information.
            </p>

            <h2>3. Platform Rules</h2>
            <p>
              Users must not engage in any activity that violates these terms or
              applicable laws. This includes but is not limited to:
            </p>
            <ul>
              <li>Posting false or misleading information</li>
              <li>Harassing other users</li>
              <li>Violating intellectual property rights</li>
              <li>Attempting to manipulate the platform</li>
            </ul>

            <h2>4. Content Guidelines</h2>
            <p>
              All content posted on Kreatorboard must be appropriate and comply
              with our community guidelines. We reserve the right to remove any
              content that violates these guidelines.
            </p>

            <h2>5. Payment Terms</h2>
            <p>
              For campaigns and transactions conducted through Kreatorboard, all
              payments are processed securely through our platform. Users agree
              to pay all applicable fees and charges.
            </p>

            <h2>6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend accounts that violate
              these terms or engage in fraudulent activity.
            </p>

            <h2>7. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the
              platform after changes constitutes acceptance of the modified
              terms.
            </p>

            <div className="mt-8 text-center">
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-800"
              >
                View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
