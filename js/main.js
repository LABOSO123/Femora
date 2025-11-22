// Main Application Controller
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚺 Femora - For every stage of her life');
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupMobileMenu();
    setupFormHandlers();
    setupSliders();
    setupMoodButtons();
    
    // Check if landing page should be shown
    const hasSeenLanding = sessionStorage.getItem('femora_landing_seen');
    if (!hasSeenLanding) {
        // Show landing page, hide navbar and dashboard
        document.getElementById('mainNavbar').style.display = 'none';
        document.getElementById('dashboard').classList.remove('active');
    } else {
        // Hide landing page, show navbar and dashboard
        const landingPage = document.getElementById('landingPage');
        if (landingPage) {
            landingPage.classList.add('hidden');
        }
        document.getElementById('mainNavbar').style.display = 'flex';
        document.getElementById('dashboard').classList.add('active');
        generateInsight();
        cycleTracker.updateTodaySymptoms();
    }
}

function enterApp() {
    const landingPage = document.getElementById('landingPage');
    const navbar = document.getElementById('mainNavbar');
    const dashboard = document.getElementById('dashboard');
    
    // Mark landing as seen
    sessionStorage.setItem('femora_landing_seen', 'true');
    
    // Hide landing page
    if (landingPage) {
        landingPage.style.opacity = '0';
        setTimeout(() => {
            landingPage.classList.add('hidden');
        }, 800);
    }
    
    // Show navbar and dashboard
    setTimeout(() => {
        if (navbar) navbar.style.display = 'flex';
        if (dashboard) {
            dashboard.classList.add('active');
            generateInsight();
            cycleTracker.updateTodaySymptoms();
        }
    }, 500);
}

// Navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Initialize calendar if tracking section is shown
    if (sectionId === 'tracking' && window.calendar) {
        window.calendar.renderCalendar();
        window.calendar.updatePredictions();
    }
    
    // Close mobile menu if open
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && window.innerWidth <= 768) {
        navLinks.style.display = 'none';
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            const isVisible = navLinks.style.display === 'flex';
            navLinks.style.display = isVisible ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    }
}

// Form handlers
function setupFormHandlers() {
    // Set today's date as default
    const dateInput = document.getElementById('trackingDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    const activityDateInput = document.getElementById('activityDate');
    if (activityDateInput) {
        activityDateInput.value = new Date().toISOString().split('T')[0];
    }
}

// Slider handlers
function setupSliders() {
    const painSlider = document.getElementById('painLevel');
    if (painSlider) {
        painSlider.addEventListener('input', (e) => {
            const valueEl = document.getElementById('painValue');
            if (valueEl) valueEl.textContent = e.target.value;
        });
    }
    
    const energySlider = document.getElementById('energyLevel');
    if (energySlider) {
        energySlider.addEventListener('input', (e) => {
            const valueEl = document.getElementById('energyValue');
            if (valueEl) valueEl.textContent = e.target.value;
        });
    }
}

// Mood button handlers
function setupMoodButtons() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Save symptoms
function saveSymptoms() {
    const date = document.getElementById('trackingDate').value;
    const periodStatus = document.querySelector('input[name="periodStatus"]:checked')?.value || 'none';
    const painLevel = parseInt(document.getElementById('painLevel').value) || 0;
    const painTypes = Array.from(document.querySelectorAll('.tracking-card:nth-of-type(2) input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    const mood = document.querySelector('.mood-btn.active')?.dataset.mood || null;
    const energyLevel = parseInt(document.getElementById('energyLevel').value) || 5;
    const sleepHours = parseInt(document.getElementById('sleepHours').value) || 8;
    const sleepQuality = document.getElementById('sleepQuality').value;
    const cravings = document.getElementById('cravings').value;
    const otherSymptoms = Array.from(document.querySelectorAll('.tracking-card:last-of-type input[type="checkbox"]:checked'))
        .map(cb => cb.value);
    
    const symptoms = {
        periodStatus: periodStatus,
        painLevel: painLevel,
        painTypes: painTypes,
        mood: mood,
        energyLevel: energyLevel,
        sleepHours: sleepHours,
        sleepQuality: sleepQuality,
        cravings: cravings,
        otherSymptoms: otherSymptoms
    };
    
    cycleTracker.logSymptoms(date, symptoms);
    
    // Show success message
    alert('Symptoms saved successfully!');
    
    // Reset form (optional)
    // document.querySelector('.tracking-form').reset();
}

// Generate AI Insight
function generateInsight() {
    const insightEl = document.getElementById('aiInsight');
    if (!insightEl) return;
    
    const phase = cycleTracker.getCurrentPhase();
    const cycleDay = cycleTracker.calculateCycleDay();
    const todaySymptoms = cycleTracker.cycleData.symptoms.find(
        s => s.date === new Date().toISOString().split('T')[0]
    );
    
    let insight = '';
    
    // Generate insight based on phase and symptoms
    if (phase.name === 'Menstrual') {
        if (todaySymptoms?.symptoms?.painLevel > 5) {
            insight = 'Your symptoms suggest higher pain levels during your period. Consider iron-rich foods like sukuma wiki, spinach, or beans. Heat therapy and gentle movement may help.';
        } else {
            insight = 'You\'re in your menstrual phase. Focus on iron-rich foods like sukuma wiki, omena, and njahi to replenish what you\'ve lost. Stay hydrated and rest as needed.';
        }
    } else if (phase.name === 'Follicular') {
        insight = 'Your body is preparing for ovulation. This is a great time for high-energy activities and fresh, nutrient-dense foods to support hormone production.';
    } else if (phase.name === 'Ovulatory') {
        insight = 'You\'re likely ovulating. This is your most fertile window. Consider anti-inflammatory foods like fish, berries, and leafy greens to support this phase.';
    } else if (phase.name === 'Luteal') {
        if (todaySymptoms?.symptoms?.mood === 'irritable' || todaySymptoms?.symptoms?.mood === 'anxious') {
            insight = 'PMS symptoms detected. Focus on complex carbs, magnesium-rich foods, and B vitamins. Dark chocolate (in moderation) can help with mood and cravings.';
        } else {
            insight = 'You\'re in the luteal phase. Support your body with complex carbohydrates, calcium, and magnesium to reduce PMS symptoms and stabilize mood.';
        }
    }
    
    // Add hormonal insights if symptoms suggest issues
    if (todaySymptoms?.symptoms) {
        const symptoms = todaySymptoms.symptoms;
        if (symptoms.energyLevel < 3 && phase.name !== 'Menstrual') {
            insight += ' Low energy levels may indicate hormonal fluctuations. Consider consulting a healthcare provider if this persists.';
        }
    }
    
    if (!insight) {
        insight = 'Continue tracking your symptoms. The more data you log, the better insights we can provide about your cycle and health.';
    }
    
    insightEl.innerHTML = `<p>${insight}</p>`;
}

// Premium Modal
function openPremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closePremiumModal() {
    const modal = document.getElementById('premiumModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('premiumModal');
    if (e.target === modal) {
        closePremiumModal();
    }
});

// Premium button handler
const premiumBtn = document.getElementById('premiumBtn');
if (premiumBtn) {
    premiumBtn.addEventListener('click', openPremiumModal);
}

// Export functions for global access
window.showSection = showSection;
window.saveSymptoms = saveSymptoms;
window.generateInsight = generateInsight;
window.openPremiumModal = openPremiumModal;
window.closePremiumModal = closePremiumModal;
window.enterApp = enterApp;
