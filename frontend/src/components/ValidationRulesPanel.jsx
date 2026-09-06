/**
 * Validation rules panel — shows all 7 rule pass/fail results for a record.
 */
export default function ValidationRulesPanel({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="card p-4">
      <h4 className="text-xs font-medium text-ink-700 uppercase tracking-wide mb-3">
        Validation Rules ({results.filter((r) => r.passed).length}/{results.length} passed)
      </h4>
      <div className="grid grid-cols-1 gap-1.5">
        {results.map((r) => (
          <div
            key={r.rule_name}
            className={`flex items-start gap-2 text-xs px-2.5 py-2 rounded ${
              r.passed ? "bg-moss-500/5" : "bg-seal-500/8"
            }`}
          >
            <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              r.passed ? "bg-moss-500 text-white" : "bg-seal-500 text-white"
            }`}>
              {r.passed ? "✓" : "✗"}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${r.passed ? "text-moss-600" : "text-seal-600"}`}>
                {r.rule_name.replace(/_/g, " ")}
              </p>
              <p className="text-ink-500 text-[11px] mt-0.5">{r.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
