import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-sans-display",
  subsets: ["latin"],
  display: "swap",
});

const serif = Cormorant_Garamond({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Braga Menu — Digital Restaurant Menu",
  description:
    "A modern, minimal QR menu for restaurants in Portugal. Built for tourists, brunchers, and curious diners.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a08" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Runs before paint to avoid a light-to-dark flash on reload for users
// who previously chose the dark theme.
const themeBootstrap = `try{var t=localStorage.getItem('bm:theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
