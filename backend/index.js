import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Backend is running ✅" });
});

/**
 * Helper for safe radius
 */
function getSafeRadius(radius) {
  const r = Number(radius);
  return Math.min(Math.max(isNaN(r) ? 4000 : r, 500), 50000); // 0.5km - 50km
}

/**
 * ✅ 1) Nearby Search (Types based)
 * POST /api/places/nearby
 * Body: { lat, lng, radius, includedTypes }
 */
app.post("/api/places/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 4000, includedTypes = ["restaurant"] } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({
        error: { message: "lat and lng are required" },
      });
    }

    const safeRadius = getSafeRadius(radius);
    const url = "https://places.googleapis.com/v1/places:searchNearby";

    const makePayload = (cLat, cLng, r) => ({
      includedTypes,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: cLat, longitude: cLng },
          radius: r,
        },
      },
    });

    const runSearch = async (cLat, cLng, r) => {
      const payload = makePayload(cLat, cLng, r);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) return { error: data };
      return { places: data.places || [] };
    };

    console.log("Nearby Search:", { lat, lng, safeRadius, includedTypes });

    // ✅ Small radius single search
    if (safeRadius <= 4000) {
      const single = await runSearch(lat, lng, safeRadius);

      if (single.error) {
        console.error("Google Nearby Error:", JSON.stringify(single.error, null, 2));
        return res.status(400).json(single.error);
      }

      return res.json({ places: single.places });
    }

    // ✅ Bigger radius split into 4 searches (5km+ stable)
    const step = safeRadius / 2;
    const km = step / 1000;

    const latOffset = km / 111;
    const lngOffset = km / (111 * Math.cos((lat * Math.PI) / 180));

    const centers = [
      { lat: lat + latOffset, lng: lng + lngOffset },
      { lat: lat + latOffset, lng: lng - lngOffset },
      { lat: lat - latOffset, lng: lng + lngOffset },
      { lat: lat - latOffset, lng: lng - lngOffset },
    ];

    let allPlaces = [];

    for (const c of centers) {
      const r = await runSearch(c.lat, c.lng, 3000);
      if (r.places?.length) allPlaces.push(...r.places);
    }

    // ✅ remove duplicates
    const unique = new Map();
    for (const p of allPlaces) unique.set(p.id, p);

    return res.json({ places: [...unique.values()] });
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).json({
      error: { message: "Internal server error" },
    });
  }
});

/**
 * ✅ 2) Text Search (Keyword based)
 * POST /api/places/textsearch
 * Body: { lat, lng, radius, query }
 *
 * ✅ Gym / hospital / biryani etc will work here
 */
app.post("/api/places/textsearch", async (req, res) => {
  try {
    const { lat, lng, radius = 5000, query } = req.body;

    if (!lat || !lng || !query) {
      return res.status(400).json({
        error: { message: "lat, lng and query are required" },
      });
    }

    const safeRadius = getSafeRadius(radius);

    const url = "https://places.googleapis.com/v1/places:searchText";

    const payload = {
      textQuery: String(query),
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: safeRadius,
        },
      },
    };

    console.log("Text Search:", { lat, lng, safeRadius, query });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google TextSearch Error:", JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }

    return res.json({ places: data.places || [] });
  } catch (err) {
    console.error("TextSearch backend error:", err);
    return res.status(500).json({
      error: { message: "Internal server error" },
    });
  }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
