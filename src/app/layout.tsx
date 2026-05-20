import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { FacebookMessenger } from "@/components/FacebookMessenger";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KShop - Cửa hàng trực tuyến",
  description: "Mua sắm trực tuyến với giá tốt nhất",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <FacebookMessenger />
        </Providers>
      </body>
    </html>
  );
}

