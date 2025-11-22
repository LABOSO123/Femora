// Contraceptive Tracker Module
class ContraceptiveTracker {
    constructor() {
        this.activities = this.loadActivities();
        this.contraceptives = this.loadContraceptives();
        this.init();
    }

    init() {
        this.setupTabs();
        this.updateFertilityWindow();
        this.updateReminders();
    }

    loadActivities() {
        const saved = localStorage.getItem('femora_activities');
        return saved ? JSON.parse(saved) : [];
    }

    saveActivities() {
        localStorage.setItem('femora_activities', JSON.stringify(this.activities));
    }

    loadContraceptives() {
        const saved = localStorage.getItem('femora_contraceptives');
        return saved ? JSON.parse(saved) : [];
    }

    saveContraceptives() {
        localStorage.setItem('femora_contraceptives', JSON.stringify(this.contraceptives));
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.contraceptive-tabs .tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.textContent.includes('Activity') ? 'activity' :
                               btn.textContent.includes('Contraceptive') ? 'contraceptive' : 'fertility';
                this.showTab(tabName);
            });
        });
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active from all buttons
        document.querySelectorAll('.contraceptive-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const tabMap = {
            'activity': 'activityTab',
            'contraceptive': 'contraceptiveTab',
            'fertility': 'fertilityTab'
        };
        
        const tabEl = document.getElementById(tabMap[tabName]);
        if (tabEl) tabEl.classList.add('active');
        
        // Activate button
        const buttons = document.querySelectorAll('.contraceptive-tabs .tab-btn');
        if (tabName === 'activity') buttons[0].classList.add('active');
        else if (tabName === 'contraceptive') buttons[1].classList.add('active');
        else if (tabName === 'fertility') buttons[2].classList.add('active');
    }

    logActivity() {
        const date = document.getElementById('activityDate').value;
        const type = document.getElementById('activityType').value;
        const contraceptive = document.getElementById('activityContraceptive').value;
        
        if (!date) {
            alert('Please select a date');
            return;
        }
        
        const activity = {
            date: date,
            type: type,
            contraceptive: contraceptive,
            timestamp: new Date().toISOString()
        };
        
        this.activities.push(activity);
        this.saveActivities();
        this.assessPregnancyRisk(date, type, contraceptive);
        
        alert('Activity logged successfully!');
        
        // Reset form
        document.getElementById('activityDate').value = new Date().toISOString().split('T')[0];
    }

    assessPregnancyRisk(date, type, contraceptive) {
        const riskEl = document.getElementById('riskLevel');
        if (!riskEl) return;
        
        let riskLevel = 'low';
        let message = '';
        
        if (type === 'unprotected' && contraceptive === 'none') {
            // Check if in fertile window
            const cycleDay = cycleTracker.calculateCycleDay();
            const ovulationDay = Math.floor(cycleTracker.cycleData.cycleLength / 2);
            const fertileStart = ovulationDay - 3;
            const fertileEnd = ovulationDay + 2;
            
            if (cycleDay >= fertileStart && cycleDay <= fertileEnd) {
                riskLevel = 'high';
                message = '⚠️ HIGH RISK: Unprotected sex during fertile window. Consider emergency contraception if within 72 hours.';
            } else {
                riskLevel = 'medium';
                message = '⚠️ MEDIUM RISK: Unprotected sex outside fertile window. Risk is lower but not zero.';
            }
        } else if (type === 'protected' || contraceptive !== 'none') {
            riskLevel = 'low';
            message = '✅ LOW RISK: Protected sexual activity. Continue using protection consistently.';
        }
        
        riskEl.className = `risk-level ${riskLevel}`;
        riskEl.innerHTML = `<p><strong>${message}</strong></p>`;
    }

    saveContraceptive() {
        const type = document.getElementById('contraceptiveType').value;
        const startDate = document.getElementById('contraceptiveStartDate').value;
        const nextDate = document.getElementById('contraceptiveNextDate').value;
        
        if (!type || !startDate) {
            alert('Please fill in all required fields');
            return;
        }
        
        const contraceptive = {
            type: type,
            startDate: startDate,
            nextDate: nextDate,
            createdAt: new Date().toISOString()
        };
        
        this.contraceptives.push(contraceptive);
        this.saveContraceptives();
        this.updateReminders();
        
        alert('Contraceptive information saved!');
    }

    updateReminders() {
        const reminderList = document.getElementById('reminderList');
        if (!reminderList) return;
        
        const activeContraceptive = this.contraceptives[this.contraceptives.length - 1];
        
        if (activeContraceptive) {
            let reminderText = '';
            let reminderIcon = '💊';
            
            if (activeContraceptive.type === 'pill') {
                reminderText = 'Take your pill at 8:00 AM daily';
                reminderIcon = '💊';
            } else if (activeContraceptive.type === 'injection') {
                reminderText = `Next injection due: ${activeContraceptive.nextDate || 'Not set'}`;
                reminderIcon = '💉';
            } else if (activeContraceptive.type === 'implant') {
                reminderText = `Implant check-up: ${activeContraceptive.nextDate || 'Not set'}`;
                reminderIcon = '📅';
            }
            
            reminderList.innerHTML = `
                <div class="reminder-item">
                    <span class="reminder-icon">${reminderIcon}</span>
                    <div class="reminder-info">
                        <strong>${activeContraceptive.type.charAt(0).toUpperCase() + activeContraceptive.type.slice(1)} Reminder</strong>
                        <p>${reminderText}</p>
                    </div>
                    <button class="btn-small">Set</button>
                </div>
            `;
        }
    }

    logSideEffects() {
        const weightChange = document.getElementById('weightChange').value;
        const moodChange = document.getElementById('moodChange').value;
        const otherSymptoms = document.getElementById('otherSideEffects').value;
        
        const sideEffect = {
            date: new Date().toISOString().split('T')[0],
            weightChange: weightChange,
            moodChange: moodChange,
            otherSymptoms: otherSymptoms,
            timestamp: new Date().toISOString()
        };
        
        const sideEffects = JSON.parse(localStorage.getItem('femora_side_effects') || '[]');
        sideEffects.push(sideEffect);
        localStorage.setItem('femora_side_effects', JSON.stringify(sideEffects));
        
        // Check for concerning patterns
        if (parseFloat(weightChange) > 5 || moodChange === 'depression') {
            alert('⚠️ Consider consulting a healthcare provider about these side effects.');
        } else {
            alert('Side effects logged. Continue monitoring.');
        }
    }

    updateFertilityWindow() {
        const cycleLength = cycleTracker.cycleData.cycleLength;
        const ovulationDay = Math.floor(cycleLength / 2);
        const fertileStart = ovulationDay - 3;
        const fertileEnd = ovulationDay + 2;
        
        // Calculate actual dates
        const today = new Date();
        const lastPeriod = cycleTracker.cycleData.lastPeriodStart ? 
            new Date(cycleTracker.cycleData.lastPeriodStart) : today;
        
        const ovulationDate = new Date(lastPeriod);
        ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
        
        const ovulationEl = document.getElementById('ovulationDate');
        if (ovulationEl) {
            ovulationEl.textContent = `Day ${ovulationDay} (${ovulationDate.toLocaleDateString()})`;
        }
        
        const fertileWindowEl = document.getElementById('fertileWindow');
        if (fertileWindowEl) {
            fertileWindowEl.textContent = `Days ${fertileStart}-${fertileEnd}`;
        }
        
        const safeDaysEl = document.getElementById('safeDays');
        if (safeDaysEl) {
            safeDaysEl.textContent = `Days 1-${fertileStart - 1}, ${fertileEnd + 1}-${cycleLength}`;
        }
        
        // Generate calendar
        this.generateFertilityCalendar();
    }

    generateFertilityCalendar() {
        const calendarEl = document.getElementById('fertilityCalendar');
        if (!calendarEl) return;
        
        const cycleLength = cycleTracker.cycleData.cycleLength;
        const ovulationDay = Math.floor(cycleLength / 2);
        const fertileStart = ovulationDay - 3;
        const fertileEnd = ovulationDay + 2;
        
        let calendarHTML = '<div class="calendar-grid">';
        
        for (let day = 1; day <= cycleLength; day++) {
            let className = 'calendar-day';
            let label = '';
            
            if (day <= 5) {
                className += ' period';
                label = 'Period';
            } else if (day >= fertileStart && day <= fertileEnd) {
                className += ' fertile';
                label = day === ovulationDay ? 'Ovulation' : 'Fertile';
            } else {
                className += ' safe';
                label = 'Safe';
            }
            
            calendarHTML += `
                <div class="${className}">
                    <span class="day-number">${day}</span>
                    <span class="day-label">${label}</span>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        calendarEl.innerHTML = calendarHTML;
    }
}

// Initialize contraceptive tracker
const contraceptiveTracker = new ContraceptiveTracker();

// Export functions
window.showContraceptiveTab = (tab) => contraceptiveTracker.showTab(tab);
window.logActivity = () => contraceptiveTracker.logActivity();
window.saveContraceptive = () => contraceptiveTracker.saveContraceptive();
window.logSideEffects = () => contraceptiveTracker.logSideEffects();

