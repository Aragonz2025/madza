import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Assignment,
  AutoAwesome,
  CheckCircle,
  Warning,
  Psychology,
  Security,
  Timeline,
  Speed,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { parseClaimAnalysis, isClaimAnalysis } from '../utils/aiAnalysisParser';

interface ClaimFormData {
  patient_id: string;
  claim_amount: number;
  claim_type: string;
  description: string;
}

interface ClaimResult {
  success: boolean;
  claim_id: string;
  status: string;
  approval_required: boolean;
  ai_analysis: any;
  next_steps: string[];
}

const ClaimProcessing: React.FC = () => {
  const [formData, setFormData] = useState<ClaimFormData>({
    patient_id: '',
    claim_amount: 0,
    claim_type: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const claimTypes = [
    { value: 'major_medical', label: 'Major Medical' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'dental', label: 'Dental' },
    { value: 'vision', label: 'Vision' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'routine', label: 'Routine Checkup' },
  ];

  const processingSteps = [
    'Claim Validation',
    'Policy Coverage Check',
    'Fraud Risk Assessment',
    'AI Decision Making',
    'Approval Processing',
  ];

  const handleInputChange = (field: keyof ClaimFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'claim_amount' ? parseFloat(event.target.value) || 0 : event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setActiveStep(0);

    // Simulate multi-step processing
    for (let i = 0; i < processingSteps.length; i++) {
      setActiveStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const response = await axios.post('http://localhost:5001/api/claims/process', formData);
      setResult(response.data as ClaimResult);
      setActiveStep(processingSteps.length);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Claim processing failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending_approval':
        return 'warning';
      case 'denied':
        return 'error';
      default:
        return 'default';
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
          Multi-Step AI Claim Processing
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
          Advanced AI agents work together to process claims through intelligent validation and decision-making
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
                  <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                  Claim Information
                </Typography>

                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Patient ID"
                      value={formData.patient_id}
                      onChange={handleInputChange('patient_id')}
                      required
                      variant="outlined"
                      sx={{ mb: 2, gridColumn: '1 / -1' }}
                      helperText="Enter the patient ID from registration"
                    />
                    <TextField
                      fullWidth
                      label="Claim Amount ($)"
                      type="number"
                      value={formData.claim_amount}
                      onChange={handleInputChange('claim_amount')}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                    <TextField
                      fullWidth
                      select
                      label="Claim Type"
                      value={formData.claim_type}
                      onChange={handleInputChange('claim_type')}
                      required
                      variant="outlined"
                      SelectProps={{ native: true }}
                      sx={{ mb: 2 }}
                    >
                      <option value="">Select claim type</option>
                      {claimTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      required
                      variant="outlined"
                      sx={{ mb: 2, gridColumn: '1 / -1' }}
                      helperText="Provide detailed description of the medical service or treatment"
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
                        Process with Multi-Agent AI
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
                  <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                  Processing Pipeline
                </Typography>

                <Stepper activeStep={activeStep} orientation="vertical">
                  {processingSteps.map((step, index) => (
                    <Step key={step}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: index <= activeStep ? 'primary.main' : 'text.secondary',
                              color: 'white',
                            }}
                          >
                            {index < activeStep ? <CheckCircle /> : index + 1}
                          </Box>
                        )}
                      >
                        {step}
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {index === 0 && 'Validating claim completeness and required fields'}
                          {index === 1 && 'Checking against patient policy coverage and limits'}
                          {index === 2 && 'Running fraud detection algorithms and risk assessment'}
                          {index === 3 && 'AI agents making intelligent decisions based on analysis'}
                          {index === 4 && 'Processing approval or flagging for manual review'}
                        </Typography>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>

                {result && (
                  <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Alert 
                      severity={result.status === 'approved' ? 'success' : 'warning'} 
                      sx={{ mb: 2 }}
                    >
                      <Typography variant="h6">
                        Claim {result.status === 'approved' ? 'Approved' : 'Requires Approval'}
                      </Typography>
                      <Typography variant="body2">
                        Claim ID: {result.claim_id}
                      </Typography>
                    </Alert>

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
                        <Psychology sx={{ mr: 1 }} />
                        AI Analysis Summary
                      </Typography>
                      
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={result.status}
                            color={getStatusColor(result.status)}
                            size="small"
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Approval Required
                          </Typography>
                          <Chip
                            label={result.approval_required ? 'Yes' : 'No'}
                            color={result.approval_required ? 'warning' : 'success'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </Paper>

                    {/* Detailed AI Analysis */}
                    {result?.ai_analysis && result?.ai_analysis?.analysis && (
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
                          <Psychology sx={{ mr: 1 }} />
                          Detailed AI Analysis
                        </Typography>
                        
                        {(() => {
                          const analysis = parseClaimAnalysis(result.ai_analysis);
                          
                          if (!analysis) {
                            return (
                              <Typography variant="body2" color="error">
                                Unable to parse AI analysis data
                              </Typography>
                            );
                          }
                          
                          if (!isClaimAnalysis(analysis)) {
                            return (
                              <Typography variant="body2" color="warning">
                                AI analysis format not recognized for claims
                              </Typography>
                            );
                          }
                          return (
                            <Box>
                              {/* Validation Status */}
                              {analysis.validation && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Validation Status
                                  </Typography>
                                  <Chip
                                    label={analysis.validation.status || 'Complete'}
                                    color={analysis.validation.status === 'Complete' ? 'success' : 'warning'}
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    {analysis.validation.notes || 'All required fields are present'}
                                  </Typography>
                                  {analysis.validation.details && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Details:
                                      </Typography>
                                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        {Object.entries(analysis.validation.details).map(([key, value]) => (
                                          <li key={key}>
                                            <Typography variant="caption" color="text.secondary">
                                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {String(value)}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {/* Coverage Check */}
                              {analysis.coverageCheck && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Coverage Analysis
                                  </Typography>
                                  <Chip
                                    label={analysis.coverageCheck.policyCoverage || 'Emergency Room Visit'}
                                    color="success"
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Medical Necessity: {analysis.coverageCheck.medicalNecessity || 'Met'}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {analysis.coverageCheck.coverageDecision || 'Coverage analysis completed'}
                                  </Typography>
                                  {analysis.coverageCheck.procedureCoverage && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Procedure Coverage:
                                      </Typography>
                                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        {Object.entries(analysis.coverageCheck.procedureCoverage).map(([procedure, status]) => (
                                          <li key={procedure}>
                                            <Typography variant="caption" color="text.secondary">
                                              {procedure}: {String(status)}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {/* Fraud Risk Assessment */}
                              {analysis.fraudRiskAssessment && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Fraud Risk Assessment
                                  </Typography>
                                  <Chip
                                    label={analysis.fraudRiskAssessment.riskLevel || 'Low'}
                                    color={analysis.fraudRiskAssessment.riskLevel === 'Low' ? 'success' : analysis.fraudRiskAssessment.riskLevel === 'Medium' ? 'warning' : 'error'}
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {analysis.fraudRiskAssessment.recommendation || 'Fraud risk assessment completed'}
                                  </Typography>
                                  {analysis.fraudRiskAssessment.riskFactorsConsidered && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Risk Factors Considered:
                                      </Typography>
                                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        {analysis.fraudRiskAssessment.riskFactorsConsidered.map((factor: string, index: number) => (
                                          <li key={index}>
                                            <Typography variant="caption" color="text.secondary">
                                              {factor}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {/* Approval Requirements */}
                              {analysis.approvalRequirements && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Approval Requirements
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Pre-authorization: {analysis.approvalRequirements.preAuthorization || 'Not required for emergency services'}
                                  </Typography>
                                  {analysis.approvalRequirements.requiredDocuments && (
                                    <List dense>
                                      {analysis.approvalRequirements.requiredDocuments.map((doc: string, index: number) => (
                                        <ListItem key={index} sx={{ px: 0 }}>
                                          <ListItemIcon>
                                            <CheckCircle color="primary" fontSize="small" />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={doc}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  )}
                                  {analysis.approvalRequirements.additionalSteps && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Additional Steps:
                                      </Typography>
                                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        {analysis.approvalRequirements.additionalSteps.map((step: string, index: number) => (
                                          <li key={index}>
                                            <Typography variant="caption" color="text.secondary">
                                              {step}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {/* Processing Time Estimate */}
                              {analysis.processingTimeEstimate && (
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Processing Time Estimate
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {analysis.processingTimeEstimate.standardTurnaround || '5-7 business days'}
                                  </Typography>
                                  {analysis.processingTimeEstimate.potentialDelays && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Potential Delays:
                                      </Typography>
                                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        {analysis.processingTimeEstimate.potentialDelays.map((delay: string, index: number) => (
                                          <li key={index}>
                                            <Typography variant="caption" color="text.secondary">
                                              {delay}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
                                  )}
                                </Box>
                              )}

                              {/* Next Steps */}
                              {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Next Steps
                                  </Typography>
                                  <List dense>
                                    {analysis.nextSteps.map((step: string, index: number) => (
                                      <ListItem key={index} sx={{ px: 0 }}>
                                        <ListItemIcon>
                                          <CheckCircle color="primary" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                          primary={step}
                                          primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              )}
                            </Box>
                          );
                        })()}
                      </Paper>
                    )}

                    {result.next_steps && result.next_steps.length > 0 && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                          <Speed sx={{ mr: 1 }} />
                          Next Steps
                        </Typography>
                        <List dense>
                          {result.next_steps.map((step: string, index: number) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemIcon>
                                <CheckCircle color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={step}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    )}
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

export default ClaimProcessing;
