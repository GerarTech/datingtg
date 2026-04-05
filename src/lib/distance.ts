/**
 * Utility functions for calculating distances between geographic coordinates
 */

/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees  
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance as a human-readable string
 * @param distanceInKm Distance in kilometers
 * @returns Formatted distance string (e.g., "2 km away", "500 m away")
 */
export function formatDistance(distanceInKm: number): string {
  if (distanceInKm < 1) {
    const meters = Math.round(distanceInKm * 1000);
    return `${meters} m away`;
  } else if (distanceInKm < 10) {
    return `${distanceInKm.toFixed(1)} km away`;
  } else {
    return `${Math.round(distanceInKm)} km away`;
  }
}

/**
 * Calculate and format distance between two users
 * @param user1 First user with latitude/longitude
 * @param user2 Second user with latitude/longitude
 * @returns Formatted distance string or null if coordinates are missing
 */
export function getDistanceBetweenUsers(
  user1: { latitude?: number; longitude?: number },
  user2: { latitude?: number; longitude?: number }
): string | null {
  if (
    user1.latitude == null ||
    user1.longitude == null ||
    user2.latitude == null ||
    user2.longitude == null
  ) {
    return null;
  }
  
  const distance = calculateDistance(
    user1.latitude,
    user1.longitude,
    user2.latitude,
    user2.longitude
  );
  
  return formatDistance(distance);
}
