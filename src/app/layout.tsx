import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { FacebookMessenger } from "@/components/FacebookMessenger";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KShop - Mua sắm tinh chọn",
  description: "Khám phá sản phẩm đẹp, giá tốt và trải nghiệm mua sắm mượt mà",
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
          <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(230,83,47,0.14),transparent_34%),linear-gradient(180deg,#fffaf5_0%,#fff7ef_44%,#f7eee6_100%)]">
            {children}
          </main>
          <FacebookMessenger />
        </Providers>
      </body>
    </html>
  );
}
