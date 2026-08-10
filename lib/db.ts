import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

if (typeof window !== 'undefined') {
  throw new Error('This module can only be executed on the server side to protect secret service role keys.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!)
  : null;

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'feedback.json');

// Helper to read local logs file
async function readLocalFile(): Promise<any[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper to write local logs file
async function writeLocalFile(data: any[]): Promise<void> {
  const dir = path.dirname(DATA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getAllLogs(): Promise<any[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching logs from Supabase:', error);
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      refId: row.ref_id,
      ...row.data,
    }));
  } else {
    return readLocalFile();
  }
}

export async function insertLog(entry: Record<string, any>): Promise<void> {
  const id = entry.id || `ENTRY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const timestamp = entry.timestamp || new Date().toISOString();
  const type = entry.type || 'general_feedback';
  const refId = entry.refId || null;

  // Clone entry to clean it
  const cleanData = { ...entry };
  delete cleanData.id;
  delete cleanData.timestamp;
  delete cleanData.type;
  delete cleanData.refId;

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('logs').insert({
      id,
      timestamp,
      type,
      ref_id: refId,
      data: cleanData,
    });

    if (error) {
      console.error('Error inserting log into Supabase:', error);
      throw error;
    }
  } else {
    const localData = await readLocalFile();
    localData.push({
      id,
      timestamp,
      type,
      refId,
      ...cleanData,
    });
    await writeLocalFile(localData);
  }
}

export async function saveOrUpdateTriageCaseLog(refId: string, entry: Record<string, any>): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // Check if triage case already exists
    const { data: existing, error: selectError } = await supabase
      .from('logs')
      .select('*')
      .eq('type', 'triage_case')
      .eq('ref_id', refId)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing triage case in Supabase:', selectError);
      throw selectError;
    }

    const id = existing ? existing.id : `ENTRY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const timestamp = existing ? existing.timestamp : new Date().toISOString();

    const cleanData = { ...entry };
    delete cleanData.id;
    delete cleanData.timestamp;
    delete cleanData.type;
    delete cleanData.refId;

    const { error } = await supabase.from('logs').upsert({
      id,
      timestamp,
      type: 'triage_case',
      ref_id: refId,
      data: {
        ...cleanData,
        updatedAt: new Date().toISOString(),
      },
    });

    if (error) {
      console.error('Error upserting triage case in Supabase:', error);
      throw error;
    }
  } else {
    const localData = await readLocalFile();
    const index = localData.findIndex((item) => item.type === 'triage_case' && item.refId === refId);

    const id = index !== -1 ? localData[index].id : `ENTRY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const timestamp = index !== -1 ? localData[index].timestamp : new Date().toISOString();

    const timestampedEntry = {
      id,
      timestamp,
      updatedAt: new Date().toISOString(),
      ...entry,
    };

    if (index !== -1) {
      localData[index] = timestampedEntry;
    } else {
      localData.push(timestampedEntry);
    }
    await writeLocalFile(localData);
  }
}

export async function markTriageEmailSentLog(refId: string, emailDetails: { doctorName: string; doctorEmail: string }): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { data: existing, error: selectError } = await supabase
      .from('logs')
      .select('*')
      .eq('type', 'triage_case')
      .eq('ref_id', refId)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking existing triage case in Supabase:', selectError);
      throw selectError;
    }

    if (existing) {
      const updatedData = {
        ...existing.data,
        emailSent: true,
        emailDetails: {
          doctorName: emailDetails.doctorName,
          doctorEmail: emailDetails.doctorEmail,
          timestamp: new Date().toISOString(),
        },
      };

      const { error } = await supabase.from('logs').update({ data: updatedData }).eq('id', existing.id);
      if (error) {
        console.error('Error updating triage case email status in Supabase:', error);
        throw error;
      }
    } else {
      // Append a stub case
      await insertLog({
        type: 'triage_case',
        refId,
        emailSent: true,
        emailDetails: {
          doctorName: emailDetails.doctorName,
          doctorEmail: emailDetails.doctorEmail,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } else {
    const localData = await readLocalFile();
    const index = localData.findIndex((item) => item.type === 'triage_case' && item.refId === refId);
    if (index !== -1) {
      localData[index].emailSent = true;
      localData[index].emailDetails = {
        doctorName: emailDetails.doctorName,
        doctorEmail: emailDetails.doctorEmail,
        timestamp: new Date().toISOString(),
      };
    } else {
      localData.push({
        id: `ENTRY-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        timestamp: new Date().toISOString(),
        type: 'triage_case',
        refId,
        emailSent: true,
        emailDetails: {
          doctorName: emailDetails.doctorName,
          doctorEmail: emailDetails.doctorEmail,
          timestamp: new Date().toISOString(),
        },
      });
    }
    await writeLocalFile(localData);
  }
}
