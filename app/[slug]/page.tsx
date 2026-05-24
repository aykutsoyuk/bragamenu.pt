import { fetchMenu, groupByCategory } from "@/lib/sheets";
import { getRestaurant } from "@/lib/restaurants";
import MenuView from "./_components/MenuView";

export const revalidate = 300;

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurant(slug);
  const items = await fetchMenu();
  const categories = groupByCategory(items);

  return <MenuView restaurant={restaurant} categories={categories} />;
}
