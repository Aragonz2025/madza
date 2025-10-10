/**
 * Utility functions for parsing AI analysis data from different components
 */

export interface ParsedAIAnalysis {
  validation?: {
    status: string;
    details?: Record<string, any>;
    notes?: string;
  };
  coverageCheck?: {
    policyCoverage: string;
    medicalNecessity: string;
    procedureCoverage?: Record<string, string>;
    deductibleApplicable?: boolean;
    coinsuranceApplicable?: boolean;
    coverageDecision: string;
  };
  fraudRiskAssessment?: {
    riskLevel: string;
    riskFactorsConsidered?: string[];
    recommendation: string;
  };
  approvalRequirements?: {
    requiredDocuments?: string[];
    preAuthorization: string;
    additionalSteps?: string[];
  };
  processingTimeEstimate?: {
    standardTurnaround: string;
    potentialDelays?: string[];
  };
  nextSteps?: string[];
  // Patient registration specific fields (snake_case)
  risk_assessment?: {
    insurance_eligibility: string;
    justification: string;
    insurance_eligibility_score?: number;
    risk_level?: string;
    eligibility_rationale?: string;
    notes?: string;
    comments?: string;
  };
  data_quality_analysis?: {
    [key: string]: any;
    overall_quality_score?: number;
    overallQuality?: string;
    overall_comments?: string;
    completeness?: string;
    format_consistency?: string;
  };
  verification_recommendations?: string[];
  potential_fraud_indicators?: string[];
  overall_summary?: string;
  
  // Patient registration specific fields (camelCase)
  riskAssessment?: {
    insuranceEligibility: string;
    justification: string;
    riskLevel: string;
  };
  dataQualityAnalysis?: {
    completeness: string;
    formatConsistency: string;
    overallQuality: string;
  };
  verificationRecommendations?: string[];
  potentialFraudIndicators?: string[];
}

/**
 * Parse AI analysis from the backend response
 * Handles both claim processing and patient registration formats
 */
export function parseAIAnalysis(aiAnalysis: any): ParsedAIAnalysis | null {
  if (!aiAnalysis || !aiAnalysis.analysis) {
    return null;
  }

  try {
    let jsonString = aiAnalysis.analysis;
    
    // Extract JSON from markdown format if present
    if (jsonString.includes('```json')) {
      const jsonStart = jsonString.indexOf('```json') + 7;
      const jsonEnd = jsonString.indexOf('```', jsonStart);
      if (jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd).trim();
      }
    } else if (jsonString.includes('### JSON Output')) {
      // Handle the case where AI returns markdown table followed by JSON
      const jsonStart = jsonString.indexOf('### JSON Output') + 15;
      const jsonStringAfter = jsonString.substring(jsonStart).trim();
      // Find the first { and last } to extract JSON
      const firstBrace = jsonStringAfter.indexOf('{');
      const lastBrace = jsonStringAfter.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonStringAfter.substring(firstBrace, lastBrace + 1);
      }
    }
    
    const parsed = JSON.parse(jsonString);
    console.log('Parsed AI analysis keys:', Object.keys(parsed));
    return parsed;
  } catch (error) {
    console.error('Error parsing AI analysis:', error);
    return null;
  }
}

/**
 * Parse AI analysis specifically for claims processing
 * Handles multiple formats used by claims
 */
export function parseClaimAnalysis(aiAnalysis: any): ParsedAIAnalysis | null {
  if (!aiAnalysis || !aiAnalysis.analysis) {
    return null;
  }

  try {
    let jsonString = aiAnalysis.analysis;
    
    // Extract JSON from markdown format if present
    if (jsonString.includes('```json')) {
      const jsonStart = jsonString.indexOf('```json') + 7;
      const jsonEnd = jsonString.indexOf('```', jsonStart);
      if (jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd).trim();
      }
    } else if (jsonString.includes('### JSON Output')) {
      // Handle the case where AI returns markdown table followed by JSON
      const jsonStart = jsonString.indexOf('### JSON Output') + 15;
      const jsonStringAfter = jsonString.substring(jsonStart).trim();
      // Find the first { and last } to extract JSON
      const firstBrace = jsonStringAfter.indexOf('{');
      const lastBrace = jsonStringAfter.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonStringAfter.substring(firstBrace, lastBrace + 1);
      }
    } else {
      // If no specific markers, try to find JSON object directly
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
    }
    
    const parsed = JSON.parse(jsonString);
    console.log('Parsed claims AI analysis keys:', Object.keys(parsed));
    return parsed;
  } catch (error) {
    console.error('Error parsing claims AI analysis:', error);
    return null;
  }
}

/**
 * Parse AI analysis specifically for patient registration
 * Handles ```json format used by patient registration
 */
export function parsePatientAnalysis(aiAnalysis: any): ParsedAIAnalysis | null {
  if (!aiAnalysis || !aiAnalysis.analysis) {
    return null;
  }

  try {
    let jsonString = aiAnalysis.analysis;
    
    // Extract JSON from markdown format if present
    if (jsonString.includes('```json')) {
      const jsonStart = jsonString.indexOf('```json') + 7;
      const jsonEnd = jsonString.indexOf('```', jsonStart);
      if (jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd).trim();
      }
    } else if (jsonString.includes('<reasoning>')) {
      // Handle reasoning text followed by JSON
      const reasoningEnd = jsonString.indexOf('</reasoning>');
      if (reasoningEnd !== -1) {
        jsonString = jsonString.substring(reasoningEnd + 11).trim();
      }
      // Find the first { and last } to extract JSON
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
    } else {
      // If no specific markers, try to find JSON object directly
      const firstBrace = jsonString.indexOf('{');
      const lastBrace = jsonString.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
    }
    
    const parsed = JSON.parse(jsonString);
    console.log('Parsed patient AI analysis keys:', Object.keys(parsed));
    return parsed;
  } catch (error) {
    console.error('Error parsing patient AI analysis:', error);
    return null;
  }
}

/**
 * Check if the analysis is for claim processing (has validation, coverageCheck, etc.)
 */
export function isClaimAnalysis(analysis: ParsedAIAnalysis): boolean {
  return !!(analysis.validation || analysis.coverageCheck || analysis.fraudRiskAssessment);
}

/**
 * Check if the analysis is for patient registration (has risk_assessment, data_quality_analysis, etc.)
 */
export function isPatientAnalysis(analysis: ParsedAIAnalysis): boolean {
  // Check for both camelCase and snake_case field names
  const hasPatientFields = !!(
    analysis.risk_assessment || analysis.riskAssessment ||
    analysis.data_quality_analysis || analysis.dataQualityAnalysis ||
    analysis.verification_recommendations || analysis.verificationRecommendations ||
    analysis.potential_fraud_indicators || analysis.potentialFraudIndicators
  );
  console.log('Patient analysis detection:', {
    risk_assessment: !!analysis.risk_assessment,
    riskAssessment: !!analysis.riskAssessment,
    data_quality_analysis: !!analysis.data_quality_analysis,
    dataQualityAnalysis: !!analysis.dataQualityAnalysis,
    verification_recommendations: !!analysis.verification_recommendations,
    verificationRecommendations: !!analysis.verificationRecommendations,
    potential_fraud_indicators: !!analysis.potential_fraud_indicators,
    potentialFraudIndicators: !!analysis.potentialFraudIndicators,
    result: hasPatientFields
  });
  return hasPatientFields;
}
