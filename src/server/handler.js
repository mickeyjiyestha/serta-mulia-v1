const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");

async function postPredictHandler(request, h) {
  const { image } = request.payload; // Extract the image from the request payload
  const { model } = request.server.app; // Get the model from the server app context

  // Perform prediction
  const { confidenceScore, label, explanation, suggestion } =
    await predictClassification(model, image);

  // Generate a unique ID and timestamp
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // Prepare the data to be stored
  const data = {
    id: id,
    result: label,
    explanation: explanation,
    suggestion: suggestion,
    confidenceScore: confidenceScore,
    createdAt: createdAt,
  };

  // Store the data in Firestore
  await storeData(id, data); // Move this line after 'id' and 'data' are defined

  // Prepare the response
  const response = h.response({
    status: "success",
    message:
      confidenceScore > 99
        ? "Model is predicted successfully."
        : "Model is predicted successfully but under threshold. Please use the correct picture",
    data,
  });
  response.code(201);
  return response;
}

module.exports = postPredictHandler;
