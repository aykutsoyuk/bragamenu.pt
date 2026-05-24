import { defaultRestaurantSlug, getRestaurant } from "@/lib/restaurants";
import HomeHero from "./_components/HomeHero";

export default function Home() {
  const restaurant = getRestaurant(defaultRestaurantSlug);
  return <HomeHero restaurant={restaurant} />;
}
