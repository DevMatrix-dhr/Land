import { useState } from "react";
import { useData } from "../context/DataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import DocumentViewer from "../components/DocumentViewer.jsx";
import ValidationRulesPanel from "../components/ValidationRulesPanel.jsx";
import SyncStatusBadge from "../components/SyncStatusBadge.jsx";

export default function Verification() {
  const { records, reviewQueue, getAuditLog, getMutations } = useData();
  const { hasPermission } = useAuth();
  const [selectedId, setSelectedId] = useState(null);

  const queue = records.filter((r) => r.validation_status === "needs_review");
  const selected = records.find((r) => r.record_id === selectedId) || queue[0] || null;
  const canApprove = hasPermission("approve");
  
  // Calculate priority mock
  const getPriority = (record) => {
    if (record.overall_confidence < 60) return "Urgent";
    if (record.overall_confidence < 80) return "High";
    return "Normal";
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* Left: Review queue list */}
      <div className="w-72 shrink-0 border-r border-parchment-200 overflow-y-auto bg-white">
        <div className="px-4 py-4 border-b border-parchment-200">
          <h2 className="font-display text-lg">Review Queue</h2>
          <p className="text-xs text-ink-600">{queue.length} pending verification</p>
        </div>
        {queue.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm text-ink-600">All clear! No records awaiting review.</p>
            <p className="text-xs text-ink-500 mt-1">New low-confidence extractions will appear here.</p>
          </div>
        ) : (
          <ul>
            {queue.map((r) => (
              <li key={r.record_id}>
                <button
                  onClick={() => setSelectedId(r.record_id)}
                  className={`w-full text-left px-4 py-3 border-b border-parchment-100 hover:bg-parchment-50 transition-colors ${
                    selected?.record_id === r.record_id ? "bg-parchment-100" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Khasra {r.khasra_number}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                        getPriority(r) === 'Urgent' ? 'bg-seal-500 text-white' : 
                        getPriority(r) === 'High' ? 'bg-amber-500 text-white' : 'bg-parchment-200 text-ink-700'
                      }`}>
                        {getPriority(r)}
                      </span>
                    </div>
                    {r.detected_language && (
                      <span className={`lang-badge lang-${r.detected_language}`}>{r.detected_language}</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-600">{r.landowner_name} • {r.village}, {r.district}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <ConfidenceBadge value={r.overall_confidence} />
                    <span className="text-[10px] text-ink-500 capitalize">{r.document_type || "register"}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right: Detail view */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <VerificationDetail record={selected} canApprove={canApprove} />
        ) : (
          <div className="flex items-center justify-center h-full text-ink-600 text-sm">
            Select a record from the queue to begin verification.
          </div>
        )}
      </div>
    </div>
  );
}

function VerificationDetail({ record, canApprove }) {
  const { correctField, decideRecord, syncToDILRMP, getAuditLog, getMutations } = useData();
  const { user } = useAuth();
  const [edits, setEdits] = useState({});
  const [savedNote, setSavedNote] = useState("");
  const [highlightedField, setHighlightedField] = useState(null);
  const [syncing, setSyncing] = useState(false);
  
  // History and Mutations
  const [history, setHistory] = useState([]);
  const [mutations, setMutations] = useState([]);
  
  import("react").then(({ useEffect }) => {
    useEffect(() => {
      getAuditLog().then(logs => {
        setHistory(logs.filter(l => l.record_id === record.record_id && l.action === "field_corrected"));
      });
      getMutations(record.record_id).then(setMutations);
    }, [record.record_id]);
  });

  function handleChange(fieldName, value) {
    setEdits((prev) => ({ ...prev, [fieldName]: value }));
  }

  function handleBlur(fieldName) {
    if (edits[fieldName] === undefined) return;
    correctField(record.record_id, fieldName, edits[fieldName]);
  }

  function handleDecision(action) {
    decideRecord(record.record_id, action, `${action} by ${user.full_name}`);
    setSavedNote(
      action === "approve"
        ? "✅ Approved and queued for DILRMP vault sync."
        : action === "flag"
        ? "🚩 Flagged for re-scan."
        : "❌ Rejected."
    );
    setTimeout(() => setSavedNote(""), 3000);
    setEdits({});
  }

  async function handleSync() {
    setSyncing(true);
    await syncToDILRMP(record.record_id);
    setSyncing(false);
    setSavedNote("✅ Synced to DILRMP successfully.");
    setTimeout(() => setSavedNote(""), 3000);
  }

  return (
    <div className="p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg">Khasra {record.khasra_number} — {record.village}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`status-pill status-${record.validation_status}`}>
              {record.validation_status.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-ink-500">{record.district} • {record.tehsil}</span>
            {record.detected_language && (
              <span className={`lang-badge lang-${record.detected_language}`}>{record.detected_language}</span>
            )}
          </div>
        </div>
        <ConfidenceBadge value={record.overall_confidence} large />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Document viewer */}
        <div className="space-y-4">
          <DocumentViewer record={record} highlightedField={highlightedField} />
          <SyncStatusBadge syncData={record.dilrmp_sync} />
        </div>

        {/* Right: Fields + Validation */}
        <div className="space-y-4">
          {/* Extracted fields */}
          <div className="card p-4">
            <h4 className="text-xs font-medium text-ink-700 uppercase tracking-wide mb-3">
              Extracted Fields ({record.fields?.length || 0})
            </h4>
            <div className="space-y-3">
              {record.fields?.map((field) => (
                <FieldRow
                  key={field.field_name}
                  field={field}
                  value={edits[field.field_name] ?? field.normalized_value}
                  onChange={(v) => handleChange(field.field_name, v)}
                  onBlur={() => handleBlur(field.field_name)}
                  onFocus={() => setHighlightedField(field.field_name)}
                  canEdit={canApprove}
                />
              ))}
            </div>
          </div>

          {/* Validation rules */}
          <ValidationRulesPanel results={record.validation_results} />
          
          {/* Mutation History */}
          {mutations.length > 0 && (
            <div className="card p-4">
              <h4 className="text-xs font-medium text-ink-700 uppercase tracking-wide mb-3">
                Mutation History
              </h4>
              <ul className="space-y-3">
                {mutations.map(m => (
                  <li key={m.mutation_id} className="text-xs border-l-2 border-parchment-200 pl-3">
                    <p className="font-medium text-ink-950 mb-0.5">{m.mutation_type}</p>
                    <p className="text-ink-600 mb-1">{m.previous_owner} → {m.new_owner}</p>
                    <div className="flex gap-3 text-[10px] text-ink-500">
                      <span>{m.mutation_date}</span>
                      <span>{m.mutation_number}</span>
                      <span className="capitalize">{m.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit History */}
          {history.length > 0 && (
            <div className="card p-4">
              <h4 className="text-xs font-medium text-ink-700 uppercase tracking-wide mb-3">
                Field Correction History
              </h4>
              <ul className="space-y-2">
                {history.map(h => (
                  <li key={h.log_id} className="text-xs text-ink-600">
                    <span className="font-medium text-ink-950">{h.user_name}</span> corrected <span className="font-mono">{h.new_value?.field_name}</span> to "{h.new_value?.value}"
                    <span className="block text-[10px] text-ink-400 mt-0.5">{new Date(h.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="card p-4">
            <div className="flex items-center gap-3 flex-wrap">
              {canApprove ? (
                <>
                  <button onClick={() => handleDecision("approve")} className="btn-success">
                    ✓ Approve & Save
                  </button>
                  <button onClick={() => handleDecision("flag")} className="btn-warning">
                    🚩 Flag for Re-scan
                  </button>
                  <button onClick={() => handleDecision("reject")} className="btn-danger">
                    ✗ Reject
                  </button>
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="btn-outline"
                  >
                    {syncing ? "Syncing…" : "↗ Sync to DILRMP"}
                  </button>
                </>
              ) : (
                <p className="text-xs text-ink-500">🔒 Your role does not permit approve/flag/reject actions.</p>
              )}
            </div>
            {savedNote && (
              <p className="text-xs text-moss-600 mt-2 animate-fade-in">{savedNote}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({ field, value, onChange, onBlur, onFocus, canEdit }) {
  const conf = field.confidence_score;
  const confClass = conf >= 90 ? "conf-high" : conf >= 60 ? "conf-mid" : "conf-low";
  const confColor = conf >= 90 ? "text-moss-600" : conf >= 60 ? "text-amber-600" : "text-seal-600";

  return (
    <div>
      <label className="flex justify-between text-[11px] text-ink-600 mb-1">
        <span className="capitalize font-medium">{field.field_name.replace(/_/g, " ")}</span>
        <span className={`font-mono ${confColor}`}>
          {field.is_manually_corrected ? "✎ " : ""}{Math.round(conf)}%
        </span>
      </label>
      <input
        className={`w-full border rounded px-3 py-1.5 text-sm ${confClass} ${!canEdit ? "bg-parchment-50 cursor-not-allowed" : ""}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        readOnly={!canEdit}
      />
    </div>
  );
}

function ConfidenceBadge({ value, large }) {
  const tone = value >= 90 ? "bg-moss-600" : value >= 60 ? "bg-amber-600" : "bg-seal-600";
  return (
    <span className={`inline-block ${large ? "text-sm px-3 py-1" : "text-[11px] px-2 py-0.5"} rounded-full text-white ${tone}`}>
      {Math.round(value)}% confidence
    </span>
  );
}
