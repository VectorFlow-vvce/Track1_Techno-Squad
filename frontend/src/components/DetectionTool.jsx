import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./DetectionTool.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Severity color helpers ─────────────────────────────────────────────────────
const STAGE_COLORS = {
  0:  { bg: "#d1fae5", border: "#10b981", text: "#065f46", badge: "#10b981" },
  1:  { bg: "#fef9c3", border: "#f59e0b", text: "#78350f", badge: "#f59e0b" },
  2:  { bg: "#ffedd5", border: "#f97316", text: "#7c2d12", badge: "#f97316" },
  3:  { bg: "#fee2e2", border: "#ef4444", text: "#7f1d1d", badge: "#ef4444" },
  "-1": { bg: "#f3f4f6", border: "#9ca3af", text: "#374151", badge: "#9ca3af" },
};

const STAGE_ICONS = { 0: "🌿", 1: "🟡", 2: "🟠", 3: "🔴", "-1": "❓" };

export default function DetectionTool() {
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState("organic");
  const [showExtra,    setShowExtra]    = useState(null); // 'precautions' | 'risk'
  const fileInputRef = useRef(null);

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setShowExtra(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── API Call ──────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setShowExtra(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res  = await fetch(`${API_BASE}/predict`, { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "not_tomato") {
          setError({ type: "not_tomato", message: data.message, detected: data.detected_plant });
        } else if (data.error === "not_a_plant") {
          setError({ type: "not_a_plant", message: data.message });
        } else {
          setError({ type: "generic", message: data.error || "Something went wrong." });
        }
      } else {
        setResult(data);
        setActiveTab("organic");
      }
    } catch {
      setError({ type: "generic", message: "Cannot reach the server. Make sure the backend is running." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const stageNum  = result?.stage?.number ?? -1;
  const colors    = STAGE_COLORS[stageNum] ?? STAGE_COLORS["-1"];
  const stageIcon = STAGE_ICONS[stageNum]  ?? "❓";
  const damageBar = result?.stage?.damage_pct ?? 0;

  // treatment comes from backend as { stage_label, action, organic[], chemical[] }
  const treatment = result?.treatment ?? {};

  return (
    <div className="detection-wrapper">
      <div className="detection-header">
        <h1>{t("detect.title")}</h1>
        <p>{t("detect.subtitle")}</p>
      </div>

      <div className="detection-main">

        {/* ── LEFT: Upload ─────────────────────────────────────────────────── */}
        <div className="upload-panel">
          <div
            className={`dropzone ${previewUrl ? "has-image" : ""}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !previewUrl && fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded leaf" className="preview-img" />
            ) : (
              <div className="dropzone-placeholder">
                <span className="upload-icon">📷</span>
                <p>{t("detect.dragDrop")}</p>
                <p className="upload-sub">{t("detect.orClick")}</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <div className="upload-actions">
            {previewUrl ? (
              <button className="btn btn-secondary" onClick={handleReset}>
                {t("detect.changeImage")}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                {t("detect.browseFiles")}
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? (
                <><span className="spinner" /> {t("detect.analyzing")}</>
              ) : (
                t("detect.analyzeLeaf")
              )}
            </button>
          </div>

          <div className="upload-tips">
            <p>{t("detect.tips.title")}</p>
            <ul>
              <li>{t("detect.tips.daylight")}</li>
              <li>{t("detect.tips.focus")}</li>
              <li>{t("detect.tips.fullLeaf")}</li>
              <li>{t("detect.tips.tomatoOnly")}</li>
            </ul>
          </div>
        </div>

        {/* ── RIGHT: Results ───────────────────────────────────────────────── */}
        <div className="result-panel">

          {/* Loading */}
          {isLoading && (
            <div className="result-loading">
              <div className="loading-spinner-large" />
              <p>{t("detect.analyzingLeaf")}</p>
              <p className="loading-sub">{t("detect.detectingDisease")}</p>
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="result-error">
              {error.type === "not_tomato" && (
                <>
                  <div className="error-icon">🚫</div>
                  <h3>{t("detect.notTomato")}</h3>
                  <p>{error.message}</p>
                  <p className="error-hint">{t("detect.detected")}: <strong>{error.detected}</strong></p>
                  <button className="btn btn-secondary" onClick={handleReset}>{t("detect.tryAnotherImage")}</button>
                </>
              )}
              {error.type === "not_a_plant" && (
                <>
                  <div className="error-icon">🌫️</div>
                  <h3>{t("detect.noLeaf")}</h3>
                  <p>{error.message}</p>
                  <button className="btn btn-secondary" onClick={handleReset}>{t("detect.tryAnotherImage")}</button>
                </>
              )}
              {error.type === "generic" && (
                <>
                  <div className="error-icon">⚠️</div>
                  <h3>{t("detect.error")}</h3>
                  <p>{error.message}</p>
                  <button className="btn btn-secondary" onClick={handleReset}>{t("detect.tryAgain")}</button>
                </>
              )}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !error && !result && (
            <div className="result-empty">
              <div className="empty-icon">🍃</div>
              <h3>{t("detect.readyToDiagnose")}</h3>
              <p>{t("detect.uploadAndClick")}</p>
            </div>
          )}

          {/* ── RESULT ── */}
          {!isLoading && result && (
            <div className="result-content">

              {/* Disease name + confidence */}
              <div className="result-header-card" style={{ borderColor: colors.border, background: colors.bg }}>
                <div className="result-title-row">
                  <span className="result-stage-icon">{stageIcon}</span>
                  <div>
                    <h2 className="result-disease-name" style={{ color: colors.text }}>
                      {result.is_healthy ? t("detect.healthyTomato") : result.disease_name}
                    </h2>
                    <span className="result-confidence">{t("detect.confidence")}: {result.confidence}</span>
                  </div>
                  <span className="result-stage-badge" style={{ background: colors.badge }}>
                    {result.is_healthy ? t("detect.healthy") : `${t("detect.stage")} ${stageNum}`}
                  </span>
                </div>
                {result.description && (
                  <p className="result-description">{result.description}</p>
                )}
              </div>

              {/* Severity bar (diseased only) */}
              {!result.is_healthy && stageNum > 0 && (
                <div className="severity-card">
                  <div className="severity-header">
                    <span>{t("detect.severityAnalysis")}</span>
                    <span className="severity-label" style={{ color: colors.badge }}>
                      {result.stage.label}
                    </span>
                  </div>
                  <div className="severity-bar-bg">
                    <div
                      className="severity-bar-fill"
                      style={{ width: `${Math.min(damageBar, 100)}%`, background: colors.badge }}
                    />
                  </div>
                  <div className="severity-footer">
                    <span>{t("detect.estimatedDamage")}: <strong>{damageBar}%</strong> {t("detect.leafAreaAffected")}</span>
                  </div>
                  <div className="stage-indicators">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`stage-indicator ${stageNum === s ? "active" : stageNum > s ? "past" : ""}`}
                        style={stageNum === s ? { borderColor: colors.border, background: colors.bg } : {}}
                      >
                        <span className="stage-num">{t("detect.stage")} {s}</span>
                        <span className="stage-desc">
                          {s === 1 ? t("detect.early") : s === 2 ? t("detect.moderate") : t("detect.severe")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              {treatment.action && (
                <div className="action-card" style={{ borderColor: colors.border }}>
                  <h3 className="action-title">{t("detect.recommendedAction")}</h3>
                  <p className="action-text">{treatment.action}</p>
                </div>
              )}

              {/* Treatment tabs */}
              <div className="treatment-card">
                <h3>{t("detect.recommendedTreatment")}</h3>
                <p className="treatment-stage-label">{treatment.stage_label}</p>

                <div className="treatment-tabs">
                  <button
                    className={`tab-btn ${activeTab === "organic" ? "active organic-active" : ""}`}
                    onClick={() => setActiveTab("organic")}
                  >
                    {t("detect.organic")}
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "chemical" ? "active chemical-active" : ""}`}
                    onClick={() => setActiveTab("chemical")}
                  >
                    {t("detect.chemical")}
                  </button>
                </div>

                <div className="treatment-content">
                  {activeTab === "organic" && (
                    <div className="treatment-text organic">
                      {Array.isArray(treatment.organic) ? (
                        <ul className="treatment-list">
                          {treatment.organic.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{treatment.organic}</p>
                      )}
                    </div>
                  )}
                  {activeTab === "chemical" && (
                    <div className="treatment-text chemical">
                      {Array.isArray(treatment.chemical) ? (
                        <ul className="treatment-list">
                          {treatment.chemical.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{treatment.chemical}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Precautions */}
              {result.precautions?.length > 0 && (
                <div className="extra-card precautions-card">
                  <button
                    className="extra-toggle"
                    onClick={() => setShowExtra(showExtra === "precautions" ? null : "precautions")}
                  >
                    <span>{t("detect.precautions")}</span>
                    <span className="toggle-arrow">{showExtra === "precautions" ? "▲" : "▼"}</span>
                  </button>
                  {showExtra === "precautions" && (
                    <ul className="extra-list">
                      {result.precautions.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Risk Factors */}
              {result.risk_factors?.length > 0 && (
                <div className="extra-card risk-card">
                  <button
                    className="extra-toggle"
                    onClick={() => setShowExtra(showExtra === "risk" ? null : "risk")}
                  >
                    <span>{t("detect.riskFactors")}</span>
                    <span className="toggle-arrow">{showExtra === "risk" ? "▲" : "▼"}</span>
                  </button>
                  {showExtra === "risk" && (
                    <ul className="extra-list">
                      {result.risk_factors.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Analyze another */}
              <button className="btn btn-outline full-width" onClick={handleReset}>
                {t("detect.analyzeAnother")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}