import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "데이터 분석 교실",
  description: "중학교 정보 수업을 위한 데이터 분석·시각화 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-white text-zinc-900 font-sans">
        {children}
      </body>
    </html>
  );
}
