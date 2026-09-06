import { useData } from "../context/DataContext.jsx";

export default function AuditTrail() {
  const { auditLog } = useData();

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <h1 className="font-display text-2xl mb-1">Immutable Audit Trail</h1>
      <p className="text-sm text-ink-600 mb-6">Cryptographically chained logs of all actions in the system.</p>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-parchment-200">
        {auditLog.map((log, i) => (
          <div key={log.log_id} className={`audit-entry action-${log.action} mb-4`}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-ink-900">{log.user_name}</span>
                <span className="text-xs text-ink-500">performed</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ink-100 text-ink-700 capitalize">
                  {log.action.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-ink-500">on</span>
                <span className="text-xs font-mono bg-parchment-100 px-1.5 py-0.5 rounded text-ink-700">{log.record_id}</span>
              </div>
              <span className="text-[10px] text-ink-400">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            
            {log.new_value && (
              <div className="mt-2 p-2 bg-parchment-50 rounded text-xs border border-parchment-200 font-mono text-ink-700">
                {JSON.stringify(log.new_value)}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-[10px]">
              <span className="text-ink-500">Prev Hash:</span>
              <span className="hash-node">{log.previous_hash.slice(0, 16)}...</span>
              <span className="hash-arrow">→</span>
              <span className="text-ink-500">Curr Hash:</span>
              <span className="hash-node">{log.current_hash.slice(0, 16)}...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
