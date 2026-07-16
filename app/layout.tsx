import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
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
  metadataBase: new URL("https://menuqr.pt"),
  title: "MenuQR — Digital Menus & Reservations for Restaurants",
  description:
    "Stop losing reservations. Help tourists understand your menu. A simple digital QR menu and reservation system designed for busy restaurants in Portugal.",
  openGraph: {
    title: "MenuQR — Digital Menus & Reservations for Restaurants",
    description:
      "Stop losing reservations. Help tourists understand your menu. A simple digital QR menu and reservation system designed for busy restaurants in Portugal.",
    url: "https://menuqr.pt",
    siteName: "MenuQR",
    locale: "pt_PT",
    type: "website",
  },
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
        <Script id="theme-bootstrap" strategy="beforeInteractive">
          {themeBootstrap}
        </Script>
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
