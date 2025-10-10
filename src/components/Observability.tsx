import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Analytics,
  TrendingUp,
  Speed,
  Security,
  Psychology,
  CheckCircle,
  Warning,
  Error,
  Timeline,
  AutoAwesome,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Metrics {
  total_patients: number;
  total_claims: number;
  approved_claims: number;
  pending_claims: number;
  denied_claims: number;
  average_processing_time: string;
  ai_accuracy_rate: string;
  system_uptime: string;
  last_updated: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  resolved: boolean;
}

const Observability: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchObservabilityData();
    const interval = setInterval(fetchObservabilityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchObservabilityData = async () => {
    try {
      const [metricsResponse, alertsResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/observability/metrics'),
        // Mock alerts data
        Promise.resolve({
          data: [
            {
              id: '1',
              type: 'info',
              message: 'AI accuracy rate improved to 94.2%',
              timestamp: '2024-01-15T10:30:00Z',
              resolved: true,
            },
            {
              id: '2',
              type: 'warning',
              message: 'High volume of pending claims detected',
              timestamp: '2024-01-15T09:15:00Z',
              resolved: false,
            },
            {
              id: '3',
              type: 'error',
              message: 'Bedrock service temporarily unavailable',
              timestamp: '2024-01-15T08:45:00Z',
              resolved: true,
            },
          ],
        }),
      ]);

      setMetrics(metricsResponse.data as Metrics);
      setAlerts(alertsResponse.data as SystemAlert[]);
    } catch (error) {
      console.error('Error fetching observability data:', error);
      // Set mock data for demo
      setMetrics({
        total_patients: 150,
        total_claims: 89,
        approved_claims: 67,
        pending_claims: 15,
        denied_claims: 7,
        average_processing_time: '2.3 days',
        ai_accuracy_rate: '94.2%',
        system_uptime: '99.8%',
        last_updated: new Date().toISOString(),
      });
      setAlerts([
        {
          id: '1',
          type: 'info',
          message: 'AI accuracy rate improved to 94.2%',
          timestamp: '2024-01-15T10:30:00Z',
          resolved: true,
        },
        {
          id: '2',
          type: 'warning',
          message: 'High volume of pending claims detected',
          timestamp: '2024-01-15T09:15:00Z',
          resolved: false,
        },
        {
          id: '3',
          type: 'error',
          message: 'Bedrock service temporarily unavailable',
          timestamp: '2024-01-15T08:45:00Z',
          resolved: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <CheckCircle />;
      case 'warning':
        return <Warning />;
      case 'error':
        return <Error />;
      default:
        return <AutoAwesome />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
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
          System Observability
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
          Real-time monitoring and analytics for AI-powered healthcare platform
        </Typography>
      </motion.div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {/* Key Performance Indicators */}
        <Box>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Analytics sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Total Patients</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {metrics?.total_patients || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +12% from last month
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        <Box>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6">Total Claims</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  {metrics?.total_claims || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +8% from last month
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        <Box>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Speed sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">AI Accuracy</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 700 }}>
                  {metrics?.ai_accuracy_rate || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Machine learning performance
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        <Box>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6">System Uptime</Typography>
                </Box>
                <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 700 }}>
                  {metrics?.system_uptime || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last 30 days
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Processing Metrics */}
        <Box>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Psychology sx={{ mr: 1, color: 'primary.main' }} />
                  Processing Metrics
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Approved Claims</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metrics?.approved_claims || 0} / {metrics?.total_claims || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics?.total_claims ? (metrics.approved_claims / metrics.total_claims) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(0, 212, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #00d4ff, #4caf50)',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Pending Claims</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metrics?.pending_claims || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics?.total_claims ? (metrics.pending_claims / metrics.total_claims) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255, 193, 7, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #ffc107, #ff9800)',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Denied Claims</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metrics?.denied_claims || 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics?.total_claims ? (metrics.denied_claims / metrics.total_claims) * 100 : 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #f44336, #e91e63)',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={`Avg. Processing: ${metrics?.average_processing_time || 'N/A'}`}
                    color="primary"
                    size="small"
                    icon={<Timeline />}
                  />
                  <Chip
                    label="Real-time Updates"
                    color="success"
                    size="small"
                    icon={<AutoAwesome />}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* System Alerts */}
        <Box>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                  System Alerts
                </Typography>

                <List>
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    >
                      <ListItem
                        sx={{
                          mb: 1,
                          p: 2,
                          borderRadius: 2,
                          background: alert.resolved 
                            ? 'rgba(76, 175, 80, 0.1)' 
                            : 'rgba(255, 193, 7, 0.1)',
                          border: `1px solid ${alert.resolved ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
                        }}
                      >
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: getAlertColor(alert.type) + '.main',
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getAlertIcon(alert.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.message}
                          secondary={new Date(alert.timestamp).toLocaleString()}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            color: 'text.secondary',
                          }}
                        />
                        <Chip
                          label={alert.resolved ? 'Resolved' : 'Active'}
                          color={alert.resolved ? 'success' : 'warning'}
                          size="small"
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>

                {alerts.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      All systems operational
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No active alerts at this time
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Last Updated */}
        <Box>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Alert severity="info" sx={{ mt: 2 }}>
              Last updated: {metrics?.last_updated ? new Date(metrics.last_updated).toLocaleString() : 'Never'}
            </Alert>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default Observability;
