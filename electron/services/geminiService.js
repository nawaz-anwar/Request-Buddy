const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDiy5Nyqaai9Sb2xpVCZcgpbzMkSlHLxsg';
    
    if (!this.apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.initialized = true;
      console.log('Gemini AI service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI service:', error);
    }
  }

  isInitialized() {
    return this.initialized;
  }

  // Generate API Documentation
  async generateDocumentation(requestData, responseData) {
    if (!this.initialized) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `You are an expert API documentation generator. Given the following API request and response, generate professional documentation similar to Postman.

Include:
- Endpoint
- HTTP Method
- Description
- Query Parameters
- Headers
- Request Body (if any)
- Sample Success Response
- Possible Error Responses

API Request:
${JSON.stringify(requestData, null, 2)}

API Response:
${JSON.stringify(responseData, null, 2)}

Generate clean, professional markdown documentation:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw new Error('Failed to generate API documentation');
    }
  }

  // Explain API Response
  async explainResponse(responseData) {
    if (!this.initialized) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `You are an API expert. Explain the following API response in simple terms.

Include:
- What this API does
- Meaning of each field
- Important notes or warnings

Response JSON:
${JSON.stringify(responseData, null, 2)}

Provide a clear, beginner-friendly explanation:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error explaining response:', error);
      throw new Error('Failed to explain API response');
    }
  }

  // Generate Test Cases
  async generateTestCases(requestData, responseData) {
    if (!this.initialized) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `You are a QA engineer. Generate comprehensive test cases for the following API.

Include:
- Positive test cases
- Negative test cases
- Edge cases
- Boundary value tests

API Request:
${JSON.stringify(requestData, null, 2)}

Expected Response:
${JSON.stringify(responseData, null, 2)}

Generate detailed test cases in markdown format:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating test cases:', error);
      throw new Error('Failed to generate test cases');
    }
  }

  // Generate Code Snippets
  async generateCodeSnippets(requestData) {
    if (!this.initialized) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `Generate example API calls for the following request in multiple programming languages:

- curl
- JavaScript (fetch)
- JavaScript (axios)
- Python (requests)
- Node.js (http)

API Request Details:
${JSON.stringify(requestData, null, 2)}

Generate clean, working code examples with proper error handling:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating code snippets:', error);
      throw new Error('Failed to generate code snippets');
    }
  }

  // Contextual AI Chat
  async askQuestion(requestData, responseData, userQuestion) {
    if (!this.initialized) {
      throw new Error('Gemini AI service not initialized');
    }

    const prompt = `You are an API assistant inside a tool like Postman. Answer the user's question using ONLY the context of the current API request and response.

API Request:
${JSON.stringify(requestData, null, 2)}

API Response:
${JSON.stringify(responseData, null, 2)}

User Question: ${userQuestion}

Provide a helpful, contextual answer based only on the provided API data:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error answering question:', error);
      throw new Error('Failed to answer question');
    }
  }

  // Log usage for rate limiting
  logUsage(userId, action) {
    console.log(`AI Usage - User: ${userId}, Action: ${action}, Time: ${new Date().toISOString()}`);
  }
}

module.exports = GeminiService;