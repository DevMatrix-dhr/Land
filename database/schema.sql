-- =====================================================================
-- Intelligent Land Record Digitization and Validation System
-- MySQL Database Schema
-- =====================================================================

CREATE DATABASE IF NOT EXISTS if0_42848701_land;
USE if0_42848701_land;

-- ---------------------------------------------------------------------
-- 1. USERS & ROLE-BASED ACCESS CONTROL
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSON DEFAULT ('{}')
);

CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    role_id INT,
    district VARCHAR(100),
    tehsil VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- ---------------------------------------------------------------------
-- 2. ADMINISTRATIVE HIERARCHY (State > District > Tehsil > Village)
-- ---------------------------------------------------------------------
CREATE TABLE administrative_units (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_type VARCHAR(20) NOT NULL CHECK (unit_type IN ('state','district','tehsil','village')),
    unit_name VARCHAR(150) NOT NULL,
    parent_unit_id INT,
    FOREIGN KEY (parent_unit_id) REFERENCES administrative_units(unit_id)
);

-- ---------------------------------------------------------------------
-- 3. DOCUMENT INGESTION
-- ---------------------------------------------------------------------
CREATE TABLE documents (
    document_id CHAR(36) PRIMARY KEY,
    original_filename VARCHAR(500) NOT NULL,
    storage_path TEXT NOT NULL,
    processed_path TEXT,
    document_type VARCHAR(50),
    language_detected VARCHAR(20),
    upload_status VARCHAR(30) DEFAULT 'queued' CHECK (upload_status IN ('queued','processing','ocr_done','validated','failed')),
    uploaded_by CHAR(36),
    village_unit_id INT,
    page_count INT DEFAULT 1,
    file_hash VARCHAR(128),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
    FOREIGN KEY (village_unit_id) REFERENCES administrative_units(unit_id)
);

CREATE INDEX idx_documents_status ON documents(upload_status);
CREATE INDEX idx_documents_hash ON documents(file_hash);

-- ---------------------------------------------------------------------
-- 4. LAND RECORDS (core structured entity)
-- ---------------------------------------------------------------------
CREATE TABLE land_records (
    record_id CHAR(36) PRIMARY KEY,
    document_id CHAR(36),
    khasra_number VARCHAR(50),
    khata_number VARCHAR(50),
    survey_number VARCHAR(50),
    landowner_name VARCHAR(255),
    landowner_guardian_name VARCHAR(255),
    village_unit_id INT,
    tehsil_unit_id INT,
    district_unit_id INT,
    plot_area_value NUMERIC(12,4),
    plot_area_unit VARCHAR(20) DEFAULT 'hectare',
    land_classification VARCHAR(100),
    ownership_type VARCHAR(50),
    mutation_status VARCHAR(50),
    registration_number VARCHAR(100),
    registration_date DATE,
    overall_confidence NUMERIC(5,2),
    validation_status VARCHAR(30) DEFAULT 'pending' CHECK (validation_status IN ('pending','auto_approved','needs_review','approved','flagged','rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(document_id),
    FOREIGN KEY (village_unit_id) REFERENCES administrative_units(unit_id),
    FOREIGN KEY (tehsil_unit_id) REFERENCES administrative_units(unit_id),
    FOREIGN KEY (district_unit_id) REFERENCES administrative_units(unit_id)
);

CREATE INDEX idx_land_records_khasra ON land_records(khasra_number);
CREATE INDEX idx_land_records_village ON land_records(village_unit_id);
CREATE INDEX idx_land_records_status ON land_records(validation_status);

-- ---------------------------------------------------------------------
-- 5. FIELD-LEVEL EXTRACTION + CONFIDENCE
-- ---------------------------------------------------------------------
CREATE TABLE extracted_fields (
    field_id CHAR(36) PRIMARY KEY,
    record_id CHAR(36) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    raw_ocr_text TEXT,
    normalized_value TEXT,
    confidence_score NUMERIC(5,2),
    bounding_box JSON,
    source_page INT DEFAULT 1,
    is_manually_corrected BOOLEAN DEFAULT FALSE,
    corrected_by CHAR(36),
    corrected_at DATETIME,
    FOREIGN KEY (record_id) REFERENCES land_records(record_id) ON DELETE CASCADE,
    FOREIGN KEY (corrected_by) REFERENCES users(user_id)
);

CREATE INDEX idx_extracted_fields_record ON extracted_fields(record_id);
CREATE INDEX idx_extracted_fields_confidence ON extracted_fields(confidence_score);

-- ---------------------------------------------------------------------
-- 6. VALIDATION RULES & CROSS-CHECK RESULTS
-- ---------------------------------------------------------------------
CREATE TABLE validation_rules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(150) NOT NULL,
    rule_type VARCHAR(50),
    rule_description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE validation_results (
    result_id CHAR(36) PRIMARY KEY,
    record_id CHAR(36) NOT NULL,
    rule_id INT,
    passed BOOLEAN,
    details JSON,
    checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES land_records(record_id) ON DELETE CASCADE,
    FOREIGN KEY (rule_id) REFERENCES validation_rules(rule_id)
);

-- ---------------------------------------------------------------------
-- 7. HUMAN VERIFICATION / REVIEW QUEUE
-- ---------------------------------------------------------------------
CREATE TABLE review_queue (
    review_id CHAR(36) PRIMARY KEY,
    record_id CHAR(36) NOT NULL,
    assigned_to CHAR(36),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','in_review','resolved','escalated')),
    review_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (record_id) REFERENCES land_records(record_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

-- ---------------------------------------------------------------------
-- 8. IMMUTABLE AUDIT TRAIL
-- ---------------------------------------------------------------------
CREATE TABLE audit_log (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_id CHAR(36),
    user_id CHAR(36),
    action VARCHAR(50) NOT NULL,
    old_value JSON,
    new_value JSON,
    previous_hash VARCHAR(128),
    current_hash VARCHAR(128) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES land_records(record_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_audit_record ON audit_log(record_id);

-- ---------------------------------------------------------------------
-- 9. EXTERNAL SYSTEM INTEGRATION
-- ---------------------------------------------------------------------
CREATE TABLE external_sync_log (
    sync_id CHAR(36) PRIMARY KEY,
    record_id CHAR(36),
    target_system VARCHAR(50),
    sync_status VARCHAR(30) DEFAULT 'pending',
    request_payload JSON,
    response_payload JSON,
    synced_at DATETIME
);

-- ---------------------------------------------------------------------
-- 10. DASHBOARD SUMMARY (materialized table - replaces view due to permissions)
-- ---------------------------------------------------------------------
CREATE TABLE dashboard_summary (
    district_name VARCHAR(150) PRIMARY KEY,
    total_records BIGINT DEFAULT 0,
    approved_count BIGINT DEFAULT 0,
    pending_review_count BIGINT DEFAULT 0,
    avg_confidence NUMERIC(5,2) DEFAULT 0.00
);

DELIMITER $$

CREATE TRIGGER trg_dashboard_land_records_insert AFTER INSERT ON land_records
FOR EACH ROW
BEGIN
    INSERT INTO dashboard_summary (district_name, total_records, approved_count, pending_review_count, avg_confidence)
    SELECT 
        au.unit_name,
        1,
        CASE WHEN NEW.validation_status = 'approved' THEN 1 ELSE 0 END,
        CASE WHEN NEW.validation_status = 'needs_review' THEN 1 ELSE 0 END,
        COALESCE(NEW.overall_confidence, 0.00)
    FROM administrative_units au WHERE au.unit_id = NEW.district_unit_id
    ON DUPLICATE KEY UPDATE
        total_records = total_records + 1,
        approved_count = approved_count + CASE WHEN NEW.validation_status = 'approved' THEN 1 ELSE 0 END,
        pending_review_count = pending_review_count + CASE WHEN NEW.validation_status = 'needs_review' THEN 1 ELSE 0 END,
        avg_confidence = ROUND(((avg_confidence * (total_records - 1)) + COALESCE(NEW.overall_confidence, 0.00)) / total_records, 2);
END$$

CREATE TRIGGER trg_dashboard_land_records_update AFTER UPDATE ON land_records
FOR EACH ROW
BEGIN
    IF OLD.district_unit_id <> NEW.district_unit_id THEN
        UPDATE dashboard_summary ds
        JOIN administrative_units au ON au.unit_name = ds.district_name
        SET ds.total_records = ds.total_records - 1
        WHERE au.unit_id = OLD.district_unit_id;
    END IF;
    
    INSERT INTO dashboard_summary (district_name, total_records, approved_count, pending_review_count, avg_confidence)
    SELECT 
        au.unit_name,
        0,
        0,
        0,
        0.00
    FROM administrative_units au WHERE au.unit_id = NEW.district_unit_id
    ON DUPLICATE KEY UPDATE
        total_records = total_records + 1,
        approved_count = approved_count + CASE WHEN NEW.validation_status = 'approved' THEN 1 ELSE 0 END,
        pending_review_count = pending_review_count + CASE WHEN NEW.validation_status = 'needs_review' THEN 1 ELSE 0 END,
        avg_confidence = ROUND(((avg_confidence * (total_records - 1)) + COALESCE(NEW.overall_confidence, 0.00)) / total_records, 2);
END$$

CREATE TRIGGER trg_dashboard_land_records_delete AFTER DELETE ON land_records
FOR EACH ROW
BEGIN
    UPDATE dashboard_summary ds
    JOIN administrative_units au ON au.unit_name = ds.district_name
    SET ds.total_records = ds.total_records - 1,
        ds.approved_count = ds.approved_count - CASE WHEN OLD.validation_status = 'approved' THEN 1 ELSE 0 END,
        ds.pending_review_count = ds.pending_review_count - CASE WHEN OLD.validation_status = 'needs_review' THEN 1 ELSE 0 END
    WHERE au.unit_id = OLD.district_unit_id;
END$$

DELIMITER ;

-- Seed default roles
INSERT INTO roles (role_name, permissions) VALUES
    ('admin', '{"all": true}'),
    ('tehsildar', '{"verify": true, "approve": true}'),
    ('clerk', '{"upload": true, "view": true}'),
    ('viewer', '{"view": true}');
