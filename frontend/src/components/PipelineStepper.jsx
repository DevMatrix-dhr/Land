/**
 * Animated 6-stage pipeline progress stepper.
 * Shows the document processing stages with real-time transitions.
 */
const STAGES = [
  { key: "queued",            label: "Queued",            icon: "📋" },
  { key: "preprocessing",    label: "OpenCV Preprocessing", icon: "🔧" },
  { key: "ocr",              label: "PaddleOCR Pass",    icon: "📝" },
  { key: "field_extraction", label: "NLP Field Extraction", icon: "🧠" },
  { key: "validation",       label: "Rule Validation",   icon: "✅" },
  { key: "complete",         label: "Complete",           icon: "🏁" },
];

export default function PipelineStepper({ currentStage }) {
  const currentIdx = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center gap-0.5">
      {STAGES.map((stage, i) => {
        const isDone = i < currentIdx;
        const isActive = i === currentIdx;
        const isPending = i > currentIdx;
        const cls = isDone ? "done" : isActive ? "active" : "pending";

        return (
          <div key={stage.key} className="flex items-center">
            <div className={`pipeline-step ${cls}`}>
              <span>{stage.icon}</span>
              <span className="hidden sm:inline">{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`w-4 h-0.5 ${isDone ? "bg-moss-500" : "bg-parchment-200"} mx-0.5`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Compact version for queue items */
export function PipelineDotsCompact({ stage }) {
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  return (
    <div className="flex items-center gap-1">
      {STAGES.map((s, i) => (
        <div key={s.key} className="flex items-center gap-1">
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < currentIdx ? "bg-moss-500" :
              i === currentIdx ? "bg-ink-800 animate-pulse-soft" :
              "bg-parchment-200"
            }`}
            title={s.label}
          />
          {i < STAGES.length - 1 && (
            <div className={`w-2 h-px ${i < currentIdx ? "bg-moss-400" : "bg-parchment-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function getStageLabelByKey(key) {
  return STAGES.find((s) => s.key === key)?.label || key;
}
