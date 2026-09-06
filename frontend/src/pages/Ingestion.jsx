import { useState, useCallback } from "react";
import { useData } from "../context/DataContext.jsx";
import { Link } from "react-router-dom";
import { PipelineDotsCompact, getStageLabelByKey } from "../components/PipelineStepper.jsx";
import DuplicateWarning from "../components/DuplicateWarning.jsx";

export default function Ingestion() {
  const { records, uploadQueue, uploadFiles, duplicateWarnings, setDuplicateWarnings } = useData();
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("register");

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const total = records.length;
  const digitized = records.filter((r) => ["approved", "auto_approved"].includes(r.validation_status)).length;
  const inReview = records.filter((r) => r.validation_status === "needs_review").length;
  const flagged = records.filter((r) => r.validation_status === "flagged").length;
  const duplicates = records.filter((r) => r.is_duplicate).length;

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl mb-1">Ingestion & AI Processing Hub</h1>
        <p className="text-sm text-ink-600">
          Upload scanned registers, PDFs, cadastral maps, or photographs for automated digitization via the OpenCV → PaddleOCR → NLP pipeline.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <Stat label="Total documents" value={total} icon="📄" />
        <Stat label="Digitized" value={digitized} tone="moss" icon="✅" />
        <Stat label="In review" value={inReview} tone="amber" icon="🔍" />
        <Stat label="Flagged" value={flagged} tone="seal" icon="🚩" />
        <Stat label="Duplicates blocked" value={duplicates} tone="ink" icon="🔁" />
      </div>

      {/* Duplicate warnings */}
      {duplicateWarnings?.length > 0 && (
        <div className="mb-6 space-y-3">
          {duplicateWarnings.map((warning, idx) => (
            <DuplicateWarning 
              key={warning.id} 
              warning={warning} 
              onDismiss={() => {
                setDuplicateWarnings(prev => prev.filter(w => w.id !== warning.id));
              }}
            />
          ))}
        </div>
      )}

      {/* Document Type Selector */}
      <div className="mb-4">
        <label className="text-xs font-medium text-ink-700 uppercase tracking-wide mr-4">Select Document Type:</label>
        <div className="inline-flex bg-parchment-100 rounded p-1">
          {["register", "map", "pdf", "photo"].map(type => (
            <button
              key={type}
              onClick={() => setSelectedDocType(type)}
              className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${
                selectedDocType === type ? "bg-white shadow-sm text-ink-950" : "text-ink-600 hover:text-ink-950"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`card p-10 text-center transition-all duration-200 ${
          dragActive ? "border-saffron-500 bg-saffron-500/5 border-2 border-dashed" : "border-2 border-dashed border-parchment-200"
        }`}
      >
        <div className="text-4xl mb-3">{dragActive ? "📥" : "📤"}</div>
        <p className="text-base mb-1 font-medium">Drag and drop files here</p>
        <p className="text-sm text-ink-600 mb-4">
          Batch upload of scanned registers, TIFF/JPEG images, cadastral maps, or legacy PDFs
        </p>
        <input
          type="file"
          multiple
          id="file-input"
          className="hidden"
          onChange={(e) => e.target.files?.length && uploadFiles(e.target.files)}
        />
        <label htmlFor="file-input" className="btn-outline inline-block cursor-pointer">
          Browse files
        </label>
        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-ink-500">
          <span>📝 Supports: PDF, TIFF, JPEG, PNG</span>
          <span className="text-parchment-200">|</span>
          <span>🌐 Multilingual: Hindi, English, Marathi, Telugu, Kannada, Bengali</span>
        </div>
      </div>

      {/* Pipeline info */}
      <div className="mt-6 card p-4">
        <h3 className="text-xs font-medium text-ink-700 uppercase tracking-wide mb-3">AI Pipeline Stages</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { icon: "📋", label: "Queued", desc: "Document ingested" },
            { icon: "🔧", label: "Preprocessing", desc: "OpenCV deskew/denoise/binarize" },
            { icon: "📝", label: "OCR", desc: "PaddleOCR multilingual pass" },
            { icon: "🧠", label: "Field Extraction", desc: "NLP/regex field mapping (13 fields)" },
            { icon: "✅", label: "Validation", desc: "7 business rules + duplicate check" },
            { icon: "🏁", label: "Complete", desc: "Auto-approve or → review queue" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="text-center px-2 py-1.5 rounded bg-parchment-50 border border-parchment-200">
                <span className="text-lg block">{s.icon}</span>
                <span className="text-[9px] text-ink-700 font-medium block">{s.label}</span>
              </div>
              {i < 5 && <span className="text-ink-400 text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Processing queue */}
      {uploadQueue.length > 0 && (
        <div className="mt-6 animate-slide-up">
          <h2 className="text-sm font-medium text-ink-700 mb-3 uppercase tracking-wide">
            Processing queue ({uploadQueue.length})
          </h2>
          <ul className="space-y-2">
            {uploadQueue.map((item) => (
              <li key={item.id} className="card flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.stage === "complete" ? "✅" : "📄"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-ink-600">{getStageLabelByKey(item.stage)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PipelineDotsCompact stage={item.stage} />
                  {item.stage === "complete" && item.recordId && (
                    <Link to="/verification" className="text-xs text-ink-700 underline hover:text-saffron-500">
                      Review →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent records preview */}
      {records.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-ink-700 mb-3 uppercase tracking-wide">
            Recently processed
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {records.slice(0, 3).map((r) => (
              <div key={r.record_id} className="card p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-ink-500">{r.record_id}</span>
                  <span className={`status-pill status-${r.validation_status}`}>
                    {r.validation_status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">Khasra {r.khasra_number}</p>
                <p className="text-xs text-ink-600">{r.landowner_name} • {r.village}, {r.district}</p>
                <div className="flex items-center justify-between mt-3">
                  <ConfidenceBar value={r.overall_confidence} />
                  {r.detected_language && (
                    <span className={`lang-badge lang-${r.detected_language}`}>{r.detected_language}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone, icon }) {
  const toneClass = {
    moss: "text-moss-600",
    amber: "text-amber-600",
    seal: "text-seal-600",
    ink: "text-ink-600",
  }[tone] || "text-ink-950";

  return (
    <div className="card-metric">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-ink-600">{label}</p>
        <span className="text-base">{icon}</span>
      </div>
      <p className={`font-display text-2xl ${toneClass}`}>{value}</p>
    </div>
  );
}

function ConfidenceBar({ value }) {
  const color = value >= 90 ? "bg-moss-500" : value >= 60 ? "bg-amber-500" : "bg-seal-500";
  return (
    <div className="flex items-center gap-2 flex-1 mr-3">
      <div className="flex-1 h-1.5 rounded-full bg-parchment-200">
        <div className={`conf-bar ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className="text-[10px] text-ink-600 font-mono">{Math.round(value)}%</span>
    </div>
  );
}
