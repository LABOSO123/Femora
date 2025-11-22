// Menopause Tracker Module
class MenopauseTracker {
    constructor() {
        this.menopauseData = this.loadMenopauseData();
        this.init();
    }

    init() {
        this.setupSliders();
        this.updateMenopauseStatus();
    }

    loadMenopauseData() {
        const saved = localStorage.getItem('femora_menopause_data');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            status: 'pre-menopause',
            hotFlashes: [],
            symptoms: []
        };
    }

    saveMenopauseData() {
        localStorage.setItem('femora_menopause_data', JSON.stringify(this.menopauseData));
    }

    setupSliders() {
        const hotFlashSlider = document.getElementById('hotFlashIntensity');
        if (hotFlashSlider) {
            hotFlashSlider.addEventListener('input', (e) => {
                const valueEl = document.getElementById('hotFlashValue');
                if (valueEl) valueEl.textContent = e.target.value;
            });
        }

        const jointPainSlider = document.getElementById('jointPain');
        if (jointPainSlider) {
            jointPainSlider.addEventListener('input', (e) => {
                const valueEl = document.getElementById('jointPainValue');
                if (valueEl) valueEl.textContent = e.target.value;
            });
        }

        const fatigueSlider = document.getElementById('fatigueLevel');
        if (fatigueSlider) {
            fatigueSlider.addEventListener('input', (e) => {
                const valueEl = document.getElementById('fatigueValue');
                if (valueEl) valueEl.textContent = e.target.value;
            });
        }
    }

    updateMenopauseStatus() {
        const statusEl = document.getElementById('menopauseStatus');
        if (statusEl) {
            statusEl.value = this.menopauseData.status;
            statusEl.addEventListener('change', (e) => {
                this.menopauseData.status = e.target.value;
                this.saveMenopauseData();
                this.generateInsight();
            });
        }
    }

    logHotFlash() {
        const count = parseInt(document.getElementById('hotFlashCount').value) || 0;
        const intensity = parseInt(document.getElementById('hotFlashIntensity').value) || 0;
        
        const hotFlash = {
            date: new Date().toISOString().split('T')[0],
            count: count,
            intensity: intensity,
            timestamp: new Date().toISOString()
        };
        
        this.menopauseData.hotFlashes.push(hotFlash);
        this.saveMenopauseData();
        this.generateInsight();
        
        alert('Hot flash logged successfully!');
    }

    saveMenopauseData() {
        const sleep = document.getElementById('menopauseSleep').value;
        const mood = document.getElementById('menopauseMood').value;
        const weight = document.getElementById('menopauseWeight').value;
        const libido = document.getElementById('menopauseLibido').value;
        const dryness = document.getElementById('vaginalDryness').value;
        const jointPain = document.getElementById('jointPain').value;
        const fatigue = document.getElementById('fatigueLevel').value;
        
        const symptomEntry = {
            date: new Date().toISOString().split('T')[0],
            sleep: sleep,
            mood: mood,
            weight: weight,
            libido: libido,
            dryness: dryness,
            jointPain: jointPain,
            fatigue: fatigue,
            timestamp: new Date().toISOString()
        };
        
        // Remove existing entry for today
        this.menopauseData.symptoms = this.menopauseData.symptoms.filter(
            s => s.date !== symptomEntry.date
        );
        
        this.menopauseData.symptoms.push(symptomEntry);
        this.saveMenopauseData();
        this.generateInsight();
        
        alert('Menopause data saved!');
    }

    generateInsight() {
        const insightEl = document.getElementById('menopauseInsight');
        if (!insightEl) return;
        
        const status = this.menopauseData.status;
        const recentSymptoms = this.menopauseData.symptoms.slice(-1)[0];
        const recentHotFlashes = this.menopauseData.hotFlashes.slice(-7);
        
        let insight = '';
        
        if (status === 'perimenopause' || status === 'menopause') {
            if (recentHotFlashes.length > 0) {
                const avgIntensity = recentHotFlashes.reduce((sum, hf) => sum + hf.intensity, 0) / recentHotFlashes.length;
                if (avgIntensity > 7) {
                    insight = 'Your hot flashes are intense. Consider phytoestrogen-rich foods like soy, flaxseeds, and legumes. Stay hydrated and dress in layers.';
                } else {
                    insight = 'Hot flashes are manageable. Continue tracking patterns to identify triggers like caffeine, alcohol, or stress.';
                }
            } else if (recentSymptoms) {
                if (recentSymptoms.sleep === 'poor' || recentSymptoms.sleep === 'insomnia') {
                    insight = 'Sleep disturbances are common during this transition. Try magnesium-rich foods, maintain a cool bedroom, and establish a bedtime routine.';
                } else if (recentSymptoms.mood === 'irritable' || recentSymptoms.mood === 'anxious') {
                    insight = 'Mood changes are normal. Consider omega-3 fatty acids, regular exercise, and stress management techniques.';
                } else if (recentSymptoms.dryness === 'moderate' || recentSymptoms.dryness === 'severe') {
                    insight = 'Vaginal dryness can be managed with lubricants and moisturizers. Consider speaking with your healthcare provider about options.';
                } else {
                    insight = 'Based on your symptoms, consider increasing phytoestrogen-rich foods like soy, flaxseeds, and legumes to help balance hormones naturally.';
                }
            } else {
                insight = 'Continue tracking your symptoms. This data helps identify patterns and can guide lifestyle adjustments.';
            }
        } else {
            insight = 'You\'re in pre-menopause. Continue tracking to establish baseline patterns for when you transition.';
        }
        
        insightEl.innerHTML = `<p>${insight}</p>`;
    }
}

// Initialize menopause tracker
const menopauseTracker = new MenopauseTracker();

// Export functions
window.logHotFlash = () => menopauseTracker.logHotFlash();
window.saveMenopauseData = () => menopauseTracker.saveMenopauseData();

