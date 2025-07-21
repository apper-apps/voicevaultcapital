import transcripts from "@/services/mockData/transcripts.json";

class TranscriptsService {
  constructor() {
    this.data = [...transcripts];
  }

  async getAll() {
    await this.delay(300);
    return [...this.data];
  }

  async getById(id) {
    await this.delay(200);
    const transcript = this.data.find(item => item.id === id);
    if (!transcript) {
      throw new Error(`Transcript with id ${id} not found`);
    }
    return { ...transcript };
  }

  async getByRecordingId(recordingId) {
    await this.delay(200);
    const transcript = this.data.find(item => item.recordingId === recordingId);
    if (!transcript) {
      throw new Error(`Transcript for recording ${recordingId} not found`);
    }
    return { ...transcript };
  }

  async create(transcriptData) {
    await this.delay(500);
    const newTranscript = {
      ...transcriptData,
      id: `transcript_${Date.now()}`,
    };
    this.data.push(newTranscript);
    return { ...newTranscript };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const transcriptsService = new TranscriptsService();