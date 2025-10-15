import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Analytics as AnalysisIcon,
  RestartAlt as RefileIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../utils/apiConfig';
import API_BASE_URL from '../utils/apiConfig';

interface EOB {
  id: string;
  claim_id: string;
  patient_name: string;
  claim_amount: number;
  eob_amount: number;
  status: 'approved' | 'denied' | 'partial' | 'pending';
  eob_date: string;
  insurance_company: string;
  pdf_url?: string;
  ai_analysis?: any;
  denial_reasons?: string[];
  refile_required: boolean;
  created_at: string;
}

const EOBManagement: React.FC = () => {
  const [eobs, setEobs] = useState<EOB[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEob, setSelectedEob] = useState<EOB | null>(null);
  const [analysisDialog, setAnalysisDialog] = useState(false);
  const [refileDialog, setRefileDialog] = useState(false);
  const [refileReason, setRefileReason] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [refiling, setRefiling] = useState(false);
  const [pdfDialog, setPdfDialog] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');

  useEffect(() => {
    fetchEOBs();
  }, []); // Run only once on mount


  const fetchEOBs = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.EOBS);
      if (response.ok) {
        const data = await response.json();
        setEobs(data.eobs || []);
      }
    } catch (error) {
      console.error('Error fetching EOBs:', error);
    } finally {
      setLoading(false);
    }
  };


  const analyzeEOB = async (eobId: string) => {
    setAnalyzing(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.EOBS}/${eobId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedEob({ ...selectedEob!, ai_analysis: data.analysis });
        setAnalysisDialog(true);
      }
    } catch (error) {
      console.error('Error analyzing EOB:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const refileClaim = async (eobId: string) => {
    setRefiling(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.EOBS}/${eobId}/refile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: refileReason })
      });
      
      if (response.ok) {
        setRefileDialog(false);
        setRefileReason('');
        await fetchEOBs();
      }
    } catch (error) {
      console.error('Error refiling claim:', error);
    } finally {
      setRefiling(false);
    }
  };

  const handleViewPdf = (eob: EOB) => {
    if (eob.pdf_url) {
      setSelectedPdfUrl(eob.pdf_url);
      setPdfDialog(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'denied': return 'error';
      case 'partial': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircleIcon />;
      case 'denied': return <CancelIcon />;
      case 'partial': return <WarningIcon />;
      case 'pending': return <ScheduleIcon />;
      default: return <DescriptionIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ 
          background: 'linear-gradient(45deg, #00d4ff, #ff6b6b)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Insurance EOB Management
        </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchEOBs}
              disabled={loading}
            >
              Refresh
            </Button>
      </Box>


      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* EOB List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Explanation of Benefits
            </Typography>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Claim Amount</TableCell>
                    <TableCell>EOB Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Insurance</TableCell>
                    <TableCell>EOB Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eobs.map((eob) => (
                    <TableRow key={eob.id}>
                      <TableCell>{eob.patient_name}</TableCell>
                      <TableCell>${eob.claim_amount.toFixed(2)}</TableCell>
                      <TableCell>${eob.eob_amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(eob.status)}
                          label={eob.status.toUpperCase()}
                          color={getStatusColor(eob.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{eob.insurance_company}</TableCell>
                      <TableCell>{new Date(eob.eob_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => analyzeEOB(eob.id)}
                          disabled={analyzing}
                        >
                          <AnalysisIcon />
                        </IconButton>
                        {eob.pdf_url && (
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewPdf(eob)}
                            title="View PDF"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        )}
                        {eob.status === 'denied' && (
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedEob(eob);
                              setRefileDialog(true);
                            }}
                          >
                            <RefileIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

      </Box>

      {/* AI Analysis Dialog */}
      <Dialog open={analysisDialog} onClose={() => setAnalysisDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>EOB AI Analysis</DialogTitle>
        <DialogContent>
          {selectedEob?.ai_analysis ? (
            <Box>
              <Typography variant="h6" gutterBottom>Analysis Results</Typography>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Summary</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{selectedEob.ai_analysis.summary}</Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Denial Reasons</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {selectedEob.ai_analysis.denial_reasons?.map((reason: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                        <ListItemText primary={reason} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Recommendations</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {selectedEob.ai_analysis.recommendations?.map((rec: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Analyzing EOB...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Refile Dialog */}
      <Dialog open={refileDialog} onClose={() => setRefileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refile Claim</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will create a new claim based on the EOB analysis and denial reasons.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Refile Reason"
            value={refileReason}
            onChange={(e) => setRefileReason(e.target.value)}
            placeholder="Explain why this claim should be refiled..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefileDialog(false)}>Cancel</Button>
          <Button
            onClick={() => selectedEob && refileClaim(selectedEob.id)}
            variant="contained"
            disabled={refiling || !refileReason.trim()}
            startIcon={refiling ? <CircularProgress size={20} /> : <RefileIcon />}
          >
            {refiling ? 'Refiling...' : 'Refile Claim'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={pdfDialog}
        onClose={() => setPdfDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            bgcolor: '#1a1a1a'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.dark',
          color: 'white'
        }}>
          <Typography variant="h6">EOB PDF Viewer</Typography>
          <IconButton 
            onClick={() => setPdfDialog(false)} 
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#1a1a1a' }}>
          {selectedPdfUrl && (
            <iframe
              src={`${API_BASE_URL}${selectedPdfUrl}`}
              width="100%"
              height="100%"
              style={{ 
                border: 'none',
                minHeight: '70vh'
              }}
              title="EOB PDF"
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EOBManagement;
