"""
HARVESTROUTE PHASE 5B: TIME-SERIES PREPROCESSING & FEATURE ENGINEERING
Builds leak-free feature vectors for agricultural crop price prediction.
Direct horizons:
- target_3d: Price after 3 calendar days (t + 3)
- target_7d: Price after 7 calendar days (t + 7)
- target_14d: Price after 14 calendar days (t + 14)
"""

import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np

def get_agricultural_season(month: int) -> int:
    """
    Classifies Indian agricultural crop seasons:
    0: Kharif (July - October)
    1: Rabi (November - March)
    2: Zaid (April - June)
    """
    if 7 <= month <= 10:
        return 0 # Kharif
    elif month >= 11 or month <= 3:
        return 1 # Rabi
    else:
        return 2 # Zaid

def build_feature_dataframe(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms raw agricultural records into chronological, leakage-free feature vectors.
    """
    df = pd.DataFrame(records)
    df['date'] = pd.to_datetime(df['date'])
    # Sort strictly chronologically by series key and date
    df = df.sort_values(['marketId', 'crop', 'variety', 'date']).reset_index(drop=True)
    
    feature_rows = []
    
    # Process each distinct time-series independently
    grouped = df.groupby(['marketId', 'crop', 'variety'])
    
    for (market_id, crop, variety), group in grouped:
        group = group.sort_values('date').reset_index(drop=True)
        
        # Build date index map for fast temporal lookups
        date_to_row = {r['date']: r for _, r in group.iterrows()}
        all_dates = list(group['date'])
        
        for i in range(len(group)):
            current_row = group.iloc[i]
            curr_date = current_row['date']
            curr_p = float(current_row['modalPrice'])
            
            # Require at least 14 days of history to compute robust features
            if i < 14:
                continue
                
            # History strictly up to current date (inclusive)
            hist = group.iloc[:i+1]
            hist_prices = hist['modalPrice'].values
            hist_arrivals = hist['arrivalQuantityQuintals'].values
            
            # --- Calendar Features ---
            month = curr_date.month
            day_of_week = curr_date.weekday()
            day_of_year = curr_date.dayofyear
            season = get_agricultural_season(month)
            
            # Cyclical trigonometric encodings
            month_sin = math.sin(2 * math.pi * month / 12.0)
            month_cos = math.cos(2 * math.pi * month / 12.0)
            doy_sin = math.sin(2 * math.pi * day_of_year / 365.25)
            doy_cos = math.cos(2 * math.pi * day_of_year / 365.25)
            
            # --- Lag Features (STRICTLY HISTORICAL: <= t) ---
            lag_1 = float(hist_prices[-2]) if len(hist_prices) >= 2 else curr_p
            lag_2 = float(hist_prices[-3]) if len(hist_prices) >= 3 else lag_1
            lag_3 = float(hist_prices[-4]) if len(hist_prices) >= 4 else lag_2
            lag_7 = float(hist_prices[-8]) if len(hist_prices) >= 8 else lag_3
            lag_14 = float(hist_prices[-15]) if len(hist_prices) >= 15 else lag_7
            
            # --- Rolling Statistics (STRICTLY HISTORICAL: [t-k, t]) ---
            w7 = hist_prices[-7:]
            w14 = hist_prices[-14:]
            w30 = hist_prices[-30:] if len(hist_prices) >= 30 else hist_prices
            
            mean_7d = float(np.mean(w7))
            mean_14d = float(np.mean(w14))
            mean_30d = float(np.mean(w30))
            
            vol_7d = float(np.std(w7)) if len(w7) > 1 else 0.0
            vol_14d = float(np.std(w14)) if len(w14) > 1 else 0.0
            
            # --- Momentum & Volatility Ratios ---
            delta_1d = curr_p - lag_1
            delta_7d = curr_p - lag_7
            pct_return_7d = (curr_p - lag_7) / max(1.0, lag_7)
            price_to_mean_14d = curr_p / max(1.0, mean_14d)
            
            # --- Arrival Statistics ---
            arr_w7 = hist_arrivals[-7:]
            mean_arr_7d = float(np.mean(arr_w7))
            arr_ratio = float(current_row['arrivalQuantityQuintals']) / max(1.0, mean_arr_7d)
            
            # --- Weather Features (already non-leaking from weather service) ---
            rain_7d = float(current_row.get('weather_rain_7d_mm', 0.0))
            temp_mean_7d = float(current_row.get('weather_temp_7d_mean', 28.0))
            humidity = float(current_row.get('weather_humidity', 60.0))
            
            # --- TARGETS for Supervised Training (Direct Horizons) ---
            # Lookup future date prices at t + 3 days, t + 7 days, t + 14 days
            # If future date fell on Sunday/holiday, take nearest following available trading day
            target_3d = None
            target_7d = None
            target_14d = None
            
            target_date_3 = curr_date + pd.Timedelta(days=3)
            target_date_7 = curr_date + pd.Timedelta(days=7)
            target_date_14 = curr_date + pd.Timedelta(days=14)
            
            # Look ahead in the group
            future_slice = group[group['date'] >= target_date_3]
            if len(future_slice) > 0:
                target_3d = float(future_slice.iloc[0]['modalPrice'])
                
            future_slice_7 = group[group['date'] >= target_date_7]
            if len(future_slice_7) > 0:
                target_7d = float(future_slice_7.iloc[0]['modalPrice'])
                
            future_slice_14 = group[group['date'] >= target_date_14]
            if len(future_slice_14) > 0:
                target_14d = float(future_slice_14.iloc[0]['modalPrice'])
                
            feature_row = {
                'marketId': market_id,
                'crop': crop,
                'variety': variety,
                'state': current_row['state'],
                'district': current_row['district'],
                'date': curr_date,
                
                # Core Price Features
                'price_current': curr_p,
                'lag_1': lag_1,
                'lag_2': lag_2,
                'lag_3': lag_3,
                'lag_7': lag_7,
                'lag_14': lag_14,
                'mean_7d': round(mean_7d, 2),
                'mean_14d': round(mean_14d, 2),
                'mean_30d': round(mean_30d, 2),
                'vol_7d': round(vol_7d, 2),
                'vol_14d': round(vol_14d, 2),
                'delta_1d': round(delta_1d, 2),
                'delta_7d': round(delta_7d, 2),
                'pct_return_7d': round(pct_return_7d, 4),
                'price_to_mean_14d': round(price_to_mean_14d, 4),
                
                # Arrival Dynamics
                'arrival_qty': float(current_row['arrivalQuantityQuintals']),
                'mean_arrival_7d': round(mean_arr_7d, 2),
                'arrival_ratio': round(arr_ratio, 4),
                
                # Weather Features
                'weather_rain_7d': rain_7d,
                'weather_temp_7d': temp_mean_7d,
                'weather_humidity': humidity,
                
                # Calendar & Season
                'month': month,
                'day_of_week': day_of_week,
                'day_of_year': day_of_year,
                'season': season,
                'month_sin': round(month_sin, 4),
                'month_cos': round(month_cos, 4),
                'doy_sin': round(doy_sin, 4),
                'doy_cos': round(doy_cos, 4),
                
                # Supervised Targets
                'target_3d': target_3d,
                'target_7d': target_7d,
                'target_14d': target_14d,
                
                # Naive Baseline Predictions for Benchmarking
                'baseline_naive_3d': curr_p,
                'baseline_naive_7d': curr_p,
                'baseline_naive_14d': curr_p,
                'baseline_ma7_3d': mean_7d,
                'baseline_ma7_7d': mean_7d,
                'baseline_ma7_14d': mean_7d,
            }
            feature_rows.append(feature_row)
            
    out_df = pd.DataFrame(feature_rows)
    return out_df

FEATURE_COLUMNS = [
    'price_current', 'lag_1', 'lag_2', 'lag_3', 'lag_7', 'lag_14',
    'mean_7d', 'mean_14d', 'mean_30d', 'vol_7d', 'vol_14d',
    'delta_1d', 'delta_7d', 'pct_return_7d', 'price_to_mean_14d',
    'arrival_qty', 'mean_arrival_7d', 'arrival_ratio',
    'weather_rain_7d', 'weather_temp_7d', 'weather_humidity',
    'month', 'day_of_week', 'season',
    'month_sin', 'month_cos', 'doy_sin', 'doy_cos'
]

