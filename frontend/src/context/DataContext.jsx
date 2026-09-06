import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockApi } from "../mock/mockApi";
import { SEED_AUDIT_LOG } from "../mock/seedData";

// SWITCH POINT: this file is the only place that needs to change to point
// the app at the real FastAPI backend instead of the in-memory mock —
// replace the mockApi calls below with axios calls into
// src/api/client.js (see that file for the real-backend version).

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [records, setRecords] = useState(() => mockApi.seedRecords());
  const [uploadQueue, setUploadQueue] = useState([]);
  const [auditLog, setAuditLog] = useState(SEED_AUDIT_LOG);
  const [duplicateWarnings, setDuplicateWarnings] = useState([]);
  const [syncLog, setSyncLog] = useState([]);
  const [mutationRecords, setMutationRecords] = useState([]);

  const uploadFiles = useCallback((fileList) => {
    Array.from(fileList).forEach((file) => {
      const queueItem = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        stage: "queued",
        startedAt: Date.now(),
      };
      setUploadQueue((prev) => [queueItem, ...prev]);

      mockApi.checkDuplicate(file.name, records).then(({ isDuplicate, matchedRecord }) => {
        if (isDuplicate) {
          setDuplicateWarnings((prev) => [
            { id: queueItem.id, file: file.name, matchedRecord },
            ...prev
          ]);
          setUploadQueue((prev) => prev.filter(q => q.id !== queueItem.id));
          return;
        }

        mockApi
          .uploadDocument(file, (stage) => {
            setUploadQueue((prev) =>
              prev.map((q) => (q.id === queueItem.id ? { ...q, stage } : q))
            );
          })
        .then((record) => {
          setRecords((prev) => [record, ...prev]);
          setUploadQueue((prev) =>
            prev.map((q) =>
              q.id === queueItem.id
                ? { ...q, stage: "complete", recordId: record.record_id }
                : q
            )
          );
          // Add audit log entry
          addAuditEntry(record.record_id, "document_uploaded", null, {
            filename: file.name,
            status: record.validation_status,
            language: record.detected_language,
          });
        });
      });
    });
  }, [records]);

  const correctField = useCallback((recordId, fieldName, value) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.record_id !== recordId) return r;
        const fields = r.fields.map((f) =>
          f.field_name === fieldName
            ? { ...f, normalized_value: value, confidence_score: 100, is_manually_corrected: true }
            : f
        );
        const overall_confidence =
          Math.round(
            (fields.reduce((s, f) => s + f.confidence_score, 0) / fields.length) * 10
          ) / 10;
        return { ...r, fields, overall_confidence };
      })
    );
    addAuditEntry(recordId, "field_corrected", { field_name: fieldName }, { field_name: fieldName, value });
  }, []);

  const decideRecord = useCallback((recordId, action, notes) => {
    const statusMap = { approve: "approved", flag: "flagged", reject: "rejected" };
    setRecords((prev) =>
      prev.map((r) =>
        r.record_id === recordId
          ? { ...r, validation_status: statusMap[action] }
          : r
      )
    );
    addAuditEntry(recordId, action, null, { validation_status: statusMap[action], notes });
  }, []);

  const syncToDILRMP = useCallback(async (recordId) => {
    const result = await mockApi.syncToDILRMP(recordId);
    setRecords((prev) =>
      prev.map((r) =>
        r.record_id === recordId ? { ...r, dilrmp_sync: result } : r
      )
    );
    setSyncLog((prev) => [{ ...result, record_id: recordId }, ...prev]);
    addAuditEntry(recordId, "synced_to_DILRMP", null, result);
    return result;
  }, []);

  const searchRecords = useCallback(
    async (filters) => {
      return await mockApi.searchRecords(records, filters);
    },
    [records]
  );

  const getMutations = useCallback(async (recordId) => {
    const muts = await mockApi.getMutationRecords(recordId);
    setMutationRecords(muts);
    return muts;
  }, []);

  const getAuditLog = useCallback(async () => {
    const logs = await mockApi.getAuditLog();
    setAuditLog(logs);
    return logs;
  }, []);

  function addAuditEntry(recordId, action, oldValue, newValue) {
    const prevHash =
      auditLog.length > 0
        ? auditLog[0].current_hash
        : "genesis";
    const hash = `${prevHash.slice(0, 8)}${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`.padEnd(64, "0");
    setAuditLog((prev) => [
      {
        log_id: `log-${Date.now()}`,
        record_id: recordId,
        user_id: "current",
        user_name: "Current User",
        action,
        old_value: oldValue,
        new_value: newValue,
        previous_hash: prevHash,
        current_hash: hash,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  const [dashboardStats, setDashboardStats] = useState(null);
  useEffect(() => {
    mockApi.getDashboardStats(records).then(setDashboardStats);
  }, [records]);

  const reviewQueue = records.filter((r) => r.validation_status === "needs_review");

  return (
    <DataContext.Provider
      value={{
        records,
        uploadQueue,
        uploadFiles,
        correctField,
        decideRecord,
        reviewQueue,
        dashboardStats,
        auditLog,
        duplicateWarnings,
        syncLog,
        syncToDILRMP,
        searchRecords,
        mutationRecords,
        getMutations,
        getAuditLog,
        setDuplicateWarnings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
