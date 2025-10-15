import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0 }}
    >
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '280px',
          right: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(10, 10, 10, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 212, 255, 0.1)',
          zIndex: 1000,
          py: 2,
          px: 3,
        }}
      >
        <Divider sx={{ borderColor: 'rgba(0, 212, 255, 0.1)', mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            © 2025 Arpan Chowdhury. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              Madza AI Healthcare Platform
            </Typography>
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #00d4ff, #ff6b6b)',
                  animation: 'pulse 2s infinite',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'success.main',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                System Online
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Footer;
