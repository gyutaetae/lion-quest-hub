import type { Metadata } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "./providers";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "My Lion App",
  description: "싸이월드 감성의 성장 사자 미니홈피",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} ${spaceGrotesk.variable} min-h-screen bg-background`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
