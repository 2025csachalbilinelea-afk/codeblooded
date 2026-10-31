"""
QA Verification: Test live Data.gov.in AGMARKNET API endpoint
"""
import urllib.request
import urllib.error
import json
import os
import sys

RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
BASE_URL = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

api_key = os.environ.get("VITE_DATA_GOV_IN_API_KEY", "")

url = f"{BASE_URL}?api-key={api_key}&format=json&limit=5" if api_key else f"{BASE_URL}?format=json&limit=5"
print(f"Connecting to Data.gov.in endpoint: {BASE_URL}")
print(f"API Key present: {'Yes' if api_key else 'No (Testing unauthenticated response)'}")

req = urllib.request.Request(
    url,
    headers={"User-Agent": "HarvestRoute-QA-Audit/1.0"}
)

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        status_code = response.getcode()
        body = response.read().decode('utf-8')
        print(f"HTTP Status: {status_code}")
        try:
            data = json.loads(body)
            print("Response JSON parsed successfully:")
            print(json.dumps(data, indent=2)[:500])
        except Exception as e:
            print(f"Response Body (first 500 chars): {body[:500]}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
    body = e.read().decode('utf-8', errors='replace')
    print(f"Error Body: {body[:500]}")
except urllib.error.URLError as e:
    print(f"URL Error / Network Unreachable: {e.reason}")
except Exception as e:
    print(f"Unexpected Exception: {type(e).__name__}: {e}")

