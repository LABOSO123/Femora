// Calendar Component with Cycle Tracking
class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.cycleData = this.loadCycleData();
        this.init();
    }

    init() {
        this.renderCalendar();
        this.setupEventListeners();
        this.updatePredictions();
    }

    loadCycleData() {
        const saved = localStorage.getItem('femora_calendar_data');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            periods: [],
            activities: [],
            symptoms: [],
            pills: []
        };
    }

    saveCycleData() {
        localStorage.setItem('femora_calendar_data', JSON.stringify(this.cycleData));
    }

    setupEventListeners() {
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
            this.updatePredictions();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
            this.updatePredictions();
        });
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('calendarMonthYear');
        if (!calendarGrid || !monthYear) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        // Clear previous calendar
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            calendarGrid.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const dayElement = this.createDayElement(date, dateStr, today);
            calendarGrid.appendChild(dayElement);
        }

        // Add empty cells for days after month ends
        const totalCells = calendarGrid.children.length;
        const remainingCells = 42 - totalCells; // 6 rows * 7 days
        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyDay);
        }
    }

    createDayElement(date, dateStr, today) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.dataset.date = dateStr;

        // Check if today
        if (this.isSameDay(date, today)) {
            dayElement.classList.add('today');
        }

        // Add day number
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);

        // Check for events
        const dayEvents = this.getDayEvents(dateStr);
        const cycleInfo = this.getCycleInfo(date);

        // Add period indicator
        if (dayEvents.period || cycleInfo.isPeriod) {
            dayElement.classList.add('period');
        }

        // Add ovulation indicator
        if (cycleInfo.isOvulation) {
            dayElement.classList.add('ovulation');
        }

        // Add fertile window indicator
        if (cycleInfo.isFertile && !cycleInfo.isOvulation) {
            dayElement.classList.add('fertile');
        }

        // Add safe days indicator
        if (cycleInfo.isSafe && !dayEvents.period && !cycleInfo.isFertile && !cycleInfo.isOvulation) {
            dayElement.classList.add('safe');
        }

        // Add activity indicator
        if (dayEvents.activity) {
            dayElement.classList.add('has-activity');
        }

        // Add symptoms indicator
        if (dayEvents.symptoms) {
            dayElement.classList.add('has-symptoms');
        }

        // Add pill indicator
        if (dayEvents.pill) {
            dayElement.classList.add('has-pill');
        }

        // Add event dots
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        if (dayEvents.period || cycleInfo.isPeriod) {
            const dot = document.createElement('span');
            dot.className = 'event-dot period';
            eventsContainer.appendChild(dot);
        }
        if (dayEvents.activity) {
            const dot = document.createElement('span');
            dot.className = 'event-dot activity';
            eventsContainer.appendChild(dot);
        }
        if (dayEvents.symptoms) {
            const dot = document.createElement('span');
            dot.className = 'event-dot symptoms';
            eventsContainer.appendChild(dot);
        }
        if (dayEvents.pill) {
            const dot = document.createElement('span');
            dot.className = 'event-dot pill';
            eventsContainer.appendChild(dot);
        }

        if (eventsContainer.children.length > 0) {
            dayElement.appendChild(eventsContainer);
        }

        // Add click handler
        dayElement.addEventListener('click', () => {
            this.selectDate(dateStr);
        });

        return dayElement;
    }

    getDayEvents(dateStr) {
        return {
            period: this.cycleData.periods.some(p => p.startDate === dateStr || 
                (p.startDate <= dateStr && p.endDate && p.endDate >= dateStr)),
            activity: this.cycleData.activities.some(a => a.date === dateStr),
            symptoms: this.cycleData.symptoms.some(s => s.date === dateStr),
            pill: this.cycleData.pills.some(p => p.date === dateStr)
        };
    }

    getCycleInfo(date) {
        if (!this.cycleData.periods || this.cycleData.periods.length === 0) {
            return { isPeriod: false, isOvulation: false, isFertile: false, isSafe: false };
        }

        // Get the most recent period
        const sortedPeriods = [...this.cycleData.periods].sort((a, b) => 
            new Date(b.startDate) - new Date(a.startDate)
        );
        const lastPeriod = sortedPeriods[0];
        
        if (!lastPeriod) {
            return { isPeriod: false, isOvulation: false, isFertile: false, isSafe: false };
        }

        const periodStart = new Date(lastPeriod.startDate);
        const dateStr = this.formatDate(date);
        const diffDays = Math.floor((date - periodStart) / (1000 * 60 * 60 * 24));
        
        // Default cycle length (can be calculated from historical data)
        const cycleLength = 28;
        const periodLength = lastPeriod.periodLength || 5;
        
        // Calculate cycle day
        const cycleDay = (diffDays % cycleLength) + 1;
        
        // Check if in period
        const isPeriod = diffDays >= 0 && diffDays < periodLength;
        
        // Calculate ovulation (typically day 14 of cycle)
        const ovulationDay = Math.floor(cycleLength / 2);
        const isOvulation = cycleDay === ovulationDay;
        
        // Fertile window (5 days before ovulation to 1 day after)
        const fertileStart = ovulationDay - 5;
        const fertileEnd = ovulationDay + 1;
        const isFertile = cycleDay >= fertileStart && cycleDay <= fertileEnd && !isPeriod;
        
        // Safe days (not period, not fertile)
        const isSafe = !isPeriod && !isFertile && !isOvulation;

        return { isPeriod, isOvulation, isFertile, isSafe, cycleDay };
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        // Highlight selected date
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
            if (day.dataset.date === dateStr) {
                day.classList.add('selected');
            }
        });
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    logPeriod(startDate, endDate, flow = 'medium') {
        const period = {
            startDate: startDate,
            endDate: endDate || this.addDays(startDate, 4),
            flow: flow,
            periodLength: this.calculateDaysBetween(startDate, endDate || this.addDays(startDate, 4))
        };
        
        // Remove overlapping periods
        this.cycleData.periods = this.cycleData.periods.filter(p => 
            !this.datesOverlap(p.startDate, p.endDate, period.startDate, period.endDate)
        );
        
        this.cycleData.periods.push(period);
        this.saveCycleData();
        this.renderCalendar();
        this.updatePredictions();
    }

    logActivity(date, type = 'protected', contraceptive = 'none') {
        const activity = {
            date: date,
            type: type,
            contraceptive: contraceptive,
            timestamp: new Date().toISOString()
        };
        
        // Remove existing entry for this date
        this.cycleData.activities = this.cycleData.activities.filter(a => a.date !== date);
        this.cycleData.activities.push(activity);
        this.saveCycleData();
        this.renderCalendar();
    }

    logSymptoms(date, symptoms) {
        const symptomEntry = {
            date: date,
            symptoms: symptoms,
            timestamp: new Date().toISOString()
        };
        
        // Remove existing entry for this date
        this.cycleData.symptoms = this.cycleData.symptoms.filter(s => s.date !== date);
        this.cycleData.symptoms.push(symptomEntry);
        this.saveCycleData();
        this.renderCalendar();
    }

    logPill(date, type = 'pill') {
        const pill = {
            date: date,
            type: type,
            timestamp: new Date().toISOString()
        };
        
        // Remove existing entry for this date
        this.cycleData.pills = this.cycleData.pills.filter(p => p.date !== date);
        this.cycleData.pills.push(pill);
        this.saveCycleData();
        this.renderCalendar();
    }

    updatePredictions() {
        const predictionsEl = document.getElementById('calendarPredictions');
        if (!predictionsEl) return;

        if (this.cycleData.periods.length === 0) {
            predictionsEl.innerHTML = '<p style="text-align: center; color: var(--text-light);">Log your period dates to see predictions</p>';
            return;
        }

        const sortedPeriods = [...this.cycleData.periods].sort((a, b) => 
            new Date(b.startDate) - new Date(a.startDate)
        );
        const lastPeriod = sortedPeriods[0];
        const periodStart = new Date(lastPeriod.startDate);
        const today = new Date();
        
        // Calculate average cycle length from periods
        let cycleLength = 28;
        if (this.cycleData.periods.length > 1) {
            const cycles = [];
            for (let i = 0; i < this.cycleData.periods.length - 1; i++) {
                const start1 = new Date(this.cycleData.periods[i].startDate);
                const start2 = new Date(this.cycleData.periods[i + 1].startDate);
                const diff = Math.floor((start1 - start2) / (1000 * 60 * 60 * 24));
                if (diff > 0 && diff < 45) cycles.push(diff);
            }
            if (cycles.length > 0) {
                cycleLength = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
            }
        }

        const periodLength = lastPeriod.periodLength || 5;
        const diffDays = Math.floor((today - periodStart) / (1000 * 60 * 60 * 24));
        const cycleDay = (diffDays % cycleLength) + 1;
        
        // Calculate next period
        const nextPeriodDate = new Date(periodStart);
        nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);
        const daysUntilPeriod = Math.ceil((nextPeriodDate - today) / (1000 * 60 * 60 * 24));
        
        // Calculate ovulation
        const ovulationDay = Math.floor(cycleLength / 2);
        const ovulationDate = new Date(periodStart);
        ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
        const daysUntilOvulation = Math.ceil((ovulationDate - today) / (1000 * 60 * 60 * 24));
        
        // Calculate fertile window
        const fertileStart = ovulationDay - 5;
        const fertileEnd = ovulationDay + 1;
        const fertileStartDate = new Date(periodStart);
        fertileStartDate.setDate(fertileStartDate.getDate() + fertileStart);
        const fertileEndDate = new Date(periodStart);
        fertileEndDate.setDate(fertileEndDate.getDate() + fertileEnd);
        
        // Determine current phase
        let currentPhase = '';
        if (cycleDay <= periodLength) {
            currentPhase = 'Menstrual Phase';
        } else if (cycleDay <= 13) {
            currentPhase = 'Follicular Phase';
        } else if (cycleDay <= 16) {
            currentPhase = 'Ovulatory Phase';
        } else {
            currentPhase = 'Luteal Phase';
        }

        const predictionsHTML = `
            <h4>📊 Cycle Predictions</h4>
            <div class="prediction-item">
                <span class="prediction-label">Current Phase:</span>
                <span class="prediction-value">${currentPhase} (Day ${cycleDay})</span>
            </div>
            <div class="prediction-item">
                <span class="prediction-label">Next Period:</span>
                <span class="prediction-value">${daysUntilPeriod > 0 ? `In ${daysUntilPeriod} days` : 'Expected soon'}</span>
            </div>
            <div class="prediction-item">
                <span class="prediction-label">Ovulation:</span>
                <span class="prediction-value">${daysUntilOvulation > 0 ? `In ${daysUntilOvulation} days` : daysUntilOvulation === 0 ? 'Today!' : `${Math.abs(daysUntilOvulation)} days ago`}</span>
            </div>
            <div class="prediction-item">
                <span class="prediction-label">Fertile Window:</span>
                <span class="prediction-value">${this.formatDate(fertileStartDate)} - ${this.formatDate(fertileEndDate)}</span>
            </div>
            <div class="prediction-item">
                <span class="prediction-label">Best Time to Get Pregnant:</span>
                <span class="prediction-value">${this.formatDate(fertileStartDate)} - ${this.formatDate(fertileEndDate)}</span>
            </div>
            <div class="prediction-item">
                <span class="prediction-label">Safe Days:</span>
                <span class="prediction-value">Days 1-${fertileStart - 1}, ${fertileEnd + 1}-${cycleLength}</span>
            </div>
        `;

        predictionsEl.innerHTML = predictionsHTML;
    }

    addDays(dateStr, days) {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return this.formatDate(date);
    }

    calculateDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    datesOverlap(start1, end1, start2, end2) {
        const s1 = new Date(start1);
        const e1 = new Date(end1 || start1);
        const s2 = new Date(start2);
        const e2 = new Date(end2 || start2);
        return s1 <= e2 && s2 <= e1;
    }
}

// Initialize calendar
let calendar;
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
        calendar = new Calendar();
        window.calendar = calendar;
    }, 100);
});

// Quick Log Functions
function openQuickLog(type) {
    const modal = document.getElementById('quickLogModal');
    const title = document.getElementById('quickLogTitle');
    const form = document.getElementById('quickLogForm');
    
    if (!modal || !title || !form) return;

    const selectedDate = calendar?.selectedDate || new Date().toISOString().split('T')[0];
    
    let formHTML = '';
    
    switch(type) {
        case 'period':
            title.textContent = 'Log Period';
            formHTML = `
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="date" id="periodStartDate" class="form-input" value="${selectedDate}">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="date" id="periodEndDate" class="form-input" value="${selectedDate}">
                </div>
                <div class="form-group">
                    <label>Flow</label>
                    <select id="periodFlow" class="form-input">
                        <option value="light">Light</option>
                        <option value="medium" selected>Medium</option>
                        <option value="heavy">Heavy</option>
                    </select>
                </div>
                <button class="btn-primary btn-large" onclick="saveQuickLog('period')">Save Period</button>
            `;
            break;
        case 'activity':
            title.textContent = 'Log Sexual Activity';
            formHTML = `
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="activityDate" class="form-input" value="${selectedDate}">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="activityType" class="form-input">
                        <option value="protected">Protected</option>
                        <option value="unprotected">Unprotected</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Contraceptive Used</label>
                    <select id="activityContraceptive" class="form-input">
                        <option value="condom">Condom</option>
                        <option value="pill">Birth Control Pill</option>
                        <option value="none">None</option>
                    </select>
                </div>
                <button class="btn-primary btn-large" onclick="saveQuickLog('activity')">Save Activity</button>
            `;
            break;
        case 'symptoms':
            title.textContent = 'Log Symptoms';
            formHTML = `
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="symptomDate" class="form-input" value="${selectedDate}">
                </div>
                <div class="form-group">
                    <label>Symptoms (comma separated)</label>
                    <input type="text" id="symptomText" class="form-input" placeholder="e.g., cramps, headache, bloating">
                </div>
                <button class="btn-primary btn-large" onclick="saveQuickLog('symptoms')">Save Symptoms</button>
            `;
            break;
        case 'pill':
            title.textContent = 'Log Pill/Contraceptive';
            formHTML = `
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="pillDate" class="form-input" value="${selectedDate}">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="pillType" class="form-input">
                        <option value="pill">Birth Control Pill</option>
                        <option value="injection">Injection</option>
                        <option value="implant">Implant</option>
                        <option value="iud">IUD</option>
                    </select>
                </div>
                <button class="btn-primary btn-large" onclick="saveQuickLog('pill')">Save</button>
            `;
            break;
    }
    
    form.innerHTML = formHTML;
    modal.style.display = 'block';
}

function closeQuickLogModal() {
    const modal = document.getElementById('quickLogModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveQuickLog(type) {
    if (!calendar) return;

    switch(type) {
        case 'period':
            const startDate = document.getElementById('periodStartDate').value;
            const endDate = document.getElementById('periodEndDate').value;
            const flow = document.getElementById('periodFlow').value;
            calendar.logPeriod(startDate, endDate, flow);
            break;
        case 'activity':
            const activityDate = document.getElementById('activityDate').value;
            const activityType = document.getElementById('activityType').value;
            const contraceptive = document.getElementById('activityContraceptive').value;
            calendar.logActivity(activityDate, activityType, contraceptive);
            break;
        case 'symptoms':
            const symptomDate = document.getElementById('symptomDate').value;
            const symptomText = document.getElementById('symptomText').value;
            calendar.logSymptoms(symptomDate, { notes: symptomText });
            break;
        case 'pill':
            const pillDate = document.getElementById('pillDate').value;
            const pillType = document.getElementById('pillType').value;
            calendar.logPill(pillDate, pillType);
            break;
    }
    
    closeQuickLogModal();
    alert('Saved successfully!');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('quickLogModal');
    if (e.target === modal) {
        closeQuickLogModal();
    }
});

// Export functions
window.openQuickLog = openQuickLog;
window.closeQuickLogModal = closeQuickLogModal;
window.saveQuickLog = saveQuickLog;

