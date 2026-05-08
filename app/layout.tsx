import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/nav/BottomNav";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "מערך רחפנים",
  description: "ניהול מערך רחפנים פלוגתי",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-foreground">
        <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
