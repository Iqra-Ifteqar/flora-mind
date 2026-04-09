from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import random

app = FastAPI(title="Flora Mind API")

# Allow frontend (Vite runs on 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# ROOT ROUTE
# -----------------------------
@app.get("/")
def root():
    return {"message": "Flora Mind API is running 🚀"}

# -----------------------------
# PREDICT ROUTE
# -----------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # Fake AI Model (for submission demo)
        diseases = [
            {
                "name": "Leaf Blight",
                "treatment": "Apply copper-based fungicide weekly."
            },
            {
                "name": "Powdery Mildew",
                "treatment": "Spray neem oil every 7 days."
            },
            {
                "name": "Healthy Plant",
                "treatment": "No treatment required."
            },
        ]

        prediction = random.choice(diseases)
        confidence = round(random.uniform(85, 99), 2)

        return {
            "status": "success",
            "disease": prediction["name"],
            "confidence": confidence,
            "treatment": prediction["treatment"]
        }

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )