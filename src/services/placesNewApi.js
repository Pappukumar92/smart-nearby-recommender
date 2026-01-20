export async function searchNearbyPlaces({ apiKey, center, radius, includedTypes }) {
  const url = "/places/v1/places:searchNearby";

  const body = {
    includedTypes,
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: {
          latitude: center.lat,
          longitude: center.lng,
        },
        radius: radius,
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Places API error:", data);
    throw new Error(data?.error?.message || "Places API failed");
  }

  return data.places || [];
}
