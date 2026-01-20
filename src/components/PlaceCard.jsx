import React from "react";

export default function PlaceCard({ place, onSelect }) {
  return (
    <div
      onClick={() => onSelect(place)}
      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold">{place.name}</h3>

        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {place.distanceKm.toFixed(2)} km
        </span>
      </div>

      <div className="text-sm text-gray-600 mt-1">
        ⭐ {place.rating} ({place.userRatingsTotal} reviews)
      </div>

      <div className="text-sm text-gray-600">
        {place.openNow === null
          ? "Hours N/A"
          : place.openNow
          ? "✅ Open"
          : "❌ Closed"}
      </div>

      <div className="text-xs text-gray-500 mt-1">{place.address}</div>
    </div>
  );
}
