import React from "react";
export default function Filters({ filters, setFilters, onLocate, onSearch }) {
  return (
    <div className="card">
      <h3 className="card-title">Filters</h3>

      <label>Mood</label>
      <select
        value={filters.mood}
        onChange={(e) => setFilters({ ...filters, mood: e.target.value })}
      >
        <option value="work">Work</option>
        <option value="date">Date</option>
        <option value="quickBite">Quick Bite</option>
        <option value="budget">Budget</option>
      </select>

      <label>Radius</label>
      <select
        value={filters.radius}
        onChange={(e) => setFilters({ ...filters, radius: Number(e.target.value) })}
      >
        <option value={3000}>3 KM</option>
        <option value={5000}>5 KM</option>
        <option value={10000}>10 KM</option>
        <option value={20000}>20 KM</option>
      </select>

      <label>Keyword (Optional)</label>
      <input
        value={filters.keyword}
        onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
        placeholder="eg: biryani, cafe, gym, hospital, atm..."
      />

      <div className="checkbox">
        <input
          type="checkbox"
          checked={filters.openNow}
          onChange={(e) => setFilters({ ...filters, openNow: e.target.checked })}
        />
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
          Open now
        </span>
      </div>

      <label>Min Rating: {filters.minRating}</label>
      <input
        className="slider"
        type="range"
        min="0"
        max="5"
        step="0.5"
        value={filters.minRating}
        onChange={(e) =>
          setFilters({ ...filters, minRating: Number(e.target.value) })
        }
      />

      <label>Max Price Level: {filters.maxPrice}</label>
      <input
        className="slider"
        type="range"
        min="0"
        max="4"
        step="1"
        value={filters.maxPrice}
        onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
      />

      <label>Sort By</label>
      <select
        value={filters.sortBy}
        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
      >
        <option value="distance">Distance</option>
        <option value="rating">Rating</option>
        <option value="reviews">Reviews</option>
      </select>

      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn btn-soft" onClick={onLocate}>
          📍 Use My Location
        </button>
        <button className="btn btn-primary" onClick={onSearch}>
          🔎 Search
        </button>
      </div>
    </div>
  );
}
