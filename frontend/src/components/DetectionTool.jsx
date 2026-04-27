import { useState, useRef } from "react";
import "./DetectionTool.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Severity color helpers ─────────────────────────────────────────────────────
const STAGE_COLORS = {
  0: { bg: "#d1fae5", border: "#10b981", text: "#065f46", badge: "#10b981" }, // healthy green
  1: { bg: "#fef9c3", border: "#f59e0b", text: "#78350f", badge: "#f59e0b" }, // yellow
  2: { bg: "#ffedd5", border: "#f97316", text: "#7c2d12", badge: "#f97316" }, // orange
  3: { bg: "#fee2e2", border: "#ef4444", text: "#7f1d1d", badge: "#ef4444" }, // red
 "-1": { bg: "#f3f4f6", border: "#9ca3af", text: "#374151", badge: "#9ca3af" }, // grey
};

const STAGE_ICONS = { 0: "🌿", 1: "🟡", 2: "🟠", 3: "🔴", "-1": "❓" };

export default function DetectionTool() {
  const [selectedFile, setSelectedFile]   = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const [activeTab, setActiveTab]         = useState("organic");
  const fileInputRef                       = useRef(null);

  // ── File handling ────────────────────────────────────────────────────────────
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── API Call ─────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res  = await fetch(`${API_BASE}/predict`, { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        // Handle specific error types from backend
        if (data.error === "not_tomato") {
          setError({
            type: "not_tomato",
            message: data.message,
            detected: data.detected_plant,
          });
        } else if (data.error === "not_a_plant") {
          setError({ type: "not_a_plant", message: data.message });
        } else {
          setError({ type: "generic", message: data.error || "Something went wrong." });
        }
      } else {
        setResult(data);
        setActiveTab("organic");
      }
    } catch (err) {
      setError({ type: "generic", message: "Cannot reach the server. Make sure the backend is running." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────────
  const stageNum    = result?.stage?.number ?? -1;
  const colors      = STAGE_COLORS[stageNum] ?? STAGE_COLORS["-1"];
  const stageIcon   = STAGE_ICONS[stageNum] ?? "❓";
  const damageBar   = result?.stage?.damage_pct ?? 0;

  return (
    <div className="detection-wrapper">
      <div className="detection-header">
        <h1>🍅 Tomato Disease Detector</h1>
        <p>Upload a clear photo of a <strong>tomato leaf</strong> to detect disease, severity, and get treatment advice.</p>
      </div>

      <div className="detection-main">
        {/* ── LEFT PANEL: Upload ── */}
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
                <p>Drag & drop a tomato leaf photo</p>
                <p className="upload-sub">or click to browse</p>
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
            {previewUrl && (
              <button className="btn btn-secondary" onClick={handleReset}>
                🔄 Change Image
              </button>
            )}
            {!previewUrl && (
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                📂 Browse Files
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? (
                <><span className="spinner" /> Analyzing...</>
              ) : (
                "🔍 Analyze Leaf"
              )}
            </button>
          </div>

          <div className="upload-tips">
            <p>✅ Tips for best results:</p>
            <ul>
              <li>Use natural daylight</li>
              <li>Focus clearly on the leaf</li>
              <li>Show the full leaf surface</li>
              <li>Tomato leaves only</li>
            </ul>
          </div>
        </div>

        {/* ── RIGHT PANEL: Results ── */}
        <div className="result-panel">

          {/* Loading state */}
          {isLoading && (
            <div className="result-loading">
              <div className="loading-spinner-large" />
              <p>Analyzing your tomato leaf...</p>
              <p className="loading-sub">Detecting disease & calculating severity</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="result-error">
              {error.type === "not_tomato" && (
                <>
                  <div className="error-icon">🚫</div>
                  <h3>Not a Tomato Plant</h3>
                  <p>{error.message}</p>
                  <p className="error-hint">Detected: <strong>{error.detected}</strong></p>
                  <button className="btn btn-secondary" onClick={handleReset}>Try Another Image</button>
                </>
              )}
              {error.type === "not_a_plant" && (
                <>
                  <div className="error-icon">🌫️</div>
                  <h3>No Leaf Detected</h3>
                  <p>{error.message}</p>
                  <button className="btn btn-secondary" onClick={handleReset}>Try Another Image</button>
                </>
              )}
              {error.type === "generic" && (
                <>
                  <div className="error-icon">⚠️</div>
                  <h3>Error</h3>
                  <p>{error.message}</p>
                  <button className="btn btn-secondary" onClick={handleReset}>Try Again</button>
                </>
              )}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && !result && (
            <div className="result-empty">
              <div className="empty-icon">🍃</div>
              <h3>Ready to Diagnose</h3>
              <p>Upload a tomato leaf photo and click <strong>Analyze Leaf</strong> to get started.</p>
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
                      {result.is_healthy ? "✅ Healthy Tomato" : result.disease_name}
                    </h2>
                    <span className="result-confidence">Confidence: {result.confidence}</span>
                  </div>
                  <span className="result-stage-badge" style={{ background: colors.badge }}>
                    {result.is_healthy ? "Healthy" : `Stage ${stageNum}`}
                  </span>
                </div>

                {result.description && (
                  <p className="result-description">{result.description}</p>
                )}
              </div>

              {/* Severity bar (only for diseased) */}
              {!result.is_healthy && stageNum > 0 && (
                <div className="severity-card">
                  <div className="severity-header">
                    <span>📊 Severity Analysis</span>
                    <span className="severity-label" style={{ color: colors.badge }}>
                      {result.stage.label}
                    </span>
                  </div>
                  <div className="severity-bar-bg">
                    <div
                      className="severity-bar-fill"
                      style={{
                        width: `${Math.min(damageBar, 100)}%`,
                        background: colors.badge,
                      }}
                    />
                  </div>
                  <div className="severity-footer">
                    <span>Estimated damage: <strong>{damageBar}%</strong> of leaf area affected</span>
                  </div>

                  {/* Stage indicators */}
                  <div className="stage-indicators">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`stage-indicator ${stageNum === s ? "active" : stageNum > s ? "past" : ""}`}
                        style={stageNum === s ? { borderColor: colors.border, background: colors.bg } : {}}
                      >
                        <span className="stage-num">Stage {s}</span>
                        <span className="stage-desc">
                          {s === 1 ? "Early" : s === 2 ? "Moderate" : "Severe"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment section */}
              <div className="treatment-card">
                <h3>💊 Recommended Treatment</h3>
                <p className="treatment-stage-label">{result.treatment.stage_label}</p>

                <div className="treatment-tabs">
                  <button
                    className={`tab-btn ${activeTab === "organic" ? "active" : ""}`}
                    onClick={() => setActiveTab("organic")}
                  >
                    🌿 Organic
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "chemical" ? "active" : ""}`}
                    onClick={() => setActiveTab("chemical")}
                  >
                    🧪 Chemical
                  </button>
                </div>

                <div className="treatment-content">
                  {activeTab === "organic" && (
                    <div className="treatment-text organic">
                      {result.treatment.organic}
                    </div>
                  )}
                  {activeTab === "chemical" && (
                    <div className="treatment-text chemical">
                      {result.treatment.chemical}
                    </div>
                  )}
                </div>
              </div>

              {/* Analyze another */}
              <button className="btn btn-outline full-width" onClick={handleReset}>
                🔄 Analyze Another Leaf
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}