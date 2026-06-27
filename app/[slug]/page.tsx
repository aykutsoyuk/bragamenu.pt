import { notFound } from "next/navigation";
import { getRestaurant, toBranding } from "@/lib/restaurants";
import HomeHero from "@/app/_components/HomeHero";

export default async function RestaurantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurant(slug);
  if (!restaurant) notFound();

  return <HomeHero restaurant={toBranding(restaurant)} />;
}
