import React from "react";
export default function PlacesList({ places, onSelect }) {
  return (
    <div className="card">
      <div className="row-between">
        <h3 className="card-title" style={{ margin: 0 }}>
          Recommended Places
        </h3>
        <span className="tag">⭐ {places.length} results</span>
      </div>

      <div className="places">
        {places.length === 0 ? (
          <div className="small">No places found. Try another keyword.</div>
        ) : (
          places.map((p) => (
            <div key={p.id} className="place-card" onClick={() => onSelect(p)}>
              <div className="place-head">
                <div className="place-name">{p.name}</div>
                <span className="tag">{p.distanceKm.toFixed(2)} km</span>
              </div>

              <div className="small">
                ⭐ {p.rating} ({p.userRatingsTotal} reviews)
              </div>

              <div className="small">
                {p.openNow === true ? "🟢 Open" : p.openNow === false ? "🔴 Closed" : "⚪ Unknown"}
              </div>

              <div className="small">{p.address}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
