import summaries from "@/services/mockData/summaries.json";

class SummariesService {
  constructor() {
    this.data = [...summaries];
  }

  async getAll() {
    await this.delay(300);
    return [...this.data];
  }

  async getById(id) {
    await this.delay(200);
    const summary = this.data.find(item => item.id === id);
    if (!summary) {
      throw new Error(`Summary with id ${id} not found`);
    }
    return { ...summary };
  }

  async getByRecordingId(recordingId) {
    await this.delay(200);
    const summary = this.data.find(item => item.recordingId === recordingId);
    if (!summary) {
      throw new Error(`Summary for recording ${recordingId} not found`);
    }
    return { ...summary };
  }

  async create(summaryData) {
    await this.delay(800);
    const newSummary = {
      ...summaryData,
      id: `summary_${Date.now()}`,
    };
    this.data.push(newSummary);
    return { ...newSummary };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const summariesService = new SummariesService();