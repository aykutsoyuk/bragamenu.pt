import { notFound } from "next/navigation";
import { getRestaurant, toSheetCtx } from "@/lib/restaurants";
import { fetchReservations } from "@/lib/googleSheets";
import { listRecentServiceRequests } from "@/lib/serviceRequests";
import { nowInRestaurant } from "@/lib/reservations";
import Dashboard from "./_components/Dashboard";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { slug } = await params;
  const { key } = await searchParams;

  const restaurant = getRestaurant(slug);
  if (!restaurant) notFound();
  if (!key || key !== restaurant.dashboardKey) notFound();

  const ctx = toSheetCtx(restaurant);
  const today = nowInRestaurant().date;

  let initialReservations: Awaited<ReturnType<typeof fetchReservations>> = [];
  let initialRequests: Awaited<ReturnType<typeof listRecentServiceRequests>> = [];

  try {
    [initialReservations, initialRequests] = await Promise.all([
      fetchReservations(ctx),
      listRecentServiceRequests(ctx),
    ]);
  } catch {
    // Dashboard renders with empty data if Sheets is down; client polls will retry.
  }

  const todayReservations = initialReservations
    .filter((r) => r.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Dashboard
      slug={slug}
      dashboardKey={key}
      restaurantName={restaurant.name}
      initialReservations={todayReservations}
      initialRequests={initialRequests}
      today={today}
    />
  );
}
