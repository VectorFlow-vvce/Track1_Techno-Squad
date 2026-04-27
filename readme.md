🌿 PlantGuard AI – AI-Powered Plant Disease Detection

Developed by Techno Squad

Author: Dhanush R S

🚀 Overview

PlantGuard AI is a web-based application that leverages Artificial Intelligence to detect plant diseases from leaf images. It helps farmers and home gardeners identify issues early, take preventive measures, and apply effective treatments to minimize crop loss.

🌟 Key Features
🖼 Image Upload
Upload leaf images using drag-and-drop or file selection.
🤖 AI Disease Detection
Fast and accurate identification using trained deep learning models.
📊 Confidence Scoring
Displays prediction confidence for transparency.
⚠️ Severity Levels
Indicates disease impact (Low, Medium, High).
📘 Plant Encyclopedia
Searchable database with disease details, causes, and treatments.
📱 Responsive Design
Works seamlessly on desktop and mobile devices.
🛠 Tech Stack
Category	Tools & Technologies
Frontend	React (Vite), Tailwind CSS, Axios, React Router
Backend	Python, Flask, Flask-CORS
AI/ML	TensorFlow, Keras, NumPy, Pillow
Database	JSON (Structured disease data)
IDE	Kiro IDE
Version Control	Git & GitHub
📂 Project Structure
ai-plant-disease-detection/
├── backend/
│   ├── app.py                # Flask server
│   ├── model/                # Trained ML models (.h5 / .keras)
│   └── disease_info.json     # Disease encyclopedia data
│
├── frontend/                 # React (Vite) application
│   ├── src/
│   └── public/
│
├── requirements.txt          # Python dependencies
└── README.md
⚙️ Setup and Installation
1️⃣ Clone the Repository
git clone https://github.com/VectorFlow-vvce/Track1_Techno-Squad.git
cd Track1_Techno-Squad
2️⃣ Backend Setup
# Create virtual environment
python -m venv venv

# Activate it
# Linux / Mac:
source venv/bin/activate

# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py
3️⃣ Frontend Setup
cd frontend

npm install
npm run dev
🔮 Future Enhancements
🌿 Multi-Leaf Detection
Detect diseases from multiple leaves in a single image
📶 Offline Mode
Lightweight model for low-connectivity areas
👨‍🌾 Community Forum
Farmers sharing real-world solutions and insights
📷 Real-Time Camera Detection
Live disease detection using mobile camera
🤝 Contribution

Contributions are welcome!
Feel free to fork the repo, raise issues, or submit pull requests.