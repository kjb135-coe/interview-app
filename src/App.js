import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Box, 
  Paper
} from '@mui/material';

const socket = io('http://localhost:8080');

function App() {
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef(null);
  const [isRecognitionRunning, setIsRecognitionRunning] = useState(false);
  const silenceTimeoutRef = useRef(null);
  const currentTranscriptRef = useRef('');

  useEffect(() => {
    socket.on('ai_response', async ({ text, audio }) => {
      console.log('Received AI response:', text);
      
      setConversation(prev => [...prev, { type: 'ai', content: text }]);
      
      if (audio) {
        const blob = new Blob([audio], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        audioRef.current.src = url;
        
        try {
          await new Promise((resolve, reject) => {
            audioRef.current.onended = resolve;
            audioRef.current.onerror = reject;
            audioRef.current.play().catch(reject);
          });
          console.log('Audio playback completed successfully');
        } catch (error) {
          console.error('Audio playback error:', error);
        } finally {
          URL.revokeObjectURL(url);
        }
      }
      
      setError(null);
      if (isListening) {
        startSpeechRecognition();
      }
    });

    socket.on('error', (errorMessage) => {
      console.error('Error from server:', errorMessage);
      setError(errorMessage);
    });

    return () => {
      socket.off('ai_response');
      socket.off('error');
    };
  }, [isListening]);

  const startSpeechRecognition = () => {
    // Check if recognition is already running
    if (isRecognitionRunning) {
      console.log('Speech recognition is already running');
      return;
    }
  
    if (!recognitionRef.current) {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
  
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        currentTranscriptRef.current = transcript;
        
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        
        silenceTimeoutRef.current = setTimeout(() => {
          setConversation(prev => [...prev, { type: 'user', content: currentTranscriptRef.current }]);
          socket.emit('user_input', { text: currentTranscriptRef.current, isUserInput: true });
          currentTranscriptRef.current = '';
          recognitionRef.current.stop();
        }, 750);
      };
  
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setIsRecognitionRunning(false); // Update the flag when recognition stops due to an error
      };
  
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsRecognitionRunning(false); // Update the flag when recognition ends
        // if (isListening) {
        //   startSpeechRecognition();
        // }
      };
    }
  
    recognitionRef.current.start();
    setIsRecognitionRunning(true); // Update the flag when recognition starts
    console.log('Speech recognition started');
  };

  const startConversation = () => {
    if (systemPrompt.trim() === '') {
      setError('Please enter a system prompt before starting the conversation.');
      return;
    }
    setConversation([]);
    setIsListening(true);
    socket.emit('user_input', { text: systemPrompt, isSystemPrompt: true });
  };

  const toggleListening = () => {
    if (!isListening) {
      startConversation();
    } else {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chat with AI Model
        </Typography>
        
        <TextField
          fullWidth
          label="Enter system prompt"
          variant="outlined"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          margin="normal"
          disabled={isListening}
        />
        
        <Button 
          variant="contained" 
          color={isListening ? "secondary" : "primary"}
          onClick={toggleListening}
          sx={{ mt: 2 }}
        >
          {isListening ? 'Stop Conversation' : 'Start Conversation'}
        </Button>
        
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        
        <Paper elevation={3} sx={{ mt: 4, p: 2, maxHeight: '400px', overflowY: 'auto' }}>
          {conversation.map((message, index) => (
            <Box key={index} sx={{ mb: 2, textAlign: message.type === 'user' ? 'right' : 'left' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  display: 'inline-block',
                  backgroundColor: message.type === 'user' ? '#e3f2fd' : '#f3e5f5',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  maxWidth: '80%'
                }}
              >
                {message.content}
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
    </Container>
  );
}

export default App;