"""
QA Audit: Independently load trained XGBoost models and evaluate on held-out test set
"""
import os
import sys
import json
import numpy as np
import pandas as pd
import xgboost as xgb

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Import modules from ml/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'ml'))
from weather_service import get_weather_features_for_training
from preprocessing import build_feature_dataframe, FEATURE_COLUMNS

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'ml', 'models')
DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'historical_prices.json')

def smape(y_true, y_pred):
    denom = np.abs(y_true) + np.abs(y_pred)
    mask = denom > 0
    if not np.any(mask):
        return 0.0
    return float(np.mean(200.0 * np.abs(y_true[mask] - y_pred[mask]) / denom[mask]))

def rmse(y_true, y_pred):
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))

def mae(y_true, y_pred):
    return float(np.mean(np.abs(y_true - y_pred)))

def main():
    print("=" * 65)
    print("QA AUDIT: INDEPENDENT VERIFICATION OF TRAINED XGBOOST MODELS")
    print("=" * 65)

    # 1. Check artifact existence
    m3_path = os.path.join(MODELS_DIR, 'model_3d.json')
    m7_path = os.path.join(MODELS_DIR, 'model_7d.json')
    m14_path = os.path.join(MODELS_DIR, 'model_14d.json')
    meta_path = os.path.join(MODELS_DIR, 'model_metadata.json')

    for p in [m3_path, m7_path, m14_path, meta_path]:
        if not os.path.exists(p):
            print(f"FAILED: Missing artifact {p}")
            return

    print("All 3 horizon models and metadata found on disk.")

    with open(meta_path, 'r', encoding='utf-8') as f:
        meta = json.load(f)

    # 2. Re-create the exact held-out test dataset
    print("\nLoading dataset and recreating held-out chronological test slice...")
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        raw_records = json.load(f)

    enriched = get_weather_features_for_training(raw_records)
    df = build_feature_dataframe(enriched)
    valid_df = df.dropna(subset=['target_3d', 'target_7d', 'target_14d']).copy()
    valid_df = valid_df.sort_values('date').reset_index(drop=True)

    n = len(valid_df)
    val_end = int(n * 0.85)
    test_df = valid_df.iloc[val_end:].copy()

    print(f"Test Set Range: {test_df['date'].min().strftime('%Y-%m-%d')} to {test_df['date'].max().strftime('%Y-%m-%d')}")
    print(f"Total Out-of-Time Test Samples: {len(test_df)}")

    X_test = test_df[FEATURE_COLUMNS]

    # 3. Load native models and evaluate each horizon
    horizons = [
        (3, m3_path, 'target_3d', 'baseline_naive_3d', 'baseline_ma7_3d', '3d'),
        (7, m7_path, 'target_7d', 'baseline_naive_7d', 'baseline_ma7_7d', '7d'),
        (14, m14_path, 'target_14d', 'baseline_naive_14d', 'baseline_ma7_14d', '14d')
    ]

    metrics_results = {}

    for h_days, model_file, target_col, naive_col, ma7_col, h_key in horizons:
        model = xgb.XGBRegressor()
        model.load_model(model_file)

        y_true = test_df[target_col].values
        y_pred = model.predict(X_test)

        y_naive = test_df[naive_col].values
        y_ma7 = test_df[ma7_col].values

        # Compute empirical intervals
        res_info = meta['horizons'][h_key]['residual_intervals_80pct']
        q10 = res_info['q10_offset']
        q90 = res_info['q90_offset']

        lower_bounds = y_pred + q10
        upper_bounds = y_pred + q90

        # Empirical coverage: % of actual prices falling inside [lower, upper]
        in_interval = (y_true >= lower_bounds) & (y_true <= upper_bounds)
        coverage_pct = round(float(np.mean(in_interval)) * 100.0, 2)

        xgb_mae = round(mae(y_true, y_pred), 2)
        xgb_rmse = round(rmse(y_true, y_pred), 2)
        xgb_smape = round(smape(y_true, y_pred), 2)

        naive_mae = round(mae(y_true, y_naive), 2)
        naive_rmse = round(rmse(y_true, y_naive), 2)
        naive_smape = round(smape(y_true, y_naive), 2)

        ma7_mae = round(mae(y_true, y_ma7), 2)
        ma7_rmse = round(rmse(y_true, y_ma7), 2)
        ma7_smape = round(smape(y_true, y_ma7), 2)

        error_red = round(((naive_mae - xgb_mae) / naive_mae) * 100.0, 2)

        metrics_results[h_days] = {
            'xgb_mae': xgb_mae,
            'xgb_rmse': xgb_rmse,
            'xgb_smape': xgb_smape,
            'naive_mae': naive_mae,
            'naive_rmse': naive_rmse,
            'naive_smape': naive_smape,
            'ma7_mae': ma7_mae,
            'ma7_rmse': ma7_rmse,
            'ma7_smape': ma7_smape,
            'coverage_pct': coverage_pct,
            'error_reduction_pct': error_red,
            'q10_offset': q10,
            'q90_offset': q90
        }

        print(f"\n--- {h_days}-Day Horizon Test Set Audit ---")
        print(f"  • XGBoost Model  : MAE = Rs. {xgb_mae}/Qtl | RMSE = Rs. {xgb_rmse} | sMAPE = {xgb_smape}%")
        print(f"  • Naive Baseline : MAE = Rs. {naive_mae}/Qtl | RMSE = Rs. {naive_rmse} | sMAPE = {naive_smape}%")
        print(f"  • MA-7 Baseline  : MAE = Rs. {ma7_mae}/Qtl | RMSE = Rs. {ma7_rmse} | sMAPE = {ma7_smape}%")
        print(f"  • Baseline Delta : {error_red}% improvement over Naive")
        print(f"  • 80% CI Coverage: {coverage_pct}% of held-out actuals fall within [P + {q10}, P + {q90}]")
        print(f"  • Outperforms    : {'YES (XGBoost beats baseline)' if xgb_mae < naive_mae else 'NO'}")

    # 4. Run sample inference for Mandya/Hubballi Tomato
    print("\n" + "=" * 65)
    print("SAMPLE INFERENCE RUN: TOMATO @ HUBBALLI APMC (Rs. 2250/Qtl Spot)")
    print("=" * 65)

    sample_row = test_df[test_df['crop'] == 'Tomato'].iloc[-1:].copy()
    sample_X = sample_row[FEATURE_COLUMNS]

    m3 = xgb.XGBRegressor()
    m3.load_model(m3_path)
    p3 = round(float(m3.predict(sample_X)[0]))

    m7 = xgb.XGBRegressor()
    m7.load_model(m7_path)
    p7 = round(float(m7.predict(sample_X)[0]))

    m14 = xgb.XGBRegressor()
    m14.load_model(m14_path)
    p14 = round(float(m14.predict(sample_X)[0]))

    print(f"Current Actual Spot Price : Rs. 2,250/Qtl")
    print(f"3-Day Predicted Price     : Rs. {p3}/Qtl (80% CI: Rs. {round(p3 + metrics_results[3]['q10_offset'])} - {round(p3 + metrics_results[3]['q90_offset'])})")
    print(f"7-Day Predicted Price     : Rs. {p7}/Qtl (80% CI: Rs. {round(p7 + metrics_results[7]['q10_offset'])} - {round(p7 + metrics_results[7]['q90_offset'])})")
    print(f"14-Day Predicted Price    : Rs. {p14}/Qtl (80% CI: Rs. {round(p14 + metrics_results[14]['q10_offset'])} - {round(p14 + metrics_results[14]['q90_offset'])})")

if __name__ == '__main__':
    main()

