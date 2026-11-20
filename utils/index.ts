export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type DistanceUnit = "km" | "miles" | "meters";

const EARTH_RADIUS: Record<DistanceUnit, number> = {
  km: 6371,
  miles: 3958.8,
  meters: 6371000,
};

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Calculates the great-circle distance between two points using the Haversine formula.
 */
export function calculateHaversineDistance(
  point1: Coordinates,
  point2: Coordinates,
  unit: DistanceUnit = "km",
): number {
  if (
    point1.latitude === point2.latitude &&
    point1.longitude === point2.longitude
  ) {
    return 0;
  }

  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS[unit] * c;
}

// "4-VIC" -> "4", "27X" -> "27", "28X" -> "28"
const baseRoute = (routeId: string) =>
  routeId.split("-")[0].replace(/[A-Za-z]+$/, "");

export interface RouteGroup {
  key: string;
  routeName: string;
  buses: Bus[]; // nearest first
  distance: number; // km from user to nearest bus in the group
}

export function groupByRoute(
  buses: Bus[],
  origin: { latitude: number; longitude: number },
): RouteGroup[] {
  const map = new Map<string, RouteGroup>();
  for (const bus of buses) {
    const routeId = bus.vehicle.trip?.route_id;
    if (!routeId) continue;
    const key = baseRoute(routeId);
    const group = map.get(key);
    if (group) {
      group.buses.push(bus);
    } else {
      map.set(key, {
        key,
        routeName: bus.vehicle.routeName,
        buses: [bus],
        distance: calculateHaversineDistance(origin, {
          latitude: bus.vehicle.position?.latitude,
          longitude: bus.vehicle.position?.longitude,
        }),
      });
    }
  }
  // `buses` arrives sorted nearest first, so insertion order is
  // already nearest group first
  return [...map.values()];
}

export function getClosestStops(
  bus: BusSchedule | undefined | null,
  location: { latitude: number; longitude: number } | null,
): Map<string, Stop> {
  const newObj = new Map<string, Stop>();

  if (location && bus && bus.stops) {
    const sortedStops = [...bus.stops].sort((a, b) => {
      const cords = location;
      const cords2 = {
        latitude: a.stop_lat,
        longitude: a.stop_long,
      };
      const cords3 = {
        latitude: b.stop_lat,
        longitude: b.stop_long,
      };
      const distA = calculateHaversineDistance(cords, cords2);
      const distB = calculateHaversineDistance(cords, cords3);
      return distA - distB;
    });

    let min = 0;
    let closest = sortedStops[0];
    for (const val of sortedStops) {
      const at = new Date(val.arrival_time);
      const ct = new Date();
      const tempMin = at.getSeconds() - ct.getSeconds();
      if (tempMin > 0 && tempMin < min) {
        closest = val;
      }
      newObj.set(`${bus.route_id}${bus.trip_id}`, closest);
    }
  }

  return newObj;
}

export function calculateMinutesToStop(
  gbus: Bus,
  location: { latitude: number; longitude: number } | null,
): number | undefined {
  if (!location || !gbus.vehicle.trip) return undefined;
  const stopsMap = getClosestStops(gbus.vehicle.trip, location);
  const stop = stopsMap.get(
    `${gbus.vehicle.trip.route_id}${gbus.vehicle.trip.trip_id}`,
  );
  if (!stop) return undefined;

  const km = calculateHaversineDistance(
    {
      latitude: gbus.vehicle.position.latitude,
      longitude: gbus.vehicle.position.longitude,
    },
    { latitude: stop.stop_lat, longitude: stop.stop_long },
  );
  const speed = gbus.vehicle.position.speed || 8; // m/s
  return Math.round((km * 1000) / speed / 60);
}

export function getDirectionalBuses(
  buses: Bus[],
  location: { latitude: number; longitude: number } | null,
): Bus[] {
  if (!buses || buses.length === 0) return [];

  const directionMap = new Map<
    string | number,
    { bus: Bus; minutes: number }
  >();

  for (const bus of buses) {
    const directionKey =
      bus.vehicle.trip?.direction_id ??
      bus.vehicle.trip?.trip_headsign ??
      "default";
    const minutes = calculateMinutesToStop(bus, location) ?? Infinity;

    const existing = directionMap.get(directionKey);
    if (!existing || minutes < existing.minutes) {
      directionMap.set(directionKey, { bus, minutes });
    }
  }

  return [...directionMap.values()]
    .sort((a, b) => a.minutes - b.minutes)
    .map((item) => item.bus);
}
