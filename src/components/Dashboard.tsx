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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/apiConfig';

interface DashboardMetrics {
  total_patients: number;
  total_claims: number;
  approved_claims: number;
  pending_claims: number;
  denied_claims: number;
  average_processing_time: string;
  ai_accuracy_rate: string;
  system_uptime: string;
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
        axios.get(API_ENDPOINTS.METRICS),
        axios.get(API_ENDPOINTS.RECENT_ACTIVITY),
      ]);

      setMetrics(metricsResponse.data as DashboardMetrics);
      setRecentActivity(activityResponse.data as RecentActivity[]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error instead of mock data
      setMetrics({
        total_patients: 0,
        total_claims: 0,
        approved_claims: 0,
        pending_claims: 0,
        denied_claims: 0,
        average_processing_time: 'N/A',
        ai_accuracy_rate: 'N/A',
        system_uptime: 'N/A',
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
        return <Assignment />;
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

      {/* Key Metrics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 3, mb: 4 }}>
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
                {metrics?.total_patients || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics?.total_patients ? 'Active patients' : 'No patients registered'}
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
                {metrics?.total_claims || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics?.total_claims ? 'Total claims processed' : 'No claims yet'}
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
                {metrics?.approved_claims || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics?.approved_claims && metrics?.total_claims 
                  ? `${Math.round((metrics.approved_claims / metrics.total_claims) * 100)}% approval rate`
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
                {metrics?.pending_claims || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg. processing: {metrics?.average_processing_time || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <Cancel />
                </Avatar>
                <Typography variant="h6">Denied Claims</Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'error.main', fontWeight: 700 }}>
                {metrics?.denied_claims || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {metrics?.denied_claims && metrics?.total_claims 
                  ? `${Math.round((metrics.denied_claims / metrics.total_claims) * 100)}% denial rate`
                  : '0% denial rate'
                }
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Recent Activity - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              Recent Activity
            </Typography>
            
            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: getStatusColor(activity.status) + '.main',
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.timestamp}
                      primaryTypographyProps={{
                        variant: 'body1',
                        fontWeight: 500,
                      }}
                      secondaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItem>
                </motion.div>
              ))}
              {recentActivity.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No recent activity"
                    secondary="Activity will appear here as the system is used"
                    sx={{ textAlign: 'center', py: 4 }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Dashboard;
