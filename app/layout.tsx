import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PrivyProviderClient from "@/components/PrivyProviderClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kreatorboard - Connect with Influencers",
  description: "Connect with influencers for your startup.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <PrivyProviderClient>{children}</PrivyProviderClient>
      </body>
    </html>
  );
}
