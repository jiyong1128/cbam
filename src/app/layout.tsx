import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cbam-korea.com"),
  title: {
    default: "CBAM Korea — EU 탄소국경조정 대응 플랫폼",
    template: "%s | CBAM Korea",
  },
  description:
    "EU에 철강·알루미늄·시멘트·비료를 수출하는 한국 제조사를 위한 CBAM 대상 판별, 배출량 계산, 인증서 비용 시뮬레이션 및 증빙 패키지 생성 플랫폼.",
  keywords: [
    "CBAM",
    "탄소국경조정메커니즘",
    "Carbon Border Adjustment Mechanism",
    "EU 수출",
    "배출계수",
    "철강 CBAM",
    "IR 2025/2621",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: "en_US",
    siteName: "CBAM Korea",
    title: "CBAM Korea — EU 탄소국경조정 대응 플랫폼",
    description: "CBAM 대상 판별부터 배출량 계산, 증빙 패키지 생성까지 한 번에.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
