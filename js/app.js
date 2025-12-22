// Main Application Logic
const App = {
    buttonStates: {},
    currentButtonIndex: null,
    timeslotInterval: null,

    // Initialize the app
    init: function () {
        Router.init();

        // Attach modal button events
        const confirmBtn = document.getElementById('confirmSaveBtn');
        const cancelBtn = document.getElementById('cancelSaveBtn');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmSave());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeSaveModal());
        }
    },

    // Login Page Functions
    selectUserType: function (type) {
        sessionStorage.setItem('userType', type);
        Router.navigate('password');
    },

    handleLogin: async function (event) {
        event.preventDefault();
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const userType = sessionStorage.getItem('userType');

        try {
            const response = await fetch(`${CONFIG.API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Necessary for Cross-Origin Cookies
                body: JSON.stringify({ userType, password })
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('authenticated', 'true');
                Router.navigate('timeslot');
            } else {
                errorMessage.textContent = data.error || 'Invalid password. Please try again.';
            }
        } catch (error) {
            errorMessage.textContent = 'Connection error. Please try again.';
        }
    },

    // Timeslot Page
    initTimeslotPage: function () {
        this.updateTimeslots();
        // Clear old interval if exists
        if (this.timeslotInterval) clearInterval(this.timeslotInterval);
        this.timeslotInterval = setInterval(() => this.updateTimeslots(), 60000);
    },

    updateTimeslots: function () {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const totalMinutes = hours * 60 + minutes;

        Object.keys(CONFIG.TIMESLOTS).forEach(slot => {
            const button = document.getElementById(`slot${slot}`);
            if (button) {
                const config = CONFIG.TIMESLOTS[slot];
                button.disabled = !(totalMinutes >= config.start && totalMinutes <= config.end);
            }
        });

        const timeDisplay = document.getElementById('currentTime');
        if (timeDisplay) timeDisplay.textContent = now.toLocaleTimeString();
    },

    selectTimeslot: function (slot) {
        sessionStorage.setItem('timeslot', slot);
        Router.navigate('operations');
    },

    logout: async function () {
        try {
            await fetch(`${CONFIG.API_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) { }

        if (this.timeslotInterval) clearInterval(this.timeslotInterval);

        sessionStorage.clear();
        Router.navigate('login');
    },

    // Operations Page
    initOperationsPage: function () {
        this.buttonStates = {};
        const grid = document.getElementById('operationsGrid');
        if (!grid) return;

        grid.innerHTML = ''; // Clear existing

        CONFIG.BUTTON_NAMES.forEach((name, index) => {
            const button = document.createElement('button');
            button.className = 'operation-btn';
            button.textContent = name;
            button.dataset.index = index;
            button.onclick = () => this.openModal(index);
            grid.appendChild(button);

            this.buttonStates[index] = { name, status: 'Not Set' };
        });

        window.onclick = (event) => {
            const modal = document.getElementById('statusModal');
            if (event.target === modal) this.closeModal();
        };
    },

    openModal: function (index) {
        this.currentButtonIndex = index;
        document.getElementById('modalButtonName').textContent = CONFIG.BUTTON_NAMES[index];
        document.getElementById('statusModal').style.display = 'flex';
    },

    closeModal: function () {
        document.getElementById('statusModal').style.display = 'none';
        this.currentButtonIndex = null;
    },

    setStatus: function (status) {
        if (this.currentButtonIndex !== null) {
            this.buttonStates[this.currentButtonIndex].status = status;
            const button = document.querySelector(`[data-index="${this.currentButtonIndex}"]`);

            button.classList.remove('status-active', 'status-inactive');
            if (status === 'Active') button.classList.add('status-active');
            else if (status === 'In-Active') button.classList.add('status-inactive');

            this.closeModal();
        }
    },

    showSaveModal: function () {
        document.getElementById('saveModal').style.display = 'flex';
    },

    closeSaveModal: function () {
        document.getElementById('saveModal').style.display = 'none';
    },

    confirmSave: function () {
        this.closeSaveModal();
        this.saveOperations();
    },

    // Refactored Save API Call with 401 handling
    saveOperations: async function () {
        const buttonStatesArray = Object.values(this.buttonStates);
        const timeslot = sessionStorage.getItem('timeslot');

        try {
            const response = await fetch(`${CONFIG.API_URL}/api/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ buttonStates: buttonStatesArray, timeslot })
            });

            if (response.status === 401) {
                alert('Session expired. Please login again.');
                sessionStorage.clear();
                Router.navigate('login');
                return;
            }

            const data = await response.json();

            if (data.success) {
                alert('Operations saved successfully!');
            } else {
                alert('Error saving operations: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Connection error. Please check if the server is running.');
        }
    },

    downloadReport: async function () {
        try {
            const response = await fetch(`${CONFIG.API_URL}/api/download`, { 
                credentials: 'include' 
            });

            if (response.status === 401) {
                alert('Session expired. Please login again.');
                Router.navigate('login');
                return;
            }

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reel_operations.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                alert('No data available to download.');
            }
        } catch (error) {
            alert('Error downloading report.');
        }
    },

    deleteLogs: async function () {
        if (!confirm('Are you sure you want to delete all logs?')) return;

        try {
            const response = await fetch(`${CONFIG.API_URL}/api/delete`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.status === 401) {
                alert('Session expired. Please login again.');
                Router.navigate('login');
                return;
            }

            const data = await response.json();
            if (data.success) alert('Logs deleted successfully!');
            else alert('Error deleting logs: ' + (data.error || 'Access Denied'));
        } catch (error) {
            alert('Error deleting logs.');
        }
    }
};

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}