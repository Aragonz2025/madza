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
  // Patient registration specific fields
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
 * Check if the analysis is for claim processing (has validation, coverageCheck, etc.)
 */
export function isClaimAnalysis(analysis: ParsedAIAnalysis): boolean {
  return !!(analysis.validation || analysis.coverageCheck || analysis.fraudRiskAssessment);
}

/**
 * Check if the analysis is for patient registration (has risk_assessment, data_quality_analysis, etc.)
 */
export function isPatientAnalysis(analysis: ParsedAIAnalysis): boolean {
  const hasPatientFields = !!(analysis.risk_assessment || analysis.data_quality_analysis || analysis.verification_recommendations || analysis.potential_fraud_indicators);
  console.log('Patient analysis detection:', {
    risk_assessment: !!analysis.risk_assessment,
    data_quality_analysis: !!analysis.data_quality_analysis,
    verification_recommendations: !!analysis.verification_recommendations,
    potential_fraud_indicators: !!analysis.potential_fraud_indicators,
    result: hasPatientFields
  });
  return hasPatientFields;
}
