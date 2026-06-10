const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['passenger', 'driver'], default: 'passenger' },
    isOnline: { type: Boolean, default: false },
    vehicleInfo: {
        vehicleType: { type: String, enum: ['E-Rickshaw', 'Bicycle', 'Scooty'] },
        vehicleNumber: { type: String }
    },
    ratings: { type: Number, default: 5.0 },
    totalRides: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);