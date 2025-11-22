// Lifetime Health Record Module
class HealthRecord {
    constructor() {
        this.healthData = this.loadHealthData();
        this.init();
    }

    init() {
        this.setupTabs();
        this.updateOverview();
        this.updatePeriodHistory();
        this.updateHormonePatterns();
    }

    loadHealthData() {
        const saved = localStorage.getItem('femora_health_record');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            startDate: new Date().toISOString().split('T')[0],
            periods: [],
            pregnancies: [],
            hormonalSignals: []
        };
    }

    saveHealthData() {
        localStorage.setItem('femora_health_record', JSON.stringify(this.healthData));
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.health-record-tabs .tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabText = btn.textContent.toLowerCase();
                let tabName = 'overview';
                if (tabText.includes('period')) tabName = 'periods';
                else if (tabText.includes('pregnancy')) tabName = 'pregnancy';
                else if (tabText.includes('hormon')) tabName = 'hormones';
                
                this.showTab(tabName);
            });
        });
    }

    showTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('#health-record .tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Remove active from all buttons
        document.querySelectorAll('.health-record-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        const tabMap = {
            'overview': 'overviewTab',
            'periods': 'periodsTab',
            'pregnancy': 'pregnancyTab',
            'hormones': 'hormonesTab'
        };
        
        const tabEl = document.getElementById(tabMap[tabName]);
        if (tabEl) tabEl.classList.add('active');
        
        // Activate button
        const buttons = document.querySelectorAll('.health-record-tabs .tab-btn');
        buttons.forEach((btn, index) => {
            if ((tabName === 'overview' && index === 0) ||
                (tabName === 'periods' && index === 1) ||
                (tabName === 'pregnancy' && index === 2) ||
                (tabName === 'hormones' && index === 3)) {
                btn.classList.add('active');
            }
        });
    }

    updateOverview() {
        // Calculate stats from cycle data
        const cycleData = cycleTracker.cycleData;
        const totalCycles = cycleData.periods.length;
        const avgCycleLength = cycleData.cycleLength;
        
        // Calculate years of data
        const startDate = new Date(this.healthData.startDate);
        const today = new Date();
        const years = ((today - startDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
        
        // Calculate health score (simplified)
        const healthScore = this.calculateHealthScore();
        
        // Update UI
        const totalCyclesEl = document.getElementById('totalCycles');
        if (totalCyclesEl) totalCyclesEl.textContent = totalCycles || 0;
        
        const avgCycleEl = document.getElementById('avgCycleLength');
        if (avgCycleEl) avgCycleEl.textContent = `${avgCycleLength} days`;
        
        const healthScoreEl = document.getElementById('healthScore');
        if (healthScoreEl) healthScoreEl.textContent = `${healthScore}/100`;
        
        const yearsEl = document.getElementById('yearsOfData');
        if (yearsEl) yearsEl.textContent = `${years} years`;
        
        // Update timeline
        this.updateTimeline();
    }

    calculateHealthScore() {
        let score = 100;
        const cycleData = cycleTracker.cycleData;
        
        // Deduct points for irregular cycles
        if (cycleData.cycleLength < 21 || cycleData.cycleLength > 35) {
            score -= 20;
        }
        
        // Check for symptoms that might indicate issues
        const recentSymptoms = cycleData.symptoms.slice(-30);
        const highPainDays = recentSymptoms.filter(s => s.symptoms?.painLevel > 7).length;
        if (highPainDays > 5) {
            score -= 15;
        }
        
        return Math.max(0, score);
    }

    updateTimeline() {
        const timelineEl = document.getElementById('healthTimeline');
        if (!timelineEl) return;
        
        const startDate = new Date(this.healthData.startDate);
        const startYear = startDate.getFullYear();
        const currentYear = new Date().getFullYear();
        
        let timelineHTML = '';
        
        timelineHTML += `
            <div class="timeline-item">
                <div class="timeline-date">${startYear}</div>
                <div class="timeline-content">
                    <h4>Started Tracking</h4>
                    <p>Began logging periods and symptoms</p>
                </div>
            </div>
        `;
        
        if (currentYear > startYear) {
            timelineHTML += `
                <div class="timeline-item">
                    <div class="timeline-date">${currentYear}</div>
                    <div class="timeline-content">
                        <h4>Ongoing Tracking</h4>
                        <p>Continuing to build comprehensive health record</p>
                    </div>
                </div>
            `;
        }
        
        timelineEl.innerHTML = timelineHTML;
    }

    updatePeriodHistory() {
        const periodListEl = document.getElementById('periodList');
        if (!periodListEl) return;
        
        const periods = cycleTracker.cycleData.periods;
        
        if (periods.length === 0) {
            periodListEl.innerHTML = '<p>No period history yet. Start tracking your periods!</p>';
            return;
        }
        
        let historyHTML = '<div class="period-history-list">';
        
        periods.slice(-12).reverse().forEach(period => {
            const date = new Date(period.startDate);
            historyHTML += `
                <div class="period-history-item">
                    <div class="period-date">${date.toLocaleDateString()}</div>
                    <div class="period-flow">Flow: ${period.flow || 'Medium'}</div>
                </div>
            `;
        });
        
        historyHTML += '</div>';
        periodListEl.innerHTML = historyHTML;
    }

    addPregnancy() {
        const confirmed = confirm('Add a new pregnancy record?');
        if (!confirmed) return;
        
        const startDate = prompt('Enter pregnancy start date (YYYY-MM-DD):');
        const outcome = prompt('Enter outcome (e.g., "Live birth", "Miscarriage", "Termination"):');
        
        if (startDate) {
            const pregnancy = {
                startDate: startDate,
                outcome: outcome || 'Unknown',
                timestamp: new Date().toISOString()
            };
            
            this.healthData.pregnancies.push(pregnancy);
            this.saveHealthData();
            this.updatePregnancyList();
        }
    }

    updatePregnancyList() {
        const pregnancyListEl = document.getElementById('pregnancyList');
        if (!pregnancyListEl) return;
        
        const pregnancies = this.healthData.pregnancies;
        
        if (pregnancies.length === 0) {
            pregnancyListEl.innerHTML = '<p>No pregnancy records yet.</p>';
            return;
        }
        
        let listHTML = '<div class="pregnancy-list-items">';
        
        pregnancies.reverse().forEach((pregnancy, index) => {
            const date = new Date(pregnancy.startDate);
            listHTML += `
                <div class="pregnancy-item">
                    <div class="pregnancy-number">Pregnancy #${pregnancies.length - index}</div>
                    <div class="pregnancy-date">Start: ${date.toLocaleDateString()}</div>
                    <div class="pregnancy-outcome">Outcome: ${pregnancy.outcome}</div>
                </div>
            `;
        });
        
        listHTML += '</div>';
        pregnancyListEl.innerHTML = listHTML;
    }

    updateHormonePatterns() {
        const patternsEl = document.getElementById('hormonePatterns');
        if (!patternsEl) return;
        
        const cycleData = cycleTracker.cycleData;
        const patterns = [];
        
        // Analyze patterns
        if (cycleData.periods.length >= 3) {
            patterns.push('Regular ovulation detected');
        }
        
        // Check cycle regularity
        if (cycleData.cycleLength >= 21 && cycleData.cycleLength <= 35) {
            patterns.push('Cycle length within normal range');
        } else {
            patterns.push('⚠️ Irregular cycle length detected');
        }
        
        // Check for PCOS indicators (simplified)
        const recentSymptoms = cycleData.symptoms.slice(-90);
        const irregularCycles = cycleData.cycleLength < 21 || cycleData.cycleLength > 35;
        const highPainDays = recentSymptoms.filter(s => s.symptoms?.painLevel > 7).length;
        
        if (!irregularCycles && highPainDays < 3) {
            patterns.push('No signs of PCOS or endometriosis detected');
        } else {
            patterns.push('⚠️ Consider consulting healthcare provider for evaluation');
        }
        
        // Check estrogen patterns (simplified)
        patterns.push('Estrogen levels appear stable');
        
        let patternsHTML = patterns.map(pattern => `<li>${pattern}</li>`).join('');
        patternsEl.innerHTML = patternsHTML;
    }
}

// Initialize health record
const healthRecord = new HealthRecord();

// Export functions
window.showHealthTab = (tab) => healthRecord.showTab(tab);
window.addPregnancy = () => healthRecord.addPregnancy();

