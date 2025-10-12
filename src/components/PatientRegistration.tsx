import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  PersonAdd,
  AutoAwesome,
  CheckCircle,
  Warning,
  Psychology,
  Security,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';
import { parsePatientAnalysis, isPatientAnalysis } from '../utils/aiAnalysisParser';

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}


const PatientRegistration: React.FC = () => {
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PatientFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(API_ENDPOINTS.PATIENT_REGISTER, formData);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h1" sx={{ mb: 4, textAlign: 'center' }}>
          AI-Powered Patient Registration
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
          Leverage advanced AI agents to streamline patient registration with intelligent validation and risk assessment
        </Typography>
      </motion.div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        <Box>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
                  Patient Information
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required
                      variant="outlined"
                      sx={{ mb: 2, gridColumn: '1 / -1' }}
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange('dateOfBirth')}
                      required
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <>
                        <AutoAwesome sx={{ mr: 1 }} />
                        Register with AI Analysis
                      </>
                    )}
                  </Button>
                </form>

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        <Box>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                  AI Analysis Results
                </Typography>

                {result ? (
                  <Box>
                    <Alert severity="success" sx={{ mb: 3 }}>
                      Patient registered successfully! Patient ID: {result.patient_id}
                    </Alert>

                    {result?.ai_analysis && result?.ai_analysis?.analysis ? (
                      <Box>
                        {(() => {
                          const analysis = parsePatientAnalysis(result.ai_analysis);
                          
                          if (!analysis) {
                            return (
                              <Typography variant="body2" color="error">
                                Unable to parse AI analysis data
                              </Typography>
                            );
                          }
                          
                          if (!isPatientAnalysis(analysis)) {
                            return (
                              <Typography variant="body2" color="warning">
                                AI analysis format not recognized for patient registration
                              </Typography>
                            );
                          }
                          
                          // Extract patient-specific fields - handle both camelCase and snake_case
                          const riskAssessment = (analysis as any).riskAssessment || (analysis as any).risk_assessment;
                          const dataQuality = (analysis as any).dataQualityAnalysis || (analysis as any).data_quality_analysis;
                          const recommendations = (analysis as any).verificationRecommendations || (analysis as any).verification_recommendations;
                          const fraudIndicators = (analysis as any).potentialFraudIndicators || (analysis as any).potential_fraud_indicators;
                            
                            return (
                              <Box>
                                {/* Risk Assessment */}
                                {riskAssessment && (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      mb: 2,
                                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                                      border: '1px solid rgba(0, 212, 255, 0.2)',
                                    }}
                                  >
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                      <Security sx={{ mr: 1 }} />
                                      Risk Assessment
                                    </Typography>
                                    <Chip
                                      label={`${(riskAssessment as any).insuranceEligibility || (riskAssessment as any).insurance_eligibility || 'Unknown'} - ${(riskAssessment as any).riskLevel || (riskAssessment as any).risk_level || 'Low Risk'}`}
                                      color={(riskAssessment as any).insuranceEligibility === 'Eligible' || (riskAssessment as any).insurance_eligibility === 'Eligible' ? 'success' : 
                                             (riskAssessment as any).insuranceEligibility === 'Pending Review' || (riskAssessment as any).insurance_eligibility === 'Pending Review' ? 'warning' : 'error'}
                                      sx={{ mb: 1 }}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      {(riskAssessment as any).justification || (riskAssessment as any).eligibility_rationale || (riskAssessment as any).notes || (riskAssessment as any).comments || 'Risk assessment completed'}
                                    </Typography>
                                  </Paper>
                                )}

                                {/* Data Quality */}
                                {dataQuality && (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      mb: 2,
                                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                                      border: '1px solid rgba(0, 212, 255, 0.2)',
                                    }}
                                  >
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                      <CheckCircle sx={{ mr: 1 }} />
                                      Data Quality Analysis
                                    </Typography>
                                    <Chip
                                      label={`${(dataQuality as any).overallQuality || (dataQuality as any).overall_quality || 'Good Quality'}`}
                                      color={(dataQuality as any).overallQuality === 'High' || (dataQuality as any).overall_quality === 'High' ? 'success' : 
                                             (dataQuality as any).overallQuality === 'Medium' || (dataQuality as any).overall_quality === 'Medium' ? 'warning' : 'error'}
                                      sx={{ mb: 1 }}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Completeness: {(dataQuality as any).completeness || 'Complete'} | 
                                      Format: {(dataQuality as any).formatConsistency || (dataQuality as any).format_consistency || 'Consistent'}
                                    </Typography>
                                    {dataQuality.format_consistency && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                          Format Analysis:
                                        </Typography>
                                        <Box>
                                          {Object.entries(dataQuality.format_consistency).map(([field, status]) => (
                                            <Typography 
                                              key={field} 
                                              variant="caption" 
                                              color="text.secondary" 
                                              sx={{ display: 'block' }}
                                            >
                                              {`${field}: ${status}`}
                                            </Typography>
                                          ))}
                                        </Box>
                                      </Box>
                                    )}
                                  </Paper>
                                )}

                                {/* Verification Recommendations */}
                                {recommendations && (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      mb: 2,
                                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                                      border: '1px solid rgba(0, 212, 255, 0.2)',
                                    }}
                                  >
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                      <CheckCircle sx={{ mr: 1 }} />
                                      Verification Recommendations
                                    </Typography>
                                    <List dense>
                                      {Array.isArray(recommendations) ? (
                                        recommendations.map((rec: string, index: number) => (
                                          <ListItem key={index} sx={{ px: 0 }}>
                                            <ListItemIcon>
                                              <CheckCircle color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={rec}
                                              primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                          </ListItem>
                                        ))
                                      ) : (
                                        Object.entries(recommendations).map(([key, value], index) => (
                                          <ListItem key={index} sx={{ px: 0 }}>
                                            <ListItemIcon>
                                              <CheckCircle color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={typeof value === 'string' ? value : `${key}: ${value}`}
                                              primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                          </ListItem>
                                        ))
                                      )}
                                    </List>
                                  </Paper>
                                )}

                                {/* Fraud Indicators */}
                                {fraudIndicators && Array.isArray(fraudIndicators) && fraudIndicators.length > 0 && (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                                      border: '1px solid rgba(0, 212, 255, 0.2)',
                                    }}
                                  >
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                      <Warning sx={{ mr: 1 }} />
                                      Potential Fraud Indicators
                                    </Typography>
                                    <List dense>
                                      {fraudIndicators.map((indicator: any, index: number) => (
                                        <ListItem key={index} sx={{ px: 0 }}>
                                          <ListItemIcon>
                                            <Warning 
                                              color="warning" 
                                              fontSize="small" 
                                            />
                                          </ListItemIcon>
                                          <ListItemText 
                                            primary={typeof indicator === 'string' ? indicator : (indicator.indicator || indicator)}
                                            secondary={typeof indicator === 'string' ? '' : (indicator.description || '')}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Paper>
                                )}

                                {/* Overall Summary */}
                                {analysis.overall_summary && (
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      mt: 2,
                                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                                      border: '1px solid rgba(0, 212, 255, 0.2)',
                                    }}
                                  >
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                      <Psychology sx={{ mr: 1 }} />
                                      Overall Summary
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {analysis.overall_summary}
                                    </Typography>
                                  </Paper>
                                )}
                              </Box>
                            );
                        })()}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          AI Analysis not available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          No AI analysis data received from the server
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Psychology sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      AI Analysis will appear here
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submit the form to see intelligent insights and recommendations
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientRegistration;
