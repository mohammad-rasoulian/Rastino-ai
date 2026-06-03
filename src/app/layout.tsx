import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "راستینو | دستیار هوشمند فارسی برای همه",
    template: "%s | راستینو",
  },
  description:
    "راستینو یک دستیار هوشمند فارسی برای چت، نوشتن متن، خلاصه‌سازی، ایده‌پردازی، کدنویسی، تحلیل و تولید تصویر است.",
  applicationName: "راستینو",
  keywords: [
    "راستینو",
    "هوش مصنوعی فارسی",
    "چت بات فارسی",
    "دستیار هوشمند",
    "تولید محتوا با هوش مصنوعی",
    "خلاصه سازی متن",
    "تولید تصویر با هوش مصنوعی",
    "AI فارسی",
    "چت جی پی تی فارسی",
  ],
  authors: [{ name: "Rastino" }],
  creator: "Rastino",
  publisher: "Rastino",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "راستینو | دستیار هوشمند فارسی برای همه",
    description:
      "با راستینو سریع‌تر بنویس، تحلیل کن، ایده بساز، کدنویسی کن و تصویر تولید کن.",
    url: siteUrl,
    siteName: "راستینو",
    locale: "fa_IR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "راستینو | دستیار هوشمند فارسی برای همه",
    description:
      "دستیار هوشمند فارسی برای چت، نوشتن، تحلیل، کدنویسی و تولید تصویر.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070707",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "راستینو",
    applicationCategory: "AIApplication",
    operatingSystem: "Web",
    description:
      "راستینو یک دستیار هوشمند فارسی برای چت، نوشتن متن، خلاصه‌سازی، ایده‌پردازی، کدنویسی، تحلیل و تولید تصویر است.",
    url: siteUrl,
    inLanguage: "fa-IR",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
    },
  };

  return (
    <html lang="fa-IR" dir="rtl">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        {children}
      </body>
    </html>
  );
}
