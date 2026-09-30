# Tomato Sorting System

AI-powered tomato quality grading with a React dashboard and a FastAPI inference service.

## Architecture

```text
frontend/     React 19 + TypeScript + Vite + Tailwind dashboard
backend/      FastAPI + TensorFlow/Keras EfficientNetB0 inference
hardware/     ESP32 / IoT (reserved — not wired in this phase)
docs/         notes + verified test images
```

## Prediction flow

```text
Image
  ↓
React frontend (:5173)
  ↓  HTTP  VITE_API_URL
FastAPI backend (:8001)
  ↓
best_tomato_finetuned.keras  (EfficientNetB0)
  ↓
Prediction JSON
  ↓
React display
```

Verified classes (index order):

```text
0 → Damaged
1 → Old
2 → Ripe
3 → Unripe
```

## Requirements

- Node.js 18+ (frontend)
- Python 3.13 + TensorFlow 2.21 / Keras 3.x (backend)  
  Example: `C:\Users\Priyanka\venv` used during local verification

## Environment

### Backend — `backend/.env`

```text
MODEL_PATH=./weights/best_tomato_finetuned.keras
PORT=8001
HOST=127.0.0.1
```

### Frontend — `frontend/.env`

```text
VITE_API_URL=http://127.0.0.1:8001
```

Do **not** point the frontend at port `8000` (another unrelated Desktop service).

## Running locally

### Terminal 1 — Backend

```bash
cd backend
# activate your TF/Keras 3 environment first
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Verified Windows command:

```bash
cd C:\Users\Priyanka\Downloads\Tomato_Sorting_System\backend
C:\Users\Priyanka\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Service + model load status |
| GET | `/api/model-info` | Architecture / classes / preprocessing |
| POST | `/api/predict` | Multipart `image` → verified model prediction |

## Model

- File: `backend/weights/best_tomato_finetuned.keras`
- Backbone: EfficientNetB0
- Input: 224×224×3 RGB, float32 **0–255** (no external `/255`)
- Do not retrain, convert, or re-save this file for local inference

## Direct model CLI

```bash
cd backend
python test_model.py path/to/image.jpg
```

## Consistency tests

With the API running on `:8001`:

```bash
cd backend
python tests/consistency_test.py

cd ../frontend
node scripts/consistency_check.mjs
```

Verified images live in `docs/testdata/`.

## Notes

- The Google Colab HTML dump is **not** part of this application root.
- MongoDB / ESP32 integration are intentionally deferred until this stack stays stable.
