import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  ManageAccounts as ManageAccountsIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface LeftNavigationProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
    description: 'Overview & Analytics',
  },
  {
    id: 'patient-registration',
    label: 'Patient Registration',
    icon: <PersonAddIcon />,
    description: 'AI-Powered Registration',
  },
  {
    id: 'patient-management',
    label: 'Patient Management',
    icon: <PeopleIcon />,
    description: 'View & Manage Patients',
  },
  {
    id: 'claim-processing',
    label: 'Claim Processing',
    icon: <AssignmentIcon />,
    description: 'Multi-Step AI Processing',
  },
  {
    id: 'claim-management',
    label: 'Claim Management',
    icon: <ManageAccountsIcon />,
    description: 'Approval & Denial Management',
  },
  {
    id: 'observability',
    label: 'Observability',
    icon: <AnalyticsIcon />,
    description: 'System Metrics & Monitoring',
  },
  {
    id: 'agent-status',
    label: 'Agent Status',
    icon: <PsychologyIcon />,
    description: 'AI Agent Health & Performance',
  },
];

const LeftNavigation: React.FC<LeftNavigationProps> = ({ selectedTab, onTabChange }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '280px',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
        borderRight: '1px solid rgba(0, 212, 255, 0.2)',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <AutoAwesomeIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #00d4ff, #ff6b6b)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MADZA
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            AI-Powered Healthcare Platform
          </Typography>
        </motion.div>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0, 212, 255, 0.1)' }} />

      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => onTabChange(item.id)}
                sx={{
                  borderRadius: '12px',
                  mb: 0.5,
                  background: selectedTab === item.id 
                    ? 'linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(255, 107, 107, 0.15))'
                    : 'transparent',
                  border: selectedTab === item.id 
                    ? '1px solid rgba(0, 212, 255, 0.3)'
                    : '1px solid transparent',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: selectedTab === item.id ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: selectedTab === item.id ? 600 : 500,
                        color: selectedTab === item.id ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        mt: 0.5,
                      }}
                    >
                      {item.description}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          </motion.div>
        ))}
      </List>

      <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 107, 0.1))',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: '12px',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              System Status
            </Typography>
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              All Systems Operational
            </Typography>
          </Paper>
        </motion.div>
      </Box>
    </Paper>
  );
};

export default LeftNavigation;
