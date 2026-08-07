import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'feedback.json');

export async function appendToFeedbackStore(entry: Record<string, any>): Promise<void> {
  try {
    // Ensure data directory exists
    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });

    let existingData: any[] = [];
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      existingData = JSON.parse(fileContent);
      if (!Array.isArray(existingData)) {
        existingData = [];
      }
    } catch {
      existingData = [];
    }

    const timestampedEntry = {
      id: `ENTRY-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    existingData.push(timestampedEntry);

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to feedback.json:', error);
    throw error;
  }
}
