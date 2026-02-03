import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import axios from "axios";

// Ensure environment variables are loaded in case this module is imported
// before the application entry point calls dotenv.config().
dotenv.config();

// Prefer explicit GOOGLE_API_KEY but fall back to GEMINI_API_KEY
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL = "gemini-3-flash-preview";
// fast + cheap + production friendly

export const callGemini = async (systemPrompt, userPrompt) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\n${userPrompt}`,
          },
        ],
      },
    ],
  });

  return response.text || "";
}

// Image generation using Google Generative API (robust: timeout + retries)
export const generateImageWithGemini = async ({
  prompt,
  numberOfImages = 1,
}) => {
  if (!API_KEY) {
    throw new Error(
      "Image generation requires GOOGLE_API_KEY or GEMINI_API_KEY to be set"
    );
  }

  const model = "imagen-4.0-generate-001";

  const timeoutMs = Number(process.env.AI_IMAGE_TIMEOUT || 180000); // 3 min
  const maxRetries = Number(process.env.AI_IMAGE_RETRIES || 2);

  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    try {
      attempt++;

      const callPromise = ai.models.generateImages({
        model,
        prompt,
        config: {
          numberOfImages,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          const err = new Error("Request Timeout");
          err.http_code = 504;
          reject(err);
        }, timeoutMs)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);

      if (!response?.generatedImages?.length) {
        throw new Error("No images returned by Gemini Imagen");
      }

      // 🔥 Normalize output
      const images = response.generatedImages.map((img) => {
        const b64 = img?.image?.imageBytes;
        if (!b64) return null;
        return {
          b64_json: b64,
        };
      }).filter(Boolean);

      if (!images.length) {
        throw new Error("Invalid image data returned by Gemini Imagen");
      }

      // if only one image requested, return single
      if (numberOfImages === 1) {
        return images[0];
      }

      return images;
    } catch (err) {
      lastError = err;

      const statusCode = err?.http_code || err?.response?.status;
      const isTimeout = statusCode === 504;
      const isRateLimit = statusCode === 429;
      const isServerError = statusCode >= 500 && statusCode < 600;

      const shouldRetry = isTimeout || isRateLimit || isServerError;

      if (!shouldRetry || attempt > maxRetries) {
        const e = new Error(err?.message || "Image generation failed");
        e.http_code = statusCode || 500;
        throw e;
      }

      const backoff = Math.min(30000, 500 * Math.pow(2, attempt));
      console.warn(
        `Imagen attempt ${attempt} failed (status=${statusCode || "unknown"}). Retrying in ${backoff}ms...`
      );
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  throw new Error(
    lastError?.message || "Image generation failed after retries"
  );
};
// export default callGemini;
