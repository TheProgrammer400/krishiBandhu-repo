class FarmerDashboard {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.events = this.loadEvents();
        this.apiKey = ''; // Add your OpenWeatherMap API key here

        this.initializeEventListeners();
        this.renderCalendar();
        this.loadWeatherData();
        this.updateStats();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Menu toggle for mobile
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                !sidebar.contains(e.target) &&
                !menuToggle.contains(e.target) &&
                sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        });

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active class from all items
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                // Add active class to clicked item
                link.parentElement.classList.add('active');

                // Close mobile menu
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('show');
                }
            });
        });

        // Logout button
        document.querySelector('.logout-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                alert('Logout functionality would be implemented here');
            }
        });

        // Weather refresh
        document.getElementById('refreshWeather').addEventListener('click', () => {
            this.loadWeatherData();
        });

        // Calendar controls
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Quick add event
        const eventInput = document.getElementById('eventInput');
        const addEventBtn = document.getElementById('addEvent');

        addEventBtn.addEventListener('click', () => {
            this.quickAddEvent();
        });

        eventInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.quickAddEvent();
            }
        });

        // Modal controls
        const modal = document.getElementById('eventModal');
        const modalClose = document.getElementById('modalClose');
        const modalCancel = document.getElementById('modalCancel');
        const modalSave = document.getElementById('modalSave');

        modalClose.addEventListener('click', () => this.closeModal());
        modalCancel.addEventListener('click', () => this.closeModal());
        modalSave.addEventListener('click', () => this.saveEvent());

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    // Weather functionality
    async loadWeatherData() {
        const weatherIcon = document.getElementById('weatherIcon');
        const temperature = document.getElementById('temperature');
        const condition = document.getElementById('condition');
        const location = document.getElementById('location');
        const humidity = document.getElementById('humidity');
        const windSpeed = document.getElementById('windSpeed');
        const feelsLike = document.getElementById('feelsLike');

        try {
            // Show loading state
            temperature.textContent = 'Loading...';
            condition.textContent = 'Fetching weather data...';

            if (!this.apiKey) {
                // Demo data when no API key is provided
                this.showDemoWeatherData();
                return;
            }

            // Get user's location
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;

            // Fetch weather data
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) {
                throw new Error('Weather data fetch failed');
            }

            const data = await response.json();

            // Update UI with real weather data
            weatherIcon.textContent = this.getWeatherIcon(data.weather[0].main);
            temperature.textContent = `${Math.round(data.main.temp)}°C`;
            condition.textContent = data.weather[0].description;
            location.textContent = `${data.name}, ${data.sys.country}`;
            humidity.textContent = `${data.main.humidity}%`;
            windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
            feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showDemoWeatherData();
        }
    }

    showDemoWeatherData() {
        // Demo weather data for demonstration
        document.getElementById('weatherIcon').textContent = '☀️';
        document.getElementById('temperature').textContent = '24°C';
        document.getElementById('condition').textContent = 'Sunny';
        document.getElementById('location').textContent = 'Farm Location';
        document.getElementById('humidity').textContent = '65%';
        document.getElementById('windSpeed').textContent = '12 km/h';
        document.getElementById('feelsLike').textContent = '26°C';
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: true
            });
        });
    }

    getWeatherIcon(condition) {
        const icons = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        return icons[condition] || '🌤️';
    }

    // Calendar functionality
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = document.getElementById('currentMonth');

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        currentMonth.textContent = `${monthNames[month]} ${year}`;

        // Clear calendar
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day header';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        // Add previous month's trailing days
        const prevMonth = new Date(year, month, 0);
        const daysInPrevMonth = prevMonth.getDate();

        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayElement = this.createCalendarDay(
                daysInPrevMonth - i,
                year,
                month - 1,
                true
            );
            calendarGrid.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createCalendarDay(day, year, month, false);
            calendarGrid.appendChild(dayElement);
        }

        // Add next month's leading days
        const totalCells = calendarGrid.children.length - 7; // Subtract headers
        const remainingCells = 42 - totalCells; // 6 rows × 7 days - headers

        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createCalendarDay(
                day,
                year,
                month + 1,
                true
            );
            calendarGrid.appendChild(dayElement);
        }
    }

    createCalendarDay(day, year, month, otherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        if (otherMonth) {
            dayElement.classList.add('other-month');
        }

        const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        // Check if this is today
        const today = new Date();
        if (year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate() &&
            !otherMonth) {
            dayElement.classList.add('today');
        }

        // Check if this day has events
        if (this.events[dateKey]) {
            dayElement.classList.add('has-event');
            dayElement.title = this.events[dateKey].map(e => e.title).join('\n');
        }

        // Add click handler
        if (!otherMonth) {
            dayElement.addEventListener('click', () => {
                this.selectedDate = dateKey;
                this.showEventModal();
            });
        }

        return dayElement;
    }

    showEventModal() {
        const modal = document.getElementById('eventModal');
        const selectedDateSpan = document.getElementById('selectedDate');

        selectedDateSpan.textContent = new Date(this.selectedDate).toLocaleDateString();
        modal.classList.add('show');

        // Clear previous input
        document.getElementById('modalEventTitle').value = '';
        document.getElementById('modalEventDescription').value = '';
        document.getElementById('modalEventTitle').focus();
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        modal.classList.remove('show');
    }

    saveEvent() {
        const title = document.getElementById('modalEventTitle').value.trim();
        const description = document.getElementById('modalEventDescription').value.trim();

        if (!title) {
            alert('Please enter an event title');
            return;
        }

        if (!this.events[this.selectedDate]) {
            this.events[this.selectedDate] = [];
        }

        this.events[this.selectedDate].push({
            title,
            description,
            timestamp: new Date().toISOString()
        });

        this.saveEvents();
        this.renderCalendar();
        this.closeModal();
    }

    quickAddEvent() {
        const input = document.getElementById('eventInput');
        const title = input.value.trim();

        if (!title) return;

        const today = new Date();
        const dateKey = `${today.getFullYear()}-${(today.getMonth()).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

        if (!this.events[dateKey]) {
            this.events[dateKey] = [];
        }

        this.events[dateKey].push({
            title,
            description: '',
            timestamp: new Date().toISOString()
        });

        this.saveEvents();
        this.renderCalendar();
        input.value = '';
    }

    // Stats functionality
    updateStats() {
        // Simulate updating stats with some animation
        const stats = {
            totalCrops: Math.floor(Math.random() * 30) + 20,
            upcomingTasks: Math.floor(Math.random() * 10) + 5,
            activeFields: Math.floor(Math.random() * 15) + 10
        };

        this.animateCounter('totalCrops', stats.totalCrops);
        this.animateCounter('upcomingTasks', stats.upcomingTasks);
        this.animateCounter('activeFields', stats.activeFields);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const steps = Math.abs(targetValue - currentValue);
        const stepTime = Math.max(1000 / steps, 50);

        let current = currentValue;
        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;

            if (current === targetValue) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    // Data persistence
    loadEvents() {
        const saved = localStorage.getItem('farmer-dashboard-events');
        return saved ? JSON.parse(saved) : {};
    }

    saveEvents() {
        localStorage.setItem('farmer-dashboard-events', JSON.stringify(this.events));
    }

    // Utility methods
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FarmerDashboard();
});

// Additional utility functions for enhanced functionality
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#FF8C42',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '1001',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '300px',
        animation: 'slideInRight 0.3s ease-out'
    });

    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = 'background:none;border:none;color:white;font-size:18px;cursor:pointer;margin-left:8px;';
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Weather forecast enhancement
class WeatherForecast {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    async getForecast(lat, lon) {
        const cacheKey = `${lat}-${lon}`;
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
            );

            if (!response.ok) throw new Error('Forecast fetch failed');

            const data = await response.json();
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Forecast error:', error);
            return null;
        }
    }

    getWeatherAdvice(condition, temp, humidity) {
        const advice = [];

        if (condition.includes('rain')) {
            advice.push('🌧️ Good day for indoor tasks. Avoid heavpyy field work.');
        }

        if (temp > 30) {
            advice.push('🌡️ Hot day ahead. Ensure proper hydration for workers.');
        }

        if (temp < 5) {
            advice.push('❄️ Cold weather. Protect sensitive crops from frost.');
        }

        if (humidity > 80) {
            advice.push('💧 High humidity. Monitor crops for fungal diseases.');
        }

        if (humidity < 30) {
            advice.push('🌵 Low humidity. Consider additional watering.');
        }

        return advice.length > 0 ? advice : ['✅ Good conditions for farm work!'];
    }
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FarmerDashboard, WeatherForecast, showNotification };
}