#!/usr/bin/env python3
"""Simulate concurrent adjustments to inventory (for demo/testing).

Usage:
  python3 simulate_concurrent_requests.py --sku sku-123 --store store-1 --concurrency 20 --delta -1 --requests 50
"""
import requests, threading, argparse, time, uuid

def worker(base_url, sku, store_id, delta, expected_version, id_key, results, idx):
    try:
        url = f"{base_url}/inventory/{sku}/adjust"
        headers = {'X-Store-Id': store_id, 'Idempotency-Key': id_key}
        payload = {'delta': delta}
        if expected_version is not None:
            payload['expectedVersion'] = expected_version
        r = requests.post(url, json=payload, headers=headers, timeout=5)
        results[idx] = (r.status_code, r.json() if r.content else None)
    except Exception as e:
        results[idx] = ('err', str(e))

def run_simulation(base_url, sku, store_id, concurrency, total_requests, delta):
    threads = []
    results = [None] * total_requests
    for i in range(total_requests):
        id_key = str(uuid.uuid4())
        t = threading.Thread(target=worker, args=(base_url, sku, store_id, delta, None, id_key, results, i))
        threads.append(t)
    # start in bursts of concurrency
    for i in range(0, total_requests, concurrency):
        for t in threads[i:i+concurrency]:
            t.start()
        for t in threads[i:i+concurrency]:
            t.join()
        time.sleep(0.1)
    return results

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--base', default='http://localhost:3000')
    p.add_argument('--sku', required=True)
    p.add_argument('--store', default='store-sim')
    p.add_argument('--concurrency', type=int, default=10)
    p.add_argument('--requests', type=int, default=50)
    p.add_argument('--delta', type=int, default=-1)
    args = p.parse_args()
    res = run_simulation(args.base, args.sku, args.store, args.concurrency, args.requests, args.delta)
    success = sum(1 for r in res if isinstance(r, tuple) and r[0]==200)
    print(f"Done. Success responses: {success}/{len(res)}")