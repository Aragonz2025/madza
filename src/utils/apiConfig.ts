// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  // Health
  HEALTH: `${API_BASE_URL}/api/health`,
  
  // Patient endpoints
  PATIENTS: `${API_BASE_URL}/api/patients`,
  PATIENT_REGISTER: `${API_BASE_URL}/api/patient/register`,
  PATIENT_GET: (id: string) => `${API_BASE_URL}/api/patient/${id}`,
  
  // Claim endpoints
  CLAIMS: `${API_BASE_URL}/api/claims`,
  CLAIM_PROCESS: `${API_BASE_URL}/api/claims/process`,
  CLAIM_GET: (id: string) => `${API_BASE_URL}/api/claims/${id}`,
  CLAIM_APPROVE: (id: string) => `${API_BASE_URL}/api/claims/${id}/approve`,
  CLAIM_DENY: (id: string) => `${API_BASE_URL}/api/claims/${id}/deny`,
  CLAIM_UPDATE: (id: string) => `${API_BASE_URL}/api/claims/${id}`,
  CLAIM_SUGGESTIONS: (id: string) => `${API_BASE_URL}/api/claims/${id}/suggestions`,
  
  // Observability endpoints
  METRICS: `${API_BASE_URL}/api/observability/metrics`,
  ALERTS: `${API_BASE_URL}/api/observability/alerts`,
  
  // Agent endpoints
  AGENT_STATUS: `${API_BASE_URL}/api/agents/status`,
  
  // Activity endpoints
  RECENT_ACTIVITY: `${API_BASE_URL}/api/activity/recent`,
};

export default API_BASE_URL;
