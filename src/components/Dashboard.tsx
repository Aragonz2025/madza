import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assignment,
  CheckCircle,
  Schedule,
  Cancel,
  AutoAwesome,
  Psychology,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';

interface DashboardMetrics {
  totalPatients: number;
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  deniedClaims: number;
  averageProcessingTime: string;
  aiAccuracyRate: string;
  systemUptime: string;
}

interface RecentActivity {
  id: string;
  type: 'patient' | 'claim' | 'approval' | 'denial';
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [metricsResponse, activityResponse] = await Promise.all([
        axios.get('http://localhost:5001/api/observability/metrics'),
        axios.get('http://localhost:5001/api/activity/recent'),
      ]);

      setMetrics(metricsResponse.data as DashboardMetrics);
      setRecentActivity(activityResponse.data as RecentActivity[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error instead of mock data
      setMetrics({
        totalPatients: 0,
        totalClaims: 0,
        approvedClaims: 0,
        pendingClaims: 0,
        deniedClaims: 0,
        averageProcessingTime: 'N/A',
        aiAccuracyRate: 'N/A',
        systemUptime: 'N/A',
      });
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'patient':
        return <People />;
      case 'claim':
        return <Assignment />;
      case 'approval':
        return <CheckCircle />;
      case 'denial':
        return <Cancel />;
      default:
        return <AutoAwesome />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
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
        <LinearProgress sx={{ width: '50%' }} />
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
          AI Healthcare Dashboard
        </Typography>
      </motion.div>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {/* Key Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h6">Total Patients</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {metrics?.totalPatients || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +12% from last month
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Typography variant="h6">Total Claims</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                {metrics?.totalClaims || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +8% from last month
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h6">Approved Claims</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 700 }}>
                {metrics?.approvedClaims || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics?.approvedClaims && metrics?.totalClaims 
                  ? `${Math.round((metrics.approvedClaims / metrics.totalClaims) * 100)}% approval rate`
                  : '0% approval rate'
                }
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <Schedule />
                </Avatar>
                <Typography variant="h6">Pending Claims</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'warning.main', fontWeight: 700 }}>
                {metrics?.pendingClaims || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. processing: {metrics?.averageProcessingTime || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Performance Metrics */}
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
                  AI Performance Metrics
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Accuracy Rate</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metrics?.aiAccuracyRate || 'N/A'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={94.2}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(0, 212, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #00d4ff, #ff6b6b)',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">System Uptime</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {metrics?.systemUptime || 'N/A'}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={99.8}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(0, 212, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(45deg, #00d4ff, #ff6b6b)',
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label="AWS Bedrock Active"
                    color="primary"
                    size="small"
                    icon={<AutoAwesome />}
                  />
                  <Chip
                    label="Multi-Agent System"
                    color="secondary"
                    size="small"
                  />
                  <Chip
                    label="Real-time Processing"
                    color="success"
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>

        {/* Recent Activity */}
        <Box>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                  Recent Activity
                </Typography>
                
                <List>
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    >
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: getStatusColor(activity.status) + '.main',
                              width: 32,
                              height: 32,
                            }}
                          >
                            {getActivityIcon(activity.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={activity.timestamp}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            color: 'text.secondary',
                          }}
                        />
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
