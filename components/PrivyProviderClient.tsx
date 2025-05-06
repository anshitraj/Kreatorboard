"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function PrivyProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        loginMethods: ["wallet", "email"],
        appearance: {
          theme: "light",
          logo: "/logo.svg",
          accentColor: "#6C63FF",
          showWalletLoginFirst: false,
          privacyPolicyUrl: "/legal/privacy",
          termsAndConditionsUrl: "/legal/terms",
        },
      }}
      onSuccess={(user: any) => console.log("Logged in!", user)}
    >
      {children}
    </PrivyProvider>
  );
}
