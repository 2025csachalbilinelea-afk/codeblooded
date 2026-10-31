/**
 * HARVESTROUTE PHASE 5: LIVE AGRICULTURAL PRICE INTEGRATION & CACHING SERVICE
 * Integrates official Government of India AGMARKNET daily market prices via Data.gov.in.
 * Provides commodity normalization, price freshness calculation, localStorage caching,
 * centralized single-source-of-truth price validation, and honest fallback handling.
 */

import {
  MarketPriceRecord,
  PriceFreshnessStatus,
  PriceSyncLog,
  PriceSourceType,
  ConfidenceIndicator,
  DiscoveryLevel,
  ApiErrorCategory,
} from '../types/marketDiscovery';
import {
  VERIFIED_AGMARKNET_PRICES,
} from '../data/agmarknetBenchmarks';
import {
  calculateHaversineDistance,
  getNationalMarketById,
  NEIGHBORING_STATES,
  PREMIER_NATIONAL_TERMINAL_HUBS,
  VERIFIED_NATIONAL_MANDIS,
} from '../data/nationalMandis';
import { RECENT_PRICE_HISTORY_SERIES } from '../data/recentPriceHistory';
import {
  normalizeCommodityForAgmarknet,
  isCommodityMatch,
  isMarketIdentityMatch,
  validateAndSanitizePrice,
  evaluatePriceFreshness,
  resolveValidatedPriceStatus,
} from './priceValidationService';
import { searchWebForCropPrices } from './webPriceDiscoveryService';

// Re-export validation utilities for backward compatibility
export {
  normalizeCommodityForAgmarknet,
  isCommodityMatch,
  isMarketIdentityMatch,
  validateAndSanitizePrice,
  evaluatePriceFreshness,
  resolveValidatedPriceStatus,
};

// Official Data.gov.in daily market arrival price catalog resource ID
export const DATA_GOV_IN_RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
export const DATA_GOV_IN_BASE_URL = 'https://api.data.gov.in/resource';

const CACHE_KEY = 'harvestroute_agmarknet_price_cache_v1';
const SYNC_LOGS_KEY = 'harvestroute_price_sync_logs_v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours TTL

export interface AgmarknetApiStatus {
  isAvailable: boolean;
  lastError?: string;
  lastSyncTime?: string;
}

let lastApiStatus: AgmarknetApiStatus = {
  isAvailable: true,
};

export function getAgmarknetApiStatus(): AgmarknetApiStatus {
  return { ...lastApiStatus };
}

export function setAgmarknetApiStatus(status: AgmarknetApiStatus): void {
  lastApiStatus = { ...status };
}

export function getEnvApiKey(apiKey?: string): string | undefined {
  if (apiKey) return apiKey;
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string> } })?.process;
  if (proc?.env?.VITE_DATA_GOV_IN_API_KEY) {
    return proc.env.VITE_DATA_GOV_IN_API_KEY;
  }
  try {
    const metaEnv = (new Function('return typeof import.meta !== "undefined" ? import.meta.env : undefined'))();
    return metaEnv?.VITE_DATA_GOV_IN_API_KEY;
  } catch {
    return undefined;
  }
}

/**
 * In-memory fallback cache for SSR/Node environments where localStorage may not exist.
 */
let inMemoryCache: Record<string, { record: MarketPriceRecord; cachedAt: number }> = {};
let inMemoryLogs: PriceSyncLog[] = [];

/**
 * Reads cached price records with strict market identity, commodity, and price sanity verification.
 */
export function getCachedPrice(marketId: string, commodity: string): MarketPriceRecord | null {
  const normCommodity = normalizeCommodityForAgmarknet(commodity).toLowerCase();
  const key = `${marketId}_${normCommodity}`;

  let candidate: { record: MarketPriceRecord; cachedAt: number } | null = null;

  // Check in-memory first
  if (inMemoryCache[key] && Date.now() - inMemoryCache[key].cachedAt < CACHE_TTL_MS) {
    candidate = inMemoryCache[key];
  } else if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const store = JSON.parse(raw);
        const entry = store[key];
        if (entry && Date.now() - entry.cachedAt < CACHE_TTL_MS) {
          inMemoryCache[key] = entry;
          candidate = entry;
        }
      }
    } catch {
      // Ignore storage read error
    }
  }

  if (candidate && candidate.record) {
    const validated = resolveValidatedPriceStatus({
      record: candidate.record,
      requestedCommodity: commodity,
      targetMarketId: marketId,
    });
    if (validated.isValid && validated.sanitizedRecord) {
      return validated.sanitizedRecord;
    }
  }

  return null;
}

/**
 * Saves validated price record to cache.
 */
export function setCachedPrice(record: MarketPriceRecord): void {
  const normCommodity = normalizeCommodityForAgmarknet(record.commodity).toLowerCase();
  const key = `${record.marketId}_${normCommodity}`;
  const entry = { record, cachedAt: Date.now() };

  inMemoryCache[key] = entry;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const store = raw ? JSON.parse(raw) : {};
      store[key] = entry;
      localStorage.setItem(CACHE_KEY, JSON.stringify(store));
    } catch {
      // Storage quota or parsing error
    }
  }
}

/**
 * Records a price sync operation for auditing and UI indicators.
 */
export function recordPriceSyncLog(log: Omit<PriceSyncLog, 'id'>): PriceSyncLog {
  const newLog: PriceSyncLog = {
    ...log,
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };

  inMemoryLogs.unshift(newLog);
  if (inMemoryLogs.length > 50) inMemoryLogs.pop();

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(SYNC_LOGS_KEY);
      const logs = raw ? JSON.parse(raw) : [];
      logs.unshift(newLog);
      if (logs.length > 50) logs.length = 50;
      localStorage.setItem(SYNC_LOGS_KEY, JSON.stringify(logs));
    } catch {
      // Ignore storage error
    }
  }

  return newLog;
}

/**
 * Retrieves the recent price synchronization logs.
 */
export function getPriceSyncLogs(): PriceSyncLog[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(SYNC_LOGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }
  return inMemoryLogs;
}

export interface PriceResolutionOptions {
  apiKey?: string;
  expectedPricePerQuintal?: number;
  farmLatitude?: number;
  farmLongitude?: number;
}

/**
 * Resolves the latest available price for a given mandi and commodity.
 * Hierarchy:
 * 1. Checks memory/localStorage cache.
 * 2. If online and API key present, queries Data.gov.in AGMARKNET feed (sorts by latest arrival date).
 * 3. Priority 2: Direct authentic verified AGMARKNET quotation or historical daily series.
 * 4. Priority 3: Latest quotation for same crop in nearby verified mandi within 350 km.
 * 5. Priority 4: Regional state or national benchmark.
 * 6. Priority 5: Farmer entered expected price.
 * 7. When unquoted: returns null (status resolves strictly to UNAVAILABLE with 0 price).
 */
export async function getMarketPriceForCommodity(
  marketId: string,
  marketName: string,
  state: string,
  district: string,
  cropName: string,
  apiKeyOrOptions?: string | PriceResolutionOptions
): Promise<MarketPriceRecord | null> {
  const normCommodity = normalizeCommodityForAgmarknet(cropName);

  const options: PriceResolutionOptions =
    typeof apiKeyOrOptions === 'string'
      ? { apiKey: apiKeyOrOptions }
      : (apiKeyOrOptions || {});

  const isDemoBenchmark = false;

  // Step 1: Check memory / localStorage cache
  const cached = getCachedPrice(marketId, normCommodity);
  if (cached) {
    return cached;
  }

  // PRIORITY 1: Live AGMARKNET Query via Data.gov.in
  const keyToUse = getEnvApiKey(options.apiKey);

  if (keyToUse && !isDemoBenchmark && typeof fetch !== 'undefined') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const endpoint = `${DATA_GOV_IN_BASE_URL}/${DATA_GOV_IN_RESOURCE_ID}?api-key=${encodeURIComponent(
        keyToUse
      )}&format=json&limit=50&filters[state]=${encodeURIComponent(state)}&filters[commodity]=${encodeURIComponent(
        normCommodity
      )}`;

      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        lastApiStatus = {
          isAvailable: true,
          lastSyncTime: new Date().toISOString(),
        };
        const json = await response.json();
        const records = (json.records || []) as Array<Record<string, string>>;

        // Match market records and sort by arrival_date descending to select the latest arrival!
        const matchingRecords = records.filter((r) => {
          if (!r.market) return false;
          if (r.state && state && r.state.toLowerCase().trim() !== state.toLowerCase().trim()) return false;
          if (r.commodity && !isCommodityMatch(r.commodity, normCommodity)) return false;

          return isMarketIdentityMatch(
            '',
            r.market,
            r.district || '',
            r.state || '',
            marketId,
            marketName,
            district,
            state
          );
        });

        if (matchingRecords.length > 0) {
          // Sort by arrival date descending (latest first)
          matchingRecords.sort((a, b) => {
            const dateA = a.arrival_date ? new Date(a.arrival_date).getTime() : 0;
            const dateB = b.arrival_date ? new Date(b.arrival_date).getTime() : 0;
            return dateB - dateA;
          });

          const latestRecord = matchingRecords[0];
          const arrivalDate = latestRecord.arrival_date || new Date().toISOString().split('T')[0];

          const validated = resolveValidatedPriceStatus({
            record: {
              marketId,
              marketName,
              state,
              district,
              commodity: normCommodity,
              variety: latestRecord.variety || 'Standard FAQ',
              grade: latestRecord.grade || 'FAQ',
              arrivalDate,
              minPrice: parseFloat(latestRecord.min_price),
              maxPrice: parseFloat(latestRecord.max_price),
              modalPrice: parseFloat(latestRecord.modal_price),
              source: 'Data.gov.in (Official AGMARKNET Live Feed)',
              priceSourceType: 'LIVE',
              confidenceIndicator: 'HIGH',
              fallbackTier: 1,
            },
            isLiveApiResult: true,
            requestedCommodity: normCommodity,
            targetMarketId: marketId,
            targetMarketName: marketName,
          });

          if (validated.isValid && validated.sanitizedRecord) {
            setCachedPrice(validated.sanitizedRecord);
            recordPriceSyncLog({
              timestamp: new Date().toISOString(),
              endpoint: 'Data.gov.in AGMARKNET',
              recordsCount: matchingRecords.length,
              status: 'SUCCESS',
              lastSuccessfulSync: new Date().toISOString(),
            });

            return validated.sanitizedRecord;
          }
        }
      } else {
        const errMsg = `AGMARKNET API error HTTP ${response.status}: ${response.statusText}`;
        lastApiStatus = {
          isAvailable: false,
          lastError: errMsg,
          lastSyncTime: lastApiStatus.lastSyncTime,
        };
        recordPriceSyncLog({
          timestamp: new Date().toISOString(),
          endpoint: 'Data.gov.in AGMARKNET',
          recordsCount: 0,
          status: 'FAILED',
          errorMessage: errMsg,
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      lastApiStatus = {
        isAvailable: false,
        lastError: errMsg,
        lastSyncTime: lastApiStatus.lastSyncTime,
      };
      recordPriceSyncLog({
        timestamp: new Date().toISOString(),
        endpoint: 'Data.gov.in AGMARKNET',
        recordsCount: 0,
        status: 'FAILED',
        errorMessage: errMsg,
      });
    }
  }

  // PRIORITY 2: Direct Authentic AGMARKNET Benchmark Quotation
  const matchingBenchmarks = VERIFIED_AGMARKNET_PRICES.filter(
    (p) => p.marketId === marketId && isCommodityMatch(p.commodity, normCommodity)
  );

  if (matchingBenchmarks.length > 0) {
    // Sort by arrivalDate descending
    matchingBenchmarks.sort((a, b) => new Date(b.arrivalDate).getTime() - new Date(a.arrivalDate).getTime());
    const latestBenchmark = matchingBenchmarks[0];

    const validated = resolveValidatedPriceStatus({
      record: {
        ...latestBenchmark,
        fallbackTier: 2,
      },
      isDemoBenchmark,
      requestedCommodity: normCommodity,
      targetMarketId: marketId,
      targetMarketName: marketName,
      targetDistrict: district,
      targetState: state,
    });

    if (validated.isValid && validated.sanitizedRecord) {
      setCachedPrice(validated.sanitizedRecord);
      return validated.sanitizedRecord;
    }
  }

  // Check recent historical trading series
  const historySeriesKey = `${marketId}_${normCommodity}`;
  const historySeries = RECENT_PRICE_HISTORY_SERIES[historySeriesKey];
  if (historySeries && historySeries.length > 0) {
    const latestPoint = historySeries[historySeries.length - 1];
    const validated = resolveValidatedPriceStatus({
      record: {
        marketId,
        marketName,
        state,
        district,
        commodity: normCommodity,
        variety: 'FAQ / Standard',
        grade: 'FAQ',
        arrivalDate: latestPoint.date,
        minPrice: latestPoint.minPrice,
        maxPrice: latestPoint.maxPrice,
        modalPrice: latestPoint.modalPrice,
        source: 'AGMARKNET (Historical APMC Daily Series)',
        fallbackTier: 2,
      },
      isDemoBenchmark,
      requestedCommodity: normCommodity,
      targetMarketId: marketId,
      targetMarketName: marketName,
    });

    if (validated.isValid && validated.sanitizedRecord) {
      setCachedPrice(validated.sanitizedRecord);
      return validated.sanitizedRecord;
    }
  }

  // PRIORITY 2.5: Multi-Source e-NAM, Agricultural Portals & Web Discovery
  const webDiscovery = await searchWebForCropPrices(normCommodity, state, marketName, district);
  const matchedWebQuote = webDiscovery.records.find((r) =>
    r.marketId === marketId ||
    isMarketIdentityMatch(r.marketId, r.marketName, r.district, r.state, marketId, marketName, district, state)
  );
  if (matchedWebQuote) {
    setCachedPrice(matchedWebQuote);
    return matchedWebQuote;
  }

  // PRIORITY 3: Latest Quotation for Same Crop in Nearby Verified Mandi
  const currentMandiDef = getNationalMarketById(marketId);
  const targetLat = currentMandiDef?.latitude;
  const targetLng = currentMandiDef?.longitude;

  if (targetLat !== undefined && targetLng !== undefined) {
    const matchingNearbyQuotes = VERIFIED_AGMARKNET_PRICES.filter(
      (p) => p.marketId !== marketId && isCommodityMatch(p.commodity, normCommodity)
    );

    if (matchingNearbyQuotes.length > 0) {
      let bestRefQuote: MarketPriceRecord | null = null;
      let minDistance = Infinity;

      for (const quote of matchingNearbyQuotes) {
        const refMandiDef = getNationalMarketById(quote.marketId);
        if (refMandiDef) {
          const dist = calculateHaversineDistance(
            targetLat,
            targetLng,
            refMandiDef.latitude,
            refMandiDef.longitude
          );
          if (dist < minDistance) {
            minDistance = dist;
            bestRefQuote = quote;
          }
        }
      }

      if (bestRefQuote && (minDistance <= 350 || bestRefQuote.state === state)) {
        const refDistanceKm = Math.round(minDistance * 10) / 10;
        const validated = resolveValidatedPriceStatus({
          record: {
            marketId,
            marketName,
            state,
            district,
            commodity: normCommodity,
            variety: bestRefQuote.variety,
            grade: bestRefQuote.grade,
            arrivalDate: bestRefQuote.arrivalDate,
            minPrice: bestRefQuote.minPrice,
            maxPrice: bestRefQuote.maxPrice,
            modalPrice: bestRefQuote.modalPrice,
            source: `Referenced from ${bestRefQuote.marketName} (${refDistanceKm} km away)`,
            confidenceIndicator: 'MEDIUM',
            attributedMarketName: bestRefQuote.marketName,
            attributedDistanceKm: refDistanceKm,
            fallbackTier: 3,
          },
          isDemoBenchmark,
          requestedCommodity: normCommodity,
          targetMarketId: marketId,
          targetMarketName: marketName,
        });

        if (validated.isValid && validated.sanitizedRecord) {
          setCachedPrice(validated.sanitizedRecord);
          return validated.sanitizedRecord;
        }
      }
    }
  }

  // Unquoted or unverified: return null (status strictly resolves to UNAVAILABLE with 0 price)
  return null;
}

export interface NationalCommodityPriceDiscoveryResult {
  records: MarketPriceRecord[];
  discoveryLevel: DiscoveryLevel;
  apiErrorCategory?: ApiErrorCategory;
  rawError?: string;
  totalFound: number;
}

/**
 * PHASE 2 & 3: LOCATION-BASED COMMODITY PRICE DISCOVERY WITH 3-LEVEL NATIONAL EXPANSION
 * Searches actual commodity-price records first across:
 * Level 1 (Nearby): Farmer's home state and proximate trading yards
 * Level 2 (Regional): Neighbouring state mandis
 * Level 3 (National): National terminal hubs and wholesale trading yards across all Indian states/UTs
 *
 * Implements 30-day configurable lookback, exact commodity matching, and transparent error classification.
 */
export async function discoverNationalCommodityPrices(
  commodity: string,
  farmerState: string = 'Karnataka',
  options?: {
    apiKey?: string;
    maxLookbackDays?: number;
  }
): Promise<NationalCommodityPriceDiscoveryResult> {
  const normCommodity = normalizeCommodityForAgmarknet(commodity);
  const maxLookbackDays = options?.maxLookbackDays || 30;
  const cutoffTime = Date.now() - maxLookbackDays * 24 * 60 * 60 * 1000;
  const keyToUse = getEnvApiKey(options?.apiKey);
  const isDemoBenchmark = false;

  let discoveredApiRecords: Array<Record<string, string>> = [];
  let apiErrorCategory: ApiErrorCategory | undefined;
  let rawError: string | undefined;

  // Step 1: Live AGMARKNET API Query across India for requested commodity
  if (keyToUse && !isDemoBenchmark && typeof fetch !== 'undefined') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const endpoint = `${DATA_GOV_IN_BASE_URL}/${DATA_GOV_IN_RESOURCE_ID}?api-key=${encodeURIComponent(
        keyToUse
      )}&format=json&limit=100&filters[commodity]=${encodeURIComponent(normCommodity)}`;

      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        lastApiStatus = {
          isAvailable: true,
          lastSyncTime: new Date().toISOString(),
        };
        const json = await response.json();
        discoveredApiRecords = (json.records || []) as Array<Record<string, string>>;
      } else {
        if (response.status === 401 || response.status === 403) {
          apiErrorCategory = 'AUTH_FAILURE';
        } else if (response.status === 429) {
          apiErrorCategory = 'RATE_LIMITED';
        }
        rawError = `AGMARKNET API error HTTP ${response.status}: ${response.statusText}`;
        lastApiStatus = {
          isAvailable: false,
          lastError: rawError,
          lastSyncTime: lastApiStatus.lastSyncTime,
        };
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        apiErrorCategory = 'TIMEOUT';
        rawError = 'AGMARKNET API request timed out after 7000ms';
      } else {
        apiErrorCategory = 'NETWORK_UNREACHABLE';
        rawError = err instanceof Error ? err.message : 'Network communication error';
      }
      lastApiStatus = {
        isAvailable: false,
        lastError: rawError,
        lastSyncTime: lastApiStatus.lastSyncTime,
      };
    }
  }

  // Parse live API records
  const parsedLiveRecords: MarketPriceRecord[] = [];
  for (const r of discoveredApiRecords) {
    if (!r.market || !isCommodityMatch(r.commodity || '', normCommodity)) continue;
    const arrDateStr = r.arrival_date || new Date().toISOString().split('T')[0];
    const recTime = new Date(arrDateStr).getTime();
    if (!isNaN(recTime) && recTime < cutoffTime) continue; // Exclude older than 30 days

    const matchedMandi = VERIFIED_NATIONAL_MANDIS.find((nm) =>
      isMarketIdentityMatch('', r.market, r.district || '', r.state || '', nm.marketId, nm.marketName, nm.district, nm.state)
    );

    const mId = matchedMandi
      ? matchedMandi.marketId
      : `agmarknet-${(r.state || 'in').toLowerCase().slice(0, 2)}-${(r.market || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const validated = resolveValidatedPriceStatus({
      record: {
        marketId: mId,
        marketName: matchedMandi ? matchedMandi.marketName : r.market,
        state: r.state || '',
        district: r.district || '',
        commodity: normCommodity,
        variety: r.variety || 'Standard FAQ',
        grade: r.grade || 'FAQ',
        arrivalDate: arrDateStr,
        minPrice: parseFloat(r.min_price),
        maxPrice: parseFloat(r.max_price),
        modalPrice: parseFloat(r.modal_price),
        source: 'Data.gov.in (Official AGMARKNET Live Feed)',
        fallbackTier: 1,
      },
      isLiveApiResult: true,
      requestedCommodity: normCommodity,
      targetMarketId: mId,
    });

    if (validated.isValid && validated.sanitizedRecord) {
      setCachedPrice(validated.sanitizedRecord);
      parsedLiveRecords.push(validated.sanitizedRecord);
    }
  }

  // Step 2: In Live Mode without API key, or as verified benchmark repository:
  // Gather authentic AGMARKNET benchmark records within 30 days
  const parsedBenchmarkRecords: MarketPriceRecord[] = [];
  for (const b of VERIFIED_AGMARKNET_PRICES) {
    if (isCommodityMatch(b.commodity, normCommodity)) {
      const bTime = new Date(b.arrivalDate).getTime();
      if (isNaN(bTime) || bTime >= cutoffTime) {
        const validated = resolveValidatedPriceStatus({
          record: { ...b, fallbackTier: 2 },
          isDemoBenchmark,
          requestedCommodity: normCommodity,
          targetMarketId: b.marketId,
        });
        if (validated.isValid && validated.sanitizedRecord) {
          setCachedPrice(validated.sanitizedRecord);
          parsedBenchmarkRecords.push(validated.sanitizedRecord);
        }
      }
    }
  }

  // Check historical trading series
  for (const [key, series] of Object.entries(RECENT_PRICE_HISTORY_SERIES)) {
    if (series.length > 0 && key.toLowerCase().includes(normCommodity.toLowerCase())) {
      const latestPoint = series[series.length - 1];
      const pTime = new Date(latestPoint.date).getTime();
      if (isNaN(pTime) || pTime >= cutoffTime) {
        const marketIdPart = key.split('_')[0];
        const marketDef = getNationalMarketById(marketIdPart);
        if (marketDef) {
          const validated = resolveValidatedPriceStatus({
            record: {
              marketId: marketDef.marketId,
              marketName: marketDef.marketName,
              state: marketDef.state,
              district: marketDef.district,
              commodity: normCommodity,
              variety: 'FAQ / Standard',
              grade: 'FAQ',
              arrivalDate: latestPoint.date,
              minPrice: latestPoint.minPrice,
              maxPrice: latestPoint.maxPrice,
              modalPrice: latestPoint.modalPrice,
              source: 'AGMARKNET (Historical APMC Daily Series)',
              fallbackTier: 2,
            },
            isDemoBenchmark,
            requestedCommodity: normCommodity,
            targetMarketId: marketDef.marketId,
          });
          if (validated.isValid && validated.sanitizedRecord) {
            parsedBenchmarkRecords.push(validated.sanitizedRecord);
          }
        }
      }
    }
  }

  // Step 3: Deduplicate all verified records by marketId (latest arrivalDate wins)
  const allVerifiedRecordsMap = new Map<string, MarketPriceRecord>();
  for (const rec of [...parsedBenchmarkRecords, ...parsedLiveRecords]) {
    const existing = allVerifiedRecordsMap.get(rec.marketId);
    if (!existing) {
      allVerifiedRecordsMap.set(rec.marketId, rec);
    } else {
      const dateA = new Date(existing.arrivalDate).getTime();
      const dateB = new Date(rec.arrivalDate).getTime();
      if (dateB > dateA) {
        allVerifiedRecordsMap.set(rec.marketId, rec);
      }
    }
  }

  // Step 3.5: Multi-source price discovery fallback (e-NAM, agricultural portals, web discovery)
  // When official AGMARKNET yields 0 records for common crops (Cauliflower, Coriander, Moong, etc.):
  if (allVerifiedRecordsMap.size === 0) {
    const webDiscovery = await searchWebForCropPrices(normCommodity, farmerState);
    if (webDiscovery.records.length > 0) {
      for (const rec of webDiscovery.records) {
        allVerifiedRecordsMap.set(rec.marketId, rec);
      }
    } else if (webDiscovery.apiErrorCategory) {
      apiErrorCategory = webDiscovery.apiErrorCategory;
    }
  }

  const allAvailableRecords = Array.from(allVerifiedRecordsMap.values());

  // Step 4: Empty state handling (legitimate absence vs API technical error)
  if (allAvailableRecords.length === 0) {
    return {
      records: [],
      discoveryLevel: 'NATIONAL',
      apiErrorCategory: apiErrorCategory || 'NO_LIVE_RECORDS',
      rawError,
      totalFound: 0,
    };
  }

  // Step 5: Classify Discovery Level (Nearby vs Regional vs National)
  const normState = (farmerState || 'Karnataka').trim().toLowerCase();
  const neighborStates = (NEIGHBORING_STATES[farmerState] || []).map((s) => s.toLowerCase());

  const level1LocalRecords = allAvailableRecords.filter(
    (r) => r.state.trim().toLowerCase() === normState
  );

  const level2RegionalRecords = allAvailableRecords.filter((r) => {
    const rState = r.state.trim().toLowerCase();
    return rState === normState || neighborStates.includes(rState);
  });

  let discoveryLevel: DiscoveryLevel = 'NATIONAL';
  if (level1LocalRecords.length >= 2) {
    discoveryLevel = 'NEARBY';
  } else if (level2RegionalRecords.length >= 2) {
    discoveryLevel = 'REGIONAL';
  } else {
    discoveryLevel = 'NATIONAL';
  }

  return {
    records: allAvailableRecords,
    discoveryLevel,
    apiErrorCategory,
    rawError,
    totalFound: allAvailableRecords.length,
  };
}
