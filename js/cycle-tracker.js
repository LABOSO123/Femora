// Cycle Tracker Module
class CycleTracker {
    constructor() {
        this.cycleData = this.loadCycleData();
        this.currentDate = new Date();
        this.init();
    }

    init() {
        this.updateCycleDisplay();
        this.setupDateInput();
    }

    loadCycleData() {
        const saved = localStorage.getItem('femora_cycle_data');
        if (saved) {
            return JSON.parse(saved);
        }
        // Initialize with default values
        const defaultData = {
            cycleLength: 28,
            periodLength: 5,
            lastPeriodStart: new Date().toISOString().split('T')[0], // Set to today for demo
            periods: [],
            symptoms: []
        };
        // Save default data
        localStorage.setItem('femora_cycle_data', JSON.stringify(defaultData));
        return defaultData;
    }

    saveCycleData() {
        localStorage.setItem('femora_cycle_data', JSON.stringify(this.cycleData));
    }

    setupDateInput() {
        const dateInput = document.getElementById('trackingDate');
        if (dateInput) {
            dateInput.value = this.currentDate.toISOString().split('T')[0];
        }
    }

    calculateCycleDay() {
        if (!this.cycleData.lastPeriodStart) return 0;
        
        const lastPeriod = new Date(this.cycleData.lastPeriodStart);
        const today = new Date();
        const diffTime = today - lastPeriod;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return (diffDays % this.cycleData.cycleLength) + 1;
    }

    getCurrentPhase() {
        const day = this.calculateCycleDay();
        const cycleLength = this.cycleData.cycleLength;
        
        if (day <= 5) return { name: 'Menstrual', day: day, icon: '🩸' };
        if (day <= 13) return { name: 'Follicular', day: day, icon: '🌸' };
        if (day <= 16) return { name: 'Ovulatory', day: day, icon: '✨' };
        return { name: 'Luteal', day: day, icon: '🌙' };
    }

    updateCycleDisplay() {
        const phase = this.getCurrentPhase();
        const cycleDay = this.calculateCycleDay();
        
        // Update phase indicator
        const phaseIndicator = document.getElementById('phaseIndicator');
        if (phaseIndicator) {
            const circle = phaseIndicator.querySelector('.phase-circle');
            if (circle) {
                circle.textContent = phase.icon;
            }
        }

        // Update phase info
        const currentPhaseEl = document.getElementById('currentPhase');
        if (currentPhaseEl) currentPhaseEl.textContent = phase.name + ' Phase';

        const cycleDayEl = document.getElementById('cycleDay');
        if (cycleDayEl) cycleDayEl.textContent = `Day ${cycleDay} of ${this.cycleData.cycleLength}`;

        // Calculate next period
        const nextPeriod = this.calculateNextPeriod();
        const nextPeriodEl = document.getElementById('nextPeriod');
        if (nextPeriodEl) {
            if (nextPeriod > 0) {
                nextPeriodEl.textContent = `Next period in ${nextPeriod} days`;
            } else {
                nextPeriodEl.textContent = 'Period expected soon';
            }
        }

        // Update stats
        const cycleLengthEl = document.getElementById('cycleLength');
        if (cycleLengthEl) cycleLengthEl.textContent = `${this.cycleData.cycleLength} days`;

        const periodLengthEl = document.getElementById('periodLength');
        if (periodLengthEl) periodLengthEl.textContent = `${this.cycleData.periodLength} days`;

        const ovulationDay = Math.floor(this.cycleData.cycleLength / 2);
        const ovulationEl = document.getElementById('ovulationDay');
        if (ovulationEl) ovulationEl.textContent = `Day ${ovulationDay}`;
    }

    calculateNextPeriod() {
        if (!this.cycleData.lastPeriodStart) return 0;
        
        const lastPeriod = new Date(this.cycleData.lastPeriodStart);
        const nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + this.cycleData.cycleLength);
        
        const today = new Date();
        const diffTime = nextPeriod - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    logPeriod(startDate, flow) {
        const period = {
            startDate: startDate,
            flow: flow,
            endDate: null
        };
        
        this.cycleData.periods.push(period);
        this.cycleData.lastPeriodStart = startDate;
        this.saveCycleData();
        this.updateCycleDisplay();
    }

    logSymptoms(date, symptoms) {
        const symptomEntry = {
            date: date,
            symptoms: symptoms,
            timestamp: new Date().toISOString()
        };
        
        // Remove existing entry for this date
        this.cycleData.symptoms = this.cycleData.symptoms.filter(
            s => s.date !== date
        );
        
        this.cycleData.symptoms.push(symptomEntry);
        this.saveCycleData();
        this.updateTodaySymptoms();
    }

    updateTodaySymptoms() {
        const today = new Date().toISOString().split('T')[0];
        const todaySymptoms = this.cycleData.symptoms.find(s => s.date === today);
        
        const symptomsContainer = document.getElementById('todaySymptoms');
        if (symptomsContainer) {
            if (todaySymptoms && todaySymptoms.symptoms) {
                const symptoms = todaySymptoms.symptoms;
                const tags = [];
                
                if (symptoms.periodStatus && symptoms.periodStatus !== 'none') {
                    tags.push(`🩸 ${symptoms.periodStatus} flow`);
                }
                if (symptoms.painLevel > 0) {
                    tags.push(`😣 Pain: ${symptoms.painLevel}/10`);
                }
                if (symptoms.mood) {
                    tags.push(`😊 ${symptoms.mood}`);
                }
                if (symptoms.energyLevel !== undefined) {
                    tags.push(`⚡ Energy: ${symptoms.energyLevel}/10`);
                }
                
                symptomsContainer.innerHTML = tags.map(tag => 
                    `<span class="symptom-tag">${tag}</span>`
                ).join('');
            } else {
                symptomsContainer.innerHTML = '<span class="symptom-tag">No symptoms logged today</span>';
            }
        }
    }
}

// Initialize cycle tracker
const cycleTracker = new CycleTracker();

// Export for use in other modules
window.cycleTracker = cycleTracker;

