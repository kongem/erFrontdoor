-- ==========================================
-- Supabase PostgreSQL Relational Schema
-- ==========================================
-- This schema stores all digital front door triage sessions, 
-- clinician audits, patient exit feedback, and general experience surveys.

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL, -- 'triage_case', 'provider_feedback', 'exit_survey', or 'experience_feedback'
  ref_id TEXT NULL,    -- Unique code linking patient run, clinician review, and exit surveys (e.g. 'PEDS-TRG-123456')
  data JSONB NOT NULL  -- Flexible relational payload storing specific inputs/ratings
);

-- Create indexes to optimize search lookup and dashboard queries
CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
CREATE INDEX IF NOT EXISTS idx_logs_ref_id ON logs(ref_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);

-- ==========================================
-- JSONB Document Schemas (stored in logs.data)
-- ==========================================

-- 1. type = 'triage_case'
-- data: {
--   "updatedAt": "ISO Timestamp String",
--   "emailSent": boolean,
--   "emailDetails": { "doctorName": "...", "doctorEmail": "...", "timestamp": "..." },
--   "child": { "name": "...", "ageInMonths": int, "sex": "...", "weightKg": float, "hasChronicConditions": boolean },
--   "guardian": { "relationship": "...", "postalCode": "..." },
--   "symptoms": { "primarySymptom": "...", "hasFever": boolean, "feverTempCelsius": float, "feverDurationHours": int, "selectedRedFlags": [...], "selectedSecondarySymptoms": [...], "additionalNotes": "..." },
--   "result": { "category": "...", "title": "...", "badgeText": "...", "badgeBg": "...", "summary": "...", "timeframeNotice": "...", "actionPlan": [...], "recommendedFacilityType": "...", "disclaimer": "..." }
-- }

-- 2. type = 'provider_feedback' (Clinician Audits)
-- data: {
--   "rating": int (1-5 stars: accuracy),
--   "accessRating": int (1-5 stars: access ease),
--   "completenessRating": int (1-5 stars: summary completeness),
--   "comment": "..."
-- }

-- 3. type = 'exit_survey' (Patient Exit Feedback)
-- data: {
--   "skipped": boolean,
--   "helpedDecide": "yes" | "no" | "unsure" | null,
--   "comment": "..."
-- }

-- 4. type = 'experience_feedback' (Patient & Parent Experience Feedback Page)
-- data: {
--   "rating": int (1-5 stars: overall experience),
--   "visitType": "triage" | "er-summary" | "faq" | "education",
--   "selectedTags": text[], (e.g. ["Fast Triage", "Clean UI"])
--   "comment": "..."
-- }
