
// const mongoose = require('mongoose'); // <-- Yeh missing tha, isliye crash ho raha tha
// const Ride = require('../models/Ride');
// const User = require('../models/User');
// const Review = require('../models/Review');

// // 1. CREATE RIDE REQUEST (Passenger karega)
// const createRideRequest = async (req, res) => {
//     try {
//         const { pickupLocation, destination, fare } = req.body;
//         const passengerId = req.user.id;

//         const newRide = new Ride({
//             passenger: passengerId,
//             pickupLocation,
//             destination,
//             fare
//         });

//         await newRide.save();

//         res.status(201).json({
//             message: "Ride requested successfully!",
//             ride: newRide
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // 2. GET ALL PENDING RIDES (Drivers ke dashboard ke liye)
// const getPendingRides = async (req, res) => {
//     try {
//         const rides = await Ride.find({ status: 'requested' }).populate('passenger', 'name ratings');
//         res.json(rides);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // 3. ACCEPT A RIDE (Driver karega)
// const acceptRide = async (req, res) => {
//     try {
//         const rideId = req.params.id;
//         const driverId = req.user.id;

//         const ride = await Ride.findById(rideId);
//         if (!ride) {
//             return res.status(404).json({ message: "Ride not found" });
//         }
//         if (ride.status !== 'requested') {
//             return res.status(400).json({ message: "Ride is already accepted or cancelled" });
//         }

//         ride.driver = driverId;
//         ride.status = 'accepted';
//         await ride.save();

//         res.json({
//             message: "Ride accepted successfully!",
//             ride
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // 4. START RIDE (Driver jab passenger ko pick karle)
// const startRide = async (req, res) => {
//     try {
//         const ride = await Ride.findById(req.params.id);
//         if (!ride) return res.status(404).json({ message: "Ride not found" });

//         if (ride.driver.toString() !== req.user.id) {
//             return res.status(401).json({ message: "Not authorized to start this ride" });
//         }

//         ride.status = 'in_progress';
//         await ride.save();
//         res.json({ message: "Ride started! Driving to destination...", ride });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // 5. COMPLETE RIDE (Driver destination par pahunch kar ride khatam karega)
// const completeRide = async (req, res) => {
//     try {
//         const ride = await Ride.findById(req.params.id);
//         if (!ride) return res.status(404).json({ message: "Ride not found" });

//         if (ride.driver.toString() !== req.user.id) {
//             return res.status(401).json({ message: "Not authorized to complete this ride" });
//         }

//         ride.status = 'completed';
//         await ride.save();

//         await User.findByIdAndUpdate(req.user.id, { $inc: { totalRides: 1 } });

//         res.json({ message: "Ride completed successfully!", ride });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // 6. GET DRIVER DASHBOARD ANALYTICS (Section F)
// const getDriverDashboard = async (req, res) => {
//     try {
//         const driverId = req.user.id;

//         const rideHistory = await Ride.find({ driver: driverId }).populate('passenger', 'name');

//         const totalRidesCompleted = rideHistory.filter(r => r.status === 'completed').length;
//         const activeRides = rideHistory.filter(r => r.status === 'accepted' || r.status === 'in_progress');

//         res.json({
//             stats: {
//                 totalRidesCompleted,
//                 activeRidesCount: activeRides.length
//             },
//             rideHistory,
//             activeRides
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // 7. SUBMIT RATING & FEEDBACK (Passenger karega - Section G)
// const submitFeedback = async (req, res) => {
//     try {
//         const { rating, feedback } = req.body;
//         const rideId = req.params.id;

//         if (!rating || rating < 1 || rating > 5) {
//             return res.status(400).json({ message: "Please provide a rating between 1 and 5" });
//         }

//         const ride = await Ride.findById(rideId);
//         if (!ride) return res.status(404).json({ message: "Ride not found" });

//         if (ride.passenger.toString() !== req.user.id) {
//             return res.status(401).json({ message: "Not authorized to rate this ride" });
//         }

//         if (ride.status !== 'completed') {
//             return res.status(400).json({ message: "You can only rate completed rides" });
//         }

//         ride.ratingByPassenger = Number(rating);
//         ride.feedbackByPassenger = feedback || "";
//         await ride.save();

//         const driverId = ride.driver;
//         const allDriverRides = await Ride.find({ driver: driverId, ratingByPassenger: { $ne: null } });
        
//         const totalRatings = allDriverRides.reduce((sum, r) => sum + r.ratingByPassenger, 0);
//         const avgRating = totalRatings / allDriverRides.length;

//         await User.findByIdAndUpdate(driverId, { ratings: avgRating.toFixed(1) });

//         res.json({ message: "Feedback submitted successfully!", avgRating: avgRating.toFixed(1) });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Ek baar mein saare functions perfectly export ho rahe hain
// module.exports = {
//     createRideRequest,
//     getPendingRides,
//     acceptRide,
//     startRide,
//     completeRide,
//     getDriverDashboard,
//     submitFeedback
// };

const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const User = require('../models/User');

// 1. Create Ride Request (Ensuring proper GeoJSON structure)
const createRideRequest = async (req, res) => {
    try {
        const { pickupLocation, destination, fare } = req.body;
        const passengerId = req.user.id;

        const formattedPickup = typeof pickupLocation === 'string' 
            ? { name: pickupLocation, coordinates: [77.209, 28.613] } 
            : pickupLocation;

        const formattedDestination = typeof destination === 'string'
            ? { name: destination, coordinates: [77.230, 28.615] }
            : destination;

        const cleanedFare = typeof fare === 'string' ? parseInt(fare.replace(/[^0-9]/g, '')) || 20 : fare;

        const newRide = new Ride({
            passenger: passengerId,
            pickupLocation: formattedPickup,
            destination: formattedDestination,
            fare: cleanedFare,
            status: 'requested'
        });

        await newRide.save();

        res.status(201).json({
            message: "Ride requested successfully!",
            ride: newRide
        });
    } catch (error) {
        console.error("Ride Request Error:", error);
        res.status(500).json({ error: error.message });
    }
};

const getPendingRides = async (req, res) => {
    try {
        const rides = await Ride.find({ status: 'requested' }).populate('passenger', 'name');
        res.json(rides);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const acceptRide = async (req, res) => {
    try {
        const rideId = req.params.id;
        const driverId = req.user.id;

        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Ride not found" });
        if (ride.status !== 'requested') return res.status(400).json({ message: "Ride already handled" });

        ride.driver = driverId;
        ride.status = 'accepted';
        await ride.save();

        res.json({ message: "Ride accepted successfully!", ride });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// MANDATORY: Start Ride Update (Moving state to 'in_progress')
const startRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: "Ride not found" });
        if (ride.driver.toString() !== req.user.id) return res.status(401).json({ message: "Unauthorized" });

        ride.status = 'in_progress';
        await ride.save();
        res.json({ message: "Ride started successfully", ride });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const completeRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: "Ride not found" });
        if (ride.driver.toString() !== req.user.id) return res.status(401).json({ message: "Unauthorized" });

        ride.status = 'completed';
        await ride.save();

        await User.findByIdAndUpdate(req.user.id, { $inc: { totalRides: 1 } });
        res.json({ message: "Ride completed successfully", ride });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// MANDATORY: Cancel Ride Endpoint
const cancelRide = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ message: "Ride not found" });
        
        if (ride.status === 'completed' || ride.status === 'in_progress') {
            return res.status(400).json({ message: "Cannot cancel ride in this stage" });
        }

        ride.status = 'cancelled';
        await ride.save();
        res.json({ message: "Ride cancelled successfully", ride });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDriverDashboard = async (req, res) => {
    try {
        const driverId = req.user.id;
        const rideHistory = await Ride.find({ driver: driverId }).populate('passenger', 'name');
        const totalRidesCompleted = rideHistory.filter(r => r.status === 'completed').length;

        res.json({
            stats: { totalRidesCompleted },
            rideHistory
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const submitFeedback = async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const rideId = req.params.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Provide a rating between 1 and 5" });
        }

        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ message: "Invalid parameter ID context." });
        }

        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Ride profile not found" });

        ride.ratingByPassenger = Number(rating);
        ride.feedbackByPassenger = feedback || "";
        await ride.save();

        const driverId = ride.driver;
        if (driverId) {
            const allDriverRides = await Ride.find({ driver: driverId, ratingByPassenger: { $ne: null } });
            const totalRatings = allDriverRides.reduce((sum, r) => sum + r.ratingByPassenger, 0);
            const avgRating = totalRatings / allDriverRides.length;

            await User.findByIdAndUpdate(driverId, { ratings: parseFloat(avgRating.toFixed(1)) });
            return res.json({ message: "Feedback saved in Atlas!", avgRating: avgRating.toFixed(1) });
        }

        res.json({ message: "Feedback submitted successfully." });
    } catch (error) {
        console.error("Feedback submit crash:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRideRequest,
    getPendingRides,
    acceptRide,
    startRide,
    completeRide,
    cancelRide,
    getDriverDashboard,
    submitFeedback
};