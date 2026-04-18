import type { Metadata } from "next";

import { Providers } from "@/app/providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tea ☕",
    template: "%s | Tea ☕",
  },
  description:
    "A private AI journaling app for venting, reflecting, and calming down.",
  applicationName: "Tea",
  authors: [{ name: "Tea" }],
  creator: "Tea",
  publisher: "Tea",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Tea",
    title: "Tea ☕",
    description:
      "A private AI journaling app for venting, reflecting, and calming down.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Tea open graph preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tea ☕",
    description:
      "A private AI journaling app for venting, reflecting, and calming down.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
