// const express = require('express');
// const { 
//     createRideRequest, 
//     getPendingRides, 
//     acceptRide, 
//     startRide, 
//     completeRide, 
//     getDriverDashboard,
//     submitFeedback // <-- Rating system function imported perfectly
// } = require('../controllers/rideController');

// const { protect } = require('../middleware/authMiddleware');
// const router = express.Router();

// // ==========================================
// // PASSENGER ROUTES
// // ==========================================

// // 1. Nayi ride request bhejne ke liye (Section C)
// router.post('/request', protect, createRideRequest); 

// // 2. Completed ride ko rate aur feedback dene ke liye (Section G)
// router.put('/rate/:id', protect, submitFeedback); 


// // ==========================================
// // DRIVER ROUTES
// // ==========================================

// // 3. Sabhi active/requested rides ki list dekhne ke liye (Section C)
// router.get('/pending', protect, getPendingRides);    

// // 4. Ride request ko accept karne ke liye (Section C)
// router.put('/accept/:id', protect, acceptRide);      


// // ==========================================
// // RIDE LIFECYCLE MANAGEMENT ROUTES (Section E)
// // ==========================================

// // 5. Ride shuru karne ke liye ('in_progress' state)
// router.put('/start/:id', protect, startRide);        

// // 6. Ride khatam karne ke liye ('completed' state)
// router.put('/complete/:id', protect, completeRide);  


// // ==========================================
// // DRIVER DASHBOARD & ANALYTICS (Section F)
// // ==========================================

// // 7. Driver ki history aur statistics dekhne ke liye
// router.get('/dashboard/driver', protect, getDriverDashboard); 

// module.exports = router;

const express = require('express');
const { 
    createRideRequest, 
    getPendingRides, 
    acceptRide, 
    startRide, 
    completeRide, 
    cancelRide,
    getDriverDashboard,
    submitFeedback 
} = require('../controllers/rideController');

const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Passenger Routes
router.post('/request', protect, createRideRequest); 
router.put('/rate/:id', protect, submitFeedback); 
router.put('/cancel/:id', protect, cancelRide); // Added cancellation route

// Driver Routes
router.get('/pending', protect, getPendingRides);    
router.put('/accept/:id', protect, acceptRide);      

// Lifecycle Management
router.put('/start/:id', protect, startRide);        
router.put('/complete/:id', protect, completeRide);  

// Dashboard Feed Analytics
router.get('/dashboard/driver', protect, getDriverDashboard);

module.exports = router;