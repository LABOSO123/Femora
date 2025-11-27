const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// AI API Key from environment variable
const AI_API_KEY = process.env.AI_API_KEY;
if (!AI_API_KEY) {
    console.error('⚠️  WARNING: AI_API_KEY not found in environment variables!');
    console.error('Please create a .env file with AI_API_KEY=your_key_here');
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// AI Insight Endpoint
app.post('/api/ai/insight', async (req, res) => {
    try {
        // Check if API key is available
        if (!AI_API_KEY) {
            console.warn('AI_API_KEY not found, using fallback insight');
            const fallbackInsight = generateFallbackInsight(
                req.body.phase || 'Unknown',
                req.body.symptoms
            );
            return res.json({ insight: fallbackInsight, success: false, error: 'API key not configured' });
        }

        const { phase, cycleDay, symptoms, cycleData } = req.body;

        // Build context for AI
        let context = `You are a helpful health assistant for a menstrual cycle tracking app called Femora. `;
        context += `The user is currently in the ${phase} phase of their cycle (Day ${cycleDay}). `;
        
        if (symptoms) {
            context += `Current symptoms: `;
            if (symptoms.periodStatus && symptoms.periodStatus !== 'none') {
                context += `Period flow: ${symptoms.periodStatus}. `;
            }
            if (symptoms.painLevel > 0) {
                context += `Pain level: ${symptoms.painLevel}/10. `;
            }
            if (symptoms.mood) {
                context += `Mood: ${symptoms.mood}. `;
            }
            if (symptoms.energyLevel !== undefined) {
                context += `Energy level: ${symptoms.energyLevel}/10. `;
            }
        }

        context += `Provide a brief, helpful, and personalized insight (2-3 sentences) about their cycle phase and symptoms. `;
        context += `Focus on practical advice like nutrition (mention Kenyan foods like sukuma wiki, omena, njahi when relevant), `;
        context += `self-care, and what to expect. Be warm, supportive, and culturally sensitive.`;

        // Call Google Gemini API
        const response = await fetch(`${GEMINI_API_URL}?key=${AI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: context
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Extract the generated text
        let insight = '';
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            insight = data.candidates[0].content.parts[0].text;
        }

        // Fallback if API doesn't return expected format
        if (!insight) {
            insight = generateFallbackInsight(phase, symptoms);
        }

        res.json({ insight, success: true });
    } catch (error) {
        console.error('AI Insight Error:', error);
        
        // Return fallback insight on error
        const fallbackInsight = generateFallbackInsight(
            req.body.phase || 'Unknown',
            req.body.symptoms
        );
        
        res.json({ 
            insight: fallbackInsight, 
            success: false,
            error: error.message 
        });
    }
});

// Generate Diet Plan Endpoint
app.post('/api/ai/diet-plan', async (req, res) => {
    try {
        // Check if API key is available
        if (!AI_API_KEY) {
            console.warn('AI_API_KEY not found, using fallback diet plan');
            const fallbackPlan = generateFallbackDietPlan(req.body.phase || 'Unknown');
            return res.json({ dietPlan: fallbackPlan, success: false, error: 'API key not configured' });
        }

        const { phase, symptoms } = req.body;

        let context = `You are a nutritionist helping with a menstrual cycle tracking app. `;
        context += `The user is in the ${phase} phase. `;
        context += `Provide a personalized diet plan with 3-4 recommended foods. `;
        context += `Focus on Kenyan foods like sukuma wiki, omena, njahi, arrowroot, etc. `;
        context += `Include brief explanations of why each food is beneficial for this phase. `;
        context += `Format as a simple list with food names and short benefits.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${AI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: context
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        let dietPlan = '';
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            dietPlan = data.candidates[0].content.parts[0].text;
        }

        if (!dietPlan) {
            dietPlan = generateFallbackDietPlan(phase);
        }

        res.json({ dietPlan, success: true });
    } catch (error) {
        console.error('Diet Plan Error:', error);
        res.json({ 
            dietPlan: generateFallbackDietPlan(req.body.phase || 'Unknown'), 
            success: false 
        });
    }
});

// Fallback insight generator (when API fails)
function generateFallbackInsight(phase, symptoms) {
    if (phase === 'Menstrual') {
        if (symptoms?.painLevel > 5) {
            return 'Your symptoms suggest higher pain levels during your period. Consider iron-rich foods like sukuma wiki, spinach, or beans. Heat therapy and gentle movement may help.';
        }
        return 'You\'re in your menstrual phase. Focus on iron-rich foods like sukuma wiki, omena, and njahi to replenish what you\'ve lost. Stay hydrated and rest as needed.';
    } else if (phase === 'Follicular') {
        return 'Your body is preparing for ovulation. This is a great time for high-energy activities and fresh, nutrient-dense foods to support hormone production.';
    } else if (phase === 'Ovulatory') {
        return 'You\'re likely ovulating. This is your most fertile window. Consider anti-inflammatory foods like fish, berries, and leafy greens to support this phase.';
    } else if (phase === 'Luteal') {
        if (symptoms?.mood === 'irritable' || symptoms?.mood === 'anxious') {
            return 'PMS symptoms detected. Focus on complex carbs, magnesium-rich foods, and B vitamins. Dark chocolate (in moderation) can help with mood and cravings.';
        }
        return 'You\'re in the luteal phase. Support your body with complex carbohydrates, calcium, and magnesium to reduce PMS symptoms and stabilize mood.';
    }
    return 'Continue tracking your symptoms. The more data you log, the better insights we can provide about your cycle and health.';
}

function generateFallbackDietPlan(phase) {
    const plans = {
        'Menstrual': 'Sukuma Wiki (rich in iron), Omena (complete protein), Njahi/Black Beans (high in iron and fiber), Lean Meat (heme iron for better absorption)',
        'Follicular': 'Fresh vegetables, Whole grains, Lean proteins, Berries (antioxidants)',
        'Ovulatory': 'Fish (omega-3), Leafy greens, Berries, Nuts and seeds',
        'Luteal': 'Complex carbs (ugali, sweet potatoes), Calcium-rich foods, Magnesium sources, Dark chocolate (in moderation)'
    };
    return plans[phase] || plans['Menstrual'];
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Femora API is running' });
});

// Serve the main app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚺 Femora server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

