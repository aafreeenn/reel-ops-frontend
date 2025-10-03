// Main Application Logic
const App = {
    buttonStates: {},
    currentButtonIndex: null,
    timeslotInterval: null,
    
    // Initialize the app
    init: function() {
        Router.init();
    },
    
    // Login Page Functions
    selectUserType: function(type) {
        sessionStorage.setItem('userType', type);
        Router.navigate('password');
    },
    
    // Password Page Functions
    handleLogin: async function(event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const userType = sessionStorage.getItem('userType');
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    userType: userType,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                sessionStorage.setItem('authenticated', 'true');
                Router.navigate('timeslot');
            } else {
                errorMessage.textContent = 'Invalid password. Please try again.';
            }
        } catch (error) {
            errorMessage.textContent = 'Connection error. Please try again.';
            console.error('Login error:', error);
        }
    },
    
    // Timeslot Page Functions
    initTimeslotPage: function() {
        this.updateTimeslots();
        this.timeslotInterval = setInterval(() => this.updateTimeslots(), 60000);
    },
    
    updateTimeslots: function() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        
        // Update each timeslot button
        Object.keys(CONFIG.TIMESLOTS).forEach(slot => {
            const button = document.getElementById(`slot${slot}`);
            if (button) {
                const config = CONFIG.TIMESLOTS[slot];
                button.disabled = !(totalMinutes >= config.start && totalMinutes <= config.end);
            }
        });
        
        // Update current time display
        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) {
            timeDisplay.textContent = now.toLocaleTimeString();
        }
    },
    
    selectTimeslot: function(slot) {
        sessionStorage.setItem('timeslot', slot);
        Router.navigate('operations');
    },
    
    logout: async function() {
        try {
            await fetch(`${CONFIG.API_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        if (this.timeslotInterval) {
            clearInterval(this.timeslotInterval);
        }
        
        sessionStorage.clear();
        Router.navigate('login');
    },
    
    // Operations Page Functions
    initOperationsPage: function() {
        this.buttonStates = {};
        const grid = document.getElementById('operationsGrid');
        
        CONFIG.BUTTON_NAMES.forEach((name, index) => {
            const button = document.createElement('button');
            button.className = 'operation-btn';
            button.textContent = name;
            button.dataset.index = index;
            button.onclick = () => this.openModal(index);
            grid.appendChild(button);
            
            this.buttonStates[index] = { name: name, status: 'Not Set' };
        });
        
        // Close modal when clicking outside
        window.onclick = (event) => {
            const modal = document.getElementById('statusModal');
            if (event.target === modal) {
                this.closeModal();
            }
        };
    },
    
    openModal: function(index) {
        this.currentButtonIndex = index;
        document.getElementById('modalButtonName').textContent = CONFIG.BUTTON_NAMES[index];
        document.getElementById('statusModal').style.display = 'flex';
    },
    
    closeModal: function() {
        document.getElementById('statusModal').style.display = 'none';
        this.currentButtonIndex = null;
    },
    
    setStatus: function(status) {
        if (this.currentButtonIndex !== null) {
            this.buttonStates[this.currentButtonIndex].status = status;
            const button = document.querySelector(`[data-index="${this.currentButtonIndex}"]`);
            
            button.classList.remove('status-active', 'status-inactive');
            if (status === 'Active') {
                button.classList.add('status-active');
            } else if (status === 'In-Active') {
                button.classList.add('status-inactive');
            }
            
            this.closeModal();
        }
    },
    
    saveOperations: async function() {
        const buttonStatesArray = Object.values(this.buttonStates);
        const timeslot = sessionStorage.getItem('timeslot');
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    buttonStates: buttonStatesArray,
                    timeslot: timeslot
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Operations saved successfully!');
            } else {
                alert('Error saving operations: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Connection error. Please try again.');
            console.error('Save error:', error);
        }
    },
    
    downloadReport: async function() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/download`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reel_operations.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('No data available to download.');
            }
        } catch (error) {
            alert('Error downloading report.');
            console.error('Download error:', error);
        }
    },
    
    deleteLogs: async function() {
        if (!confirm('Are you sure you want to delete all logs? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/delete`, {
                method: 'POST',
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Logs deleted successfully!');
            } else {
                alert('Error deleting logs: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error deleting logs.');
            console.error('Delete error:', error);
        }
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}