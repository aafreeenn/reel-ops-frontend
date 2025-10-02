// Simple Router
const Router = {
    currentPage: 'login',
    
    navigate: function(page) {
        this.currentPage = page;
        this.render();
    },
    
    render: function() {
        const appDiv = document.getElementById('app');
        
        // Check authentication for protected pages
        if (['timeslot', 'operations'].includes(this.currentPage)) {
            if (!sessionStorage.getItem('authenticated')) {
                this.navigate('login');
                return;
            }
        }
        
        // Check if timeslot is selected for operations page
        if (this.currentPage === 'operations' && !sessionStorage.getItem('timeslot')) {
            this.navigate('timeslot');
            return;
        }
        
        // Render the page
        if (Pages[this.currentPage]) {
            appDiv.innerHTML = Pages[this.currentPage]();
            
            // Call page-specific initialization
            if (this.currentPage === 'timeslot') {
                App.initTimeslotPage();
            } else if (this.currentPage === 'operations') {
                App.initOperationsPage();
            }
        } else {
            appDiv.innerHTML = '<h1>Page not found</h1>';
        }
    },
    
    init: function() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.render();
        });
        
        // Initial render
        this.render();
    }
};