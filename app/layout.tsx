import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kumar Lifespaces Parv | A Cinematic WIN Experience",
  description:
    "Explore Kumar Lifespaces Parv — 2 & 3 BHK premium homes at Moshi, Pune — through an immersive cinematic experience.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Kumar Lifespaces Parv",
    description: "2 & 3 BHK premium homes at Moshi, Pune.",
    images: ["/parv-social.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
