import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Piyush Raj — Backend Systems Engineer",
  description:
    "Piyush Raj builds real-time, event-driven and distributed systems. Projects, architecture and engineering decisions.",
  metadataBase: new URL("https://portfolio-raj-piyush.vercel.app"),
  openGraph: {
    title: "Piyush Raj — Backend Systems Engineer",
    description:
      "Engineering systems where latency, state, concurrency and failure are part of the design.",
    url: "https://portfolio-raj-piyush.vercel.app",
    siteName: "Piyush Raj",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Piyush Raj — Backend Systems Engineer",
    description:
      "Engineering systems where latency, state, concurrency and failure are part of the design.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${jetBrainsMono.variable}`}>
      <body>
        <MotionProvider>
          <ScrollProgress />
          <main id="content">{children}</main>
        </MotionProvider>
      </body>
    </html>
  );
}
