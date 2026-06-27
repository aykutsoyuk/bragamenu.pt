import { notFound } from "next/navigation";
import { fetchMenu, groupByCategory } from "@/lib/sheets";
import { getRestaurant, toBranding } from "@/lib/restaurants";
import MenuView from "../_components/MenuView";

export const revalidate = 300;

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurant(slug);
  if (!restaurant) notFound();

  let items;
  try {
    items = await fetchMenu(restaurant.menuUrl);
  } catch {
    notFound();
  }
  const categories = groupByCategory(items ?? []);

  return <MenuView restaurant={toBranding(restaurant)} categories={categories} />;
}
