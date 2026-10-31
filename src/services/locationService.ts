/**
 * HARVESTROUTE PHASE 5: FARMER LOCATION SERVICE
 * Handles browser Geolocation API ("📍 Use My Current Location"),
 * reverse geocoding via OpenStreetMap Nominatim, Indian PIN code / district lookup,
 * and manual location resolution.
 */

import { FarmerLocation } from '../types/marketDiscovery';

export interface DistrictGeoPreset {
  state: string;
  district: string;
  town: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

/**
 * Verified coordinates for major agricultural hubs and districts across India.
 * Provides instant, zero-latency, offline-resilient coordinate resolution.
 */
export const INDIAN_AGRI_DISTRICT_PRESETS: DistrictGeoPreset[] = [
  // Karnataka
  { state: 'Karnataka', district: 'Dharwad', town: 'Navalgund Farm Gate', pincode: '582208', latitude: 15.5615, longitude: 75.3622 },
  { state: 'Karnataka', district: 'Dharwad', town: 'Hubballi Rural', pincode: '580020', latitude: 15.3647, longitude: 75.1240 },
  { state: 'Karnataka', district: 'Belagavi', town: 'Bailhongal Farm Gate', pincode: '591102', latitude: 15.8156, longitude: 74.8569 },
  { state: 'Karnataka', district: 'Gadag', town: 'Ron Agro Belt', pincode: '582209', latitude: 15.6989, longitude: 75.7344 },
  { state: 'Karnataka', district: 'Bagalkot', town: 'Mudhol Cane Belt', pincode: '587313', latitude: 16.3353, longitude: 75.2847 },
  { state: 'Karnataka', district: 'Kolar', town: 'Srinivaspur Fruit Belt', pincode: '563135', latitude: 13.3364, longitude: 78.2167 },
  { state: 'Karnataka', district: 'Bengaluru Rural', town: 'Doddaballapur Belt', pincode: '561203', latitude: 13.2929, longitude: 77.5414 },
  { state: 'Karnataka', district: 'Mysuru', town: 'Nanjangud Farm Gate', pincode: '571301', latitude: 12.1189, longitude: 76.6806 },
  { state: 'Karnataka', district: 'Mandya', town: 'Mandya Sugar & Agri Belt', pincode: '571401', latitude: 12.5218, longitude: 76.8951 },
  { state: 'Karnataka', district: 'Davanagere', town: 'Harihar Agro Belt', pincode: '577601', latitude: 14.5133, longitude: 75.8033 },

  // Maharashtra
  { state: 'Maharashtra', district: 'Nashik', town: 'Lasalgaon Onion Yard', pincode: '422306', latitude: 20.1476, longitude: 74.2268 },
  { state: 'Maharashtra', district: 'Nashik', town: 'Pimpalgaon Baswant', pincode: '422209', latitude: 20.1706, longitude: 73.9877 },
  { state: 'Maharashtra', district: 'Pune', town: 'Junnar Tomato Valley', pincode: '410502', latitude: 19.2089, longitude: 73.8767 },
  { state: 'Maharashtra', district: 'Pune', town: 'Baramati Agro Cluster', pincode: '413102', latitude: 18.1528, longitude: 74.5772 },
  { state: 'Maharashtra', district: 'Kolhapur', town: 'Hatkanangle Cane Belt', pincode: '416109', latitude: 16.7456, longitude: 74.4447 },
  { state: 'Maharashtra', district: 'Solapur', town: 'Pandharpur Farm Belt', pincode: '413304', latitude: 17.6778, longitude: 75.3278 },
  { state: 'Maharashtra', district: 'Nagpur', town: 'Katol Citrus Belt', pincode: '441302', latitude: 21.2725, longitude: 78.5833 },
  { state: 'Maharashtra', district: 'Jalgaon', town: 'Raver Banana Zone', pincode: '425508', latitude: 21.2464, longitude: 75.9733 },

  // Madhya Pradesh
  { state: 'Madhya Pradesh', district: 'Indore', town: 'Sanwer Soybean Belt', pincode: '453551', latitude: 22.9778, longitude: 75.8319 },
  { state: 'Madhya Pradesh', district: 'Ujjain', town: 'Mahidpur Agro Belt', pincode: '456443', latitude: 23.4833, longitude: 75.6500 },
  { state: 'Madhya Pradesh', district: 'Mandsaur', town: 'Malhargarh Garlic Zone', pincode: '458339', latitude: 24.2833, longitude: 74.9833 },
  { state: 'Madhya Pradesh', district: 'Jabalpur', town: 'Sihora Pea Belt', pincode: '483225', latitude: 23.4833, longitude: 80.1167 },

  // Uttar Pradesh
  { state: 'Uttar Pradesh', district: 'Agra', town: 'Fatehabad Potato Belt', pincode: '283111', latitude: 27.0200, longitude: 78.3100 },
  { state: 'Uttar Pradesh', district: 'Meerut', town: 'Sardhana Agro Belt', pincode: '250342', latitude: 29.1500, longitude: 77.6167 },
  { state: 'Uttar Pradesh', district: 'Lucknow', town: 'Malihabad Mango Belt', pincode: '226102', latitude: 26.9200, longitude: 80.7100 },
  { state: 'Uttar Pradesh', district: 'Kanpur Nagar', town: 'Bilhaur Wheat Zone', pincode: '209202', latitude: 26.8500, longitude: 80.0500 },

  // Punjab & Haryana
  { state: 'Punjab', district: 'Ludhiana', town: 'Samrala Grain Belt', pincode: '141114', latitude: 30.8333, longitude: 76.1833 },
  { state: 'Punjab', district: 'Jalandhar', town: 'Nakodar Potato Cluster', pincode: '144040', latitude: 31.1300, longitude: 75.4700 },
  { state: 'Haryana', district: 'Karnal', town: 'Taraori Basmati Zone', pincode: '132116', latitude: 29.8000, longitude: 76.9333 },
  { state: 'Haryana', district: 'Sirsa', town: 'Ellenabad Cotton Belt', pincode: '125102', latitude: 29.4500, longitude: 74.6500 },

  // Gujarat
  { state: 'Gujarat', district: 'Mehsana', town: 'Unjha Spice Belt', pincode: '384170', latitude: 23.8037, longitude: 72.3927 },
  { state: 'Gujarat', district: 'Surat', town: 'Bardoli Cane & Fruit Zone', pincode: '394601', latitude: 21.1200, longitude: 73.1100 },
  { state: 'Gujarat', district: 'Rajkot', town: 'Gondal Agro Belt', pincode: '360311', latitude: 21.9619, longitude: 70.7925 },

  // Rajasthan
  { state: 'Rajasthan', district: 'Jaipur', town: 'Chomu Vegetable Belt', pincode: '303702', latitude: 27.1700, longitude: 75.7200 },
  { state: 'Rajasthan', district: 'Kota', town: 'Ramganj Mandi Soybean Hub', pincode: '326519', latitude: 24.6500, longitude: 75.9400 },

  // Andhra Pradesh & Telangana
  { state: 'Andhra Pradesh', district: 'Guntur', town: 'Tadikonda Chilli Belt', pincode: '522236', latitude: 16.4200, longitude: 80.4500 },
  { state: 'Telangana', district: 'Warangal', town: 'Narsampet Agro Zone', pincode: '506132', latitude: 17.9300, longitude: 79.9000 },

  // Tamil Nadu
  { state: 'Tamil Nadu', district: 'Dindigul', town: 'Ottanchathiram Belt', pincode: '624619', latitude: 10.4939, longitude: 77.7475 },
  { state: 'Tamil Nadu', district: 'Chennai', town: 'Thiruvallur Agro Belt', pincode: '602001', latitude: 13.1400, longitude: 79.9100 },

  // West Bengal & Bihar
  { state: 'West Bengal', district: 'Hooghly', town: 'Tarakeswar Potato Belt', pincode: '712410', latitude: 22.8900, longitude: 88.0200 },
  { state: 'Bihar', district: 'Patna', town: 'Bihta Grain Belt', pincode: '801103', latitude: 25.5600, longitude: 84.8700 },
];

export interface GeolocationErrorResult {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED' | 'UNKNOWN';
  message: string;
}

/**
 * Requests farmer's current location via browser Geolocation API with standard 10-second timeout.
 * Never requests without user initiating the action.
 */
export async function getBrowserLocation(): Promise<{
  coords: { latitude: number; longitude: number; accuracy: number };
} | { error: GeolocationErrorResult }> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      error: {
        code: 'UNSUPPORTED',
        message: 'Your browser does not support GPS location. Please choose your state and district manually.',
      },
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        let code: GeolocationErrorResult['code'] = 'UNKNOWN';
        let message = 'Unable to determine GPS location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            message = 'Location permission was denied. Please allow location access or select your district manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'POSITION_UNAVAILABLE';
            message = 'GPS signal is currently unavailable. Please verify your connection or select manually.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            message = 'Location request timed out (10s). Please try again or select your district manually.';
            break;
        }

        resolve({ error: { code, message } });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Reverse geocodes latitude/longitude to Indian state, district, and village name.
 * Uses OpenStreetMap Nominatim with graceful fallback to nearest district geo preset.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ state: string; district: string; villageOrTown: string; pincode?: string; formattedAddress: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HarvestRoute-AgriPlatform/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const state = addr.state || 'Karnataka';
      const district = addr.state_district || addr.county || addr.city || 'Dharwad';
      const villageOrTown = addr.village || addr.town || addr.suburb || addr.hamlet || 'Farm Gate';
      const pincode = addr.postcode;

      return {
        state,
        district,
        villageOrTown,
        pincode,
        formattedAddress: `${villageOrTown}, ${district}, ${state} ${pincode ? `(${pincode})` : ''}`.trim(),
      };
    }
  } catch {
    // Network failure or timeout: fallback to nearest preset
  }

  // Fallback: match nearest preset based on geometric distance
  let closestPreset = INDIAN_AGRI_DISTRICT_PRESETS[0];
  let minDiff = Infinity;

  for (const preset of INDIAN_AGRI_DISTRICT_PRESETS) {
    const diff = Math.hypot(preset.latitude - lat, preset.longitude - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closestPreset = preset;
    }
  }

  return {
    state: closestPreset.state,
    district: closestPreset.district,
    villageOrTown: `${closestPreset.town} (GPS ${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
    pincode: closestPreset.pincode,
    formattedAddress: `${closestPreset.town}, ${closestPreset.district}, ${closestPreset.state} (${closestPreset.pincode})`,
  };
}

/**
 * Resolves a manual Indian location (State, District, Village, PIN) into latitude & longitude.
 */
export function resolveManualLocation(
  state: string,
  district: string,
  villageOrTown: string,
  pincode?: string
): FarmerLocation {
  const normState = state.trim().toLowerCase();
  const normDistrict = district.trim().toLowerCase();
  const normPin = pincode ? pincode.trim() : '';

  // 1. PIN code match
  if (normPin.length === 6) {
    const pinMatch = INDIAN_AGRI_DISTRICT_PRESETS.find((p) => p.pincode === normPin);
    if (pinMatch) {
      return {
        latitude: pinMatch.latitude,
        longitude: pinMatch.longitude,
        state: pinMatch.state,
        district: pinMatch.district,
        villageOrTown: villageOrTown.trim() || pinMatch.town,
        pincode: pinMatch.pincode,
        formattedAddress: `${villageOrTown.trim() || pinMatch.town}, ${pinMatch.district}, ${pinMatch.state} (${pinMatch.pincode})`,
        method: 'manual',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 2. District and state match
  const districtMatch = INDIAN_AGRI_DISTRICT_PRESETS.find(
    (p) =>
      p.state.toLowerCase() === normState &&
      (p.district.toLowerCase() === normDistrict || normDistrict.includes(p.district.toLowerCase()))
  );

  if (districtMatch) {
    return {
      latitude: districtMatch.latitude,
      longitude: districtMatch.longitude,
      state: districtMatch.state,
      district: districtMatch.district,
      villageOrTown: villageOrTown.trim() || districtMatch.town,
      pincode: districtMatch.pincode,
      formattedAddress: `${villageOrTown.trim() || districtMatch.town}, ${districtMatch.district}, ${districtMatch.state}`,
      method: 'manual',
      timestamp: new Date().toISOString(),
    };
  }

  // 3. State-level match
  const stateMatch = INDIAN_AGRI_DISTRICT_PRESETS.find((p) => p.state.toLowerCase() === normState);
  if (stateMatch) {
    return {
      latitude: stateMatch.latitude,
      longitude: stateMatch.longitude,
      state: stateMatch.state,
      district: district.trim() || stateMatch.district,
      villageOrTown: villageOrTown.trim() || 'Farm Gate',
      pincode: stateMatch.pincode,
      formattedAddress: `${villageOrTown.trim() || 'Farm Gate'}, ${district.trim() || stateMatch.district}, ${stateMatch.state}`,
      method: 'manual',
      timestamp: new Date().toISOString(),
    };
  }

  // Default fallback (Navalgund, Karnataka)
  const def = INDIAN_AGRI_DISTRICT_PRESETS[0];
  return {
    latitude: def.latitude,
    longitude: def.longitude,
    state: state.trim() || def.state,
    district: district.trim() || def.district,
    villageOrTown: villageOrTown.trim() || def.town,
    pincode: def.pincode,
    formattedAddress: `${villageOrTown.trim() || def.town}, ${district.trim() || def.district}, ${state.trim() || def.state}`,
    method: 'manual',
    timestamp: new Date().toISOString(),
  };
}

