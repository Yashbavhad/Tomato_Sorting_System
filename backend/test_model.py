"""
Direct model inference CLI — same model + preprocessing as FastAPI.

Usage:
  python test_model.py path/to/image.jpg
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Allow running from backend/ without installing as a package
BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from dotenv import load_dotenv

load_dotenv(BACKEND_ROOT / ".env")

from app.services.model_service import CLASS_NAMES, model_service


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python test_model.py path/to/image.jpg")
        return 2

    image_path = Path(sys.argv[1])
    if not image_path.exists():
        print(f"Error: image not found: {image_path}")
        return 1

    model_service.load()
    if not model_service.model_loaded:
        print(f"Error: {model_service.load_error}")
        return 1

    model_name = model_service.model_path.name if model_service.model_path else "unknown"
    print(f"Model: {model_name}")
    print()

    try:
        result = model_service.predict_path(image_path)
    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}")
        return 1

    print(f"Prediction: {result['class']}")
    print(f"Index: {result['index']}")
    print(f"Confidence: {result['confidence'] * 100:.4f}%")
    print()
    print("Probabilities:")
    for name in CLASS_NAMES:
        print(f"{name:<8}: {result['probabilities'][name] * 100:7.4f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
