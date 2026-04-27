import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
import cv2

app = Flask(__name__)
CORS(app)

# ── LOAD MODEL ─────────────────────────────────────────────────────────────────
MODEL_PATH = 'plant_disease_model_finetuned.h5'
print(f"Loading model from: {os.path.abspath(MODEL_PATH)}")
try:
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"!!! Error loading model: {e}")
    model = None

# ── LOAD CLASS NAMES ───────────────────────────────────────────────────────────
CLASS_NAMES_PATH = 'class_names.txt'
try:
    with open(CLASS_NAMES_PATH, 'r') as f:
        class_names = [line.strip() for line in f.readlines()]
    print(f"Class names loaded ({len(class_names)} classes).")
except Exception as e:
    print(f"!!! Error loading class names: {e}")
    class_names = []

# ── LOAD DISEASE ENCYCLOPEDIA ──────────────────────────────────────────────────
DISEASES_JSON_PATH = 'diseases.json'
try:
    with open(DISEASES_JSON_PATH, 'r') as f:
        disease_encyclopedia_data = json.load(f)
    print("Disease encyclopedia data loaded.")
except Exception as e:
    print(f"!!! Error loading encyclopedia: {e}")
    disease_encyclopedia_data = []

# ── TOMATO CLASSES (only these are valid) ─────────────────────────────────────
TOMATO_CLASSES = {
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy",
}

# ── TREATMENT DATABASE ─────────────────────────────────────────────────────────
TREATMENTS = {
    "Tomato___Late_blight": {
        "description": "Caused by Phytophthora infestans. Spreads rapidly in wet, cool conditions. Can destroy an entire crop within days.",
        "stage_1": {
            "label": "Early Infection (< 15% damage)",
            "organic": "Spray neem oil 3% solution every 5 days. Remove affected leaves immediately. Improve air circulation around plants.",
            "chemical": "Apply Chlorothalonil 0.2% preventively every 7 days. Avoid wetting foliage during application."
        },
        "stage_2": {
            "label": "Moderate Infection (15–40% damage)",
            "organic": "Bordeaux mixture (copper sulfate + lime). Prune heavily infected branches. Use compost tea spray.",
            "chemical": "Mancozeb + Metalaxyl combination spray every 5 days. Rotate fungicides to avoid resistance."
        },
        "stage_3": {
            "label": "Severe Infection (> 40% damage)",
            "organic": "Remove and destroy entire plant. Do NOT compost. Solarize soil before replanting.",
            "chemical": "Cymoxanil 0.3% as last resort. If >60% damage, immediate crop removal is recommended."
        }
    },
    "Tomato___Early_blight": {
        "description": "Caused by Alternaria solani. Appears as dark concentric rings (target-like spots) on older leaves first.",
        "stage_1": {
            "label": "Early Infection (< 15% damage)",
            "organic": "Baking soda spray (1 tsp/liter). Remove lower infected leaves. Mulch around base to prevent soil splash.",
            "chemical": "Mancozeb 0.25% spray every 7–10 days."
        },
        "stage_2": {
            "label": "Moderate Infection (15–40% damage)",
            "organic": "Copper fungicide spray. Increase plant spacing for airflow. Remove all visibly affected leaves.",
            "chemical": "Chlorothalonil + Azoxystrobin combination. Apply every 5–7 days."
        },
        "stage_3": {
            "label": "Severe Infection (> 40% damage)",
            "organic": "Heavy defoliation of lower 50% of plant. Apply compost tea to boost plant immunity.",
            "chemical": "Propiconazole 0.1% systemic fungicide. Immediate aggressive treatment required."
        }
    },
    "Tomato___Leaf_Mold": {
        "description": "Caused by Passalora fulva. Thrives in high humidity environments, especially in greenhouses.",
        "stage_1": {
            "label": "Early Infection (< 15% damage)",
            "organic": "Reduce humidity. Improve ventilation. Spray diluted milk solution (1:9 ratio with water).",
            "chemical": "Mancozeb preventive spray. Avoid overhead irrigation."
        },
        "stage_2": {
            "label": "Moderate Infection (15–40% damage)",
            "organic": "Remove infected leaves. Spray copper-based fungicide. Reduce watering frequency.",
            "chemical": "Chlorothalonil or Thiram spray every 5–7 days."
        },
        "stage_3": {
            "label": "Severe Infection (> 40% damage)",
            "organic": "Remove heavily infected plants. Sterilize all greenhouse equipment.",
            "chemical": "Systemic fungicide Myclobutanil 0.1%. Consider full crop removal if uncontrollable."
        }
    },
    "Tomato___Target_Spot": {
        "description": "Caused by Corynespora cassiicola. Shows distinctive target-like circular lesions on leaves and fruit.",
        "stage_1": {
            "label": "Early Infection (< 15% damage)",
            "organic": "Neem oil spray every 7 days. Remove affected leaves. Avoid leaf wetness during watering.",
            "chemical": "Azoxystrobin 0.1% spray every 7–10 days."
        },
        "stage_2": {
            "label": "Moderate Infection (15–40% damage)",
            "organic": "Copper oxychloride spray. Increase plant spacing for better air circulation.",
            "chemical": "Difenoconazole + Azoxystrobin combination spray."
        },
        "stage_3": {
            "label": "Severe Infection (> 40% damage)",
            "organic": "Aggressive pruning of all infected parts. Soil solarization after crop removal.",
            "chemical": "Tebuconazole systemic fungicide as emergency treatment."
        }
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "description": "Caused by Tetranychus urticae. Tiny mites cause stippling, bronzing, and webbing on leaves. Thrives in hot, dry conditions.",
        "stage_1": {
            "label": "Early Infestation (< 15% damage)",
            "organic": "Blast leaves with strong water spray. Introduce predatory mites (Phytoseiidae). Apply neem oil spray.",
            "chemical": "Abamectin 0.02% spray. Target undersides of leaves thoroughly."
        },
        "stage_2": {
            "label": "Moderate Infestation (15–40% damage)",
            "organic": "Insecticidal soap spray every 3 days. Remove all heavily webbed leaves.",
            "chemical": "Bifenazate or Hexythiazox miticide. Rotate chemicals to prevent resistance."
        },
        "stage_3": {
            "label": "Severe Infestation (> 40% damage)",
            "organic": "Remove and destroy plant if infestation is out of control.",
            "chemical": "Spiromesifen systemic miticide. Apply 2–3 times at 5-day intervals."
        }
    },
    "Tomato___Bacterial_spot": {
        "description": "Caused by Xanthomonas species. Starts as water-soaked spots that turn dark, raised, and scabby on leaves and fruit.",
        "stage_1": {
            "label": "Early Infection (< 15% damage)",
            "organic": "Copper-based bactericide spray. Avoid overhead watering. Remove affected leaves promptly.",
            "chemical": "Copper hydroxide 0.3% spray every 7 days."
        },
        "stage_2": {
            "label": "Moderate Infection (15–40% damage)",
            "organic": "Bordeaux mixture spray. Strict sanitation — sterilize all tools between plants.",
            "chemical": "Streptomycin sulfate + Copper combination spray."
        },
        "stage_3": {
            "label": "Severe Infection (> 40% damage)",
            "organic": "Remove infected plants immediately. Do not save seeds from infected crops.",
            "chemical": "Aggressive copper bactericide program. Crop removal likely necessary."
        }
    },
    "Tomato___Septoria_leaf_spot": {
        "description": "Caused by Septoria lycopersici. Circular spots with dark borders and light centers, often with tiny black dots (pycnidia) inside.",
        "stage_1": {
            "label": "Early Infection (< 15% damage)",
            "organic": "Remove infected lower leaves. Mulch to prevent soil splash. Neem oil spray weekly.",
            "chemical": "Chlorothalonil 0.2% spray every 7 days."
        },
        "stage_2": {
            "label": "Moderate Infection (15–40% damage)",
            "organic": "Copper fungicide spray. Stake plants to improve air circulation.",
            "chemical": "Mancozeb + Azoxystrobin spray every 5–7 days."
        },
        "stage_3": {
            "label": "Severe Infection (> 40% damage)",
            "organic": "Heavy defoliation of all visibly infected leaves. Compost tea drench for soil microbiome boost.",
            "chemical": "Propiconazole 0.1% systemic treatment immediately."
        }
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "description": "A viral disease spread by whiteflies (Bemisia tabaci). Causes severe leaf curling, yellowing, and stunted growth. No cure exists.",
        "stage_1": {
            "label": "Early Symptoms",
            "organic": "Immediately control whitefly population with yellow sticky traps. Apply neem oil to repel insects.",
            "chemical": "Imidacloprid soil drench to kill whitefly vectors. Remove and bag infected plants."
        },
        "stage_2": {
            "label": "Moderate Symptoms",
            "organic": "Remove and destroy all infected plants. Use reflective mulch to deter whiteflies.",
            "chemical": "Thiamethoxam spray for whitefly control. No treatment for the virus itself."
        },
        "stage_3": {
            "label": "Severe Symptoms",
            "organic": "Full crop removal. Grow resistant varieties in next cycle.",
            "chemical": "Complete crop destruction recommended. Apply insecticide to prevent spread to neighboring plants."
        }
    },
    "Tomato___Tomato_mosaic_virus": {
        "description": "A highly contagious viral disease causing mottled light/dark green mosaic patterns. Spread by contact, tools, and sometimes insects.",
        "stage_1": {
            "label": "Early Symptoms",
            "organic": "Remove infected plants immediately. Sanitize hands and tools with 10% bleach solution. Avoid tobacco near plants.",
            "chemical": "No chemical cure. Focus on controlling aphid vectors with insecticidal soap."
        },
        "stage_2": {
            "label": "Moderate Symptoms",
            "organic": "Destroy all infected plants. Plant resistant varieties for next season.",
            "chemical": "No chemical treatment effective against the virus. Remove all infected material."
        },
        "stage_3": {
            "label": "Severe Symptoms",
            "organic": "Complete crop removal. Sterilize all tools and equipment before reuse.",
            "chemical": "No treatment available. Full crop removal and sanitation is the only option."
        }
    },
    "Tomato___healthy": {
        "description": "Plant appears healthy. No disease detected.",
        "stage_1": {
            "label": "Healthy — No Disease",
            "organic": "Maintain regular neem oil preventive spray every 14 days. Ensure good airflow and avoid overwatering.",
            "chemical": "No chemical treatment needed. Consider a balanced NPK fertilizer to maintain plant health."
        },
        "stage_2": {"label": "Healthy", "organic": "No action needed.", "chemical": "No action needed."},
        "stage_3": {"label": "Healthy", "organic": "No action needed.", "chemical": "No action needed."}
    }
}

# ── TOMATO DETECTOR (checks if image looks like a tomato leaf) ─────────────────
def is_tomato_leaf(img_bytes):
    """
    Simple heuristic: checks if the image contains enough green/leaf-like pixels.
    Returns True if it's likely a leaf image.
    """
    np_arr = np.frombuffer(img_bytes, np.uint8)
    cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if cv_img is None:
        return False, 0

    hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    total_pixels = cv_img.shape[0] * cv_img.shape[1]

    # Green range (healthy leaf)
    green_mask = cv2.inRange(hsv, (25, 30, 30), (90, 255, 255))
    # Yellow-brown range (diseased leaf tissue)
    yellow_mask = cv2.inRange(hsv, (15, 30, 30), (35, 255, 255))
    brown_mask  = cv2.inRange(hsv, (5, 30, 20), (20, 255, 200))

    leaf_pixels = (
        cv2.countNonZero(green_mask) +
        cv2.countNonZero(yellow_mask) +
        cv2.countNonZero(brown_mask)
    )
    leaf_ratio = leaf_pixels / total_pixels
    # Require at least 25% leaf-like pixels
    return leaf_ratio >= 0.25, round(leaf_ratio * 100, 1)


# ── DISEASE STAGE ANALYZER ─────────────────────────────────────────────────────
def get_disease_stage(img_bytes, disease_label):
    if "healthy" in disease_label.lower():
        return {"stage": 0, "label": "No Disease Detected", "damage_pct": 0}

    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        return {"stage": -1, "label": "Image unclear, retake photo", "damage_pct": 0}

    h, w = img.shape[:2]
    margin_h, margin_w = int(h * 0.15), int(w * 0.15)
    img = img[margin_h:h - margin_h, margin_w:w - margin_w]

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    green_mask    = cv2.inRange(hsv, (35, 40, 40), (85, 255, 255))
    yellow_mask   = cv2.inRange(hsv, (20, 40, 40), (35, 255, 255))
    brown_mask    = cv2.inRange(hsv, (10, 30, 20), (20, 255, 180))
    diseased_mask = cv2.bitwise_or(yellow_mask, brown_mask)

    green_px    = cv2.countNonZero(green_mask)
    diseased_px = cv2.countNonZero(diseased_mask)
    total_leaf  = green_px + diseased_px

    if total_leaf < 800:
        return {"stage": -1, "label": "Image unclear — retake photo", "damage_pct": 0}

    ratio = diseased_px / total_leaf

    if ratio < 0.15:
        return {"stage": 1, "label": "Stage 1 — Early Infection",    "damage_pct": round(ratio * 100, 1)}
    elif ratio < 0.40:
        return {"stage": 2, "label": "Stage 2 — Moderate Infection", "damage_pct": round(ratio * 100, 1)}
    else:
        return {"stage": 3, "label": "Stage 3 — Severe Infection",   "damage_pct": round(ratio * 100, 1)}


# ── IMAGE PREPROCESSOR ─────────────────────────────────────────────────────────
def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {e}")
        return None


# ── PREDICT ENDPOINT ───────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    if model is None or not class_names:
        return jsonify({'error': 'Model or class names not loaded properly'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        image_bytes = file.read()

        # ── Step 1: Check if image looks like a leaf ──────────────────────────
        is_leaf, leaf_coverage = is_tomato_leaf(image_bytes)
        if not is_leaf:
            return jsonify({
                'error': 'not_a_plant',
                'message': 'No plant/leaf detected in the image. Please upload a clear photo of a tomato leaf.'
            }), 400

        # ── Step 2: Run CNN model ─────────────────────────────────────────────
        processed_image = preprocess_image(image_bytes)
        if processed_image is None:
            return jsonify({'error': 'Error processing image file'}), 400

        prediction = model.predict(processed_image)
        predicted_class_index = int(np.argmax(prediction[0]))
        confidence = float(np.max(prediction[0])) * 100

        if predicted_class_index >= len(class_names):
            return jsonify({'error': 'Prediction index out of bounds'}), 500

        predicted_class_name = class_names[predicted_class_index]

        # ── Step 3: Check if it's a tomato class ─────────────────────────────
        if predicted_class_name not in TOMATO_CLASSES:
            return jsonify({
                'error': 'not_tomato',
                'message': f'This appears to be a {predicted_class_name.split("___")[0]} plant, not a tomato. This tool is designed for tomato disease detection only.',
                'detected_plant': predicted_class_name.split("___")[0]
            }), 400

        # ── Step 4: Severity staging via OpenCV ──────────────────────────────
        stage_info = get_disease_stage(image_bytes, predicted_class_name)
        stage_num  = stage_info["stage"]
        stage_key  = f"stage_{max(stage_num, 1)}"

        # ── Step 5: Get treatment data ────────────────────────────────────────
        treatment_data = TREATMENTS.get(predicted_class_name, {})
        treatment      = treatment_data.get(stage_key, {
            "label": "Unknown stage",
            "organic": "Consult a local agronomist.",
            "chemical": "Consult a local agronomist."
        })

        # ── Step 6: Build response ────────────────────────────────────────────
        response = {
            'prediction':     predicted_class_name,
            'disease_name':   predicted_class_name.replace("Tomato___", "").replace("_", " "),
            'confidence':     f"{confidence:.2f}%",
            'is_healthy':     "healthy" in predicted_class_name.lower(),
            'description':    treatment_data.get("description", ""),
            'stage': {
                'number':     stage_info["stage"],
                'label':      stage_info["label"],
                'damage_pct': stage_info["damage_pct"],
            },
            'treatment': {
                'stage_label': treatment.get("label", ""),
                'organic':     treatment.get("organic", ""),
                'chemical':    treatment.get("chemical", ""),
            }
        }
        return jsonify(response)

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# ── ENCYCLOPEDIA ENDPOINT ──────────────────────────────────────────────────────
@app.route('/diseases', methods=['GET'])
def get_diseases():
    return jsonify(disease_encyclopedia_data if disease_encyclopedia_data else [])


# ── HEALTH CHECK ───────────────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "running", "model": "plant_disease_tomato_focused"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)