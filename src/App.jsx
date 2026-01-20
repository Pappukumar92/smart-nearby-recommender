import React, { useMemo, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

import Filters from "./components/Filters";
import PlacesList from "./components/PlacesList";
import MapView from "./components/MapView";

import { moodPresets } from "./utils/moodPresets";
import { getDistanceKm } from "./utils/distance";
import { resolveIncludedTypes } from "./utils/typeResolver";

const libraries = ["places"];

export default function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 }); // Delhi default
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [filters, setFilters] = useState({
    mood: "work",
    radius: 3000,
    keyword: "",
    openNow: true,
    minRating: 3.5,
    maxPrice: 4,
    sortBy: "distance",
  });

  const computedFilters = useMemo(() => {
    const preset = moodPresets[filters.mood] || {};
    return { ...filters, ...preset };
  }, [filters]);

  // ✅ Locate user
  const locateMe = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: Number(pos.coords.latitude),
          lng: Number(pos.coords.longitude),
        });
        setStatusMsg("📍 Location updated!");
      },
      () => alert("Location permission denied")
    );
  };

  const clearResults = () => {
    setPlaces([]);
    setSelectedPlace(null);
    setStatusMsg("Cleared results ✅");
  };

  // ✅ MAIN SEARCH
  const searchPlaces = async () => {
    const lat = Number(center?.lat);
    const lng = Number(center?.lng);

    if (!lat || !lng) {
      alert("Click 'Use My Location' first.");
      return;
    }

    const keyword = (computedFilters.keyword || "").trim();
    const radius = Number(computedFilters.radius);

    setIsSearching(true);
    setStatusMsg("Searching nearby places... ⏳");

    try {
      // ✅ if keyword typed => Text Search API
      const isTextSearch = keyword.length > 0;

      const endpoint = isTextSearch
        ? "http://localhost:5050/api/places/textsearch"
        : "http://localhost:5050/api/places/nearby";

      const body = isTextSearch
        ? {
            lat,
            lng,
            radius,
            query: keyword,
          }
        : {
            lat,
            lng,
            radius,
            includedTypes: resolveIncludedTypes({
              mood: computedFilters.mood,
              keyword: computedFilters.keyword,
            }),
          };

      console.log("Calling:", endpoint, body);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        alert(data?.error?.message || "Places API failed");
        setPlaces([]);
        setSelectedPlace(null);
        setStatusMsg("❌ Search failed. Check console (F12).");
        return;
      }

      const rawPlaces = data.places || [];

      const mapped = rawPlaces
        .map((p) => {
          const pLat = p.location?.latitude;
          const pLng = p.location?.longitude;

          if (typeof pLat !== "number" || typeof pLng !== "number") return null;

          return {
            id: p.id,
            name: p.displayName?.text || "Unknown",
            rating: p.rating || 0,
            userRatingsTotal: p.userRatingCount || 0,
            priceLevel: p.priceLevel ?? null,
            openNow: p.regularOpeningHours?.openNow ?? null,
            address: p.formattedAddress || "",
            location: { lat: pLat, lng: pLng },
            distanceKm: getDistanceKm(lat, lng, pLat, pLng),
          };
        })
        .filter(Boolean)
        .filter((p) => {
          // ✅ openNow filter
          if (!computedFilters.openNow) return true;
          if (p.openNow === null) return true;
          return p.openNow === true;
        });

      setPlaces(mapped);
      setSelectedPlace(mapped[0] || null);

      if (mapped.length === 0) {
        setStatusMsg("No places found. Try another keyword/radius.");
      } else {
        setStatusMsg(`✅ Found ${mapped.length} places`);
      }
    } catch (err) {
      console.error("Search failed:", err);
      alert("Backend not running? Start backend on port 5050.");
      setPlaces([]);
      setSelectedPlace(null);
      setStatusMsg("❌ Backend error (5050 not running?)");
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ Sorting + rating/price filters
  const finalPlaces = useMemo(() => {
    let data = [...places];

    data = data.filter((p) => p.rating >= computedFilters.minRating);

    data = data.filter((p) => {
      if (p.priceLevel === null) return true;
      return p.priceLevel <= computedFilters.maxPrice;
    });

    if (computedFilters.sortBy === "distance") {
      data.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (computedFilters.sortBy === "rating") {
      data.sort((a, b) => b.rating - a.rating);
    } else if (computedFilters.sortBy === "reviews") {
      data.sort((a, b) => b.userRatingsTotal - a.userRatingsTotal);
    }

    return data;
  }, [places, computedFilters]);

  if (!isLoaded) {
    return (
      <div className="container">
        <div className="hero">
          <div>
            <h1>Smart Nearby Places Recommender</h1>
            <p>Loading Google Maps... ⏳</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* ✅ HERO */}
      <div className="hero">
        <div>
          <h1>Smart Nearby Places Recommender</h1>
          <p>
            Mood-based recommendations using Google Maps + Places API (Backend +
            New API)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className="badge">⚡ Portfolio Project • React + Maps</span>
          <button
            className="btn btn-soft"
            onClick={clearResults}
            disabled={isSearching}
            title="Clear list + map selection"
          >
            🧹 Clear
          </button>
        </div>
      </div>

      {/* ✅ STATUS */}
      {statusMsg ? (
        <div style={{ marginTop: 12 }} className="badge">
          {isSearching ? "⏳ " : "ℹ️ "} {statusMsg}
        </div>
      ) : null}

      {/* ✅ MAIN GRID */}
      <div className="grid">
        {/* LEFT */}
        <div>
          <Filters
            filters={filters}
            setFilters={setFilters}
            onLocate={locateMe}
            onSearch={searchPlaces}
          />

          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="card-title">Quick Actions</h3>

            <div className="row">
              <button
                className="btn btn-green"
                disabled={isSearching}
                onClick={searchPlaces}
                style={{ width: "100%" }}
              >
                {isSearching ? "Searching..." : "🚀 Search Now"}
              </button>
            </div>

            <div className="small" style={{ marginTop: 10 }}>
              Tip: <b>gym</b>, <b>biryani</b>, <b>hospital</b> keyword works via
              Text Search API.
            </div>
          </div>
        </div>

        {/* MIDDLE */}
        <PlacesList
  places={finalPlaces}
  onSelect={setSelectedPlace}
  selectedPlace={selectedPlace}
/>


        {/* RIGHT */}
        <MapView
          center={center}
          places={finalPlaces}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
        />
      </div>
    </div>
  );
}
