const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    passenger: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    driver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null // Shuruat mein koi driver nahi hoga
    },
    pickupLocation: {
        name: { type: String, required: true },
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude] geospatial queries ke liye
    },
    destination: {
        name: { type: String, required: true },
        coordinates: { type: [Number] }
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'],
        default: 'requested'
    },
    fare: { type: Number, default: 0 },
    ratingByPassenger: { type: Number, default: null },
    feedbackByPassenger: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);