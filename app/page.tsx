import type { Metadata } from "next";
import LandingShell from "./_components/landing/LandingShell";

export const metadata: Metadata = {
  title: "MenuQR — Digital Menus & Reservations for Restaurants in Portugal",
  description:
    "Stop losing reservations. Help tourists understand your menu. QR digital menu and online reservations for restaurants. Setup in 72 hours. First 7 days free.",
};

export default function LandingPage() {
  return <LandingShell />;
}
