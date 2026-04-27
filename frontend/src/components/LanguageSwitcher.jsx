import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', fullLabel: 'English' },
  { code: 'hi', label: 'हिं', fullLabel: 'हिंदी' },
  { code: 'kn', label: 'ಕನ್', fullLabel: 'ಕನ್ನಡ' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-switcher" title="Select Language">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`lang-btn ${i18n.language === lang.code ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage(lang.code)}
          title={lang.fullLabel}
          aria-label={`Switch to ${lang.fullLabel}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}