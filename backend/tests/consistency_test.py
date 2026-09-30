"""
Compare direct ModelService inference vs FastAPI /api/predict for verified images.

Usage (server must already be running on BASE_URL):
  python tests/consistency_test.py
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import httpx
import numpy as np

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv

load_dotenv(BACKEND_ROOT / ".env")

from app.services.model_service import model_service

BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8001")
# Project-relative verified images (override with TEST_IMAGE_DIR if needed)
_DEFAULT_TEST_DIR = BACKEND_ROOT.parent / "docs" / "testdata"
TEST_IMAGE_DIR = Path(os.getenv("TEST_IMAGE_DIR", str(_DEFAULT_TEST_DIR))).resolve()
IMAGES = ["e.jpg", "e3.jpg", "e2.jpg", "b.jpeg", "e1.jpg", "e4.jpg"]
RTOL = 1e-5
ATOL = 1e-6


def approx_equal(a: float, b: float) -> bool:
    return bool(np.isclose(a, b, rtol=RTOL, atol=ATOL))


def main() -> int:
    model_service.load()
    if not model_service.model_loaded:
        print(f"FAIL: model not loaded: {model_service.load_error}")
        return 1

    health = httpx.get(f"{BASE_URL}/api/health", timeout=30.0)
    health.raise_for_status()
    health_data = health.json()
    if not health_data.get("model_loaded"):
        print("FAIL: /api/health reports model_loaded=false")
        print(health_data)
        return 1

    print("Image | Direct Model | FastAPI | Match")
    print("-" * 72)

    all_ok = True
    for name in IMAGES:
        path = TEST_IMAGE_DIR / name
        if not path.exists():
            print(f"{name} | MISSING | MISSING | FAIL")
            all_ok = False
            continue

        direct = model_service.predict_path(path)
        with path.open("rb") as fh:
            files = {"image": (name, fh, "image/jpeg")}
            resp = httpx.post(f"{BASE_URL}/api/predict", files=files, timeout=120.0)

        if resp.status_code != 200:
            print(f"{name} | {direct['class']} | HTTP {resp.status_code} | FAIL")
            print(resp.text)
            all_ok = False
            continue

        body = resp.json()
        if not body.get("success"):
            print(f"{name} | {direct['class']} | {body} | FAIL")
            all_ok = False
            continue

        api = body["prediction"]
        class_ok = direct["class"] == api["class"]
        index_ok = direct["index"] == api["index"]
        conf_ok = approx_equal(direct["confidence"], api["confidence"])
        probs_ok = all(
            approx_equal(direct["probabilities"][k], api["probabilities"][k])
            for k in direct["probabilities"]
        )
        match = class_ok and index_ok and conf_ok and probs_ok
        all_ok = all_ok and match
        status = "PASS" if match else "FAIL"
        print(
            f"{name} | {direct['class']} ({direct['confidence']:.6f}) | "
            f"{api['class']} ({api['confidence']:.6f}) | {status}"
        )
        if not match:
            print("  direct:", json.dumps(direct, indent=2))
            print("  api   :", json.dumps(api, indent=2))

    print("-" * 72)
    print("OVERALL:", "PASS" if all_ok else "FAIL")
    return 0 if all_ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
