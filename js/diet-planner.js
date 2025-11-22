// AI-Driven Diet Planner Module
class DietPlanner {
    constructor() {
        this.dietPlans = {
            menstrual: {
                name: 'Menstrual Phase',
                description: 'Focus on iron-rich foods to replenish what you\'ve lost during your period.',
                foods: [
                    { name: 'Sukuma Wiki', icon: '🥬', reason: 'Rich in iron and folate - perfect for this phase' },
                    { name: 'Ugali with Omena', icon: '🌾', reason: 'Complete protein and iron source' },
                    { name: 'Njahi (Black Beans)', icon: '🫘', reason: 'High in iron and fiber' },
                    { name: 'Lean Meat', icon: '🥩', reason: 'Heme iron for better absorption' },
                    { name: 'Arrowroot', icon: '🌿', reason: 'Easy to digest, provides energy' }
                ],
                hydration: 8,
                shoppingList: ['Sukuma Wiki', 'Omena (Dried Fish)', 'Njahi (Black Beans)', 'Arrowroot', 'Spinach', 'Lean Meat']
            },
            follicular: {
                name: 'Follicular Phase',
                description: 'High-energy foods to support your body as it prepares for ovulation.',
                foods: [
                    { name: 'Fresh Vegetables', icon: '🥗', reason: 'Boost energy and support hormone production' },
                    { name: 'Whole Grains', icon: '🌾', reason: 'Sustained energy release' },
                    { name: 'Lean Proteins', icon: '🍗', reason: 'Support muscle and tissue growth' },
                    { name: 'Fresh Fruits', icon: '🍎', reason: 'Natural sugars for energy' }
                ],
                hydration: 8,
                shoppingList: ['Fresh Vegetables', 'Whole Grains', 'Lean Proteins', 'Fresh Fruits']
            },
            ovulatory: {
                name: 'Ovulatory Phase',
                description: 'Anti-inflammatory foods to support your body during ovulation.',
                foods: [
                    { name: 'Omega-3 Rich Foods', icon: '🐟', reason: 'Reduce inflammation' },
                    { name: 'Berries', icon: '🫐', reason: 'Antioxidants and anti-inflammatory' },
                    { name: 'Leafy Greens', icon: '🥬', reason: 'Support hormone balance' },
                    { name: 'Nuts and Seeds', icon: '🥜', reason: 'Healthy fats and protein' }
                ],
                hydration: 9,
                shoppingList: ['Fish', 'Berries', 'Leafy Greens', 'Nuts', 'Seeds']
            },
            luteal: {
                name: 'Luteal Phase',
                description: 'Foods to reduce PMS symptoms and support mood stability.',
                foods: [
                    { name: 'Complex Carbs', icon: '🍠', reason: 'Stabilize blood sugar and mood' },
                    { name: 'Magnesium-Rich Foods', icon: '🍫', reason: 'Reduce cramps and improve sleep' },
                    { name: 'Calcium Sources', icon: '🥛', reason: 'Support bone health and mood' },
                    { name: 'B Vitamins', icon: '🌾', reason: 'Energy and mood support' }
                ],
                hydration: 10,
                shoppingList: ['Sweet Potatoes', 'Dark Chocolate', 'Dairy Products', 'Whole Grains']
            }
        };
        this.waterCount = this.loadWaterCount();
        this.init();
    }

    init() {
        this.setupPhaseButtons();
        this.updateDietPlan('menstrual');
        this.updateWaterDisplay();
    }

    loadWaterCount() {
        const today = new Date().toISOString().split('T')[0];
        const saved = localStorage.getItem(`femora_water_${today}`);
        return saved ? parseInt(saved) : 0;
    }

    saveWaterCount() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`femora_water_${today}`, this.waterCount.toString());
    }

    setupPhaseButtons() {
        const phaseButtons = document.querySelectorAll('.phase-btn');
        phaseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                phaseButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const phase = btn.dataset.phase;
                this.updateDietPlan(phase);
            });
        });
    }

    updateDietPlan(phase) {
        const plan = this.dietPlans[phase];
        if (!plan) return;

        // Update phase info
        const phaseNameEl = document.getElementById('dietPhaseName');
        if (phaseNameEl) phaseNameEl.textContent = plan.name;

        const phaseDescEl = document.getElementById('dietPhaseDesc');
        if (phaseDescEl) phaseDescEl.textContent = plan.description;

        // Update foods
        const foodsContainer = document.getElementById('recommendedFoods');
        if (foodsContainer) {
            foodsContainer.innerHTML = plan.foods.map(food => `
                <div class="food-item">
                    <span class="food-icon">${food.icon}</span>
                    <div class="food-info">
                        <strong>${food.name}</strong>
                        <p>${food.reason}</p>
                    </div>
                </div>
            `).join('');
        }

        // Update hydration target
        const hydrationTarget = document.querySelector('.hydration-tracker p');
        if (hydrationTarget) {
            hydrationTarget.innerHTML = `Target: <strong>${plan.hydration} glasses</strong> of water today`;
        }

        // Update shopping list
        const shoppingListEl = document.getElementById('shoppingList');
        if (shoppingListEl) {
            shoppingListEl.innerHTML = plan.shoppingList.map(item => `
                <label class="shopping-item">
                    <input type="checkbox">
                    <span>${item}</span>
                </label>
            `).join('');
        }
    }

    logWater() {
        this.waterCount++;
        if (this.waterCount > 10) this.waterCount = 0; // Reset after 10
        this.saveWaterCount();
        this.updateWaterDisplay();
    }

    updateWaterDisplay() {
        const waterCountEl = document.getElementById('waterCount');
        if (waterCountEl) {
            waterCountEl.textContent = this.waterCount;
        }
    }

    generateDietPlan() {
        // Get current cycle phase
        const phase = cycleTracker.getCurrentPhase();
        let phaseKey = 'menstrual';
        
        if (phase.name === 'Follicular') phaseKey = 'follicular';
        else if (phase.name === 'Ovulatory') phaseKey = 'ovulatory';
        else if (phase.name === 'Luteal') phaseKey = 'luteal';
        
        // Update to current phase
        document.querySelectorAll('.phase-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.phase === phaseKey) {
                btn.classList.add('active');
            }
        });
        
        this.updateDietPlan(phaseKey);
        
        // Show notification
        alert('Diet plan updated based on your current cycle phase!');
    }

    saveDietPlan() {
        const activePhase = document.querySelector('.phase-btn.active')?.dataset.phase;
        if (activePhase) {
            const saved = JSON.parse(localStorage.getItem('femora_diet_plans') || '{}');
            saved[new Date().toISOString().split('T')[0]] = activePhase;
            localStorage.setItem('femora_diet_plans', JSON.stringify(saved));
            alert('Diet plan saved!');
        }
    }
}

// Initialize diet planner
const dietPlanner = new DietPlanner();

// Export functions
window.generateDietPlan = () => dietPlanner.generateDietPlan();
window.saveDietPlan = () => dietPlanner.saveDietPlan();
window.logWater = () => dietPlanner.logWater();

