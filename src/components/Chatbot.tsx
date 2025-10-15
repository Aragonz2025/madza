import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  CircularProgress,
  Divider,
  Collapse,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { API_ENDPOINTS } from '../utils/apiConfig';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action';
  suggestions?: string[];
  actionData?: any;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Debug log
  console.log('Chatbot component rendered');
  
  // Add pulse animation styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(0, 212, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI healthcare assistant. I can help you with patient registration, claim processing, and answer questions about our healthcare platform. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "How do I register a new patient?",
        "What information is needed for claim processing?",
        "How does the AI analysis work?",
        "What are the system requirements?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      console.log('Sending message to:', API_ENDPOINTS.CHATBOT_QUERY);
      console.log('Message:', messageToSend);
      
      const response = await fetch(API_ENDPOINTS.CHATBOT_QUERY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || 'No response received',
          sender: 'bot',
          timestamp: new Date(),
          suggestions: data.suggestions || [],
          actionData: data.actionData
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I'm having trouble connecting to the AI service right now. Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again in a moment.`,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: [
          "Try asking about patient registration",
          "Ask about claim processing",
          "Request system information",
          "Check network connection"
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 100, // Move it higher above the footer
        right: 20, // Back to bottom right
        zIndex: 100, // Lower z-index to avoid blocking other elements
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      {/* Chat Window */}
      <Collapse in={isOpen} orientation="vertical">
        <Paper
          elevation={8}
          sx={{
            width: 400,
            height: 500,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 1
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BotIcon />
              <Typography variant="h6">AI Assistant</Typography>
            </Box>
            <Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                sx={{ color: 'white', mr: 1 }}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 1,
              bgcolor: '#1a1a1a'
            }}
          >
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <ListItem
                    sx={{
                      flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      py: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                          width: 32,
                          height: 32
                        }}
                      >
                        {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      sx={{
                        ml: message.sender === 'user' ? 0 : 1,
                        mr: message.sender === 'user' ? 1 : 0,
                        '& .MuiListItemText-primary': {
                          bgcolor: message.sender === 'user' ? 'primary.main' : '#2a2a2a',
                          color: message.sender === 'user' ? 'white' : 'white',
                          p: 1.5,
                          borderRadius: 2,
                          boxShadow: 1,
                          wordBreak: 'break-word',
                          border: message.sender === 'bot' ? '1px solid rgba(0, 212, 255, 0.2)' : 'none'
                        }
                      }}
                      primary={message.text}
                      secondary={
                        <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7, color: 'white' }}>
                          {formatTime(message.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 5 }}>
                        {message.suggestions.map((suggestion, index) => (
                          <Chip
                            key={index}
                            label={suggestion}
                            size="small"
                            variant="outlined"
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: '#2a2a2a',
                              color: 'white',
                              border: '1px solid rgba(0, 212, 255, 0.3)',
                              '&:hover': {
                                bgcolor: 'primary.main',
                                color: 'white',
                                border: '1px solid #00d4ff'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </ListItem>
                  )}
                </React.Fragment>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <ListItem sx={{ justifyContent: 'flex-start' }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                      <BotIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={16} sx={{ color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'white' }}>AI is thinking...</Typography>
                      </Box>
                    }
                  />
                </ListItem>
              )}
            </List>
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                size="small"
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#2a2a2a',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(0, 212, 255, 0.3)'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(0, 212, 255, 0.5)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#00d4ff'
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                    color: 'grey.500'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Chat Button */}
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          width: 60,
          height: 60,
          boxShadow: 3,
          border: '2px solid #00d4ff',
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'scale(1.05)',
            border: '2px solid #00a3cc'
          },
          transition: 'all 0.2s',
          animation: 'pulse 2s infinite'
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </IconButton>
    </Box>
  );
};

export default Chatbot;
