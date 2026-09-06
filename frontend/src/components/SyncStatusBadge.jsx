/**
 * DILRMP / LRMS / GIS sync status badges.
 */
export default function SyncStatusBadge({ syncData }) {
  if (!syncData) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-parchment-100 text-ink-600">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-400"></span>
        Not synced
      </span>
    );
  }

  const statusColors = {
    synced: "bg-moss-500",
    pending: "bg-amber-500 animate-pulse-soft",
    failed: "bg-seal-500",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded bg-moss-500/10 text-moss-600 font-medium">
      <span className={`w-1.5 h-1.5 rounded-full ${statusColors[syncData.status] || "bg-ink-400"}`}></span>
      {syncData.status === "synced" && `Synced to DILRMP`}
      {syncData.status === "pending" && `Syncing…`}
      {syncData.status === "failed" && `Sync failed`}
      {syncData.sync_id && (
        <span className="text-moss-500 ml-1">{syncData.sync_id}</span>
      )}
    </span>
  );
}
