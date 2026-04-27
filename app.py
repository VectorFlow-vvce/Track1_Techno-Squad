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
try:
    model = load_model(MODEL_PATH)
    print("✅ Model loaded.")
except Exception as e:
    print(f"❌ Model load error: {e}")
    model = None

# ── LOAD CLASS NAMES ───────────────────────────────────────────────────────────
try:
    with open('class_names.txt', 'r') as f:
        class_names = [line.strip() for line in f.readlines()]
    print(f"✅ {len(class_names)} class names loaded.")
except Exception as e:
    print(f"❌ class_names error: {e}")
    class_names = []

# ── LOAD disease_info.json ─────────────────────────────────────────────────────
try:
    with open('disease_info.json', 'r') as f:
        disease_info = json.load(f)
    print("✅ disease_info.json loaded.")
except Exception as e:
    print(f"❌ disease_info.json error: {e}")
    disease_info = {}

# ── LOAD diseases.json (encyclopedia) ─────────────────────────────────────────
try:
    with open('diseases.json', 'r') as f:
        disease_encyclopedia = json.load(f)
    print("✅ diseases.json loaded.")
except Exception as e:
    print(f"❌ diseases.json error: {e}")
    disease_encyclopedia = []

# ══════════════════════════════════════════════════════════════════════════════
# TOMATO-ONLY WHITELIST — everything else gets a hard error
# ══════════════════════════════════════════════════════════════════════════════
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

# ══════════════════════════════════════════════════════════════════════════════
# TOMATO DISEASE INFO — descriptions, precautions, risk_factors
# (Used as primary source; disease_info.json is fallback for additional detail)
# ══════════════════════════════════════════════════════════════════════════════
TOMATO_DISEASE_INFO = {
    "Tomato___Bacterial_spot": {
        "description": "Bacterial spot is caused by Xanthomonas species. It causes small, dark, water-soaked spots on leaves, stems, and fruit that enlarge and turn brown with yellow halos. Severely infected leaves drop prematurely, exposing fruit to sunscald.",
        "precautions": [
            "Use certified disease-free seeds and transplants.",
            "Avoid overhead irrigation — use drip irrigation at the base.",
            "Rotate crops with non-solanaceous plants for at least 2 years.",
            "Remove and destroy all plant debris after harvest.",
            "Sanitize all tools with 10% bleach solution after each plant."
        ],
        "risk_factors": [
            "Warm temperatures (24–30°C) with high humidity.",
            "Overhead watering or frequent rainfall causing leaf wetness.",
            "Using infected seeds or transplants.",
            "Dense planting with poor air circulation.",
            "Handling plants after touching infected material."
        ]
    },
    "Tomato___Early_blight": {
        "description": "Early blight, caused by Alternaria solani, produces dark brown spots with concentric rings (target-like appearance) mainly on lower, older leaves. Infected leaves yellow and drop, progressing upward through the plant if untreated.",
        "precautions": [
            "Plant in well-drained soil with good air circulation.",
            "Mulch around the base of plants to prevent soil splash.",
            "Remove infected lower leaves as soon as spots appear.",
            "Water at the base of plants — avoid wetting foliage.",
            "Use a 2–3 year crop rotation with non-solanaceous crops."
        ],
        "risk_factors": [
            "Warm temperatures (24–29°C) with wet or humid conditions.",
            "Infected plant debris in or on the soil.",
            "Nutrient-stressed or weakened plants.",
            "Overhead watering or rain splash.",
            "Plants with fruit — stress of fruit production increases susceptibility."
        ]
    },
    "Tomato___Late_blight": {
        "description": "Late blight, caused by Phytophthora infestans, is an extremely destructive disease capable of destroying an entire crop within days. It produces large, irregular, water-soaked dark lesions on leaves and stems, with white mold on the underside in humid conditions.",
        "precautions": [
            "Plant certified disease-free transplants only.",
            "Improve air circulation through proper plant spacing.",
            "Avoid overhead watering — use drip irrigation.",
            "Monitor weather closely and apply preventive fungicide before rain.",
            "Remove and destroy all plant debris after harvest."
        ],
        "risk_factors": [
            "Cool to mild temperatures (10–24°C) with high humidity or fog.",
            "Prolonged wet weather or overhead irrigation.",
            "Infected potato plants or volunteers growing nearby.",
            "Dense planting without adequate ventilation.",
            "No preventive fungicide program during wet seasons."
        ]
    },
    "Tomato___Leaf_Mold": {
        "description": "Leaf mold, caused by Passalora fulva, is primarily a greenhouse disease. It causes pale green to yellow spots on upper leaf surfaces and olive-green to grayish-purple velvety mold on the undersides. Leaves curl, wither, and drop if untreated.",
        "precautions": [
            "Maintain greenhouse relative humidity below 85%.",
            "Ensure adequate plant spacing and ventilation.",
            "Remove infected leaves immediately upon detection.",
            "Avoid overhead watering — water at the base only.",
            "Use resistant tomato varieties where possible."
        ],
        "risk_factors": [
            "High relative humidity (above 85%) in greenhouses.",
            "Poor air circulation and dense planting.",
            "Temperatures between 21–24°C with wet foliage.",
            "Infected plant debris in the growing area.",
            "Lack of ventilation in tunnels or greenhouses."
        ]
    },
    "Tomato___Septoria_leaf_spot": {
        "description": "Septoria leaf spot, caused by Septoria lycopersici, produces numerous small circular spots with dark brown borders and light gray or white centers. It begins on lower leaves and moves upward, causing progressive defoliation that reduces yield.",
        "precautions": [
            "Mulch around plants to prevent soil splash.",
            "Stake or cage plants for better air circulation.",
            "Remove and dispose of infected leaves immediately.",
            "Water at the base — avoid wetting foliage.",
            "Practice 2-year crop rotation with non-solanaceous crops."
        ],
        "risk_factors": [
            "Warm temperatures (20–25°C) with high humidity.",
            "Rain splash or overhead irrigation.",
            "Infected plant debris left in the field from previous season.",
            "Dense planting with poor air circulation.",
            "Weeds in the Solanaceae family acting as disease reservoirs."
        ]
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "description": "Two-spotted spider mites (Tetranychus urticae) are tiny arachnids that feed on plant cells, causing stippling (tiny yellow dots) on upper leaf surfaces, yellowing, bronzing, and eventually leaf death. Fine silk webbing on leaves is a distinctive sign of infestation.",
        "precautions": [
            "Keep plants well-watered — mites thrive on drought-stressed plants.",
            "Regularly inspect undersides of leaves for early detection.",
            "Avoid excessive nitrogen fertilization which promotes tender growth.",
            "Introduce natural predators like predatory mites (Phytoseiidae).",
            "Remove and destroy heavily infested plant parts immediately."
        ],
        "risk_factors": [
            "Hot, dry conditions (above 27°C) with low humidity.",
            "Drought-stressed or over-fertilized plants.",
            "Dust on leaves that suppresses natural predator populations.",
            "Overuse of broad-spectrum pesticides that kill natural enemies.",
            "Dense plantings with poor air movement."
        ]
    },
    "Tomato___Target_Spot": {
        "description": "Target spot, caused by Corynespora cassiicola, produces brown spots with concentric rings (bull's-eye pattern) on leaves, stems, and fruit. It causes significant defoliation and yield loss if untreated, and is particularly severe in warm, humid conditions.",
        "precautions": [
            "Plant in well-drained, well-ventilated areas.",
            "Remove infected plant material immediately.",
            "Avoid overhead irrigation.",
            "Practice crop rotation with non-solanaceous crops.",
            "Maintain good weed control around tomato plants."
        ],
        "risk_factors": [
            "Warm, humid conditions (especially above 80% relative humidity).",
            "Temperatures between 20–30°C.",
            "Dense planting and poor air circulation.",
            "Prolonged leaf wetness from rain or irrigation.",
            "Presence of infected debris from previous crops."
        ]
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "description": "Tomato Yellow Leaf Curl Virus (TYLCV) is transmitted by whiteflies (Bemisia tabaci). Infected plants show upward leaf curling, yellowing of leaf margins, plant stunting, and severe yield reduction. There is no cure — only vector control can stop its spread.",
        "precautions": [
            "Use TYLCV-resistant tomato varieties.",
            "Control whitefly populations with yellow sticky traps.",
            "Remove and destroy infected plants immediately.",
            "Use insect-proof netting in greenhouse production.",
            "Avoid planting near infected crops or weed reservoirs."
        ],
        "risk_factors": [
            "High populations of whitefly (Bemisia tabaci) in the area.",
            "Warm weather (above 25°C) favoring rapid whitefly reproduction.",
            "Presence of infected plants or weed reservoirs nearby.",
            "Late-season planting when whitefly populations peak.",
            "No insect barrier protection in greenhouse/tunnel production."
        ]
    },
    "Tomato___Tomato_mosaic_virus": {
        "description": "Tomato Mosaic Virus (ToMV) causes a mosaic pattern of light and dark green on leaves, leaf distortion, reduced fruit set, and stunting. It is mechanically transmitted through sap — highly contagious via hands, tools, and clothing touching infected plants.",
        "precautions": [
            "Use certified virus-free seeds and transplants.",
            "Wash hands thoroughly before and after handling plants.",
            "Disinfect tools with 10% bleach or 70% alcohol between plants.",
            "Remove and destroy infected plants immediately.",
            "Do not use tobacco products near tomato plants — tobacco carries the virus."
        ],
        "risk_factors": [
            "Handling plants after touching infected material without disinfection.",
            "Contaminated tools, stakes, or equipment.",
            "High aphid populations that can spread the virus.",
            "Infected seed material from untrusted sources.",
            "Workers who use tobacco products handling plants."
        ]
    },
    "Tomato___healthy": {
        "description": "Your tomato plant appears healthy with no signs of disease. Maintain good cultural practices to keep your plant thriving and productive throughout the growing season.",
        "precautions": [
            "Water consistently at the base — avoid wetting foliage.",
            "Apply balanced fertilizer every 2–3 weeks during active growth.",
            "Inspect leaves weekly for early signs of pest or disease.",
            "Maintain good air circulation through proper spacing and pruning.",
            "Mulch around the base to retain moisture and prevent soil splash."
        ],
        "risk_factors": [
            "Overwatering or underwatering can stress the plant and invite disease.",
            "Poor air circulation increases risk of fungal and bacterial disease.",
            "Extreme temperature fluctuations can cause blossom drop.",
            "Nutrient imbalances can weaken plant immunity.",
            "Nearby infected plants are a constant risk — scout regularly."
        ]
    }
}

# ══════════════════════════════════════════════════════════════════════════════
# STAGE-SPECIFIC REMEDIES per disease per stage
# ══════════════════════════════════════════════════════════════════════════════
STAGE_REMEDIES = {
    "Tomato___Bacterial_spot": {
        1: {
            "action":   "Monitor closely. Remove affected leaves and begin preventive sprays.",
            "organic":  ["Remove spotted leaves immediately — bag and discard, do not compost.", "Water only at base — never overhead.", "Spray copper-based bactericide every 7 days.", "Sanitize all tools with 10% bleach solution after each plant."],
            "chemical": ["Apply Copper Hydroxide 0.3% spray every 7 days.", "Use Acibenzolar-S-methyl (ASM) to boost systemic plant resistance."]
        },
        2: {
            "action":   "Act fast — aggressive pruning and spraying required to stop spread.",
            "organic":  ["Apply Bordeaux mixture (copper sulfate + lime) every 5 days.", "Heavily prune all infected branches — bag and destroy.", "Disinfect tools between every single plant cut."],
            "chemical": ["Streptomycin sulfate + Copper hydroxide combination spray.", "Apply every 5 days. Rotate bactericide types to prevent resistance."]
        },
        3: {
            "action":   "🚨 CRITICAL — Remove infected plants now to protect remaining crop.",
            "organic":  ["Remove and destroy entire infected plants immediately.", "Do NOT compost — bag and dispose in trash.", "Solarize soil with clear plastic for 4–6 weeks before replanting.", "Do not save seeds from any infected crops."],
            "chemical": ["Emergency copper bactericide at maximum label rate.", "If >60% of plants affected: full crop removal is the only option."]
        }
    },
    "Tomato___Early_blight": {
        1: {
            "action":   "Prune lower leaves and begin fungicide program immediately.",
            "organic":  ["Remove all lower infected leaves — dispose safely, do not compost.", "Mulch around plant base to stop soil splash spreading spores.", "Spray baking soda solution (1 tsp per liter water) every 7 days.", "Apply neem oil spray weekly."],
            "chemical": ["Mancozeb 0.25% spray every 7–10 days.", "Apply in early morning so leaves dry before evening."]
        },
        2: {
            "action":   "Intensify treatment — apply fungicide every 5 days, remove all infected material.",
            "organic":  ["Copper fungicide spray every 5 days.", "Remove ALL visibly infected leaves immediately.", "Increase plant spacing to improve airflow.", "Apply Bacillus subtilis biofungicide as soil drench."],
            "chemical": ["Chlorothalonil + Azoxystrobin combination spray every 5–7 days.", "Rotate fungicide classes each application to prevent resistance."]
        },
        3: {
            "action":   "🚨 EMERGENCY — Systemic fungicide + aggressive defoliation required now.",
            "organic":  ["Defoliate lower 50% of plant — remove every visibly infected leaf.", "Apply compost tea drench at root zone to boost plant immunity.", "Heavy copper fungicide spray on all remaining foliage."],
            "chemical": ["Propiconazole 0.1% systemic fungicide immediately.", "Follow up with Mancozeb spray every 5 days.", "Consider full crop removal if >70% defoliated."]
        }
    },
    "Tomato___Late_blight": {
        1: {
            "action":   "Act immediately — Late blight spreads devastatingly fast in wet weather.",
            "organic":  ["Remove and bag all affected leaves at once — do not compost.", "Spray Neem oil 3% solution every 5 days.", "Prune dense foliage to improve air circulation urgently.", "Stop all overhead watering immediately."],
            "chemical": ["Chlorothalonil 0.2% preventive spray every 7 days.", "Begin a scheduled fungicide rotation program immediately."]
        },
        2: {
            "action":   "🚨 URGENT — Late blight at this stage can destroy your entire crop within days.",
            "organic":  ["Bordeaux mixture (copper sulfate + lime) spray every 4–5 days.", "Prune and destroy all heavily infected branches — bag immediately.", "Ensure no wet foliage remains overnight."],
            "chemical": ["Mancozeb + Metalaxyl combination spray every 5 days.", "Rotate with Cymoxanil to prevent resistance.", "Spray undersides of all leaves thoroughly."]
        },
        3: {
            "action":   "🚨 CRITICAL — Crop loss likely. Remove plants immediately to save rest of field.",
            "organic":  ["Remove and destroy ENTIRE plant — bag immediately, never compost.", "Solarize soil with clear plastic for 4–6 weeks before replanting.", "Treat surrounding soil with copper sulfate drench."],
            "chemical": ["Cymoxanil 0.3% as last resort if <40% of plant remains.", "If >60% damage: immediate full crop removal is the only option.", "Apply fungicide to surrounding healthy plants as emergency protection."]
        }
    },
    "Tomato___Leaf_Mold": {
        1: {
            "action":   "Reduce humidity and improve airflow immediately. Start preventive spray program.",
            "organic":  ["Reduce greenhouse humidity below 85% urgently.", "Improve ventilation — open vents, add fans.", "Spray diluted milk solution (1 part milk : 9 parts water) weekly.", "Remove infected lower leaves and dispose."],
            "chemical": ["Mancozeb preventive spray every 7–10 days.", "Avoid all overhead irrigation."]
        },
        2: {
            "action":   "Aggressive ventilation + fungicide program. Remove all visible infected leaves.",
            "organic":  ["Copper-based fungicide spray every 5 days.", "Remove all infected leaves immediately — bag them.", "Drastically reduce watering frequency.", "Install fans for continuous air movement."],
            "chemical": ["Chlorothalonil or Thiram spray every 5–7 days.", "Ensure full coverage of both upper and lower leaf surfaces."]
        },
        3: {
            "action":   "🚨 CRITICAL — Full crop removal and greenhouse sterilization likely necessary.",
            "organic":  ["Remove and destroy all heavily infected plants.", "Sterilize all greenhouse surfaces, tools, and equipment with bleach.", "Fumigate greenhouse before any replanting."],
            "chemical": ["Systemic fungicide Myclobutanil 0.1% immediately.", "If uncontrollable — full crop removal and complete greenhouse sterilization."]
        }
    },
    "Tomato___Septoria_leaf_spot": {
        1: {
            "action":   "Remove infected leaves + mulch immediately. Begin fungicide spray program.",
            "organic":  ["Remove all spotted lower leaves — bag and dispose immediately.", "Apply mulch around base to stop soil splash spreading spores.", "Neem oil spray every 7 days.", "Stake plants to improve airflow."],
            "chemical": ["Chlorothalonil 0.2% spray every 7 days starting at first sign."]
        },
        2: {
            "action":   "Intensify removal and spraying. Rotate fungicides to avoid resistance.",
            "organic":  ["Copper fungicide spray every 5 days.", "Prune for better air circulation.", "Remove every leaf showing spots — dispose safely."],
            "chemical": ["Mancozeb + Azoxystrobin combination spray every 5–7 days.", "Rotate with Chlorothalonil each application."]
        },
        3: {
            "action":   "🚨 EMERGENCY — Systemic fungicide + aggressive defoliation needed now.",
            "organic":  ["Heavy defoliation of all visibly infected leaves.", "Compost tea drench around root zone to boost immunity.", "Copper fungicide at maximum label rate on remaining foliage."],
            "chemical": ["Propiconazole 0.1% systemic treatment immediately.", "Follow with Mancozeb spray every 5 days."]
        }
    },
    "Tomato___Spider_mites Two-spotted_spider_mite": {
        1: {
            "action":   "Water blast daily + neem oil. Check undersides every 2 days.",
            "organic":  ["Blast leaf undersides with strong water spray daily.", "Apply neem oil spray focusing entirely on leaf undersides.", "Introduce predatory mites (Phytoseiidae family).", "Keep plants well-watered — mites thrive on drought-stressed plants."],
            "chemical": ["Abamectin 0.02% spray — thoroughly cover all leaf undersides.", "Repeat every 5–7 days."]
        },
        2: {
            "action":   "Alternate miticide classes every application to beat mite resistance.",
            "organic":  ["Insecticidal soap spray every 3 days — cover all leaf undersides.", "Remove and dispose of heavily webbed leaves.", "Release large numbers of predatory mites."],
            "chemical": ["Bifenazate or Hexythiazox miticide — rotate between classes.", "Apply 2 rounds, 5 days apart.", "Mites develop resistance extremely quickly — rotation is mandatory."]
        },
        3: {
            "action":   "🚨 SEVERE infestation — systemic miticide + consider plant removal.",
            "organic":  ["Remove and destroy plants with out-of-control infestation.", "Do not compost infested material.", "Treat entire surrounding area with neem oil to prevent spread."],
            "chemical": ["Spiromesifen systemic miticide — apply 3 times at 5-day intervals.", "Combine with Abamectin for broad-spectrum knockdown."]
        }
    },
    "Tomato___Target_Spot": {
        1: {
            "action":   "Start neem oil + fungicide program. Keep foliage completely dry.",
            "organic":  ["Remove all affected leaves — dispose safely.", "Water only at soil level — never wet the leaves.", "Neem oil spray every 7 days."],
            "chemical": ["Azoxystrobin 0.1% spray every 7–10 days."]
        },
        2: {
            "action":   "Combination fungicide spray + pruning for better air circulation.",
            "organic":  ["Copper oxychloride spray every 5 days.", "Increase plant spacing to improve airflow.", "Remove all spotted leaves — dispose immediately."],
            "chemical": ["Difenoconazole + Azoxystrobin combination spray every 5 days.", "Rotate fungicide classes each application."]
        },
        3: {
            "action":   "🚨 EMERGENCY — Systemic fungicide + aggressive pruning required immediately.",
            "organic":  ["Aggressive pruning of all infected plant parts.", "Soil solarization if replanting soon.", "Copper fungicide at maximum label rate."],
            "chemical": ["Tebuconazole systemic fungicide as emergency treatment.", "Follow with Azoxystrobin rotations every 5 days."]
        }
    },
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        1: {
            "action":   "Focus entirely on whitefly elimination — that is the only way to stop further spread.",
            "organic":  ["Install yellow sticky traps immediately to monitor and catch whiteflies.", "Apply reflective silver mulch around plants to deter whiteflies.", "Neem oil spray weekly to repel whitefly vectors.", "Remove any obviously infected plants — they are a virus reservoir."],
            "chemical": ["Imidacloprid soil drench to eliminate whitefly vectors.", "No chemical cures the virus — only vector control stops spread."]
        },
        2: {
            "action":   "Remove infected plants + aggressively control whiteflies across entire growing area.",
            "organic":  ["Remove and destroy all visibly infected plants — bag carefully.", "Use reflective silver mulches over entire field.", "Introduce natural whitefly predators (Encarsia formosa parasitic wasp)."],
            "chemical": ["Thiamethoxam or Clothianidin for aggressive whitefly elimination.", "No cure for virus — all chemical effort must go to vector control."]
        },
        3: {
            "action":   "🚨 No recovery possible. Remove crop, control whiteflies, replant resistant varieties.",
            "organic":  ["Full crop removal — no recovery is possible at severe stage.", "Plant only TYLCV-resistant varieties in next growing cycle.", "Keep field completely weed-free — weeds are major virus reservoirs."],
            "chemical": ["Complete destruction of infected crop.", "Apply broad-spectrum insecticide to eliminate all whiteflies before replanting."]
        }
    },
    "Tomato___Tomato_mosaic_virus": {
        1: {
            "action":   "Remove infected plants + immediate strict sanitation. Virus spreads by touch.",
            "organic":  ["Remove infected plants at once — handle with gloves, bag carefully.", "Sanitize hands with soap + 10% bleach solution after any handling.", "Sterilize ALL tools with 70% alcohol or 10% bleach before each use.", "Never use tobacco products anywhere near your tomato plants."],
            "chemical": ["No chemical cure exists for this virus.", "Control aphid/insect vectors with insecticidal soap spray."]
        },
        2: {
            "action":   "Remove all infected plants. Full sanitation of tools and work area required.",
            "organic":  ["Destroy all infected plants — do not compost.", "Disinfect all tools, stakes, cages, and supports thoroughly.", "Use only certified virus-free seeds in next season."],
            "chemical": ["No treatment is effective against the virus itself.", "Aphid vector control only — use Imidacloprid or insecticidal soap."]
        },
        3: {
            "action":   "🚨 Full crop removal. Sterilize everything before replanting TMV-resistant varieties.",
            "organic":  ["Complete crop removal — virus cannot be stopped at severe stage.", "Sterilize entire growing area and all equipment before replanting.", "Use only certified TMV-resistant varieties next season."],
            "chemical": ["No chemical treatment available.", "Remove crop entirely. Prevent re-infection through strict total sanitation."]
        }
    },
    "Tomato___healthy": {
        0: {
            "action":   "✅ Plant is healthy. Maintain current practices and scout regularly.",
            "organic":  ["Continue regular neem oil spray every 14 days as disease prevention.", "Water consistently at the base — never wet the leaves.", "Mulch around base to retain moisture and prevent soil splash.", "Scout leaves every 2–3 days for early signs of disease or pests."],
            "chemical": ["No chemical treatment needed.", "Consider a balanced NPK fertilizer to maintain strong plant health."]
        }
    }
}


# ══════════════════════════════════════════════════════════════════════════════
# HELPER: Check if image looks like a leaf
# ══════════════════════════════════════════════════════════════════════════════
def is_plant_image(img_bytes):
    np_arr = np.frombuffer(img_bytes, np.uint8)
    cv_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if cv_img is None:
        return False
    hsv    = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
    total  = cv_img.shape[0] * cv_img.shape[1]
    green  = cv2.countNonZero(cv2.inRange(hsv, (25, 30, 30), (90, 255, 255)))
    yellow = cv2.countNonZero(cv2.inRange(hsv, (15, 30, 30), (35, 255, 255)))
    brown  = cv2.countNonZero(cv2.inRange(hsv, (5,  30, 20), (20, 255, 200)))
    return (green + yellow + brown) / total >= 0.20


# ══════════════════════════════════════════════════════════════════════════════
# HELPER: OpenCV severity staging
# ══════════════════════════════════════════════════════════════════════════════
def get_disease_stage(img_bytes, disease_label):
    if "healthy" in disease_label.lower():
        return {"stage": 0, "label": "Healthy — No Disease", "damage_pct": 0.0}

    np_arr = np.frombuffer(img_bytes, np.uint8)
    img    = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        return {"stage": -1, "label": "Image unclear — retake photo", "damage_pct": 0.0}

    h, w = img.shape[:2]
    mh, mw = int(h * 0.15), int(w * 0.15)
    img = img[mh:h - mh, mw:w - mw]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    green_px    = cv2.countNonZero(cv2.inRange(hsv, (35, 40, 40), (85, 255, 255)))
    diseased_px = cv2.countNonZero(cv2.bitwise_or(
        cv2.inRange(hsv, (20, 40, 40), (35, 255, 255)),
        cv2.inRange(hsv, (10, 30, 20), (20, 255, 180))
    ))
    total = green_px + diseased_px

    if total < 800:
        return {"stage": -1, "label": "Image unclear — retake photo", "damage_pct": 0.0}

    ratio = diseased_px / total
    pct   = round(ratio * 100, 1)

    if ratio < 0.15:
        return {"stage": 1, "label": "Stage 1 — Early Infection",    "damage_pct": pct}
    elif ratio < 0.40:
        return {"stage": 2, "label": "Stage 2 — Moderate Infection", "damage_pct": pct}
    else:
        return {"stage": 3, "label": "Stage 3 — Severe Infection",   "damage_pct": pct}


# ══════════════════════════════════════════════════════════════════════════════
# HELPER: Preprocess image for CNN
# ══════════════════════════════════════════════════════════════════════════════
def preprocess_image(image_bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB').resize((224, 224))
        arr = tf.keras.preprocessing.image.img_to_array(img) / 255.0
        return np.expand_dims(arr, axis=0)
    except Exception as e:
        print(f"Preprocess error: {e}")
        return None


# ══════════════════════════════════════════════════════════════════════════════
# ROUTE: /predict
# ══════════════════════════════════════════════════════════════════════════════
@app.route('/predict', methods=['POST'])
def predict():
    if model is None or not class_names:
        return jsonify({'error': 'Model not ready'}), 500
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Empty filename'}), 400

    try:
        img_bytes = file.read()

        # GATE 1: Must look like a leaf
        if not is_plant_image(img_bytes):
            return jsonify({
                'error':   'not_a_plant',
                'message': 'No plant or leaf detected. Please upload a clear, close-up photo of a tomato leaf.'
            }), 400

        # GATE 2: CNN prediction
        processed = preprocess_image(img_bytes)
        if processed is None:
            return jsonify({'error': 'Could not process image'}), 400

        preds      = model.predict(processed)
        idx        = int(np.argmax(preds[0]))
        confidence = float(np.max(preds[0])) * 100

        if idx >= len(class_names):
            return jsonify({'error': 'Prediction index out of range'}), 500

        predicted_class = class_names[idx]

        # GATE 3: HARD BLOCK — only tomato classes allowed
        if predicted_class not in TOMATO_CLASSES:
            plant_name = predicted_class.split("___")[0].replace("_", " ")
            return jsonify({
                'error':          'not_tomato',
                'message':        f'This tool is for tomato plants only. The image appears to be a {plant_name} plant.',
                'detected_plant': plant_name
            }), 400

        # GATE 4: OpenCV severity staging
        stage_info = get_disease_stage(img_bytes, predicted_class)
        stage_num  = stage_info["stage"]

        # Pull info — prefer TOMATO_DISEASE_INFO, fallback to disease_info.json
        tomato_info  = TOMATO_DISEASE_INFO.get(predicted_class, {})
        fallback_info = disease_info.get(predicted_class, {})

        description  = tomato_info.get("description",  fallback_info.get("description", ""))
        precautions  = tomato_info.get("precautions",  fallback_info.get("precautions", []))
        risk_factors = tomato_info.get("risk_factors", fallback_info.get("risk_factors", []))

        # Pull stage-specific treatment
        disease_remedies = STAGE_REMEDIES.get(predicted_class, {})
        lookup_stage     = 0 if "healthy" in predicted_class.lower() else (stage_num if stage_num > 0 else 1)
        remedies = disease_remedies.get(lookup_stage, {
            "action":   "Consult a local agronomist for personalized advice.",
            "organic":  fallback_info.get("treatment", {}).get("organic", []),
            "chemical": fallback_info.get("treatment", {}).get("chemical", []),
        })

        return jsonify({
            'prediction':   predicted_class,
            'disease_name': predicted_class.replace("Tomato___", "").replace("_", " ").strip(),
            'confidence':   f"{confidence:.1f}%",
            'is_healthy':   "healthy" in predicted_class.lower(),
            'description':  description,
            'precautions':  precautions,
            'risk_factors': risk_factors,
            'stage': {
                'number':     stage_num,
                'label':      stage_info["label"],
                'damage_pct': stage_info["damage_pct"],
            },
            # KEY FIX: field is now 'treatment' (frontend expects this)
            'treatment': {
                'stage_label': stage_info["label"],
                'action':      remedies.get("action", ""),
                'organic':     remedies.get("organic", []),
                'chemical':    remedies.get("chemical", []),
            }
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/diseases', methods=['GET'])
def get_diseases():
    return jsonify(disease_encyclopedia)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)