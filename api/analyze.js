export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
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

    console.log("AI response:", result);

    // If HuggingFace returns error
    if (!Array.isArray(result)) {
      return res.status(200).json({
        disease: "Model loading or error",
        confidence: 0
      });
    }

    const prediction = result[0];

    res.status(200).json({
      disease: prediction.label,
      confidence: (prediction.score * 100).toFixed(2)
    });

  } catch (error) {
    console.error("Inference error:", error);
    res.status(500).json({ error: "Inference failed" });
  }
}