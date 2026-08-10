import {
  insertLog,
  saveOrUpdateTriageCaseLog,
  markTriageEmailSentLog,
} from './db';

export async function appendToFeedbackStore(entry: Record<string, any>): Promise<void> {
  return insertLog(entry);
}

export async function saveOrUpdateTriageCase(refId: string, entry: Record<string, any>): Promise<void> {
  return saveOrUpdateTriageCaseLog(refId, entry);
}

export async function markTriageEmailSent(refId: string, emailDetails: { doctorName: string; doctorEmail: string }): Promise<void> {
  return markTriageEmailSentLog(refId, emailDetails);
}
