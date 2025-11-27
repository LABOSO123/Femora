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
    
    // ALWAYS show landing page on initial load - ignore sessionStorage
    // Only hide it if user explicitly clicks "Enter App"
    const landingPage = document.getElementById('landingPage');
    const navbar = document.getElementById('mainNavbar');
    const dashboard = document.getElementById('dashboard');
    
    // Check if user has already entered the app in this session
    const hasEnteredApp = sessionStorage.getItem('femora_landing_seen');
    
    if (!hasEnteredApp) {
        // Show landing page, hide navbar and dashboard
        if (landingPage) {
            landingPage.classList.remove('hidden');
            landingPage.style.opacity = '1';
            landingPage.style.display = 'flex';
        }
        if (navbar) navbar.style.display = 'none';
        if (dashboard) dashboard.classList.remove('active');
    } else {
        // User has already entered - show app, hide splash
        if (landingPage) {
            landingPage.classList.add('hidden');
        }
        if (navbar) navbar.style.display = 'flex';
        if (dashboard) {
            dashboard.classList.add('active');
            generateInsight();
            cycleTracker.updateTodaySymptoms();
        }
        // Ensure navigation is set up
        setTimeout(setupNavigation, 100);
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
        if (navbar) {
            navbar.style.display = 'flex';
        }
        if (dashboard) {
            dashboard.classList.add('active');
            generateInsight();
            cycleTracker.updateTodaySymptoms();
        }
        // Ensure navigation is set up after navbar is visible
        setTimeout(setupNavigation, 100);
    }, 500);
}

// Navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (navLinks.length === 0) {
        console.warn('No navigation links found, retrying...');
        // Try again after a short delay in case navbar isn't loaded yet
        setTimeout(setupNavigation, 200);
        return;
    }
    
    console.log(`Setting up navigation for ${navLinks.length} links`);
    
    // Use event delegation on the nav-links container for better reliability
    const navLinksContainer = document.querySelector('.nav-links');
    if (navLinksContainer) {
        // Remove any existing listener
        navLinksContainer.removeEventListener('click', handleNavClick);
        // Add new listener
        navLinksContainer.addEventListener('click', handleNavClick);
    }
    
    // Also set up individual link listeners as backup
    navLinks.forEach((link) => {
        // Remove existing listeners by cloning
        if (link.dataset.navSetup !== 'true') {
            link.dataset.navSetup = 'true';
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const href = this.getAttribute('href');
                if (!href || !href.startsWith('#')) {
                    console.warn('Nav link has invalid href:', href);
                    return;
                }
                
                const sectionId = href.substring(1);
                console.log('Navigation clicked:', sectionId);
                
                showSection(sectionId);
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        }
    });
    
    console.log(`✅ Navigation setup complete: ${navLinks.length} links configured`);
}

// Event delegation handler for navigation
function handleNavClick(e) {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) {
        return;
    }
    
    const sectionId = href.substring(1);
    console.log('Navigation clicked (delegation):', sectionId);
    
    showSection(sectionId);
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
}

function showSection(sectionId) {
    if (!sectionId) {
        console.error('showSection called without sectionId');
        return;
    }
    
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log('Section activated:', sectionId);
    } else {
        console.error('Section not found:', sectionId);
    }
    
    // Initialize calendar if tracking section is shown
    if (sectionId === 'tracking' && window.calendar) {
        window.calendar.renderCalendar();
        window.calendar.updatePredictions();
    }
    
    // Close mobile menu if open (use class-based approach)
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.remove('active');
    }
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile menu toggle
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
        
        // Close menu when clicking a nav link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
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
async function generateInsight() {
    const insightEl = document.getElementById('aiInsight');
    if (!insightEl) return;
    
    // Show loading state
    insightEl.innerHTML = '<p>🤖 Generating personalized insight...</p>';
    
    const phase = cycleTracker.getCurrentPhase();
    const cycleDay = cycleTracker.calculateCycleDay();
    const todaySymptoms = cycleTracker.cycleData.symptoms.find(
        s => s.date === new Date().toISOString().split('T')[0]
    );
    
    try {
        // Call backend API
        const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3001'
            : ''; // Use relative URL in production
        
        const response = await fetch(`${API_URL}/api/ai/insight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phase: phase.name,
                cycleDay: cycleDay,
                symptoms: todaySymptoms?.symptoms || null,
                cycleData: cycleTracker.cycleData
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        if (data.success && data.insight) {
            insightEl.innerHTML = `<p>${data.insight}</p>`;
        } else {
            // Use fallback insight
            insightEl.innerHTML = `<p>${data.insight || getFallbackInsight(phase, todaySymptoms)}</p>`;
        }
    } catch (error) {
        console.error('Error generating AI insight:', error);
        // Fallback to local insight generation
        const fallbackInsight = getFallbackInsight(phase, todaySymptoms);
        insightEl.innerHTML = `<p>${fallbackInsight}</p>`;
    }
}

// Fallback insight generator (when API is unavailable)
function getFallbackInsight(phase, todaySymptoms) {
    let insight = '';
    
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
    
    if (todaySymptoms?.symptoms) {
        const symptoms = todaySymptoms.symptoms;
        if (symptoms.energyLevel < 3 && phase.name !== 'Menstrual') {
            insight += ' Low energy levels may indicate hormonal fluctuations. Consider consulting a healthcare provider if this persists.';
        }
    }
    
    if (!insight) {
        insight = 'Continue tracking your symptoms. The more data you log, the better insights we can provide about your cycle and health.';
    }
    
    return insight;
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

// Global click handler for navigation (fallback)
document.addEventListener('click', (e) => {
    // Check if clicked element is a nav link
    const navLink = e.target.closest('.nav-link');
    if (navLink && navLink.hasAttribute('href')) {
        const href = navLink.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const sectionId = href.substring(1);
            console.log('Navigation clicked (global handler):', sectionId);
            showSection(sectionId);
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            navLink.classList.add('active');
        }
    }
});

// Export functions for global access
window.showSection = showSection;
window.saveSymptoms = saveSymptoms;
window.generateInsight = generateInsight;
window.openPremiumModal = openPremiumModal;
window.closePremiumModal = closePremiumModal;
window.enterApp = enterApp;
