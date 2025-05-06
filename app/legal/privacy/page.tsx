export default function Privacy() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <div className="prose prose-sm text-gray-700">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          1. Information We Collect
        </h2>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Account information (email, wallet address)</li>
          <li>Profile information</li>
          <li>Communication preferences</li>
          <li>Transaction history</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          2. How We Use Your Information
        </h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide and maintain our services</li>
          <li>Process transactions</li>
          <li>Send you important updates</li>
          <li>Improve our platform</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          3. Information Sharing
        </h2>
        <p>
          We do not sell your personal information. We may share your
          information with:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Service providers who assist in our operations</li>
          <li>Legal authorities when required by law</li>
          <li>Other users as part of the platform&apos;s functionality</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal
          information from unauthorized access, alteration, or disclosure.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at: privacy@kreatorboard.com
        </p>
      </div>
    </div>
  );
}
