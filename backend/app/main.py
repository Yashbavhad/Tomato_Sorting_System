"""
Tomato AI FastAPI inference service.

Endpoints:
  GET  /api/health
  GET  /api/model-info
  POST /api/predict
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load backend/.env before model path resolution
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from app.services.model_service import model_service


@asynccontextmanager
async def lifespan(_app: FastAPI):
    model_service.load()
    yield


app = FastAPI(
    title="Tomato AI Inference Service",
    version="1.0.0",
    lifespan=lifespan,
)

# Development frontend origins (Vite default port 5173)
_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {
        "status": "ok" if model_service.model_loaded else "error",
        "model_loaded": model_service.model_loaded,
        **(
            {"error": model_service.load_error}
            if not model_service.model_loaded and model_service.load_error
            else {}
        ),
    }


@app.get("/api/model-info")
def model_info():
    if not model_service.model_loaded:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "AI model unavailable",
                "detail": model_service.load_error,
            },
        )
    return model_service.model_info()


@app.post("/api/predict")
async def predict(image: UploadFile = File(...)):
    if not model_service.model_loaded:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "AI model unavailable",
                "detail": model_service.load_error,
            },
        )

    if image is None or not image.filename:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": "No image file provided"},
        )

    content_type = (image.content_type or "").lower()
    if content_type and not (
        content_type.startswith("image/")
        or content_type in {"application/octet-stream"}
    ):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": f"Invalid content type: {content_type}",
            },
        )

    try:
        raw = await image.read()
        if not raw:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Empty image file"},
            )
        prediction = model_service.predict_bytes(raw)
        return {"success": True, "prediction": prediction}
    except ValueError as exc:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(exc)},
        )
    except RuntimeError as exc:
        return JSONResponse(
            status_code=503,
            content={"success": False, "error": "AI model unavailable", "detail": str(exc)},
        )
    except Exception as exc:  # noqa: BLE001
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "Prediction failed", "detail": str(exc)},
        )
