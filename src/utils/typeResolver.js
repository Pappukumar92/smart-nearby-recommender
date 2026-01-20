// ✅ Keyword -> Places API (New) types mapping
const keywordTypeMap = [
  { keys: ["coffee", "cafe", "tea"], types: ["cafe"] },
  { keys: ["pizza", "burger", "biryani", "momos", "food", "restaurant"], types: ["restaurant"] },
  { keys: ["gym", "fitness"], types: ["gym"] },
  { keys: ["hospital", "clinic", "doctor"], types: ["hospital"] },
  { keys: ["medical", "pharmacy", "chemist"], types: ["pharmacy"] },
  { keys: ["atm", "bank"], types: ["atm"] },
  { keys: ["petrol", "gas", "pump"], types: ["gas_station"] },
  { keys: ["mall", "shopping"], types: ["shopping_mall"] },
  { keys: ["salon", "barber", "spa"], types: ["beauty_salon"] },
  { keys: ["hotel", "stay", "room"], types: ["lodging"] },
  { keys: ["school", "college"], types: ["school"] },
  { keys: ["park", "garden"], types: ["park"] },
];

export function resolveIncludedTypes({ mood, keyword }) {
  const text = (keyword || "").trim().toLowerCase();

  // ✅ If user typed keyword, map it
  if (text) {
    for (const row of keywordTypeMap) {
      if (row.keys.some((k) => text.includes(k))) {
        return row.types;
      }
    }
  }

  // ✅ Mood based default types
  if (mood === "work") return ["cafe"];
  if (mood === "date") return ["restaurant"];
  if (mood === "quickBite") return ["meal_takeaway", "restaurant"];
  if (mood === "budget") return ["restaurant"];

  return ["restaurant"];
}
