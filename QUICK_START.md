# Quick Start Guide

## Setup Backend

1. **Install dependencies:**
   ```bash
   cd Femora
   npm install
   ```

2. **Create `.env` file:**
   Create a `.env` file in the `Femora` directory with:
   ```env
   AI_API_KEY=your_actual_api_key_here
   PORT=3001
   ```
   
   **Note:** The `.env` file is gitignored and won't be pushed to GitHub.

3. **Start the server:**
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:3001`

3. **Open the app:**
   - The server automatically serves the frontend
   - Open `http://localhost:3001` in your browser
   - Or use the frontend server: `npm run frontend` (runs on port 3000)

## How It Works

- **Backend Server** (`server.js`): Handles AI API requests using Google Gemini
- **Frontend** (`index.html`): Makes API calls to the backend for AI insights
- **API Key**: Stored securely in the backend (not exposed to frontend)

## API Endpoints

- `POST /api/ai/insight` - Generate AI health insights
- `POST /api/ai/diet-plan` - Generate personalized diet plans
- `GET /api/health` - Health check

## Troubleshooting

- If AI insights don't work, check the browser console for errors
- Make sure the backend server is running on port 3001
- The frontend will fallback to local insights if the API is unavailable

