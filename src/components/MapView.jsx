import React from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

export default function MapView({
  center,
  places,
  selectedPlace,
  setSelectedPlace,
}) {
  return (
    <div className="mapWrap">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "78vh" }}
        center={center}
        zoom={14}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          zoomControl: true,
        }}
      >
        {/* ✅ User Marker */}
        <Marker position={center} label="You" />

        {/* ✅ Places Markers */}
        {places.map((p) => (
          <Marker
            key={p.id}
            position={p.location}
            onClick={() => setSelectedPlace(p)}
          />
        ))}

        {/* ✅ InfoWindow */}
        {selectedPlace && (
          <InfoWindow
            position={selectedPlace.location}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div style={{ maxWidth: 220 }}>
              <div style={{ fontWeight: 900, fontSize: 14 }}>
                {selectedPlace.name}
              </div>

              <div style={{ marginTop: 6, fontSize: 12, color: "#111" }}>
                ⭐ {selectedPlace.rating} ({selectedPlace.userRatingsTotal} reviews)
              </div>

              <div style={{ marginTop: 6, fontSize: 12, color: "#444" }}>
                {selectedPlace.address}
              </div>

              <div style={{ marginTop: 10 }}>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.location.lat},${selectedPlace.location.lng}&query_place_id=${selectedPlace.id}`}
                  style={{
                    display: "inline-block",
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: "#7c3aed",
                    color: "white",
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  🚗 Directions
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
