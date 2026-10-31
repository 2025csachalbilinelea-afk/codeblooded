/**
 * HARVESTROUTE API ROUTER
 * Dispatches API requests for Mandi Discovery, AGMARKNET Live Prices,
 * Machine Learning Crop Price Forecasts, and Sell Now vs Sell Later Economics.
 */

import { VERIFIED_NATIONAL_MANDIS } from '../data/nationalMandis';
import { getMarketPriceForCommodity, getPriceSyncLogs } from '../services/agmarknetService';
import { getHistoricalPriceSeries } from '../data/recentPriceHistory';
import { generateCropPriceForecast } from '../engine/forecastEngine';
import { evaluateSellNowVsLater } from '../engine/sellNowVsLater';
import { getCropById } from '../data/crops';
import mlModelBundle from '../data/mlModelBundle.json';
import { searchWebForCropPrices } from '../services/webPriceDiscoveryService';

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  headers?: Record<string, string>;
}

export async function handleApiRoute(
  urlPath: string,
  method: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<ApiResponse> {
  const url = new URL(urlPath, 'http://localhost');
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  // --- 1. GET /api/ml/status ---
  if (pathname === '/api/ml/status' && method === 'GET') {
    return {
      statusCode: 200,
      data: {
        status: 'READY',
        version: mlModelBundle.version,
        algorithm: 'XGBoostRegressor',
        supportedCrops: mlModelBundle.supported_crops,
        supportedMarkets: mlModelBundle.supported_markets,
        evaluations: mlModelBundle.evaluations,
        intervals: mlModelBundle.intervals,
      },
    };
  }

  // --- 2. POST /api/ml/predict ---
  if (pathname === '/api/ml/predict' && method === 'POST') {
    const payload = typeof body === 'string' ? JSON.parse(body) : body || {};
    const { crop, variety, marketId, marketName, latestActualPrice, latestArrivalDate } = payload;

    if (!crop || !marketId || typeof latestActualPrice !== 'number') {
      return {
        statusCode: 400,
        data: { error: 'Missing required parameters: crop, marketId, latestActualPrice' },
      };
    }

    const forecast = generateCropPriceForecast({
      commodity: crop,
      variety: variety || 'Standard FAQ',
      marketId,
      marketName: marketName || marketId,
      latestActualPrice,
      latestArrivalDate,
    });

    return {
      statusCode: 200,
      data: forecast,
    };
  }

  // --- 3. GET /api/ml/history ---
  if (pathname === '/api/ml/history' && method === 'GET') {
    const crop = searchParams.get('crop');
    const marketId = searchParams.get('marketId');

    if (!crop || !marketId) {
      return {
        statusCode: 400,
        data: { error: 'Missing required query parameters: crop and marketId' },
      };
    }

    const series = getHistoricalPriceSeries(marketId, crop);
    return {
      statusCode: 200,
      data: {
        crop,
        marketId,
        totalRecords: series.length,
        records: series,
      },
    };
  }

  // --- 4. POST /api/ml/compare ---
  if (pathname === '/api/ml/compare' && method === 'POST') {
    const payload = typeof body === 'string' ? JSON.parse(body) : body || {};
    const {
      cropId,
      consignmentQuintals,
      currentPricePerQuintal,
      marketId,
      transportCost = 0,
      storageType = 'ambient',
      dailyStorageRate,
    } = payload;

    const crop = getCropById(cropId || 'tomato');
    const forecast = generateCropPriceForecast({
      commodity: crop.name,
      marketId: marketId || 'ka-hubballi-apmc',
      marketName: marketId || 'Hubballi APMC',
      latestActualPrice: currentPricePerQuintal || 2250,
    });

    const comparison = evaluateSellNowVsLater(
      crop,
      consignmentQuintals || 20,
      currentPricePerQuintal || 2250,
      forecast,
      transportCost,
      1.5,
      0.5,
      18,
      { dailyRatePerQuintal: dailyStorageRate, storageType }
    );

    return {
      statusCode: 200,
      data: comparison,
    };
  }

  // --- 5. POST /api/ml/train (Admin-Protected) ---
  if (pathname === '/api/ml/train' && method === 'POST') {
    const adminKey = headers['x-admin-key'] || headers['X-Admin-Key'];
    if (adminKey !== 'harvestroute_admin_secret_key_2026') {
      return {
        statusCode: 403,
        data: { error: 'Administrative authorization required to access training endpoints.' },
      };
    }

    return {
      statusCode: 200,
      data: {
        status: 'QUEUED',
        message: 'Periodic model retraining job initiated.',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // --- 6. GET /api/prices/status ---
  if (pathname === '/api/prices/status' && method === 'GET') {
    const logs = getPriceSyncLogs();
    return {
      statusCode: 200,
      data: {
        totalSyncEvents: logs.length,
        recentLogs: logs.slice(0, 10),
        status: 'ACTIVE',
      },
    };
  }

  // --- 7. GET /api/markets/nearby ---
  if (pathname === '/api/markets/nearby' && method === 'GET') {
    return {
      statusCode: 200,
      data: {
        totalMarkets: VERIFIED_NATIONAL_MANDIS.length,
        mandis: VERIFIED_NATIONAL_MANDIS,
      },
    };
  }

  // --- 8. POST & GET /api/search/prices ---
  if (pathname === '/api/search/prices' && (method === 'POST' || method === 'GET')) {
    const payload = typeof body === 'string' ? JSON.parse(body || '{}') : body || {};
    const crop = payload.crop || payload.cropName || searchParams.get('crop') || '';
    const state = payload.state || payload.farmerState || searchParams.get('state') || '';
    const mandiName = payload.mandiName || searchParams.get('mandiName') || undefined;
    const district = payload.district || searchParams.get('district') || undefined;

    const result = await searchWebForCropPrices(crop, state, mandiName, district);
    return {
      statusCode: 200,
      data: result,
    };
  }

  return {
    statusCode: 404,
    data: { error: `Endpoint not found: ${pathname}` },
  };
}

