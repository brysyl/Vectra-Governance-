import asyncio
import urllib.request
import json

url = "https://vectra-governance-630243518379.us-central1.run.app/api/inject-anomaly"
headers = {"Content-Type": "application/json"}
payload = json.dumps({"vector": "concurrent_spike", "details": {"source": "termux_spike_test"}}).encode("utf-8")

async def send_request(i):
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Request {i}: Status {response.status}")
    except Exception as e:
        print(f"Request {i} failed: {e}")

async def main():
    tasks = [send_request(i) for i in range(20)]
    await asyncio.gather(*tasks)

asyncio.run(main())
