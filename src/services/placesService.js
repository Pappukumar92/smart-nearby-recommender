import { getDistanceKm } from "../utils/distance";

export function normalizePlacesData(results, center) {
  return results.map((p) => {
    const lat = p.geometry.location.lat();
    const lng = p.geometry.location.lng();

    return {
      id: p.place_id,
      name: p.name,
      rating: p.rating || 0,
      userRatingsTotal: p.user_ratings_total || 0,
      priceLevel: p.price_level ?? null,
      openNow: p.opening_hours?.open_now ?? null,
      address: p.vicinity || "",
      location: { lat, lng },
      distanceKm: getDistanceKm(center.lat, center.lng, lat, lng),
    };
  });
}
