import type { Metadata } from "next";
import Script from "next/script";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { ScrollProgress } from "@/components/shell/ScrollProgress";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const themeInit = `
(() => {
  const root = document.documentElement;
  try {
    const stored = localStorage.getItem("portfolio-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const theme = stored === "light" || stored === "dark" ? stored : preferred;
    root.classList.add("theme-" + theme);
    root.dataset.theme = theme;
  } catch {
    root.classList.add("theme-light");
    root.dataset.theme = "light";
  }
})();
`;

export const metadata: Metadata = {
  title: "Piyush Raj — Backend Systems Engineer",
  description:
    "Piyush Raj builds real-time, event-driven and distributed systems. Projects, architecture and engineering decisions.",
  metadataBase: new URL("https://piyushrajdev.github.io"),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "Piyush Raj — Backend Systems Engineer",
    description:
      "Engineering systems where latency, state, concurrency and failure are part of the design.",
    url: "https://piyushrajdev.github.io",
    siteName: "Piyush Raj",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Piyush Raj — Backend Systems Engineer",
    description:
      "Engineering systems where latency, state, concurrency and failure are part of the design.",
    images: ["/opengraph-image"],
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
      className={`${instrumentSans.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="portfolio-theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
      </head>
      <body>
        <MotionProvider>
          <ScrollProgress />
          <main id="content">{children}</main>
        </MotionProvider>
      </body>
    </html>
  );
}
