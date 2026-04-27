import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {

  en: {
    translation: {
      title: "Plant Disease Detection",
      upload: "Upload Plant Image",
      analyze: "Analyze Image",
      results: "Detection Results",
      precautions: "Precautions",
      risk: "Risk Factors",
      chemical: "Chemical Treatments",
      organic: "Organic Remedies"
    }
  },

  hi: {
    translation: {
      title: "पौधों की बीमारी पहचान",
      upload: "पौधे की तस्वीर अपलोड करें",
      analyze: "छवि विश्लेषण करें",
      results: "परिणाम",
      precautions: "सावधानियाँ",
      risk: "जोखिम कारक",
      chemical: "रासायनिक उपचार",
      organic: "जैविक उपचार"
    }
  },

  kn: {
    translation: {
      title: "ಸಸ್ಯ ರೋಗ ಪತ್ತೆ",
      upload: "ಸಸ್ಯದ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ",
      analyze: "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
      results: "ಫಲಿತಾಂಶ",
      precautions: "ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
      risk: "ಅಪಾಯ ಕಾರಣಗಳು",
      chemical: "ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ",
      organic: "ಸಾವಯವ ಚಿಕಿತ್ಸೆ"
    }
  },

  ta: {
    translation: {
      title: "தாவர நோய் கண்டறிதல்",
      upload: "தாவரத்தின் படத்தை பதிவேற்றவும்",
      analyze: "படத்தை பகுப்பாய்வு செய்",
      results: "முடிவுகள்",
      precautions: "முன்னெச்சரிக்கைகள்",
      risk: "ஆபத்து காரணங்கள்",
      chemical: "ரசாயன சிகிச்சைகள்",
      organic: "இயற்கை சிகிச்சைகள்"
    }
  },

  te: {
    translation: {
      title: "మొక్కల వ్యాధి గుర్తింపు",
      upload: "మొక్క చిత్రం అప్లోడ్ చేయండి",
      analyze: "చిత్రాన్ని విశ్లేషించండి",
      results: "ఫలితాలు",
      precautions: "జాగ్రత్తలు",
      risk: "ప్రమాద కారకాలు",
      chemical: "రసాయన చికిత్స",
      organic: "సేంద్రీయ చికిత్స"
    }
  }

};

i18n
.use(LanguageDetector)
.use(initReactI18next)
.init({
  resources,
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;