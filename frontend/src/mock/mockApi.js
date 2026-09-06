// Full mock API simulating the backend AI pipeline + all data operations.
// Swap these calls for src/api/client.js when the FastAPI backend is running.

import {
  nextId, SEED_RECORDS, VILLAGES, TEHSILS, DISTRICTS, LANGUAGES, DOCUMENT_TYPES,
  LAND_CLASSIFICATIONS, OWNERSHIP_TYPES, MUTATION_STATUSES,
  SEED_DISTRICT_PROGRESS, SEED_AUDIT_LOG, SEED_MUTATION_RECORDS,
  SEED_ACCURACY_TREND, SEED_ERROR_STATS, SEED_LANGUAGE_DISTRIBUTION,
  SEED_DOCTYPE_DISTRIBUTION, SEED_AI_LEARNING_CURVE,
} from "./seedData";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const SAMPLE_NAMES = ["Ram Singh", "Kamla Devi", "Iqbal Ahmed", "Sunita Yadav", "Prakash Rao", "Meena Kumari", "Vijay Chauhan", "Anita Mishra", "Deepak Tiwari"];
const SAMPLE_GUARDIANS = ["Shiv Prasad", "Mohan Lal", "Rashid Ahmed", "Rajesh Yadav", "Venkata Rao", "Ram Nath", "Suresh Kumar"];

function randomBetween(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeField(name, value, conf) {
  return {
    field_name: name,
    normalized_value: value,
    confidence_score: conf,
    is_manually_corrected: false,
    bounding_box: {
      x: 100 + Math.floor(Math.random() * 350),
      y: 140 + Math.floor(Math.random() * 220),
      w: 60 + Math.floor(Math.random() * 120),
      h: 16 + Math.floor(Math.random() * 6),
    },
  };
}

// Simulates the full 6-stage OpenCV → PaddleOCR → NLP → Validation pipeline
function simulateExtraction(filename, documentId) {
  const khasra = `${Math.floor(Math.random() * 400)}/${Math.floor(Math.random() * 9) + 1}`;
  const khata = String(Math.floor(Math.random() * 300) + 1);
  const survey = `SRV-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
  const owner = pick(SAMPLE_NAMES);
  const guardian = pick(SAMPLE_GUARDIANS);
  const area = randomBetween(0.2, 5.0);
  const village = pick(VILLAGES);
  const tehsil = pick(TEHSILS);
  const district = pick(DISTRICTS);
  const landClass = pick(LAND_CLASSIFICATIONS);
  const ownerType = pick(OWNERSHIP_TYPES);
  const mutStatus = pick(MUTATION_STATUSES);
  const lang = pick(LANGUAGES);
  const docType = pick(DOCUMENT_TYPES);
  const regNum = `REG/${district.slice(0, 3).toUpperCase()}/${2020 + Math.floor(Math.random() * 7)}/${Math.floor(Math.random() * 9999)}`;

  const conf = {
    khasra_number: randomBetween(55, 99),
    khata_number: randomBetween(60, 99),
    survey_number: randomBetween(50, 98),
    landowner_name: randomBetween(40, 99),
    landowner_guardian_name: randomBetween(35, 97),
    plot_area: randomBetween(55, 99),
    land_classification: randomBetween(60, 99),
    ownership_type: randomBetween(60, 99),
    village: randomBetween(65, 100),
    tehsil: randomBetween(60, 99),
    district: randomBetween(70, 100),
    mutation_status: randomBetween(55, 98),
    registration_number: randomBetween(40, 96),
  };

  const overall = Math.round(
    (Object.values(conf).reduce((a, b) => a + b, 0) / Object.values(conf).length) * 10
  ) / 10;

  const passesAllRules = overall >= 95 && area > 0 && /^[0-9]+\/[0-9]+$/.test(khasra);

  return {
    record_id: nextId("rec"),
    document_id: documentId,
    document_type: docType,
    detected_language: lang,
    khasra_number: khasra,
    khata_number: khata,
    survey_number: survey,
    landowner_name: owner,
    landowner_guardian_name: guardian,
    plot_area_value: area,
    plot_area_unit: "hectare",
    land_classification: landClass,
    ownership_type: ownerType,
    mutation_status: mutStatus,
    registration_number: regNum,
    village, tehsil, district,
    overall_confidence: overall,
    validation_status: passesAllRules ? "auto_approved" : "needs_review",
    uploaded_at: new Date().toISOString(),
    source_filename: filename,
    thumbnail_seed: Math.floor(Math.random() * 6) + 1,
    is_duplicate: false,
    fields: [
      makeField("khasra_number", khasra, conf.khasra_number),
      makeField("khata_number", khata, conf.khata_number),
      makeField("survey_number", survey, conf.survey_number),
      makeField("landowner_name", owner, conf.landowner_name),
      makeField("landowner_guardian_name", guardian, conf.landowner_guardian_name),
      makeField("plot_area", String(area), conf.plot_area),
      makeField("land_classification", landClass, conf.land_classification),
      makeField("ownership_type", ownerType, conf.ownership_type),
      makeField("village", village, conf.village),
      makeField("tehsil", tehsil, conf.tehsil),
      makeField("district", district, conf.district),
      makeField("mutation_status", mutStatus, conf.mutation_status),
      makeField("registration_number", regNum, conf.registration_number),
    ],
    validation_results: [
      { rule_name: "area_positive_check", passed: area > 0, details: `Area ${area} ha ${area > 0 ? ">" : "≤"} 0` },
      { rule_name: "khasra_format_check", passed: /^[0-9]+\/[0-9]+$/.test(khasra), details: `${khasra} format check` },
      { rule_name: "owner_name_length_check", passed: owner.length >= 3, details: `Name length ${owner.length} ≥ 3` },
      { rule_name: "district_consistency_check", passed: true, details: `${village} is in ${district} district` },
      { rule_name: "duplicate_khasra_check", passed: true, details: "No duplicate found in database" },
      { rule_name: "land_classification_check", passed: LAND_CLASSIFICATIONS.includes(landClass), details: `${landClass} is a valid classification` },
      { rule_name: "registration_format_check", passed: conf.registration_number >= 70, details: conf.registration_number >= 70 ? "Format matched" : "Low confidence — manual check required" },
    ],
  };
}

export const mockApi = {
  // 6-stage animated pipeline
  async uploadDocument(file, onStageChange) {
    const documentId = nextId("doc");
    onStageChange?.("queued");
    await wait(400);
    onStageChange?.("preprocessing");   // OpenCV deskew/denoise/binarize
    await wait(800);
    onStageChange?.("ocr");             // PaddleOCR multilingual pass
    await wait(1000);
    onStageChange?.("field_extraction"); // NLP field extraction
    await wait(700);
    onStageChange?.("validation");      // Deterministic rule checks
    await wait(500);
    const record = simulateExtraction(file.name, documentId);
    onStageChange?.("complete");
    await wait(200);
    return record;
  },

  // Duplicate detection
  async checkDuplicate(filename, existingRecords) {
    await wait(100);
    // Simulate: if filename contains "dup" or matches an existing source_filename
    const isDup = existingRecords.some(
      (r) => r.source_filename === filename
    );
    if (isDup) {
      const match = existingRecords.find((r) => r.source_filename === filename);
      return { isDuplicate: true, matchedRecord: match };
    }
    return { isDuplicate: false, matchedRecord: null };
  },

  async getDashboardStats(records) {
    await wait(100);
    const total = records.length;
    const digitized = records.filter((r) => ["approved", "auto_approved"].includes(r.validation_status)).length;
    const pending = records.filter((r) => r.validation_status === "needs_review").length;
    const flagged = records.filter((r) => r.validation_status === "flagged").length;
    const overallAccuracy = total
      ? Math.round((records.reduce((sum, r) => sum + r.overall_confidence, 0) / total) * 10) / 10
      : 0;
    return {
      total_documents: total,
      digitized,
      pending_verification: pending,
      flagged,
      overall_accuracy: overallAccuracy,
      avg_processing_time: "2.4s",
      district_progress: SEED_DISTRICT_PROGRESS,
      accuracy_trend: SEED_ACCURACY_TREND,
      error_stats: SEED_ERROR_STATS,
      language_distribution: SEED_LANGUAGE_DISTRIBUTION,
      doctype_distribution: SEED_DOCTYPE_DISTRIBUTION,
      ai_learning_curve: SEED_AI_LEARNING_CURVE,
    };
  },

  // Search/filter records for Repository page
  async searchRecords(records, filters) {
    await wait(150);
    let results = [...records];
    if (filters.khasra) results = results.filter((r) => r.khasra_number?.includes(filters.khasra));
    if (filters.village) results = results.filter((r) => r.village === filters.village);
    if (filters.tehsil) results = results.filter((r) => r.tehsil === filters.tehsil);
    if (filters.district) results = results.filter((r) => r.district === filters.district);
    if (filters.status) results = results.filter((r) => r.validation_status === filters.status);
    if (filters.language) results = results.filter((r) => r.detected_language === filters.language);
    if (filters.minConfidence) results = results.filter((r) => r.overall_confidence >= parseFloat(filters.minConfidence));
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter((r) =>
        r.landowner_name?.toLowerCase().includes(q) ||
        r.khasra_number?.toLowerCase().includes(q) ||
        r.village?.toLowerCase().includes(q)
      );
    }
    return results;
  },

  // Simulate DILRMP/LRMS/GIS external sync
  async syncToDILRMP(recordId) {
    await wait(1500);
    return {
      sync_id: `DILRMP-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
      target_system: "DILRMP",
      status: "synced",
      synced_at: new Date().toISOString(),
    };
  },

  async getAuditLog() {
    await wait(100);
    return SEED_AUDIT_LOG;
  },

  async getMutationRecords(recordId) {
    await wait(100);
    if (recordId) return SEED_MUTATION_RECORDS.filter((m) => m.record_id === recordId);
    return SEED_MUTATION_RECORDS;
  },

  seedRecords() {
    return SEED_RECORDS;
  },
};
