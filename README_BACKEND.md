# Femora Backend Setup

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Server

Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST `/api/ai/insight`
Generate AI-powered health insights based on cycle phase and symptoms.

**Request Body:**
```json
{
  "phase": "Menstrual",
  "cycleDay": 3,
  "symptoms": {
    "painLevel": 5,
    "mood": "irritable"
  },
  "cycleData": {}
}
```

**Response:**
```json
{
  "insight": "Your personalized AI insight...",
  "success": true
}
```

### POST `/api/ai/diet-plan`
Generate personalized diet plan for current cycle phase.

**Request Body:**
```json
{
  "phase": "Menstrual",
  "symptoms": {}
}
```

**Response:**
```json
{
  "dietPlan": "Recommended foods...",
  "success": true
}
```

### GET `/api/health`
Health check endpoint.

## Environment Variables

**IMPORTANT:** Create a `.env` file in the `Femora` directory with your API key:

```env
AI_API_KEY=AIzaSyDyu1Iv-1uUmMm-B0iWk3Cu9bdS4vYDFg4
PORT=3001
```

**Note:** The `.env` file is already in `.gitignore` so it won't be committed to GitHub.

### Setup Steps:

1. Create a `.env` file in the `Femora` folder
2. Copy the contents from `.env.example` (if it exists) or create it manually
3. Add your API key: `AI_API_KEY=your_actual_api_key_here`
4. The server will automatically load it when you run `npm start`

## Notes

- The API key is loaded from `.env` file (secure, not in code)
- The server serves both the API and static files
- CORS is enabled for development
- Fallback responses are provided if the AI API fails
- If `.env` is missing, the server will show a warning but still run (with fallback insights)

