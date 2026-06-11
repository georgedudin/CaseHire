import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const display = Manrope({
  variable: "--font-display-src",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans-src",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "КейсПодбор — найм джунов в эпоху, когда результат больше не сигнал",
  description:
    "Платформа, которая измеряет не то, что джун производит, а то, как он работает. " +
    "Веб-IDE, два чата, матрица процесса, ловушка на работу с данными.",
  metadataBase: new URL("https://kejspodbor.ru"),
  openGraph: {
    title: "КейсПодбор · CaseHire",
    description:
      "Найм джунов, когда ИИ выровнял всех на старте. Мы измеряем процесс, не результат.",
    locale: "ru_RU",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
  // Accessibility: never block pinch-zoom on mobile.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <a href="#main" className="skip-link">
          Перейти к основному содержимому
        </a>
        {children}
      </body>
    </html>
  );
}
