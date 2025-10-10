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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  People,
  Psychology,
  AutoAwesome,
  Visibility,
  ExpandMore,
  CheckCircle,
  Warning,
  Security,
  Refresh,
  Person,
  Email,
  Phone,
  Cake,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { parsePatientAnalysis, isPatientAnalysis } from '../utils/aiAnalysisParser';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  created_at: string;
  ai_analysis?: any;
}

const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Patient[]>('http://localhost:5001/api/patients');
      setPatients(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPatient(null);
  };

  const getRiskLevelColor = (riskLevel: string | undefined) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEligibilityColor = (eligibility: string | undefined) => {
    switch (eligibility?.toLowerCase()) {
      case 'eligible':
        return 'success';
      case 'pending':
        return 'warning';
      case 'not eligible':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <People sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Patient Management
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              View and manage registered patients with AI analysis
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchPatients}
              sx={{ mr: 2 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {patients.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Patients Found
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No patients have been registered yet.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date of Birth</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>AI Analysis</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Registered</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => {
                  const analysis = parsePatientAnalysis(patient.ai_analysis);
                  const isPatient = analysis ? isPatientAnalysis(analysis) : false;
                  
                  return (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {patient.first_name} {patient.last_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              ID: {patient.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{patient.email}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{patient.phone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Cake sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{patient.date_of_birth}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {analysis && isPatient ? (
                          <Box>
                            <Chip
                              label={analysis.risk_assessment?.risk_level || analysis.riskAssessment?.riskLevel || 'Unknown'}
                              color={getRiskLevelColor(analysis.risk_assessment?.risk_level || analysis.riskAssessment?.riskLevel)}
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                            <br />
                            <Chip
                              label={analysis.risk_assessment?.insurance_eligibility || analysis.riskAssessment?.insuranceEligibility || 'Unknown'}
                              color={getEligibilityColor(analysis.risk_assessment?.insurance_eligibility || analysis.riskAssessment?.insuranceEligibility)}
                              size="small"
                            />
                          </Box>
                        ) : (
                          <Chip label="No Analysis" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(patient.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handleViewPatient(patient)}
                          size="small"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Patient Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1, color: 'primary.main' }} />
            Patient Details
          </DialogTitle>
          <DialogContent>
            {selectedPatient && (
              <Box>
                {/* Basic Information */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1 }} />
                      Basic Information
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Full Name
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {selectedPatient.first_name} {selectedPatient.last_name}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Email
                        </Typography>
                        <Typography variant="body1">{selectedPatient.email}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Phone
                        </Typography>
                        <Typography variant="body1">{selectedPatient.phone}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Date of Birth
                        </Typography>
                        <Typography variant="body1">{selectedPatient.date_of_birth}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Psychology sx={{ mr: 1 }} />
                      AI Analysis
                    </Typography>
                    
                    {(() => {
                      const analysis = parsePatientAnalysis(selectedPatient.ai_analysis);
                      const isPatient = analysis ? isPatientAnalysis(analysis) : false;
                      
                      if (!analysis || !isPatient) {
                        return (
                          <Alert severity="warning">
                            Unable to parse AI analysis data
                          </Alert>
                        );
                      }

                      return (
                        <Box>
                          {/* Risk Assessment */}
                          <Accordion sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Security sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6">Risk Assessment</Typography>
                                <Box sx={{ ml: 'auto', mr: 2 }}>
                                  <Chip
                                    label={analysis.risk_assessment?.risk_level || analysis.riskAssessment?.riskLevel || 'Unknown'}
                                    color={getRiskLevelColor(analysis.risk_assessment?.risk_level || analysis.riskAssessment?.riskLevel)}
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Insurance Eligibility
                                  </Typography>
                                  <Chip
                                    label={analysis.risk_assessment?.insurance_eligibility || analysis.riskAssessment?.insuranceEligibility || 'Unknown'}
                                    color={getEligibilityColor(analysis.risk_assessment?.insurance_eligibility || analysis.riskAssessment?.insuranceEligibility)}
                                  />
                                </Box>
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Justification
                                  </Typography>
                                  <Typography variant="body1">
                                    {analysis.risk_assessment?.justification || analysis.riskAssessment?.justification || 'No justification provided'}
                                  </Typography>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>

                          {/* Data Quality Analysis */}
                          <Accordion sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                                <Typography variant="h6">Data Quality Analysis</Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Completeness
                                  </Typography>
                                  <Chip
                                    label={analysis.data_quality_analysis?.completeness || analysis.dataQualityAnalysis?.completeness || 'Unknown'}
                                    color="info"
                                    size="small"
                                  />
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Format Consistency
                                  </Typography>
                                  <Chip
                                    label={analysis.data_quality_analysis?.format_consistency || analysis.dataQualityAnalysis?.formatConsistency || 'Unknown'}
                                    color="info"
                                    size="small"
                                  />
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Overall Quality
                                  </Typography>
                                  <Chip
                                    label={analysis.data_quality_analysis?.overall_quality || analysis.dataQualityAnalysis?.overallQuality || 'Unknown'}
                                    color="info"
                                    size="small"
                                  />
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>

                          {/* Verification Recommendations */}
                          <Accordion sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <AutoAwesome sx={{ mr: 1, color: 'warning.main' }} />
                                <Typography variant="h6">Verification Recommendations</Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List>
                                {(analysis.verification_recommendations || analysis.verificationRecommendations)?.map((recommendation: string, index: number) => (
                                  <ListItem key={index}>
                                    <ListItemIcon>
                                      <CheckCircle sx={{ color: 'success.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={recommendation} />
                                  </ListItem>
                                )) || (
                                  <ListItem>
                                    <ListItemText primary="No recommendations available" />
                                  </ListItem>
                                )}
                              </List>
                            </AccordionDetails>
                          </Accordion>

                          {/* Potential Fraud Indicators */}
                          <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Warning sx={{ mr: 1, color: 'error.main' }} />
                                <Typography variant="h6">Potential Fraud Indicators</Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List>
                                {(analysis.potential_fraud_indicators || analysis.potentialFraudIndicators)?.map((indicator: string, index: number) => (
                                  <ListItem key={index}>
                                    <ListItemIcon>
                                      <Warning sx={{ color: 'error.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={indicator} />
                                  </ListItem>
                                )) || (
                                  <ListItem>
                                    <ListItemText primary="No fraud indicators identified" />
                                  </ListItem>
                                )}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Box>
  );
};

export default PatientManagement;
