"""
QA Audit Script: Inspect historical dataset and verify data authenticity
"""
import json
import os
from collections import Counter
from datetime import datetime

data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'historical_prices.json')
with open(data_path, 'r', encoding='utf-8') as f:
    records = json.load(f)

total_records = len(records)
dates = [r['date'] for r in records if 'date' in r]
earliest_date = min(dates) if dates else None
latest_date = max(dates) if dates else None

crops = Counter(r['crop'] for r in records)
markets = Counter(r['marketId'] for r in records)

# Check missing data
missing_counts = {
    'date': sum(1 for r in records if not r.get('date')),
    'crop': sum(1 for r in records if not r.get('crop')),
    'marketId': sum(1 for r in records if not r.get('marketId')),
    'modalPrice': sum(1 for r in records if r.get('modalPrice') is None or r.get('modalPrice') <= 0),
    'minPrice': sum(1 for r in records if r.get('minPrice') is None or r.get('minPrice') <= 0),
    'maxPrice': sum(1 for r in records if r.get('maxPrice') is None or r.get('maxPrice') <= 0),
    'arrivalQuantityQuintals': sum(1 for r in records if r.get('arrivalQuantityQuintals') is None or r.get('arrivalQuantityQuintals') < 0)
}

missing_pct = {k: round((v / total_records) * 100, 2) for k, v in missing_counts.items()}

# Authenticity inspection:
# Check source attribution
sources = Counter(r.get('source', 'Unknown') for r in records)

print("=" * 60)
print("QA AUDIT REPORT: HISTORICAL TRAINING DATASET")
print("=" * 60)
print(f"Total Records: {total_records}")
print(f"Earliest Date: {earliest_date}")
print(f"Latest Date: {latest_date}")
print(f"Number of Crops: {len(crops)}")
print(f"Number of Markets: {len(markets)}")
print("\nRecords per Crop:")
for c, cnt in sorted(crops.items()):
    print(f"  - {c:<15}: {cnt} ({round(cnt/total_records*100, 1)}%)")

print("\nRecords per Market:")
for m, cnt in sorted(markets.items()):
    print(f"  - {m:<20}: {cnt} ({round(cnt/total_records*100, 1)}%)")

print("\nMissing Data Analysis:")
for f_name, pct in missing_pct.items():
    print(f"  - {f_name:<25}: {pct}% missing ({missing_counts[f_name]} records)")

print("\nReported Data Sources:")
for s, cnt in sources.items():
    print(f"  - {s}: {cnt} records")

