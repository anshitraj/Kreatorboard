export default function Terms() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
      <div className="prose prose-sm text-gray-700">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
        <p>
          Welcome to Kreatorboard. By accessing our platform, you agree to these
          terms and conditions. Please read them carefully before using our
          services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">2. Definitions</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>"Platform" refers to Kreatorboard's website and services</li>
          <li>"User" refers to any individual or entity using our platform</li>
          <li>
            "Content" refers to any information, text, or materials shared on
            the platform
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          3. User Responsibilities
        </h2>
        <p>
          Users are responsible for maintaining the confidentiality of their
          account information and for all activities that occur under their
          account.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          4. Intellectual Property
        </h2>
        <p>
          All content and materials available on Kreatorboard are protected by
          intellectual property rights. Users may not use, reproduce, or
          distribute any content without explicit permission.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          5. Limitation of Liability
        </h2>
        <p>
          Kreatorboard shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages resulting from your use of
          the platform.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">6. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Users will be
          notified of any significant changes.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          7. Contact Information
        </h2>
        <p>
          For any questions regarding these terms, please contact us at:
          support@kreatorboard.com
        </p>
      </div>
    </div>
  );
}
