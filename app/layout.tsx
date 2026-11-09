import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Sparkle Jewelry | 1-Gram Gold & Anti-Tarnish Jewellery",
  description: "Shop 1-Gram micro gold traditional jewellery and waterproof anti-tarnish daily wear with local same-day delivery in Sullia and express Karnataka shipping.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} overflow-x-hidden w-full max-w-full`}>
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-[#faf8f5] text-stone-900 antialiased font-sans selection:bg-amber-200">
        {children}
      </body>
    </html>
  );
}
