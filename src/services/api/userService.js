// User profile and preferences management service
class UserService {
  constructor() {
    this.preferencesKey = 'voicevault_preferences';
  }

  async getUserPreferences(userId) {
    await this.delay(200);
    
    try {
      const preferences = localStorage.getItem(`${this.preferencesKey}_${userId}`);
      return preferences ? JSON.parse(preferences) : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  async updateUserPreferences(userId, preferences) {
    await this.delay(300);
    
    try {
      const currentPrefs = await this.getUserPreferences(userId);
      const updatedPrefs = {
        ...currentPrefs,
        ...preferences,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(`${this.preferencesKey}_${userId}`, JSON.stringify(updatedPrefs));
      return updatedPrefs;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  async resetUserPreferences(userId) {
    await this.delay(200);
    
    try {
      const defaultPrefs = this.getDefaultPreferences();
      localStorage.setItem(`${this.preferencesKey}_${userId}`, JSON.stringify(defaultPrefs));
      return defaultPrefs;
    } catch (error) {
      console.error('Error resetting user preferences:', error);
      throw new Error('Failed to reset preferences');
    }
  }

  getDefaultPreferences() {
    return {
      theme: 'dark',
      language: 'en',
      notifications: {
        email: true,
        browser: true,
        recordingComplete: true,
        weeklyDigest: false
      },
      audio: {
        autoPlayRecordings: false,
        defaultPlaybackSpeed: 1.0,
        skipSilence: false
      },
      recording: {
        autoSave: true,
        defaultMaxDuration: 5400, // 90 minutes
        audioQuality: 'high'
      },
      transcription: {
        autoTranscribe: true,
        language: 'auto',
        includeSpeakerLabels: true,
        filterProfanity: false
      },
      privacy: {
        shareAnalytics: false,
        saveRecordingsLocally: true,
        autoDeleteAfterDays: 0 // 0 = never delete
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async getUserStats(userId) {
    await this.delay(300);
    
    // In a real implementation, this would query actual user data
    // For now, return mock statistics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      totalRecordings: 42,
      totalDuration: 18640, // in seconds
      averageRecordingLength: 444, // in seconds
      recordingsThisMonth: 8,
      totalTranscriptions: 38,
      totalSummaries: 35,
      favoriteCategories: ['Meeting', 'Interview', 'Lecture'],
      mostActiveDay: 'Tuesday',
      streakDays: 5,
      generatedAt: now.toISOString()
    };
  }

  async exportUserData(userId) {
    await this.delay(500);
    
    const preferences = await this.getUserPreferences(userId);
    const stats = await this.getUserStats(userId);
    
    return {
      preferences,
      stats,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  async deleteUserData(userId) {
    await this.delay(400);
    
    try {
      // Remove preferences
      localStorage.removeItem(`${this.preferencesKey}_${userId}`);
      
      // In a real implementation, this would also:
      // - Delete recordings
      // - Delete transcriptions
      // - Delete summaries
      // - Clear API keys
      // - Remove from analytics
      
      return { success: true, deletedAt: new Date().toISOString() };
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const userService = new UserService();