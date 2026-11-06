import fs from 'fs';
import path from 'path';

export interface HistoryShortRecord {
  title: string;
  archetype?: string;
  trendingTopic?: string;
  category?: string;
  date?: string;
  videoUrl?: string;
  [key: string]: unknown;
}

export interface HistoryLongformRecord {
  title: string;
  date?: string;
  videoUrl?: string;
  [key: string]: unknown;
}

/**
 * Normalizes a title for strict anti-repetition comparison:
 * lowercases, removes emojis, punctuation, extra whitespace.
 */
export function normalizeTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Production History Database
 * Loads persistent records from history.json and history_longform.json
 * to guarantee that generated titles, topics, and premises never repeat.
 */
export class ProductionHistoryDatabase {
  private shortsHistoryPath: string;
  private longformHistoryPath: string;
  private shortsRecords: HistoryShortRecord[] = [];
  private longformRecords: HistoryLongformRecord[] = [];

  constructor(baseDir: string = process.cwd()) {
    this.shortsHistoryPath = path.join(baseDir, 'history.json');
    this.longformHistoryPath = path.join(baseDir, 'longform', 'data', 'history_longform.json');
    this.reload();
  }

  public reload(): void {
    if (fs.existsSync(this.shortsHistoryPath)) {
      try {
        const raw = fs.readFileSync(this.shortsHistoryPath, 'utf8');
        this.shortsRecords = JSON.parse(raw);
      } catch {
        this.shortsRecords = [];
      }
    } else {
      this.shortsRecords = [];
    }

    if (fs.existsSync(this.longformHistoryPath)) {
      try {
        const raw = fs.readFileSync(this.longformHistoryPath, 'utf8');
        this.longformRecords = JSON.parse(raw);
      } catch {
        this.longformRecords = [];
      }
    } else {
      this.longformRecords = [];
    }
  }

  public getProducedShortTitles(): string[] {
    return this.shortsRecords.map((r) => r.title).filter(Boolean);
  }

  public getProducedLongformTitles(): string[] {
    return this.longformRecords.map((r) => r.title).filter(Boolean);
  }

  public getAllProducedTitles(): string[] {
    return [...this.getProducedShortTitles(), ...this.getProducedLongformTitles()];
  }

  public getProducedTopicIds(): Set<string> {
    const ids = new Set<string>();
    for (const record of this.shortsRecords) {
      if (record.trendingTopic) {
        ids.add(record.trendingTopic.toLowerCase());
      }
    }
    return ids;
  }

  /**
   * Checks whether a topic ID has already been produced.
   */
  public isTopicProduced(topicId: string): boolean {
    if (!topicId) return false;
    const normalized = topicId.toLowerCase().trim();
    return this.getProducedTopicIds().has(normalized);
  }

  /**
   * Checks whether a candidate title has already been used or is dangerously similar.
   */
  public isTitleDuplicate(candidateTitle: string): boolean {
    if (!candidateTitle) return true;
    const cleanCandidate = normalizeTitle(candidateTitle);
    if (!cleanCandidate) return true;

    for (const title of this.getAllProducedTitles()) {
      const cleanExisting = normalizeTitle(title);
      // Exact normalized match
      if (cleanCandidate === cleanExisting) {
        return true;
      }
      // Substring containment if long enough
      if (
        cleanCandidate.length > 15 &&
        (cleanExisting.includes(cleanCandidate) || cleanCandidate.includes(cleanExisting))
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Records a new short into history.json safely.
   */
  public recordShort(record: HistoryShortRecord): void {
    this.shortsRecords.push(record);
    fs.writeFileSync(this.shortsHistoryPath, JSON.stringify(this.shortsRecords, null, 2));
  }

  /**
   * Records a new longform episode into history_longform.json safely.
   */
  public recordLongform(record: HistoryLongformRecord): void {
    this.longformRecords.push(record);
    fs.writeFileSync(this.longformHistoryPath, JSON.stringify(this.longformRecords, null, 2));
  }
}

// Global default singleton instance
export const productionDb = new ProductionHistoryDatabase();

