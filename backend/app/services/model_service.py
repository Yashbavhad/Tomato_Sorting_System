"""
Verified tomato classifier inference service.

Uses the immutable trained model best_tomato_finetuned.keras with the
verified preprocessing and class mapping from Phase 2:

  0 → Damaged, 1 → Old, 2 → Ripe, 3 → Unripe

Preprocessing (external):
  load → RGB → resize 224×224 → float32 0–255 → batch dim → model.predict()

Do NOT apply /255.0 externally. EfficientNetB0 contains internal scaling.
"""

from __future__ import annotations

import io
import os
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, UnidentifiedImageError

# Verified class order — do not reorder
CLASS_NAMES: list[str] = ["Damaged", "Old", "Ripe", "Unripe"]
INPUT_SIZE: tuple[int, int] = (224, 224)


def _default_model_path() -> Path:
    """Resolve MODEL_PATH from env, else backend/weights/best_tomato_finetuned.keras."""
    env_path = os.getenv("MODEL_PATH")
    if env_path:
        return Path(env_path).expanduser().resolve()
    # backend/app/services/this_file → backend/weights/...
    backend_root = Path(__file__).resolve().parents[2]
    return (backend_root / "weights" / "best_tomato_finetuned.keras").resolve()


class ModelService:
    """Singleton-style service: load once, predict many times."""

    def __init__(self) -> None:
        self.model = None
        self.model_path: Path | None = None
        self.model_loaded: bool = False
        self.load_error: str | None = None
        self._tf = None

    def load(self) -> None:
        """Load the Keras model once at startup. Never saves or modifies weights."""
        import tensorflow as tf

        self._tf = tf
        path = _default_model_path()
        self.model_path = path

        if not path.exists():
            self.model_loaded = False
            self.load_error = f"Model file not found: {path}"
            self.model = None
            return

        try:
            self.model = tf.keras.models.load_model(str(path))
            self.model_loaded = True
            self.load_error = None
        except Exception as exc:  # noqa: BLE001 — surface load failures to API
            self.model = None
            self.model_loaded = False
            self.load_error = f"Failed to load model: {exc}"

    def ensure_loaded(self) -> None:
        if not self.model_loaded or self.model is None:
            raise RuntimeError(self.load_error or "AI model unavailable")

    def preprocess_image_bytes(self, image_bytes: bytes) -> np.ndarray:
        """
        Verified preprocessing from image bytes (same as Colab predict_tomato):
          load_img(target_size=224) → img_to_array (float32 0–255) → expand_dims
        No external /255.0.
        """
        self.ensure_loaded()
        assert self._tf is not None

        # Validate decode/RGB before keras resize path (clear API errors)
        try:
            probe = Image.open(io.BytesIO(image_bytes))
            probe = probe.convert("RGB")
            probe.verify()
        except UnidentifiedImageError as exc:
            raise ValueError("Invalid image: file cannot be decoded") from exc
        except Exception as exc:  # noqa: BLE001
            raise ValueError(f"Invalid image: {exc}") from exc

        try:
            image = self._tf.keras.utils.load_img(
                io.BytesIO(image_bytes),
                target_size=INPUT_SIZE,
            )
            array = self._tf.keras.utils.img_to_array(image)  # float32, 0–255
        except Exception as exc:  # noqa: BLE001
            raise ValueError(f"Invalid image: preprocessing failed: {exc}") from exc

        if array.ndim != 3 or tuple(array.shape) != (*INPUT_SIZE, 3):
            raise ValueError(
                f"Invalid image tensor shape after preprocess: {array.shape}"
            )
        return self._tf.expand_dims(array, axis=0)

    def preprocess_image_path(self, image_path: str | Path) -> np.ndarray:
        """Same verified keras preprocessing from a filesystem path."""
        self.ensure_loaded()
        assert self._tf is not None

        path = Path(image_path)
        if not path.exists() or not path.is_file():
            raise FileNotFoundError(f"Image not found: {path}")

        try:
            image = self._tf.keras.utils.load_img(
                str(path),
                target_size=INPUT_SIZE,
            )
            array = self._tf.keras.utils.img_to_array(image)
        except Exception as exc:  # noqa: BLE001
            raise ValueError(f"Invalid image: {exc}") from exc

        return self._tf.expand_dims(array, axis=0)

    def predict_from_array(self, batch: np.ndarray) -> dict[str, Any]:
        """Run model.predict on a preprocessed batch; return verified mapping."""
        self.ensure_loaded()
        assert self.model is not None

        predictions = self.model.predict(batch, verbose=0)[0]
        predictions = np.asarray(predictions, dtype=np.float64)

        if predictions.shape != (len(CLASS_NAMES),):
            raise RuntimeError(
                f"Unexpected model output shape: {predictions.shape}"
            )

        index = int(np.argmax(predictions))
        confidence = float(predictions[index])
        predicted_class = CLASS_NAMES[index]
        probabilities = {
            CLASS_NAMES[i]: float(predictions[i]) for i in range(len(CLASS_NAMES))
        }

        return {
            "class": predicted_class,
            "index": index,
            "confidence": confidence,
            "probabilities": probabilities,
        }

    def predict_bytes(self, image_bytes: bytes) -> dict[str, Any]:
        batch = self.preprocess_image_bytes(image_bytes)
        return self.predict_from_array(batch)

    def predict_path(self, image_path: str | Path) -> dict[str, Any]:
        batch = self.preprocess_image_path(image_path)
        return self.predict_from_array(batch)

    def model_info(self) -> dict[str, Any]:
        return {
            "model": "EfficientNetB0",
            "input_size": [224, 224, 3],
            "classes": list(CLASS_NAMES),
            "preprocessing": {
                "resize": [224, 224],
                "color": "RGB",
                "external_scaling": False,
            },
            "model_file": self.model_path.name if self.model_path else None,
            "model_loaded": self.model_loaded,
        }


# Shared instance used by FastAPI and CLI
model_service = ModelService()
