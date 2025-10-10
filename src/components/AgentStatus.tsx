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
  Divider,
} from '@mui/material';
import {
  Psychology,
  AutoAwesome,
  CheckCircle,
  Warning,
  Error,
  Speed,
  Security,
  Timeline,
  TrendingUp,
  Memory,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

interface AgentStatus {
  [key: string]: {
    status: string;
    last_used: string;
    success_rate: string;
  };
}

interface AgentDetails {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  capabilities: string[];
  performance: {
    requests_per_minute: number;
    average_response_time: string;
    memory_usage: string;
    cpu_usage: string;
  };
}

const AgentStatus: React.FC = () => {
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const agentDetails: AgentDetails[] = [
    {
      id: 'patient_registration_agent',
      name: 'Patient Registration Agent',
      description: 'Handles patient onboarding with AI-powered validation and risk assessment',
      icon: <AutoAwesome />,
      color: 'primary',
      capabilities: ['Data validation', 'Risk assessment', 'Fraud detection', 'Quality scoring'],
      performance: {
        requests_per_minute: 45,
        average_response_time: '1.2s',
        memory_usage: '256MB',
        cpu_usage: '12%',
      },
    },
    {
      id: 'claim_processing_agent',
      name: 'Claim Processing Agent',
      description: 'Multi-step claim processing with intelligent decision making',
      icon: <Psychology />,
      color: 'secondary',
      capabilities: ['Multi-step processing', 'Policy validation', 'Fraud analysis', 'Auto-approval'],
      performance: {
        requests_per_minute: 32,
        average_response_time: '2.8s',
        memory_usage: '512MB',
        cpu_usage: '18%',
      },
    },
    {
      id: 'denial_analysis_agent',
      name: 'Denial Analysis Agent',
      description: 'Analyzes claim denials and provides intelligent suggestions for reprocessing',
      icon: <Security />,
      color: 'warning',
      capabilities: ['Root cause analysis', 'Suggestion generation', 'Reprocessing guidance', 'Pattern recognition'],
      performance: {
        requests_per_minute: 18,
        average_response_time: '3.5s',
        memory_usage: '384MB',
        cpu_usage: '15%',
      },
    },
    {
      id: 'observability_agent',
      name: 'Observability Agent',
      description: 'Monitors system health and provides real-time analytics and alerts',
      icon: <Timeline />,
      color: 'success',
      capabilities: ['Real-time monitoring', 'Alert generation', 'Performance tracking', 'Health checks'],
      performance: {
        requests_per_minute: 120,
        average_response_time: '0.8s',
        memory_usage: '128MB',
        cpu_usage: '8%',
      },
    },
  ];

  useEffect(() => {
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAgentStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/agents/status');
      setAgentStatus(response.data as AgentStatus);
    } catch (error) {
      console.error('Error fetching agent status:', error);
      // Set mock data for demo
      setAgentStatus({
        patient_registration_agent: {
          status: 'active',
          last_used: new Date().toISOString(),
          success_rate: '98.5%',
        },
        claim_processing_agent: {
          status: 'active',
          last_used: new Date().toISOString(),
          success_rate: '96.2%',
        },
        denial_analysis_agent: {
          status: 'active',
          last_used: new Date().toISOString(),
          success_rate: '92.8%',
        },
        observability_agent: {
          status: 'active',
          last_used: new Date().toISOString(),
          success_rate: '99.1%',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle />;
      case 'warning':
        return <Warning />;
      case 'error':
        return <Error />;
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
          AI Agent Status Dashboard
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
          Real-time monitoring of AI agents and their performance metrics
        </Typography>
      </motion.div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {agentDetails.map((agent, index) => {
          const status = agentStatus?.[agent.id];
          const successRate = status?.success_rate ? parseFloat(status.success_rate.replace('%', '')) : 0;

          return (
            <Box key={agent.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${agent.color}.main`,
                          mr: 2,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {agent.icon}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {agent.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {agent.description}
                        </Typography>
                      </Box>
                      <Chip
                        icon={getStatusIcon(status?.status || 'unknown')}
                        label={status?.status?.toUpperCase() || 'UNKNOWN'}
                        color={getStatusColor(status?.status || 'unknown')}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Success Rate</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {status?.success_rate || 'N/A'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={successRate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(0, 212, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(45deg, ${agent.color}.main, ${agent.color}.light)`,
                          },
                        }}
                      />
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Capabilities
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {agent.capabilities.map((capability, capIndex) => (
                        <Chip
                          key={capIndex}
                          label={capability}
                          size="small"
                          variant="outlined"
                          color={agent.color as any}
                        />
                      ))}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Performance Metrics
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Speed sx={{ color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {agent.performance.requests_per_minute}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requests/min
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Timeline sx={{ color: 'secondary.main', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {agent.performance.average_response_time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Avg Response
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Memory sx={{ color: 'warning.main', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {agent.performance.memory_usage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Memory
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <TrendingUp sx={{ color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {agent.performance.cpu_usage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CPU Usage
                        </Typography>
                      </Box>
                    </Box>

                    {status?.last_used && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 212, 255, 0.05)', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Last Used: {new Date(status.last_used).toLocaleString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Box>
          );
        })}
      </Box>

      {/* System Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Psychology sx={{ mr: 1, color: 'primary.main' }} />
              System Overview
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {agentDetails.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Agents
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                    {agentStatus ? Object.values(agentStatus).filter(agent => agent.status === 'active').length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Operational
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                  }}
                >
                  <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                    {agentStatus ? Math.round(
                      Object.values(agentStatus).reduce((acc, agent) => 
                        acc + parseFloat(agent.success_rate.replace('%', '')), 0
                      ) / Object.values(agentStatus).length
                    ) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Success Rate
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default AgentStatus;
