import recordings from "@/services/mockData/recordings.json";

class RecordingsService {
  constructor() {
    this.data = [...recordings];
  }

  async getAll() {
    await this.delay(300);
    return [...this.data];
  }

  async getById(id) {
    await this.delay(200);
    const recording = this.data.find(item => item.Id === parseInt(id));
    if (!recording) {
      throw new Error(`Recording with id ${id} not found`);
    }
    return { ...recording };
  }

  async create(recordingData) {
    await this.delay(500);
    const newRecording = {
      ...recordingData,
      Id: Math.max(...this.data.map(item => item.Id)) + 1,
      createdAt: new Date().toISOString(),
    };
    this.data.push(newRecording);
    return { ...newRecording };
  }

  async update(id, updateData) {
    await this.delay(300);
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Recording with id ${id} not found`);
    }
    this.data[index] = { ...this.data[index], ...updateData };
    return { ...this.data[index] };
  }

  async delete(id) {
    await this.delay(200);
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Recording with id ${id} not found`);
    }
    const deleted = this.data.splice(index, 1)[0];
    return { ...deleted };
}

  async createNightRecording(recordingData) {
    await this.delay(300);
    const nightRecording = {
      ...recordingData,
      Id: Math.max(...this.data.map(item => item.Id)) + 1,
      type: "night_recording",
      createdAt: new Date().toISOString(),
      isNightMode: true,
      quality: "background"
    };
    this.data.push(nightRecording);
    return { ...nightRecording };
  }

  async getNightRecordings() {
    await this.delay(200);
    return this.data
      .filter(recording => recording.type === "night_recording" || recording.isNightMode)
      .map(recording => ({ ...recording }));
  }

  async updateNightRecordingDuration(id, duration) {
    await this.delay(100);
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index !== -1) {
      this.data[index] = { 
        ...this.data[index], 
        duration,
        updatedAt: new Date().toISOString()
      };
      return { ...this.data[index] };
    }
    throw new Error(`Night recording with id ${id} not found`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const recordingsService = new RecordingsService();