// FRA Atlas Configuration
// Replace __BACKEND_URL__ with your Google Apps Script Web App URL

export const BACKEND_URL = "https://script.google.com/macros/s/AKfycbwte6sQhPHQ36Pje_JtlredN6xFSaNSQ-_sENr4qEhh9YcV_Plagt6g8THi7zLhvwONTA/exec";

// Sample backend endpoints:
// GET /claims - returns array of claim objects
// POST /claims - submit new claim data
// GET /claim/:id - get single claim by ID
// PATCH /claim/:id - update claim status

export const config = {
  // Map configuration
  MAP_CENTER: [21.7679, 78.8718], // Central India
  MAP_ZOOM: 5,
  
  // OCR configuration
  OCR_LANGUAGES: ['eng', 'hin'], // English and Hindi
  
  // Voice recognition
  VOICE_LANGUAGE: 'en-IN',
  
  // Clustering threshold
  CLUSTERING_THRESHOLD: 50,
  
  // Cache settings
  CACHE_LIMIT: 20, // Number of claims to cache locally
};