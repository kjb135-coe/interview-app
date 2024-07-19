import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

const AVAILABLE_MODELS = {
  'gpt-3.5-turbo': 'GPT-3.5 Turbo',
  // Add other models as needed
};

function App() {
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    socket.on('ai_text_response', (response) => {
      console.log('Received AI text response:', response);
      setConversation(prev => [...prev, { type: 'ai', content: response }]);
      setError(null);
    });
  
    socket.on('ai_audio', (audioData) => {
      console.log('Received audio data, length:', audioData.length);
      const blob = new Blob([new Uint8Array(audioData)], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      console.log('Created audio URL:', url);
      audioRef.current.src = url;
      audioRef.current.play()
        .then(() => console.log('Audio playback started'))
        .catch(e => console.error('Audio playback error:', e));
      setError(null);
    });
  
    socket.on('error', (errorMessage) => {
      console.error('Error from server:', errorMessage);
      setError(errorMessage);
    });
  
    socket.on('connect', () => {
      console.log('Connected to server');
    });
  
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('ai_text_response');
      socket.off('ai_audio');
      socket.off('error');
    };
  }, []);

  const startListening = () => {
    setIsListening(true);
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setConversation(prev => [...prev, { type: 'user', content: transcript }]);
      socket.emit('user_input', { text: transcript, model: selectedModel });
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
  };

  const handleStartConversation = () => {
    startListening();
  };

  return (
    <div className="App">
      <h1>Chat with AI Model</h1>
      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
        {Object.entries(AVAILABLE_MODELS).map(([value, name]) => (
          <option key={value} value={value}>{name}</option>
        ))}
      </select>
      <button onClick={handleStartConversation} disabled={isListening}>
        {isListening ? 'Listening...' : 'Start Conversation'}
      </button>
      {error && <div className="error">{error}</div>}
      <div className="conversation">
        {conversation.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;