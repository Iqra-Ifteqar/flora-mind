const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const treatments = require("./treatments");

const app = express();

// IMPORTANT: handle raw image upload
app.use(cors());
app.use(express.raw({ type: "*/*", limit: "10mb" }));

app.post("/api/analyze", async (req, res) => {
  try {
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({
        disease: "No image received",
        confidence: "0",
        treatment: "Please upload a valid image."
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/octet-stream"
        },
        body: req.body
      }
    );

    const result = await response.json();
    console.log("HF response:", result);

    // Model loading case
    if (!Array.isArray(result) || result.length === 0) {
      return res.json({
        disease: "Model loading",
        confidence: "0",
        treatment: "AI model is starting. Try again in a few seconds."
      });
    }

    const prediction = result[0];
    const diseaseName = prediction.label.replace(/___/g, " ").trim();
    const confidence = prediction.score;

    // Reject weak predictions
    if (confidence < 0.4) {
      return res.json({
        disease: "Upload a valid plant image",
        confidence: "0",
        treatment: "Please upload a clear image of a plant leaf."
      });
    }

    const treatmentInfo =
      treatments[diseaseName] ||
      treatments[diseaseName.replace(" with ", " ")];

    const treatment = treatmentInfo || "Treatment information unavailable.";

    res.json({
      disease: diseaseName,
      confidence: (confidence * 100).toFixed(2),
      treatment: treatment
    });

  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      disease: "Error",
      confidence: "0",
      treatment: "AI service failed."
    });
  }
});

// 🔥 CRITICAL FIX FOR RENDER
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});