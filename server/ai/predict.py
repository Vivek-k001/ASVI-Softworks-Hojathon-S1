#!/usr/bin/env python3
"""
PMNA Perks Chatbot Inference Engine
=====================================
Usage:
  python predict.py <query>
  echo '{"query": "biriyani offer"}' | python predict.py --json

Returns JSON to stdout for Node.js bridge consumption.
"""

import io
import json
import pickle
import sys
from pathlib import Path

# Force UTF-8 stdout so emoji in knowledge base JSON are preserved
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

MODEL_DIR = Path(__file__).parent
MODEL_PATH = MODEL_DIR / "pmna_chatbot_model.pkl"
KB_PATH = MODEL_DIR / "pmna_knowledge_base.json"

# Confidence threshold — below this, fall back to OFFERS_SEARCH
CONFIDENCE_THRESHOLD = 0.25


def load_artifacts():
    if not MODEL_PATH.exists():
        return None, None
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(KB_PATH, "r", encoding="utf-8") as f:
        kb_data = json.load(f)
    return model, kb_data["knowledge_base"]


def predict(query: str, model, knowledge_base: dict) -> dict:
    query = query.strip()
    if not query:
        return {"intent": "GREETING", "response": knowledge_base["GREETING"]["response"], "confidence": 1.0}

    # Predict intent
    intent = model.predict([query])[0]
    proba = max(model.predict_proba([query])[0])

    # Low confidence fallback
    if proba < CONFIDENCE_THRESHOLD:
        intent = "OFFERS_SEARCH"

    # Build response
    kb_entry = knowledge_base.get(intent, knowledge_base.get("HELP", {}))
    response = kb_entry.get("response", "I'm not sure about that. Try asking about food, footwear, fashion, or how to register your shop on PMNA!")

    return {
        "intent": intent,
        "confidence": round(float(proba), 4),
        "response": response,
        "source": "ml_model",
        "version": "2.0"
    }


def main():
    model, knowledge_base = load_artifacts()

    if model is None:
        result = {
            "intent": "ERROR",
            "response": "Chatbot model not trained yet. Please run train_chatbot.py first.",
            "confidence": 0,
            "source": "error"
        }
        print(json.dumps(result, ensure_ascii=False))
        sys.exit(0)

    # Support --json mode (stdin JSON) or positional arg
    if "--json" in sys.argv:
        raw = sys.stdin.read().strip()
        try:
            data = json.loads(raw)
            query = data.get("query", "")
        except json.JSONDecodeError:
            query = raw
    elif len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        # Interactive mode for testing
        query = input("Query: ").strip()

    result = predict(query, model, knowledge_base)
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
