// Helper to normalize location fields across different possible keys.
// Returns { district, city, formatted } where values are strings or null.
export function normalizeLocation(place: any): { district: string | null; city: string | null; formatted: string } {
  if (!place || typeof place !== 'object') return { district: null, city: null, formatted: '' }

  const tryKeys = (obj: any, keys: string[]) => {
    if (!obj || typeof obj !== 'object') return null
    for (const k of keys) {
      if (k in obj) {
        const v = obj[k]
        if (typeof v === 'string' && v.trim()) return v.trim()
      }
    }
    return null
  }

  const district = tryKeys(place, ['district', 'region', 'state'])
    ?? (typeof place.submittedBy === 'object' ? tryKeys(place.submittedBy, ['district', 'region', 'state']) : null)

  const city = tryKeys(place, ['city', 'cityTown', 'city_town', 'city/town', 'town'])
    ?? (typeof place.submittedBy === 'object' ? tryKeys(place.submittedBy, ['city', 'town']) : null)

  const parts = [] as string[]
  if (district) parts.push(district)
  if (city && city !== district) parts.push(city)

  return { district: district ?? null, city: city ?? null, formatted: parts.join(', ') }
}

export default normalizeLocation

