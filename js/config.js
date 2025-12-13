// Configuration
const CONFIG = {
    //API_URL: 'http://localhost:5001',  // For local development
    API_URL: 'https://reel-ops-backend.onrender.com',  // For production
    
    // Button names 
    BUTTON_NAMES: [
    'POS TDM', 'Internet TDM', 'BaseKey TDM', 'RDP TDM', 
    'POS DMM', 'Internet DMM', 'BaseKey DMM', 'RDP DMM', 
    'POS TSS', 'Internet TSS', 'BaseKey TSS', 'RDP TSS', 
    'POS GRANADA', 'Internet GRANADA', 'BaseKey GRANADA', 'RDP GRANADA',
    'POS MARASSI', 'Internet MARASSI', 'BaseKey MARASSI' , 'RDP GRANADA'
],

    
    // Timeslot configurations (in minutes from midnight)
    TIMESLOTS: {
        '7am': { start: 390, end: 480, label: '7:00 AM' },    // 6:30 AM - 8:00 AM
        '3pm': { start: 0, end: 1440, label: '3:00 PM' }, // 2:30 PM - 4:00 PM
        '10pm': { start: 1290, end: 1380, label: '10:00 PM' } // 9:30 PM - 11:00 PM
    }

};

