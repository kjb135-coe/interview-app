# AI-Powered Chat Application with Speech Recognition

## Overview

This project is an innovative chat application that integrates artificial intelligence, speech recognition, and text-to-speech capabilities. It allows users to have a voice-based conversation with an AI model, creating a unique and interactive experience.

## Features

- Real-time voice-based conversation with an AI model
- Speech-to-text conversion for user input
- Text-to-speech conversion for AI responses
- Dynamic conversation flow with turn-taking between user and AI
- Customizable system prompts to set the context of the conversation
- Responsive web interface built with React and Material-UI

## Technologies Used

- Frontend:
  - React.js
  - Material-UI
  - Socket.io-client
  - Web Speech API
- Backend:
  - Node.js
  - Express.js
  - Socket.io
  - OpenRouter API for AI model integration
  - Google Cloud Text-to-Speech API

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/kjb135-coe/interview-app.git
   cd interview-app
   ```

2. Install dependencies for both frontend and backend:
   ```
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory with the following variables:
   ```
   PORT=8080
   OPENROUTER_API_KEY=your_openrouter_api_key
   GOOGLE_APPLICATION_CREDENTIALS=path_to_your_google_cloud_credentials.json
   ```

4. Start the backend server:
   ```
   cd server && npm start
   ```

5. In a new terminal, start the frontend application:
   ```
   cd client && npm start
   ```

6. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Enter a system prompt in the text field to set the context for the AI (e.g., "You are a helpful assistant").
2. Click "Start Conversation" to begin the interaction.
3. Speak into your microphone when prompted. The application will convert your speech to text.
4. Wait for the AI to process your input and generate a response.
5. Listen to the AI's response, which will be played back as audio.
6. Continue the conversation by speaking again when it's your turn.

## Project Structure

- `client/`: Contains the React frontend application
  - `src/App.js`: Main component with core logic
- `server/`: Contains the Node.js backend
  - `server.js`: Express server setup and Socket.io logic

## Future Enhancements

- Implement user authentication
- Add support for multiple languages
- Improve error handling and edge cases
- Optimize for mobile devices
- Implement conversation history saving

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- OpenRouter for providing access to various AI models
- Google Cloud for the Text-to-Speech API
- The open-source community for the amazing tools and libraries used in this project
