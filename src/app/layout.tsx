import type { Metadata } from "next";

import { Providers } from "@/app/providers";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vent 🌬️",
    template: "%s | Vent 🌬️",
  },
  description:
    "A private AI journaling app for venting, reflecting, and calming down.",
  applicationName: "Vent",
  authors: [{ name: "Vent" }],
  creator: "Vent",
  publisher: "Vent",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Vent",
    title: "Vent 🌬️",
    description:
      "A private AI journaling app for venting, reflecting, and calming down.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Vent open graph preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vent 🌬️",
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
