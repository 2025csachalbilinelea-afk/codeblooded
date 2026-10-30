/**
 * HARVESTROUTE PHASE 5: REAL ROAD DISTANCE & ROUTING SERVICE
 * Computes authentic road distance and driving travel time via OSRM (Open Source Routing Machine).
 * Provides robust caching, timeout protection, and explicit ROUTED vs FALLBACK_UNAVAILABLE status.
 * Strictly adheres to rule: Never equate straight-line distance to road distance without clear notice.
 */

import { RoadRouteResult } from '../types/marketDiscovery';
import { calculateHaversineDistance } from '../data/nationalMandis';

const ROUTE_CACHE_KEY = 'harvestroute_osrm_route_cache_v1';
const DEFAULT_OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * In-memory route cache for fast lookup during multi-mandi ranking.
 */
const inMemoryRouteCache = new Map<string, RoadRouteResult>();

function buildRouteCacheKey(lat1: number, lon1: number, lat2: number, lon2: number): string {
  return `${lat1.toFixed(3)},${lon1.toFixed(3)}->${lat2.toFixed(3)},${lon2.toFixed(3)}`;
}

/**
 * Loads route cache from localStorage if available.
 */
function readStorageRoute(key: string): RoadRouteResult | null {
  if (inMemoryRouteCache.has(key)) {
    return inMemoryRouteCache.get(key)!;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(ROUTE_CACHE_KEY);
      if (raw) {
        const store = JSON.parse(raw);
        if (store[key]) {
          inMemoryRouteCache.set(key, store[key]);
          return store[key];
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
  return null;
}

/**
 * Writes route to in-memory and persistent cache.
 */
function writeStorageRoute(key: string, result: RoadRouteResult): void {
  inMemoryRouteCache.set(key, result);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(ROUTE_CACHE_KEY);
      const store = raw ? JSON.parse(raw) : {};
      store[key] = result;
      // Keep store under 200 entries
      const keys = Object.keys(store);
      if (keys.length > 200) {
        delete store[keys[0]];
      }
      localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(store));
    } catch {
      // Ignore quota errors
    }
  }
}

/**
 * Calculates road routing between farmer coordinates and market coordinates.
 * Returns authentic road distance in km and estimated driving time in hours.
 */
export async function calculateRoadRoute(
  farmerLat: number,
  farmerLng: number,
  marketLat: number,
  marketLng: number,
  customOsrmUrl?: string
): Promise<RoadRouteResult> {
  const straightDistance = calculateHaversineDistance(farmerLat, farmerLng, marketLat, marketLng);
  const cacheKey = buildRouteCacheKey(farmerLat, farmerLng, marketLat, marketLng);

  // Check cache first
  const cached = readStorageRoute(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  // Base OSRM endpoint (configurable via env)
  const baseUrl =
    customOsrmUrl ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_OSRM_ROUTING_URL
      : undefined) ||
    DEFAULT_OSRM_BASE_URL;

  // Format: {longitude},{latitude};{longitude},{latitude}?overview=false
  const osrmUrl = `${baseUrl}/${farmerLng},${farmerLat};${marketLng},${marketLat}?overview=false&alternatives=false&steps=false`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(osrmUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const roadDistanceKm = Math.round((route.distance / 1000) * 10) / 10;
        const estimatedTravelTimeHours = Math.round((route.duration / 3600) * 10) / 10;

        const result: RoadRouteResult = {
          roadDistanceKm,
          estimatedTravelTimeHours,
          routingStatus: 'ROUTED',
          routeSource: 'OSRM',
          straightLineDistanceKm: straightDistance,
          cached: false,
        };

        writeStorageRoute(cacheKey, result);
        return result;
      }
    }
  } catch {
    // Network failure, timeout, or blocked
  }

  // Explicit Fallback: When OSRM is unreachable, we provide an estimated road distance
  // based on standard Indian highway circuity ratio (typically 1.25 - 1.35x straight-line),
  // but explicitly flag status as FALLBACK_UNAVAILABLE so the farmer and UI are never misled!
  const circuityFactor = 1.3;
  const estimatedRoadKm = Math.round(straightDistance * circuityFactor * 10) / 10;
  // Average road speed for rural India cargo transport is ~40 km/h
  const estimatedHours = Math.round((estimatedRoadKm / 40) * 10) / 10;

  const fallbackResult: RoadRouteResult = {
    roadDistanceKm: estimatedRoadKm,
    estimatedTravelTimeHours: estimatedHours,
    routingStatus: 'FALLBACK_UNAVAILABLE',
    routeSource: 'FALLBACK_UNAVAILABLE',
    straightLineDistanceKm: straightDistance,
    cached: false,
  };

  return fallbackResult;
}

/**
 * Computes road routes for multiple candidate markets in parallel with error isolation.
 */
export async function calculateBatchRoadRoutes(
  farmerLat: number,
  farmerLng: number,
  markets: { marketId: string; latitude: number; longitude: number }[]
): Promise<Map<string, RoadRouteResult>> {
  const resultMap = new Map<string, RoadRouteResult>();

  const promises = markets.map(async (m) => {
    const route = await calculateRoadRoute(farmerLat, farmerLng, m.latitude, m.longitude);
    resultMap.set(m.marketId, route);
  });

  await Promise.allSettled(promises);
  return resultMap;
}

