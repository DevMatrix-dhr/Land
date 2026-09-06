import { useState } from "react";

/**
 * SVG-based realistic land record document viewer with field bounding box overlays.
 * Highlights the hovered field region in saffron.
 */
export default function DocumentViewer({ record, highlightedField }) {
  const [zoom, setZoom] = useState(1);
  const lang = record?.detected_language || "Hindi";
  const docType = record?.document_type || "register";

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-parchment-100 border-b border-parchment-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-600 uppercase tracking-wide">Scanned Document</span>
          <span className={`lang-badge lang-${lang}`}>{lang}</span>
          <span className="text-[10px] text-ink-500 capitalize">{docType}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="w-6 h-6 rounded bg-white border border-parchment-200 text-xs flex items-center justify-center hover:bg-parchment-50">−</button>
          <span className="text-[10px] text-ink-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.25))} className="w-6 h-6 rounded bg-white border border-parchment-200 text-xs flex items-center justify-center hover:bg-parchment-50">+</button>
        </div>
      </div>
      <div className="relative bg-parchment-50 overflow-auto" style={{ height: 420 }}>
        <svg
          viewBox="0 0 595 420"
          style={{ width: `${595 * zoom}px`, height: `${420 * zoom}px`, minWidth: "100%" }}
          className="block"
        >
          {/* Paper background */}
          <rect x="0" y="0" width="595" height="420" fill="#FBF8F1" />
          {/* Aged paper texture lines */}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`h-${i}`} x1="0" y1={20 + i * 20} x2="595" y2={20 + i * 20} stroke="#E9DFC6" strokeWidth="0.5" opacity="0.5" />
          ))}
          {/* Header border */}
          <rect x="20" y="15" width="555" height="55" rx="2" fill="none" stroke="#2B4270" strokeWidth="1.5" />
          <text x="297" y="38" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0F1A2E" fontFamily="serif">
            भूमि अभिलेख / LAND RECORD — {lang === "Hindi" ? "हिन्दी" : lang}
          </text>
          <text x="297" y="58" textAnchor="middle" fontSize="9" fill="#3A5590" fontFamily="sans-serif">
            District: {record?.district || "—"} | Tehsil: {record?.tehsil || "—"} | Village: {record?.village || "—"}
          </text>

          {/* Government emblem placeholder */}
          <circle cx="50" cy="40" r="18" fill="none" stroke="#2B4270" strokeWidth="1" />
          <text x="50" y="44" textAnchor="middle" fontSize="8" fill="#2B4270">⚖️</text>

          {/* Row labels + values */}
          {[
            { label: "खसरा नं / Khasra No.", field: "khasra_number", row: 0 },
            { label: "खाता नं / Khata No.", field: "khata_number", row: 0, col: 1 },
            { label: "सर्वे नं / Survey No.", field: "survey_number", row: 0, col: 2 },
            { label: "भूस्वामी / Landowner", field: "landowner_name", row: 1 },
            { label: "अभिभावक / Guardian", field: "landowner_guardian_name", row: 1, col: 1 },
            { label: "क्षेत्रफल / Plot Area", field: "plot_area", row: 2 },
            { label: "भूमि वर्ग / Classification", field: "land_classification", row: 2, col: 1 },
            { label: "स्वामित्व / Ownership", field: "ownership_type", row: 2, col: 2 },
            { label: "गाँव / Village", field: "village", row: 3 },
            { label: "तहसील / Tehsil", field: "tehsil", row: 3, col: 1 },
            { label: "जिला / District", field: "district", row: 3, col: 2 },
            { label: "म्यूटेशन / Mutation", field: "mutation_status", row: 4 },
            { label: "रजि. नं / Reg. No.", field: "registration_number", row: 4, col: 1 },
          ].map((item, idx) => {
            const x = 30 + (item.col || 0) * 185;
            const y = 95 + item.row * 62;
            const fieldData = record?.fields?.find((f) => f.field_name === item.field);
            const value = fieldData?.normalized_value || "—";
            const conf = fieldData?.confidence_score || 0;
            const isHL = highlightedField === item.field;
            const confColor = conf >= 90 ? "#4C7A4A" : conf >= 60 ? "#C4872A" : "#B5482E";

            return (
              <g key={idx}>
                {/* Highlight overlay */}
                {isHL && (
                  <rect x={x - 4} y={y - 4} width={175} height={50} rx="3"
                    fill="rgba(255,153,51,0.12)" stroke="#FF9933" strokeWidth="2" />
                )}
                <text x={x} y={y + 10} fontSize="8" fill="#3A5590" fontFamily="sans-serif">{item.label}</text>
                <text x={x} y={y + 28} fontSize="12" fill="#0F1A2E" fontWeight="600" fontFamily="serif">{value}</text>
                {/* Confidence indicator dot */}
                <circle cx={x + 170} cy={y + 25} r="4" fill={confColor} />
                <text x={x + 170} y={y + 40} textAnchor="middle" fontSize="7" fill={confColor}>{Math.round(conf)}%</text>
              </g>
            );
          })}

          {/* Footer / stamp area */}
          <line x1="20" y1="395" x2="575" y2="395" stroke="#2B4270" strokeWidth="0.5" />
          <text x="297" y="412" textAnchor="middle" fontSize="8" fill="#3A5590" fontFamily="sans-serif">
            Document ID: {record?.document_id || "—"} | Processed by AI Pipeline v2.1 | Confidence: {record?.overall_confidence || 0}%
          </text>
        </svg>
      </div>
    </div>
  );
}
