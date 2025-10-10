import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ManageAccounts,
  CheckCircle,
  Cancel,
  Psychology,
  AutoAwesome,
  Visibility,
  Warning,
  Security,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { parseClaimAnalysis, isClaimAnalysis } from '../utils/aiAnalysisParser';

interface Claim {
  id: string;
  patient_id: string;
  claim_amount: number;
  claim_type: string;
  description: string;
  status: string;
  created_at: string;
  approval_required: boolean;
  ai_analysis?: any;
  ai_suggestions?: any;
}

interface AISuggestionsResponse {
  success: boolean;
  suggestions?: {
    root_cause: string;
    suggestions: string[];
    priority: string;
    estimated_impact: string;
  };
  error?: string;
}

interface ClaimUpdateResponse {
  success: boolean;
  message?: string;
  claim?: Claim;
  error?: string;
}

const ClaimManagement: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'deny' | 'view' | 'edit' | null>(null);
  const [denialReason, setDenialReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    root_cause: string;
    suggestions: string[];
    priority: string;
    estimated_impact: string;
  } | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [editFormData, setEditFormData] = useState({
    claim_amount: '',
    claim_type: '',
    description: ''
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await axios.get<Claim[]>('http://localhost:5001/api/claims');
      setClaims(response.data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      // Fallback to mock data if API fails
      const mockClaims: Claim[] = [
        {
          id: '1',
          patient_id: 'patient-123',
          claim_amount: 1500.00,
          claim_type: 'major_medical',
          description: 'Emergency room visit for chest pain',
          status: 'pending_approval',
          created_at: '2024-01-15T10:30:00Z',
          approval_required: true,
          ai_analysis: {
            fraud_risk: 'low',
            coverage_check: 'valid',
            completeness: 'complete'
          }
        },
        {
          id: '2',
          patient_id: 'patient-456',
          claim_amount: 250.00,
          claim_type: 'prescription',
          description: 'Prescription medication refill',
          status: 'approved',
          created_at: '2024-01-14T14:20:00Z',
          approval_required: false,
          ai_analysis: {
            fraud_risk: 'low',
            coverage_check: 'valid',
            completeness: 'complete'
          }
        },
        {
          id: '3',
          patient_id: 'patient-789',
          claim_amount: 5000.00,
          claim_type: 'dental',
          description: 'Root canal procedure',
          status: 'denied',
          created_at: '2024-01-13T09:15:00Z',
          approval_required: false,
          ai_analysis: {
            fraud_risk: 'medium',
            coverage_check: 'invalid',
            completeness: 'incomplete'
          },
          ai_suggestions: {
            root_cause: 'Procedure not covered under current plan',
            suggestions: ['Upgrade to premium dental plan', 'Submit pre-authorization', 'Consider alternative treatment']
          }
        }
      ];
      setClaims(mockClaims);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (claim: Claim, action: 'approve' | 'deny' | 'view' | 'edit') => {
    setSelectedClaim(claim);
    setActionType(action);
    setDialogOpen(true);
    if (action === 'edit') {
      setEditFormData({
        claim_amount: claim.claim_amount.toString(),
        claim_type: claim.claim_type,
        description: claim.description
      });
    }
  };

  const generateAISuggestions = async () => {
    if (!selectedClaim) return;
    
    setLoadingSuggestions(true);
    try {
      const response = await axios.post<AISuggestionsResponse>(`http://localhost:5001/api/claims/${selectedClaim.id}/suggestions`);
      if (response.data.success && response.data.suggestions) {
        setAiSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUpdateClaim = async () => {
    if (!selectedClaim) return;
    
    setProcessing(true);
    try {
      const response = await axios.put<ClaimUpdateResponse>(`http://localhost:5001/api/claims/${selectedClaim.id}`, editFormData);
      if (response.data.success) {
        // Update the claims list
        await fetchClaims();
        setDialogOpen(false);
        setActionType(null);
        setEditFormData({ claim_amount: '', claim_type: '', description: '' });
      }
    } catch (error) {
      console.error('Error updating claim:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;
    
    setProcessing(true);
    try {
      await axios.post(`http://localhost:5001/api/claims/${selectedClaim.id}/approve`);
      // Refresh claims from API
      await fetchClaims();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error approving claim:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedClaim || !denialReason) return;
    
    setProcessing(true);
    try {
      await axios.post(`http://localhost:5001/api/claims/${selectedClaim.id}/deny`, {
        reason: denialReason
      });
      // Refresh claims from API
      await fetchClaims();
      setDialogOpen(false);
      setDenialReason('');
    } catch (error) {
      console.error('Error denying claim:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'pending_approval':
        return <Warning />;
      case 'denied':
        return <Cancel />;
      default:
        return <AutoAwesome />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h1" sx={{ mb: 4, textAlign: 'center' }}>
          AI-Powered Claim Management
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
          Manage claim approvals, denials, and AI-driven insights for optimal decision making
        </Typography>
      </motion.div>

      <Box>
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ManageAccounts sx={{ mr: 1, color: 'primary.main' }} />
                    Claims Overview
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchClaims}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </Box>

                {claims.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ManageAccounts sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No claims found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create a new claim in the Claim Processing section to get started
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Claim ID</TableCell>
                          <TableCell>Patient ID</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {claims.map((claim) => (
                          <TableRow key={claim.id}>
                            <TableCell>{claim.id}</TableCell>
                            <TableCell>{claim.patient_id}</TableCell>
                            <TableCell>${claim.claim_amount.toFixed(2)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={claim.claim_type.replace('_', ' ').toUpperCase()} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(claim.status)}
                                label={claim.status.replace('_', ' ').toUpperCase()}
                                color={getStatusColor(claim.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(claim.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<Visibility />}
                                  onClick={() => handleAction(claim, 'view')}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  color="primary"
                                  startIcon={<AutoAwesome />}
                                  onClick={() => handleAction(claim, 'edit')}
                                >
                                  Edit
                                </Button>
                                {claim.status === 'pending_approval' && (
                                  <>
                                    <Button
                                      size="small"
                                      color="success"
                                      startIcon={<CheckCircle />}
                                      onClick={() => handleAction(claim, 'approve')}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      startIcon={<Cancel />}
                                      onClick={() => handleAction(claim, 'deny')}
                                    >
                                      Deny
                                    </Button>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Claim Details'}
          {actionType === 'approve' && 'Approve Claim'}
          {actionType === 'deny' && 'Deny Claim'}
        </DialogTitle>
        <DialogContent>
          {selectedClaim && (
            <Box>
              {actionType === 'view' && (
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Claim ID</Typography>
                      <Typography variant="body1">{selectedClaim.id}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                      <Typography variant="body1">${selectedClaim.claim_amount.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Typography variant="body1">{selectedClaim.claim_type}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip
                        icon={getStatusIcon(selectedClaim.status)}
                        label={selectedClaim.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(selectedClaim.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>{selectedClaim.description}</Typography>

                    {selectedClaim?.ai_analysis && selectedClaim?.ai_analysis?.analysis && (
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
                        AI Analysis
                      </Typography>
                      
                      {(() => {
                        const analysis = parseClaimAnalysis(selectedClaim.ai_analysis);
                        
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
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        Required Documents:
                                      </Typography>
                                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                        {analysis.approvalRequirements.requiredDocuments.map((doc: string, index: number) => (
                                          <li key={index}>
                                            <Typography variant="caption" color="text.secondary">
                                              {doc}
                                            </Typography>
                                          </li>
                                        ))}
                                      </ul>
                                    </Box>
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
                                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                    {analysis.nextSteps.map((step: string, index: number) => (
                                      <li key={index}>
                                        <Typography variant="body2" color="text.secondary">
                                          {step}
                                        </Typography>
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}
                            </Box>
                          );
                      })()}
                    </Paper>
                  )}

                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                      border: '1px solid rgba(0, 212, 255, 0.2)',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Security sx={{ mr: 1 }} />
                        AI Suggestions
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AutoAwesome />}
                        onClick={generateAISuggestions}
                        disabled={loadingSuggestions}
                      >
                        {loadingSuggestions ? 'Generating...' : 'Generate Suggestions'}
                      </Button>
                    </Box>
                    
                    {aiSuggestions ? (
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Root Cause:
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {aiSuggestions.root_cause}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Priority: 
                            <Chip 
                              label={aiSuggestions.priority || 'medium'} 
                              size="small" 
                              color={aiSuggestions.priority === 'high' ? 'error' : aiSuggestions.priority === 'medium' ? 'warning' : 'success'}
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                            Suggestions:
                          </Typography>
                          <List dense>
                            {aiSuggestions.suggestions?.map((suggestion: string, index: number) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <AutoAwesome color="primary" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={suggestion}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                        
                        {aiSuggestions.estimated_impact && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              Estimated Impact:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {aiSuggestions.estimated_impact}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : selectedClaim.ai_suggestions && selectedClaim.ai_suggestions.root_cause ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Root Cause: {selectedClaim.ai_suggestions.root_cause}
                        </Typography>
                        <List dense>
                          {selectedClaim.ai_suggestions.suggestions?.map((suggestion: string, index: number) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemIcon>
                                <AutoAwesome color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={suggestion}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                          Click "Generate Suggestions" to get AI-powered recommendations
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          AI will analyze your claim and provide specific, actionable suggestions for improvement.
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}

              {actionType === 'edit' && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <AutoAwesome sx={{ mr: 1 }} />
                    Edit Claim
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Claim Amount"
                      type="number"
                      value={editFormData.claim_amount}
                      onChange={(e) => setEditFormData({...editFormData, claim_amount: e.target.value})}
                      fullWidth
                      variant="outlined"
                    />
                    
                    <TextField
                      label="Claim Type"
                      value={editFormData.claim_type}
                      onChange={(e) => setEditFormData({...editFormData, claim_type: e.target.value})}
                      fullWidth
                      variant="outlined"
                    />
                    
                    <TextField
                      label="Description"
                      multiline
                      rows={4}
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleUpdateClaim}
                      disabled={processing}
                      startIcon={processing ? <CircularProgress size={20} /> : <AutoAwesome />}
                    >
                      {processing ? 'Updating...' : 'Update Claim'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              )}

              {actionType === 'approve' && (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Are you sure you want to approve this claim? This action cannot be undone.
                  </Alert>
                  <Typography variant="body1">
                    Claim {selectedClaim.id} for ${selectedClaim.claim_amount.toFixed(2)} will be approved.
                  </Typography>
                </Box>
              )}

              {actionType === 'deny' && (
                <Box>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Please provide a reason for denying this claim. AI suggestions will be generated based on your input.
                  </Alert>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Denial Reason"
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          {actionType === 'approve' && (
            <Button
              onClick={handleApprove}
              variant="contained"
              color="success"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {processing ? 'Approving...' : 'Approve'}
            </Button>
          )}
          {actionType === 'deny' && (
            <Button
              onClick={handleDeny}
              variant="contained"
              color="error"
              disabled={processing || !denialReason}
              startIcon={processing ? <CircularProgress size={20} /> : <Cancel />}
            >
              {processing ? 'Denying...' : 'Deny'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimManagement;
