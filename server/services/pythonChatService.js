/**
 * Python ML Chatbot Bridge Service
 * ====================================
 * Calls the trained scikit-learn model via predict.py and returns structured
 * intent + response data to the Express assistant route.
 *
 * Falls back to geminiService if:
 *  - Python/model not available
 *  - Confidence score < threshold
 *  - Query requires live database context (offer prices, stock)
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PREDICT_SCRIPT = path.join(__dirname, "../ai/predict.py");
const ML_CONFIDENCE_MIN = 0.40;   // below this → augment with Gemini
const PYTHON_TIMEOUT_MS = 8000;   // 8s max for Python subprocess

/**
 * Call the Python inference engine with a user query.
 * @param {string} query - Raw user message
 * @returns {Promise<{intent: string, confidence: number, response: string, source: string}>}
 */
export async function queryPythonChatbot(query) {
  return new Promise((resolve) => {
    const python = spawn("python", [PREDICT_SCRIPT, "--json"], {
      timeout: PYTHON_TIMEOUT_MS,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    const payload = JSON.stringify({ query: query.trim() });
    let stdout = "";
    let stderr = "";

    python.stdin.write(payload);
    python.stdin.end();

    python.stdout.on("data", (data) => { stdout += data.toString(); });
    python.stderr.on("data", (data) => { stderr += data.toString(); });

    python.on("close", (code) => {
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch {
        console.warn("[PythonChatService] Parse error:", stderr || stdout);
        resolve({
          intent: "UNKNOWN",
          confidence: 0,
          response: null,
          source: "error",
        });
      }
    });

    python.on("error", (err) => {
      console.warn("[PythonChatService] Spawn error:", err.message);
      resolve({
        intent: "UNKNOWN",
        confidence: 0,
        response: null,
        source: "error",
      });
    });
  });
}

/**
 * Determine if the ML model result is sufficient or needs Gemini augmentation.
 * @param {object} mlResult - Result from queryPythonChatbot
 * @returns {boolean}
 */
export function needsGeminiAugmentation(mlResult) {
  if (!mlResult || mlResult.source === "error") return true;
  if (mlResult.confidence < ML_CONFIDENCE_MIN) return true;
  // Intents that benefit from live DB context
  const liveIntents = ["OFFERS_SEARCH", "FOOD_INQUIRY", "FOOTWEAR_INQUIRY",
                        "FASHION_INQUIRY", "ELECTRONICS_INQUIRY", "JEWELLERY_INQUIRY",
                        "STORE_INQUIRY"];
  return liveIntents.includes(mlResult.intent);
}
