import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Photriya Studios - Photography Booking",
  description: "Photriya Studios is a premier photography studio in Hyderabad, Telangana with 664+ Google reviews. Book professional photography and videography sessions online.",
  openGraph: {
title: "Photriya Studios - Photography Booking",
    description: "Photriya Studios is a premier photography studio in Hyderabad, Telangana with 664+ Google reviews. Book professional photography and videography sessions online.",
    siteName: "Photriya Studios",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
