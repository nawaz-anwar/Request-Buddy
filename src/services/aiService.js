// AI Service - Frontend interface to Electron AI capabilities
class AIService {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
  }

  async checkAvailability() {
    if (!this.isElectron) {
      return { available: false, error: 'AI features only available in desktop app' };
    }

    try {
      return await window.electronAPI.aiCheckAvailability();
    } catch (error) {
      console.error('Error checking AI availability:', error);
      return { available: false, error: error.message };
    }
  }

  async generateDocumentation(requestData, responseData, userId) {
    if (!this.isElectron) {
      throw new Error('AI features only available in desktop app');
    }

    try {
      const result = await window.electronAPI.aiGenerateDocumentation(
        this.sanitizeRequestData(requestData),
        this.sanitizeResponseData(responseData),
        userId
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw error;
    }
  }

  async explainResponse(responseData, userId) {
    if (!this.isElectron) {
      throw new Error('AI features only available in desktop app');
    }

    try {
      const result = await window.electronAPI.aiExplainResponse(
        this.sanitizeResponseData(responseData),
        userId
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error explaining response:', error);
      throw error;
    }
  }

  async generateTestCases(requestData, responseData, userId) {
    if (!this.isElectron) {
      throw new Error('AI features only available in desktop app');
    }

    try {
      const result = await window.electronAPI.aiGenerateTestCases(
        this.sanitizeRequestData(requestData),
        this.sanitizeResponseData(responseData),
        userId
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw error;
    }
  }

  async generateCodeSnippets(requestData, userId) {
    if (!this.isElectron) {
      throw new Error('AI features only available in desktop app');
    }

    try {
      const result = await window.electronAPI.aiGenerateCodeSnippets(
        this.sanitizeRequestData(requestData),
        userId
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error generating code snippets:', error);
      throw error;
    }
  }

  async askQuestion(requestData, responseData, userQuestion, userId) {
    if (!this.isElectron) {
      throw new Error('AI features only available in desktop app');
    }

    if (!userQuestion || userQuestion.trim().length === 0) {
      throw new Error('Please enter a question');
    }

    try {
      const result = await window.electronAPI.aiAskQuestion(
        this.sanitizeRequestData(requestData),
        this.sanitizeResponseData(responseData),
        userQuestion.trim(),
        userId
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error asking AI question:', error);
      throw error;
    }
  }

  // Sanitize request data for AI processing
  sanitizeRequestData(requestData) {
    if (!requestData) return {};

    return {
      method: requestData.method || 'GET',
      url: requestData.url || '',
      headers: requestData.headers || {},
      params: requestData.params || {},
      body: requestData.body || { type: 'none' },
      auth: requestData.auth || { type: 'none' }
    };
  }

  // Sanitize response data for AI processing
  sanitizeResponseData(responseData) {
    if (!responseData) return {};

    return {
      status: responseData.status || 0,
      statusText: responseData.statusText || '',
      headers: responseData.headers || {},
      data: responseData.data || {},
      time: responseData.time || 0,
      size: responseData.size || 0
    };
  }
}

export default new AIService();