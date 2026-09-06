// Real backend client. To go live: in DataContext.jsx, replace the
// `mockApi` import/calls with these functions — same call shapes, so
// the swap is mechanical.
import axios from "axios";

const client = axios.create({ baseURL: "/api" });

export const api = {
  async uploadDocument(file) {
    const form = new FormData();
    form.append("file", file);
    const res = await client.post("/documents/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getRecord(recordId) {
    const res = await client.get(`/records/${recordId}`);
    return res.data;
  },

  async searchRecords(params) {
    const res = await client.get("/records", { params });
    return res.data;
  },

  async correctField(recordId, fieldName, correctedValue, correctedBy) {
    const res = await client.patch(`/records/${recordId}/field`, {
      field_name: fieldName,
      corrected_value: correctedValue,
      corrected_by: correctedBy,
    });
    return res.data;
  },

  async decideRecord(recordId, action, reviewerId, notes) {
    const res = await client.post("/verification/decide", {
      record_id: recordId,
      action,
      reviewer_id: reviewerId,
      notes,
    });
    return res.data;
  },

  async getReviewQueue(params) {
    const res = await client.get("/verification/queue", { params });
    return res.data;
  },

  async getDashboardStats() {
    const res = await client.get("/dashboard/stats");
    return res.data;
  },

  async login(username, password) {
    const res = await client.post("/auth/login", null, { params: { username, password } });
    return res.data;
  },
};
